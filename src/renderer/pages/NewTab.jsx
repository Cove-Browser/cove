import React, { useState, useEffect } from 'react';

export default function NewTab() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        fontFamily: 'Inter, sans-serif',
        minHeight: '100%'
      }}>
        <div style={{
          fontSize: '72px',
          fontWeight: 300,
          letterSpacing: '-2px',
          color: 'var(--text-1)'
        }}>
          {time}
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: 400,
          color: 'var(--text-2)'
        }}>
          {date}
        </div>
        <div style={{
          fontSize: '13px',
          color: 'var(--text-3)',
          marginTop: '24px',
          fontWeight: 400
        }}>
          Start typing in the address bar to browse
        </div>
      </div>
    </div>
  );
}
