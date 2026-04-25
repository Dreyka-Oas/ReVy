import { detectLoaders, scanParentFolder } from "../utils/loaderDetector";
import { getBlacklist } from "./storage";
import { getCachedEntries, saveCachedEntries, clearCachedEntries, clearVersionsCache, clearAllLoaderCache } from "./cache";

let forceRefresh = false;

export function setForceRefresh(value) {
  forceRefresh = value;
}

export async function performSync(state, skipCache = false) {
  if (forceRefresh) { clearAllLoaderCache(); clearVersionsCache(); }
  const cache = !skipCache && !forceRefresh ? getCachedEntries() : null;
  if (cache && !forceRefresh) { forceRefresh = false; return cache; }
  forceRefresh = false;
  const bl = getBlacklist();
  const regRaw = await Promise.all(state.paths.map(async p => {
    const s = await detectLoaders(p);
    return { path: p, loaders: s.loaders ?? [], isParent: false };
  }));
  const parentRaw = (await Promise.all(state.parentPaths.map(async p => {
    const subs = await scanParentFolder(p, []); // No blacklist here to get all
    return subs.map(s => ({ path: s.path, loaders: s.loaders, isParent: false, parentOrigin: p }));
  }))).flat();
  const allRaw = [...parentRaw, ...regRaw];
  const seen = new Set();
  const filtered = allRaw.filter(e => {
    if (e.loaders.length === 0 || bl.includes(e.path) || state.parentPaths.includes(e.path) || seen.has(e.path)) return false;
    seen.add(e.path); return true;
  });
  saveCachedEntries(filtered);
  // Store allRaw in cache or return it somehow for blacklist view? 
  // Let's store it in a special cache key for the blacklist.
  localStorage.setItem('lethalbreed_raw_entries', JSON.stringify(allRaw));
  return filtered;
}
