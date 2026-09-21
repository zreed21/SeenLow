#!/usr/bin/env bash
set -Eeuo pipefail

# Eight-path payment/write source guard matrix for Option B.
# Creates isolated DB fixtures; never calls /api/seed and never touches real SKUs.
# Usage: BASE_URL=http://127.0.0.1:3000 bash scripts/test-payment-source-guard.sh

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5432/app_db}"
TOKEN="guard_${$}_$(date +%s)"
SOURCE_ID=""; DEAL_ID=""; USER_ID="$TOKEN"
ORDER_INTENT=""; ORDER_SESSION=""; ORDER_FINALIZE=""; ORDER_RECONCILE=""
TMP="$(mktemp -d)"

psqlq() { psql "$DB_URL" -qtA -v ON_ERROR_STOP=1 -c "$1"; }
cleanup() {
  set +e
  if [[ -n "$DEAL_ID" ]]; then
    psqlq "delete from order_history where order_id in (select id from orders where deal_id=$DEAL_ID); delete from price_observations where deal_id=$DEAL_ID; delete from sku_outcomes where deal_id=$DEAL_ID; delete from affiliate_clicks where deal_id=$DEAL_ID; delete from agent_actions where order_id in (select id from orders where deal_id=$DEAL_ID); delete from orders where deal_id=$DEAL_ID; delete from deals where id=$DEAL_ID;" >/dev/null
  fi
  [[ -n "$SOURCE_ID" ]] && psqlq "delete from sources where id=$SOURCE_ID;" >/dev/null
  psqlq "delete from notifications where user_id='$USER_ID';" >/dev/null
  rm -rf "$TMP"
}
trap cleanup EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }
json_field() { node -e 'const fs=require("fs"),d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); let v=d; for(const k of process.argv[2].split(".")) v=v?.[k]; if(v!==undefined&&v!==null) process.stdout.write(String(v));' "$1" "$2"; }
post() { local path="$1" data="$2" out="$3"; curl -sS -o "$out" -w '%{http_code}' -X POST "$BASE_URL$path" -H 'Content-Type: application/json' -d "$data"; }
expect_source_409() {
  local name="$1" status="$2" file="$3"
  [[ "$status" == "409" ]] || fail "$name returned HTTP $status: $(cat "$file")"
  [[ "$(json_field "$file" code)" == "SOURCE_NOT_CERTIFIED" ]] || fail "$name did not return SOURCE_NOT_CERTIFIED: $(cat "$file")"
  pass "$name blocked the new charge (409 SOURCE_NOT_CERTIFIED)"
}

# Certified reseller fixture. Source URL/domain mapping is explicit.
SOURCE_ID="$(psqlq "insert into sources (name,domain,score,status,approval_method,approved_by,approved_at,approval_expires_at,known_chain,https_valid,last_scanned_at,has_contact,has_policies,has_normal_card_checkout,has_real_imprint,reputation_summary) values ('Guard Test Store','$TOKEN.example.com',95,'allowlisted','human','guard-test',now(),now()+interval '90 days',true,true,now(),true,true,true,true,'isolated payment-write guard fixture') returning id;")"
DEAL_ID="$(psqlq "insert into deals (source_id,title,slug,description,category,brand,original_price,deal_price,service_fee,final_price,discount_percent,retailer,retailer_url,image_url,stock_status,stock_quantity,deal_rank,is_top_50,is_hot,is_active,ok_to_sell,opportunity_score,verification_status,cta_type,affiliate_status,reseller_allowed) values ($SOURCE_ID,'Guard Matrix Item','$TOKEN','isolated fixture','Electronics','Test','100.00','50.00','7.00','57.00','43.00','Guard Test Store','https://$TOKEN.example.com/item','/images/logo.png','in_stock',50,999,false,false,true,true,80,'verified_active','reseller','none',true) returning id;")"

ADDRESS='{"fullName":"Guard Test","street":"1 Test Lane","city":"Austin","state":"TX","zipCode":"78701","country":"United States","phone":"5125550100"}'
init_order() {
  local label="$1"
  local out="$TMP/init_${label}.json"
  local status
  status="$(post /api/orders/init "{\"dealId\":$DEAL_ID,\"userId\":\"$USER_ID\",\"userEmail\":\"guard@example.invalid\",\"shippingAddress\":$ADDRESS,\"displayedPrice\":0}" "$out")"
  [[ "$status" == "200" ]] || fail "fixture init $label failed HTTP $status: $(cat "$out")"
  json_field "$out" orderId
}
ORDER_INTENT="$(init_order intent)"
ORDER_SESSION="$(init_order session)"
ORDER_FINALIZE="$(init_order finalize)"
ORDER_RECONCILE="$(init_order reconcile)"
# Represents a provider-confirmed payment. retrievePaymentIntentStatus(sim_pi_*) returns succeeded.
psqlq "update orders set stripe_payment_intent_id='sim_pi_guard_$ORDER_RECONCILE', payment_provider='simulation' where id=$ORDER_RECONCILE;" >/dev/null

# THE LEAK SETUP: source row only. Never call applySourceGate. Flags deliberately remain true.
psqlq "update sources set status='blocked', block_reason='eight-path DB-only leak matrix' where id=$SOURCE_ID;" >/dev/null
STALE="$(psqlq "select ok_to_sell||'|'||is_active from deals where id=$DEAL_ID;")"
[[ "$STALE" == "true|true" || "$STALE" == "t|t" ]] || fail "fixture flags were unexpectedly back-filled ($STALE); leak test invalid"
echo "DB-only block installed; deal flags intentionally stale: okToSell=true, isActive=true"

# 1 — list read
curl -sS "$BASE_URL/api/deals?limit=200" > "$TMP/list.json"
node -e 'const fs=require("fs"),d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")),id=Number(process.argv[2]); if(d.deals.some(x=>x.id===id)) process.exit(1)' "$TMP/list.json" "$DEAL_ID" \
  || fail "GET /api/deals leaked blocked-source SKU"
pass "[1/8] GET /api/deals dropped blocked-source SKU"

# 2 — detail read
STATUS="$(curl -sS -o "$TMP/detail.json" -w '%{http_code}' "$BASE_URL/api/deals/$DEAL_ID")"
[[ "$STATUS" == "404" ]] || fail "GET /api/deals/:id returned HTTP $STATUS"
pass "[2/8] GET /api/deals/:id returned 404"

# 3 — click/redirect
REDIRECT="$(curl -sS -o /dev/null -w '%{redirect_url}' "$BASE_URL/api/go/$DEAL_ID")"
[[ "$REDIRECT" == *"redirect=dead"* ]] || fail "/api/go did not refuse: $REDIRECT"
CLICK_REASON="$(psqlq "select blocked_reason from affiliate_clicks where deal_id=$DEAL_ID order by id desc limit 1;")"
[[ "$CLICK_REASON" == *"certification"* ]] || fail "click row missing certification reason: $CLICK_REASON"
pass "[3/8] /api/go refused and wrote blocked click row"

# 4 — init
STATUS="$(post /api/orders/init "{\"dealId\":$DEAL_ID,\"userId\":\"$USER_ID\",\"userEmail\":\"guard@example.invalid\",\"shippingAddress\":$ADDRESS,\"displayedPrice\":0}" "$TMP/init_blocked.json")"
expect_source_409 "[4/8] POST /api/orders/init" "$STATUS" "$TMP/init_blocked.json"

# 5 — legacy/simulation direct POST
STATUS="$(post /api/orders "{\"dealId\":$DEAL_ID,\"userId\":\"$USER_ID\",\"userEmail\":\"guard@example.invalid\",\"shippingAddress\":$ADDRESS,\"displayedPrice\":0}" "$TMP/legacy.json")"
expect_source_409 "[5/8] POST /api/orders (legacy/simulation)" "$STATUS" "$TMP/legacy.json"

# 6 — PaymentIntent on a pending order created before the block
STATUS="$(post /api/payments/create-intent "{\"orderId\":$ORDER_INTENT}" "$TMP/intent.json")"
expect_source_409 "[6/8] POST /api/payments/create-intent" "$STATUS" "$TMP/intent.json"

# 7 — Checkout Session on a pending order created before the block
STATUS="$(post /api/payments/create-session "{\"orderId\":$ORDER_SESSION}" "$TMP/session.json")"
expect_source_409 "[7/8] POST /api/payments/create-session" "$STATUS" "$TMP/session.json"

# 8 — simulation finalize with no PaymentIntent (this is a new payment)
STATUS="$(post "/api/orders/$ORDER_FINALIZE/finalize" '{"method":"simulation"}' "$TMP/finalize.json")"
expect_source_409 "[8/8] POST /api/orders/:id/finalize (simulation-only)" "$STATUS" "$TMP/finalize.json"
PAYMENT_STATE="$(psqlq "select payment_status from orders where id=$ORDER_FINALIZE;")"
[[ "$PAYMENT_STATE" == "pending" ]] || fail "blocked simulation finalize changed payment state to $PAYMENT_STATE"

# Reconciliation exception — provider already succeeded/requires_capture.
STATUS="$(post "/api/orders/$ORDER_RECONCILE/finalize" '{"method":"card"}' "$TMP/reconcile.json")"
[[ "$STATUS" == "200" ]] || fail "provider-confirmed reconciliation was orphaned: HTTP $STATUS $(cat "$TMP/reconcile.json")"
[[ "$(psqlq "select payment_status from orders where id=$ORDER_RECONCILE;")" == "paid" ]] || fail "reconciled order was not marked paid"
pass "[exception] provider-confirmed PaymentIntent reconciled despite later source block"

echo "ALL PAYMENT/READ SOURCE-GUARD PATHS PASS"
