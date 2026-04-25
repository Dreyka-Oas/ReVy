import { initTheme } from "./theme.js";
import { initUI, showLoading, showLoaders, renderSettings, toggleSettingsPanel, renderParentList, renderBlacklist, renderVersions, toggleVersionsPanel, renderJavaPanel, setJavaInstalling, clearJavaInstalling, renderJavaRamPanel, setTestGlobalLoaders, updateTestProgress } from "./ui";
import { findLogo, getFolderName } from "./utils/logoFinder";
import { updateHeaderLogo, updateHeaderTitle, updatePickerButton, showReloadIcon, hideReloadIcon } from "./ui/ui-header-logo";
import { updateBackground } from "./ui/ui-background";
import { loadInitialState, updateActivePath, getBlacklist, removeFromBlacklist, saveScanState } from "./core/storage";
import { performSync, setForceRefresh } from "./core/scanner";
import { pickDirectory, handleDelete, handleAddParent, handleUnblacklist } from "./core/handlers";
import { detectLoaders } from "./utils/loaderDetector";
import { getCachedVersions, saveCachedVersions, clearVersionsCache, getJavaRamConfig, saveJavaRamConfig } from "./core/cache";
import { checkSdkman } from "./utils/javaDetector";
import { launchMinecraftVersion, loadJavaData, installJavaWithProgress, uninstallJavaWithProgress } from "./java_utils.js";
import { readDir } from "@tauri-apps/plugin-fs";
import { getSystemRam } from "./utils/systemInfo";
import { runTestGlobal, setTestLogEnabled } from "./core/test-manager";

let currentTestLoaders = [];

const refreshHeader = async path => { 
  const logo = await findLogo(path);
  updateHeaderTitle(await getFolderName(path)); 
  await updateHeaderLogo(logo); 
  await updateBackground(logo);
  updatePickerButton(false); 
};

const updateStartupProgress = (p) => {
  const f = document.querySelector('.loader-bar-fill'), t = document.querySelector('.loader-percent');
  if (f) f.style.width = `${p}%`; if (t) t.textContent = `${Math.round(p)}%`;
};

export const selectLoader = async loader => {
  try {
    let versions = getCachedVersions(loader.path);
    if (!versions) { 
      const entries = await readDir(loader.path); 
      versions = entries.filter(e => e.isDirectory).map(e => e.name).sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' })); 
      saveCachedVersions(loader.path, versions); 
    }
    renderVersions(versions, loader.name, loader.icon, loader.path, () => toggleVersionsPanel(false), async (version, loaderPath, playBtn) => {
      const { min, max } = getJavaRamConfig(), originalLabel = playBtn ? playBtn.innerHTML : null;
      if (playBtn) { playBtn.disabled = true; playBtn.classList.add('launching'); playBtn.innerHTML = 'Lancement...'; }
      try { await launchMinecraftVersion(loaderPath, version, min, max); } 
      catch (e) { console.error('[Launch] Error:', e); } 
      finally { if (playBtn) setTimeout(() => { playBtn.disabled = false; playBtn.classList.remove('launching'); if (originalLabel) playBtn.innerHTML = originalLabel; }, 600); }
    });
  } catch (e) { console.error('[Versions] Error:', e); }
};

export const initApp = async () => {
  initTheme(); initUI(); updateStartupProgress(10);
  let state = await loadInitialState(), entries = []; updateStartupProgress(30);
  const render = () => renderSettings(entries, state.activePath, p => handleDelete(p, state, sync), () => handleAddParent(state, sync, () => {}), showBlacklist, () => handleAddRegular(state, p => setActive(p, true)), showParents, setActive);
  const sync = async (rescan = false) => { entries = await performSync(state, rescan); await render(); };
  const showParents = () => renderParentList(state.parentPaths, async p => { state.parentPaths = state.parentPaths.filter(x => x !== p); await saveScanState(state); showParents(); await sync(true); }, () => render(), () => handleAddParent(state, sync, () => {}));
  const showBlacklist = () => { const raw = JSON.parse(localStorage.getItem('lethalbreed_raw_entries') || '[]'); renderBlacklist(getBlacklist(), raw, async p => { await handleUnblacklist(p, state, sync); }, () => render()); };
  const handleAddRegular = async (s, cb) => { const p = await pickDirectory(); if (p) { s.paths.push(p); await cb(p); } };
  const setActive = async (path, refreshList = false) => { toggleVersionsPanel(false); toggleSettingsPanel(false); state = await updateActivePath(state, path); if (refreshList) { entries = await performSync(state); await render(); } else { document.querySelectorAll('.settings-item[data-path]').forEach(item => item.classList.toggle('active', item.dataset.path === path)); } await runScan(path); await refreshHeader(path); };
  const runScan = async (p, showBtnOnError = true) => { const el = document.getElementById("path-display"); if (el) { el.textContent = p; el.classList.remove("hidden"); let existingNotif = el.querySelector(".copy-notif"); el.onclick = () => { navigator.clipboard.writeText(p); if (existingNotif) existingNotif.remove(); const notif = document.createElement("span"); notif.className = "copy-notif"; notif.textContent = "✓ Copié!"; el.appendChild(notif); void notif.offsetWidth; notif.classList.add("show"); setTimeout(() => { notif.remove(); existingNotif = null; }, 1500); }; } showLoading(); try { const s = await detectLoaders(p); currentTestLoaders = s.loaders ?? []; await showLoaders(s.loaders ?? [], s.debug ?? [], selectLoader); document.getElementById('action-buttons')?.classList.toggle('hidden', !(s.loaders && s.loaders.length > 0)); if ((s.loaders?.length ?? 0) === 0 && showBtnOnError) updatePickerButton(true); } catch (e) { console.error('[Scan] Error:', e); if (showBtnOnError) updatePickerButton(true); } };
  
  document.getElementById("picker-btn").onclick = async () => { const s = await pickDirectory(); if (s) { await setActive(s); } };
  document.getElementById("settings-toggle").onclick = () => { toggleSettingsPanel(true); sync(); };
  document.querySelector('.icon-wrapper').onclick = async () => { if (!state.activePath) return; setForceRefresh(true); clearVersionsCache(); localStorage.removeItem('java_installed_cache'); localStorage.removeItem('java_available_cache'); showReloadIcon(); await sync(true); await runScan(state.activePath); hideReloadIcon(); };
  const testBtn = document.getElementById('test-btn'); if (testBtn) testBtn.onclick = async () => { setTestGlobalLoaders(currentTestLoaders); renderJavaRamPanel(await getSystemRam(), (min, max) => saveJavaRamConfig(min, max), async selected => await runTestGlobal(selected, updateTestProgress), enabled => setTestLogEnabled(enabled)); toggleSettingsPanel(false); };
  const sdkmanInstalled = await checkSdkman(), javaBtn = document.getElementById('java-btn'); 
  const loadJavaPanel = async (forceRefresh = false) => { const { installed, available } = await loadJavaData(forceRefresh); renderJavaPanel(installed, available, () => toggleVersionsPanel(false), async identifier => await installJavaWithProgress(identifier, setJavaInstalling, () => loadJavaPanel(true), async () => { setJavaInstalling(identifier, -1); await loadJavaPanel(true); }), () => loadJavaPanel(true), async identifier => await uninstallJavaWithProgress(identifier, setJavaInstalling, () => loadJavaPanel(true), async () => { setJavaInstalling(identifier, -1); await loadJavaPanel(true); })); }; 
  if (javaBtn) javaBtn.onclick = async () => { if (!sdkmanInstalled) return (javaBtn.title = 'SDKMAN n\'est pas installé'); await loadJavaPanel(); }; 
  if (!sdkmanInstalled && javaBtn) { javaBtn.style.background = '#dc2626'; javaBtn.title = 'SDKMAN n\'est pas installé'; }
  updateStartupProgress(80); await sync(); updateStartupProgress(100); setTimeout(() => document.getElementById('startup-loader')?.classList.add('hidden'), 500);
  console.log('[Main] Active path:', state.activePath, '| Paths:', state.paths, '| Parents:', state.parentPaths);
  if (state.activePath) { await refreshHeader(state.activePath); await setActive(state.activePath); } else if (entries.length > 0) { await setActive(entries[0].path); } else { updatePickerButton(true); }
  return { state, setActive, sync, runScan };
};

initApp();