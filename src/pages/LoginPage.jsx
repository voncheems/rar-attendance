import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Scan, AlertCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Welcome, ${user.name || user.username}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#080b11', position: 'relative', overflow: 'hidden' }}>

      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,157,117,.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,144,226,.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,.08) 0%, transparent 70%)' }} />
      </div>

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      {/* Left branding panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 60px', position: 'relative' }}>
        <div style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #1a9d75, #0a6647)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(26,157,117,.4)' }}>
              <Scan size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#e8edf5', letterSpacing: '-.01em' }}>RAR Attendance</span>
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-.03em' }}>
            Smart attendance<br />
            <span style={{ color: '#1a9d75' }}>tracking system</span>
          </h1>
          <p style={{ fontSize: 16, color: '#5a6578', lineHeight: 1.7, maxWidth: 380 }}>
            QR-based attendance management for modern classrooms. Fast, accurate, and effortless.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 40 }}>
            {['QR Code Scanning', 'Real-time Records', 'CSV Export', 'Role-based Access'].map(f => (
              <span key={f} style={{ fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 100, background: 'rgba(26,157,117,.1)', color: '#1a9d75', border: '1px solid rgba(26,157,117,.2)' }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ background: 'rgba(22,27,36,.8)', backdropFilter: 'blur(20px)', borderRadius: 24, border: '1px solid rgba(255,255,255,.07)', padding: 40, boxShadow: '0 40px 100px rgba(0,0,0,.5)' }}>

            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: '#e8edf5', marginBottom: 6, letterSpacing: '-.02em' }}>Sign in</h2>
              <p style={{ fontSize: 14, color: '#4a5568' }}>Enter your credentials to continue</p>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: 'rgba(224,85,85,.1)', border: '1px solid rgba(224,85,85,.25)', marginBottom: 24, fontSize: 13, color: '#f87171' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#4a5568', marginBottom: 8 }}>Username</label>
                <input
                  name="username" value={form.username} onChange={handle}
                  autoComplete="username" required placeholder="Enter username"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(26,157,117,.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#4a5568', marginBottom: 8 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handle}
                    autoComplete="current-password" required placeholder="Enter password"
                    style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#e8edf5', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(26,157,117,.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'}
                  />
                  <button type="button" onClick={() => setShow(v => !v)}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568', padding: 0, display: 'flex' }}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                      style={{ marginTop: 8, width: '100%', padding: '13px 20px', borderRadius: 12, background: loading ? '#0e6644' : 'linear-gradient(135deg, #1a9d75 0%, #0c6644 100%)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: 'Syne, sans-serif', letterSpacing: '.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 8px 24px rgba(26,157,117,.35)', transition: 'all .2s' }}>
                {loading ? 'Signing in…' : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#2a3040' }}>
            RAR Attendance Records System © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder { color: #2a3548; }
      `}</style>
    </div>
  )
}