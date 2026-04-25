import { loaderSection, loaderList } from './ui-core.js';
import { extractDominantColor } from '../utils/logoFinder';

export function showLoading() {
  if (!loaderList) return;
  loaderList.innerHTML = `
    <div class="loading-container">
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
    </div>
  `;
  loaderSection?.classList.remove('hidden');
}

export async function showLoaders(loaders, debugLines = [], onSelectLoader) {
  if (!loaderList) return;
  loaderList.innerHTML = '';

  if (loaders.length === 0) {
    const details = debugLines.length
      ? `<div class="scan-debug">${debugLines.map(line => `<div>${line}</div>`).join('')}</div>`
      : '';
    loaderList.innerHTML = `<div class="no-loaders">Aucun loader Minecraft détecté</div>${details}`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'loader-grid';

  for (const loader of loaders) {
    const card = document.createElement('div');
    card.className = 'loader-card';

    const img = document.createElement('img');
    img.src = loader.customIcon || loader.icon;
    img.alt = loader.name;
    img.className = loader.cssClass || '';
    img.onerror = () => { if (loader.customIcon && img.src !== loader.icon) img.src = loader.icon; };

    if (loader.customIcon) {
      try {
        const color = await extractDominantColor(loader.customIcon);
        if (color) {
          const bg = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`;
          card.style.setProperty('--card-bg', bg);
          console.log('[UI] Loader:', loader.name, '| Color:', color, '| BG:', bg);
        } else {
          console.log('[UI] Loader:', loader.name, '| Color: null (no color extracted)');
        }
      } catch (e) {
        console.error('[UI] Loader:', loader.name, '| Color error:', e);
      }
    } else {
      console.log('[UI] Loader:', loader.name, '| No customIcon (using default)');
    }

    const name = document.createElement('span');
    name.className = 'loader-name';
    name.textContent = loader.name;

    const count = document.createElement('span');
    count.className = 'loader-count';
    count.textContent = `${loader.versionCount ?? 0} version(s)`;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(count);

    if (onSelectLoader) {
      card.style.cursor = 'pointer';
      card.onclick = () => onSelectLoader(loader);
    }

    grid.appendChild(card);
  }

  loaderList.appendChild(grid);
}

export function showError(message) {
  if (!loaderList) return;
  loaderList.innerHTML = `<div class="error-message">${message}</div>`;
}