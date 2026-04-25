import { initTheme } from "./theme.js";
import { STORAGE_KEYS } from "./constants/index.js";
import { sortVersions, parseStorage } from "./utils/helpers.js";
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

document.addEventListener("DOMContentLoaded", async () => {
  initTheme(); initUI(); updateStartupProgress(10);
  let state = await loadInitialState(), entries = []; updateStartupProgress(30);
  const render = () => renderSettings(entries, state.activePath, p => handleDelete(p, state, sync), () => handleAddParent(state, sync, () => {}), showBlacklist, () => handleAddRegular(state, p => setActive(p, true)), showParents, setActive);
  const sync = async (rescan = false) => { entries = await performSync(state, rescan); await render(); };
  updateStartupProgress(50);
  const showParents = () => renderParentList(state.parentPaths, async p => { state.parentPaths = state.parentPaths.filter(x => x !== p); await saveScanState(state); showParents(); await sync(true); }, () => render(), () => handleAddParent(state, sync, () => {}));
  const showBlacklist = () => {
    const raw = parseStorage(STORAGE_KEYS.RAW_ENTRIES, []);
    renderBlacklist(getBlacklist(), raw, async p => { await handleUnblacklist(p, state, sync); }, () => render());
  };
  const handleAddRegular = async (s, cb) => { const p = await pickDirectory(); if (p) { s.paths.push(p); await cb(p); } };
