use std::process::Command;

fn run_shell_cmd(cmd: &str) -> Result<std::process::Output, String> {
    Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .output()
        .map_err(|e| e.to_string())
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
        let vendor = crate::modules::java::get_java_vendor(id);
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