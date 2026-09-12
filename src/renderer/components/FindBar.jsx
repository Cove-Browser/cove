import React from 'react';

export default function FindBar({ query, setQuery, onFindNext, onFindPrev, onClose, isDark }) {
  return (
    <div style={{
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 100,
      background: 'var(--surface)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border)',
      animation: 'fadeIn 0.15s ease'
    }}>
      <i className="fas fa-search" style={{ color: 'var(--text-3)', fontSize: 12 }} />
      
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); if(e.target.value) onFindNext(); }}
        onKeyDown={e => {
          if (e.key === 'Enter') onFindNext();
          if (e.key === 'Escape') onClose();
        }}
        placeholder="Find in page..."
        autoFocus
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: 13,
          color: 'var(--text-1)',
          width: 180,
          fontFamily: 'inherit'
        }}
      />
      
      <button
        onClick={onFindPrev}
        style={{
          width: 24,
          height: 24,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: 'var(--text-2)',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <i className="fas fa-chevron-up" style={{ fontSize: 11 }} />
      </button>
      
      <button
        onClick={onFindNext}
        style={{
          width: 24,
          height: 24,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: 'var(--text-2)',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <i className="fas fa-chevron-down" style={{ fontSize: 11 }} />
      </button>
      
      <button
        onClick={onClose}
        style={{
          width: 24,
          height: 24,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          color: 'var(--text-2)',
          cursor: 'pointer',
          transition: 'var(--transition)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <i className="fas fa-times" style={{ fontSize: 11 }} />
      </button>
    </div>
  );
}
