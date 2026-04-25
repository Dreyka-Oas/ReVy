import { STORAGE_KEYS } from '../constants/index.js';
import { parseStorage, saveStorage } from '../utils/core_helpers/helpers.js';

const CACHE_KEY = STORAGE_KEYS.SCAN_CACHE;

export function getCachedEntries() {
  return parseStorage(CACHE_KEY, null);
}

export function saveCachedEntries(entries) {
  saveStorage(CACHE_KEY, entries);
}

export function clearCachedEntries() {
  localStorage.removeItem(CACHE_KEY);
}

const VERSIONS_CACHE_KEY = STORAGE_KEYS.VERSIONS_CACHE;
const LOADER_CACHE_KEY = STORAGE_KEYS.LOADER_CACHE;

export function getCachedVersions(loaderPath) {
  const cache = parseStorage(VERSIONS_CACHE_KEY, {});
  return cache[loaderPath] || null;
}

export function saveCachedVersions(loaderPath, versions) {
  const cache = parseStorage(VERSIONS_CACHE_KEY, {});
  cache[loaderPath] = versions;
  saveStorage(VERSIONS_CACHE_KEY, cache);
}

export function clearVersionsCache() {
  localStorage.removeItem(VERSIONS_CACHE_KEY);
}

export function getCachedLoaders(basePath) {
  const cache = parseStorage(LOADER_CACHE_KEY, {});
  return cache[basePath] || null;
}

export function saveCachedLoaders(basePath, loaders) {
  const cache = parseStorage(LOADER_CACHE_KEY, {});
  cache[basePath] = loaders;
  saveStorage(LOADER_CACHE_KEY, cache);
}

export function clearCachedLoaders(basePath) {
  const cache = parseStorage(LOADER_CACHE_KEY, {});
  delete cache[basePath];
  saveStorage(LOADER_CACHE_KEY, cache);
}

export function clearAllLoaderCache() {
  localStorage.removeItem(LOADER_CACHE_KEY);
}

const JAVA_RAM_CONFIG_KEY = STORAGE_KEYS.JAVA_RAM_CONFIG;

export function getJavaRamConfig() {
  const rawState = localStorage.getItem(STORAGE_KEYS.SCAN_STATE);
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

  return parseStorage(JAVA_RAM_CONFIG_KEY, { min: 2, max: 4 });
}

export function saveJavaRamConfig(min, max) {
  saveStorage(JAVA_RAM_CONFIG_KEY, { min, max });
}