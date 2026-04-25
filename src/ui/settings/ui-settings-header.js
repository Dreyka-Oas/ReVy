import { closeSettings } from './ui-panels.js';
import { parentIcon, testIcon } from '../icons.js';

export function updateHeader(view, onAddParent, onShowBlacklist, onAddRegular, onShowParents) {
  const header = document.getElementById('settings-header');
  const sub = document.getElementById('settings-subheader');
  if (!header || !sub) return;
  sub.style.display = 'none';
  if (view === 'test') {
    header.innerHTML = `<h2 style="margin: 0; font-size: 1rem;">${testIcon} Test</h2><div style="display: flex; gap: 4px; margin-left: auto; align-items: center;"><button id="settings-close-header-btn" class="settings-close-btn" style="cursor: pointer;">✕</button></div>`;
    document.getElementById('settings-close-header-btn').onclick = closeSettings;
  } else if (view === 'folders') {
    header.innerHTML = `<h2 style="margin: 0; font-size: 1rem;">📁 Dossiers</h2><div style="display: flex; gap: 4px; margin-left: auto; align-items: center;"><button id="settings-list-parents-btn" class="settings-action-btn" title="Parents" style="display: flex; align-items: center; gap: 4px; font-size: 0.85rem; cursor: pointer;">${parentIcon}</button><button id="settings-add-regular-btn" class="settings-add-btn" title="Ajouter" style="cursor: pointer; font-size: 0.85rem;">+</button><button id="settings-blacklist-btn" class="settings-blacklist-btn" style="cursor: pointer; font-size: 0.85rem;">⛔</button><button id="settings-close-header-btn" class="settings-close-btn" style="cursor: pointer;">✕</button></div>`;
    document.getElementById('settings-list-parents-btn').onclick = onShowParents;
    document.getElementById('settings-add-regular-btn').onclick = onAddRegular;
    document.getElementById('settings-blacklist-btn').onclick = onShowBlacklist;
  } else if (view === 'parents') {
    header.innerHTML = `<h2 style="margin: 0; font-size: 1rem;">📂 Parents</h2><div style="display: flex; gap: 4px; margin-left: auto; align-items: center;"><button id="settings-add-parent-btn" class="settings-action-btn" title="Ajouter" style="display: flex; align-items: center; gap: 4px; font-size: 0.85rem; cursor: pointer;">+</button><button id="settings-action-btn" class="settings-back-btn" style="cursor: pointer; font-size: 0.85rem;">↩</button><button id="settings-close-header-btn" class="settings-close-btn" style="cursor: pointer;">✕</button></div>`;
    document.getElementById('settings-add-parent-btn').onclick = onAddParent;
    document.getElementById('settings-action-btn').onclick = onShowParents;
  } else {
    header.innerHTML = `<h2 style="margin: 0; font-size: 1rem;">⛔ Blacklist</h2><div style="display: flex; gap: 4px; margin-left: auto; align-items: center;"><button id="settings-action-btn" class="settings-back-btn" style="cursor: pointer; font-size: 0.85rem;">↩</button><button id="settings-close-header-btn" class="settings-close-btn" style="cursor: pointer;">✕</button></div>`;
    document.getElementById('settings-action-btn').onclick = onShowParents;
  }
  document.getElementById('settings-close-header-btn').onclick = closeSettings;
}