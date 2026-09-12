// CP2-7 FIX: Incognito dark mode was bleeding into normal window because theme changes
// were being persisted to the shared electron-store. Fixed by checking incognito mode
// and skipping store persistence when in incognito, while still applying dark theme visually.
import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const initTheme = async () => {
      // CP2-7 FIX: In incognito mode, skip store read and force dark theme without persisting
      const isIncognito = new URLSearchParams(window.location.search).get('incognito') === 'true';
      let dark = false;

      if (isIncognito) {
        dark = true;
      } else {
        // First check if user saved a manual preference
        const savedTheme = await window.electronAPI.storeGet('theme');
        if (savedTheme === 'dark') {
          dark = true;
        } else if (savedTheme === 'light') {
          dark = false;
        } else {
          // 'system' or nothing saved — use OS preference
          dark = await window.electronAPI.getNativeTheme();
        }
      }

      setIsDark(dark);
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');

      // Update titlebar overlay color to match toolbar
      window.electronAPI.setTitlebarOverlay({
        color: dark ? '#1A1F2E' : '#E8EDF5',
        symbolColor: dark ? '#F5F5F5' : '#1A1916',
        height: 40
      });

      // Update window background color
      try {
        await window.electronAPI.setBackgroundColor(dark ? '#111318' : '#F4F6FB');
      } catch(e) {
        console.warn('Could not update background color:', e);
      }
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
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    
    // CP2-7 FIX: Don't persist theme to store in incognito mode to prevent bleeding to normal window
    const isIncognito = new URLSearchParams(window.location.search).get('incognito') === 'true';
    if (!isIncognito) {
      await window.electronAPI.storeSet('theme', mode);
    }

    // CRITICAL: update titlebar overlay color immediately to match toolbar
    try {
      await window.electronAPI.setTitlebarOverlay({
        color: dark ? '#1A1F2E' : '#E8EDF5',
        symbolColor: dark ? '#F5F5F5' : '#1A1916',
        height: 40
      });
    } catch(e) {
      console.warn('Could not update titlebar overlay:', e);
    }

    // Update window background color
    try {
      await window.electronAPI.setBackgroundColor(dark ? '#111318' : '#F4F6FB');
    } catch(e) {
      console.warn('Could not update background color:', e);
    }
  };

  return { isDark, setTheme };
}
