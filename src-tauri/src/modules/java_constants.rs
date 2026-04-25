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