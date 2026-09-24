import React, { useState, useEffect } from 'react';
import {
  PageType,
  Product,
  ProductCategory,
  CartItem,
  ProductColor,
  ToastMessage,
} from './types';

import { PRODUCTS } from './data/products';
import { fetchProductsFromSupabase } from './lib/products';
import { validatePromoCode } from './lib/promoCodes';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ProductModal } from './components/ProductModal';
import { SizeChartModal } from './components/SizeChartModal';
import { QuickBuyModal } from './components/QuickBuyModal';
import { CartDrawer } from './components/CartDrawer';
import { MAX_CART_QUANTITY } from './lib/stockCheck';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ShippingPage } from './pages/ShippingPage';
import { ContactsPage } from './pages/ContactsPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProductsSkeleton } from './components/ProductsSkeleton';

export default function App() {
  const [activePage, setActivePage] = useState<PageType>('home');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>(
    'all'
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product catalog: loaded from Supabase, with the local PRODUCTS array
  // kept as a fallback if Supabase is unreachable or returns nothing.
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsUsingFallback, setProductsUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setProductsLoading(true);

      try {
        const fetched = await fetchProductsFromSupabase();

        if (cancelled) return;

        if (fetched.length > 0) {
          setProducts(fetched);
          setProductsUsingFallback(false);
        } else {
          // Supabase answered successfully but the tables are empty —
          // fall back so the catalog still has something to show.
          setProducts(PRODUCTS);
          setProductsUsingFallback(true);
          addToast(
            'Каталог пока пуст в базе',
            'Показываем демо-версию товаров',
            'info'
          );
        }
      } catch (error) {
        console.error('Failed to load products from Supabase:', error);

        if (cancelled) return;

        setProducts(PRODUCTS);
        setProductsUsingFallback(true);
        addToast(
          'Не удалось загрузить каталог',
          'Показываем сохранённую версию товаров. Попробуйте обновить страницу позже.',
          'info'
        );
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Modals & Drawers
  const [quickViewProduct, setQuickViewProduct] =
    useState<Product | null>(null);

  const [quickBuyItem, setQuickBuyItem] = useState<{
    product: Product;
    color: ProductColor;
    size: string;
    quantity: number;
  } | null>(null);

  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('amina_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amina_wishlist');
      return saved ? JSON.parse(saved) : ['ak-001', 'ak-004'];
    } catch {
      return ['ak-001', 'ak-004'];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  // Validated against the `promo_codes` table via `validate_promo_code()` —
  // see lib/promoCodes.ts. This is a preview only; create_order_secure()
  // re-validates and applies the discount server-side regardless of what
  // the client believes it is.
  const handleApplyPromo = async (
    code: string
  ): Promise<{ success: boolean; message: string }> => {
    const result = await validatePromoCode(code);

    if (result.success) {
      setPromoCode(code.trim().toUpperCase());
      setPromoDiscount(result.discountRate);
    } else {
      setPromoCode('');
      setPromoDiscount(0);
    }

    return { success: result.success, message: result.message };
  };

  const handleClearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setPromoDiscount(0);
  };

  // Persist Cart
  useEffect(() => {
    try {
      localStorage.setItem('amina_cart', JSON.stringify(cartItems));
    } catch {
      // Ignore localStorage errors
    }
  }, [cartItems]);

  // Persist Wishlist
  useEffect(() => {
    try {
      localStorage.setItem(
        'amina_wishlist',
        JSON.stringify(wishlistIds)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [wishlistIds]);


  // Toast Helpers
  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' = 'success'
  ) => {
    const id = `toast-${Date.now()}`;

    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id)
      );
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  };

  // Cart Actions
  const handleAddToCart = (
    product: Product,
    selectedColor: ProductColor,
    selectedSize: string,
    quantity: number = 1
  ) => {
    const itemId = `${product.id}-${selectedColor.name}-${selectedSize}`;

    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.id === itemId
      );

      if (existing) {
        return prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: Math.min(MAX_CART_QUANTITY, item.quantity + quantity),
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: itemId,
          product,
          selectedColor,
          selectedSize,
          quantity: Math.min(MAX_CART_QUANTITY, Math.max(1, quantity)),
        },
      ];
    });

    addToast(
      'Товар добавлен в корзину',
      `${product.name} (${selectedColor.name}, ${selectedSize})`
    );
  };

  const handleUpdateCartQuantity = (
    cartItemId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId
            ? {
                ...item,
                quantity: Math.min(MAX_CART_QUANTITY, newQuantity),
              }
          : item
      )
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== cartItemId)
    );

    addToast(
      'Удалено',
      'Товар удален из корзины',
      'info'
    );
  };

  // Wishlist Actions
  const handleToggleWishlist = (product: Product) => {
    if (wishlistIds.includes(product.id)) {
      setWishlistIds((prev) =>
        prev.filter((id) => id !== product.id)
      );

      addToast(
        'Избранное',
        `«${product.name}» удален из избранного`,
        'info'
      );
    } else {
      setWishlistIds((prev) => [
        ...prev,
        product.id,
      ]);

      addToast(
        'Избранное',
        `«${product.name}» добавлен в избранное`,
        'success'
      );
    }
  };

  // Navigation
  const handleNavigate = (
    page: PageType,
    category?: ProductCategory
  ) => {
    setActivePage(page);

    if (page === 'catalog') {
      setActiveCategory(category ?? 'all');
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActivePage('product');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Calculations
  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const wishlistProducts = products.filter(
    (product) =>
      wishlistIds.includes(product.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#33261D] font-sans antialiased selection:bg-[#E2A69B] selection:text-white">
      {/* Header */}
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setCartDrawerOpen(true)}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Main Content */}
      <main className="flex-1">
        {productsLoading && (activePage === 'home' || activePage === 'catalog' || activePage === 'wishlist') ? (
          <ProductsSkeleton />
        ) : (
          <>
        {activePage === 'home' && (
          <HomePage
            products={products}
            onNavigateToCatalog={(category) =>
              handleNavigate('catalog', category)
            }
            onOpenQuickView={(product) =>
              setQuickViewProduct(product)
            }
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'catalog' && (
          <CatalogPage
            products={products}
            initialCategory={activeCategory}
            onOpenQuickView={(product) =>
              setQuickViewProduct(product)
            }
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {activePage === 'product' &&
          selectedProduct && (
            <ProductDetailPage
              key={selectedProduct.id}
              product={selectedProduct}
              allProducts={products}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={wishlistIds.includes(
                selectedProduct.id
              )}
              onOpenSizeChart={() =>
                setSizeChartOpen(true)
              }
              onOpenQuickBuy={(
                product,
                color,
                size,
                quantity
              ) =>
                setQuickBuyItem({
                  product,
                  color,
                  size,
                  quantity,
                })
              }
              onNavigateToCatalog={() =>
                handleNavigate('catalog')
              }
              onSelectProduct={
                handleSelectProduct
              }
              onOpenQuickView={(product) =>
                setQuickViewProduct(product)
              }
              wishlistIds={wishlistIds}
            />
          )}

        {activePage === 'checkout' && (
          <CheckoutPage
            cartItems={cartItems}
            onClearCart={handleClearCart}
            onNavigateHome={() =>
              handleNavigate('home')
            }
            promoCode={promoCode}
            promoDiscount={promoDiscount}
          />
        )}

        {activePage === 'about' && (
          <AboutPage />
        )}

        {activePage === 'shipping' && (
          <ShippingPage />
        )}

        {activePage === 'contacts' && (
          <ContactsPage />
        )}

        {activePage === 'wishlist' && (
          <WishlistPage
            wishlistProducts={wishlistProducts}
            onOpenQuickView={(product) =>
              setQuickViewProduct(product)
            }
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            onNavigateToCatalog={() =>
              handleNavigate('catalog')
            }
            onSelectProduct={handleSelectProduct}
          />
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Quick View Modal */}
      <ProductModal
        key={quickViewProduct ? `quick-view-${quickViewProduct.id}` : 'quick-view-none'}
        product={quickViewProduct}
        onClose={() =>
          setQuickViewProduct(null)
        }
        onAddToCart={handleAddToCart}
        onToggleWishlist={
          handleToggleWishlist
        }
        isWishlisted={
          quickViewProduct
            ? wishlistIds.includes(
                quickViewProduct.id
              )
            : false
        }
        onOpenSizeChart={() =>
          setSizeChartOpen(true)
        }
        onOpenQuickBuy={(
          product,
          color,
          size,
          quantity
        ) =>
          setQuickBuyItem({
            product,
            color,
            size,
            quantity,
          })
        }
      />

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={sizeChartOpen}
        onClose={() =>
          setSizeChartOpen(false)
        }
      />

      {/* Quick Buy Modal */}
      <QuickBuyModal
        key={
          quickBuyItem
            ? `quick-buy-${quickBuyItem.product.id}-${quickBuyItem.color.name}-${quickBuyItem.size}`
            : 'quick-buy-none'
        }
        item={quickBuyItem}
        onClose={() =>
          setQuickBuyItem(null)
        }
        onSuccess={(message) =>
          addToast(
            'Заказ принят!',
            message,
            'success'
          )
        }
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() =>
          setCartDrawerOpen(false)
        }
        cartItems={cartItems}
        onUpdateQuantity={
          handleUpdateCartQuantity
        }
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() =>
          handleNavigate('checkout')
        }
        onNavigateToCatalog={() =>
          handleNavigate('catalog')
        }
        promoDiscount={promoDiscount}
        onApplyPromo={handleApplyPromo}
      />

      {/* Toast Notifications */}
      <Toast
        toasts={toasts}
        onDismiss={removeToast}
      />
    </div>
  );
}