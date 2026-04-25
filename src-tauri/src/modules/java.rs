use std::{env, fs, path::PathBuf, process::Command};

pub const JVM_ARGS: &str = "-Xms{}G -Xmx{}G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1";

pub const POPULAR_JAVA_VERSIONS: &[(&str, &str, &str)] = &[
    ("21.0.10", "Amazon", "21.0.10-amzn"),
    ("17.0.18", "Amazon", "17.0.18-amzn"),
    ("11.0.30", "Amazon", "11.0.30-amzn"),
    ("8.0.472", "Amazon", "8.0.472-amzn"),
    ("21.0.2", "OpenJDK", "21.0.2-open"),
    ("17.0.14", "JetBrains", "17.0.14-jbr"),
    ("21.0.10", "JetBrains", "21.0.10-jbr"),
    ("21.0.10", "Liberica", "21.0.10-librca"),
    ("17.0.18", "Liberica", "17.0.18-librca"),
    ("11.0.30", "Liberica", "11.0.30-librca"),
    ("21.0.2", "GraalVM CE", "21.0.2-graalce"),
    ("17.0.9", "GraalVM CE", "17.0.9-graalce"),
];

pub fn get_java_vendor(id: &str) -> &str {
    let id_lower = id.to_lowercase();
    if id_lower.contains("temurin") { "Temurin" }
    else if id_lower.contains("zulu") { "Azul" }
    else if id_lower.contains("amazon") || id_lower.contains("amzn") { "Amazon" }
    else if id_lower.contains("oracle") { "Oracle" }
    else if id_lower.contains("open") { "OpenJDK" }
    else { "Other" }
}

fn run_shell_cmd(cmd: &str) -> Result<std::process::Output, String> {
    Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .output()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn check_sdkman() -> bool {
    let sdk_exists = run_shell_cmd("bash -c \"which sdk\"")
        .map(|o| o.status.success())
        .unwrap_or(false);

    let dir_exists = run_shell_cmd("test -d ~/.sdkman")
        .map(|o| o.status.success())
        .unwrap_or(false);

    sdk_exists || dir_exists
}

#[tauri::command]
pub fn list_java_installed() -> Result<Vec<serde_json::Value>, String> {
    let mut versions = Vec::new();

    let dir_output = run_shell_cmd("ls ~/.sdkman/candidates/java/ 2>/dev/null")
        .map_err(|e| e.to_string())?;

    let dir_content = String::from_utf8_lossy(&dir_output.stdout);
    for identifier in dir_content.lines() {
        let id = identifier.trim();
        if id.is_empty() || id == "current" {
            continue;
        }
        let version = id.split('-').next().unwrap_or(id).to_string();
        let vendor = get_java_vendor(id);

        let path = format!("~/.sdkman/candidates/java/{}", id);
        versions.push(serde_json::json!({
            "identifier": id,
            "version": version,
            "vendor": vendor,
            "path": path
        }));
    }

    Ok(versions)
}

#[tauri::command]
pub fn list_java_available() -> Result<Vec<serde_json::Value>, String> {
    let mut versions = Vec::new();
    
    let home = std::env::var("HOME").unwrap_or_default();
    let installed_dir = format!("{}/.sdkman/candidates/java", home);
    let mut installed_ids: Vec<String> = Vec::new();
    
    if let Ok(entries) = std::fs::read_dir(&installed_dir) {
        for entry in entries.flatten() {
            if let Ok(name) = entry.file_name().into_string() {
                if name != "current" && !name.is_empty() {
                    installed_ids.push(name);
                }
            }
        }
    }

    fn version_key(id: &str) -> String {
        id.split('-').next().unwrap_or(id).to_string()
    }
    
    let installed_keys: std::collections::HashSet<String> = installed_ids.iter()
        .map(|id| version_key(id))
        .collect();

    for (version, vendor, identifier) in POPULAR_JAVA_VERSIONS {
        let key = version_key(identifier);
        let is_installed = installed_ids.iter().any(|i| i == *identifier) || installed_keys.contains(&key);
        versions.push(serde_json::json!({
            "identifier": identifier,
            "version": version,
            "vendor": vendor,
            "installed": is_installed
        }));
    }

    Ok(versions)
}

pub fn parse_java_major(identifier: &str) -> Option<u32> {
    identifier
        .split(|c: char| !c.is_ascii_digit())
        .next()
        .and_then(|major| major.parse::<u32>().ok())
}

pub fn parse_java_tuple(identifier: &str) -> Vec<u32> {
    let core = identifier
        .split(|c| c == '-' || c == '+' || c == '_')
        .next()
        .unwrap_or(identifier);

    core.split('.')
        .filter_map(|part| part.parse::<u32>().ok())
        .collect()
}

pub fn select_installed_java(required_major: u32) -> Result<(String, String), String> {
    let home = env::var("HOME").map_err(|_| "Impossible de trouver le dossier utilisateur".to_string())?;
    let java_root = PathBuf::from(home).join(".sdkman").join("candidates").join("java");

    let mut candidates: Vec<(u32, Vec<u32>, String, String)> = Vec::new();
    let entries = fs::read_dir(&java_root)
        .map_err(|_| "Impossible de lire les Java installés dans SDKMAN".to_string())?;

    for entry in entries.flatten() {
        let file_name = entry.file_name();
        let identifier = match file_name.into_string() {
            Ok(value) => value,
            Err(_) => continue,
        };

        if identifier == "current" {
            continue;
        }

        let major = match parse_java_major(&identifier) {
            Some(value) => value,
            None => continue,
        };

        if major < required_major {
            continue;
        }

        let home_path = java_root.join(&identifier);
        candidates.push((
            major,
            parse_java_tuple(&identifier),
            identifier,
            home_path.to_string_lossy().to_string(),
        ));
    }

    if candidates.is_empty() {
        return Err(format!(
            "Aucun Java compatible trouvé dans SDKMAN pour Java {}",
            required_major
        ));
    }

    candidates.sort_by(|a, b| {
        a.0.cmp(&b.0)
            .then_with(|| b.1.cmp(&a.1))
            .then_with(|| a.2.cmp(&b.2))
    });

    let (_, _, identifier, home_path) = candidates.remove(0);
    Ok((identifier, home_path))
}

#[tauri::command]
pub async fn install_java(identifier: String) -> Result<String, String> {
    let output = run_shell_cmd(&format!("bash -c 'source ~/.sdkman/bin/sdkman-init.sh && sdk install java {} 2>&1'", identifier))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if output.status.success() {
        Ok(stdout.to_string())
    } else {
        Err(format!("{}\n{}", stdout, stderr))
    }
}

#[tauri::command]
pub async fn uninstall_java(identifier: String) -> Result<String, String> {
    let output = run_shell_cmd(&format!("bash -c 'source ~/.sdkman/bin/sdkman-init.sh && sdk uninstall java {} --force 2>&1'", identifier))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if output.status.success() {
        Ok(stdout.to_string())
    } else {
        Err(format!("{}\n{}", stdout, stderr))
    }
}
