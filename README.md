# Nua E-Commerce Web App

A premium, interactive e-commerce single-page application built using React, Vite, and SCSS modules. The app integrates with the Fake Store API and enhances it with custom-generated, deterministic product variants (size, color, and stock) to provide a high-fidelity retail experience.

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites

Ensure you have one of the following package managers installed:
- **Bun** (recommended)
- **Node.js** (v18+) and **npm** or **Yarn**

### Installation

1. Clone or download the repository.
2. Open your terminal in the project root directory (`Nua-app`).
3. Install the dependencies:

   ```bash
   # Using Bun
   bun install

   # Or using npm
   npm install

   # Or using Yarn
   yarn install
   ```

### Running the Development Server

Start the local development server with hot module replacement (HMR):

```bash
# Using Bun
bun run dev

# Or using npm
npm run dev

# Or using Yarn
yarn run dev
```

The server will spin up, usually at `http://localhost:5173`. Open this URL in your web browser.

### Building for Production

To create an optimized production build in the `dist` folder:

```bash
# Using Bun
bun run build

# Or using npm
npm run build
```

### Previewing the Production Build

To preview the built production app locally:

```bash
# Using Bun
bun run preview

# Or using npm
npm run preview
```

---

## 🎨 Features & Architecture

- **Interactive Product Catalog**: Supports searching, filtering by category, and sorting (by popularity, price, rating) with responsive layout grids.
- **Deep-Linkable Product Detail Page**: Selecting variant combinations (colors and sizes) automatically synchronizes with the URL search parameters (`?color=...&size=...`), allowing users to share exact product configurations.
- **Slide-out Cart Drawer**: A persistent shopping cart synchronized with `localStorage` featuring stock limit validation, real-time total updates, and quantity controls.
- **Mock Variant Generation Layer**: Automatically enriches standard Fake Store API data with deterministic, seed-based product variants, pricing adjustments, custom brand names, and Unsplash-powered image galleries.

---

## 🧠 Design Decisions

### 1. Dual-Sync State Management for Product Variants
* **Context**: The `ProductDetailPage` must support direct links to specific product variant configurations (e.g., `?color=Sage+Green&size=M`).
* **Decision**: We implemented a dual-synchronization strategy (local state synchronized with URL search parameters) instead of relying strictly on URL search parameters as the absolute source of truth.
* **Why**: The Fake Store API does not provide color, size, or variant stock data. Since variants are generated client-side, we must validate requested URL variant params against the product's generated variant matrix on mount. If a user enters an invalid color or size (e.g., a size that is sold out for that color), the state initializer corrects the selection to the first available fallback option and updates the query parameters. This keeps the URL always pointing to a purchasable configuration.

### 2. Seed-Based Deterministic Mock Data Generator
* **Context**: We need to expand standard API data with complex, consistent product variants across listing, details, and cart views.
* **Decision**: We created a math-based seeded random generator in `src/utils/mockGenerator.js` using the product's ID as the seed.
* **Why**: This ensures that a product (e.g., ID 3) will always resolve to the exact same brand ("Solstice & Co."), the same colors, same size stock limits, and same secondary images on every page load and across all separate components, without needing a persistent back-end database.

### 3. Styled Design System via SCSS Modules
* **Context**: Maintaining a premium, visual-heavy design across components.
* **Decision**: Built a central design token system in `src/styles/_variables.scss` and `src/styles/_mixins.scss` with modular page-level SCSS stylesheets.
* **Why**: Utilizing variables for HSL color scales (Indigo/Amber), Outfit typography, fluid spacing, shadow systems, and glassmorphic blurs ensures visual consistency. Using CSS modules avoids global namespace collisions.

---

## ⚖️ Known Trade-offs & Future Enhancements

### 1. Auto-Correcting Deep Links (User-Initiated URL Edits)
* **Trade-off**: If a user types or pastes a deep link containing an invalid or sold-out variant combination, the page will automatically correct the URL search parameters to a valid fallback variant. While this guarantees the page is never in a broken state, it might surprise a user who expected their manual input to persist.
* **Alternative**: Show an "Out of Stock" or "Invalid Variant" banner instead of auto-correcting, but that creates additional visual paths and friction.

### 2. Client-Side Stock Limit Enforcement
* **Trade-off**: The shopping cart prevents users from adding items beyond their variant stock limit. This logic relies purely on client-side state (`CartContext`). 
* **Impact**: In a multi-user production environment, client-side validation is susceptible to race conditions and must be mirrored on the API/database layer.

### 3. Sass `@import` Deprecation
* **Trade-off**: We used standard Sass `@import` syntax in some stylesheet imports. Modern Dart Sass deprecates global imports in favor of `@use` and `@forward` modules.
* **Remedy**: We plan to refactor the style configuration files to Dart Sass modern imports to silence console build warnings.

### 4. Fetching without API Cache Layer
* **Trade-off**: Direct navigation triggers API calls to `fakestoreapi.com` on every page load.
* **Remedy**: Introducing TanStack Query (React Query) is a key next step to cache fetched products and implement loading skeleton shimmers.
