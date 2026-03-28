const view = new View();

function applyBaseurlToSiteLinks() {
  if (!window.FRONTEND_BASE_URL || window.FRONTEND_BASE_URL === '/') {
    return;
  }

  const rewrite = (attr, selector) => {
    document.querySelectorAll(selector).forEach(el => {
      const value = el.getAttribute(attr);
      if (!value || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//') || value.startsWith('#') || value.startsWith('mailto:')) {
        return;
      }
      if (value.startsWith('/')) {
        el.setAttribute(attr, FRONTEND_BASE_URL + value.substring(1));
      }
    });
  };

  rewrite('href', 'a[href]');
  rewrite('href', 'link[href]');
  rewrite('src', 'img[src]');
  rewrite('src', 'script[src]');
  rewrite('src', 'video[src]');
  rewrite('src', 'audio[src]');
  rewrite('src', 'source[src]');
  rewrite('action', 'form[action]');
}

window.addEventListener('DOMContentLoaded', () => {
  applyBaseurlToSiteLinks();
  view.showNavigation();
});
