import React, { useState, useEffect } from 'react';

export default function Downloads({ onNavigate, isDark }) {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    window.electronAPI.storeGet('downloads').then(d => setDownloads(d || []));
  }, []);

  const handleClearDownloads = async () => {
    setDownloads([]);
    await window.electronAPI.storeSet('downloads', []);
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStateColor = (state) => {
    if (state === 'completed') return '#4A7C59';
    if (state === 'progressing') return isDark ? '#D76B00' : '#E17E45';
    if (state === 'cancelled') return '#F9AB00';
    return '#C0392B';
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, color: textColor, margin: 0 }}>Downloads</h1>
        {downloads.length > 0 && (
          <button
            onClick={handleClearDownloads}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#C0392B',
              color: '#FFFFFF',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Clear List
          </button>
        )}
      </div>

      {downloads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: subColor }}>
          No downloads yet. Your downloads will appear here.
        </div>
      ) : (
        <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
          {downloads.map((item, index) => (
            <div
              key={item.id}
              style={{
                padding: '16px 20px',
                borderBottom: index < downloads.length - 1 ? `1px solid ${borderColor}` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: isDark ? '#3A3845' : '#EDE8D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0
              }}>
                📄
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: textColor, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.filename}
                </div>
                <div style={{ fontSize: 12, color: subColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.url}
                </div>
                {item.state === 'progressing' && (
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 6 }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 2,
                      background: 'var(--accent)',
                      width: (item.totalBytes > 0 ? (item.receivedBytes / item.totalBytes) * 100 : 0) + '%',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: getStateColor(item.state), fontWeight: 500, marginBottom: 4 }}>
                  {item.state.charAt(0).toUpperCase() + item.state.slice(1)}
                </div>
                <div style={{ fontSize: 12, color: subColor }}>
                  {formatBytes(item.receivedBytes)} / {formatBytes(item.totalBytes)}
                </div>
                <div style={{ fontSize: 11, color: subColor }}>
                  {formatDate(item.startTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
