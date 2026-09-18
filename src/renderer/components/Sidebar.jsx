// CP2-7 FIX: History and Downloads buttons were visible but disabled in Incognito mode.
// Fixed by filtering out these buttons when isIncognito is true so they don't appear at all.
// CP2-9 FIX: Removed isRTL prop and RTL-specific context menu positioning since Arabic support was removed.
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ava1Wave from '../../../assets/avatars/ava1-wave.png';
import ava2Stones from '../../../assets/avatars/ava2-stones.png';
import ava3Leaf from '../../../assets/avatars/ava3-leaf.png';
import ava4Gradient from '../../../assets/avatars/ava4-gradient.png';

export default function Sidebar({ tabs, activeTabId, activeTab, onTabSelect, onTabClose, onNewTab, onTabReorder, onNavigate, isDark, profile, onDuplicateTab, isIncognito }) {
  const { t } = useTranslation();
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

  // CP2-7 FIX: Hide History and Downloads buttons in Incognito mode since they are disabled
  const activeDownloads = downloads?.filter(d => d.state === 'progressing') || [];
  const navItems = [
    { icon: 'fas fa-bookmark', label: t('sidebar.bookmarks'), url: 'cove://bookmarks' },
    { icon: 'fas fa-history', label: t('sidebar.history'), url: 'cove://history', hideInIncognito: true },
    { icon: 'fas fa-download', label: t('sidebar.downloads'), url: 'cove://downloads', hideInIncognito: true },
    { icon: 'fas fa-key', label: 'Cove Password Manager', url: 'cove://cpm', hideInIncognito: true },
    { icon: 'fas fa-cog', label: t('sidebar.settings'), url: 'cove://settings' }
  ];

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const avatarSrcMap = {
    'ava1-wave.png': ava1Wave,
    'ava2-stones.png': ava2Stones,
    'ava3-leaf.png': ava3Leaf,
    'ava4-gradient.png': ava4Gradient
  };

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      WebkitAppRegion: 'drag',
      overflow: 'hidden'
    }}>
      {/* Top section - New Tab button */}
      <div style={{
        height: 'var(--toolbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        WebkitAppRegion: 'drag',
        background: 'var(--surface)'
      }}>
        <button
          onClick={onNewTab}
          className="sidebar-item"
          style={{
            width: '100%',
            height: 32,
            borderRadius: 'var(--radius)',
            border: '1px solid var(--accent)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            WebkitAppRegion: 'no-drag',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: 'OpenSauceOne, sans-serif'
          }}
        >
          <i className="fas fa-plus" style={{ fontSize: 12, color: 'var(--accent)' }} />
          <span>{t('sidebar.newTab')}</span>
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
            color: 'var(--text-muted)',
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
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 10px',
                  height: 36,
                  WebkitAppRegion: 'no-drag',
                  position: 'relative',
                  border: isActive ? '1px solid rgba(123,155,181,0.2)' : '1px solid transparent'
                }}
              >
                {tab.isLoading ? (
                  <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 13, color: 'var(--accent)', width: 16, textAlign: 'center', flexShrink: 0 }} />
                ) : tab.favicon ? (
                  <img
                    src={tab.favicon}
                    width={16}
                    height={16}
                    style={{ borderRadius: 'var(--radius-xs)', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 16,
                    height: 16,
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 8,
                    flexShrink: 0
                  }}>
                    <i className="fas fa-globe" />
                  </div>
                )}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--accent)' : 'var(--text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'color var(--duration-sm) var(--ease)',
                  fontFamily: 'OpenSauceOne, sans-serif'
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
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    opacity: 1,
                    WebkitAppRegion: 'no-drag',
                    transition: 'background-color 150ms ease-in-out'
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
            borderRadius: 'var(--radius)',
            padding: 4,
            minWidth: 180,
            zIndex: 99999,
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 150ms ease-in-out'
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
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'block',
              fontFamily: 'OpenSauceOne, sans-serif',
              transition: 'background-color 150ms ease-in-out'
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
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'block',
              fontFamily: 'OpenSauceOne, sans-serif',
              transition: 'background-color 150ms ease-in-out'
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
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'block',
              fontFamily: 'OpenSauceOne, sans-serif',
              transition: 'background-color 150ms ease-in-out'
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
        {navItems.filter(item => !isIncognito || !item.hideInIncognito).map(item => (
          <button
            key={item.url}
            onClick={() => onNavigate(item.url)}
            className={`sidebar-item ${activeTab?.url === item.url ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              color: activeTab?.url === item.url ? 'var(--accent)' : 'var(--text-muted)',
              WebkitAppRegion: 'no-drag',
              border: 'none',
              textAlign: 'left',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 150ms ease-in-out'
            }}
          >
            <i className={item.icon} style={{ width: 16, textAlign: 'center', fontSize: 13 }} />
            <span style={{ fontSize: 13, fontFamily: 'OpenSauceOne, sans-serif' }}>{item.label}</span>
            {item.url === 'cove://downloads' && activeDownloads.length > 0 && (
              <span style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                display: 'inline-block',
                marginLeft: 'auto'
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
            textAlign: 'left',
            borderRadius: 'var(--radius-sm)',
            transition: 'background-color 150ms ease-in-out'
          }}
        >
          {profile?.avatar ? (
            <img
              src={avatarSrcMap[profile.avatar]}
              alt="Avatar"
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius)',
                objectFit: 'cover',
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius)',
            background: '#7A9B8A',
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            display: profile?.avatar ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {getUserInitials(profile?.displayName)}
          </div>
          <span style={{ fontSize: 13, color: activeTab?.url === 'cove://profile' ? 'var(--accent)' : 'var(--text)', fontWeight: 500, fontFamily: 'OpenSauceOne, sans-serif' }}>
            {profile?.displayName || 'User'}
          </span>
        </button>
      </div>
    </div>
  );
}
