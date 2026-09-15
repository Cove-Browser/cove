import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';

export default function PasswordManager({ onNavigate }) {
  const [passwords, setPasswords] = useStore('passwords', []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    const checkDisclaimer = async () => {
      const accepted = await window.electronAPI.storeGet('cpm-disclaimer-accepted');
      setDisclaimerAccepted(accepted === true);
      if (!accepted) {
        setShowDisclaimer(true);
      }
    };
    checkDisclaimer();
  }, []);

  const handleAddPassword = async () => {
    if (!newTitle.trim() || !newPassword.trim()) return;

    try {
      const encryptedBase64 = await window.electronAPI.encryptPassword(newPassword);
      const newPasswordEntry = {
        id: Date.now().toString(),
        title: newTitle,
        encryptedPassword: encryptedBase64,
        createdAt: Date.now()
      };
      const updated = [newPasswordEntry, ...(passwords || [])];
      setPasswords(updated);
      setNewTitle('');
      setNewPassword('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to encrypt password:', error);
      alert('Failed to save password. Encryption is not available on this system.');
    }
  };

  const handleDeletePassword = (id) => {
    const updated = passwords.filter(p => p.id !== id);
    setPasswords(updated);
  };

  const togglePasswordVisibility = async (id) => {
    const passwordEntry = passwords.find(p => p.id === id);
    if (!passwordEntry) return;

    const wasVisible = visiblePasswords[id];
    const willBeVisible = !wasVisible;
    
    if (willBeVisible) {
      try {
        let decrypted = await window.electronAPI.decryptPassword(passwordEntry.encryptedPassword);
        setDecryptedPasswords(prev => ({
          ...prev,
          [id]: decrypted
        }));
        setVisiblePasswords(prev => ({
          ...prev,
          [id]: true
        }));
        decrypted = null;
      } catch (error) {
        console.error('Failed to decrypt password:', error);
        alert('Failed to decrypt password. Decryption is not available on this system.');
      }
    } else {
      setDecryptedPasswords(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setVisiblePasswords(prev => ({
        ...prev,
        [id]: false
      }));
    }
  };

  const handleDisclaimerAccept = async () => {
    await window.electronAPI.storeSet('cpm-disclaimer-accepted', true);
    setDisclaimerAccepted(true);
    setShowDisclaimer(false);
  };

  const handleDisclaimerGoBack = () => {
    onNavigate('cove://home');
  };

  if (showDisclaimer && !disclaimerAccepted) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--webview-bg)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40
      }}>
        <div style={{
          maxWidth: 600,
          width: '100%',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          padding: 32,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 24,
            fontFamily: 'OpenSauceOne, sans-serif'
          }}>
            Cove Password Manager
          </h1>
          <p style={{
            fontSize: 14,
            color: 'var(--text)',
            marginBottom: 16,
            lineHeight: 1.6,
            fontFamily: 'OpenSauceOne, sans-serif'
          }}>
            Cove Browser includes an integrated password manager ("Cove Password Manager") as a built-in feature.
          </p>
          <p style={{
            fontSize: 14,
            color: 'var(--text)',
            marginBottom: 16,
            lineHeight: 1.6,
            fontFamily: 'OpenSauceOne, sans-serif'
          }}>
            You must read and understand the following before using Cove Password Manager:
          </p>
          <ul style={{
            fontSize: 14,
            color: 'var(--text)',
            marginBottom: 24,
            paddingLeft: 20,
            lineHeight: 1.6,
            fontFamily: 'OpenSauceOne, sans-serif'
          }}>
            <li style={{ marginBottom: 8 }}>
              All passwords saved in Cove Password Manager are stored locally on your device. Passwords are encrypted using your operating system's built-in credential protection (Windows DPAPI) where available.
            </li>
            <li style={{ marginBottom: 8 }}>
              core. studios does not have access to your saved passwords at any time.
            </li>
            <li style={{ marginBottom: 8 }}>
              You are solely responsible for the security of your device and the data stored on it.
            </li>
            <li style={{ marginBottom: 8 }}>
              We strongly advise that you do not store highly sensitive credentials (such as banking or government account passwords) in Cove Password Manager until a future update introduces stronger encryption.
            </li>
            <li>
              core. studios accepts no liability for any loss, theft, or unauthorised access to passwords stored through Cove Password Manager arising from device compromise, data breach, or any other cause.
            </li>
          </ul>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={handleDisclaimerGoBack}
              style={{
                background: 'transparent',
                color: 'var(--text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'OpenSauceOne, sans-serif',
                transition: 'background-color 150ms ease-in-out'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Go Back
            </button>
            <button
              onClick={handleDisclaimerAccept}
              style={{
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'OpenSauceOne, sans-serif',
                transition: 'background-color 150ms ease-in-out'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--accent-dk)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
            >
              I understand and wish to continue
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', margin: 0, fontFamily: 'OpenSauceOne, sans-serif' }}>
            Cove Password Manager
          </h1>
          <button
            onClick={() => setShowAddForm(v => !v)}
            style={{
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 150ms ease-in-out',
              fontFamily: 'OpenSauceOne, sans-serif'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent-dk)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
          >
            <i className="fas fa-plus" style={{ fontSize: 11 }} />
            Add Password
          </button>
        </div>

        {showAddForm && (
          <div style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            border: '1px solid var(--border)'
          }}>
            <input
              placeholder="Title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'OpenSauceOne, sans-serif'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'OpenSauceOne, sans-serif'
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleAddPassword}
                style={{
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  padding: '8px 16px',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'OpenSauceOne, sans-serif',
                  transition: 'background-color 150ms ease-in-out'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--accent-dk)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
              >
                Save
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewTitle(''); setNewPassword(''); }}
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '8px 16px',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'OpenSauceOne, sans-serif',
                  transition: 'background-color 150ms ease-in-out'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--surface)'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {passwords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <i className="fas fa-key" style={{ fontSize: 32, color: 'var(--text-muted)' }} />
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'OpenSauceOne, sans-serif' }}>
              No passwords saved yet. Click "Add Password" to get started.
            </p>
          </div>
        ) : (
          <div>
            {passwords.map(password => (
              <div
                key={password.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  marginBottom: 8,
                  border: '1px solid var(--border)',
                  transition: 'background-color 150ms ease-in-out'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius)',
                    flexShrink: 0,
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 14
                  }}
                >
                  <i className="fas fa-key" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4, fontFamily: 'OpenSauceOne, sans-serif' }}>
                    {password.title}
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: 'var(--text-muted)', 
                    fontFamily: 'Space Mono, monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    {visiblePasswords[password.id] ? (
                      <span style={{ wordBreak: 'break-all' }}>
                        {decryptedPasswords[password.id] || '••••••'}
                      </span>
                    ) : (
                      <span>••••••</span>
                    )}
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--text)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      <i className={visiblePasswords[password.id] ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePassword(password.id)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 150ms ease-in-out'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(192, 57, 43, 0.1)';
                    e.currentTarget.style.color = '#C0392B';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}