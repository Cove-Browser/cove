import React, { useState, useEffect } from 'react';

export default function Profile({ onNavigate, profile, setProfile, isDark }) {
  const [displayName, setDisplayName] = useState(profile?.displayName || 'User');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await setProfile({ ...profile, displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const textColor = isDark ? '#F0EDE4' : '#2C2410';
  const subColor = isDark ? '#B8A898' : '#6B5A3E';
  const cardBg = isDark ? '#1E1D24' : '#F5F0E0';
  const borderColor = isDark ? '#3A3845' : '#D4C9A8';

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
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, color: textColor, marginBottom: 40 }}>Profile</h1>

        <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#7A9B8A',
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getUserInitials(displayName)}
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 500, color: textColor, marginBottom: 4 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 14, color: subColor }}>
              Cove Browser User
            </div>
          </div>
        </div>

        {/* Subtle text */}
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32, textAlign: 'center' }}>
          Your profile is used to personalize your Cove Browser experience.
        </div>

        {/* Display Name Input */}
        <div style={{ width: '100%', background: cardBg, borderRadius: 12, padding: 24, border: `1px solid ${borderColor}`, marginBottom: 24 }}>
          <label style={{ fontSize: 14, color: textColor, display: 'block', marginBottom: 12, fontWeight: 500 }}>
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: isDark ? '#16151A' : '#EDE8D0',
              color: textColor,
              fontSize: 16,
              outline: 'none',
              marginBottom: 16
            }}
          />
          <button
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              background: '#7A9B8A',
              color: '#FFFFFF',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}
