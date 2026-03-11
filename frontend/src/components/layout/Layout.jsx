import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { logout, selectCurrentUser } from '../../store/authSlice'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2-fill', adminOnly: false },
  { to: '/students', label: 'Students', icon: 'bi-people-fill', adminOnly: false },
  { to: '/audit-logs', label: 'Audit Logs', icon: 'bi-journal-text', adminOnly: true },
]

export default function Layout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrentUser)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Show audit logs only to admin
  const visibleNav = navItems.filter(
    (item) => !item.adminOnly || currentUser?.role === 'admin'
  )

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(148, 129, 129, 0.45)',
            zIndex: 1040,
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <div
        className="sidebar"
        style={{
          position: window.innerWidth < 992 ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1045,
          transform: window.innerWidth < 992 && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Logo */}
        <div
          className="d-flex align-items-center gap-2 px-4 py-4"
          style={{ borderBottom: '1px solid #1e293b' }}
        >

          <div className="d-flex align-items-center gap-2 rounded-3 p-2 mb-2" style={{ backgroundColor: '#1e293b' }}  >
            <div
              className="avatar text-white fw-bold"
              style={{ backgroundColor: '#4f46e5' }}
            >
              {currentUser?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-grow-1 overflow-hidden">
              <div className="text-white fw-medium text-truncate" style={{ fontSize: 13,width:160 }}>
                {currentUser?.name}
              </div>
              <div className="d-flex align-items-center gap-1">
                <i
                  className={`bi bi-shield-fill-check ${currentUser?.role === 'admin' ? 'text-warning' : 'text-secondary'}`}
                  style={{ fontSize: 10 }}
                />
                <span className="text-secondary text-capitalize" style={{ fontSize: 11 }}>
                  {currentUser?.role}
                </span>
              </div>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            className="btn btn-sm btn-dark ms-auto d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-grow-1 p-3">
          {visibleNav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-link mb-1 ${isActive ? 'active' : ''}`
              }
            >
              <i className={`bi ${icon}`} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="p-3" style={{ borderTop: '1px solid #1e293b' }}>

          <button
            onClick={handleLogout}
            className="btn btn-sm w-100 d-flex align-items-center gap-2 text-danger"
            style={{ background: 'transparent', border: 'none', fontSize: 14 }}
          >
            <i className="bi bi-box-arrow-right" />
            Sign out
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        {/* Page content */}
        <main className="flex-grow-1 overflow-auto p-4">
          <Outlet />
        </main>

      </div>
    </div>
  )
}