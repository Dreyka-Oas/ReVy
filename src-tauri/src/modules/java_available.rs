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
    for (version, vendor, identifier) in crate::modules::java::POPULAR_JAVA_VERSIONS {
        let key = version_key(identifier);
        let is_installed = installed_ids.iter().any(|i| *i == *identifier) || installed_keys.contains(&key);
        versions.push(serde_json::json!({
            "identifier": identifier,
            "version": version,
            "vendor": vendor,
            "installed": is_installed
        }));
    }
    Ok(versions)
}