import { toggleVersionsPanel } from './ui-panels.js';
import { javaIcon, installIcon } from '../icons.js';

let currentJavaOnInstall = null;

export function renderJavaPanel(installed, available, onClose, onInstall, onReload, onUninstall, installingId = null) {
  if (installingId) currentJavaOnInstall = installingId;
  const header = document.getElementById('versions-header');
  const list = document.getElementById('versions-list');
  if (!header || !list) return;
  list.className = 'versions-list java-panel';
  header.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;"><img src="/java.png" style="width: 24px; height: 24px; object-fit: contain;" /><h3>Java</h3></div><div class="versions-header-actions"><button id="versions-close-btn" class="versions-header-btn" title="Fermer">✕</button></div>`;
  document.getElementById('versions-close-btn').onclick = onClose;
  list.innerHTML = '';
  const split = document.createElement('div');
  split.className = 'version-list-split';
  const installedContainer = document.createElement('div');
  installedContainer.className = 'java-section-container';
  installedContainer.innerHTML = `<div class="java-section-title">INSTALLÉES (${installed.length})</div>`;
  const installedContent = document.createElement('div');
  installedContent.className = 'java-section-content';
  if (installed.length === 0) installedContent.innerHTML = `<div class="version-empty">Aucune</div>`;
  else {
    installed.forEach(v => {
      const item = document.createElement('div');
      item.dataset.identifier = v.identifier;
      item.className = 'version-item java-installed-item';
      item.innerHTML = `<span class="version-icon">${javaIcon}</span><div class="java-version-info"><span class="version-name">${v.version}</span><span class="java-vendor">${v.vendor}</span></div><button class="java-uninstall-btn" data-identifier="${v.identifier}" title="Désinstaller">✕</button>`;
      item.querySelector('.java-uninstall-btn').onclick = (e) => { e.stopPropagation(); onUninstall(v.identifier); };
      installedContent.appendChild(item);
    });
  }
  installedContainer.appendChild(installedContent);
  split.appendChild(installedContainer);
  const availableNotInstalled = available.filter(v => !v.installed);
  const availableContainer = document.createElement('div');
  availableContainer.className = 'java-section-container';
  availableContainer.innerHTML = `<div class="java-section-title">DISPONIBLES (${availableNotInstalled.length})</div>`;
  const availableContent = document.createElement('div');
  availableContent.className = 'java-section-content';
  if (availableNotInstalled.length === 0) availableContent.innerHTML = `<div class="version-empty">Aucune</div>`;
  else {
    availableNotInstalled.forEach(v => {
      const isInstalling = currentJavaOnInstall === v.identifier;
      const item = document.createElement('div');
      item.dataset.identifier = v.identifier;
      item.className = `version-item java-available-item${isInstalling ? ' installing' : ''}`;
      item.innerHTML = `<span class="version-icon">${installIcon}</span><div class="java-version-info"><span class="version-name">${v.version}</span><span class="java-vendor">${v.vendor}</span></div>${!isInstalling ? `<button type="button" class="java-install-btn" data-identifier="${v.identifier}">Installer</button>` : ''}`;
      if (!isInstalling) item.querySelector('.java-install-btn').onclick = (e) => { e.stopPropagation(); onInstall(v.identifier); };
      availableContent.appendChild(item);
    });
  }
  availableContainer.appendChild(availableContent);
  split.appendChild(availableContainer);
  list.appendChild(split);
  toggleVersionsPanel(true);
}

export function setJavaInstalling(identifier, progress) {
  currentJavaOnInstall = identifier;
  const item = document.querySelector(`.java-panel .version-item[data-identifier="${identifier}"]`);
  if (!item) return;
  if (progress < 0) { item.classList.remove('installing'); item.style.removeProperty('--java-progress'); return; }
  if (!item.classList.contains('installing')) { item.classList.add('installing'); item.querySelector('.java-install-btn, .java-uninstall-btn')?.remove(); }
  item.style.setProperty('--java-progress', `${progress}%`);
}

export function clearJavaInstalling() { currentJavaOnInstall = null; }