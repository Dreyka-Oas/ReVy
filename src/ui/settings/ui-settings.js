import { setCurrentView } from '../ui-core.js';
import { closeSettings } from './ui-panels.js';
import { findLogo, getLogoUrl } from '../../utils/logoFinder.js';
import { parentIcon, testIcon } from '../icons.js';

function updateHeader(view, onAddParent, onShowBlacklist, onAddRegular, onShowParents) {
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

function getList() { return document.getElementById('settings-list'); }

export function createFolderItem(entry, activePath, onDelete, showDelete, onSelect, logoUrl) {
  const item = document.createElement('div');
  item.dataset.path = entry.path;
  item.className = `settings-item${entry.path === activePath ? ' active' : ''}`;
  const name = entry.name || entry.path.split(/[/\\]/).filter(Boolean).pop() || entry.path;
  const loaderIcons = (entry.loaders || []).map(loader => `<img src="${loader.icon}" title="${loader.name}" alt="${loader.name}" />`).join('');
  item.innerHTML = `
    <div class="settings-item-content">
      ${logoUrl ? `<img src="${logoUrl}" class="settings-item-logo" onerror="this.style.display='none'" />` : ''}
      <span class="settings-item-name">${name}</span>
      ${loaderIcons ? `<div class="settings-item-icons">${loaderIcons}</div>` : ''}
    </div>
    ${showDelete ? `<button class="settings-delete-btn" title="Supprimer">✕</button>` : ''}
  `;
  const deleteBtn = item.querySelector('.settings-delete-btn');
  if (deleteBtn && onDelete) {
    deleteBtn.onclick = (e) => { e.stopPropagation(); onDelete(entry.path); };
  }
  item.onclick = () => onSelect?.(entry.path);
  return item;
}

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
  parents.forEach(p => {
    const item = document.createElement('div');
    item.className = 'settings-item';
    item.innerHTML = `<div class="settings-item-btn" title="${p}">${p}</div>`;
    const del = document.createElement('button');
    del.className = 'settings-delete-btn'; del.innerHTML = '✕'; del.style.cursor = 'pointer';
    del.onclick = () => onRem(p);
    item.appendChild(del); l.appendChild(item);
  });
}

export async function renderBlacklist(blacklist, entries, onRem, onBack) {
  const l = getList(); if (!l) return;
  l.innerHTML = ''; setCurrentView('blacklist');
  updateHeader('blacklist', null, null, null, onBack);
  if (!blacklist.length) { l.innerHTML = `<div class="settings-empty">Aucun dossier blacklisté.</div>`; return; }
  for (const path of blacklist) {
    const entry = entries?.find(e => e.path === path);
    const name = path.split(/[/\\]/).filter(Boolean).pop() || path;
    const logoPath = await findLogo(path);
    const logoUrl = logoPath ? await getLogoUrl(logoPath) : null;
    const loaderIcons = (entry?.loaders || []).map(ld => `<img src="${ld.icon}" title="${ld.name}" alt="${ld.name}" />`).join('');
    const item = document.createElement('div');
    item.className = 'settings-item';
    item.innerHTML = `
      <div class="settings-item-content">
        ${logoUrl ? `<img src="${logoUrl}" class="settings-item-logo" onerror="this.style.display='none'" />` : ''}
        <span class="settings-item-name">${name}</span>
        ${loaderIcons ? `<div class="settings-item-icons">${loaderIcons}</div>` : ''}
      </div>
      <button class="settings-delete-btn" title="Débloquer">✕</button>
    `;
    item.querySelector('.settings-delete-btn').onclick = () => onRem(path);
    l.appendChild(item);
  }
}
