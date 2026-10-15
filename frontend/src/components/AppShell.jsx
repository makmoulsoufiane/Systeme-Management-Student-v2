import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const defaultNavigation = [
  { path: '/students', label: 'Students', icon: 'students' },
  { path: '/teachers', label: 'Teachers', icon: 'teachers' },
  { path: '/groups', label: 'Groups', icon: 'groups' },
  { path: '/exams', label: 'Exams', icon: 'exams' },
  { path: '/scores', label: 'Scores', icon: 'scores' },
]

export function CampusMark() {
  return (
    <span className="brand-mark">
      <svg width="25" height="25" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="m4 10 10-6 10 6-10 6-10-6Z" fill="currentColor" />
        <path d="m7 14 7 4 7-4v6l-7 4-7-4v-6Z" fill="currentColor" opacity=".7" />
      </svg>
    </span>
  )
}

export default function AppShell({ user, onLogout, children, navigation = defaultNavigation, roleLabel = 'Staff' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const displayName = user?.display_name || user?.username || 'Staff member'

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className={`sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="sidebar-brand">
          <CampusMark />
          <div>
            <span className="brand-name">Campus<span className="brand-dot">.</span></span>
            <span className="brand-subtitle">{roleLabel} workspace</span>
          </div>
          <button
            className="button button-icon mobile-toggle"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="workspace-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
        <div className="sidebar-content" id="workspace-navigation">
          <p className="nav-label">WORKSPACE</p>
          <nav aria-label="Main navigation">
            {navigation.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <span className="nav-indicator" />
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="sidebar-note-icon"><Icon name="book" /></span>
            <p>A little more organized.<br /><strong>A lot more possible.</strong></p>
            <span>Your campus, connected.</span>
          </div>
          <div className="sidebar-account">
            <span className="avatar account-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <div className="account-copy">
              <strong>{displayName}</strong>
              <span>{roleLabel} account</span>
            </div>
            <button className="button button-icon" onClick={onLogout} aria-label="Sign out" title="Sign out">
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-header">
          <span className="workspace-label"><Icon name="book" size={17} />Academic workspace</span>
          <span className="workspace-status"><span />{roleLabel} portal</span>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>{children}</main>
        <footer className="workspace-footer">
          <span>Campus · Student management</span>
          <span>Made for a clearer school day.</span>
        </footer>
      </div>
    </div>
  )
}
