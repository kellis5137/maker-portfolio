// Prepend the Vite base path (e.g. "/maker-portfolio/") to root-relative asset
// URLs so images served from public/ resolve correctly on GitHub Pages.
export function withBase(url) {
  if (typeof url === 'string' && url.startsWith('/')) {
    return import.meta.env.BASE_URL.replace(/\/$/, '') + url
  }
  return url
}
