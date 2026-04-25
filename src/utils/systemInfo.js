import { invoke } from '@tauri-apps/api/core';

export async function getSystemRam() {
  try {
    const tauriRam = await invoke('get_system_ram');
    if (typeof tauriRam === 'number' && tauriRam > 0) {
      return Math.max(1, Math.round(tauriRam / (1024 * 1024 * 1024)));
    }
  } catch (e) {
    console.warn('[SystemInfo] Tauri RAM failed, falling back:', e);
  }

  try {
    if (navigator.deviceMemory) {
      return Math.round(navigator.deviceMemory);
    }
  } catch (e) {
    console.warn('[SystemInfo] Erreur détection RAM:', e);
  }
  return 8;
}

export function getRecommendedMinRam() {
  return 2;
}

export function getRecommendedMaxRam() {
  return 8;
}
