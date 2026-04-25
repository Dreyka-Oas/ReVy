import { open } from "@tauri-apps/plugin-dialog";
import { saveScanState, addToBlacklist, removeFromBlacklist } from "./storage";

export async function pickDirectory() {
  return open({ directory: true, multiple: false, title: "Choisir un dossier", defaultPath: "/home" });
}

export async function handleDelete(path, state, syncCallback) {
  addToBlacklist(path);
  state.paths = state.paths.filter(p => p !== path);
  state.parentPaths = state.parentPaths.filter(p => p !== path);
  if (state.activePath === path) {
    state.activePath = state.paths[0] || state.parentPaths[0] || null;
  }
  await saveScanState(state);
  syncCallback?.(true);
}

export async function handleUnblacklist(path, state, syncCallback) {
  removeFromBlacklist(path);
  if (!state.paths.includes(path) && !state.parentPaths.includes(path)) {
    state.paths.push(path);
  }
  await saveScanState(state);
  syncCallback?.(true);
}

export async function handleAddParent(state, syncCallback, setActiveCallback) {
  const selected = await pickDirectory();
  if (selected) {
    if (!state.parentPaths.includes(selected)) state.parentPaths.push(selected);
    await saveScanState(state);
    await syncCallback(true);
    setActiveCallback(selected);
  }
}
