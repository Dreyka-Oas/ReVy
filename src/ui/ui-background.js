import { readFile } from "@tauri-apps/plugin-fs";

export async function updateBackground(logoPath) {
  let bg = document.getElementById('app-background');
  if (!bg) {
    bg = document.createElement('div');
    bg.id = 'app-background';
    document.body.prepend(bg);
    
    // Initial styles
    Object.assign(bg.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '-1',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 0.8s ease-in-out, filter 0.8s ease-in-out',
      filter: 'blur(40px) saturate(1.5)',
      transform: 'scale(1.1)'
    });
  }
  
  if (!logoPath) {
    bg.style.opacity = '0';
    return;
  }

  try {
    const data = await readFile(logoPath);
    const blob = new Blob([data], { type: 'image/png' });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
      bg.style.backgroundImage = `url("${url}")`;
      bg.style.opacity = '0.15';
    };
    img.src = url;
  } catch (e) {
    console.error('[Background] Error:', e);
    bg.style.opacity = '0';
  }
}
