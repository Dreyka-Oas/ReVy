import { toggleVersionsPanel, toggleSettingsPanel } from './ui-panels.js';
import { setCurrentView } from '../ui-core.js';
import { getJavaRamConfig } from '../../core/cache.js';
import { getSystemRam } from '../../utils/systemInfo.js';
import { loadVersionsForLoader } from './ui-versions.js';
import { testIcon } from '../icons.js';
import { testGlobalLoaders, testGlobalVersions, createTestLoaderItemHtml, attachTestLoaderHeaderHandlers, attachTestGlobalButtonHandler, attachRamInputHandlers, getMergedTestVersions, renderLoaderIcons } from '../../ui_test_state.js';

let lastTestPanel = null;

export async function renderAllVersions() {
  const header = document.getElementById('versions-header');
  const content = document.getElementById('versions-list');
  if (!header || !content || !lastTestPanel) return;
  toggleSettingsPanel(false); toggleVersionsPanel(true); setCurrentView('test');
  header.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">${testIcon}<h3>Toutes</h3></div><div class="versions-header-actions"><button id="versions-back-btn" class="versions-header-btn" title="Retour">↩</button><button id="versions-close-btn" class="versions-header-btn" title="Fermer">✕</button></div>`;
  document.getElementById('versions-back-btn').onclick = () => renderJavaRamPanel(...lastTestPanel);
  document.getElementById('versions-close-btn').onclick = () => toggleVersionsPanel(false);
  const groups = await getMergedTestVersions(testGlobalLoaders);
  content.className = 'versions-list all-versions-list';
  content.innerHTML = groups.length ? groups.map(({ version, loaders }) => `<div class="version-item version-item-all"><div class="version-item-main"><span class="version-name">${version}</span></div><div class="version-item-actions"><span class="version-loader-icons">${renderLoaderIcons(loaders)}</span></div></div>`).join('') : '<div class="version-empty">Aucune version</div>';
}

export function renderJavaRamPanel(systemRam, onSave, onTestGlobal, onToggleLog) {
  lastTestPanel = [systemRam, onSave, onTestGlobal, onToggleLog];
  const header = document.getElementById('versions-header');
  const content = document.getElementById('versions-list');
  if (!header || !content) return;
  toggleSettingsPanel(false);
  toggleVersionsPanel(true);
  setCurrentView('test');
  const config = getJavaRamConfig();
  const minVal = Math.max(1, Math.min(systemRam, config.min));
  const maxVal = Math.max(minVal, Math.min(systemRam, config.max));
  content.className = 'versions-list';
  header.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">${testIcon}<h3>Test</h3></div><div class="versions-header-actions"><button id="versions-all-btn" class="versions-header-btn" title="Toutes versions">Toutes</button><button id="versions-close-btn" class="versions-header-btn" title="Fermer">✕</button></div>`;
  document.getElementById('versions-close-btn').onclick = () => toggleVersionsPanel(false);
  let loadersHtml = '';
  testGlobalLoaders.forEach((loader, loaderIndex) => {
    const vers = testGlobalVersions[loader.path] || [];
    loadersHtml += createTestLoaderItemHtml(loader, loaderIndex, vers);
  });
  content.innerHTML = `<div class="java-ram-panel"><div class="test-global-controls"><label class="test-log-checkbox"><input type="checkbox" id="test-log-checkbox" checked><span>Log</span></label><button id="test-global-btn" class="test-global-btn">Test Global</button></div><div class="java-ram-input-row"><div class="java-ram-input-group"><label for="ram-min-input">Min</label><div class="java-ram-input-wrapper"><input type="number" id="ram-min-input" min="1" max="${systemRam}" value="${minVal}" step="1"><span>GB</span></div></div><div class="java-ram-input-group"><label for="ram-max-input">Max</label><div class="java-ram-input-wrapper"><input type="number" id="ram-max-input" min="1" max="${systemRam}" value="${maxVal}" step="1"><span>GB</span></div></div></div><div class="test-loaders-list"><h4>Loaders</h4>${loadersHtml}</div></div>`;
  const logCheckbox = document.getElementById('test-log-checkbox');
  if (logCheckbox) logCheckbox.addEventListener('change', (e) => onToggleLog?.(e.target.checked));
  attachTestLoaderHeaderHandlers();
  attachTestGlobalButtonHandler(onTestGlobal);
  attachRamInputHandlers(systemRam, onSave);
  document.getElementById('versions-all-btn').onclick = renderAllVersions;
  toggleVersionsPanel(true);
}

export function setupBackButton(onShowAllVersions) {
  const backBtn = document.getElementById('versions-back-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      toggleVersionsPanel(true);
      toggleSettingsPanel(false);
      setCurrentView('test');
      getSystemRam().then(systemRam => {
        const config = getJavaRamConfig();
        const minVal = Math.max(1, Math.min(systemRam, config.min));
        const maxVal = Math.max(minVal, Math.min(systemRam, config.max));
        const versionsHeader = document.getElementById('versions-header');
        const versionsList = document.getElementById('versions-list');
        versionsHeader.innerHTML = `<div style="display: flex; align-items: center; gap: 8px;">${testIcon}<h3>Test</h3></div><div class="versions-header-actions"><button id="versions-all-btn" class="versions-header-btn" title="Toutes versions">Toutes</button><button id="versions-close-btn" class="versions-header-btn" title="Fermer">✕</button></div>`;
        document.getElementById('versions-close-btn').onclick = () => toggleVersionsPanel(false);
        document.getElementById('versions-all-btn').onclick = onShowAllVersions;
        if (versionsList) {
          versionsList.className = 'versions-list';
          let loadersHtml = '';
          testGlobalLoaders.forEach((loader, loaderIndex) => {
            const vers = testGlobalVersions[loader.path] || [];
            loadersHtml += createTestLoaderItemHtml(loader, loaderIndex, vers);
          });
          versionsList.innerHTML = `<div class="java-ram-panel"><div class="test-global-controls"><label class="test-log-checkbox"><input type="checkbox" id="test-log-checkbox" checked><span>Log</span></label><button id="test-global-btn" class="test-global-btn">Test Global</button></div><div class="java-ram-input-row"><div class="java-ram-input-group"><label>Min</label><div class="java-ram-input-wrapper"><input type="number" id="ram-min-input" min="1" max="${systemRam}" value="${minVal}" step="1"><span>GB</span></div></div><div class="java-ram-input-group"><label>Max</label><div class="java-ram-input-wrapper"><input type="number" id="ram-max-input" min="1" max="${systemRam}" value="${maxVal}" step="1"><span>GB</span></div></div></div><div class="test-loaders-list"><h4>Loaders</h4>${loadersHtml}</div></div>`;
          attachTestLoaderHeaderHandlers();
          attachTestGlobalButtonHandler(null);
          attachRamInputHandlers(systemRam, null);
        }
      });
    };
  }
  const closeBtn = document.getElementById('versions-close-header-btn');
  if (closeBtn) closeBtn.onclick = () => { toggleVersionsPanel(false); toggleSettingsPanel(false); };
}
