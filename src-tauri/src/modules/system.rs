#[tauri::command]
pub fn get_system_ram() -> Result<u64, String> {
    let mut sys = sysinfo::System::new();
    sys.refresh_memory();
    let total_bytes = sys.total_memory();
    if total_bytes == 0 {
        Err("Impossible de détecter la RAM système".into())
    } else {
        Ok(total_bytes)
    }
}
