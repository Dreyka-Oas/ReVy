import { toggleVersionsPanel } from './ui-panels.js';
import { folderIcon, playIcon } from '../icons.js';

export function renderVersions(versions, loaderName, loaderIconUrl, loaderPath, onClose, onPlay) {
  const header = document.getElementById('versions-header');
  const list = document.getElementById('versions-list');
  if (!header || !list) return;
  list.className = 'versions-list';
  header.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;"><img src="${loaderIconUrl}" style="width: 24px; height: 24px; object-fit: contain;" /><h3>${loaderName} (${versions.length})</h3></div><div class="versions-header-actions"><button id="versions-close-btn" class="versions-header-btn" title="Fermer">✕</button></div>`;
  document.getElementById('versions-close-btn').onclick = onClose;
  list.innerHTML = '';
  if (!versions.length) { list.innerHTML = '<div class="version-empty">Aucune version</div>'; toggleVersionsPanel(true); return; }
  const template = document.createElement('template');
  template.innerHTML = `<div class="version-item"><div class="version-item-main"><span class="version-icon">${folderIcon}</span><span class="version-name"></span></div><div class="version-item-actions"><button type="button" class="version-play-btn" title="Play"><span class="version-play-icon">${playIcon}</span><span>Play</span></button></div></div>`;
  versions.forEach(v => {
    const item = template.content.cloneNode(true).firstElementChild;
    item.querySelector('.version-name').textContent = v;
    item.querySelector('.version-play-btn').onclick = (e) => { e.stopPropagation(); onPlay?.(v, loaderPath, e.target.closest('.version-play-btn')); };
    list.appendChild(item);
  });
  toggleVersionsPanel(true);
}