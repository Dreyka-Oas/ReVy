const CACHE_KEY = 'lethalbreed_scan_cache';

export function getCachedEntries() {
  const raw = localStorage.getItem(CACHE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveCachedEntries(entries) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
}

export function clearCachedEntries() {
  localStorage.removeItem(CACHE_KEY);
}

const VERSIONS_CACHE_KEY = 'lethalbreed_versions_cache';
const LOADER_CACHE_KEY = 'lethalbreed_loader_cache';

export function getCachedVersions(loaderPath) {
  try { return JSON.parse(localStorage.getItem(VERSIONS_CACHE_KEY)||'{}')[loaderPath] || null; } catch { return null; }
}

export function saveCachedVersions(loaderPath, versions) {
  try { const c = JSON.parse(localStorage.getItem(VERSIONS_CACHE_KEY)||'{}'); c[loaderPath] = versions; localStorage.setItem(VERSIONS_CACHE_KEY, JSON.stringify(c)); } catch {}
}

export function clearVersionsCache() {
  localStorage.removeItem(VERSIONS_CACHE_KEY);
}

export function getCachedLoaders(basePath) {
  try { const c = JSON.parse(localStorage.getItem(LOADER_CACHE_KEY)||'{}'); return c[basePath] || null; } catch { return null; }
}

export function saveCachedLoaders(basePath, loaders) {
  try { const c = JSON.parse(localStorage.getItem(LOADER_CACHE_KEY)||'{}'); c[basePath] = loaders; localStorage.setItem(LOADER_CACHE_KEY, JSON.stringify(c)); } catch {}
}

export function clearCachedLoaders(basePath) {
  try { const c = JSON.parse(localStorage.getItem(LOADER_CACHE_KEY)||'{}'); delete c[basePath]; localStorage.setItem(LOADER_CACHE_KEY, JSON.stringify(c)); } catch {}
}

export function clearAllLoaderCache() {
  localStorage.removeItem(LOADER_CACHE_KEY);
}

const JAVA_RAM_CONFIG_KEY = 'java_ram_config';

export function getJavaRamConfig() {
  const rawState = localStorage.getItem("lethalbreed_scan_state");
  if (rawState) {
    try {
      const state = JSON.parse(rawState);
      if (state?.javaRamConfig) {
        return {
          min: state.javaRamConfig.min ?? 2,
          max: state.javaRamConfig.max ?? 4,
        };
      }
    } catch (e) {}
  }

  const raw = localStorage.getItem(JAVA_RAM_CONFIG_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }
  return { min: 2, max: 4 };
}

export function saveJavaRamConfig(min, max) {
  localStorage.setItem(JAVA_RAM_CONFIG_KEY, JSON.stringify({ min, max }));
}