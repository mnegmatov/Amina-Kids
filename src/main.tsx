import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';

// The shop uses in-memory page state, not real URLs. The admin area is the
// one exception — it needs a real, bookmarkable /admin URL so a direct
// visit without a session can be guarded. This is the only place that
// looks at window.location; nothing about the shop's own navigation changes.
const isAdminRoute = window.location.pathname.startsWith('/admin');

// Lazy-loaded so each visitor's bundle only contains the code for the app
// they're actually visiting: a shopper's browser never has to download the
// admin dashboard/products/orders code, and vice versa. Behavior is
// unchanged — this only affects which JS is fetched, not what renders.
const App = lazy(() => import('./App.tsx'));
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      {isAdminRoute ? <AdminApp /> : <App />}
    </Suspense>
  </StrictMode>,
);
