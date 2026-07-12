import React, { useEffect, useRef, forwardRef } from 'react';

const WebView = forwardRef(({ tab, isActive, isSuspended, isIncognito, webviewRefs, onTabUpdate, onHoveredLink }, ref) => {
  const webviewRef = useRef(null);

  useEffect(() => {
    if (webviewRef.current) webviewRefs.current[tab.id] = webviewRef.current;
  }, [tab.id]);

  useEffect(() => {
    const wv = webviewRef.current;
    if (!wv) return;
    if (isSuspended) {
      try { wv.src = 'about:blank'; } catch(e) {}
    } else if (!tab.url.startsWith('cove://')) {
      wv.src = tab.url;
    }
  }, [tab.url, tab.id, isSuspended]);

  useEffect(() => {
    const wv = webviewRef.current;
    if (!wv) return;

    const applyTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      try {
        wv.insertCSS(dark
          ? ':root { color-scheme: dark !important; } * { color-scheme: dark !important; }'
          : ':root { color-scheme: light !important; } * { color-scheme: light !important; }'
        ).catch(() => {});
      } catch(e) {}
    };

    const onReady = () => {
      applyTheme();
      try {
        onTabUpdate(tab.id, { title: wv.getTitle() || 'New Tab', url: wv.getURL() });
      } catch(e) {}
    };
    const onTitle = (e) => onTabUpdate(tab.id, { title: e.title });
    const onFavicon = (e) => { if (e.favicons?.[0]) onTabUpdate(tab.id, { favicon: e.favicons[0] }); };
    const onNavigate = (e) => {
      onTabUpdate(tab.id, { url: e.url });
      try { onTabUpdate(tab.id, { canGoBack: wv.canGoBack(), canGoForward: wv.canGoForward() }); } catch(e) {}
    };
    const onStart = () => onTabUpdate(tab.id, { isLoading: true });
    const onStop = () => {
      onTabUpdate(tab.id, { isLoading: false });
      try { onTabUpdate(tab.id, { canGoBack: wv.canGoBack(), canGoForward: wv.canGoForward() }); } catch(e) {}
    };
    const onHover = (e) => onHoveredLink(e.url || '');
    const onFailLoad = (e) => {
      if (e.errorCode === -3) return;
      onTabUpdate(tab.id, {
        failedLoad: true,
        errorCode: e.errorCode,
        errorDescription: e.errorDescription,
        failedUrl: e.validatedURL
      });
    };

    wv.addEventListener('dom-ready', onReady);
    wv.addEventListener('page-title-updated', onTitle);
    wv.addEventListener('page-favicon-updated', onFavicon);
    wv.addEventListener('did-navigate', onNavigate);
    wv.addEventListener('did-navigate-in-page', onNavigate);
    wv.addEventListener('did-start-loading', onStart);
    wv.addEventListener('did-stop-loading', onStop);
    wv.addEventListener('update-target-url', onHover);
    wv.addEventListener('did-fail-load', onFailLoad);

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      wv.removeEventListener('dom-ready', onReady);
      wv.removeEventListener('page-title-updated', onTitle);
      wv.removeEventListener('page-favicon-updated', onFavicon);
      wv.removeEventListener('did-navigate', onNavigate);
      wv.removeEventListener('did-navigate-in-page', onNavigate);
      wv.removeEventListener('did-start-loading', onStart);
      wv.removeEventListener('did-stop-loading', onStop);
      wv.removeEventListener('update-target-url', onHover);
      wv.removeEventListener('did-fail-load', onFailLoad);
      observer.disconnect();
    };
  }, [tab.id, onTabUpdate, onHoveredLink]);

  return (
    <div className={`webview-wrapper ${isActive ? 'visible' : 'hidden'}`} style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      visibility: isActive ? 'visible' : 'hidden',
      pointerEvents: isActive ? 'auto' : 'none'
    }}>
      <webview
        ref={webviewRef}
        partition={isIncognito ? 'incognito' : 'persist:cove'}
        webpreferences="contextIsolation=true, javascript=true, images=true, scrollbounce=true"
        allowpopups=""
        style={{ width: '100%', height: '100%', border: 'none', display: 'flex' }}
      />
    </div>
  );
});

export default WebView;
