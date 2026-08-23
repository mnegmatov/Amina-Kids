import React, { useEffect, useState } from 'react';
import { useAdminAuth } from './useAdminAuth';
import { navigate } from './navigation';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminAccessDenied } from './AdminAccessDenied';
import { AdminDashboard } from './AdminDashboard';
import { AdminLoadingScreen } from './AdminLoadingScreen';
import { AdminProductsPage } from './products/AdminProductsPage';
import { AdminOrdersPage } from './orders/AdminOrdersPage';
import { AdminPromoCodesPage } from './promo/AdminPromoCodesPage';
import { AdminReviewsPage } from './reviews/AdminReviewsPage';

const LOGIN_PATH = '/admin/login';
const DASHBOARD_PATH = '/admin';
const PRODUCTS_PATH = '/admin/products';
const ORDERS_PATH = '/admin/orders';
const PROMO_CODES_PATH = '/admin/promo-codes';
const REVIEWS_PATH = '/admin/reviews';

function usePathname(): string {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return pathname;
}

export default function AdminApp() {
  const { status, user } = useAdminAuth();
  const pathname = usePathname();
  const isOnLoginPath = pathname === LOGIN_PATH || pathname === `${LOGIN_PATH}/`;

  // Keep the URL in sync with the guarded state — this is what makes a
  // direct visit to /admin without a session land on the login screen,
  // and a signed-in admin visiting /admin/login land on the dashboard.
  useEffect(() => {
    if (status === 'signed-out' && !isOnLoginPath) {
      navigate(LOGIN_PATH);
    } else if (status === 'admin' && isOnLoginPath) {
      navigate(DASHBOARD_PATH);
    }
  }, [status, isOnLoginPath]);

  if (status === 'loading') {
    return <AdminLoadingScreen />;
  }

  if (status === 'forbidden') {
    return <AdminAccessDenied email={user?.email} />;
  }

  if (status === 'signed-out') {
    return <AdminLoginPage />;
  }

  // status === 'admin'
  if (pathname === PRODUCTS_PATH || pathname === `${PRODUCTS_PATH}/`) {
    return <AdminProductsPage />;
  }

  if (pathname === ORDERS_PATH || pathname === `${ORDERS_PATH}/`) {
    return <AdminOrdersPage />;
  }

  if (pathname === PROMO_CODES_PATH || pathname === `${PROMO_CODES_PATH}/`) {
    return <AdminPromoCodesPage />;
  }

  if (pathname === REVIEWS_PATH || pathname === `${REVIEWS_PATH}/`) {
    return <AdminReviewsPage />;
  }

  return <AdminDashboard user={user} />;
}
