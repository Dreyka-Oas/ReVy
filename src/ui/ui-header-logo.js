import { getLogoUrl } from "../utils/logoFinder";

const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="4 4 12 20 20 4"></polyline>
</svg>`;

const reloadIcon = `<svg class="reload-icon" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 2v6h-6"></path>
  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
  <path d="M3 22v-6h6"></path>
  <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
</svg>`;

let currentLogoUrl = null;

export async function updateHeaderLogo(logoPath) {
  const iconWrapper = document.querySelector('.icon-wrapper');
  if (!iconWrapper) return;

  if (currentLogoUrl) {
    URL.revokeObjectURL(currentLogoUrl);
    currentLogoUrl = null;
  }

  if (!logoPath) {
    iconWrapper.innerHTML = defaultIcon + reloadIcon;
    return;
  }

  const url = await getLogoUrl(logoPath);
  if (url) {
    currentLogoUrl = url;
    iconWrapper.innerHTML = `<img src="${url}" style="width: 64px; height: 64px; object-fit: contain;" />` + reloadIcon;
  } else {
    iconWrapper.innerHTML = defaultIcon + reloadIcon;
  }
}

export function updateHeaderTitle(folderName) {
  const titleEl = document.querySelector('h1');
  if (!titleEl) return;

  if (folderName) {
    titleEl.textContent = folderName;
  } else {
    titleEl.textContent = 'VeRy';
  }
}

export function updatePickerButton(show) {
  const btn = document.getElementById('picker-btn');
  if (!btn) return;

  if (show) {
    btn.classList.remove('hidden');
  } else {
    btn.classList.add('hidden');
  }
}

export function showReloadIcon() {
  const iconWrapper = document.querySelector('.icon-wrapper');
  if (!iconWrapper) return;
  if (!iconWrapper.querySelector('.reload-icon')) {
    iconWrapper.innerHTML += reloadIcon;
  }
  iconWrapper.classList.add('loading');
}

export function hideReloadIcon() {
  const iconWrapper = document.querySelector('.icon-wrapper');
  if (!iconWrapper) return;
  iconWrapper.classList.remove('loading');
}