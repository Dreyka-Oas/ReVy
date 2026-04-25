import { getCachedVersions, saveCachedVersions } from '../../core/cache.js';
import { readDir } from '@tauri-apps/plugin-fs';
import { sortVersions } from '../../utils/core_helpers/helpers.js';

export async function loadVersionsForLoader(loader) {
  let versions = getCachedVersions(loader.path);
  if (!versions) {
    const entries = await readDir(loader.path);
    versions = sortVersions(entries.filter(e => e.isDirectory).map(e => e.name));
    saveCachedVersions(loader.path, versions);
  }
  return versions;
}