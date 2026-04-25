import { detectLoaders, scanParentFolder } from "../utils/loaderDetector";
import { getBlacklist } from "./storage";
import { getCachedEntries, saveCachedEntries, clearCachedEntries, clearVersionsCache, clearAllLoaderCache } from "./cache";
import { withConcurrencyLimit } from "../utils/core_helpers/helpers.js";

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
  const regRaw = await withConcurrencyLimit(
    state.paths.map(p => () => detectLoaders(p).then(s => ({ path: p, loaders: s.loaders ?? [], isParent: false }))),
    3
  );
  const parentRaw = (await withConcurrencyLimit(
    state.parentPaths.map(p => () => scanParentFolder(p, []).then(subs => 
      subs.map(s => ({ path: s.path, loaders: s.loaders, isParent: false, parentOrigin: p }))
    )),
    3
  )).flat();
  const allRaw = [...parentRaw, ...regRaw];
  const seen = new Set();
  const filtered = allRaw.filter(e => {
    if (e.loaders.length === 0 || bl.includes(e.path) || state.parentPaths.includes(e.path) || seen.has(e.path)) return false;
    seen.add(e.path); return true;
  });
  saveCachedEntries(filtered);
  localStorage.setItem(STORAGE_KEYS.RAW_ENTRIES, JSON.stringify(allRaw));
  return filtered;
}
