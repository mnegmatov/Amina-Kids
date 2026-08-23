/**
 * Minimal path-based navigation for the admin area.
 * The rest of the app (the shop) uses in-memory state, not real URLs, so
 * there's no router installed — and adding one just for two admin routes
 * would be more architecture than this needs. This tiny helper is enough.
 */
export function navigate(path: string): void {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
