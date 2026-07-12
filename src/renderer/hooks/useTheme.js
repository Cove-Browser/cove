import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const initTheme = async () => {
      // First check if user saved a manual preference
      const savedTheme = await window.electronAPI.storeGet('theme');
      let dark = false;

      if (savedTheme === 'dark') {
        dark = true;
      } else if (savedTheme === 'light') {
        dark = false;
      } else {
        // 'system' or nothing saved — use OS preference
        dark = await window.electronAPI.getNativeTheme();
      }

      setIsDark(dark);
      document.documentElement.classList.toggle('dark', dark);

      // Update titlebar overlay color
      window.electronAPI.setTitlebarOverlay({
        color: dark ? '#16151A' : '#EDE8D0',
        symbolColor: dark ? '#F0EDE4' : '#1C1A0F',
        height: 40
      });
    };
    initTheme();
  }, []);

  const setTheme = async (mode) => {
    let dark = false;
    if (mode === 'dark') {
      dark = true;
    } else if (mode === 'light') {
      dark = false;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    await window.electronAPI.storeSet('theme', mode);

    // CRITICAL: update titlebar overlay color immediately
    try {
      await window.electronAPI.setTitlebarOverlay({
        color: dark ? '#16151A' : '#EDE8D0',
        symbolColor: dark ? '#F0EDE4' : '#1C1A0F',
        height: 40
      });
    } catch(e) {
      console.warn('Could not update titlebar overlay:', e);
    }
  };

  useEffect(() => {
    try {
      window.electronAPI.setTitlebarOverlay({
        color: isDark ? '#16151A' : '#EDE8D0',
        symbolColor: isDark ? '#F0EDE4' : '#1C1A0F',
        height: 40
      });
    } catch(e) {}
  }, [isDark]);

  return { isDark, setTheme };
}
