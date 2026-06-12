import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetailPage from './ProductDetailPage';
import { useCart } from '../../context/CartContext';

// Mock CartContext
const mockAddToCart = vi.fn();
vi.mock('../../context/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart
  })
}));

// Mock the mock generator to have fixed deterministic variants for testing
vi.mock('../../utils/mockGenerator', () => ({
  getEnrichedProduct: vi.fn((product) => ({
    ...product,
    brand: 'Test Brand',
    colors: [
      { name: 'Red', hex: '#ff0000' },
      { name: 'Blue', hex: '#0000ff' }
    ],
    sizes: ['S', 'M'],
    variants: {
      Red: {
        S: { stock: 0, status: 'sold-out' },
        M: { stock: 5, status: 'available' }
      },
      Blue: {
        S: { stock: 2, status: 'low-stock' },
        M: { stock: 10, status: 'available' }
      }
    },
    images: ['test.jpg']
  }))
}));

const mockProductData = {
  id: 1,
  title: 'Test Product',
  price: 100.00,
  description: 'Test Description',
  category: 'apparel',
  image: 'test.jpg'
};

describe('ProductDetailPage Variant Selector & CTA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProductData)
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = (initialPath = '/product/1') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('correctly disables size buttons and displays sold-out message for sold-out variants', async () => {
    renderComponent('/product/1?color=Red&size=S');

    // Wait for the button to be disabled (which happens after variant state sync)
    await waitFor(() => {
      const sizeSButton = screen.getByRole('button', { name: /^S$/ });
      expect(sizeSButton.disabled).toBe(true);
    });

    // Check sold-out message is shown
    expect(screen.getByText(/Out of Stock/i)).toBeDefined();
  });

  it('disables the Add to Bag CTA when a sold-out variant is selected', async () => {
    renderComponent('/product/1?color=Red&size=S');

    // Wait for Add to Bag CTA button to be disabled and change label
    await waitFor(() => {
      const ctaButton = screen.getByRole('button', { name: /Sold Out/i });
      expect(ctaButton.disabled).toBe(true);
    });

    // Attempting to click it should not trigger addToCart
    const ctaButton = screen.getByRole('button', { name: /Sold Out/i });
    fireEvent.click(ctaButton);
    expect(mockAddToCart).not.toHaveBeenCalled();
  });

  it('enforces the quantity cap based on variant stock availability', async () => {
    // Select Blue S (low-stock, stock limit = 2)
    renderComponent('/product/1?color=Blue&size=S');

    // Wait for product details to load and render the Blue S state
    await waitFor(() => {
      expect(screen.getByText('1')).toBeDefined();
    });

    // Increase quantity once (should go to 2)
    const plusButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(plusButton);
    expect(screen.getByText('2')).toBeDefined();

    // The "+" button should now be disabled since stock limit is 2
    expect(plusButton.disabled).toBe(true);

    // Attempting to click "+" again should keep quantity at 2
    fireEvent.click(plusButton);
    expect(screen.getByText('2')).toBeDefined();
  });
});
