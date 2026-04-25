export const STORAGE_KEYS = {
  SCAN_STATE: 'lethalbreed_scan_state',
  BLACKLIST: 'lethalbreed_blacklist',
  RAW_ENTRIES: 'lethalbreed_raw_entries',
  SCAN_CACHE: 'lethalbreed_scan_cache',
  VERSIONS_CACHE: 'lethalbreed_versions_cache',
  LOADER_CACHE: 'lethalbreed_loader_cache',
  JAVA_RAM_CONFIG: 'java_ram_config',
  JAVA_INSTALLED_CACHE: 'java_installed_cache',
  JAVA_AVAILABLE_CACHE: 'java_available_cache',
};

export const JVM_ARGS = "-Xms{}G -Xmx{}G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1";

export const IGNORED_DIRS = ['.git', '.gradle', '.cache', 'build', 'node_modules', 'target'];

export const LOADER_NAMES = ['forge', 'neoforge', 'fabric'];

export const ICONS = {
  forge: '/forge.png',
  neoforge: '/neoforge.png',
  fabric: '/fabric.png',
};

export const POPULAR_JAVA_VERSIONS = [
  ["21.0.10", "Amazon", "21.0.10-amzn"],
  ["17.0.18", "Amazon", "17.0.18-amzn"],
  ["11.0.30", "Amazon", "11.0.30-amzn"],
  ["8.0.472", "Amazon", "8.0.472-amzn"],
  ["21.0.2", "OpenJDK", "21.0.2-open"],
  ["17.0.14", "JetBrains", "17.0.14-jbr"],
  ["21.0.10", "JetBrains", "21.0.10-jbr"],
  ["21.0.10", "Liberica", "21.0.10-librca"],
  ["17.0.18", "Liberica", "17.0.18-librca"],
  ["11.0.30", "Liberica", "11.0.30-librca"],
  ["21.0.2", "GraalVM CE", "21.0.2-graalce"],
  ["17.0.9", "GraalVM CE", "17.0.9-graalce"],
];

export const JAVA_VENDOR_MAP = {
  temurin: "Temurin",
  zulu: "Azul",
  amazon: "Amazon",
  amzn: "Amazon",
  oracle: "Oracle",
  open: "OpenJDK",
};
