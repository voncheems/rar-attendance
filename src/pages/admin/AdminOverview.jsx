import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Users, ClipboardCheck, CalendarDays, TrendingUp, ArrowUpRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 16, transition: 'border-color .2s, transform .2s', cursor: 'default' }}
         onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
         onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={color} />
        </div>
        <ArrowUpRight size={14} style={{ color: '#2a3548' }} />
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Syne, sans-serif', color: '#e8edf5', letterSpacing: '-.02em', lineHeight: 1 }}>{value ?? '—'}</p>
        <p style={{ fontSize: 13, color: '#3d4d60', marginTop: 6 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: '#2a3548', marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/attendance/stats').catch(() => ({ data: {} })),
      api.get('/attendance/recent?limit=10').catch(() => ({ data: [] })),
    ]).then(([s, r]) => {
      setStats(s.data)
      setRecent(Array.isArray(r.data) ? r.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#e8edf5', letterSpacing: '-.02em', marginBottom: 4 }}>Overview</h1>
        <p style={{ fontSize: 13, color: '#2a3548' }}>{today}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users}          label="Total Students"     value={stats?.totalStudents} color="#60a5fa" bg="rgba(96,165,250,.1)"  />
        <StatCard icon={ClipboardCheck} label="Today's Attendance" value={stats?.todayCount}    color="#34d399" bg="rgba(52,211,153,.1)"  />
        <StatCard icon={CalendarDays}   label="This Month"         value={stats?.monthCount}    color="#fbbf24" bg="rgba(251,191,36,.1)"  sub="records" />
        <StatCard icon={TrendingUp}     label="Attendance Rate"    value={stats?.rate != null ? `${stats.rate}%` : null} color="#a78bfa" bg="rgba(167,139,250,.1)" sub="last 30 days" />
      </div>

      {/* Recent table */}
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#c8d3e0', letterSpacing: '-.01em' }}>Recent Attendance</h2>
            <p style={{ fontSize: 12, color: '#2a3548', marginTop: 2 }}>Latest scan activity</p>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(52,211,153,.1)', color: '#34d399', border: '1px solid rgba(52,211,153,.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            Live
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>Loading…</div>
        ) : recent.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>No attendance records yet today.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                {['Student', 'Student No.', 'Time In', 'Time Out', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2a3548' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={r.id ?? i} style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 24px', fontWeight: 500, color: '#c8d3e0' }}>{r.student_name || r.name || '—'}</td>
                  <td style={{ padding: '14px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#3d4d60' }}>{r.student_no || '—'}</td>
                  <td style={{ padding: '14px 24px', color: '#34d399', fontWeight: 500 }}>{r.time_in ? new Date(r.time_in).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td style={{ padding: '14px 24px', color: '#3d4d60' }}>{r.time_out ? new Date(r.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td style={{ padding: '14px 24px', fontSize: 12, color: '#2a3548' }}>{r.date ? new Date(r.date).toLocaleDateString('en-PH') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}