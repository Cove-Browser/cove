import React, { useState, useEffect, useRef } from 'react';

export default function Toolbar({ activeTab, onNavigate, onNavigateNew, onBack, onForward, onRefresh, onStop, isDark, hoveredLink, isBookmarked, onToggleBookmark, onHome, zoomLevel, onZoomIn, onZoomOut, onResetZoom, searchEngine }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const hasTab = !!activeTab;

  useEffect(() => {
    if (!focused) setValue(activeTab?.url || '');
  }, [activeTab?.url, focused, hasTab]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const canGoBack = activeTab?.canGoBack || false;
  const canGoForward = activeTab?.canGoForward || false;
  const isLoading = activeTab?.isLoading || false;
  const url = activeTab?.url || '';

  const handleNavigate = () => {
    let u = value.trim();
    if (!u) return;
    if (u.startsWith('cove://')) {
      if (!activeTab) {
        onNavigateNew(u);
      } else {
        onNavigate(u);
      }
      setFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (!u.includes(' ') && u.includes('.')) u = 'https://' + u;
    else {
      const searchUrls = {
        google: 'https://www.google.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        bing: 'https://www.bing.com/search?q='
      };
      const baseUrl = searchUrls[searchEngine] || searchUrls.google;
      u = baseUrl + encodeURIComponent(u);
    }
    if (!activeTab) {
      onNavigateNew(u);
    } else {
      onNavigate(u);
    }
    setFocused(false);
    inputRef.current?.blur();
  };

  const iconBtn = (onClick, icon, disabled = false, title = '', color = null) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="toolbar-btn"
      style={{
        fontSize: 13,
        flexShrink: 0,
        color: disabled ? 'var(--text-3)' : (color || 'var(--text-2)')
      }}
    >
      <i className={icon} />
    </button>
  );

  const menuItems = [
    { label: 'New Tab', action: () => window.dispatchEvent(new CustomEvent('newTab')) },
    { label: 'Bookmarks', action: () => onNavigate('cove://bookmarks') },
    { label: 'History', action: () => onNavigate('cove://history') },
    { label: 'Downloads', action: () => onNavigate('cove://downloads') },
    { label: 'Settings', action: () => onNavigate('cove://settings') }
  ];

  return (
    <div style={{
      height: 'var(--toolbar-height)',
      background: 'var(--toolbar-bg)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 8,
      paddingBottom: 8,
      flexShrink: 0
    }}>
      {/* Left nav buttons */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {iconBtn(() => { try { onBack(); } catch(e) {} }, 'fas fa-arrow-left', !hasTab || !canGoBack, 'Back')}
        {iconBtn(() => { try { onForward(); } catch(e) {} }, 'fas fa-arrow-right', !hasTab || !canGoForward, 'Forward')}
        {iconBtn(() => { try { isLoading ? onStop() : onRefresh(); } catch(e) {} }, isLoading ? 'fas fa-times' : 'fas fa-redo', !hasTab, isLoading ? 'Stop' : 'Refresh')}
        {iconBtn(() => { try { onHome(); } catch(e) {} }, 'fas fa-home', !hasTab, 'Home')}
        {iconBtn(
          () => { try { onToggleBookmark(); } catch(e) {} },
          isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark',
          !hasTab || !activeTab?.url || activeTab?.url?.startsWith('cove://'),
          isBookmarked ? 'Remove Bookmark' : 'Bookmark this page',
          isBookmarked ? 'var(--accent)' : null
        )}
      </div>

      {/* Center address bar */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div
          onClick={() => inputRef.current?.focus()}
          className="address-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 8,
            cursor: 'text',
            width: '100%',
            maxWidth: '835px'
          }}
        >
          {url.startsWith('https://') && (
            <i
              className={copied ? 'fas fa-check' : 'fas fa-lock'}
              style={{ fontSize: 11, color: copied ? '#4CAF50' : '#4CAF50', flexShrink: 0, cursor: 'pointer' }}
              title={copied ? 'Copied!' : 'Click to copy URL'}
              onClick={() => {
                navigator.clipboard.writeText(url).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            />
          )}
          {url.startsWith('http://') && (
            <i
              className={copied ? 'fas fa-check' : 'fas fa-globe'}
              style={{ fontSize: 11, color: copied ? '#4CAF50' : 'var(--text-3)', flexShrink: 0, cursor: 'pointer' }}
              title={copied ? 'Copied!' : 'Click to copy URL'}
              onClick={() => {
                navigator.clipboard.writeText(url).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            />
          )}
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onFocus={() => { setFocused(true); setTimeout(() => inputRef.current?.select(), 0); }}
            onBlur={() => { setFocused(false); setValue(activeTab?.url || ''); }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleNavigate();
              if (e.key === 'Escape') { inputRef.current?.blur(); }
            }}
            placeholder="Search or enter address"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 14,
              color: 'var(--text-1)',
              fontFamily: 'inherit'
            }}
          />
          {!focused && hoveredLink && (
            <span style={{
              fontSize: 11,
              color: 'var(--text-3)',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              {hoveredLink}
            </span>
          )}
        </div>
      </div>

      {/* Right buttons */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {zoomLevel !== undefined && zoomLevel !== 1.0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--surface)',
            borderRadius: 'var(--radius-pill)',
            padding: '2px 8px',
            fontSize: 12,
            color: 'var(--text-2)',
            border: '1px solid var(--border)'
          }}>
            <button onClick={onZoomOut} className="toolbar-btn" style={{ width: 20, height: 20, fontSize: 10 }}>
              <i className="fas fa-minus" />
            </button>
            <span onClick={onResetZoom} style={{ cursor: 'pointer', minWidth: 36, textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={onZoomIn} className="toolbar-btn" style={{ width: 20, height: 20, fontSize: 10 }}>
              <i className="fas fa-plus" />
            </button>
          </div>
        )}

        {/* Three dot menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          {iconBtn(() => setShowMenu(v => !v), 'fas fa-ellipsis-v', false, 'Menu')}
          {showMenu && (
            <div style={{
              position: 'absolute',
              top: 40,
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 4,
              minWidth: 200,
              zIndex: 9999,
              boxShadow: 'var(--shadow-md)',
              animation: 'fadeIn 0.15s ease'
            }}>
              {menuItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowMenu(false); }}
                  className="sidebar-item"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 13,
                    color: 'var(--text-1)',
                    cursor: 'pointer',
                    display: 'block',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
