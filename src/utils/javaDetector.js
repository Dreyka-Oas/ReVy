import { invoke } from "@tauri-apps/api/core";

export async function checkSdkman() {
  try {
    return await invoke("check_sdkman");
  } catch (e) {
    console.error("[Java] SDKMAN check error:", e);
    return false;
  }
}

export async function listJavaInstalled() {
  try {
    return await invoke("list_java_installed");
  } catch (e) {
    console.error("[Java] List installed error:", e);
    return [];
  }
}

export async function listJavaAvailable() {
  try {
    const result = await invoke("list_java_available");
    console.log("[Java] listJavaAvailable result:", result);
    return result;
  } catch (e) {
    console.error("[Java] List available error:", e);
    return [];
  }
}

export async function installJava(identifier) {
  const fallbackIdentifier = identifier.endsWith('-amzn') ? `${identifier.slice(0, -5)}-tem` : null;
  try {
    return await invoke("install_java", { identifier });
  } catch (e) {
    if (fallbackIdentifier) {
      try {
        return await invoke("install_java", { identifier: fallbackIdentifier });
      } catch (fallbackError) {
        console.error("[Java] Install error:", fallbackError);
        throw fallbackError;
      }
    }
    console.error("[Java] Install error:", e);
    throw e;
  }
}

export async function uninstallJava(identifier) {
  try {
    return await invoke("uninstall_java", { identifier });
  } catch (e) {
    console.error("[Java] Uninstall error:", e);
    throw e;
  }
}

export async function getJavaForVersion(version) {
  try {
    return await invoke("get_java_for_version", { version });
  } catch (e) {
    console.error("[Java] Get Java for version error:", e);
    return null;
  }
}
