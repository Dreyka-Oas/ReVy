import { loadVersionsForLoader } from './ui/settings/ui-versions.js';
import { sortVersions } from './utils/core_helpers/helpers.js';

export let testGlobalLoaders = [];
export let testGlobalVersions = {};

export function setTestGlobalLoaders(loaders) { testGlobalLoaders = loaders; }
export function getTestGlobalLoaders() { return testGlobalLoaders; }
export function getTestGlobalVersions() { return testGlobalVersions; }

export function createTestLoaderItemHtml(loader, loaderIndex, versions) {
  return `<div class="test-loader-item"><div class="test-loader-header" data-loader-index="${loaderIndex}"><span class="test-loader-expand">▶</span><img src="${loader.icon}" style="width: 20px; height: 20px; object-fit: contain;" /><span class="test-loader-name">${loader.name}</span><span class="test-loader-count">(${versions.length} sélectionnée(s))</span></div><div class="test-loader-versions hidden" id="test-loader-versions-${loaderIndex}"></div></div>`;
}

const versionsFor = path => testGlobalVersions[path] || [];
export const renderLoaderIcons = loaders => loaders.map(loader => `<img src="${loader.icon}" class="version-loader-icon" title="${loader.name}" alt="${loader.name}" />`).join('');
export async function getMergedTestVersions(loaders) {
  const map = new Map();
  for (const loader of loaders) {
    const versions = await loadVersionsForLoader(loader);
    for (const version of versions) {
      if (!map.has(version)) map.set(version, []);
      map.get(version).push(loader);
    }
  }
  const sorted = sortVersions([...map.keys()]);
  return sorted.map(version => ({ version, loaders: map.get(version) }));
}
const refreshCounts = () => document.querySelectorAll('.test-loader-header').forEach(headerEl => { const loader = testGlobalLoaders[+headerEl.dataset.loaderIndex]; headerEl.querySelector('.test-loader-count').textContent = `(${versionsFor(loader.path).length} sélectionnée(s))`; });
const syncVersion = (path, version, checked) => { if (!testGlobalVersions[path]) testGlobalVersions[path] = []; testGlobalVersions[path] = checked ? (testGlobalVersions[path].includes(version) ? testGlobalVersions[path] : [...testGlobalVersions[path], version]) : testGlobalVersions[path].filter(v => v !== version); refreshCounts(); };

export function attachTestLoaderHeaderHandlers() {
  document.querySelectorAll('.test-loader-header').forEach(headerEl => {
    headerEl.onclick = async () => {
      const loaderIndex = +headerEl.dataset.loaderIndex;
      const versionsDiv = document.getElementById(`test-loader-versions-${loaderIndex}`);
      const expandIcon = headerEl.querySelector('.test-loader-expand');
      if (!versionsDiv.classList.contains('hidden')) { versionsDiv.classList.add('hidden'); expandIcon.textContent = '▶'; return; }
      versionsDiv.classList.remove('hidden'); expandIcon.textContent = '▼';
      if (versionsDiv.innerHTML.trim()) return;
      const loader = testGlobalLoaders[loaderIndex];
      versionsDiv.innerHTML = (await loadVersionsForLoader(loader)).map(v => `<div class="test-version-item"><label class="test-version-checkbox"><input type="checkbox" data-loader-path="${loader.path}" data-version="${v}" ${versionsFor(loader.path).includes(v) ? 'checked' : ''}><span>${v}</span></label></div>`).join('');
      versionsDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.onchange = e => syncVersion(e.target.dataset.loaderPath, e.target.dataset.version, e.target.checked));
    };
  });
}

export function attachTestGlobalButtonHandler(onTestGlobal) {
  const testGlobalBtn = document.getElementById('test-global-btn');
  if (testGlobalBtn) testGlobalBtn.onclick = () => { const selected = []; Object.entries(testGlobalVersions).forEach(([loaderPath, versions]) => versions.forEach(version => selected.push({ loaderPath, version }))); if (!selected.length) return alert('Veuillez sélectionner au moins 1 version pour le test global.'); onTestGlobal?.(selected); };
}

export function attachRamInputHandlers(systemRam, onSave) {
  const minInput = document.getElementById('ram-min-input');
  const maxInput = document.getElementById('ram-max-input');
  const focusInput = input => {
    if (input) {
      input.focus();
      input.select?.();
    }
  };
  const sync = input => { let val = Math.max(1, Math.min(systemRam, parseInt(input.value, 10) || 1)); val = input === minInput && val > parseInt(maxInput.value, 10) ? parseInt(maxInput.value, 10) : input === maxInput && val < parseInt(minInput.value, 10) ? parseInt(minInput.value, 10) : val; input.value = val; onSave?.(parseInt(minInput.value, 10), parseInt(maxInput.value, 10)); };
  minInput?.closest('.java-ram-input-group')?.addEventListener('click', e => {
    if (e.target !== minInput) focusInput(minInput);
  });
  maxInput?.closest('.java-ram-input-group')?.addEventListener('click', e => {
    if (e.target !== maxInput) focusInput(maxInput);
  });
  minInput?.addEventListener('change', () => sync(minInput));
  maxInput?.addEventListener('change', () => sync(maxInput));
}

export function updateTestProgress(current, total) {
  const testGlobalControls = document.querySelector('.test-global-controls');
  if (!testGlobalControls) return;
  testGlobalControls.innerHTML = current === 0 || total === 0 ? `<label class="test-log-checkbox"><input type="checkbox" id="test-log-checkbox"><span>Log</span></label><button id="test-global-btn" class="test-global-btn">Test Global</button>` : `<div class="test-progress-container"><span class="test-progress-text">Version ${current}/${total}</span><div class="test-progress-bar"><div class="test-progress-fill" style="width: ${(current / total) * 100}%"></div></div></div>`;
}
