// brands array
const BRANDS = [
  "Aether Studio",
  "Solstice & Co.",
  "Nordic Craft",
  "Terra Loom",
  "Vanguard Apparel",
  "Minimalist Lab",
  "Arc & Hue",
  "Elysian Goods"
];

// colors code array pol
const COLORS_POOL = [
  { name: "Deep Obsidian", hex: "#1a1a1a" },
  { name: "Slate Mist", hex: "#7a8a99" },
  { name: "Terracotta", hex: "#c96f53" },
  { name: "Sage Green", hex: "#7f8e7b" },
  { name: "Warm Sand", hex: "#d9c3b0" },
  { name: "Indigo Dye", hex: "#2e4057" },
  { name: "Crimson Ember", hex: "#9e2a2b" },
  { name: "Raw Ochre", hex: "#ca8a04" }
];

const SIZES_POOL = ["XS", "S", "M", "L", "XL"];

// Deterministic random generator using product ID as seed
const createSeededRandom = (seed) => {
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

export const getEnrichedProduct = (product) => {
  if (!product) return null;

  const id = product.id;
  const rand = createSeededRandom(id);

  // Brand
  const brandIndex = Math.floor(rand() * BRANDS.length);
  const brand = BRANDS[brandIndex];

  // Original price (to display crossed-out sale price)
  const isOnSale = rand() > 0.3; // 70% of products are on sale
  const originalPrice = isOnSale ? parseFloat((product.price * (1.2 + rand() * 0.3)).toFixed(2)) : null;

  // Colors (2 to 4 colors per product)
  const numColors = 2 + Math.floor(rand() * 3); // 2, 3, or 4
  const colors = [];
  const selectedColorIndices = new Set();

  while (colors.length < numColors) {
    const idx = Math.floor(rand() * COLORS_POOL.length);
    if (!selectedColorIndices.has(idx)) {
      selectedColorIndices.add(idx);
      colors.push(COLORS_POOL[idx]);
    }
  }

  // Deterministic Stock for Color + Size combinations
  // We'll create a variant matrix color -> size -> stock info
  const variants = {};
  colors.forEach((color, colorIdx) => {
    variants[color.name] = {};
    SIZES_POOL.forEach((size, sizeIdx) => {
      // Seed dynamically based on color index, size index, and product ID
      const seedVal = id * 10 + colorIdx * 3 + sizeIdx * 7;
      const variantRand = createSeededRandom(seedVal)();

      let stock;
      if (variantRand > 0.85) {
        stock = 0; // Sold out (15% chance)
      } else if (variantRand > 0.6) {
        stock = 1 + Math.floor(variantRand * 2); // Low stock: 1 or 2 (25% chance)
      } else {
        stock = 3 + Math.floor(variantRand * 15); // Available: 3 to 17 (60% chance)
      }

      let status = "available";
      if (stock === 0) status = "sold-out";
      else if (stock <= 2) status = "low-stock";

      variants[color.name][size] = {
        stock,
        status
      };
    });
  });

  // Extra Gallery Images
  // We'll use the product's primary image and some high quality Unsplash placeholders
  // that fit the category of the product
  let categoryTheme = "apparel";
  if (product.category.includes("electronics")) {
    categoryTheme = "tech";
  } else if (product.category.includes("jewelery")) {
    categoryTheme = "jewelry";
  }

  const galleryImages = [product.image];

  // Add 2 extra category-related images
  const categoryImages = {
    apparel: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=60"
    ],
    tech: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=60"
    ],
    jewelry: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=60"
    ]
  };

  const pool = categoryImages[categoryTheme] || categoryImages.apparel;
  galleryImages.push(pool[(id) % pool.length]);
  galleryImages.push(pool[(id + 1) % pool.length]);

  return {
    ...product,
    brand,
    originalPrice,
    colors,
    sizes: SIZES_POOL,
    variants,
    images: galleryImages
  };
};
