const MEMO_CACHE = new Map();
const DEBOUNCE_TIMERS = new Map();

export function sortVersions(versions) {
  return versions.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
}

export function parseStorage(key, defaultValue = {}) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function withConcurrencyLimit(tasks, limit = 3) {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    
    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

export function memoize(fn, keyFn) {
  return (...args) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (MEMO_CACHE.has(key)) return MEMO_CACHE.get(key);
    const result = fn(...args);
    MEMO_CACHE.set(key, result);
    return result;
  };
}

export function debounce(fn, ms = 300) {
  return (...args) => {
    const id = fn.name || 'default';
    if (DEBOUNCE_TIMERS.has(id)) clearTimeout(DEBOUNCE_TIMERS.get(id));
    DEBOUNCE_TIMERS.set(id, setTimeout(() => fn(...args), ms));
  };
}