#!/bin/bash
set -e

echo "Building VeRy..."
npm run tauri build || true

echo ""
echo "Build complete!"

# The binary might still have old name, let's check
if [ -f "src-tauri/target/release/system-explorer" ]; then
    echo "Renaming binary..."
    mv src-tauri/target/release/system-explorer src-tauri/target/release/very
    chmod +x src-tauri/target/release/very
fi

echo "Outputs:"
ls -la src-tauri/target/release/bundle/deb/*.deb 2>/dev/null && echo "  Deb:   src-tauri/target/release/bundle/deb/VeRy_1.0.0_amd64.deb"
ls -la src-tauri/target/release/bundle/rpm/*.rpm 2>/dev/null && echo "  Rpm:  src-tauri/target/release/bundle/rpm/VeRy-1.0.0-1.x86_64.rpm"
ls -la src-tauri/target/release/bundle/appimage/*.AppImage 2>/dev/null && echo "  AppImage: src-tauri/target/release/bundle/appimage/VeRy_1.0.0_amd64.AppImage"
[ -f "src-tauri/target/release/very" ] && echo "  Bin:  src-tauri/target/release/very"