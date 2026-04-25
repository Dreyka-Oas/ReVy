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

export async function extractDominantColor(blobOrUrl) {
  return new Promise((resolve) => {
    const isString = typeof blobOrUrl === 'string';
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        if (!isString && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        resolve([r, g, b]);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = isString ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  });
}

export function clearLogoColorCache() {
  COLOR_CACHE.clear();
}
