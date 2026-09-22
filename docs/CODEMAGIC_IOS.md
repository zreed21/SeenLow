# SeenLow — Codemagic iOS (no Mac required)

Windows-friendly checklist to build `com.seenlow.app` on Codemagic Mac minis and ship to **TestFlight**. The Capacitor shell lives under `ios/`; CI config is root [`codemagic.yaml`](../codemagic.yaml) (`ios-testflight` workflow).

Do **not** commit `.p8` keys, `.p12` certs, or provisioning profiles.

## 1. Create an App Store Connect API key

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com/) → **Users and Access** → **Integrations** → **App Store Connect API**.
2. Note the **Issuer ID** at the top of the page.
3. Click **+** to generate a key:
   - **Name:** `Codemagic SeenLow` (use this exact string — Codemagic YAML references it)
   - **Access:** **App Manager**
4. Click **Generate**, then **Download API Key** once (`.p8`). Store it offline; Apple will not let you download it again.
5. Copy the **Key ID**.

You still need an app record for **SeenLow** / bundle `com.seenlow.app` (see [STORE_LAUNCH.md](../STORE_LAUNCH.md)).

## 2. Sign up and connect GitHub

1. Sign up at [codemagic.io](https://codemagic.io/).
2. Connect GitHub and authorize access to **`zreed21/SeenLow`**.

## 3. Add the Developer Portal integration

1. Codemagic → **Team settings** → **Team integrations** → **Developer Portal** → **Manage keys**.
2. **Add key**:
   - **App Store Connect API key name:** exactly `Codemagic SeenLow`  
     (must match `integrations.app_store_connect` in `codemagic.yaml`)
   - **Issuer ID** and **Key ID** from step 1
   - Upload the `.p8` file
3. Save. Do not put the `.p8` in the git repo.

## 4. Add the application and detect YAML

1. **Applications** → **Add application** → select `zreed21/SeenLow`.
2. Project type can be **Ionic Capacitor** / similar; YAML drives the build.
3. Select the branch that contains `codemagic.yaml` (e.g. `feat/codemagic-ios` or `main` after merge).
4. Click **Check for configuration file** so Codemagic finds the `ios-testflight` workflow.

## 5. Set `APP_STORE_APPLE_ID`

1. In App Store Connect → your app → **General** → **App Information**, copy the numeric **Apple ID** (not the bundle ID).
2. In Codemagic → your application → **Environment variables** (or an env group):
   - Name: `APP_STORE_APPLE_ID`
   - Value: that numeric ID
   - Secure if you prefer; it is not a secret but keep it accurate.
3. `codemagic.yaml` maps `vars.APP_STORE_APPLE_ID: $APP_STORE_APPLE_ID`. The increment script fails closed to `$BUILD_NUMBER` if ASC has no prior build.

## 6. First build (signing)

1. Start workflow **SeenLow iOS TestFlight** (`ios-testflight`).
2. With `ios_signing.distribution_type: app_store` + `bundle_identifier: com.seenlow.app` and the Developer Portal integration, Codemagic can **fetch or create** an Apple Distribution certificate and App Store provisioning profile via the API on first successful signing setup.
3. **Apple Distribution certificate limit is 3** per team. If creation fails with “already have a current Distribution certificate”, either:
   - Upload an existing `.p12` under Codemagic **Code signing identities**, or
   - Revoke an unused Distribution cert in the Apple Developer portal (only if you still have the matching private key elsewhere), or
   - Use **Fetch certificate** for a cert Codemagic previously generated.
4. After a green build, download the IPA from artifacts if needed; publishing uploads to App Store Connect automatically.

## 7. TestFlight

- `publishing.app_store_connect` uses `auth: integration`, `submit_to_testflight: true`, `submit_to_app_store: false`.
- No `beta_groups` yet — add group names in YAML after you create them in TestFlight.
- Email notify: **support@seenlow.com**.
- Wait for processing in App Store Connect → TestFlight, then add yourself as an internal tester.

## What the workflow does

| Step | Behavior |
|---|---|
| Node | 22 (Capacitor CLI requirement) |
| `npm ci` | Install JS deps |
| `npx cap sync ios` | Sync plugins / native project; **no** `next build` because `server.url` is `https://seenlow.com` |
| `xcode-project use-profiles` | Apply fetched profiles |
| Build number | `app-store-connect get-latest-app-store-build-number` → `agvtool`, else `$BUILD_NUMBER` |
| IPA | `xcode-project build-ipa --project App.xcodeproj --scheme App` from `ios/App` |

**SPM note:** This repo uses Capacitor’s **CapApp-SPM** layout (no `Podfile`, no `App.xcworkspace`). If you ever regenerate iOS with CocoaPods, switch the YAML to `--workspace App.xcworkspace` and add `pod install`.

## Official docs

- [Ionic / Capacitor on Codemagic](https://docs.codemagic.io/yaml-quick-start/building-an-ionic-app/)
- [iOS code signing](https://docs.codemagic.io/yaml-code-signing/signing-ios/)
- [App Store Connect publishing](https://docs.codemagic.io/yaml-publishing/app-store-connect/)
- Sample YAML: [ionic-capacitor-demo-project](https://github.com/codemagic-ci-cd/codemagic-sample-projects/blob/main/ionic/ionic-capacitor-demo-project/codemagic.yaml)

## Related

- Mac/Xcode path: [MOBILE_IOS.md](./MOBILE_IOS.md)
- Store narrative: [STORE_LAUNCH.md](../STORE_LAUNCH.md)
