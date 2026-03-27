let temp_frontend_base_url;

if (document.domain === 'localhost' || document.domain === '127.0.0.1') {
  temp_frontend_base_url = 'http://localhost:4000/';
} else if (document.domain === 'ohtukisalli.github.io') {
  temp_frontend_base_url = 'https://ohtukisalli.github.io/';
} else if (document.domain === 'beta-kisallioppiminen.github.io') {
  temp_frontend_base_url = 'https://beta-kisallioppiminen.github.io/';
} else {
  temp_frontend_base_url = 'https://kisallioppiminen.github.io/';
}

const FRONTEND_BASE_URL = temp_frontend_base_url;
