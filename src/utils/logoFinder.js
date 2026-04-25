import { readDir, readFile } from "@tauri-apps/plugin-fs";
import { join, basename } from "@tauri-apps/api/path";

const IGNORED_DIRS = ['.git', '.gradle', '.cache', 'build', 'node_modules', 'target'];

export async function findLogo(dirPath, depth = 0) {
  if (depth > 3) return null;
  try {
    const entries = await readDir(dirPath);
    for (const entry of entries) {
      if (entry.isDirectory) {
        if (IGNORED_DIRS.includes(entry.name) || entry.name.startsWith('.')) continue;
        const fullPath = await join(dirPath, entry.name);
        const found = await findLogo(fullPath, depth + 1);
        if (found) return found;
      } else if (entry.name.toLowerCase() === 'logo.png') {
        return await join(dirPath, entry.name);
      }
    }
  } catch (e) {}
  return null;
}

export async function getLogoUrl(logoPath) {
  if (!logoPath) return null;
  try {
    const data = await readFile(logoPath);
    const blob = new Blob([data], { type: 'image/png' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('[Logo] Error loading:', e);
    return null;
  }
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

export async function getFolderName(dirPath) {
  if (!dirPath) return null;
  try {
    return await basename(dirPath);
  } catch (e) {
    return null;
  }
}
