import React from 'react';

const projects = [
  {
    name: 'Claude by Anthropic',
    description: 'The AI assistant that helped design, build, and debug Cove from the ground up.',
    license: 'Special Thanks',
    icon: 'fas fa-robot',
    url: 'https://www.anthropic.com'
  },
  {
    name: 'Anthropic',
    description: 'The AI safety company behind Claude, whose mission is the responsible development of AI for the long-term benefit of humanity.',
    license: 'Special Thanks',
    icon: 'fas fa-heart',
    url: 'https://www.anthropic.com'
  },
  {
    name: 'Windsurf by Codeium',
    description: 'The AI-powered code editor that wrote and iterated on every line of Cove\'s codebase.',
    license: 'Special Thanks',
    icon: 'fas fa-wind',
    url: 'https://windsurf.com'
  },
  {
    name: 'Chromium',
    description: 'The open-source browser engine that powers Cove\'s web rendering.',
    license: 'BSD 3-Clause License',
    icon: 'fas fa-globe',
    url: 'https://www.chromium.org'
  },
  {
    name: 'Electron',
    description: 'Framework for building cross-platform desktop apps with web technologies.',
    license: 'MIT License',
    icon: 'fas fa-desktop',
    url: 'https://www.electronjs.org'
  },
  {
    name: 'React',
    description: 'JavaScript library for building user interfaces, powering Cove\'s UI.',
    license: 'MIT License',
    icon: 'fas fa-atom',
    url: 'https://react.dev'
  },
  {
    name: 'Font Awesome Free',
    description: 'Icon library providing the icons used throughout Cove\'s interface.',
    license: 'CC BY 4.0 · SIL OFL 1.1 · MIT License',
    icon: 'fas fa-icons',
    url: 'https://fontawesome.com'
  },
  {
    name: 'Inter',
    description: 'The typeface used throughout Cove, designed by Rasmus Andersson.',
    license: 'SIL Open Font License 1.1',
    icon: 'fas fa-font',
    url: 'https://rsms.me/inter'
  },
  {
    name: 'electron-store',
    description: 'Simple data persistence for Electron apps, used for saving Cove\'s settings.',
    license: 'MIT License',
    icon: 'fas fa-database',
    url: 'https://github.com/sindresorhus/electron-store'
  },
  {
    name: 'webpack',
    description: 'Module bundler used to build Cove\'s renderer process.',
    license: 'MIT License',
    icon: 'fas fa-box',
    url: 'https://webpack.js.org'
  }
];

export default function Acknowledgements({ onNavigate, isDark }) {
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
        fontFamily: 'Inter, sans-serif',
        color: 'var(--text-1)'
      }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 8,
          color: 'var(--text-1)'
        }}>
          Acknowledgements
        </h1>
      <p style={{
        fontSize: 14,
        color: 'var(--text-2)',
        marginBottom: 40
      }}>
        Cove is built on the shoulders of these amazing open source projects.
      </p>

      {projects.map((project, index) => (
        <div
          key={index}
          style={{
            background: 'var(--surface)',
            borderRadius: 12,
            padding: '20px 24px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            fontSize: 18
          }}>
            <i className={project.icon}></i>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-1)'
            }}>
              {project.name}
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-2)',
              marginTop: 2
            }}>
              {project.description}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8
          }}>
            <span style={{
              background: project.license === 'Special Thanks' ? 'linear-gradient(135deg, #E17E45, #C96A2E)' : 'var(--accent)',
              color: '#FFFFFF',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 11,
              whiteSpace: 'nowrap'
            }}>
              {project.license}
            </span>
            <button
              onClick={() => onNavigate(project.url)}
              style={{
                fontSize: 12,
                color: 'var(--accent)',
                textDecoration: 'none',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0
              }}
            >
              Visit Website →
            </button>
          </div>
        </div>
      ))}

      <div style={{
        marginTop: 40,
        paddingTop: 20,
        borderTop: '1px solid var(--border)',
        fontSize: 12,
        color: 'var(--text-3)',
        textAlign: 'center'
      }}>
        All trademarks and registered trademarks are the property of their respective owners.
      </div>
      </div>
    </div>
  );
}
