import React, { useState, useEffect } from 'react';
import ava1Wave from '../../../assets/avatars/ava1-wave.png';
import ava2Stones from '../../../assets/avatars/ava2-stones.png';
import ava3Leaf from '../../../assets/avatars/ava3-leaf.png';
import ava4Gradient from '../../../assets/avatars/ava4-gradient.png';

export default function Profile({ onNavigate, profile, setProfile, isDark }) {
  const [displayName, setDisplayName] = useState(profile?.displayName || 'User');
  const [saved, setSaved] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || null);

  const handleSave = async () => {
    await setProfile({ ...profile, displayName, avatar: selectedAvatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const avatars = [
    { id: 'ava1-wave.png', name: 'Wave', src: ava1Wave },
    { id: 'ava2-stones.png', name: 'Stones', src: ava2Stones },
    { id: 'ava3-leaf.png', name: 'Leaf', src: ava3Leaf },
    { id: 'ava4-gradient.png', name: 'Gradient', src: ava4Gradient }
  ];

  const [avatarErrors, setAvatarErrors] = useState({});

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length >= 2) return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const textColor = isDark ? '#F5F5F5' : '#1A1916';
  const subColor = isDark ? '#9A97A6' : '#6B6A62';
  const cardBg = isDark ? '#1A1F2E' : '#E8EDF5';
  const borderColor = isDark ? '#252A38' : '#D4DBE8';

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
          {selectedAvatar ? (
            <img
              src={avatars.find(a => a.id === selectedAvatar)?.src}
              alt="Avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent)'
              }}
              onError={() => setSelectedAvatar(null)}
            />
          ) : (
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
          )}
          <div>
            <div style={{ fontSize: 24, fontWeight: 500, color: textColor, marginBottom: 4 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 14, color: subColor }}>
              Cove Browser User
            </div>
          </div>
        </div>

        {/* Avatar Picker */}
        <div style={{ width: '100%', background: cardBg, borderRadius: 'var(--radius)', padding: 24, border: `1px solid ${borderColor}`, marginBottom: 24 }}>
          <label style={{ fontSize: 14, color: textColor, display: 'block', marginBottom: 12, fontWeight: 500 }}>
            Choose Avatar
          </label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {avatars.map(avatar => (
              <div
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.id)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: selectedAvatar === avatar.id ? '3px solid var(--accent)' : '2px solid var(--border)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'all 0.15s ease-in-out',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (selectedAvatar !== avatar.id) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAvatar !== avatar.id) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }
                }}
              >
                {!avatarErrors[avatar.id] ? (
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={() => {
                      setAvatarErrors(prev => ({ ...prev, [avatar.id]: true }));
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    background: 'var(--surface)'
                  }}>
                    {avatar.name[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subtle text */}
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32, textAlign: 'center' }}>
          Your profile is used to personalize your Cove Browser experience.
        </div>

        {/* Display Name Input */}
        <div style={{ width: '100%', background: cardBg, borderRadius: 'var(--radius)', padding: 24, border: `1px solid ${borderColor}`, marginBottom: 24 }}>
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
              borderRadius: 'var(--radius)',
              border: `1px solid ${borderColor}`,
              background: isDark ? '#111318' : '#F4F6FB',
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
              borderRadius: 'var(--radius)',
              border: 'none',
              background: 'var(--accent)',
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
