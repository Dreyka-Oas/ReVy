use std::process::Command;

fn run_shell_cmd(cmd: &str) -> Result<std::process::Output, String> {
    Command::new("sh")
        .arg("-c")
        .arg(cmd)
        .output()
        .map_err(|e| e.to_string())
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