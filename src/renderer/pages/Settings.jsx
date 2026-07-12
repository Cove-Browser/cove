import React, { useState, useEffect } from 'react';

export default function Settings({ onNavigate, settings, setSettings, isDark, setTheme, searchEngine, setSearchEngine }) {
  const [theme, setThemeState] = useState('system');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    window.electronAPI.storeGet('theme').then(t => setThemeState(t || 'system'));
  }, []);


  const handleClearData = async () => {
    await window.electronAPI.storeSet('history', []);
    await window.electronAPI.storeSet('downloads', []);
    await window.electronAPI.storeSet('bookmarks', []);
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  const textColor = isDark ? '#F0EDE4' : '#2C2410';
  const subColor = isDark ? '#B8A898' : '#6B5A3E';
  const cardBg = isDark ? '#1E1D24' : '#F5F0E0';
  const borderColor = isDark ? '#3A3845' : '#D4C9A8';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: '100%',
      background: 'var(--webview-bg)',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{
        padding: '32px 40px',
        maxWidth: 800,
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, color: textColor, marginBottom: 40 }}>Settings</h1>

      {/* Appearance */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: textColor, marginBottom: 16 }}>Appearance</h2>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, color: textColor, display: 'block', marginBottom: 8 }}>Theme</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['system', 'light', 'dark'].map(mode => (
                <button
                  key={mode}
                  onClick={() => { setTheme(mode); setThemeState(mode); }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: theme === mode ? '2px solid #E17E45' : `1px solid ${borderColor}`,
                    background: theme === mode ? (isDark ? 'rgba(215, 107, 0, 0.1)' : 'rgba(225, 126, 69, 0.1)') : 'transparent',
                    color: textColor,
                    fontSize: 14,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: textColor, marginBottom: 16 }}>Search</h2>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 14, color: textColor, display: 'block', marginBottom: 8 }}>Search Engine</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['google', 'duckduckgo', 'bing'].map(engine => (
                <button
                  key={engine}
                  onClick={() => setSearchEngine(engine)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: searchEngine === engine ? '2px solid #E17E45' : `1px solid ${borderColor}`,
                    background: searchEngine === engine ? (isDark ? 'rgba(215, 107, 0, 0.1)' : 'rgba(225, 126, 69, 0.1)') : 'transparent',
                    color: textColor,
                    fontSize: 14,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {engine}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: textColor, marginBottom: 16 }}>Keyboard Shortcuts</h2>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 12 }}>Navigation</h3>
            {[
              ['Ctrl + T', 'New Tab'],
              ['Ctrl + W', 'Close Tab'],
              ['Ctrl + L', 'Focus Address Bar'],
              ['Ctrl + R', 'Reload Page'],
              ['Ctrl + Tab', 'Next Tab'],
              ['Alt + Home', 'Go Home']
            ].map(([key, action]) => (
              <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                <kbd style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '2px 8px',
                  fontSize: 12,
                  fontFamily: 'Inter, monospace',
                  color: 'var(--text-1)'
                }}>
                  {key}
                </kbd>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{action}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 12 }}>Page</h3>
            {[
              ['Ctrl + F', 'Find in Page'],
              ['Ctrl + D', 'Bookmark Page'],
              ['Ctrl + +', 'Zoom In'],
              ['Ctrl + -', 'Zoom Out'],
              ['Ctrl + 0', 'Reset Zoom'],
              ['Escape', 'Stop Loading / Close Find Bar']
            ].map(([key, action]) => (
              <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                <kbd style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '2px 8px',
                  fontSize: 12,
                  fontFamily: 'Inter, monospace',
                  color: 'var(--text-1)'
                }}>
                  {key}
                </kbd>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: textColor, marginBottom: 16 }}>Privacy</h2>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <button
            onClick={handleClearData}
            style={{
              background: cleared ? '#2E7D32' : '#C0392B',
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            {cleared ? 'Data Cleared' : 'Clear Browsing Data'}
          </button>
        </div>
      </section>

      {/* About */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: textColor, marginBottom: 16 }}>About</h2>
        <div style={{ background: cardBg, borderRadius: 12, padding: 20, border: `1px solid ${borderColor}` }}>
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: subColor }}>Version: </span>
            <span style={{ fontSize: 14, color: textColor }}>Cove Browser · Version 1.0.0 Beta</span>
            <span style={{
              background: 'var(--accent)',
              color: 'white',
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)',
              marginLeft: 8,
              letterSpacing: '0.5px'
            }}>BETA</span>
          </div>
          <div>
            <span style={{ fontSize: 14, color: subColor }}>Chromium: </span>
            <span style={{ fontSize: 14, color: textColor }}>{window.electronAPI.chromiumVersion}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: 20, color: subColor, fontSize: 12 }}>
        Cove · Made Possible by the Chromium Open Source Project · <span
          onClick={() => onNavigate('cove://acknowledgements')}
          style={{
            color: 'var(--accent)',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          Acknowledgements
        </span>
      </div>
      </div>
    </div>
  );
}
