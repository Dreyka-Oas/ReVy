import { findLogo, getLogoUrl } from '../../utils/logoFinder.js';
import { setCurrentView } from '../ui-core.js';
import { updateHeader } from './ui-settings-header.js';
import { getList, createFolderItem, createParentItem, createBlacklistItem } from './ui-settings-items.js';

export async function renderSettings(entries, active, onDel, onAddP, onBlack, onAddR, onShowP, onSelect) {
  const l = getList(); if (!l) return;
  l.innerHTML = ''; setCurrentView('folders');
  updateHeader('folders', onAddP, onBlack, onAddR, onShowP);
  if (!entries.length) { l.innerHTML = `<div class="settings-empty">Aucun dossier.</div>`; return; }
  for (const e of entries) {
    const logoPath = await findLogo(e.path);
    const logoUrl = logoPath ? await getLogoUrl(logoPath) : null;
    const item = createFolderItem(e, active, onDel, true, onSelect, logoUrl);
    l.appendChild(item);
  }
}

export function renderParentList(parents, onRem, onBack, onAddP) {
  const l = getList(); if (!l) return;
  l.innerHTML = ''; setCurrentView('parents');
  updateHeader('parents', onAddP, null, null, onBack);
  parents.forEach(p => l.appendChild(createParentItem(p, onRem)));
}

export async function renderBlacklist(blacklist, entries, onRem, onBack) {
  const l = getList(); if (!l) return;
  l.innerHTML = ''; setCurrentView('blacklist');
  updateHeader('blacklist', null, null, null, onBack);
  if (!blacklist.length) { l.innerHTML = `<div class="settings-empty">Aucun dossier blacklisté.</div>`; return; }
  for (const path of blacklist) {
    const entry = entries?.find(e => e.path === path);
    const logoPath = await findLogo(path);
    const logoUrl = logoPath ? await getLogoUrl(logoPath) : null;
    const item = createBlacklistItem(path, entry, onRem);
    if (logoUrl) item.querySelector('.settings-item-content')?.insertAdjacentHTML('afterbegin', `<img src="${logoUrl}" class="settings-item-logo" onerror="this.style.display='none'" />`);
    l.appendChild(item);
  }
}