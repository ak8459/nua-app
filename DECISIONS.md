# Architectural Decisions & Retrospective

## 1. Architectural Decision: Deep-Linkable Variant State Management

For the deep-linkable product detail page variant selections, we had two main approaches:

*   **Option A: URL search parameters as the absolute source of truth.** Read search params directly in components and dispatch router navigations (e.g. `setSearchParams`) to trigger selection changes.
*   **Option B: Dual-sync state (Selected variant local state synchronized with URL search parameters).** Keep local React state for `selectedColor` and `selectedSize`, initializing them from URL params on load, and write updates back to search params asynchronously on change.

### Why Option B was Chosen

Option B was selected because it guarantees a robust fallback strategy and high-fidelity UX. 
The Fake Store API contains no variant information. When generating deterministic mock color/size variants, we must account for variant availability and sold-out states. If we relied strictly on URL parameters as the sole state (Option A), handling edge cases (like a user manually editing the URL to an invalid color, or loading a size that is sold out for the primary color) becomes highly complex. 

Using Option B, on component mount we validate the URL parameters against the product's generated variant matrix. If valid, we apply them. If invalid (e.g. `size=XXL` or `size=S` when S is sold out), our state initializer computes a safe fallback (e.g., the first in-stock size for the active color) and updates both the local state and URL query string. This prevents bad deep links from breaking the UI and ensures the deep-linked variant always represents a purchasable configuration.

---

## 2. Future Improvements & What I'd Do Differently

Given additional time, I would focus on the following production-readiness enhancements:

1.  **Refactoring to Modern Sass Syntax:** Modern Dart Sass deprecates `@import` and global color adjustments (`lighten`, `darken`). I would refactor the styling system to use the modern `@use` and `@forward` modules alongside `color.adjust($color, $lightness: ...)` to guarantee forward compatibility and silence build deprecation warnings.
2.  **State Caching and API Layering:** Navigating between `/` and `/product/:id` triggers frequent refetches from `fakestoreapi.com`. I would introduce TanStack Query (React Query) to cache product queries and handle loading/error transitions declaratively.
3.  **Comprehensive Test Coverage:** Write unit tests for `CartContext` using Vitest to verify stock-limit enforcement, compound variant key generations, and localStorage sync. I would also add Cypress integration tests to validate the Cart Drawer backdrop closures.
4.  **Skeleton Loading Optimization:** Refine the Shimmer animations by generating exact image dimensions using CSS Aspect-Ratios, minimizing layout shift (CLS) when images load.
