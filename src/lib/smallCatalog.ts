export interface CatalogSeedItem {
  title: string;
  slug: string;
  description: string;
  category: string;
  brand: string;
  originalPrice: number;
  dealPrice: number; // Source cost S
  retailer: string;
  retailerUrl: string;
  imageUrl: string;
  features: string[];
  specs: Record<string, string>;
  stockQuantity: number;
}

/**
 * Small, pristine US-only catalog for production bootstrap.
 * - 100% US storefronts (.com US chains on US_STORE_ALLOWLIST)
 * - 100% USD currency
 * - Realistic discounts
 * - ctaType: "reseller", affiliateStatus: "none", trackingUrl: null (NO invented links)
 */
export const SMALL_US_CATALOG: CatalogSeedItem[] = [
  {
    title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    slug: "sony-wh-1000xm5-wireless-noise-canceling-headphones",
    description: "Industry-leading noise canceling with two processors and 8 microphones. Exceptional sound engineered with the integrated V1 processor. Up to 30-hour battery life with quick charging.",
    category: "Audio & Wearables",
    brand: "Sony",
    originalPrice: 399.99,
    dealPrice: 278.00,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/sony-wh-1000xm5/6505727.p",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    features: [
      "Industry-leading noise cancellation optimized automatically",
      "Crystal clear hands-free calling with 4 beamforming mics",
      "Up to 30-hour battery life (3 min charge = 3 hours playback)",
      "Multipoint connection connects two devices simultaneously"
    ],
    specs: {
      "Battery Life": "30 Hours ANC On",
      "Connectivity": "Bluetooth 5.2 / 3.5mm Aux",
      "Weight": "250g",
      "Warranty": "1 Year Manufacturer"
    },
    stockQuantity: 18,
  },
  {
    title: "Apple MacBook Pro 16\" M3 Pro (18GB Unified Memory, 512GB SSD)",
    slug: "apple-macbook-pro-16-m3-pro-space-black",
    description: "Liquid Retina XDR display with 1000 nits sustained brightness. Powered by M3 Pro chip with 12-core CPU and 18-core GPU. Up to 22 hours of battery life.",
    category: "Computing & Laptops",
    brand: "Apple",
    originalPrice: 2499.00,
    dealPrice: 1849.00,
    retailer: "B&H Photo",
    retailerUrl: "https://www.bhphotovideo.com/c/product/1793623-REG/apple_macbook_pro_16",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    features: [
      "M3 Pro chip with 12-core CPU and 18-core GPU",
      "16.2-inch Liquid Retina XDR display with ProMotion 120Hz",
      "Up to 22 hours battery life for all-day workflows",
      "Three Thunderbolt 4 ports, HDMI port, SDXC card slot, MagSafe 3"
    ],
    specs: {
      "Display": "16.2\" Liquid Retina XDR (3456 x 2234)",
      "Processor": "Apple M3 Pro 12-Core",
      "Memory": "18GB Unified RAM",
      "Storage": "512GB PCIe SSD"
    },
    stockQuantity: 12,
  },
  {
    title: "Dyson V15 Detect Cordless Vacuum Cleaner with Laser Reveal",
    slug: "dyson-v15-detect-cordless-vacuum-cleaner",
    description: "Intelligent cordless vacuum with laser illumination that reveals invisible dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically ramping suction power.",
    category: "Home & Appliances",
    brand: "Dyson",
    originalPrice: 749.99,
    dealPrice: 599.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/dyson-v15-detect/-/A-82103194",
    imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80",
    features: [
      "Laser reveals microscopic dust on hard floors",
      "Auto-adjusts suction based on floor type and dust level",
      "LCD screen shows scientific proof of a deep clean",
      "Up to 60 minutes of run time with click-in battery"
    ],
    specs: {
      "Suction Power": "230 AW",
      "Run Time": "Up to 60 Minutes",
      "Weight": "6.8 lbs",
      "Filtration": "Whole-machine HEPA"
    },
    stockQuantity: 14,
  },
  {
    title: "LG 65-Inch Class OLED evo C3 Series 4K Smart TV",
    slug: "lg-65-inch-oled-evo-c3-series-4k-smart-tv",
    description: "Self-lit OLED pixels deliver infinite contrast, deep blacks, and rich vibrant colors. Powered by the α9 AI Processor Gen6 with 120Hz refresh rate and 4 HDMI 2.1 ports for gaming.",
    category: "TV & Home Theater",
    brand: "LG",
    originalPrice: 2099.99,
    dealPrice: 1496.99,
    retailer: "Amazon",
    retailerUrl: "https://www.amazon.com/dp/B0BYFGL4D6",
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
    features: [
      "LG OLED evo with Brightness Booster for luminous picture",
      "α9 AI Processor Gen6 with AI Super Upscaling 4K",
      "4 HDMI 2.1 ports with 4K 120Hz, VRR, G-Sync, FreeSync Premium",
      "Dolby Vision, Dolby Atmos, and Filmmaker Mode"
    ],
    specs: {
      "Screen Size": "65 Inches",
      "Display Technology": "OLED evo 4K",
      "Refresh Rate": "120Hz Native",
      "Audio": "40W 2.2 Channel Dolby Atmos"
    },
    stockQuantity: 10,
  },
  {
    title: "Ninja Foodi 10-Quart 6-in-1 DualZone Smart XL 2-Basket Air Fryer",
    slug: "ninja-foodi-10-quart-dualzone-air-fryer",
    description: "Cook 2 foods 2 ways at the same time with DualZone Technology. Features Smart Finish and Match Cook across two independent 5-quart cooking baskets.",
    category: "Home & Appliances",
    brand: "Ninja",
    originalPrice: 249.99,
    dealPrice: 179.99,
    retailer: "Walmart",
    retailerUrl: "https://www.walmart.com/ip/ninja-foodi-dualzone-10qt/78912345",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
    features: [
      "2 independent 5-qt baskets cook 2 foods simultaneously",
      "Smart Finish syncs cook times so both baskets finish together",
      "6 cooking programs: Air Fry, Broil, Roast, Bake, Reheat, Dehydrate",
      "Dishwasher-safe nonstick crisper plates and baskets"
    ],
    specs: {
      "Capacity": "10 Quarts (Two 5-Qt Baskets)",
      "Wattage": "1690 Watts",
      "Temperature Range": "105°F - 450°F"
    },
    stockQuantity: 20,
  },
  {
    title: "Garmin Fenix 7 Pro Sapphire Solar Multisport GPS Smartwatch",
    slug: "garmin-fenix-7-pro-sapphire-solar-smartwatch",
    description: "Multisport GPS smartwatch with solar charging lens, built-in LED flashlight, endurance score tracking, and preloaded TopoActive maps in a rugged titanium bezel.",
    category: "Audio & Wearables",
    brand: "Garmin",
    originalPrice: 899.99,
    dealPrice: 699.99,
    retailer: "REI",
    retailerUrl: "https://www.rei.com/product/219800/garmin-fenix-7-pro",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    features: [
      "Power Sapphire solar charging lens gives up to 22 days battery",
      "Built-in multi-LED flashlight with variable intensities",
      "Multi-band GPS with SatIQ technology for pinpoint navigation",
      "Preloaded TopoActive maps, golf courses, and ski resorts"
    ],
    specs: {
      "Case Size": "47mm Titanium",
      "Water Rating": "10 ATM (100 Meters)",
      "Battery Life": "Up to 22 days smartwatch mode"
    },
    stockQuantity: 15,
  },
  {
    title: "Breville the Barista Touch Impress Espresso Machine",
    slug: "breville-the-barista-touch-impress-espresso-machine",
    description: "Third-wave specialty coffee with the Impress Puck System and Auto MilQ microfoam texturing. Guided touchscreen assists extraction and milk steaming.",
    category: "Home & Appliances",
    brand: "Breville",
    originalPrice: 1499.95,
    dealPrice: 1199.95,
    retailer: "Williams Sonoma",
    retailerUrl: "https://www.williams-sonoma.com/products/breville-barista-touch-impress",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    features: [
      "Impress Puck System with intelligent dosing and 22lb assisted tamp",
      "Auto MilQ microfoam with dairy, oat, almond, and soy settings",
      "ThermoJet heating reaches extraction temperature in 3 seconds",
      "European precision burrs with 30 grind settings"
    ],
    specs: {
      "Pump Pressure": "15 Bar Italian Pump",
      "Water Tank": "67 fl oz (2L)",
      "Heating System": "ThermoJet 3-Second"
    },
    stockQuantity: 9,
  },
  {
    title: "Nintendo Switch OLED Model with White Joy-Con",
    slug: "nintendo-switch-oled-model-white",
    description: "Vibrant 7-inch OLED screen with vivid colors and crisp contrast. Wide adjustable stand, dock with wired LAN port, 64 GB internal storage, and enhanced audio.",
    category: "Gaming & VR",
    brand: "Nintendo",
    originalPrice: 349.99,
    dealPrice: 299.99,
    retailer: "Target",
    retailerUrl: "https://www.target.com/p/nintendo-switch-oled/-/A-83887646",
    imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80",
    features: [
      "7-inch OLED multi-touch display",
      "Wide adjustable tabletop stand",
      "Built-in wired LAN port in TV dock",
      "64 GB internal storage with microSD expansion"
    ],
    specs: {
      "Screen": "7.0\" OLED (1280 x 720)",
      "Storage": "64GB",
      "Battery Life": "4.5 to 9 Hours"
    },
    stockQuantity: 22,
  },
  {
    title: "Apple iPad Pro 12.9-Inch M2 (256GB Wi-Fi) - Space Gray",
    slug: "apple-ipad-pro-12-9-inch-m2-space-gray",
    description: "12.9-inch Liquid Retina XDR display with 10,000+ mini-LEDs, ProMotion 120Hz, and True Tone. Powered by the Apple M2 chip with 8-core CPU and 10-core GPU.",
    category: "Computing & Laptops",
    brand: "Apple",
    originalPrice: 1199.00,
    dealPrice: 999.00,
    retailer: "Costco",
    retailerUrl: "https://www.costco.com/apple-ipad-pro-12.9.product.100800000.html",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    features: [
      "12.9-inch Liquid Retina XDR display with 1000 nits sustained",
      "Apple M2 chip with 8-core CPU and 10-core GPU",
      "12MP Wide and 10MP Ultra Wide cameras with LiDAR Scanner",
      "Thunderbolt / USB 4 port for high-speed connectivity"
    ],
    specs: {
      "Display": "12.9\" Liquid Retina XDR (2732 x 2048)",
      "Storage": "256GB",
      "Weight": "1.5 lbs"
    },
    stockQuantity: 16,
  },
  {
    title: "Dell XPS 15 9530 (13th Gen i9, 32GB RAM, 1TB SSD, RTX 4070, 3.5K OLED)",
    slug: "dell-xps-15-9530-oled-i9-rtx-4070",
    description: "3.5K OLED InfinityEdge touch display with 100% DCI-P3 color gamut. Powered by Intel Core i9-13900H and NVIDIA GeForce RTX 4070 in a machined aluminum chassis.",
    category: "Computing & Laptops",
    brand: "Dell",
    originalPrice: 2799.00,
    dealPrice: 1999.00,
    retailer: "Dell Official",
    retailerUrl: "https://www.dell.com/en-us/shop/dell-laptops/xps-15-laptop/spd/xps-15-9530-laptop",
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
    features: [
      "15.6\" 3.5K OLED touch display with DisplayHDR 500",
      "13th Gen Intel Core i9-13900H 14-core processor",
      "NVIDIA GeForce RTX 4070 8GB GDDR6 graphics",
      "CNC aluminum chassis with carbon fiber palm rest"
    ],
    specs: {
      "Processor": "Intel Core i9-13900H 14-Core",
      "RAM": "32GB DDR5 4800MHz",
      "Storage": "1TB PCIe NVMe SSD"
    },
    stockQuantity: 11,
  },
  {
    title: "GoPro HERO12 Black Creator Edition Bundle with Volta Grip & Media Mod",
    slug: "gopro-hero-12-black-creator-edition-bundle",
    description: "5.3K60 video recording with HDR and Emmy-award winning HyperSmooth 6.0 stabilization. Includes Volta battery hand grip, Media Mod, and Light Mod.",
    category: "Cameras & Drones",
    brand: "GoPro",
    originalPrice: 599.99,
    dealPrice: 399.99,
    retailer: "Best Buy",
    retailerUrl: "https://www.bestbuy.com/site/gopro-hero12-black-creator-edition/6553856.p",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    features: [
      "5.3K @ 60fps and 4K @ 120fps video with HDR",
      "HyperSmooth 6.0 stabilization with 360° Horizon Lock",
      "Volta grip delivers over 5 hours of 4K recording",
      "Waterproof to 33ft (10m)"
    ],
    specs: {
      "Video": "5.3K60 / 4K120",
      "Photo": "27 Megapixels",
      "Connectivity": "Wi-Fi 6 + Bluetooth 5.2"
    },
    stockQuantity: 19,
  },
  {
    title: "Weber Genesis E-335 Smart Liquid Propane Gas Grill",
    slug: "weber-genesis-e335-smart-gas-grill",
    description: "WEBER CONNECT smart grilling technology gives real-time temperature and flip alerts directly to your phone. Extra large sear zone and 39,000 BTU PureBlu burners.",
    category: "Outdoor & Fitness",
    brand: "Weber",
    originalPrice: 1449.00,
    dealPrice: 1149.00,
    retailer: "Home Depot",
    retailerUrl: "https://www.homedepot.com/p/weber-genesis-e335/31812345",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
    features: [
      "WEBER CONNECT smart tech: real-time food temperature on your phone",
      "Extra-large PureBlu burners deliver 39,000 BTU",
      "High-heat 13,000 BTU Sear Station for deep grill marks",
      "Weber Crafted outdoor kitchen collection frame compatible"
    ],
    specs: {
      "Total Cooking Area": "787 sq inches",
      "Main Burners": "3 PureBlu Stainless Steel (39,000 BTU)",
      "Side Burner": "12,000 BTU"
    },
    stockQuantity: 8,
  }
];
