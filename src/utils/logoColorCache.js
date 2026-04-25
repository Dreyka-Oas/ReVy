import { extractDominantColor } from "./logoFinder.js";

const COLOR_CACHE = new Map();

export async function getCachedDominantColor(blobOrUrl) {
  const cacheKey = typeof blobOrUrl === 'string' ? blobOrUrl : await blobToHash(blobOrUrl);
  
  if (COLOR_CACHE.has(cacheKey)) {
    return COLOR_CACHE.get(cacheKey);
  }
  
  const color = await extractDominantColor(blobOrUrl);
  
  if (color) {
    COLOR_CACHE.set(cacheKey, color);
  }
  
  return color;
}

async function blobToHash(blob) {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function clearLogoColorCache() {
  COLOR_CACHE.clear();
}
