export function togglePanel(panelId, force) {
  const p = document.getElementById(panelId);
  if (p) p.classList.toggle('hidden', force === undefined ? !p.classList.contains('hidden') : !force);
}
export function toggleSettingsPanel(force) { togglePanel('settings-panel', force); }
export function toggleVersionsPanel(force) { togglePanel('versions-panel', force); }

export function closeSettings() { toggleSettingsPanel(false); }
