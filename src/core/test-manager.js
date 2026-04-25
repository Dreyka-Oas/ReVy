import { getJavaRamConfig } from './cache.js';
import { launchMinecraftVersion } from '../java_utils.js';
import { writeTextFile, remove, BaseDirectory } from '@tauri-apps/plugin-fs';

let testLogEnabled = false;
let isTestRunning = false;
let currentTestIndex = 0;
let totalTests = 0;

const toMsg = args => args.map(a => (a && typeof a === 'object') ? JSON.stringify(a) : String(a)).join(' ');
const setButtons = running => {
  const testBtn = document.getElementById('test-btn');
  if (testBtn) { testBtn.classList.toggle('test-running', running); testBtn.title = running ? 'Test en cours...' : ''; }
  document.querySelectorAll('.version-play-btn').forEach(btn => { btn.classList.toggle('disabled', running); btn.disabled = running; });
};

export function getIsTestRunning() { return isTestRunning; }
export function getCurrentTestIndex() { return currentTestIndex; }
export function getTotalTests() { return totalTests; }
export function setTestLogEnabled(enabled) { testLogEnabled = enabled; }
export function getTestLogEnabled() { return testLogEnabled; }
export function setIsTestRunning(running, index = 0, total = 0) { isTestRunning = running; currentTestIndex = index; totalTests = total; setButtons(running); }
export function updateTestButtonsState() { setButtons(isTestRunning); }

export async function runTestGlobal(selected, onProgress) {
  const { min, max } = getJavaRamConfig();
  let logContent = '';
  const addLog = line => { if (testLogEnabled) logContent += `${line}\n`; };
  if (testLogEnabled) { try { await remove('log.txt', { baseDir: BaseDirectory.ExeDir }); } catch {} }
  isTestRunning = true; totalTests = selected.length; currentTestIndex = 0; setButtons(true);
  const originalLog = console.log;
  const originalError = console.error;
  const capture = (prefix, original) => (...args) => { addLog(`[${new Date().toLocaleTimeString()}] ${prefix}${toMsg(args)}`); original.apply(console, args); };
  console.log = capture('', originalLog);
  console.error = capture('ERROR: ', originalError);
  try {
    for (let i = 0; i < selected.length && isTestRunning; i++) {
      currentTestIndex = i + 1; setIsTestRunning(true, currentTestIndex, totalTests); onProgress?.(currentTestIndex, totalTests);
      const { loaderPath, version } = selected[i];
      if (testLogEnabled && i > 0) logContent += `\n${'='.repeat(50)}\n`;
      const versionHeader = `=== [${i + 1}/${selected.length}] Version: ${version} ===`;
      addLog(versionHeader); console.log(versionHeader);
      try {
        await launchMinecraftVersion(loaderPath, version, min, max);
        console.log(`Version ${version} lancée avec succès`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (e) { console.error(`Erreur pour ${version}:`, e); }
    }
    if (testLogEnabled && logContent.trim()) { await writeTextFile('log.txt', logContent, { baseDir: BaseDirectory.ExeDir }); console.log('Log enregistré dans log.txt'); }
  } finally {
    console.log = originalLog;
    console.error = originalError;
    isTestRunning = false; currentTestIndex = 0; totalTests = 0; setButtons(false);
    onProgress?.(0, 0);
  }
}
