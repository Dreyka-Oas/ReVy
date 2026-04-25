import { exists, readDir } from '@tauri-apps/plugin-fs';
import { findLogo, getLogoUrl } from './logoFinder';
import { getCachedLoaders, saveCachedLoaders } from '../core/cache.js';

const LOADER_NAMES = ['forge', 'neoforge', 'fabric'];
const ICONS = {
  forge: '/forge.png',
  neoforge: '/neoforge.png',
  fabric: '/fabric.png',
};

function normalize(name) { return name.toLowerCase().trim().replace(/[^a-z0-9]/g, ''); }

export async function detectLoaders(basePath) {
  const cached = await getCachedLoaders(basePath);
  if (cached) return { loaders: cached, debug: [] };

  const results = [];
  try {
    const isAllowed = await exists(basePath).catch(() => false);
    if (!isAllowed) return { loaders: [], debug: [] };

    const entries = await readDir(basePath).catch(() => []);
    const folders = entries.filter(e => e.isDirectory).map(e => ({ name: e.name, path: `${basePath}/${e.name}` }));

    for (const loader of LOADER_NAMES) {
      const match = folders.find(f => normalize(f.name).startsWith(loader));
      if (match) {
        const versions = await readDir(match.path).catch(() => []);
        const logoPath = await findLogo(match.path);
        const logoUrl = logoPath ? await getLogoUrl(logoPath) : null;
        results.push({
          name: loader.charAt(0).toUpperCase() + loader.slice(1),
          path: match.path,
          icon: ICONS[loader],
          customIcon: logoUrl,
          versionCount: versions.filter(entry => entry.isDirectory).length,
          cssClass: `loader-${loader.toLowerCase()}`,
        });
      }
    }
  } catch (err) {}
  await saveCachedLoaders(basePath, results);
  return { loaders: results, debug: [] };
}

export async function scanParentFolder(parentPath, blacklist = []) {
  const results = [];
  try {
    const entries = await readDir(parentPath).catch(() => []);
    for (const sub of entries.filter(e => e.isDirectory)) {
      const subPath = `${parentPath}/${sub.name}`;
      if (blacklist.includes(subPath) || sub.name.startsWith('.')) continue;
      const scan = await detectLoaders(subPath);
      if (scan.loaders.length > 0) results.push({ name: sub.name, path: subPath, loaders: scan.loaders });
    }
  } catch (err) {}
  return results;
}
