import { TOP_50_DEALS_RAW as INITIAL_DEALS, DealSeedItem } from "./seedData";

export { type DealSeedItem };

const EXTRA_14_DEALS: DealSeedItem[] = [
  {
    title: "DJI Pocket 2 Creator Combo 4K Handheld 3-Axis Gimbal Camera",
    slug: "dji-pocket-2-creator-combo",
    description: "Pocket-sized and extremely portable, DJI Pocket 2 is a tiny camera that lets you single-handedly record memorable moments. 64MP photos and 4K 60fps video.",
    category: "Cameras & Drones",
    brand: "DJI",
    originalPrice: 499.00,
    dealPrice: 359.00,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/dji-pocket-2",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Motorized 3-axis stabilization for smooth cinematic video on the move",
      "64MP high-resolution photography and 8x zoom",
      "DJI Matrix Stereo audio with 4 directional microphones",
      "ActiveTrack 3.0 keeps subjects in frame automatically",
      "Includes Do-It-All handle, wireless mic transmitter, and wide-angle lens"
    ],
    specs: {
      "Sensor": "1/1.7\" CMOS 64MP",
      "Video": "4K Ultra HD @ 60fps",
      "Battery": "140 Minutes",
      "Weight": "117 grams"
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isHot: false,
    opportunityScore: 82
  },
  {
    title: "Apple Magic Keyboard with Touch ID and Numeric Keypad (Space Black)",
    slug: "apple-magic-keyboard-touch-id-black",
    description: "Magic Keyboard with Touch ID delivers fast, easy, and secure authentication for logins and purchases. Extended layout with document navigation controls and full-size arrow keys.",
    category: "Computing & Laptops",
    brand: "Apple",
    originalPrice: 199.00,
    dealPrice: 145.00,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/apple-magic-keyboard-touchid",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Integrated Touch ID sensor for instant secure login and Apple Pay authentication",
      "Remarkably comfortable and precise scissor mechanism beneath each key",
      "Rechargeable internal battery powers keyboard for about a month between charges",
      "Includes woven USB-C to Lightning cable for fast pairing and charging",
      "Sleek Space Black anodized aluminum top case"
    ],
    specs: {
      "Connectivity": "Bluetooth, Lightning port, Wireless",
      "Compatibility": "Mac with Apple Silicon running macOS 11.4+",
      "Weight": "0.81 lbs (0.369 kg)",
      "Battery": "Rechargeable Lithium-ion"
    },
    stockStatus: "in_stock",
    stockQuantity: 30,
    isHot: false,
    opportunityScore: 80
  },
  {
    title: "Sony SRS-XB100 Compact Waterproof Bluetooth Wireless Speaker (Black)",
    slug: "sony-srs-xb100-compact-waterproof-speaker",
    description: "Big sound from a tiny body. Sound Diffusion Processor spreads sound all around, EXTRA BASS radiator pumps deep low-end, and IP67 waterproof & dustproof body with multiway strap.",
    category: "Audio & Wearables",
    brand: "Sony",
    originalPrice: 59.99,
    dealPrice: 44.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0BYP69F2Q",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Sound Diffusion Processor spreads audio in any direction outdoors",
      "Passive radiator works alongside full-range speaker to enhance low tones",
      "Up to 16 hours of continuous battery life with battery indicator",
      "IP67 waterproof and dustproof rating with UV coating for outdoor sun exposure",
      "Hands-free calling with Echo Canceling technology"
    ],
    specs: {
      "Battery": "16 Hours",
      "Rating": "IP67 Waterproof / Dustproof",
      "Bluetooth": "5.3 with Fast Pair",
      "Weight": "274g ultra-portable"
    },
    stockStatus: "in_stock",
    stockQuantity: 42,
    isHot: false,
    opportunityScore: 79
  },
  {
    title: "Nike Tech Fleece Full-Zip Windrunner Hoodie & Joggers Suit (Dark Heather Grey)",
    slug: "nike-tech-fleece-windrunner-suit-grey",
    description: "Lightweight premium fleece with smooth texture both inside and out delivers plenty of warmth without adding bulk. Iconic Chevron design lines inspired by the 1978 Windrunner jacket.",
    category: "Fashion & Travel",
    brand: "Nike",
    originalPrice: 280.00,
    dealPrice: 210.00,
    retailer: "Nike Official",
    retailerUrl: "https://www.nike.com/t/tech-fleece-suit",
    imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Lightweight Tech Fleece insulating barrier traps warmth without excess weight",
      "Zippered sleeve pocket allows secure quick storage for keys and cards",
      "4-panel hood offers a comfortable, streamlined contour fit",
      "Tapered joggers with ribbed cuffs showcase your sneakers",
      "Signature taped trims on pockets for distinctive technical sportswear style"
    ],
    specs: {
      "Material": "53% Cotton, 47% Polyester",
      "Fit": "Standard fit hoodie with Slim fit joggers",
      "Pockets": "Zippered sleeve pocket + deep kangaroo pockets",
      "Wash": "Machine wash cold"
    },
    stockStatus: "in_stock",
    stockQuantity: 24,
    isHot: false,
    opportunityScore: 78
  },
  {
    title: "Anker Prime 20,000mAh Power Bank (200W Output with Smart Digital Display)",
    slug: "anker-prime-20000mah-200w-power-bank",
    description: "Fast-charge two laptops at full speed simultaneously with massive 200W total output. Smart digital display shows remaining battery percentage, input wattage, output wattage, and recharge time.",
    category: "Computing & Laptops",
    brand: "Anker",
    originalPrice: 129.99,
    dealPrice: 98.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0BYP19F2Q",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1597733336794-12d05021d510?w=800&auto=format&fit=crop&q=80"],
    features: [
      "200W total output: charge a 16\" MacBook Pro from 0 to 50% in only 28 minutes",
      "2x USB-C (100W each) + 1x USB-A (65W) to power 3 devices together",
      "Smart Color Display monitors live power draw and battery health",
      "ActiveShield 2.0 safety system performs 3 million temperature checks per day",
      "Compact pop-can sized volume easily fits inside carry-on backpack"
    ],
    specs: {
      "Capacity": "20,000mAh (72Wh - TSA Approved)",
      "Max Single Port Output": "100W USB-C PD 3.0",
      "Total Combined Output": "200W Max",
      "Recharge Time": "100W Input recharges power bank in 1 hour 15 mins",
      "Weight": "1.19 lbs (540g)"
    },
    stockStatus: "in_stock",
    stockQuantity: 32,
    isHot: false,
    opportunityScore: 81
  },
  {
    title: "Ninja CREAMi Deluxe 11-in-1 Ice Cream & Frozen Treat Maker (Silver)",
    slug: "ninja-creami-deluxe-11-in-1-ice-cream-maker",
    description: "Turn almost anything into ice cream, sorbet, gelato, slushis, and milkshakes with the touch of a button. Dual-Drive Motors apply downward pressure to Creamify frozen blocks in minutes.",
    category: "Home & Appliances",
    brand: "Ninja",
    originalPrice: 249.99,
    dealPrice: 194.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/ninja-creami-deluxe",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"],
    features: [
      "11 One-Touch Programs: Ice Cream, Sorbet, Gelato, Light Ice Cream, Slushi, Italian Ice, Frozen Drink, Creamiccino, Milkshake, Mix-In, Re-Spin",
      "DELUXE Pints hold 50% more ice cream (24 oz) than original Ninja CREAMi",
      "Dual Drive Motors spin precision Creamerizer paddle at high speeds to finely shave ice",
      "Mix-In function evenly distributes chocolate chips, nuts, and fruit into your treat",
      "BPA-free dishwasher-safe Deluxe Pints and lids included"
    ],
    specs: {
      "Pint Capacity": "3x 24 oz XL Deluxe Pints with lids",
      "Motor": "800 Watts Dual-Drive Power",
      "Dimensions": "12.01\" D x 8.42\" W x 16.69\" H",
      "Dishwasher Safe": "Pints, Lids, and Paddle",
      "Warranty": "1-Year Limited Warranty"
    },
    stockStatus: "in_stock",
    stockQuantity: 21,
    isHot: false,
    opportunityScore: 77
  },
  {
    title: "Weber iGrill 3 App-Connected Smart Thermometer with 4 Probe Capacity",
    slug: "weber-igrill-3-smart-thermometer",
    description: "Permanently mounts into the side table of Weber Genesis II and Spirit II grills. Monitors up to 4 cuts of meat simultaneously and notifies your smart device when food reaches perfect target temperature.",
    category: "Outdoor & Fitness",
    brand: "Weber",
    originalPrice: 119.99,
    dealPrice: 94.99,
    retailer: "Home Depot",
    retailerUrl: "https://www.homedepot.com/p/weber-igrill-3",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Four probe capability with two meat probes included in box",
      "Bluetooth Smart connected with 150-foot line of sight range",
      "Weber iGrill App provides temperature graphing, timers, and doneness presets",
      "250-hour battery life on standard AA batteries",
      "Fuel level detection for Genesis II LP gas grills"
    ],
    specs: {
      "Probes Included": "2 Color-coded Probes (Supports up to 4)",
      "Battery Life": "250 Hours (Batteries included)",
      "Temperature Range": "-22°F (-30°C) to 572°F (300°C)",
      "App Support": "iOS & Android Weber iGrill App"
    },
    stockStatus: "in_stock",
    stockQuantity: 18,
    isHot: false,
    opportunityScore: 75
  },
  {
    title: "Anker Soundcore Motion X600 High-Resolution Spatial Audio Portable Speaker",
    slug: "anker-soundcore-motion-x600-spatial-speaker",
    description: "World's first portable speaker with sky channel upward-firing speaker. Theater-inspired spatial audio with 50W sound, LDAC decoding, and IPX7 fully waterproof aluminum finish.",
    category: "Audio & Wearables",
    brand: "Anker",
    originalPrice: 199.99,
    dealPrice: 159.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0BYP19F2L",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Immersive Spatial Audio powered by 5 drivers and 3 amplifiers",
      "50W room-filling output with deep, punchy bass enhancement",
      "High-Res Audio Certified with LDAC wireless codec streaming",
      "12 hours playtime on single charge with integrated carrying handle",
      "IPX7 waterproof rating lets you enjoy music by the pool or outdoors"
    ],
    specs: {
      "Output": "50 Watts (2 Woofers, 2 Tweeters, 1 Sky Driver)",
      "Battery": "12 Hours (6400mAh)",
      "Water Rating": "IPX7 Waterproof",
      "Materials": "Full Metal Grille with Aluminum Handle",
      "Weight": "4.26 lbs (1.93 kg)"
    },
    stockStatus: "in_stock",
    stockQuantity: 27,
    isHot: false,
    opportunityScore: 76
  },
  {
    title: "Yeti Rambler 1 Gallon (128 oz) Vacuum Insulated Stainless Steel Jug",
    slug: "yeti-rambler-one-gallon-jug",
    description: "The ultimate hydration fortress. Built from 18/8 kitchen-grade stainless steel with double-wall vacuum insulation. MagCap lid docks magnetically to cap holder so you never lose it.",
    category: "Outdoor & Fitness",
    brand: "Yeti",
    originalPrice: 130.00,
    dealPrice: 105.00,
    retailer: "REI",
    retailerUrl: "https://www.rei.com/product/yeti-rambler-gallon",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Massive 1 Gallon (128 oz) capacity keeps ice solid for multiple days in extreme heat",
      "Double-wall vacuum insulation with 1-inch lid insulation barrier",
      "MagCap magnetic dock holds cap securely on the spout lid while drinking or pouring",
      "Heavy-duty stainless steel handle with rubber grip for balanced carrying",
      "Dishwasher safe and BPA-free construction"
    ],
    specs: {
      "Capacity": "1 Gallon (3.8 Liters / 128 fl oz)",
      "Empty Weight": "4.5 lbs (2.07 kg)",
      "Dimensions": "15.0\" H x 6.4\" W",
      "Material": "18/8 Puncture-Resistant Stainless Steel",
      "Color": "Stainless Steel Silver"
    },
    stockStatus: "in_stock",
    stockQuantity: 29,
    isHot: false,
    opportunityScore: 74
  },
  {
    title: "Nintendo Switch Pro Controller (Wireless Gamepad with HD Rumble)",
    slug: "nintendo-switch-pro-controller",
    description: "Take your game sessions up a notch with the Nintendo Switch Pro Controller. Includes motion controls, HD rumble, built-in amiibo functionality, and comfortable ergonomic grips.",
    category: "Gaming & VR",
    brand: "Nintendo",
    originalPrice: 69.99,
    dealPrice: 56.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/nintendo-switch-pro-controller",
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1612287233215-d72491b68187?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Ergonomic controller shape designed for long multiplayer gaming sessions",
      "Precision analog sticks, premium responsive D-pad, and offset layout",
      "HD Rumble creates realistic haptic feedback vibrations",
      "Built-in NFC touchpoint for Nintendo amiibo figures and cards",
      "Up to 40 hours battery life per charge via included USB-C cable"
    ],
    specs: {
      "Battery Life": "Up to 40 Hours",
      "Sensors": "Accelerometer, Gyroscope Motion Sensors",
      "Vibration": "HD Rumble Linear Resonance Actuators",
      "Charging": "USB Type-C (Cable included)",
      "Weight": "246 grams"
    },
    stockStatus: "in_stock",
    stockQuantity: 35,
    isHot: false,
    opportunityScore: 76
  },
  {
    title: "Breville the Milk Cafe Electric Hot & Cold Milk Frother",
    slug: "breville-the-milk-cafe-electric-frother",
    description: "Induction heating creates rich microfoam bubbles for silky lattes, airy cappuccinos, and authentic hot chocolate with real chocolate flakes melted directly into the stainless jug.",
    category: "Home & Appliances",
    brand: "Breville",
    originalPrice: 179.95,
    dealPrice: 149.95,
    retailer: "Williams Sonoma",
    retailerUrl: "https://www.williams-sonoma.com/products/breville-the-milk-cafe",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Smooth induction heating distributes heat gently and evenly without scorching milk",
      "Includes two frothing discs: Latte disc for creamy milk and Cappuccino disc for thick foam",
      "Temperature adjustment dial with Cold Stir, Warm, Optimum 140-160°F, and Hot settings",
      "Dishwasher-safe stainless steel milk jug with measurement markings",
      "Measuring cap lid allows adding cocoa powder, syrup, or chocolate flakes during frothing"
    ],
    specs: {
      "Capacity": "3 Cups (700ml) Frothed Milk",
      "Heating Method": "Induction Heating System",
      "Jug Material": "Brushed Stainless Steel (Dishwasher Safe)",
      "Power": "500 Watts",
      "Dimensions": "6.0\" x 6.0\" x 10.0\""
    },
    stockStatus: "in_stock",
    stockQuantity: 16,
    isHot: false,
    opportunityScore: 73
  },
  {
    title: "Theragun Mini (2nd Gen) Ultra-Portable Pocket Massage Gun (Desert Rose)",
    slug: "theragun-mini-2nd-gen-massage-gun",
    description: "20% smaller and 30% lighter than generation 1. Pocket-sized percussive therapy device designed for on-the-go recovery, post-flight stiffness, and workout relief.",
    category: "Personal Care & Beauty",
    brand: "Therabody",
    originalPrice: 199.00,
    dealPrice: 169.00,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/theragun-mini-2",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Ultra-compact triangular grip fits easily into gym bag, backpack, or purse",
      "QuietForce Technology brushless motor provides deep 12mm muscle amplitude",
      "3 scientifically calibrated speeds: 1750, 2100, and 2400 PPM",
      "Includes 3 attachments: Standard Ball, Dampener, and Thumb",
      "Bluetooth connectivity syncs with Therabody app for guided wellness routines"
    ],
    specs: {
      "Weight": "1.0 lb (0.45 kg)",
      "Amplitude": "12mm Percussive Stroke",
      "Battery": "120 Minutes continuous run time",
      "Charging": "USB-C Fast Charging",
      "Case": "Soft Travel Case Included"
    },
    stockStatus: "in_stock",
    stockQuantity: 22,
    isHot: false,
    opportunityScore: 74
  },
  {
    title: "Apple 140W USB-C Dynamic Power Adapter with Fast-Charge Cable",
    slug: "apple-140w-usb-c-power-adapter",
    description: "Offers fast, efficient charging at home, in the office, or on the go. Compatible with numerous USB-C devices, recommended for pairing with 16-inch MacBook Pro for fast charging from 0 to 50% in 30 minutes.",
    category: "Computing & Laptops",
    brand: "Apple",
    originalPrice: 99.00,
    dealPrice: 85.00,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B09JR82NDZ",
    imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"],
    features: [
      "140W fast-charging power delivery utilizing USB-PD 3.1 architecture",
      "Pairs with USB-C to MagSafe 3 Cable for rapid 30-minute 50% battery recharge",
      "Built with high-efficiency GaN power semiconductors to reduce heat and bulk",
      "Foldable wall prongs for easy travel storage",
      "Apple safety certifications prevent overcharging, surges, and short-circuits"
    ],
    specs: {
      "Wattage": "140 Watts Max",
      "Standard": "USB Power Delivery 3.1 (EPR 28V/5A)",
      "Connector": "USB-C Port",
      "Compatibility": "MacBook Pro 16\", 14\", iPad Pro, iPhone, Android"
    },
    stockStatus: "in_stock",
    stockQuantity: 36,
    isHot: false,
    opportunityScore: 72
  },
  {
    title: "Solo Stove Mesa XL Tabletop Smokeless Fire Pit with Stand (Gunmetal)",
    slug: "solo-stove-mesa-xl-tabletop-fire-pit",
    description: "Brings warmth and ambiance to your outdoor dinner table. Signature 360° airflow allows smokeless burning of standard wood pellets or mini hardwood twigs in an ultra-stylish tabletop footprint.",
    category: "Outdoor & Fitness",
    brand: "Solo Stove",
    originalPrice: 109.99,
    dealPrice: 95.00,
    retailer: "REI",
    retailerUrl: "https://www.rei.com/product/solo-stove-mesa-xl",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Dual Fuel capability: burn regular wood pellets using included pellet adapter or wood twigs",
      "Signature 360° Airflow superheats air for smokeless tabletop flames",
      "Included nesting stand keeps table surface safe and cool",
      "Durable 304 stainless steel with high-temperature Gunmetal ceramic coating",
      "Includes nylon travel bag for patio, camping, and beach outings"
    ],
    specs: {
      "Diameter": "7.0 inches (17.8 cm)",
      "Height": "8.6 inches with stand",
      "Weight": "2.32 lbs (1.05 kg)",
      "Material": "304 Stainless Steel with Ceramic Coat",
      "Fuel": "Pellets or mini twigs up to 5\""
    },
    stockStatus: "in_stock",
    stockQuantity: 28,
    isHot: false,
    opportunityScore: 71
  }
];

export const ALL_50_RAW_DEALS: DealSeedItem[] = [
  ...INITIAL_DEALS,
  ...EXTRA_14_DEALS
];
