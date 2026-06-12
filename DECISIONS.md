# Architectural Decisions & Retrospective

## The Big Decision: How to sync URL Params with Variant State

One choice I spent some time debating was how to implement the deep-linkable variant selections (size and color) on the product page. I had two main approaches:

1. **URL as the absolute source of truth**: Read directly from the search parameters (via React Router's `useSearchParams`) inside the component and use navigation updates to trigger variant changes.
2. **Dual-sync state (Local state + URL sync)**: Hold local state for `selectedColor` and `selectedSize`, initialize them from the URL query string on page load, and push updates back to the URL search params when a user changes their selection.

I went with **Option 2 (Dual-sync)**, mostly because of how the mock variant data is generated. Since the Fake Store API doesn't provide variants, I generate color/size options and stock limits on the fly using a seeded randomizer. 

If I had treated the URL as the absolute source of truth (Option 1), handling invalid URLs (like a user manually typing `size=XXL` or pointing to a sold-out variant) would get messy and require constant redirect logic. By using local state as the coordinator, I can run a quick validation check on mount. If the URL parameters are valid and in stock, we use them. If they are invalid or sold out, the state initializer computes a safe fallback (e.g., the first available color and size in stock), sets the state, and updates the URL. This guarantees that deep links never land a user on a broken page or a selection they can't actually purchase.

---

## What I'd do differently with more time

* **Dart Sass Refactoring**: Right now, the style system uses standard Sass `@import` rules and color adjusters. Dart Sass is deprecating these, and they throw a lot of warnings during building. With more time, I'd refactor these to use the modern `@use` syntax and `color.adjust` to keep the build logs clean.
* **API Caching**: Currently, every navigation between the product list and detail pages fires a new network request to `fakestoreapi.com`. I would introduce TanStack Query (React Query) to cache the catalog data and handle loading/error states cleaner than standard `useState` hooks.
* **Writing Tests**: I'd write unit tests for `CartContext` to verify that stock limits are properly enforced, and add Cypress or Playwright tests to test the slide-out behavior of the cart drawer.
