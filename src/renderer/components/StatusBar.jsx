import React from 'react';

export default function StatusBar({ hoveredLink, isDark }) {
  if (!hoveredLink) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      padding: '2px 8px',
      background: isDark ? '#1A1F2E' : '#E8EDF5',
      borderTop: `1px solid ${isDark ? '#252A38' : '#D4DBE8'}`,
      fontSize: 12,
      color: isDark ? '#F5F5F5' : '#1A1916',
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
