import { invoke } from '@tauri-apps/api/core';
import { installJava, uninstallJava, listJavaInstalled, listJavaAvailable } from './utils/javaDetector.js';
import { clearJavaInstalling } from './ui/settings/ui-versions.js';

export async function launchMinecraftVersion(loaderPath, version, minRam, maxRam) {
  try {
    return await invoke('launch_minecraft_version', { loaderPath, version, minRam, maxRam });
  } catch (e) {
    console.error('[Launcher] Launch error:', e);
    throw e;
  }
}

export async function installJavaWithProgress(identifier, setInstalling, onComplete, onError) {
  setInstalling(identifier, 0);
  let progress = 0;
  const progressInterval = setInterval(() => { progress += 10; setInstalling(identifier, Math.min(progress, 90)); }, 500);
  try { await installJava(identifier); clearJavaInstalling(); onComplete?.(); } catch (e) { clearJavaInstalling(); setInstalling(identifier, -1); onError?.(e); } finally { clearInterval(progressInterval); }
}

export async function uninstallJavaWithProgress(identifier, setInstalling, onComplete, onError) {
  setInstalling(identifier, 0);
  let progress = 0;
  const progressInterval = setInterval(() => { progress += 10; setInstalling(identifier, Math.min(progress, 90)); }, 500);
  try { await uninstallJava(identifier); clearJavaInstalling(); onComplete?.(); } catch (e) { clearJavaInstalling(); setInstalling(identifier, -1); onError?.(e); } finally { clearInterval(progressInterval); }
}

export async function loadJavaData(forceRefresh = false) {
  if (forceRefresh) {
    localStorage.removeItem('java_installed_cache');
    localStorage.removeItem('java_available_cache');
  }
  let installed = await listJavaInstalled();
  if (installed.length > 0) localStorage.setItem('java_installed_cache', JSON.stringify(installed));
  let available = await listJavaAvailable();
  if (available.length > 0) localStorage.setItem('java_available_cache', JSON.stringify(available));
  return { installed, available };
}
