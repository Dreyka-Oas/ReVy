const THEME_KEY = 'theme';
const THEMES = { LIGHT: 'light', DARK: 'dark' };

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

function applyTheme(theme) {
  setTheme(theme);
}

function toggleTheme() {
  const current = getStoredTheme() || THEMES.LIGHT;
  const next = current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  applyTheme(next);
}

function initTheme() {
  const initial = getStoredTheme() || THEMES.LIGHT;
  applyTheme(initial);
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

export { initTheme };
