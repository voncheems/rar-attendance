import { useEffect, useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import jsQR from 'jsqr'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { Scan, CheckCircle2, XCircle, Camera, LogOut, Clock, User } from 'lucide-react'

const SCAN_INTERVAL = 400

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const webcamRef = useRef(null)
  const frameTimer = useRef(null)
  const lastScan = useRef('')
  const cooldown = useRef(false)

  const [camReady, setCamReady] = useState(false)
  const [camError, setCamError] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [history, setHistory] = useState([])
  const [scanning, setScanning] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const processQR = useCallback(async (code) => {
    if (cooldown.current || code === lastScan.current) return
    lastScan.current = code
    cooldown.current = true
    setScanning(true)
    try {
      const { data } = await api.post('/attendance/scan', { student_no: code })
      setScanResult({ type: 'success', data })
      setHistory(h => [{ ...data, scanned_at: new Date() }, ...h].slice(0, 30))
      toast.success(`${data.student?.name} — ${data.type === 'in' ? 'Time In' : 'Time Out'}`)
    } catch (err) {
      setScanResult({ type: 'error', data: { message: err.message } })
      toast.error(err.message)
    } finally {
      setScanning(false)
      setTimeout(() => { lastScan.current = ''; cooldown.current = false; setScanResult(null) }, 3500)
    }
  }, [])

  const scanFrame = useCallback(() => {
    const video = webcamRef.current?.video
    if (!video || video.readyState !== 4) return
    const { videoWidth: w, videoHeight: h } = video
    if (!w || !h) return
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const img = ctx.getImageData(0, 0, w, h)
    const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' })
    if (code?.data) processQR(code.data.trim())
  }, [processQR])

  useEffect(() => {
    if (camReady) frameTimer.current = setInterval(scanFrame, SCAN_INTERVAL)
    return () => clearInterval(frameTimer.current)
  }, [camReady, scanFrame])

  const isSuccess = scanResult?.type === 'success'
  const isError   = scanResult?.type === 'error'

  return (
    <div style={{ minHeight: '100vh', background: '#080b11', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: '#0d1117', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#1a9d75,#0a6647)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(26,157,117,.3)' }}>
            <Scan size={17} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#e8edf5', letterSpacing: '-.01em' }}>RAR Attendance</p>
            <p style={{ fontSize: 11, color: '#2a3548' }}>QR Scanner Station</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Live clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
            <Clock size={13} style={{ color: '#3d4d60' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#c8d3e0', letterSpacing: '.04em' }}>
              {time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#1a9d75,#0a6647)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#c8d3e0' }}>{user?.name || user?.username}</span>
          </div>

          <button onClick={logout}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'none', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', color: '#3d4d60', fontSize: 12, fontWeight: 500, transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,.3)'; e.currentTarget.style.background = 'rgba(248,113,113,.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#3d4d60'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; e.currentTarget.style.background = 'none' }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Camera area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 24 }}>

          {/* Date */}
          <p style={{ fontSize: 13, color: '#2a3548', letterSpacing: '.02em' }}>
            {time.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Scanner viewport */}
          <div style={{ position: 'relative', width: 420, height: 420, borderRadius: 24, overflow: 'hidden', background: '#000', border: `2px solid ${isSuccess ? 'rgba(52,211,153,.5)' : isError ? 'rgba(248,113,113,.5)' : 'rgba(255,255,255,.06)'}`, boxShadow: isSuccess ? '0 0 40px rgba(52,211,153,.2)' : isError ? '0 0 40px rgba(248,113,113,.2)' : '0 24px 80px rgba(0,0,0,.6)', transition: 'border-color .3s, box-shadow .3s' }}>

            {!camError ? (
              <Webcam ref={webcamRef} audio={false}
                      videoConstraints={{ facingMode: 'environment', width: 420, height: 420 }}
                      onUserMedia={() => setCamReady(true)}
                      onUserMediaError={() => setCamError(true)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#0d1117' }}>
                <Camera size={40} style={{ color: '#2a3548' }} />
                <p style={{ fontSize: 13, color: '#3d4d60' }}>Camera unavailable</p>
                <button onClick={() => setCamError(false)} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#c8d3e0', cursor: 'pointer', fontSize: 12 }}>Retry</button>
              </div>
            )}

            {/* Corner brackets */}
            {camReady && !camError && [
              { top: 20, left: 20, bt: 'border-top', bl: 'border-left' },
              { top: 20, right: 20, bt: 'border-top', bl: 'border-right' },
              { bottom: 20, left: 20, bt: 'border-bottom', bl: 'border-left' },
              { bottom: 20, right: 20, bt: 'border-bottom', bl: 'border-right' },
            ].map((c, i) => (
              <div key={i} style={{ position: 'absolute', ...c, width: 28, height: 28,
                borderTop: c.bt === 'border-top' ? '3px solid #1a9d75' : 'none',
                borderBottom: c.bt === 'border-bottom' ? '3px solid #1a9d75' : 'none',
                borderLeft: c.bl === 'border-left' ? '3px solid #1a9d75' : 'none',
                borderRight: c.bl === 'border-right' ? '3px solid #1a9d75' : 'none',
                borderRadius: 2 }} />
            ))}

            {/* Scanning line */}
            {camReady && !camError && (
              <div style={{ position: 'absolute', left: 24, right: 24, height: 2, borderRadius: 1, background: 'linear-gradient(90deg, transparent, #1a9d75, transparent)', boxShadow: '0 0 12px #1a9d75', animation: 'scanLine 2.5s ease-in-out infinite' }} />
            )}

            {/* Status badge */}
            {camReady && !camError && (
              <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 100, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a9d75', boxShadow: '0 0 6px #1a9d75' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#1a9d75', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '.06em' }}>SCANNING</span>
              </div>
            )}

            {/* Processing spinner */}
            {scanning && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(26,157,117,.3)', borderTopColor: '#1a9d75', animation: 'spin .8s linear infinite' }} />
              </div>
            )}
          </div>

          {/* Scan result */}
          <div style={{ width: 420, minHeight: 72, display: 'flex', alignItems: 'center' }}>
            {scanResult ? (
              <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 16, background: isSuccess ? 'rgba(52,211,153,.08)' : 'rgba(248,113,113,.08)', border: `1px solid ${isSuccess ? 'rgba(52,211,153,.25)' : 'rgba(248,113,113,.25)'}` }}>
                {isSuccess
                  ? <CheckCircle2 size={22} style={{ color: '#34d399', flexShrink: 0 }} />
                  : <XCircle size={22} style={{ color: '#f87171', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isSuccess ? '#34d399' : '#f87171', marginBottom: 2, fontFamily: 'Syne, sans-serif' }}>
                    {isSuccess ? (scanResult.data.type === 'in' ? '↑ Time In Logged' : '↓ Time Out Logged') : 'Scan Failed'}
                  </p>
                  {isSuccess && scanResult.data.student && (
                    <p style={{ fontSize: 13, color: '#c8d3e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {scanResult.data.student.name} · <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#3d4d60' }}>{scanResult.data.student.student_no}</span>
                    </p>
                  )}
                  {!isSuccess && <p style={{ fontSize: 12, color: '#f87171' }}>{scanResult.data.message}</p>}
                </div>
                <span style={{ fontSize: 11, color: '#2a3548', flexShrink: 0 }}>{new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ) : (
              <p style={{ width: '100%', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>Point the camera at a student QR code to record attendance</p>
            )}
          </div>
        </div>

        {/* History sidebar */}
        <div style={{ width: 300, borderLeft: '1px solid rgba(255,255,255,.05)', background: '#0d1117', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,.05)', flexShrink: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2a3548' }}>Scan History</p>
            <p style={{ fontSize: 11, color: '#1e2836', marginTop: 2 }}>{history.length} scans this session</p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Scan size={28} style={{ color: '#1e2836', display: 'block', margin: '0 auto 10px' }} />
                <p style={{ fontSize: 12, color: '#2a3548' }}>No scans yet</p>
              </div>
            ) : history.map((h, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .15s' }}
                   onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: h.type === 'in' ? 'rgba(52,211,153,.1)' : 'rgba(96,165,250,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={14} style={{ color: h.type === 'in' ? '#34d399' : '#60a5fa' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#c8d3e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.student?.name || '—'}</p>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100, flexShrink: 0,
                        background: h.type === 'in' ? 'rgba(52,211,153,.1)' : 'rgba(96,165,250,.1)',
                        color: h.type === 'in' ? '#34d399' : '#60a5fa' }}>
                        {h.type === 'in' ? '↑ In' : '↓ Out'}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#3d4d60', marginTop: 2 }}>{h.student?.student_no || '—'}</p>
                    <p style={{ fontSize: 11, color: '#1e2836', marginTop: 3 }}>
                      {h.scanned_at?.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanLine { 0%,100%{top:24px} 50%{top:calc(100% - 26px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}