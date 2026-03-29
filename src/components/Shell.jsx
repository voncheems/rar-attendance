import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Scan, Users, ClipboardList, QrCode, LayoutDashboard, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

const adminNav = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Overview',  end: true },
  { to: '/admin/students', icon: Users,           label: 'Students'            },
  { to: '/admin/records',  icon: ClipboardList,   label: 'Records'             },
  { to: '/admin/qr',       icon: QrCode,          label: 'QR Codes'            },
]

export default function Shell({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const nav = role === 'admin' ? adminNav : []

  const doLogout = () => { logout(); navigate('/login', { replace: true }) }
  const initials = (user?.name || user?.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080b11' }}>

      <aside style={{ width: collapsed ? 68 : 232, transition: 'width .25s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column', background: '#0d1117', borderRight: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>

        {/* Brand */}
        <div style={{ padding: collapsed ? '20px 12px' : '20px 18px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1a9d75,#0a6647)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(26,157,117,.3)' }}>
            <Scan size={17} color="white" />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#e8edf5', whiteSpace: 'nowrap', letterSpacing: '-.01em' }}>RAR Attendance</p>
              <p style={{ fontSize: 11, color: '#2a3548', whiteSpace: 'nowrap' }}>Management System</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {!collapsed && <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#2a3548', padding: '4px 10px 8px' }}>Navigation</p>}
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 14px' : '10px 12px',
                borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 500,
                transition: 'all .15s',
                background: isActive ? 'rgba(26,157,117,.12)' : 'transparent',
                color: isActive ? '#1a9d75' : '#3d4d60',
                borderLeft: isActive ? '2px solid #1a9d75' : '2px solid transparent',
              })}>
              {({ isActive }) => <>
                <Icon size={16} style={{ flexShrink: 0, color: isActive ? '#1a9d75' : '#3d4d60' }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
              </>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '8px 8px 12px', borderTop: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
          {/* User card */}
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1a9d75,#0a6647)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#c8d3e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || user?.username}</p>
                <p style={{ fontSize: 11, color: '#1a9d75', textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
            </div>
          )}
          <button onClick={doLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: collapsed ? '10px 14px' : '10px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#3d4d60', fontSize: 13, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(224,85,85,.08)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#3d4d60' }}>
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button onClick={() => setCollapsed(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: collapsed ? '10px 14px' : '10px 12px', borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#2a3548', fontSize: 13, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = '#5a6578' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#2a3548' }}>
            {collapsed ? <ChevronRight size={14} style={{ flexShrink: 0 }} /> : <ChevronLeft size={14} style={{ flexShrink: 0 }} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto', background: '#080b11' }}>
        <Outlet />
      </main>
    </div>
  )
}