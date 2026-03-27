let temp_frontend_base_url;

if (document.domain === 'localhost' || document.domain === '127.0.0.1') {
  temp_frontend_base_url = 'http://localhost:4000/';
} else if (document.domain === 'ohtukisalli.github.io') {
  temp_frontend_base_url = 'https://ohtukisalli.github.io/';
} else if (document.domain === 'beta-kisallioppiminen.github.io') {
  temp_frontend_base_url = 'https://beta-kisallioppiminen.github.io/';
} else if (document.domain === 'ruumi5.github.io') {
  temp_frontend_base_url = 'https://ruumi5.github.io/web-page/';
} else {
  temp_frontend_base_url = 'https://kisallioppiminen.github.io/';
}

function inferFrontendBaseUrl() {
  if (temp_frontend_base_url) {
    return temp_frontend_base_url;
  }

  const origin = window.location.origin;
  const path = window.location.pathname;

  // If site is deployed under /web-page/, use that as base.
  if (path.startsWith('/web-page/')) {
    return origin + '/web-page/';
  }

  // Fallback to root.
  return origin + '/';
}

const FRONTEND_BASE_URL = inferFrontendBaseUrl();
