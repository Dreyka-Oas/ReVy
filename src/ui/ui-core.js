export let loaderSection;
export let loaderList;
export let settingsPanel;
export let settingsList;
export let settingsHeader;
export let settingsSubheader;
export let settingsContent;

let currentView = 'folders';
let parentFolders = [];

export function getCurrentView() { return currentView; }
export function setCurrentView(view) { currentView = view; }
export function getParentFolders() { return parentFolders; }
export function setParentFolders(folders) { parentFolders = folders; }

export function initUI() {
  loaderSection = document.getElementById('loader-section');
  loaderList = document.getElementById('loader-list');
  settingsPanel = document.getElementById('settings-panel');
  settingsList = document.getElementById('settings-list');
  settingsHeader = document.getElementById('settings-header');
  settingsSubheader = document.getElementById('settings-subheader');
  settingsContent = document.getElementById('settings-content');
}
