import { findLogo, getLogoUrl } from '../../utils/logoFinder.js';

export function getList() { return document.getElementById('settings-list'); }

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
  if (deleteBtn && onDelete) { deleteBtn.onclick = (e) => { e.stopPropagation(); onDelete(entry.path); }; }
  item.onclick = () => onSelect?.(entry.path);
  return item;
}

export function createParentItem(path, onRemove) {
  const item = document.createElement('div');
  item.className = 'settings-item';
  item.innerHTML = `<div class="settings-item-btn" title="${path}">${path}</div>`;
  const del = document.createElement('button');
  del.className = 'settings-delete-btn'; del.innerHTML = '✕'; del.style.cursor = 'pointer';
  del.onclick = () => onRemove(path);
  item.appendChild(del);
  return item;
}

export function createBlacklistItem(path, entry, onRemove) {
  const item = document.createElement('div');
  item.className = 'settings-item';
  const name = path.split(/[/\\]/).filter(Boolean).pop() || path;
  const loaderIcons = (entry?.loaders || []).map(ld => `<img src="${ld.icon}" title="${ld.name}" alt="${ld.name}" />`).join('');
  item.innerHTML = `
    <div class="settings-item-content">
      <span class="settings-item-name">${name}</span>
      ${loaderIcons ? `<div class="settings-item-icons">${loaderIcons}</div>` : ''}
    </div>
    <button class="settings-delete-btn" title="Débloquer">✕</button>
  `;
  item.querySelector('.settings-delete-btn').onclick = () => onRemove(path);
  return item;
}