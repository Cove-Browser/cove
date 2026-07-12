import React, { useState, useEffect, useRef } from 'react';

export default function Sidebar({ tabs, activeTabId, activeTab, onTabSelect, onTabClose, onNewTab, onTabReorder, onNavigate, isDark, profile, coveFavicon, onDuplicateTab, isIncognito }) {
  const [downloads, setDownloads] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    window.electronAPI.storeGet('downloads').then(d => setDownloads(d || []));
    const interval = setInterval(() => {
      window.electronAPI.storeGet('downloads').then(d => setDownloads(d || []));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && contextMenuRef.current.contains(e.target)) return;
      setContextMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeDownloads = downloads?.filter(d => d.state === 'progressing') || [];
  const navItems = [
    { icon: 'fas fa-bookmark', label: 'Bookmarks', url: 'cove://bookmarks' },
    { icon: 'fas fa-history', label: 'History', url: 'cove://history' },
    { icon: 'fas fa-download', label: 'Downloads', url: 'cove://downloads' },
    { icon: 'fas fa-cog', label: 'Settings', url: 'cove://settings' }
  ];

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      WebkitAppRegion: 'drag',
      overflow: 'hidden'
    }}>
      {/* Top section - Logo + App name + New tab */}
      <div style={{
        height: 'var(--toolbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
        WebkitAppRegion: 'drag',
        background: 'var(--sidebar-bg)'
      }}>
        <img src={coveFavicon} width={24} height={24} style={{ borderRadius: 6 }} />
        <span style={{ 
          fontSize: 15, 
          fontWeight: 600, 
          color: 'var(--text-1)', 
          letterSpacing: '-0.2px' 
        }}>
          Cove
        </span>
        {isIncognito && (
          <span style={{
            background: '#1a1a2e',
            color: 'white',
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}>
            PRIVATE
          </span>
        )}
        <button
          onClick={onNewTab}
          className="sidebar-item"
          style={{
            marginLeft: 'auto',
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-pill)',
            color: 'var(--text-2)',
            WebkitAppRegion: 'no-drag',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <i className="fas fa-plus" style={{ fontSize: 12 }} />
        </button>
      </div>

      {/* Tabs list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '4px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {tabs.length === 0 ? (
          <div style={{
            padding: '20px 10px',
            textAlign: 'center',
            color: 'var(--text-3)',
            fontSize: 13
          }}>
            No open tabs
          </div>
        ) : (
          tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                draggable
                onDragStart={e => e.dataTransfer.setData('tabIndex', String(index))}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const from = parseInt(e.dataTransfer.getData('tabIndex'));
                  if (from !== index) onTabReorder(from, index);
                }}
                onClick={() => onTabSelect(tab.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, tabId: tab.id });
                }}
                className={`animate-in sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 10px',
                  height: 36,
                  WebkitAppRegion: 'no-drag',
                  position: 'relative',
                  border: isActive ? '1px solid rgba(225,126,69,0.2)' : '1px solid transparent',
                  animationDelay: `${index * 30}ms`
                }}
              >
                {tab.isLoading ? (
                  <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 13, color: 'var(--accent)', width: 16, textAlign: 'center', flexShrink: 0 }} />
                ) : (
                  <img
                    src={tab.favicon || coveFavicon}
                    width={16}
                    height={16}
                    style={{ borderRadius: 4, flexShrink: 0 }}
                    onError={e => e.target.src = coveFavicon}
                  />
                )}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--accent)' : 'var(--text-1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'color var(--transition)'
                }}>
                  {tab.title || 'New Tab'}
                </span>
                {tab.isLoading && (
                  <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 11, color: 'var(--accent)', flexShrink: 0 }} />
                )}
                <button
                  onClick={e => { e.stopPropagation(); onTabClose(tab.id); }}
                  className="sidebar-item"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 'var(--radius-pill)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--text-3)',
                    fontSize: 11,
                    opacity: 1,
                    WebkitAppRegion: 'no-drag'
                  }}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            minWidth: 180,
            zIndex: 99999,
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.1s ease'
          }}>
          <button
            onMouseDown={() => { onTabClose(contextMenu.tabId); setContextMenu(null); }}
            className="sidebar-item"
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              color: 'var(--text-1)',
              cursor: 'pointer',
              display: 'block'
            }}
          >
            Close Tab
          </button>
          <button
            onMouseDown={() => {
              tabs.filter(t => t.id !== contextMenu.tabId).forEach(t => onTabClose(t.id));
              setContextMenu(null);
            }}
            className="sidebar-item"
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              color: 'var(--text-1)',
              cursor: 'pointer',
              display: 'block'
            }}
          >
            Close Other Tabs
          </button>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <button
            onMouseDown={() => { onDuplicateTab(contextMenu.tabId); setContextMenu(null); }}
            className="sidebar-item"
            style={{
              width: '100%',
              padding: '8px 12px',
              textAlign: 'left',
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              color: 'var(--text-1)',
              cursor: 'pointer',
              display: 'block'
            }}
          >
            Duplicate Tab
          </button>
        </div>
      )}

      {/* Bottom section - Navigation links */}
      <div style={{
        padding: 8,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {navItems.map(item => (
          <button
            key={item.url}
            onClick={() => onNavigate(item.url)}
            className={`sidebar-item ${activeTab?.url === item.url ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              color: activeTab?.url === item.url ? 'var(--accent)' : 'var(--text-2)',
              WebkitAppRegion: 'no-drag',
              border: 'none',
              textAlign: 'left'
            }}
          >
            <i className={item.icon} style={{ width: 16, textAlign: 'center', fontSize: 13 }} />
            <span style={{ fontSize: 13 }}>{item.label}</span>
            {item.url === 'cove://downloads' && activeDownloads.length > 0 && (
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                marginLeft: 'auto',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            )}
          </button>
        ))}

        {/* Profile button */}
        <button
          onClick={() => onNavigate('cove://profile')}
          className={`sidebar-item ${activeTab?.url === 'cove://profile' ? 'active' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            marginTop: 4,
            WebkitAppRegion: 'no-drag',
            border: 'none',
            textAlign: 'left'
          }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-pill)',
            background: '#7A9B8A',
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getUserInitials(profile?.displayName)}
          </div>
          <span style={{ fontSize: 13, color: activeTab?.url === 'cove://profile' ? 'var(--accent)' : 'var(--text-1)', fontWeight: 500 }}>
            {profile?.displayName || 'User'}
          </span>
        </button>
      </div>
    </div>
  );
}
