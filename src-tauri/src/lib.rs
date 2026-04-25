use std::{env, fs, path::PathBuf, process::Command};

#[tauri::command]
fn get_system_ram() -> Result<u64, String> {
    let mut sys = sysinfo::System::new();
    sys.refresh_memory();
    let total_bytes = sys.total_memory();
    if total_bytes == 0 {
        Err("Impossible de détecter la RAM système".into())
    } else {
        Ok(total_bytes)
    }
}

#[tauri::command]
fn check_sdkman() -> bool {
    let sdk_exists = Command::new("sh")
        .arg("-c")
        .arg("bash -c \"which sdk\"")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    let dir_exists = Command::new("sh")
        .arg("-c")
        .arg("test -d ~/.sdkman")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    sdk_exists || dir_exists
}

#[tauri::command]
fn list_java_installed() -> Result<Vec<serde_json::Value>, String> {
    let mut versions = Vec::new();

    let dir_output = Command::new("sh")
        .arg("-c")
        .arg("ls ~/.sdkman/candidates/java/ 2>/dev/null")
        .output()
        .map_err(|e| e.to_string())?;

    let dir_content = String::from_utf8_lossy(&dir_output.stdout);
    for identifier in dir_content.lines() {
        let id = identifier.trim();
        if id.is_empty() || id == "current" {
            continue;
        }
        let version = id.split('-').next().unwrap_or(id).to_string();
        let vendor = if id.contains("temurin") {
            "Temurin"
        } else if id.contains("zulu") || id.to_lowercase().contains("zulu") {
            "Azul"
        } else if id.contains("amazon") || id.contains("amzn") {
            "Amazon"
        } else if id.contains("oracle") {
            "Oracle"
        } else if id.contains("open") {
            "OpenJDK"
        } else {
            "Other"
        };

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
fn list_java_available() -> Result<Vec<serde_json::Value>, String> {
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

    let popular_javas = vec![
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

    for (version, vendor, identifier) in popular_javas {
        let key = version_key(identifier);
        let is_installed = installed_ids.iter().any(|i| i == identifier) || installed_keys.contains(&key);
        versions.push(serde_json::json!({
            "identifier": identifier,
            "version": version,
            "vendor": vendor,
            "installed": is_installed
        }));
    }

    Ok(versions)
}

fn minecraft_required_java(version: &str) -> u32 {
    let normalized = version.trim().split_whitespace().next().unwrap_or(version.trim());
    let core = normalized
        .split(|c| c == '-' || c == '+' || c == '_')
        .next()
        .unwrap_or(normalized);

    let mut parts = core.split('.');
    let first = parts.next().unwrap_or("");

    if first == "1" {
        let minor = parts
            .next()
            .and_then(|s| s.parse::<u32>().ok())
            .unwrap_or(0);
        if minor < 17 {
            8
        } else if minor < 21 {
            17
        } else {
            21
        }
    } else {
        let major = first.parse::<u32>().unwrap_or(21);
        if major < 17 {
            8
        } else if major < 21 {
            17
        } else {
            21
        }
    }
}

fn parse_java_major(identifier: &str) -> Option<u32> {
    identifier
        .split(|c: char| !c.is_ascii_digit())
        .next()
        .and_then(|major| major.parse::<u32>().ok())
}

fn parse_java_tuple(identifier: &str) -> Vec<u32> {
    let core = identifier
        .split(|c| c == '-' || c == '+' || c == '_')
        .next()
        .unwrap_or(identifier);

    core.split('.')
        .filter_map(|part| part.parse::<u32>().ok())
        .collect()
}

fn select_installed_java(required_major: u32) -> Result<(String, String), String> {
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
fn launch_minecraft_version(loader_path: String, version: String, min_ram: u32, max_ram: u32) -> Result<String, String> {
    let required_major = minecraft_required_java(&version);
    let (java_identifier, java_home) = select_installed_java(required_major)?;

    let version_dir = PathBuf::from(&loader_path).join(&version);
    if !version_dir.is_dir() {
        return Err(format!(
            "Le dossier de version n'existe pas: {}",
            version_dir.to_string_lossy()
        ));
    }

    let min = min_ram.max(1);
    let max = max_ram.max(min);
    let jvm_args = format!(
        "-Xms{}G -Xmx{}G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1",
        min,
        max
    );

    let gradlew = if cfg!(windows) { "gradlew.bat" } else { "./gradlew" };
    let mut command = Command::new(gradlew);
    command
        .current_dir(&version_dir)
        .env("JAVA_HOME", &java_home)
        .arg("runClient")
        .arg(format!("-Dorg.gradle.jvmargs={}", jvm_args));

    command
        .spawn()
        .map_err(|e| format!("Impossible de lancer le client: {}", e))?;

    Ok(format!(
        "Client lancé avec Java {} ({})",
        java_identifier, version
    ))
}

#[tauri::command]
fn get_java_for_version(version: String) -> Result<String, String> {
    let required_major = minecraft_required_java(&version);
    let (java_identifier, _) = select_installed_java(required_major)?;
    Ok(java_identifier)
}

#[tauri::command]
async fn install_java(identifier: String) -> Result<String, String> {
    let output = Command::new("sh")
        .arg("-c")
        .arg(format!("bash -c 'source ~/.sdkman/bin/sdkman-init.sh && sdk install java {} 2>&1'", identifier))
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if output.status.success() {
        Ok(stdout.to_string())
    } else {
        Err(format!("{}\n{}", stdout, stderr))
    }
}

#[tauri::command]
async fn uninstall_java(identifier: String) -> Result<String, String> {
    let output = Command::new("sh")
        .arg("-c")
        .arg(format!("bash -c 'source ~/.sdkman/bin/sdkman-init.sh && sdk uninstall java {} --force 2>&1'", identifier))
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if output.status.success() {
        Ok(stdout.to_string())
    } else {
        Err(format!("{}\n{}", stdout, stderr))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_system_ram,
            check_sdkman,
            list_java_installed,
            list_java_available,
            install_java,
            uninstall_java,
            launch_minecraft_version,
            get_java_for_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
