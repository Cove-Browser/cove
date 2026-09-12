import React, { useEffect, useRef } from 'react';

export default function ContextMenu({ items, x, y, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuWidth = 180;
  const menuHeight = items.length * 40;

  const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x;
  const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        zIndex: 10000,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px',
        minWidth: '180px',
        boxShadow: 'var(--shadow-md)',
        animation: 'fadeIn var(--duration-sm) var(--ease)'
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.action();
            onClose();
          }}
          className="sidebar-item"
          style={{
            width: '100%',
            padding: '10px 14px',
            textAlign: 'left',
            border: 'none',
            background: 'transparent',
            fontSize: 13,
            color: 'var(--text)',
            cursor: 'pointer',
            fontFamily: 'OpenSauceOne, sans-serif',
            display: 'block'
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
