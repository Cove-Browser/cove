import React, { useState, useEffect } from 'react';

export default function History({ onNavigate, isDark }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    window.electronAPI.storeGet('history').then(h => setHistory(h || []));
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        <h1 style={{ fontSize: 32, fontWeight: 300, color: textColor, margin: 0, marginBottom: 24 }}>History</h1>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: subColor }}>
          No history yet. Your browsing history will appear here.
        </div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
          {history.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onNavigate(item.url)}
              style={{
                padding: '16px 20px',
                borderBottom: index < history.length - 1 ? `1px solid ${borderColor}` : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = isDark ? '#3A3845' : '#EDE8D0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isDark ? '#D76B00' : '#E17E45',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                flexShrink: 0
              }}>
                {item.title[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: textColor, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: subColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.url}
                </div>
              </div>
              <div style={{ fontSize: 12, color: subColor, flexShrink: 0 }}>
                {formatDate(item.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
