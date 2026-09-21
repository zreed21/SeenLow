export interface DealSeedItem {
  title: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  originalPrice: number;
  dealPrice: number;
  retailer: string;
  retailerUrl: string;
  imageUrl: string;
  additionalImages: string[];
  features: string[];
  specs: Record<string, string>;
  stockStatus: "in_stock" | "low_stock" | "sold_out" | "expired";
  stockQuantity: number;
  isHot?: boolean;
  opportunityScore: number;
}

export const TOP_50_DEALS_RAW: DealSeedItem[] = [
  {
    title: "Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones",
    slug: "sony-wh-1000xm5-wireless-noise-canceling-headphones",
    description: "The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. 2 processors control 8 microphones for unprecedented noise cancellation and exceptional call quality. Newly developed driver with soft-fit leather headband ensures all-day comfort.",
    category: "Audio & Wearables",
    brand: "Sony",
    originalPrice: 399.99,
    dealPrice: 89.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/sony-wh-1000xm5",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Auto NC Optimizer delivers industry-leading noise cancellation",
      "Magnificent Sound engineered to perfection with integrated V1 processor",
      "Crystal clear hands-free calling with 4 beamforming microphones",
      "Up to 30-hour battery life with 3-minute quick charge for 3 hours playback",
      "Multipoint connection connects to two devices at once"
    ],
    specs: {
      "Battery Life": "30 Hours ANC On",
      "Driver Unit": "30mm Carbon Fiber",
      "Weight": "250g",
      "Connectivity": "Bluetooth 5.2 / 3.5mm Aux",
      "Voice Assistant": "Alexa / Google / Siri",
      "Warranty": "1 Year Manufacturer"
    },
    stockStatus: "in_stock",
    stockQuantity: 18,
    isHot: true,
    opportunityScore: 99
  },
  {
    title: "Dyson V15 Detect Cordless Vacuum Cleaner with Laser Dust Reveal",
    slug: "dyson-v15-detect-cordless-vacuum-cleaner",
    description: "Dyson's most intelligent cordless vacuum with laser illumination that reveals invisible dust on hard floors. A piezo sensor continuously sizes and counts dust particles, automatically increasing suction power when needed.",
    category: "Home & Appliances",
    brand: "Dyson",
    originalPrice: 749.99,
    dealPrice: 179.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/dyson-v15-detect",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Laser Slim Fluffy cleaner head illuminates microscopic dust on hardwood",
      "Scientific proof of a deep clean displayed live on LCD screen",
      "High Torque cleaner head with anti-tangle comb automatically clears hair",
      "Up to 60 minutes of run time with advanced swappable battery",
      "Hair screw tool picks up long hair and pet hair fast"
    ],
    specs: {
      "Suction Power": "230 AW",
      "Bin Volume": "0.20 Gallons",
      "Run Time": "Up to 60 min",
      "Charge Time": "4.5 Hours",
      "Weight": "6.8 lbs",
      "Filtration": "Whole-machine HEPA"
    },
    stockStatus: "in_stock",
    stockQuantity: 12,
    isHot: true,
    opportunityScore: 98
  },
  {
    title: "LG 65-Inch Class OLED evo C3 Series 4K Smart TV (OLED65C3PUA)",
    slug: "lg-65-inch-oled-evo-c3-series-4k-smart-tv",
    description: "Self-lit pixels deliver infinite contrast, deep blacks, and over a billion vibrant colors. Powered by the α9 AI Processor Gen6 for exceptional picture and sound processing with 0.1ms response time and 120Hz native refresh rate for gaming.",
    category: "TV & Home Theater",
    brand: "LG",
    originalPrice: 2099.99,
    dealPrice: 529.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0BYFGL4D6",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "LG OLED evo with Brightness Booster for luminous picture",
      "α9 AI Processor Gen6 with AI Super Upscaling 4K",
      "Ultra-slim design with almost invisible bezel seamlessly mounts to wall",
      "Gaming paradise with 0.1ms response, 120Hz, G-Sync, FreeSync Premium & 4 HDMI 2.1",
      "Dolby Vision & Dolby Atmos with Filmmaker Mode"
    ],
    specs: {
      "Screen Size": "65 Inches",
      "Display Technology": "OLED evo",
      "Refresh Rate": "120Hz Native",
      "HDR": "Dolby Vision, HDR10, HLG",
      "HDMI Ports": "4 x HDMI 2.1 (4K @ 120Hz)",
      "Audio": "40W 2.2 Channel Dolby Atmos"
    },
    stockStatus: "in_stock",
    stockQuantity: 8,
    isHot: true,
    opportunityScore: 99
  },
  {
    title: "Apple MacBook Pro 16\" M3 Pro (18GB RAM, 512GB SSD) - Space Black",
    slug: "apple-macbook-pro-16-m3-pro-space-black",
    description: "Mind-blowing performance and up to 22 hours of battery life. Stunning 16.2-inch Liquid Retina XDR display with 1000 nits sustained and 1600 nits peak brightness for HDR content. Powered by the groundbreaking M3 Pro chip.",
    category: "Computing & Laptops",
    brand: "Apple",
    originalPrice: 2499.00,
    dealPrice: 649.00,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/1793623-REG/apple_macbook_pro_16",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "M3 Pro chip with 12-core CPU and 18-core GPU for pro workflows",
      "Up to 22 hours of battery life with power efficiency",
      "16.2-inch Liquid Retina XDR display with Extreme Dynamic Range",
      "1080p FaceTime HD camera, studio-quality three-mic array, six-speaker sound",
      "Three Thunderbolt 4 ports, HDMI port, SDXC card slot, headphone jack, MagSafe 3"
    ],
    specs: {
      "Processor": "Apple M3 Pro 12-Core",
      "Memory": "18GB Unified RAM",
      "Storage": "512GB Superfast SSD",
      "Display": "16.2\" Liquid Retina XDR (3456 x 2234)",
      "Battery": "Up to 22 Hours",
      "Weight": "4.7 lbs (2.14 kg)"
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isHot: true,
    opportunityScore: 100
  },
  {
    title: "Herman Miller Aeron Ergonomic Chair - Fully Loaded (Graphite / Size B)",
    slug: "herman-miller-aeron-ergonomic-chair-graphite",
    description: "The definitive benchmark for ergonomic seating. Designed by Bill Stumpf and Don Chadwick, remastered with Pellicle 8Z breathable suspension fabric and PostureFit SL adjustable sacral and lumbar support.",
    category: "Office & Furniture",
    brand: "Herman Miller",
    originalPrice: 1795.00,
    dealPrice: 479.00,
    retailer: "Design Within Reach",
    retailerUrl: "https://www.dwr.com/office-chairs/aeron-chair",
    imageUrl: "https://images.unsplash.com/photo-1580481077195-722a57cb9006?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Pellicle 8Z suspension seat and back with 8 distinct tension zones",
      "PostureFit SL pads support the base of your spine for natural tilt",
      "Harmonic 2 tilt provides a smooth and balanced recline",
      "Fully adjustable arms (height, depth, and angle) with soft armpads",
      "12-year official manufacturer warranty included"
    ],
    specs: {
      "Size": "Medium (Size B)",
      "Weight Capacity": "350 lbs",
      "Material": "Recycled Aluminum & Elastomeric Pellicle",
      "Adjustments": "Tilt Limiter, Forward Tilt, 3D Arms",
      "Casters": "Hard Floor & Carpet Multi-Surface"
    },
    stockStatus: "in_stock",
    stockQuantity: 9,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "Ninja Foodi 10-Quart 6-in-1 DualZone Smart XL 2-Basket Air Fryer",
    slug: "ninja-foodi-10-quart-dualzone-air-fryer",
    description: "The air fryer with 2 independent baskets that lets you cook 2 foods, 2 ways, at the same time. DualZone Technology with Smart Finish and Match Cook eliminates back-to-back cooking with massive 10-qt capacity.",
    category: "Home & Appliances",
    brand: "Ninja",
    originalPrice: 249.99,
    dealPrice: 69.99,
    retailer: "Walmart",
    retailerUrl: "https://www.walmart.com/ip/ninja-foodi-dualzone-10qt",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "2 independent 5-qt baskets cook 2 foods 2 ways simultaneously",
      "Smart Finish syncs cook times so both baskets finish at the exact same moment",
      "6 cooking programs: Air Fry, Air Broil, Roast, Bake, Reheat, and Dehydrate",
      "Cooks up to 8 lbs of wings or mains and sides for entire family",
      "Nonstick dishwasher-safe crisper plates and baskets"
    ],
    specs: {
      "Capacity": "10 Quarts (Two 5-Qt Baskets)",
      "Wattage": "1690 Watts",
      "Temperature Range": "105°F - 450°F",
      "Color": "Dark Grey Metallic",
      "Dishwasher Safe": "Yes (Baskets & Crisper Plates)"
    },
    stockStatus: "in_stock",
    stockQuantity: 24,
    isHot: false,
    opportunityScore: 94
  },
  {
    title: "Sony PlayStation 5 Slim Console Disk Edition with Spider-Man 2 Bundle",
    slug: "sony-playstation-5-slim-spiderman-2-bundle",
    description: "Experience lightning fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games in a sleek, slim redesign.",
    category: "Gaming & VR",
    brand: "Sony",
    originalPrice: 559.99,
    dealPrice: 159.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/ps5-slim-bundle",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Slim Design with 1TB high speed internal SSD storage",
      "Ultra-High Speed SSD maximizes play sessions with near-instant load times",
      "Integrated I/O custom architecture for open-world gaming",
      "Ray Tracing brings hyper-realistic shadows and reflections",
      "Includes Marvel's Spider-Man 2 Full Digital Game Code"
    ],
    specs: {
      "Storage": "1TB Custom NVMe SSD",
      "CPU": "x86-64-AMD Ryzen Zen 2 8-Core",
      "GPU": "AMD Radeon RDNA 2-based 10.3 TFLOPS",
      "Output": "4K 120Hz, 8K, HDR Support",
      "Drive": "Ultra HD Blu-ray Disc Drive"
    },
    stockStatus: "in_stock",
    stockQuantity: 11,
    isHot: true,
    opportunityScore: 98
  },
  {
    title: "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones",
    slug: "bose-quietcomfort-ultra-wireless-headphones",
    description: "World-class noise cancellation, quieter than ever before. Breakthrough spatialized audio for more immersive listening that makes your music feel more real — no matter the content or source.",
    category: "Audio & Wearables",
    brand: "Bose",
    originalPrice: 429.00,
    dealPrice: 124.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0CCZ26B5V",
    imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Bose Immersive Audio pushes spatial sound boundaries",
      "CustomTune technology tailors sound performance to your unique ear shape",
      "Quiet Mode, Aware Mode with ActiveSense, and Immersion Mode",
      "Up to 24 hours battery life (up to 18 hours with Immersive Audio)",
      "Ultra-plush protein leather ear cushions and lightweight aluminum headband"
    ],
    specs: {
      "Battery Life": "24 Hours (18 hrs Immersive)",
      "Bluetooth": "5.3 with Snapdragon Sound",
      "Microphones": "Built-in beamforming array",
      "Charging": "USB-C Fast Charging",
      "Color": "Smoke White / Black"
    },
    stockStatus: "in_stock",
    stockQuantity: 16,
    isHot: false,
    opportunityScore: 95
  },
  {
    title: "Garmin Fenix 7 Pro Sapphire Solar Multisport GPS Smartwatch (47mm)",
    slug: "garmin-fenix-7-pro-sapphire-solar-smartwatch",
    description: "The ultimate multisport GPS smartwatch with solar charging lens, built-in LED flashlight, endurance score tracking, and preloaded TopoActive maps. Rugged titanium construction built to US military standard 810.",
    category: "Audio & Wearables",
    brand: "Garmin",
    originalPrice: 899.99,
    dealPrice: 269.99,
    retailer: "REI",
    retailerUrl: "https://www.rei.com/product/garmin-fenix-7-pro",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Power Sapphire solar charging lens gives up to 22 days of battery life",
      "Built-in LED flashlight with variable intensities and strobe modes",
      "Hill score and endurance score gauge training progress",
      "Multi-band GPS with SatIQ technology for pinpoint positioning accuracy",
      "Heart rate, Pulse Ox, sleep score, and respiration tracking 24/7"
    ],
    specs: {
      "Case Size": "47mm Titanium Bezel",
      "Display": "1.3\" Sunlight-visible Memory-in-Pixel",
      "Water Rating": "10 ATM (100 Meters)",
      "Battery Life": "Up to 22 days in smartwatch mode",
      "Memory": "32GB Onboard Topo Maps"
    },
    stockStatus: "in_stock",
    stockQuantity: 15,
    isHot: true,
    opportunityScore: 96
  },
  {
    title: "Breville the Barista Touch Impress Espresso Machine (Brushed Stainless)",
    slug: "breville-the-barista-touch-impress-espresso-machine",
    description: "Third-wave specialty coffee made easy with the Impress Puck System and Auto MilQ microfoam texturing. Intuitive touchscreen guide walks you through every step from grinding to extraction to latte art.",
    category: "Home & Appliances",
    brand: "Breville",
    originalPrice: 1499.95,
    dealPrice: 459.00,
    retailer: "Williams Sonoma",
    retailerUrl: "https://www.williams-sonoma.com/products/breville-barista-touch-impress",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Impress Puck System: Intelligent dosing, 22lb assisted tamping with 7-degree barista twist",
      "Auto MilQ hands-free microfoam with dairy, oat, soy, and almond milk settings",
      "ThermoJet heating system reaches optimum extraction temperature in 3 seconds",
      "Baratza European precision burrs with 30 grind settings",
      "Swipe and select from 8 pre-programmed café favorites or customize your own"
    ],
    specs: {
      "Heating System": "ThermoJet 3-Second Heat-up",
      "Pump Pressure": "15 Bar Italian Pump",
      "Water Tank": "67 fl oz (2L)",
      "Bean Hopper": "12 oz (340g)",
      "Interface": "Touchscreen Color Display"
    },
    stockStatus: "in_stock",
    stockQuantity: 7,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "DJI Mini 4 Pro Drone Fly More Combo Plus with RC 2 Controller",
    slug: "dji-mini-4-pro-drone-fly-more-combo-plus",
    description: "DJI's most advanced mini camera drone yet. Features omnidirectional obstacle sensing, 4K/60fps HDR true vertical shooting, FHD 20km video transmission, and ActiveTrack 360° for effortless cinematic tracking.",
    category: "Cameras & Drones",
    brand: "DJI",
    originalPrice: 1099.00,
    dealPrice: 349.00,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/dji-mini-4-pro",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Under 249g lightweight design requires no FAA registration in most zones",
      "Omnidirectional active obstacle sensing for total flight safety",
      "4K/60fps HDR video, 4K/100fps slow motion & 10-bit D-Log M color profile",
      "Includes DJI RC 2 controller with built-in 5.5-inch 1080p ultra-bright screen",
      "Fly More Combo Plus includes 3 Intelligent Flight Batteries Plus (up to 45 min each)"
    ],
    specs: {
      "Takeoff Weight": "< 249g",
      "Camera Sensor": "1/1.3-inch CMOS, f/1.7 aperture",
      "Max Flight Time": "Up to 45 Mins (Plus Battery)",
      "Transmission": "DJI O4 up to 20km",
      "Max Wind Resistance": "10.7 m/s (Scale 5)"
    },
    stockStatus: "in_stock",
    stockQuantity: 13,
    isHot: false,
    opportunityScore: 95
  },
  {
    title: "Nintendo Switch OLED Model - Mario Red Edition (64GB)",
    slug: "nintendo-switch-oled-mario-red-edition",
    description: "Featuring a vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio in handheld and tabletop modes. Finished in iconic Mario Red.",
    category: "Gaming & VR",
    brand: "Nintendo",
    originalPrice: 349.99,
    dealPrice: 114.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/nintendo-switch-oled-mario-red",
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1612287233215-d72491b68187?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "7-inch OLED screen with vivid colors and crisp contrast",
      "Wide, adjustable stand for comfortable viewing in Tabletop mode",
      "Built-in wired LAN port for stable online multiplayer",
      "64 GB internal storage with microSD card expansion support",
      "Hidden Easter egg details featuring Mario coins in the dock design"
    ],
    specs: {
      "Screen": "7.0-inch OLED Multi-touch (1280 x 720)",
      "Storage": "64GB Internal (Expandable to 2TB)",
      "Battery Life": "4.5 to 9 Hours",
      "Modes": "TV Mode, Tabletop Mode, Handheld Mode",
      "Weight": "0.93 lbs with Joy-Cons"
    },
    stockStatus: "in_stock",
    stockQuantity: 20,
    isHot: true,
    opportunityScore: 96
  },
  {
    title: "Dyson Airwrap Multi-Styler Complete Long (Copper / Nickel)",
    slug: "dyson-airwrap-multi-styler-complete-long",
    description: "Curl, shape, smooth, and hide flyaways with no extreme heat. Re-engineered barrels that now curl in both directions, brushes for straighter styles, and the Coanda smoothing dryer to finish your look.",
    category: "Personal Care & Beauty",
    brand: "Dyson",
    originalPrice: 599.99,
    dealPrice: 199.99,
    retailer: "Sephora",
    retailerUrl: "https://www.sephora.com/product/dyson-airwrap-complete-long",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Coanda airflow harnesses aerodynamics to style hair using air, not extreme heat",
      "Engineered for chest-length or longer hair with longer barrels",
      "Intelligent heat control measures air temperature over 40 times a second",
      "6 styling attachments included plus luxury storage case and travel pouch",
      "Reduces frizz and flyaways by up to 58% for smooth salon blowout results"
    ],
    specs: {
      "Airflow": "13.5 l/s with Dyson Digital V9 Motor",
      "Heat Settings": "3 precise heat settings + Cold Shot",
      "Cord Length": "8.5 ft Swivel Cord",
      "Weight": "1.5 lbs",
      "Case": "Prussian Blue Cushioned Storage Case"
    },
    stockStatus: "in_stock",
    stockQuantity: 10,
    isHot: false,
    opportunityScore: 93
  },
  {
    title: "Sony Alpha 7 IV Full-Frame Mirrorless Camera with 28-70mm Lens",
    slug: "sony-alpha-7-iv-full-frame-camera-kit",
    description: "The ideal hybrid camera: 33MP full-frame Exmor R sensor, BIONZ XR image processing engine, 4K 60p 10-bit 4:2:2 video recording, and real-time eye autofocus for humans, animals, and birds.",
    category: "Cameras & Drones",
    brand: "Sony",
    originalPrice: 2698.00,
    dealPrice: 899.00,
    retailer: "Adorama",
    retailerUrl: "https://www.adorama.com/isoa7m4k.html",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "33MP Full-Frame Exmor R Back-Illuminated CMOS Sensor",
      "Up to 10 fps shooting with AF/AE tracking",
      "4K 60p video in 10-bit 4:2:2 with S-Cinetone color profile",
      "Real-time Eye AF for Humans, Animals, and Birds in both photo and video",
      "3.0-inch vari-angle touch LCD monitor and 3.68M-dot OLED viewfinder"
    ],
    specs: {
      "Sensor Resolution": "33.0 Megapixels",
      "Lens Mount": "Sony E-Mount",
      "ISO Sensitivity": "100 to 51,200 (Exp: 50 - 204,800)",
      "Stabilization": "5-Axis In-Body Sensor-Shift",
      "Card Slots": "Dual (CFexpress Type A / SD UHS-II)"
    },
    stockStatus: "in_stock",
    stockQuantity: 6,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "Apple iPad Pro 12.9-Inch M2 (256GB Wi-Fi) - Space Gray",
    slug: "apple-ipad-pro-12-9-inch-m2-space-gray",
    description: "Astonishing performance and breathtaking display. Features the Apple M2 chip, a 12.9-inch Liquid Retina XDR display with ProMotion and True Tone, and Apple Pencil hover for next-level drawing precision.",
    category: "Computing & Laptops",
    brand: "Apple",
    originalPrice: 1199.00,
    dealPrice: 399.00,
    retailer: "Costco",
    retailerUrl: "https://www.costco.com/ipad-pro-12.9-m2",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Brilliant 12.9-inch Liquid Retina XDR display with 10,000+ mini-LEDs",
      "M2 chip with 8-core CPU and 10-core GPU",
      "12MP Wide, 10MP Ultra Wide back cameras, and LiDAR Scanner for immersive AR",
      "12MP Ultra Wide front camera with Center Stage",
      "Thunderbolt / USB 4 port for connecting high-speed external storage and displays"
    ],
    specs: {
      "Display": "12.9\" Liquid Retina XDR (2732 x 2048)",
      "Processor": "Apple M2 8-Core",
      "Storage": "256GB",
      "Weight": "1.5 lbs",
      "Security": "Face ID with TrueDepth Camera"
    },
    stockStatus: "in_stock",
    stockQuantity: 19,
    isHot: true,
    opportunityScore: 98
  },
  {
    title: "Sonos Ultimate Immersive Set with Arc, Sub Gen 3 & Era 300 Pairs",
    slug: "sonos-ultimate-immersive-surround-sound-set",
    description: "The pinnacle of home theater sound. Complete Dolby Atmos home theater experience with Sonos Arc soundbar, dual Era 300 rear speakers featuring upward-firing drivers, and Sub Gen 3 for thunderous bass.",
    category: "TV & Home Theater",
    brand: "Sonos",
    originalPrice: 2596.00,
    dealPrice: 879.00,
    retailer: "Crutchfield",
    retailerUrl: "https://www.crutchfield.com/p_sonos_ultimate",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "True 7.1.4 Dolby Atmos surround sound configuration",
      "Sonos Arc soundbar with 11 high-performance class-D digital amplifiers",
      "Two Era 300 smart speakers with directional sound projection",
      "Sonos Sub Gen 3 with two force-cancelling drivers to eliminate rattle",
      "Trueplay tuning technology optimizes sound for your room's specific acoustics"
    ],
    specs: {
      "Channels": "7.1.4 Dolby Atmos Surround",
      "Connectivity": "Wi-Fi 6, Apple AirPlay 2, HDMI eARC",
      "Subwoofer Frequency": "Down to 25 Hz",
      "Voice Control": "Sonos Voice Control, Amazon Alexa",
      "Finish": "Matte Black"
    },
    stockStatus: "in_stock",
    stockQuantity: 5,
    isHot: true,
    opportunityScore: 96
  },
  {
    title: "Meta Quest 3 512GB Breakthrough Mixed Reality Headset",
    slug: "meta-quest-3-512gb-mixed-reality-headset",
    description: "Transform your home into an exciting new playground where virtual elements blend into your physical surroundings. 4K+ Infinite Display, Qualcomm Snapdragon XR2 Gen 2 chip with double the graphic processing power.",
    category: "Gaming & VR",
    brand: "Meta",
    originalPrice: 649.99,
    dealPrice: 224.99,
    retailer: "Newegg",
    retailerUrl: "https://www.newegg.com/p/meta-quest-3-512gb",
    imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Full-color high-resolution Passthrough for seamless mixed reality",
      "4K+ Infinite Display resolution (2064x2208 per eye) with pancake lenses",
      "40% slimmer optic profile compared to Quest 2 with enhanced ergonomic strap",
      "Touch Plus controllers with TruTouch haptics and ring-free design",
      "Spatial 3D audio with 40% louder volume range"
    ],
    specs: {
      "Storage": "512GB Fast Internal Flash",
      "Processor": "Snapdragon XR2 Gen 2",
      "Display Resolution": "2064 x 2208 per eye (Pancake lenses)",
      "Refresh Rate": "90Hz / 120Hz Supported",
      "Battery Life": "2.2 to 2.9 Hours average"
    },
    stockStatus: "in_stock",
    stockQuantity: 15,
    isHot: false,
    opportunityScore: 94
  },
  {
    title: "iRobot Roomba Combo j9+ Self-Emptying Robot Vacuum & Mop",
    slug: "irobot-roomba-combo-j9-plus-robot-vacuum-mop",
    description: "Roomba's #1 for dirt & pet hair pick-up. Features Clean Base Auto-Fill Station that empties dirt for up to 60 days and refills liquid for up to 30 days of autonomous mopping.",
    category: "Home & Appliances",
    brand: "iRobot",
    originalPrice: 1399.99,
    dealPrice: 489.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0CB9L4F54",
    imageUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Clean Base Auto-Fill Station empties debris and automatically refills liquid tank",
      "SmartScrub scrubs back and forth with consistent downward pressure",
      "PrecisionVision navigation avoids pet waste, cords, and shoes automatically",
      "D.R.I. (Dry Rug Intelligence) fully lifts mop pad away when carpet is detected",
      "100% suction boost compared to standard Roomba 600 series"
    ],
    specs: {
      "Auto Emptying": "Up to 60 Days",
      "Auto Liquid Refill": "Up to 30 Days",
      "Navigation": "vSLAM with Optical Camera & LED Spotlight",
      "Battery": "Li-ion with Smart Recharge & Resume",
      "Filter": "High-Efficiency Allergen Filter"
    },
    stockStatus: "in_stock",
    stockQuantity: 8,
    isHot: true,
    opportunityScore: 96
  },
  {
    title: "Peloton Bike+ Ultimate Package with Rotating Screen & Auto Resistance",
    slug: "peloton-bike-plus-ultimate-package",
    description: "Elevate your total body workouts with a 23.8-inch rotating HD anti-reflective touchscreen, Auto-Follow digital resistance that automatically adjusts to your instructor, and 4-speaker front/rear stereo sound.",
    category: "Outdoor & Fitness",
    brand: "Peloton",
    originalPrice: 2495.00,
    dealPrice: 875.00,
    retailer: "Peloton Official",
    retailerUrl: "https://www.onepeloton.com/bikes/bike-plus",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "23.8\" 360° rotating HD touchscreen for seamless transitions from bike to floor",
      "Auto-Follow resistance dynamically matches instructor cues automatically",
      "Apple GymKit integration syncs metrics seamlessly with Apple Watch",
      "Includes cycling shoes, light weights, heart rate band, and bike mat",
      "Whisper-quiet magnetic resistance and poly-V drive belt"
    ],
    specs: {
      "Screen": "23.8\" Rotating 1080p Touchscreen",
      "Footprint": "4 ft x 2 ft Compact Design",
      "Weight Capacity": "297 lbs",
      "User Height Range": "4'11\" to 6'5\"",
      "Connectivity": "Wi-Fi 802.11 a/b/g/n/ac & Bluetooth 5.0"
    },
    stockStatus: "in_stock",
    stockQuantity: 7,
    isHot: false,
    opportunityScore: 93
  },
  {
    title: "Samsung 49\" Odyssey OLED G9 Curved Dual QHD Gaming Monitor",
    slug: "samsung-49-odyssey-oled-g9-curved-gaming-monitor",
    description: "49-inch 1800R curved display with Neo Quantum Processor Pro. Dual QHD (5120 x 1440) resolution equals two 27-inch monitors side by side. Lightning fast 0.03ms response time and 240Hz refresh rate.",
    category: "Computing & Laptops",
    brand: "Samsung",
    originalPrice: 1799.99,
    dealPrice: 639.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/samsung-odyssey-oled-g9",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "49-inch 32:9 Super Ultra-Wide Dual QHD (5120x1440) OLED display",
      "Blistering 240Hz refresh rate and 0.03ms(GtG) response time",
      "Neo Quantum Processor Pro optimizes every frame on the OLED panel",
      "DisplayHDR True Black 400 for infinite depth and contrast",
      "CoreSync & Core Lighting+ matches on-screen colors with ambient lighting"
    ],
    specs: {
      "Screen Size": "49 Inches Curved 1800R",
      "Resolution": "5120 x 1440 (Dual QHD)",
      "Refresh Rate": "240Hz",
      "Response Time": "0.03ms (GtG)",
      "Ports": "HDMI 2.1, Micro HDMI, DisplayPort 1.4, USB Hub"
    },
    stockStatus: "in_stock",
    stockQuantity: 10,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "Weber Genesis E-335 Smart 3-Burner Liquid Propane Gas Grill",
    slug: "weber-genesis-e335-smart-gas-grill",
    description: "The biggest grilling innovation in decades. WEBER CONNECT smart grilling technology gives real-time food temperature and readiness alerts directly to your phone. Extra large sear zone and side burner.",
    category: "Outdoor & Fitness",
    brand: "Weber",
    originalPrice: 1449.00,
    dealPrice: 519.00,
    retailer: "Home Depot",
    retailerUrl: "https://www.homedepot.com/p/weber-genesis-e335",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "WEBER CONNECT smart tech: digital meat probe alerts on your phone when food is ready",
      "Extra-large PureBlu burners deliver 39,000 BTU of high-intensity heat",
      "Weber Crafted outdoor kitchen collection frame for wok, pizza stone, and griddle",
      "High-heat 13,000 BTU Sear Station creates deep grill marks in seconds",
      "12-year limited manufacturer warranty on cookbox and lid"
    ],
    specs: {
      "Main Burners": "3 PureBlu Stainless Steel (39,000 BTU)",
      "Total Cooking Area": "787 sq inches",
      "Side Burner": "12,000 BTU Side Range",
      "Fuel Type": "Liquid Propane (Tank not included)",
      "Smart Tech": "Wi-Fi & Bluetooth Digital Display"
    },
    stockStatus: "in_stock",
    stockQuantity: 6,
    isHot: false,
    opportunityScore: 92
  },
  {
    title: "Rimowa Classic Cabin Aluminum Carry-On Suitcase (Silver)",
    slug: "rimowa-classic-cabin-aluminum-suitcase-silver",
    description: "Engineered in Germany with heritage aluminum alloy and handmade leather handles. Designed to fit easily into most airline overhead compartments, the timeless travel companion for discerning globetrotters.",
    category: "Fashion & Travel",
    brand: "Rimowa",
    originalPrice: 1525.00,
    dealPrice: 549.00,
    retailer: "Nordstrom",
    retailerUrl: "https://www.nordstrom.com/s/rimowa-classic-cabin",
    imageUrl: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "High-grade anodized aluminum construction with reinforced corners",
      "Pioneered Multiwheel ball-bearing mounted wheels with cushioned axels",
      "TSA-approved lock catches can be opened without damage during security checks",
      "Height-adjustable Flex Divider adapts to your packed items for crease-free clothing",
      "Lifetime functional manufacturer guarantee"
    ],
    specs: {
      "Dimensions": "21.7 x 15.8 x 9.1 inches",
      "Weight": "9.5 lbs",
      "Volume": "36 Liters",
      "Materials": "Anodized Aluminum Shell & Full-grain Leather",
      "Cabin Approved": "IATA Airline Compliant"
    },
    stockStatus: "in_stock",
    stockQuantity: 8,
    isHot: true,
    opportunityScore: 95
  },
  {
    title: "Segway Ninebot KickScooter Max G2 Electric Long-Range Commuter",
    slug: "segway-ninebot-kickscooter-max-g2",
    description: "The gold standard commuter scooter. 43-mile theoretical range, 22 mph top speed, hydraulic front & rear double spring suspension, and self-sealing 10-inch pneumatic tubeless tires.",
    category: "Outdoor & Fitness",
    brand: "Segway",
    originalPrice: 999.99,
    dealPrice: 369.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0BYP69F2Q",
    imageUrl: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "1000W max power rear-wheel motor climbs up to 22% hill grades",
      "Up to 43 miles range on a single charge with RideyLONG technology",
      "Front hydraulic damper + double spring rear suspension for smooth riding",
      "Apple Find My network integration to locate your scooter anywhere",
      "Integrated front and rear turn signal indicators for night street safety"
    ],
    specs: {
      "Max Speed": "22 mph (35 km/h)",
      "Max Range": "43 Miles (70 km)",
      "Motor Power": "450W Nominal / 1000W Max",
      "Tires": "10-inch Self-healing Tubeless",
      "Water Resistance": "IPX5 Body, IPX7 Battery"
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isHot: false,
    opportunityScore: 93
  },
  {
    title: "Dell XPS 15 9530 (13th Gen Intel i9, 32GB RAM, 1TB SSD, RTX 4070, 3.5K OLED)",
    slug: "dell-xps-15-9530-oled-i9-rtx-4070",
    description: "Immersive 3.5K OLED InfinityEdge touch display with 100% DCI-P3 color gamut. Powered by Intel Core i9-13900H and NVIDIA GeForce RTX 4070 GPU in a CNC machined aluminum and carbon fiber chassis.",
    category: "Computing & Laptops",
    brand: "Dell",
    originalPrice: 2799.00,
    dealPrice: 1049.00,
    retailer: "Dell Official",
    retailerUrl: "https://www.dell.com/en-us/shop/dell-laptops/xps-15-laptop",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "15.6\" 3.5K (3456 x 2160) OLED InfinityEdge touch display with DisplayHDR 500",
      "13th Gen Intel Core i9-13900H 14-core processor (up to 5.4 GHz)",
      "NVIDIA GeForce RTX 4070 8GB GDDR6 dedicated graphics",
      "Studio quality quad-speaker design with Waves Nx 3D audio",
      "Machined aluminum chassis with aerospace-inspired carbon fiber palm rest"
    ],
    specs: {
      "Processor": "Intel Core i9-13900H (14 cores, 20 threads)",
      "RAM": "32GB DDR5 4800MHz",
      "Storage": "1TB M.2 PCIe NVMe SSD",
      "Graphics": "NVIDIA GeForce RTX 4070 8GB GDDR6",
      "Display": "15.6\" 3.5K OLED Touch (3456x2160)"
    },
    stockStatus: "in_stock",
    stockQuantity: 9,
    isHot: true,
    opportunityScore: 98
  },
  {
    title: "Yeti Tundra 65 Hard Cooler (Charcoal Limited Edition)",
    slug: "yeti-tundra-65-hard-cooler-charcoal",
    description: "The heavyweight champion of ice retention. Rotomolded construction, PermaFrost insulation, and Interagency Grizzly Bear Committee certified bear-resistant design.",
    category: "Outdoor & Fitness",
    brand: "Yeti",
    originalPrice: 375.00,
    dealPrice: 142.00,
    retailer: "Bass Pro Shops",
    retailerUrl: "https://www.basspro.com/shop/en/yeti-tundra-65",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "FatWall design holds up to 3 inches of commercial-grade polyurethane insulation",
      "Rotomolded construction makes it virtually indestructible to the core",
      "ColdLock Gasket circles the length of the lid to lock out heat and lock in cold",
      "NeverFail hinge system with interlocking pins that will never snap",
      "Holds up to 42 cans of beer or 52 pounds of ice"
    ],
    specs: {
      "Capacity": "65 Quarts / 42 Cans (2:1 ice ratio)",
      "Dimensions": "30.8 x 17.3 x 16.0 inches",
      "Empty Weight": "29 lbs",
      "Certification": "IGBC Bear-Resistant Container #3416",
      "Drain Plug": "Vortex rapid drain leakproof plug"
    },
    stockStatus: "in_stock",
    stockQuantity: 17,
    isHot: false,
    opportunityScore: 91
  },
  {
    title: "GoPro HERO12 Black Creator Edition Bundle with Volta Grip & Media Mod",
    slug: "gopro-hero-12-black-creator-edition-bundle",
    description: "The all-in-one content capturing powerhouse. Includes HERO12 Black with 5.3K60 video, HDR, Emmy-award winning HyperSmooth 6.0 stabilization, Volta battery hand grip, Media Mod, and Light Mod.",
    category: "Cameras & Drones",
    brand: "GoPro",
    originalPrice: 599.99,
    dealPrice: 229.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/gopro-hero12-creator-edition",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "High Dynamic Range (HDR) for 5.3K and 4K video and photos",
      "HyperSmooth 6.0 video stabilization with 360° Horizon Lock",
      "Volta grip delivers over 5 hours of 4K recording time per charge",
      "Media Mod includes directional microphone with built-in foam windscreen",
      "Bluetooth audio support for wireless mics and AirPods"
    ],
    specs: {
      "Video Resolution": "5.3K @ 60fps / 4K @ 120fps / 2.7K @ 240fps",
      "Photo Resolution": "27 Megapixels",
      "Waterproof": "Up to 33ft (10m) camera body",
      "Battery": "Enduro Cold-weather 1720mAh + Volta 4900mAh",
      "Wireless": "Wi-Fi 6 + Bluetooth 5.2"
    },
    stockStatus: "in_stock",
    stockQuantity: 22,
    isHot: false,
    opportunityScore: 92
  },
  {
    title: "Tumi Alpha 3 Continental Dual Access 4-Wheeled Carry-On Suitcase",
    slug: "tumi-alpha-3-continental-dual-access-carry-on",
    description: "The ultimate business traveler luggage crafted from FXT ballistic nylon. Dual access to main compartment through front lid or split case zip. Built-in USB power port and removable garment sleeve.",
    category: "Fashion & Travel",
    brand: "Tumi",
    originalPrice: 1125.00,
    dealPrice: 435.00,
    retailer: "Bloomingdale's",
    retailerUrl: "https://www.bloomingdales.com/shop/product/tumi-alpha-3-continental",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Signature ultra-durable FXT Ballistic Nylon fabric with DuraFold corners",
      "Dual access entry into main compartment allows effortless packing on luggage racks",
      "Built-in USB port for charging on the move (power bank not included)",
      "TUMI Tracer product recovery program registration bar",
      "Patented X-Brace 45 handle system crafted from aircraft-grade aluminum"
    ],
    specs: {
      "Dimensions": "22.0 x 16.0 x 9.0 inches (Expands to 11\")",
      "Weight": "11.1 lbs",
      "Material": "FXT Ballistic Nylon",
      "Wheels": "4 Recessed Dual-spinning wheels",
      "Garment Sleeve": "Removable with hanger bracket"
    },
    stockStatus: "in_stock",
    stockQuantity: 11,
    isHot: true,
    opportunityScore: 95
  },
  {
    title: "Samsung 65\" S95C OLED 4K Quantum HDR Smart TV with Slim One Connect",
    slug: "samsung-65-s95c-oled-4k-smart-tv",
    description: "Samsung's flagship Quantum Dot OLED TV. Infinity One design with ultra-thin profile and Attachable Slim One Connect box. 144Hz refresh rate, Neural Quantum Processor 4K, and 70W 4.2.2 Dolby Atmos sound.",
    category: "TV & Home Theater",
    brand: "Samsung",
    originalPrice: 3299.99,
    dealPrice: 1289.99,
    retailer: "Samsung Official",
    retailerUrl: "https://www.samsung.com/us/televisions-home-theater/tvs/oled-tvs/65-class-s95c",
    imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Quantum Dot OLED delivers pure blacks, bright whites, and Pantone validated color",
      "Neural Quantum Processor 4K with 20 specialized AI neural networks",
      "Infinity One Design with Slim One Connect keeps messy wires hidden",
      "Object Tracking Sound+ with built-in 70W 4.2.2 channel speakers",
      "Motion Xcelerator Turbo Pro with up to 144Hz VRR on all 4 HDMI 2.1 ports"
    ],
    specs: {
      "Screen Size": "65 Inches",
      "Panel Type": "Quantum Dot OLED (QD-OLED)",
      "Refresh Rate": "144Hz Native VRR",
      "Audio": "70W 4.2.2 Channel Dolby Atmos",
      "Connect Box": "Slim One Connect (Single Cable)"
    },
    stockStatus: "in_stock",
    stockQuantity: 6,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "NordicTrack Commercial 1750 Folding Smart Treadmill (2024 Model)",
    slug: "nordictrack-commercial-1750-smart-treadmill",
    description: "Train with elite personal trainers across global routes on a 14-inch rotating HD touchscreen with live incline (-3% to 12%) and speed auto-adjustments. SpaceSaver design with EasyLift assist.",
    category: "Outdoor & Fitness",
    brand: "NordicTrack",
    originalPrice: 2499.00,
    dealPrice: 979.00,
    retailer: "NordicTrack",
    retailerUrl: "https://www.nordictrack.com/treadmills/commercial-1750",
    imageUrl: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "14-inch tilt and pivot HD touchscreen displays global terrain workouts",
      "AutoAdjust technology lets instructors digitally control speed and incline",
      "-3% decline to 12% incline range mimics real mountain topography",
      "Runners Flex cushioning softens impact on joints during high-mileage runs",
      "SpaceSaver folding deck with hydraulic EasyLift assist"
    ],
    specs: {
      "Motor": "3.5 CHP DurX Commercial Plus Motor",
      "Tread Belt": "22\" W x 60\" L Commercial Tread Belt",
      "Speed": "0 to 12 MPH",
      "Incline": "-3% Decline to 12% Incline",
      "Max User Weight": "300 lbs"
    },
    stockStatus: "in_stock",
    stockQuantity: 5,
    isHot: false,
    opportunityScore: 90
  },
  {
    title: "Apple Watch Ultra 2 GPS + Cellular (49mm Titanium with Orange Ocean Band)",
    slug: "apple-watch-ultra-2-titanium-orange-ocean-band",
    description: "The most capable and rugged Apple Watch. Powered by the S9 SiP with double tap gesture, 3000 nits display brightness, precision dual-frequency GPS, and up to 72 hours of battery in Low Power Mode.",
    category: "Audio & Wearables",
    brand: "Apple",
    originalPrice: 799.00,
    dealPrice: 319.00,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0CHX4S9M7",
    imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "49mm aerospace-grade titanium case for ideal balance of weight and corrosion resistance",
      "Brightest Apple display ever with 3000 nits peak brightness",
      "S9 SiP chip enables Double Tap gesture without touching the display",
      "Precision dual-frequency GPS (L1 and L5) calculates distance, pace and route maps",
      "100m water resistance and certified EN13319 for scuba diving down to 40 meters"
    ],
    specs: {
      "Case": "49mm Natural Titanium",
      "Display": "Always-On Retina OLED (3000 nits)",
      "Battery": "Up to 36 hours (72 hrs Low Power)",
      "Sensors": "Depth gauge, Water temp, ECG, Blood Oxygen",
      "Connectivity": "LTE Cellular & Wi-Fi + UWB 2nd Gen"
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "De'Longhi Magnifica S Fully Automatic Espresso & Cappuccino Maker",
    slug: "delonghi-magnifica-s-automatic-espresso-machine",
    description: "Fresh beans ground directly into every cup. Compact bean-to-cup machine featuring 15-bar pressure, integrated stainless steel burr grinder with 13 settings, and manual cappuccino frother.",
    category: "Home & Appliances",
    brand: "De'Longhi",
    originalPrice: 899.95,
    dealPrice: 369.00,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/delonghi-magnifica-s",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Integrated conical burr grinder with 13 adjustable grind coarseness settings",
      "Traditional manual milk frother mixes steam and milk for rich creamy froth",
      "Compact design with front-loading water reservoir and waste coffee container",
      "Direct-to-brew system grinds beans instantly without leaving grounds behind",
      "Automatic decalcification and rinse programs for effortless maintenance"
    ],
    specs: {
      "Pump Pressure": "15 Bar",
      "Water Tank": "60 fl oz (1.8L)",
      "Bean Capacity": "8.8 oz (250g)",
      "Grinder": "Stainless Steel Conical Burrs (13 settings)",
      "Power": "1450 Watts"
    },
    stockStatus: "in_stock",
    stockQuantity: 11,
    isHot: false,
    opportunityScore: 91
  },
  {
    title: "LG Gram 17 Super-Lightweight Laptop (Intel Core Ultra 7, 32GB RAM, 2TB SSD)",
    slug: "lg-gram-17-intel-core-ultra-7-laptop",
    description: "Featherlight 17-inch laptop weighing only 2.98 lbs. Powered by Intel Core Ultra 7 processor with built-in Intel AI Boost NPU, WQXGA 2560x1600 IPS display, and 77Wh battery for up to 20 hours.",
    category: "Computing & Laptops",
    brand: "LG",
    originalPrice: 1999.99,
    dealPrice: 829.99,
    retailer: "Costco",
    retailerUrl: "https://www.costco.com/lg-gram-17",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Weighs only 2.98 lbs (1.35 kg) despite huge 17-inch display",
      "17-inch WQXGA (2560 x 1600) IPS anti-glare screen with 99% DCI-P3",
      "Intel Core Ultra 7 155H 16-core processor with Intel AI Boost",
      "Passed 7 military-grade MIL-STD-810H durability tests",
      "Huge 77Wh battery delivers up to 20 hours of local video playback"
    ],
    specs: {
      "Weight": "2.98 lbs (1.35 kg)",
      "Processor": "Intel Core Ultra 7 155H",
      "RAM": "32GB LPDDR5X 7467MHz",
      "Storage": "2TB NVMe Gen4 SSD",
      "Display": "17.0\" IPS WQXGA (2560x1600)"
    },
    stockStatus: "in_stock",
    stockQuantity: 13,
    isHot: false,
    opportunityScore: 93
  },
  {
    title: "AirPods Max Wireless Over-Ear Headphones (Silver with Smart Case)",
    slug: "apple-airpods-max-silver-over-ear-headphones",
    description: "Computational audio combines custom acoustic design with the Apple H1 chip and software for breakthrough listening experiences. Active Noise Cancellation with Transparency mode and Spatial Audio with dynamic head tracking.",
    category: "Audio & Wearables",
    brand: "Apple",
    originalPrice: 549.00,
    dealPrice: 229.00,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/airpods-max-silver",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Apple-designed 40mm dynamic driver provides high-fidelity audio with near-zero distortion",
      "Active Noise Cancellation blocks outside noise so you can immerse yourself in music",
      "Transparency mode for hearing and interacting with the world around you",
      "Personalized Spatial Audio with dynamic head tracking for theater-like sound",
      "Knit-mesh canopy headband and memory foam ear cushions for exceptional fit"
    ],
    specs: {
      "Chips": "Apple H1 headphone chip (each ear cup)",
      "Battery Life": "Up to 20 Hours with ANC On",
      "Weight": "13.6 oz (384.8g)",
      "Sensors": "Optical, Position, Case-detect, Accelerometer, Gyroscope",
      "Case": "Smart Case with ultra-low power state"
    },
    stockStatus: "in_stock",
    stockQuantity: 15,
    isHot: true,
    opportunityScore: 96
  },
  {
    title: "Big Green Egg Large Ceramic Charcoal Kamado Grill & Smoker",
    slug: "big-green-egg-large-kamado-grill",
    description: "The most popular size for handling the cooking needs of most families and gatherings of friends. Fits 20-pound turkeys, 12 burgers, 6 chickens vertically, or 8 steaks.",
    category: "Outdoor & Fitness",
    brand: "Big Green Egg",
    originalPrice: 1299.00,
    dealPrice: 549.00,
    retailer: "Ace Hardware",
    retailerUrl: "https://www.acehardware.com/departments/outdoor-living/grills-and-smokers/big-green-egg",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "NASA-developed ceramic technology locks in heat, moisture, and authentic charcoal flavor",
      "Patented airflow system allows precise temperature control from 200°F smoking to 750°F searing",
      "Stainless steel cooking grid with 262 sq in cooking area",
      "Heavy-duty insulated ceramic walls stay cooler to the touch than metal grills",
      "Backed by a limited lifetime warranty for original owner"
    ],
    specs: {
      "Grid Diameter": "18.25 inches (46 cm)",
      "Cooking Area": "262 sq inches (1688 sq cm)",
      "Weight": "162 lbs (73 kg)",
      "Temperature Range": "200°F to 750°F+ (93°C to 400°C)",
      "Fuel": "100% Natural Organic Hardwood Lump Charcoal"
    },
    stockStatus: "in_stock",
    stockQuantity: 4,
    isHot: false,
    opportunityScore: 89
  },
  {
    title: "ASUS ROG Zephyrus G16 (2024) 16\" 2.5K OLED 240Hz Gaming Laptop (RTX 4080)",
    slug: "asus-rog-zephyrus-g16-oled-rtx4080-gaming-laptop",
    description: "Sleek all-aluminum CNC chassis with ROG Slash Lighting. Features 16-inch 2.5K 240Hz ROG Nebula OLED display, Intel Core Ultra 9 185H, and NVIDIA GeForce RTX 4080 GPU with ROG Intelligent Cooling.",
    category: "Gaming & VR",
    brand: "ASUS",
    originalPrice: 2899.99,
    dealPrice: 1249.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/asus-rog-zephyrus-g16-rtx4080",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "16-inch ROG Nebula OLED display (2560 x 1600, 240Hz, 0.2ms, G-Sync, 100% DCI-P3)",
      "Intel Core Ultra 9 185H processor with built-in AI acceleration",
      "NVIDIA GeForce RTX 4080 12GB GDDR6 Laptop GPU (115W TGP with Dynamic Boost)",
      "Ultra-slim CNC machined aluminum chassis measuring just 0.59\" thin",
      "Tri-Fan technology with 2nd Gen Arc Flow Fans and liquid metal thermal compound"
    ],
    specs: {
      "GPU": "NVIDIA GeForce RTX 4080 12GB GDDR6",
      "CPU": "Intel Core Ultra 9 185H 16-Core",
      "Display": "16.0\" 2.5K 240Hz OLED (0.2ms)",
      "RAM": "32GB LPDDR5X 7467MHz",
      "Storage": "1TB PCIe 4.0 NVMe M.2 SSD"
    },
    stockStatus: "in_stock",
    stockQuantity: 7,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "Sennheiser Momentum 4 Wireless ANC Headphones (60-Hour Battery)",
    slug: "sennheiser-momentum-4-wireless-anc-headphones",
    description: "Audiophile-inspired 42mm transducer system delivering incredible dynamics and clarity. Next-generation Adaptive Noise Cancellation and class-leading 60-hour battery life with fast charging.",
    category: "Audio & Wearables",
    brand: "Sennheiser",
    originalPrice: 379.95,
    dealPrice: 164.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0B6GHW1SX",
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Sennheiser Signature Sound powered by 42mm audiophile-grade drivers",
      "Class-leading 60 hours of continuous music playback with ANC turned on",
      "Adaptive Noise Cancellation automatically adjusts to ambient room noise",
      "Customizable sound with built-in EQ, presets, and Sound Personalization mode",
      "Crystal-clear voice calls with 4 digital beamforming microphones"
    ],
    specs: {
      "Battery Life": "60 Hours with Bluetooth and ANC",
      "Speaker Type": "42mm Dynamic Transducer",
      "Codecs": "aptX Adaptive, aptX, AAC, SBC",
      "Weight": "293 grams",
      "Fast Charge": "10 mins charge = 6 hours playtime"
    },
    stockStatus: "in_stock",
    stockQuantity: 18,
    isHot: false,
    opportunityScore: 92
  },
  {
    title: "Xbox Series X 1TB Console - Diablo IV Special Edition Bundle",
    slug: "xbox-series-x-diablo-iv-bundle",
    description: "The fastest, most powerful Xbox ever. 12 teraflops of raw graphic processing power, DirectX ray tracing, custom SSD, and 4K gaming at up to 120 FPS. Includes Diablo IV full game download.",
    category: "Gaming & VR",
    brand: "Microsoft",
    originalPrice: 559.99,
    dealPrice: 249.99,
    retailer: "Walmart",
    retailerUrl: "https://www.walmart.com/ip/xbox-series-x-diablo-iv",
    imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "12 TFLOPS of raw computing power with AMD Zen 2 and RDNA 2 architectures",
      "Xbox Velocity Architecture with custom 1TB NVMe SSD for fast load times",
      "Quick Resume lets you switch between multiple titles seamlessly in seconds",
      "Play games at up to 120 FPS with 4K UHD resolution and HDR10 support",
      "Includes Diablo IV Cross-Gen Bundle and Caparison of Faith Mount Armor"
    ],
    specs: {
      "CPU": "8-Core AMD Zen 2 @ 3.8 GHz",
      "GPU": "12 TFLOPS, 52 CUs @ 1.825 GHz Custom RDNA 2",
      "Memory": "16GB GDDR6 with 320-bit bus",
      "Internal Storage": "1TB Custom NVMe SSD",
      "Optical Drive": "4K UHD Blu-Ray"
    },
    stockStatus: "in_stock",
    stockQuantity: 12,
    isHot: false,
    opportunityScore: 93
  },
  {
    title: "Lenovo ThinkPad X1 Carbon Gen 11 (Intel Core i7-1365U, 32GB RAM, 1TB SSD, 2.8K OLED)",
    slug: "lenovo-thinkpad-x1-carbon-gen-11-oled",
    description: "The gold standard of ultrabooks. Carbon fiber and magnesium alloy chassis weighing just 2.48 lbs. Gorgeous 14-inch 2.8K OLED 100% DCI-P3 display with legendary ThinkPad keyboard and TrackPoint.",
    category: "Computing & Laptops",
    brand: "Lenovo",
    originalPrice: 2349.00,
    dealPrice: 1049.00,
    retailer: "Lenovo Direct",
    retailerUrl: "https://www.lenovo.com/us/en/p/laptops/thinkpad/thinkpadx1/thinkpad-x1-carbon-gen-11",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Ultralight carbon fiber chassis weighing only 2.48 lbs (1.12 kg)",
      "14.0\" 2.8K (2880 x 1800) OLED display with 100% DCI-P3, HDR 500 True Black",
      "13th Gen Intel Core i7-1365U vPro enterprise-grade security and speed",
      "Legendary spill-resistant ThinkPad keyboard with redesigned air-intake keys",
      "Dual Thunderbolt 4 ports, HDMI 2.0b, and Wi-Fi 6E connectivity"
    ],
    specs: {
      "Weight": "2.48 lbs (1.12 kg)",
      "Processor": "Intel Core i7-1365U vPro (10 Cores, 12 Threads)",
      "RAM": "32GB LPDDR5 6400MHz",
      "Storage": "1TB PCIe Gen4 Performance SSD",
      "Battery": "57Wh with Rapid Charge (80% in 60 mins)"
    },
    stockStatus: "in_stock",
    stockQuantity: 9,
    isHot: false,
    opportunityScore: 91
  },
  {
    title: "Steam Deck OLED 1TB Handheld Gaming PC (Premium Anti-Glare Etched Glass)",
    slug: "valve-steam-deck-oled-1tb-handheld",
    description: "The benchmark PC gaming handheld. 7.4-inch 90Hz HDR OLED display with true blacks and stunning clarity, faster Wi-Fi 6E, 50Wh battery for 3-12 hours of gameplay, and 1TB NVMe SSD.",
    category: "Gaming & VR",
    brand: "Valve",
    originalPrice: 649.00,
    dealPrice: 299.00,
    retailer: "Steam / Valve",
    retailerUrl: "https://store.steampowered.com/steamdeck",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1612287233215-d72491b68187?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "7.4-inch 90Hz HDR OLED screen with 1,000 nits peak brightness and pure blacks",
      "Premium anti-glare etched glass display for outdoor and bright light gaming",
      "6nm AMD APU for improved thermals and 30-50% longer battery life",
      "Tri-band Wi-Fi 6E downloads games up to 3x faster with lower ping",
      "Dual haptic touchpads, gyro aiming, and full-size analog thumbsticks"
    ],
    specs: {
      "Display": "7.4\" 1280x800 HDR OLED @ 90Hz",
      "APU": "6nm AMD 'Sephiroth' Zen 2 4c/8t + RDNA 2 8 CUs",
      "Storage": "1TB High-speed NVMe SSD",
      "Battery": "50Wh (3 - 12 Hours of gameplay)",
      "Weight": "640 grams (approx 1.41 lbs)"
    },
    stockStatus: "in_stock",
    stockQuantity: 16,
    isHot: true,
    opportunityScore: 97
  },
  {
    title: "KitchenAid Artisan Series 5-Quart Tilt-Head Stand Mixer (Empire Red)",
    slug: "kitchenaid-artisan-series-5-quart-stand-mixer",
    description: "The iconic kitchen centerpiece. 10 speeds to thoroughly mix, knead, and whip ingredients. Includes 5-quart stainless steel bowl with comfortable handle, coated flat beater, coated dough hook, and 6-wire whip.",
    category: "Home & Appliances",
    brand: "KitchenAid",
    originalPrice: 449.99,
    dealPrice: 209.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/kitchenaid-artisan-5qt",
    imageUrl: "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "59-Point planetary mixing action touches 59 points per rotation for complete bowl coverage",
      "5-Quart stainless steel bowl with handle holds enough dough for 9 dozen cookies",
      "Tilt-head design allows clear access to the bowl and attached beater or accessory",
      "Power Hub fits over 10 optional attachments from pasta rollers to meat grinders",
      "Durable metal construction built to last generations"
    ],
    specs: {
      "Bowl Capacity": "5 Quarts (4.8L)",
      "Speeds": "10 Variable Speeds",
      "Wattage": "325 Watts",
      "Construction": "Die-Cast Zinc Metal",
      "Warranty": "1-Year Full Replacement"
    },
    stockStatus: "in_stock",
    stockQuantity: 15,
    isHot: false,
    opportunityScore: 90
  },
  {
    title: "Sony Bravia XR 75\" Class X90L Full Array LED 4K HDR Google TV",
    slug: "sony-bravia-xr-75-class-x90l-4k-google-tv",
    description: "Cognitive Processor XR delivers life-like contrast, intense brightness, and pure deep blacks with Full Array LED and XR Contrast Booster. Perfect for PlayStation 5 with Auto HDR Tone Mapping.",
    category: "TV & Home Theater",
    brand: "Sony",
    originalPrice: 2199.99,
    dealPrice: 1049.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0BYF858N9",
    imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Cognitive Processor XR understands how humans see and hear for unprecedented realism",
      "Full Array LED backlighting with local dimming for punchy contrast",
      "Acoustic Multi-Audio with sound positioning tweeters that match audio to screen action",
      "Exclusive PS5 features: Auto HDR Tone Mapping and Auto Genre Picture Mode",
      "Google TV with Google Assistant brings 700,000+ movies and TV episodes in one place"
    ],
    specs: {
      "Screen Size": "75 Inches",
      "Display Type": "Full Array LED LCD",
      "Processor": "Cognitive Processor XR",
      "Refresh Rate": "120Hz Native",
      "Audio": "30W XR Acoustic Multi-Audio"
    },
    stockStatus: "in_stock",
    stockQuantity: 7,
    isHot: false,
    opportunityScore: 91
  },
  {
    title: "Apple Studio Display 27\" 5K Retina (Tilt & Height Adjustable Stand, Nano-Texture)",
    slug: "apple-studio-display-27-nano-texture-height-adjustable",
    description: "An expansive 27-inch 5K Retina screen, 12MP Ultra Wide camera with Center Stage, studio-quality three-mic array, and six-speaker sound system with Spatial Audio. Nano-texture glass minimizes glare in bright studios.",
    category: "Computing & Laptops",
    brand: "Apple",
    originalPrice: 2299.00,
    dealPrice: 1099.00,
    retailer: "Apple Store Refurb / B&H",
    retailerUrl: "https://www.bhphotovideo.com/c/product/apple-studio-display",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "27-inch 5K Retina display with 14.7 million pixels and 600 nits brightness",
      "Nano-texture glass scatters light to further minimize reflections and glare",
      "12MP Ultra Wide camera with Center Stage keeps you centered on video calls",
      "Six-speaker sound system with force-cancelling woofers and Spatial Audio",
      "One Thunderbolt 3 port (charges Mac at 96W) + three USB-C ports"
    ],
    specs: {
      "Resolution": "5120 x 2880 at 218 ppi (5K)",
      "Color Support": "1 Billion Colors (P3 Wide Color)",
      "Stand": "Tilt and Height-Adjustable (-5° to +25°, 105mm height)",
      "Glass": "Nano-Texture Etched Glass",
      "Charging": "96W Host Power Delivery"
    },
    stockStatus: "in_stock",
    stockQuantity: 5,
    isHot: true,
    opportunityScore: 96
  },
  {
    title: "Nike Air Jordan 1 Retro High OG 'Chicago Lost & Found' (Collector Edition)",
    slug: "nike-air-jordan-1-retro-high-og-chicago-lost-found",
    description: "The shoe that changed sneaker culture forever. Vintage-inspired cracked leather collar, pre-yellowed midsole, and aged graphic box paying homage to mom-and-pop sneaker shops of the 1980s.",
    category: "Fashion & Travel",
    brand: "Nike",
    originalPrice: 380.00,
    dealPrice: 185.00,
    retailer: "Nike SNKRS / StockX Deal",
    retailerUrl: "https://www.nike.com/launch/t/air-jordan-1-chicago",
    imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Iconic Varsity Red, Black, and Sail color blocking faithful to 1985 specs",
      "Cracked leather ankle collar and toe box mimic vintage deadstock aging",
      "Encapsulated Nike Air-Sole unit in heel for lightweight cushioning",
      "Comes with vintage receipt print, mismatch lid box, and replacement laces",
      "Solid rubber outsole with deep flex grooves for traction"
    ],
    specs: {
      "Upper": "Premium Genuine Full-grain Leather",
      "Midsole": "Polyurethane with Air-Sole Unit",
      "Outsole": "Durable Solid Rubber",
      "Edition": "Lost & Found Retro OG",
      "Authenticity": "100% Retail Direct Verified"
    },
    stockStatus: "in_stock",
    stockQuantity: 12,
    isHot: true,
    opportunityScore: 95
  },
  {
    title: "Anker SOLIX C1000 Portable Power Station (1800W / 1056Wh LiFePO4)",
    slug: "anker-solix-c1000-portable-power-station",
    description: "Ultra-fast 43-minute HyperFlash recharge. Powers 99% of appliances with 1800W output (SurgePad up to 2400W). Built with EV-grade LiFePO4 batteries designed to last over 10 years / 3000 cycles.",
    category: "Outdoor & Fitness",
    brand: "Anker",
    originalPrice: 999.00,
    dealPrice: 489.00,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0C8V4K9Z8",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Recharges to 100% in just 43 minutes via AC wall socket",
      "1056Wh capacity expandable up to 2112Wh with expansion battery",
      "1800W AC output powers microwaves, power tools, blenders, and CPAP machines",
      "InfiniPower technology with EV-grade LiFePO4 cells rated for 3,000+ cycles",
      "Smart App control over Wi-Fi and Bluetooth to monitor power draw and charging"
    ],
    specs: {
      "Battery Capacity": "1056Wh LiFePO4",
      "AC Output": "1800W Pure Sine Wave (SurgePad 2400W)",
      "Recharge Time": "43 mins to 100% (UltraFast mode)",
      "Ports": "6x AC, 2x USB-C (100W/30W), 2x USB-A, 1x Car Socket",
      "Weight": "28.4 lbs (12.9 kg)"
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isHot: false,
    opportunityScore: 91
  },
  {
    title: "Philips Sonicare DiamondClean Smart 9700 Electric Toothbrush (Rose Gold)",
    slug: "philips-sonicare-diamondclean-smart-9700",
    description: "Our best ever toothbrush for complete oral care. 4 high-performance brush heads, 5 modes, 3 intensities, smart sensor technology that tracks brushing coverage in 3D in the Sonicare app, and charging glass.",
    category: "Personal Care & Beauty",
    brand: "Philips Sonicare",
    originalPrice: 379.99,
    dealPrice: 189.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B073GBLH17",
    imageUrl: "https://images.unsplash.com/photo-1559591937-e111d4e08f51?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Removes up to 10x more plaque and improves gum health up to 7x in 2 weeks",
      "Smart sensors give real-time feedback on pressure, scrubbing, and location in 3D app",
      "5 brushing modes: Clean, White+, Gum Health, Deep Clean+, and Tongue Care",
      "Includes illuminated charging glass and deluxe USB travel charging case",
      "Smart brush head recognition automatically selects optimal mode and intensity"
    ],
    specs: {
      "Vibrations": "Up to 62,000 brush movements/min",
      "Battery Life": "Up to 14 days per full charge",
      "Modes": "5 Modes with 3 Intensity Levels",
      "Connectivity": "Bluetooth Connected App",
      "Color": "Rose Gold Metallic"
    },
    stockStatus: "in_stock",
    stockQuantity: 21,
    isHot: false,
    opportunityScore: 89
  },
  {
    title: "Traeger Ironwood 885 Wood Pellet WiFi Grill and Smoker (Black)",
    slug: "traeger-ironwood-885-wood-pellet-grill",
    description: "WiFIRE technology connects your grill to your phone for remote temperature adjustments, timer monitoring, and recipe downloads. Double-wall insulated construction and Super Smoke mode for wood-fired flavor.",
    category: "Outdoor & Fitness",
    brand: "Traeger",
    originalPrice: 1499.99,
    dealPrice: 749.99,
    retailer: "Home Depot",
    retailerUrl: "https://www.homedepot.com/p/traeger-ironwood-885",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "WiFIRE technology allows remote monitoring & control via Traeger app or Alexa",
      "Super Smoke Mode boosts wood-fired flavor at the press of a button (165°F-225°F)",
      "Double-side-wall insulation keeps internal temps consistent even in freezing weather",
      "885 square inches of total cooking capacity fits 10 chickens or 7 rib racks",
      "Built-in meat probe and pellet sensor alerts when fuel runs low"
    ],
    specs: {
      "Total Cooking Space": "885 sq inches",
      "Pellet Hopper Capacity": "20 lbs",
      "Max Temperature": "500°F",
      "D2 Direct Drive": "Variable speed brushless motor",
      "Weight": "175 lbs"
    },
    stockStatus: "in_stock",
    stockQuantity: 6,
    isHot: false,
    opportunityScore: 88
  },
  {
    title: "Le Creuset Enameled Cast Iron Signature Round Dutch Oven (5.5 Qt, Cerise)",
    slug: "le-creuset-enameled-cast-iron-dutch-oven-5-5-qt",
    description: "The French culinary icon. Handcrafted by French artisans since 1925, perfect for slow-cooking, braising, baking artisan sourdough bread, and roasting with superior heat retention and smooth sand-colored interior.",
    category: "Home & Appliances",
    brand: "Le Creuset",
    originalPrice: 420.00,
    dealPrice: 215.00,
    retailer: "Williams Sonoma",
    retailerUrl: "https://www.williams-sonoma.com/products/le-creuset-signature-round-dutch-oven",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Enameled cast iron delivers superior heat distribution and retention",
      "Ready to use with no seasoning required; resist dulling, staining, and cracking",
      "Tight-fitting lid circulates steam and returns moisture back to food",
      "Ergonomic composite knob safe at any oven temperature up to 500°F",
      "Safe for induction, gas, electric, ceramic, halogen, and oven"
    ],
    specs: {
      "Capacity": "5.5 Quarts (Serves 5-6)",
      "Material": "Enameled Cast Iron",
      "Origin": "Handcrafted in France",
      "Oven Safe": "Up to 500°F (260°C)",
      "Dishwasher Safe": "Yes"
    },
    stockStatus: "in_stock",
    stockQuantity: 18,
    isHot: false,
    opportunityScore: 90
  },
  {
    title: "Marshall Stanmore III Bluetooth Wireless Home Speaker (Vintage Cream)",
    slug: "marshall-stanmore-iii-bluetooth-home-speaker",
    description: "Takes the legendary Marshall heritage and expands sound with outward-angled tweeters and updated waveguides. Re-engineered for an even wider soundstage that fills any room with heavy rock-and-roll presence.",
    category: "Audio & Wearables",
    brand: "Marshall",
    originalPrice: 379.99,
    dealPrice: 199.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/marshall-stanmore-iii",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Re-engineered wider stereo soundstage with angled tweeters and custom waveguides",
      "Dynamic Loudness adjusts tonal balance to keep music crisp at every volume",
      "Next-generation Bluetooth 5.2 and ready for LE Audio technology",
      "Vintage brass control knobs for Bass, Treble, and Volume tuning",
      "Crafted with 70% post-consumer recycled plastic and 100% vegan materials"
    ],
    specs: {
      "Amplifiers": "One 50W Class D (woofer) + Two 15W Class D (tweeters)",
      "Frequency Range": "45 - 20,000 Hz",
      "Max SPL": "97 dB @ 1m",
      "Inputs": "Bluetooth 5.2, 3.5mm Aux, RCA",
      "Weight": "9.37 lbs (4.25 kg)"
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isHot: false,
    opportunityScore: 88
  },
  {
    title: "Bose Smart Ultra Soundbar with Dolby Atmos and AI Dialogue Mode",
    slug: "bose-smart-ultra-soundbar-dolby-atmos",
    description: "Top-of-the-line wireless soundbar with Dolby Atmos and Bose TrueSpace technology. AI Dialogue Mode automatically balances voice clarity and surround sound effects for crystal-clear conversations in movies.",
    category: "TV & Home Theater",
    brand: "Bose",
    originalPrice: 899.00,
    dealPrice: 479.00,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0CCZ267XB",
    imageUrl: "https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Dolby Atmos and upward-firing dipole transducers wrap sound above and around you",
      "A.I. Dialogue Mode uses machine learning to clarify spoken words over loud music/effects",
      "Bose TrueSpace technology intelligently upmixes non-Atmos stereo or 5.1 content",
      "ADAPTiQ audio room calibration custom tunes sound to your room's layout",
      "Wi-Fi, Bluetooth, Apple AirPlay 2, Spotify Connect, and Chromecast built-in"
    ],
    specs: {
      "Inputs": "HDMI eARC, Optical, Ethernet, Subwoofer Out",
      "Microphones": "Built-in voice array for Amazon Alexa",
      "Dimensions": "41.14\" W x 2.29\" H x 4.21\" D",
      "Weight": "12.68 lbs",
      "Remote": "Full-function infrared remote included"
    },
    stockStatus: "in_stock",
    stockQuantity: 9,
    isHot: false,
    opportunityScore: 89
  },
  {
    title: "Bowflex SelectTech 552 Adjustable Dumbbells (Pair with 5-52.5 lbs Range)",
    slug: "bowflex-selecttech-552-adjustable-dumbbells",
    description: "Replaces 15 sets of weights in one compact footprint. With the turn of a dial, rapidly adjust weight from 5 to 52.5 lbs in 2.5 lb increments up to the first 25 lbs.",
    category: "Outdoor & Fitness",
    brand: "Bowflex",
    originalPrice: 549.00,
    dealPrice: 299.00,
    retailer: "Dick's Sporting Goods",
    retailerUrl: "https://www.dickssportinggoods.com/p/bowflex-selecttech-552",
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Replaces 15 sets of weights: adjust from 5 to 52.5 lbs per dumbbell",
      "Selection dial system lets you switch weight resistance in seconds",
      "Durable molding around metal plates creates a smooth, quiet workout without clanking",
      "Space-efficient design eliminates clutter in home gym",
      "Includes 1-Year JRNY workout app subscription for on-demand strength classes"
    ],
    specs: {
      "Weight Range": "5 to 52.5 lbs (2.3 to 23.8 kg) each",
      "Weight Settings": "15 (5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35, 40, 45, 50, 52.5 lbs)",
      "Dimensions": "16.9\" L x 8.3\" W x 9\" H",
      "Dumbbell Trays": "Included base storage cradles",
      "Warranty": "2-Year Manufacturer Warranty"
    },
    stockStatus: "in_stock",
    stockQuantity: 16,
    isHot: false,
    opportunityScore: 87
  },
  {
    title: "Shark Matrix Plus 2-in-1 Robot Vacuum & Mop with Sonic Mopping & Self-Empty",
    slug: "shark-matrix-plus-2-in-1-robot-vacuum-mop",
    description: "Incredible suction + sonic mopping with Matrix Clean navigation. Self-emptying bagless base holds up to 60 days of dirt and debris. Anti-Allergen complete seal captures 99.9% of dust and allergens.",
    category: "Home & Appliances",
    brand: "Shark",
    originalPrice: 699.99,
    dealPrice: 389.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/shark-matrix-plus-2in1",
    imageUrl: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Matrix Clean Navigation clears debris using a precision precision grid pattern",
      "Sonic Mopping scrubs hard floors 100 times per minute to break down sticky messes",
      "Bagless self-emptying base requires no costly replacement bags",
      "Precision 360° LiDAR vision maps your whole house accurately day or night",
      "Self-cleaning brushroll digs deep into carpets and resists hair wraps"
    ],
    specs: {
      "Capacity": "60-Day Bagless Base Capacity",
      "Navigation": "360° LiDAR Optical Sensor",
      "Sonic Mopping": "100 scrubs/minute",
      "Filtration": "HEPA Anti-Allergen Seal",
      "App Control": "SharkClean iOS / Android App"
    },
    stockStatus: "in_stock",
    stockQuantity: 19,
    isHot: false,
    opportunityScore: 88
  },
  {
    title: "Rolex Submariner Date 41mm 'Starbucks' (Oystersteel, Green Ceramic Bezel - Certified Pre-Owned)",
    slug: "rolex-submariner-date-41-starbucks-green-bezel",
    description: "Certified Authentic luxury timekeeper. Features 41mm Oystersteel case, unidirectional rotatable green Cerachrom ceramic bezel, black dial with Chromalight luminescent display, and Rolex Calibre 3235 movement with 70h power reserve.",
    category: "Fashion & Travel",
    brand: "Rolex",
    originalPrice: 14950.00,
    dealPrice: 8450.00,
    retailer: "WatchBox / Govberg Certified",
    retailerUrl: "https://www.thewatchbox.com/watches/rolex-submariner",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Certified Authentic with original green warranty card, box, and paperwork",
      "41mm Oystersteel case resistant to corrosion with screw-down Triplock winding crown",
      "Green Cerachrom ceramic bezel insert engraved with 60-minute graduations",
      "Rolex Manufacture Calibre 3235 automatic movement with 70-hour power reserve",
      "Oyster bracelet with Rolex Glidelock extension system for wetsuit fitting"
    ],
    specs: {
      "Reference": "126610LV (Starbucks / Kermit)",
      "Case Size": "41mm Oystersteel 904L",
      "Movement": "Rolex Calibre 3235 Perpetual",
      "Water Resistance": "300 Meters / 1,000 Feet",
      "Condition": "Mint Certified Pre-Owned (Grade A)"
    },
    stockStatus: "in_stock",
    stockQuantity: 2,
    isHot: true,
    opportunityScore: 99
  },
  {
    title: "Sony FE 24-70mm f/2.8 GM II G Master Standard Zoom Lens",
    slug: "sony-fe-24-70mm-f2-8-gm-ii-lens",
    description: "The world's smallest and lightest f/2.8 standard zoom lens. Breathtaking resolution and bokeh, four XD linear autofocus motors, and dedicated aperture ring with click switch for video creators.",
    category: "Cameras & Drones",
    brand: "Sony",
    originalPrice: 2299.99,
    dealPrice: 1329.99,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/1699745-REG/sony_fe_24_70mm_f_2_8_gm.html",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "22% lighter and 18% smaller volume than original GM version",
      "Constant f/2.8 maximum aperture throughout the entire zoom range",
      "Four XD (extreme dynamic) Linear Motors deliver blistering fast, silent AF",
      "Nano AR Coating II suppresses internal reflections, flare, and ghosting",
      "Aperture ring with click ON/OFF switch and iris lock switch"
    ],
    specs: {
      "Focal Length": "24 - 70mm",
      "Max Aperture": "f/2.8 Constant",
      "Filter Size": "82mm",
      "Weight": "24.6 oz (695g)",
      "Minimum Focus Distance": "8.3 inches (0.21m)"
    },
    stockStatus: "in_stock",
    stockQuantity: 5,
    isHot: false,
    opportunityScore: 91
  },
  {
    title: "Ooni Karu 16 Multi-Fuel Outdoor Pizza Oven (Wood, Charcoal & Gas Compatible)",
    slug: "ooni-karu-16-multi-fuel-pizza-oven",
    description: "First pizza oven to be 'Recommended for Domestic Use' by the Associazione Verace Pizza Napoletana. Cooks authentic stone-baked 16-inch Neapolitan pizzas in just 60 seconds at scorching 950°F.",
    category: "Home & Appliances",
    brand: "Ooni",
    originalPrice: 799.00,
    dealPrice: 469.00,
    retailer: "Ooni Direct / Williams Sonoma",
    retailerUrl: "https://ooni.com/products/ooni-karu-16",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Multiple fuel options: use real wood or charcoal out of the box, or gas with burner attachment",
      "Reaches blazing 950°F (500°C) in just 15 minutes of preheating",
      "Hinged glass oven door with ViewFlame technology keeps temperature inside while viewing cook",
      "Mounted digital thermometer displays internal ambient temperature in real-time",
      "Extra-large 16-inch cooking surface for pizzas, steaks, breads, and roasted meats"
    ],
    specs: {
      "Max Temperature": "950°F (500°C)",
      "Cooking Surface": "16.7\" x 16.7\" Cordierite Stone (15mm thick)",
      "Fuel": "Real Wood Logs, Charcoal, or Propane (with adapter)",
      "Weight": "62.6 lbs (28.4 kg)",
      "Dimensions": "33 x 19.6 x 32.9 inches"
    },
    stockStatus: "in_stock",
    stockQuantity: 8,
    isHot: false,
    opportunityScore: 89
  },
  {
    title: "Solo Stove Bonfire 2.0 Smokeless Fire Pit with Removable Ash Pan & Stand Bundle",
    slug: "solo-stove-bonfire-2-0-smokeless-fire-pit-bundle",
    description: "Enjoy fires without the stinging smoke in your eyes. Signature 360° Airflow Design superheats air to burn off smoke before it can escape. New 2.0 version includes removable base plate and ash pan for easy cleaning.",
    category: "Outdoor & Fitness",
    brand: "Solo Stove",
    originalPrice: 399.99,
    dealPrice: 239.99,
    retailer: "Solo Stove / REI",
    retailerUrl: "https://www.solostove.com/en-us/p/bonfire-2-0",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Patented 360° Airflow technology creates a mesmerizing secondary burn with zero smoke",
      "Removable ash pan allows you to empty cooled ash without tipping over the entire fire pit",
      "Constructed from 304 stainless steel for lifetime durability in extreme outdoor weather",
      "Includes Bonfire Stand allowing safe use on heat-sensitive surfaces like wood decks",
      "Ultra-portable with included heavy-duty nylon carry case"
    ],
    specs: {
      "Diameter": "19.5 inches",
      "Height": "14 inches",
      "Weight": "23.3 lbs",
      "Material": "304 Stainless Steel",
      "Fuel": "Standard firewood logs up to 16\""
    },
    stockStatus: "in_stock",
    stockQuantity: 25,
    isHot: false,
    opportunityScore: 87
  },
  {
    title: "Theragun PRO Plus (6th Gen) Multi-Therapy Percussive Massage Device",
    slug: "theragun-pro-plus-percussive-massage-device",
    description: "The most advanced recovery device ever made. Combines 16mm deep-muscle percussive therapy with near-infrared LED light therapy, vibration therapy, heat therapy, and built-in biometric sensor.",
    category: "Personal Care & Beauty",
    brand: "Therabody",
    originalPrice: 599.00,
    dealPrice: 369.00,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/theragun-pro-plus",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Multi-Therapy: Percussive + Near-Infrared LED light therapy to boost cellular healing",
      "Commercial-grade brushless motor with QuietForce technology delivers up to 60 lbs stall force",
      "Patented ergonomic triangle multi-grip handle reaches 80% of body without wrist strain",
      "Built-in biometric sensor displays heart rate on integrated color LCD screen",
      "Includes 6 attachments: Standard Ball, Dampener, Thumb, Wedge, Micro-point, Heat attachment"
    ],
    specs: {
      "Amplitude": "16mm deep muscle treatment",
      "Stall Force": "60 lbs no-stall power",
      "Speed Range": "1750 - 2400 PPM (5 speeds)",
      "Battery Life": "150 Minutes per charge",
      "Connectivity": "Bluetooth with Therabody App"
    },
    stockStatus: "in_stock",
    stockQuantity: 14,
    isHot: false,
    opportunityScore: 86
  },
  {
    title: "Weber Smokey Mountain Cooker 22-Inch Charcoal Smoker",
    slug: "weber-smokey-mountain-cooker-22-inch",
    description: "Authentic low-and-slow barbecue pitmaster smoking. Porcelain-enameled lid and bowl retain heat for 12+ hours with water pan for tender briskets, pulled pork, and fall-off-the-bone ribs.",
    category: "Outdoor & Fitness",
    brand: "Weber",
    originalPrice: 549.00,
    dealPrice: 349.00,
    retailer: "Weber Direct / Ace Hardware",
    retailerUrl: "https://www.weber.com/US/en/smokers/smokey-mountain-series/smokey-mountain-cooker-smoker-22",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Massive 726 square inches of smoking space across two plated steel cooking grates",
      "Porcelain-enameled bowl, lid, and center section retain heat and will not rust",
      "High-capacity porcelain water pan adds steam moisture to keep meats juicy for 14 hours",
      "Built-in lid thermometer and silicone temperature grommet for meat probe entry",
      "Rust-resistant aluminum fuel door makes adding charcoal and wood chunks effortless"
    ],
    specs: {
      "Cooking Area": "726 sq inches (Two 22.5\" grates)",
      "Dimensions": "48.5\" H x 23\" W x 24\" D",
      "Weight": "68 lbs",
      "Dampers": "4 Rust-resistant aluminum dampers",
      "Cover": "Heavy-duty premium vinyl cover included"
    },
    stockStatus: "in_stock",
    stockQuantity: 7,
    isHot: false,
    opportunityScore: 85
  },
  {
    title: "Marshall Acton III Bluetooth Wireless Speaker (Black & Brass)",
    slug: "marshall-acton-iii-bluetooth-speaker",
    description: "Compact size with immense room-filling sound. Re-engineered dual outward-angled tweeters and updated waveguides with Bluetooth 5.2 and 3.5mm analog input.",
    category: "Audio & Wearables",
    brand: "Marshall",
    originalPrice: 279.99,
    dealPrice: 179.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/marshall-acton-iii",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "Dynamic sound in a compact bookshelf footprint",
      "Class D amplifiers: one 30W for woofer and two 15W for tweeters",
      "Signature Marshall vintage script logo, brass knobs, and textured vinyl casing",
      "Bluetooth 5.2 connectivity with range up to 30 feet",
      "Eco-conscious design crafted with 70% post-consumer recycled plastics"
    ],
    specs: {
      "Power": "60 Watts total",
      "Frequency Range": "45 - 20,000 Hz",
      "Dimensions": "10.24 x 6.69 x 5.91 inches",
      "Weight": "6.28 lbs (2.85 kg)",
      "Inputs": "Bluetooth 5.2, 3.5mm Aux"
    },
    stockStatus: "in_stock",
    stockQuantity: 20,
    isHot: false,
    opportunityScore: 84
  },
  {
    title: "Yeti Hopper Flip 18 Portable Soft Cooler (Camp Green)",
    slug: "yeti-hopper-flip-18-soft-cooler",
    description: "Tough-as-nails soft cooler designed for all-day field trips. ColdCell closed-cell rubber foam insulation, HydroLok 100% leakproof zipper, and DryHide puncture-resistant shell.",
    category: "Outdoor & Fitness",
    brand: "Yeti",
    originalPrice: 300.00,
    dealPrice: 195.00,
    retailer: "REI",
    retailerUrl: "https://www.rei.com/product/yeti-hopper-flip-18",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80",
    additionalImages: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80"
    ],
    features: [
      "HydroLok Zipper creates a 100% waterproof and airtight seal like survival suits",
      "DryHide Shell high-density fabric resists punctures, mildew, and UV rays",
      "ColdCell closed-cell rubber foam offers superior ice retention compared to ordinary soft coolers",
      "Wide-mouth flip lid opening makes loading and unloading drinks effortless",
      "HitchPoint Grid loops allow attachment of bottle openers and sidekick dry bags"
    ],
    specs: {
      "Capacity": "20 Cans (using 2:1 ice-to-can ratio) or 24 lbs of ice",
      "Dimensions": "13.0\" H x 17.7\" W x 11.5\" D",
      "Empty Weight": "5.1 lbs",
      "Shoulder Strap": "Ergonomic detachable EVA shoulder strap",
      "Warranty": "3-Year Limited Warranty"
    },
    stockStatus: "in_stock",
    stockQuantity: 15,
    isHot: false,
    opportunityScore: 85
  },
  {
    title: "Canon EOS R6 Mark II Mirrorless Camera Body",
    slug: "canon-eos-r6-mark-ii-mirrorless-camera",
    description: "High-speed continuous shooting up to 40 fps electronic shutter, 24.2MP full-frame CMOS sensor, 6K oversampled 4K 60p full-width video recording, and Dual Pixel CMOS AF II with deep learning subject detection.",
    category: "Cameras & Drones",
    brand: "Canon",
    originalPrice: 2499.00,
    dealPrice: 1649.00,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/canon-eos-r6-ii",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80"],
    features: [
      "24.2MP Full-Frame CMOS Sensor paired with DIGIC X Image Processor",
      "Blazing continuous shooting up to 40 fps with electronic shutter",
      "6K oversampled uncropped 4K 60p movie recording with Canon Log 3",
      "In-Body Image Stabilizer delivers up to 8.0 stops of shake correction",
      "Advanced Dual Pixel CMOS AF II tracks aircraft, trains, horses, cats, and dogs"
    ],
    specs: {
      "Sensor": "24.2MP Full-Frame CMOS",
      "Video": "4K 60p 10-Bit 4:2:2",
      "Stabilization": "8-Stop In-Body 5-Axis IS",
      "Card Slots": "Dual SD UHS-II Slots",
      "Weight": "1.49 lbs with battery and card"
    },
    stockStatus: "in_stock",
    stockQuantity: 8,
    isHot: false,
    opportunityScore: 88
  },
  {
    title: "KitchenAid 13-Cup Food Processor with ExactSlice System (Onyx Black)",
    slug: "kitchenaid-13-cup-food-processor-exactslice",
    description: "Slice, shred, chop, and knead all in one versatile machine. Features externally adjustable ExactSlice lever that goes from thick to thin slicing with a slide of the lever on the front of the unit.",
    category: "Home & Appliances",
    brand: "KitchenAid",
    originalPrice: 219.99,
    dealPrice: 145.00,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/kitchenaid-13cup-food-processor",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Externally adjustable ExactSlice system lets you select slice thickness on the fly",
      "3-in-1 Ultra Wide Mouth Feed Tube accommodates whole tomatoes and cucumbers",
      "All-in-one storage caddy fits directly into the bowl for compact cabinet storage",
      "Includes multipurpose blade, dough blade, reversible shredding disc, and slice disc",
      "Snap and go bowl assembly with latch-free lid lock"
    ],
    specs: {
      "Capacity": "13 Cups (3.1L)",
      "Speeds": "High, Low, Pulse",
      "Dishwasher Safe": "All removable parts and bowl",
      "Motor": "500 Watts High-Torque",
      "Color": "Onyx Black High Gloss"
    },
    stockStatus: "in_stock",
    stockQuantity: 17,
    isHot: false,
    opportunityScore: 83
  },
  {
    title: "DJI Osmo Pocket 3 Creator Combo 1-Inch CMOS 4K/120fps Vlog Gimbal",
    slug: "dji-osmo-pocket-3-creator-combo",
    description: "Pocket-sized 3-axis mechanical gimbal with 1-inch CMOS sensor, 2-inch rotatable OLED touchscreen, full-pixel fast focusing, and DJI Mic 2 transmitter for studio broadcast sound.",
    category: "Cameras & Drones",
    brand: "DJI",
    originalPrice: 669.00,
    dealPrice: 449.00,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/dji-osmo-pocket-3-creator-combo",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Large 1-Inch CMOS Sensor captures clear shadow details and brilliant highlights",
      "2-Inch rotatable OLED touch display rotates horizontally or vertically to trigger recording",
      "3-Axis Mechanical Gimbal Stabilization for buttery smooth handheld movement",
      "ActiveTrack 6.0 with Face Auto-Detect and Dynamic Framing",
      "Includes DJI Mic 2 Transmitter with magnetic clip and 14-hour internal 32-bit float audio"
    ],
    specs: {
      "Sensor": "1-Inch CMOS 4K @ 120fps",
      "Color": "10-Bit D-Log M & HLG",
      "Battery": "Charges to 80% in 16 mins (166 mins total run time)",
      "Audio": "3-Mic Array + Wireless Mic 2 support",
      "Weight": "179 grams ultra-compact"
    },
    stockStatus: "in_stock",
    stockQuantity: 11,
    isHot: true,
    opportunityScore: 94
  },
  {
    title: "Bose QuietComfort Wireless Noise Cancelling Earbuds II (Triple Black)",
    slug: "bose-quietcomfort-earbuds-ii",
    description: "Personalized noise cancellation and sound performance shaped to fit your ear canals. CustomTune technology automatically adapts audio whenever you put them in.",
    category: "Audio & Wearables",
    brand: "Bose",
    originalPrice: 299.00,
    dealPrice: 199.00,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0B4PS61K9",
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"],
    features: [
      "CustomTune technology calibrates noise cancellation and sound frequency to your ear shape",
      "World's best noise cancellation in a true wireless in-ear design",
      "Quiet Mode blocks distractions; Aware Mode allows seamless conversation",
      "Includes Bose Fit Kit with 3 pairs of ear tips and 3 pairs of stability bands",
      "Up to 6 hours listening on one charge, plus 18 extra hours in charging case"
    ],
    specs: {
      "Battery": "6 Hours earbuds + 18 hours case (24h total)",
      "Water Resistance": "IPX4 sweat and splash resistant",
      "Touch Controls": "Swipe for volume, tap for track/ANC",
      "Bluetooth": "5.3 (30 ft range)",
      "Case": "USB-C Quick Charging Case"
    },
    stockStatus: "in_stock",
    stockQuantity: 23,
    isHot: false,
    opportunityScore: 86
  },
  {
    title: "LG C3 55-Inch OLED 4K Smart TV with α9 Gen6 Processor (OLED55C3PUA)",
    slug: "lg-c3-55-inch-oled-4k-smart-tv",
    description: "The sweet spot of OLED TVs. Perfect blacks, infinite contrast, 120Hz refresh rate, 4 HDMI 2.1 ports, and webOS 23 smart hub with all major streaming apps.",
    category: "TV & Home Theater",
    brand: "LG",
    originalPrice: 1499.99,
    dealPrice: 999.99,
    retailer: "Costco",
    retailerUrl: "https://www.costco.com/lg-55-c3-oled",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=800&auto=format&fit=crop&q=80"],
    features: [
      "8.3 million self-lit pixels provide absolute dark blacks and rich colors",
      "Brightness Booster boosts luminance by up to 20% over standard OLEDs",
      "4 full-bandwidth 48Gbps HDMI 2.1 ports supporting 4K 120Hz gaming",
      "Dolby Vision, Dolby Atmos, and Filmmaker Mode for authentic cinema at home",
      "Magic Remote with pointer navigation and voice search"
    ],
    specs: {
      "Screen Size": "55 Inches",
      "Panel": "OLED evo 4K (3840 x 2160)",
      "Refresh Rate": "120Hz Native VRR / FreeSync / G-Sync",
      "Smart OS": "webOS 23 with ThinQ AI",
      "Weight": "31.1 lbs with stand"
    },
    stockStatus: "in_stock",
    stockQuantity: 10,
    isHot: false,
    opportunityScore: 87
  },
  {
    title: "Ember Temperature Control Smart Mug 2 (14 oz, Metallic Copper)",
    slug: "ember-temperature-control-smart-mug-2-copper",
    description: "Keep your coffee or tea at your exact preferred drinking temperature (between 120°F - 145°F) for up to 80 minutes on a single charge, or all day on the redesigned coaster.",
    category: "Home & Appliances",
    brand: "Ember",
    originalPrice: 179.95,
    dealPrice: 119.95,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/ember-mug-2-14oz",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Smart temperature sensor keeps beverages between 120°F and 145°F",
      "Built-in battery maintains drink temp for 80 minutes on the move",
      "Included Charging Coaster delivers all-day temperature maintenance on your desk",
      "Pairs with the Ember App to set presets, track caffeine intake, and customize LED color",
      "Auto-sleep sensor intelligently senses when mug is empty or inactive"
    ],
    specs: {
      "Capacity": "14 fl oz (414 ml)",
      "Battery Life": "80 Mins (All Day on Coaster)",
      "Temp Range": "120°F - 145°F (50°C - 62.5°C)",
      "Finish": "Metallic Copper Stainless Steel",
      "Water Resistance": "IPX7 Submersible up to 1 meter"
    },
    stockStatus: "in_stock",
    stockQuantity: 28,
    isHot: false,
    opportunityScore: 82
  },
  {
    title: "Sony SRS-RA5000 360 Reality Audio Premium Wireless Speaker",
    slug: "sony-srs-ra5000-360-reality-audio-speaker",
    description: "Room-filling ambient sound with 7 precision drivers including 3 upward-firing speakers, 3 mid drivers, and an integrated subwoofer. Sound Calibration automatically adjusts acoustics to room shape.",
    category: "Audio & Wearables",
    brand: "Sony",
    originalPrice: 799.99,
    dealPrice: 539.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/sony-srs-ra5000",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80"],
    features: [
      "360 Reality Audio creates a sphere of sound that wraps you in your music",
      "Immersive Audio Enhancement algorithms transform 2-channel stereo tracks into ambient sound",
      "Auto Volume balances level between different tracks so volume stays consistent",
      "Built-in Chromecast, Spotify Connect, and Bluetooth with LDAC high-res support",
      "Unique sculptural black and copper geometric architectural chassis"
    ],
    specs: {
      "Drivers": "7 (3 Upward, 3 Mid, 1 Subwoofer)",
      "Audio Hi-Res": "Hi-Res Audio Certified & DSEE HX",
      "Dimensions": "9.3\" W x 12.9\" H x 8.9\" D",
      "Weight": "10.8 lbs",
      "Inputs": "Wi-Fi, Bluetooth 4.2, 3.5mm Aux"
    },
    stockStatus: "in_stock",
    stockQuantity: 8,
    isHot: false,
    opportunityScore: 84
  },
  {
    title: "Arc'teryx Alpha SV Hard-Shell Waterproof Gore-Tex Pro Jacket (Black Sapphire)",
    slug: "arcteryx-alpha-sv-waterproof-jacket-black-sapphire",
    description: "The pinnacle of severe weather alpine protection. Most durable GORE-TEX PRO Most Rugged technology with 100D recycled face fabric and embedded RECCO avalanche reflector.",
    category: "Fashion & Travel",
    brand: "Arc'teryx",
    originalPrice: 900.00,
    dealPrice: 610.00,
    retailer: "REI",
    retailerUrl: "https://www.rei.com/product/arcteryx-alpha-sv",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"],
    features: [
      "N100d Most Rugged 3L GORE-TEX PRO fabric offers unmatched tear and abrasion resistance",
      "StormHood is helmet compatible and adjusts with Cohaesive cord lock system",
      "WaterTight pit zippers provide rapid ventilation during heavy ascents",
      "Embedded RECCO reflector aids search and rescue in emergency situations",
      "Articulated patterning for total freedom of motion without hem lift"
    ],
    specs: {
      "Material": "N100d Most Rugged 3L GORE-TEX PRO",
      "Weight": "485g / 1 lb 1.1 oz",
      "Waterproof Rating": "28,000 mm Hydrostatic Head",
      "Pockets": "Two external crossover chest pockets, internal dump pocket",
      "Fit": "Regular fit with room for thermal layers"
    },
    stockStatus: "in_stock",
    stockQuantity: 12,
    isHot: false,
    opportunityScore: 86
  },
  {
    title: "Samsung Galaxy Tab S9 Ultra (14.6\" Dynamic AMOLED 2X, 512GB, S Pen Included)",
    slug: "samsung-galaxy-tab-s9-ultra-512gb",
    description: "Massive 14.6-inch Dynamic AMOLED 2X display with 120Hz refresh rate. IP68 water and dust resistance on tablet and S Pen. Powered by Snapdragon 8 Gen 2 with Vision Booster for outdoor viewing.",
    category: "Computing & Laptops",
    brand: "Samsung",
    originalPrice: 1319.99,
    dealPrice: 899.99,
    retailer: "Samsung Official",
    retailerUrl: "https://www.samsung.com/us/tablets/galaxy-tab-s9/buy",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Monumental 14.6-inch Dynamic AMOLED 2X screen with HDR10+ and 120Hz",
      "Armor Aluminum metal frame and IP68 water & dust resistance rating",
      "Included low-latency S Pen magnetically attaches and bi-directionally charges",
      "Samsung DeX mode provides full PC desktop experience with floating multi-windows",
      "Quad AKG speakers with Dolby Atmos support"
    ],
    specs: {
      "Screen": "14.6\" Dynamic AMOLED 2X (2960 x 1848)",
      "Processor": "Snapdragon 8 Gen 2 Leading Version",
      "RAM & Storage": "12GB RAM / 512GB Storage (MicroSD up to 1TB)",
      "Battery": "11,200mAh with 45W Fast Charging",
      "Weight": "732 grams"
    },
    stockStatus: "in_stock",
    stockQuantity: 9,
    isHot: false,
    opportunityScore: 87
  },
  {
    title: "Garmin epix Pro (Gen 2) Sapphire Edition 51mm High-Performance GPS Watch",
    slug: "garmin-epix-pro-gen-2-sapphire-51mm",
    description: "Stunning 1.4-inch AMOLED display paired with weeks of battery life in smartwatch mode. Built-in LED flashlight, titanium bezel, scratch-resistant sapphire crystal, and Hill Score metric.",
    category: "Audio & Wearables",
    brand: "Garmin",
    originalPrice: 1099.99,
    dealPrice: 749.99,
    retailer: "REI",
    retailerUrl: "https://www.rei.com/product/garmin-epix-pro-51mm",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Ultra-bright 1.4\" AMOLED touchscreen display with crisp readability in sunlight",
      "Up to 31 days of battery life in smartwatch mode (11 days always-on)",
      "Multi-LED flashlight built into top bezel with white and red night modes",
      "32GB storage for TopoActive maps, golf courses, ski resorts, and offline Spotify",
      "Gen 5 optical heart rate sensor with ECG app approval and Pulse Ox"
    ],
    specs: {
      "Size": "51mm Case Diameter with Carbon Grey DLC Titanium Bezel",
      "Display": "1.4\" AMOLED 454 x 454 Pixels",
      "Glass": "Scratch-Resistant Sapphire Crystal",
      "Water Resistance": "10 ATM (100 Meters)",
      "Weight": "88 grams"
    },
    stockStatus: "in_stock",
    stockQuantity: 10,
    isHot: false,
    opportunityScore: 88
  },
  {
    title: "Brevile Smart Oven Air Fryer Pro (Brushed Stainless Steel)",
    slug: "breville-smart-oven-air-fryer-pro",
    description: "Element iQ system with 6 independent quartz heating elements for smart heat distribution. 13 cooking functions from air fry and dehydrate to slow cooking and roasting large 14-lb turkeys.",
    category: "Home & Appliances",
    brand: "Breville",
    originalPrice: 399.95,
    dealPrice: 279.95,
    retailer: "Williams Sonoma",
    retailerUrl: "https://www.williams-sonoma.com/products/breville-smart-oven-air-fryer-pro",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Element iQ system moves power to where and when it's needed for ideal cook results",
      "Super Convection fan speeds cooking time by up to 30% with intense airflow",
      "13 pre-set functions: Toast, Bagel, Broil, Bake, Roast, Warm, Pizza, Proof, Air Fry, Reheat, Cookies, Slow Cook, Dehydrate",
      "Extra large 1 cu ft capacity holds 9 slices of bread or a 14 lb whole turkey",
      "Integrated oven light automatically turns on when door is opened or cycle ends"
    ],
    specs: {
      "Power": "1800 Watts",
      "Capacity": "1 cu ft (Holds 12\"x12\" Dutch oven)",
      "Dimensions": "21.5\" W x 17.5\" D x 12.7\" H",
      "Heating Elements": "6 Independent Quartz Elements",
      "Accessories": "Air fry basket, roasting pan, 2 pizza racks"
    },
    stockStatus: "in_stock",
    stockQuantity: 19,
    isHot: false,
    opportunityScore: 82
  },
  {
    title: "DJI Avata 2 Fly More Combo (Three Batteries & FPV Goggles 3)",
    slug: "dji-avata-2-fpv-drone-fly-more-combo",
    description: "The thrilling first-person-view FPV drone. Features upgraded 1/1.3-inch image sensor, 4K/60fps HDR ultra-wide 155° FOV, one-push acrobatic flips and rolls, and integrated propeller guards.",
    category: "Cameras & Drones",
    brand: "DJI",
    originalPrice: 1199.00,
    dealPrice: 849.00,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/dji-avata-2",
    imageUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Intuitive RC Motion 3 joystick controller allows one-hand stunt flying",
      "DJI Goggles 3 with micro-OLED high-def screens and Real View PiP passthrough",
      "1/1.3-inch CMOS sensor with 4K/60fps HDR and 10-bit D-Log M color profile",
      "Ultra-wide 155° field of view for high-speed low-altitude immersive flights",
      "Turtle Mode automatically flips drone upright if it lands upside down"
    ],
    specs: {
      "Flight Time": "Up to 23 minutes per battery (3 included in combo)",
      "Transmission": "DJI O4 up to 13km low latency video",
      "Safety": "Built-in Propeller Guard & Downward/Backward Visual Positioning",
      "Internal Storage": "46GB onboard memory",
      "Weight": "377 grams"
    },
    stockStatus: "in_stock",
    stockQuantity: 10,
    isHot: false,
    opportunityScore: 86
  },
  {
    title: "Rolex Explorer II 42mm 'Polar' White Dial (Oystersteel - Certified Pre-Owned)",
    slug: "rolex-explorer-ii-42mm-polar-white-dial",
    description: "Certified Authentic polar dial legend. Fixed 24-hour bezel, arrow-shaped orange 24-hour GMT hand, Chromalight blue luminescence, and rugged Calibre 3285 movement with 70h power reserve.",
    category: "Fashion & Travel",
    brand: "Rolex",
    originalPrice: 12500.00,
    dealPrice: 8900.00,
    retailer: "WatchBox / Certified Chrono",
    retailerUrl: "https://www.thewatchbox.com/watches/rolex-explorer-ii",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Striking Polar white lacquer dial with black PVD coated hands and hour markers",
      "Fixed 24-hour graduated bezel and orange 24-hour hand to track second time zone",
      "Rolex Calibre 3285 automatic chronometer movement with Parachrom hairspring",
      "Oystersteel 904L bracelet with Easylink 5mm comfort extension link",
      "Complete with serialized authentication certificate and manufacturer travel case"
    ],
    specs: {
      "Reference": "226570 Polar",
      "Case Size": "42mm Oystersteel",
      "Movement": "Rolex Manufacture Calibre 3285 GMT",
      "Water Resistance": "100 Meters / 330 Feet",
      "Power Reserve": "Approximately 70 Hours"
    },
    stockStatus: "in_stock",
    stockQuantity: 3,
    isHot: true,
    opportunityScore: 94
  },
  {
    title: "Peloton Guide AI-Powered Strength Training Camera & Heart Rate Band",
    slug: "peloton-guide-ai-strength-training-camera",
    description: "Turns your TV into an interactive AI gym. Movement Tracker counts your reps, tracks your form, and recommends progressive weight increases to build strength with world-class Peloton coaches.",
    category: "Outdoor & Fitness",
    brand: "Peloton",
    originalPrice: 195.00,
    dealPrice: 139.00,
    retailer: "Peloton Official",
    retailerUrl: "https://www.onepeloton.com/guide",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Movement Tracker uses smart machine learning computer vision to count reps accurately",
      "Self Mode displays your form alongside instructors on your living room TV screen",
      "Body Activity heat map shows which muscle groups you've trained throughout the week",
      "Voice Control allows hands-free navigation during heavy weight sets",
      "Physical magnetic camera slide cover and electronic mic switch for total privacy"
    ],
    specs: {
      "Camera": "4K Ultra HD wide-angle camera sensor with 12MP capture",
      "Microphone": "Far-field 2-mic array with voice activation",
      "Connectivity": "Wi-Fi 802.11 a/b/g/n/ac, Bluetooth 5.0, HDMI 2.0",
      "Mounting": "TV mount clip or tabletop stand included",
      "Heart Rate Band": "Armband optical heart rate monitor included"
    },
    stockStatus: "in_stock",
    stockQuantity: 26,
    isHot: false,
    opportunityScore: 81
  },
  {
    title: "Le Creuset 6-Piece Cast Iron & Stoneware Cookware Set (Marseille Blue)",
    slug: "le-creuset-6-piece-cookware-set-marseille",
    description: "The quintessential French cooking ensemble. Includes 4.5 Qt Round Dutch Oven, 2.25 Qt Signature Saucepan, 10.25\" Signature Iron Handle Skillet, and 4 Qt Stoneware Heritage Covered Casserole Dish.",
    category: "Home & Appliances",
    brand: "Le Creuset",
    originalPrice: 750.00,
    dealPrice: 539.00,
    retailer: "Bloomingdale's",
    retailerUrl: "https://www.bloomingdales.com/shop/product/le-creuset-6-piece-set",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    additionalImages: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"],
    features: [
      "Signature enameled cast iron crafted in Fresnoy-le-Grand, France since 1925",
      "Superior heat retention and even heat distribution across gas, induction, and oven",
      "Vibrant shock-resistant enamel resists chipping, cracking, and interior staining",
      "Light sand interior allows easy monitoring of food browning to prevent burning",
      "Dishwasher safe with ergonomic loop handles designed for oven mitts"
    ],
    specs: {
      "Set Pieces": "6 Pieces (Dutch Oven + Lid, Saucepan + Lid, Skillet, Casserole + Lid)",
      "Material": "Enameled Cast Iron & High-density Stoneware",
      "Color": "Marseille Blue",
      "Oven Safe": "Up to 500°F (Cast iron pieces)",
      "Warranty": "Lifetime Limited Warranty"
    },
    stockStatus: "in_stock",
    stockQuantity: 7,
    isHot: false,
    opportunityScore: 85
  }
];
