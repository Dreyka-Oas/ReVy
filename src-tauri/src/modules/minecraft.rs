use std::path::PathBuf;
use crate::modules::java::{parse_java_major, parse_java_tuple, select_installed_java};

const JVM_ARGS: &str = "-Xms{}G -Xmx{}G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1";

fn minecraft_required_java(version: &str) -> u32 {
    let normalized = version.trim().split_whitespace().next().unwrap_or(version.trim());
    let core = normalized.split(|c| c == '-' || c == '+' || c == '_').next().unwrap_or(normalized);
    let mut parts = core.split('.');
    let first = parts.next().unwrap_or("");

    if first == "1" {
        let minor = parts.next().and_then(|s| s.parse::<u32>().ok()).unwrap_or(0);
        if minor < 17 { 8 } else if minor < 21 { 17 } else { 21 }
    } else {
        let major = first.parse::<u32>().unwrap_or(21);
        if major < 17 { 8 } else if major < 21 { 17 } else { 21 }
    }
}

#[tauri::command]
pub fn launch_minecraft_version(loader_path: String, version: String, min_ram: u32, max_ram: u32) -> Result<String, String> {
    let required_major = minecraft_required_java(&version);
    let (java_identifier, java_home) = select_installed_java(required_major)?;

    let version_dir = PathBuf::from(&loader_path).join(&version);
    if !version_dir.is_dir() {
        return Err(format!("Le dossier de version n'existe pas: {}", version_dir.to_string_lossy()));
    }

    let min = min_ram.max(1);
    let max = max_ram.max(min);
    let jvm_args = format!("-Xms{}G -Xmx{}G {}", min, max, JVM_ARGS);

    let gradlew = if cfg!(windows) { "gradlew.bat" } else { "./gradlew" };
    let mut command = std::process::Command::new(gradlew);
    command
        .current_dir(&version_dir)
        .env("JAVA_HOME", &java_home)
        .arg("runClient")
        .arg(format!("-Dorg.gradle.jvmargs={}", jvm_args));

    command.spawn().map_err(|e| format!("Impossible de lancer le client: {}", e))?;

    Ok(format!("Client lancé avec Java {} ({})", java_identifier, version))
}

#[tauri::command]
pub fn get_java_for_version(version: String) -> Result<String, String> {
    let required_major = minecraft_required_java(&version);
    let (java_identifier, _) = select_installed_java(required_major)?;
    Ok(java_identifier)
}
