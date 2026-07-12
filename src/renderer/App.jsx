import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useStore } from './hooks/useStore';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import WebView from './components/WebView';
import FindBar from './components/FindBar';
import ErrorPage from './components/ErrorPage';
import NewTab from './pages/NewTab';
import Bookmarks from './pages/Bookmarks';
import History from './pages/History';
import Downloads from './pages/Downloads';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Acknowledgements from './pages/Acknowledgements';
import coveFaviconLight from '../../favicon-96x96.png';
import coveFaviconDark from '../../favicon.svg';
import './index.css';

function App() {
  const { isDark, setTheme } = useTheme();
  const [settings, setSettings] = useStore('settings', { homepage: 'cove://home' });
  const [profile, setProfile] = useStore('profile', { displayName: 'User', avatar: null });
  const [bookmarks, setBookmarks] = useStore('bookmarks', []);
  const [searchEngine, setSearchEngine] = useStore('searchEngine', 'google');
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [hoveredLink, setHoveredLink] = useState('');
  const [showFindBar, setShowFindBar] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const webviewRefs = useRef({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [backOnline, setBackOnline] = useState(false);
  const isIncognito = new URLSearchParams(window.location.search).get('incognito') === 'true';

  const homepage = settings?.homepage || 'cove://home';
  const coveFavicon = isDark ? coveFaviconDark : coveFaviconLight;

  if (settings === null || profile === null) {
    return <div style={{ width: '100vw', height: '100vh', background: 'var(--bg)' }} />;
  }

  useEffect(() => {
    if (tabs.length === 0) {
      const t = { id: Date.now().toString(), url: homepage, title: 'New Tab', favicon: coveFavicon, isLoading: false, canGoBack: false, canGoForward: false, lastActive: Date.now(), suspended: false };
      setTabs([t]);
      setActiveTabId(t.id);
    }
  }, []);

  // Clock for empty state
  useEffect(() => {
    if (tabs.length === 0) {
      const updateClock = () => {
        const now = new Date();
        const timeEl = document.getElementById('empty-clock');
        const dateEl = document.getElementById('empty-date');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (dateEl) dateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      };
      updateClock();
      const interval = setInterval(updateClock, 1000);
      return () => clearInterval(interval);
    }
  }, [tabs.length]);

  useEffect(() => {
    const handler = () => createNewTab();
    window.addEventListener('newTab', handler);
    return () => window.removeEventListener('newTab', handler);
  }, [homepage]);

  useEffect(() => {
    const newFavicon = isDark ? coveFaviconDark : coveFaviconLight;
    setTabs(prev => prev.map(t =>
      t.url?.startsWith('cove://') ? { ...t, favicon: newFavicon } : t
    ));
  }, [isDark]);

  useEffect(() => {
    setZoomLevel(1.0);
  }, [activeTabId]);

  // Suspend inactive tabs after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTabs(prev => prev.map(tab => {
        if (tab.id !== activeTabId && 
            tab.lastActive && 
            now - tab.lastActive > 5 * 60 * 1000 &&
            !tab.url?.startsWith('cove://')) {
          return { ...tab, suspended: true };
        }
        return tab;
      }));
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [activeTabId]);

  useEffect(() => {
    const goOnline = () => {
      setBackOnline(true);
      setIsOnline(true);
      setShowOfflineBanner(true);
      setTimeout(() => {
        setShowOfflineBanner(false);
        setBackOnline(false);
      }, 3000);
    };
    const goOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const isBookmarked = bookmarks?.some(b => b.url === activeTab?.url) || false;

  const updateTab = useCallback((tabId, updates) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...updates } : t));
  }, []);

  const createNewTab = useCallback(() => {
    const t = { id: Date.now().toString(), url: homepage, title: 'New Tab', favicon: coveFavicon, isLoading: false, canGoBack: false, canGoForward: false, lastActive: Date.now(), suspended: false };
    setTabs(prev => [...prev, t]);
    setActiveTabId(t.id);
  }, [homepage]);

  const closeTab = useCallback((tabId) => {
    // Clean up webview ref to prevent memory leak
    if (webviewRefs.current[tabId]) {
      try {
        webviewRefs.current[tabId].src = 'about:blank';
      } catch(e) {}
      delete webviewRefs.current[tabId];
    }

    setTabs(prev => {
      const next = prev.filter(t => t.id !== tabId);
      if (tabId === activeTabId) {
        const idx = prev.findIndex(t => t.id === tabId);
        const nextTab = next[idx] || next[next.length - 1];
        if (nextTab) setActiveTabId(nextTab.id);
        else {
          setActiveTabId(null);
          return next;
        }
      }
      return next;
    });
  }, [activeTabId]);

  const handleTabReorder = useCallback((from, to) => {
    setTabs(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  }, []);

  const duplicateTab = useCallback((tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    const newTab = {
      id: Date.now().toString(),
      url: tab.url,
      title: tab.title,
      favicon: tab.favicon,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      lastActive: Date.now(),
      suspended: false
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [tabs]);

  const toggleBookmark = useCallback(async () => {
    if (!activeTab?.url || activeTab.url.startsWith('cove://')) return;
    const current = bookmarks || [];
    const exists = current.find(b => b.url === activeTab.url);
    let updated;
    if (exists) {
      updated = current.filter(b => b.url !== activeTab.url);
    } else {
      updated = [{
        id: Date.now().toString(),
        url: activeTab.url,
        title: activeTab.title || activeTab.url,
        favicon: activeTab.favicon || null,
        addedAt: Date.now()
      }, ...current];
    }
    setBookmarks(updated);
  }, [activeTab, bookmarks, setBookmarks]);

  const zoomIn = () => {
    const wv = webviewRefs.current[activeTabId];
    if (!wv) return;
    try {
      const newZoom = Math.min(zoomLevel + 0.1, 3.0);
      wv.setZoomFactor(newZoom);
      setZoomLevel(newZoom);
    } catch(e) {}
  };

  const zoomOut = () => {
    const wv = webviewRefs.current[activeTabId];
    if (!wv) return;
    try {
      const newZoom = Math.max(zoomLevel - 0.1, 0.3);
      wv.setZoomFactor(newZoom);
      setZoomLevel(newZoom);
    } catch(e) {}
  };

  const resetZoom = () => {
    const wv = webviewRefs.current[activeTabId];
    if (!wv) return;
    try {
      wv.setZoomFactor(1.0);
      setZoomLevel(1.0);
    } catch(e) {}
  };

  const navigateTab = useCallback((tabId, url) => {
    const pageTitles = {
      'cove://home': 'New Tab',
      'cove://bookmarks': 'Bookmarks',
      'cove://history': 'History',
      'cove://downloads': 'Downloads',
      'cove://profile': 'Profile',
      'cove://settings': 'Settings',
      'cove://acknowledgements': 'Acknowledgements'
    };
    const updates = { url, title: pageTitles[url] || activeTab?.title || 'New Tab', failedLoad: false };
    if (url.startsWith('cove://')) updates.favicon = coveFavicon;
    updateTab(tabId, updates);

    if (!url.startsWith('cove://') && !isIncognito) {
      window.electronAPI.storeGet('history').then(h => {
        const history = h || [];
        history.unshift({ id: Date.now().toString(), url, title: url, timestamp: Date.now() });
        window.electronAPI.storeSet('history', history.slice(0, 500));
      });
    }
  }, [updateTab, activeTab]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 't') { e.preventDefault(); createNewTab(); }
        if (e.key === 'w') { e.preventDefault(); if (activeTabId) closeTab(activeTabId); }
        if (e.key === 'l') { e.preventDefault(); document.querySelector('input')?.focus(); }
        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); const wv = webviewRefs.current[activeTabId]; if (wv) try { wv.reload(); } catch(err) {} }
        if (e.key === 'd') { e.preventDefault(); toggleBookmark(); }
        if (e.key === 'f') { e.preventDefault(); setShowFindBar(true); }
        if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
        if (e.key === '-') { e.preventDefault(); zoomOut(); }
        if (e.key === '0') { e.preventDefault(); resetZoom(); }
      }
      if (e.key === 'Tab' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        setTabs(currentTabs => {
          const currentIndex = currentTabs.findIndex(t => t.id === activeTabId);
          const nextIndex = e.shiftKey
            ? (currentIndex - 1 + currentTabs.length) % currentTabs.length
            : (currentIndex + 1) % currentTabs.length;
          if (currentTabs[nextIndex]) setActiveTabId(currentTabs[nextIndex].id);
          return currentTabs;
        });
      }
      if (e.altKey && e.key === 'Home') { e.preventDefault(); navigateTab(activeTabId, 'cove://home'); }
      if (e.key === 'Escape') {
        if (showFindBar) {
          setShowFindBar(false);
          setFindQuery('');
          const wv = webviewRefs.current[activeTabId];
          if (wv) try { wv.stopFindInPage('clearSelection'); } catch(e) {}
        } else {
          const wv = webviewRefs.current[activeTabId];
          if (wv) try { wv.stop(); } catch(e) {}
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [createNewTab, closeTab, activeTabId, toggleBookmark, zoomIn, zoomOut, resetZoom, showFindBar, navigateTab]);

  const isInternal = activeTab?.url?.startsWith('cove://');

  const renderPage = () => {
    const props = { onNavigate: (url) => navigateTab(activeTabId, url), profile, setProfile, settings, setSettings, isDark, setTheme, searchEngine, setSearchEngine };
    switch (activeTab?.url) {
      case 'cove://home': case 'cove://newtab': return <NewTab {...props} />;
      case 'cove://bookmarks': return <Bookmarks {...props} />;
      case 'cove://history': return <History {...props} />;
      case 'cove://downloads': return <Downloads {...props} />;
      case 'cove://profile': return <Profile {...props} />;
      case 'cove://settings': return <Settings {...props} />;
      case 'cove://acknowledgements': return <Acknowledgements {...props} />;
      default: return <div style={{ padding: 20 }}>Page not found</div>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar
        tabs={tabs}
        activeTabId={activeTabId}
        activeTab={activeTab}
        onTabSelect={(id) => {
          setActiveTabId(id);
          setTabs(prev => prev.map(t => 
            t.id === id ? { ...t, lastActive: Date.now(), suspended: false } : t
          ));
        }}
        onTabClose={closeTab}
        onNewTab={createNewTab}
        onTabReorder={handleTabReorder}
        onDuplicateTab={duplicateTab}
        onNavigate={(url) => {
          // Always open internal cove:// pages in a new tab
          const pageTitles = {
            'cove://bookmarks': 'Bookmarks',
            'cove://history': 'History',
            'cove://downloads': 'Downloads',
            'cove://settings': 'Settings',
            'cove://profile': 'Profile',
            'cove://home': 'New Tab',
            'cove://acknowledgements': 'Acknowledgements'
          };
          
          if (url.startsWith('cove://')) {
            // Check if a tab with this URL already exists
            const existing = tabs.find(t => t.url === url);
            if (existing) {
              // Just switch to it
              setActiveTabId(existing.id);
            } else {
              // Open in new tab
              const t = {
                id: Date.now().toString(),
                url,
                title: pageTitles[url] || 'New Tab',
                favicon: coveFavicon,
                isLoading: false,
                canGoBack: false,
                canGoForward: false,
                lastActive: Date.now(),
                suspended: false
              };
              setTabs(prev => [...prev, t]);
              setActiveTabId(t.id);
            }
          } else {
            navigateTab(activeTabId, url);
          }
        }}
        isDark={isDark}
        profile={profile}
        coveFavicon={coveFavicon}
        isIncognito={isIncognito}
      />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '8px 8px 8px 0',
        gap: 0,
        background: 'var(--bg)'
      }}>
        {showOfflineBanner && (
          <div style={{
            background: backOnline ? '#2E7D32' : '#D93025',
            color: 'white',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'slideDown 0.2s ease'
          }}>
            <i className="fas fa-wifi" style={{ opacity: 0.8 }} />
            {backOnline ? 'Back online!' : 'No internet connection — some features may not work'}
            <button
              onClick={() => setShowOfflineBanner(false)}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, fontSize: 14 }}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        )}
        <Toolbar
          activeTab={activeTab}
          onNavigate={(url) => navigateTab(activeTabId, url)}
          onNavigateNew={(url) => {
            const t = {
              id: Date.now().toString(),
              url,
              title: 'New Tab',
              favicon: coveFavicon,
              isLoading: false,
              canGoBack: false,
              canGoForward: false,
              lastActive: Date.now(),
              suspended: false
            };
            setTabs([t]);
            setActiveTabId(t.id);
          }}
          onBack={() => { const wv = webviewRefs.current[activeTabId]; if (wv) try { wv.goBack(); } catch(e) {} }}
          onForward={() => { const wv = webviewRefs.current[activeTabId]; if (wv) try { wv.goForward(); } catch(e) {} }}
          onRefresh={() => { const wv = webviewRefs.current[activeTabId]; if (wv) try { wv.reload(); } catch(e) {} }}
          onStop={() => { const wv = webviewRefs.current[activeTabId]; if (wv) try { wv.stop(); } catch(e) {} }}
          onHome={() => navigateTab(activeTabId, 'cove://home')}
          isBookmarked={isBookmarked}
          onToggleBookmark={toggleBookmark}
          zoomLevel={zoomLevel}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
          searchEngine={searchEngine || 'google'}
          isDark={isDark}
          hoveredLink={hoveredLink}
        />
        <div style={{
          flex: 1,
          position: 'relative',
          background: 'var(--webview-bg)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}>
          {tabs.length === 0 ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--webview-bg)',
              gap: 8
            }}>
              <div id="empty-clock" style={{
                fontSize: 72,
                fontWeight: 300,
                color: 'var(--text-1)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '-2px',
                lineHeight: 1
              }} />
              <div id="empty-date" style={{
                fontSize: 16,
                color: 'var(--text-2)',
                fontWeight: 400,
                letterSpacing: '0.2px'
              }} />
            </div>
          ) : (
            <>
              {tabs.map(tab => (
                <WebView
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTabId && !isInternal}
                  isSuspended={tab.suspended}
                  isIncognito={isIncognito}
                  webviewRefs={webviewRefs}
                  onTabUpdate={updateTab}
                  onHoveredLink={setHoveredLink}
                />
              ))}
              {activeTab && activeTab.failedLoad && !isInternal && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 3 }}>
                  <ErrorPage
                    tab={activeTab}
                    onRefresh={() => { const wv = webviewRefs.current[activeTabId]; if(wv) try { wv.reload(); } catch(e){} }}
                    onHome={() => navigateTab(activeTabId, 'cove://home')}
                  />
                </div>
              )}
              {isInternal && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  background: 'var(--webview-bg)'
                }}>
                  {renderPage()}
                </div>
              )}
              {showFindBar && activeTab && !isInternal && (
                <FindBar
                  query={findQuery}
                  setQuery={setFindQuery}
                  onFindNext={() => { const wv = webviewRefs.current[activeTabId]; if(wv) try { wv.findInPage(findQuery); } catch(e){} }}
                  onFindPrev={() => { const wv = webviewRefs.current[activeTabId]; if(wv) try { wv.findInPage(findQuery, { forward: false }); } catch(e){} }}
                  onClose={() => { setShowFindBar(false); setFindQuery(''); const wv = webviewRefs.current[activeTabId]; if(wv) try { wv.stopFindInPage('clearSelection'); } catch(e){} }}
                  isDark={isDark}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
