import { writeTextFile, readTextFile, BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';
import { STORAGE_KEYS } from '../constants/index.js';

const CONFIG_FILE = 'scan_state.json';

async function ensureDir() {
  try {
    await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
    return true;
  } catch (e) {
    try {
      const dirExists = await exists('.', { baseDir: BaseDirectory.AppData });
      if (dirExists) return true;
    } catch (e2) {}
    
    console.warn('[STORAGE] AppData access forbidden, using localStorage', e);
    return false;
  }
}

export async function saveScanState(state) {
  const data = JSON.stringify(state, null, 2);
  localStorage.setItem(STORAGE_KEYS.SCAN_STATE, data);
  
  if (await ensureDir()) {
    try {
      await writeTextFile(CONFIG_FILE, data, { baseDir: BaseDirectory.AppData });
    } catch (e) {
      console.error('[STORAGE] File save error', e);
    }
  }
}

export async function getScanState() {
  if (await ensureDir()) {
    try {
      const hasFile = await exists(CONFIG_FILE, { baseDir: BaseDirectory.AppData });
      if (hasFile) {
        const content = await readTextFile(CONFIG_FILE, { baseDir: BaseDirectory.AppData });
        return JSON.parse(content);
      }
    } catch (e) {
      console.warn('[STORAGE] File read error', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.SCAN_STATE);
  return raw ? JSON.parse(raw) : null;
}

export function getBlacklist() {
  const raw = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
  return raw ? JSON.parse(raw) : [];
}

export function saveBlacklist(list) {
  localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(list));
}

export function addToBlacklist(path) {
  const list = getBlacklist();
  if (!list.includes(path)) { list.push(path); saveBlacklist(list); }
}

export function removeFromBlacklist(path) {
  const list = getBlacklist().filter(p => p !== path);
  saveBlacklist(list);
}

export async function loadInitialState() {
  let state = { paths: [], parentPaths: [], activePath: null, timestamp: null };
  try {
    const saved = await getScanState();
    if (saved) state = { ...state, ...saved };
  } catch (err) { console.error('State load error', err); }
  if (!Array.isArray(state.parentPaths)) state.parentPaths = [];
  if (!Array.isArray(state.paths)) state.paths = [];
  if (!state.activePath) {
    state.activePath = state.paths[0] || state.parentPaths[0] || null;
  }
  return state;
}

export async function updateActivePath(state, path) {
  if (!path) return state;
  if (!state.paths.includes(path) && !state.parentPaths.includes(path)) {
    state.paths.push(path);
  }
  state.activePath = path;
  state.timestamp = new Date().toISOString();
  await saveScanState(state);
  return state;
}