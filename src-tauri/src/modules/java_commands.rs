use std::process::Command;

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