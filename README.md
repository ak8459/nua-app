# Nua E-Commerce Web App

A clean, responsive e-commerce web application built using React, Vite, and SCSS. It pulls product data from the Fake Store API and dynamically enriches it with custom color and size variants, stock limits, and secondary images to simulate a real-world shopping experience.

---

## 🚀 How to Run the App

First, make sure you have **Node.js** installed on your system. 

1. Install all dependencies:
   ```bash
   # If you use Bun (recommended)
   bun install

   # If you prefer npm
   npm install

   # If you prefer Yarn
   yarn install
   ```

2. Start the local development server:
   ```bash
   bun run dev   # or: npm run dev
   ```
   Open your browser to the local URL (usually `http://localhost:5173`).

3. To build and preview the production package:
   ```bash
   bun run build
   bun run preview   # or: npm run build / npm run preview
   ```

---

## 🛠️ How it Works & Technical Choices

### 1. Handling URL Parameters and Variant Fallbacks
A key requirement was keeping product variant selections (like color and size) deep-linkable. If you share a URL like `?color=Sage+Green&size=M`, the detail page should load that exact combination.

However, since the Fake Store API doesn't return colors or sizes, I had to generate them on the client. This introduces an edge case: **what if a user manually edits the URL query string to select a color/size that is out of stock, or doesn't exist?**

Instead of breaking the page or showing a generic "Out of Stock" screen, I set up a dual-synchronization strategy:
- The component reads the URL parameters on mount and validates them against the product's generated variant matrix.
- If the URL contains an invalid combination (or a size that is sold out for the selected color), it immediately calculates a safe fallback (the first available in-stock option).
- It then sets the local React state to this fallback and silently updates the URL query string to match. This ensures that sharing a link always lands another user on a purchasable product state.

### 2. Seed-Based Mock Variants
Because there's no backend database, keeping variants, brand names, and image galleries consistent across page navigation was a challenge. If they randomized on every page load, a product in your cart might show up as a different color or brand later.

To solve this, I wrote a seed-based pseudo-random generator in `src/utils/mockGenerator.js` using the product's ID as the seed. This mathematical trick ensures that a product (like ID 5) will **always** render with the exact same brand name, the same colors, the same stock constraints, and the same category-themed gallery images every single time, without needing a database.

### 3. Styles
The styling is written in vanilla SCSS using CSS Modules to keep classes scoped and prevent collisions. Global variables (`src/styles/_variables.scss`) house the color scheme (an indigo and warm amber theme), custom typography, fluid spacing, and transitions.

---

## ⚖️ Trade-offs & Next Steps

If I had more time, here are the main things I would address or change:

* **Sass `@import` Warnings**: The stylesheets currently use global `@import` rules. Modern versions of Sass deprecate this in favor of `@use` and `@forward` modules. Refactoring the imports is on my checklist to get rid of terminal build warnings.
* **No API Caching**: Navigating back and forth between the product list and detail pages sends fresh fetch requests to the API. In a real-world app, I would implement **React Query (TanStack Query)** to cache API responses and prevent unnecessary network requests.
* **Client-Side Stock Checks**: Since we have no database, stock limits are validated in `CartContext`. While this works perfectly to restrict a single user from buying more than what is available, in production, stock validation would need to run server-side to prevent concurrency conflicts.
