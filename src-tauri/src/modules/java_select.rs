use std::{env, fs, path::PathBuf};

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