import React from 'react';

export default function StatusBar({ hoveredLink, isDark }) {
  if (!hoveredLink) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      padding: '2px 8px',
      background: isDark ? '#26242E' : '#EDE8D0',
      borderTop: `1px solid ${isDark ? '#3A3845' : '#D4C9A8'}`,
      fontSize: 12,
      color: isDark ? '#F0EDE4' : '#2C2410',
      maxWidth: '50%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      zIndex: 9999
    }}>
      {hoveredLink}
    </div>
  );
}
