mod modules;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use crate::modules::java::{check_sdkman, list_java_installed, list_java_available, install_java, uninstall_java};
    use crate::modules::minecraft::{launch_minecraft_version, get_java_for_version};
    use crate::modules::system::get_system_ram;

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
