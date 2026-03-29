import { useEffect, useState, useCallback, useRef } from 'react'
import api from '../../lib/api'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'
import { Search, Download, QrCode, ChevronLeft, ChevronRight, Printer, X } from 'lucide-react'

function QRModal({ student, onClose }) {
  const canvasRef = useRef()

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, student.student_no, {
      width: 220, margin: 2, color: { dark: '#080b11', light: '#ffffff' }
    }).catch(console.error)
  }, [student.student_no])

  const download = () => {
    QRCode.toDataURL(student.student_no, { width: 512, margin: 2, color: { dark: '#080b11', light: '#ffffff' } })
      .then(url => { const a = document.createElement('a'); a.href = url; a.download = `qr-${student.student_no}.png`; a.click() })
  }

  const print = () => {
    QRCode.toDataURL(student.student_no, { width: 512, margin: 2, color: { dark: '#080b11', light: '#ffffff' } })
      .then(url => {
        const w = window.open('', '_blank')
        w.document.write(`<html><head><title>QR – ${student.name}</title>
        <style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;font-family:'Syne',sans-serif;background:#fff;gap:12px}img{width:260px;height:260px}h2{margin:0;font-size:20px;color:#111}p{margin:0;font-size:13px;color:#666}</style>
        </head><body><img src="${url}"/><h2>${student.name}</h2><p>${student.student_no}</p><p>${[student.course,student.year_level,student.section].filter(Boolean).join(' · ')}</p></body></html>`)
        w.document.close(); w.print()
      })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(12px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.1)', borderRadius: 24, padding: '36px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: 340, boxShadow: '0 40px 100px rgba(0,0,0,.8)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#e8edf5' }}>{student.name}</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#3d4d60', marginTop: 3 }}>{student.student_no}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#5a6578', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>

        {/* QR Code */}
        <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 0 40px rgba(26,157,117,.15)' }}>
          <canvas ref={canvasRef} style={{ display: 'block' }} />
        </div>

        {student.course && (
          <p style={{ fontSize: 12, color: '#3d4d60', textAlign: 'center' }}>
            {[student.course, student.year_level && `Year ${student.year_level}`, student.section].filter(Boolean).join(' · ')}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={download}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#1a9d75,#0a6647)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(26,157,117,.3)', fontFamily: 'Syne, sans-serif' }}>
            <Download size={14} /> Download
          </button>
          <button onClick={print}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 16px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', color: '#c8d3e0', cursor: 'pointer', fontSize: 13 }}>
            <Printer size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function QRPage() {
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const limit = 18

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/students', { params: { page, limit, search } })
      setStudents(data.students ?? data.data ?? data)
      setTotal(data.total ?? data.count ?? 0)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#e8edf5', letterSpacing: '-.02em', marginBottom: 4 }}>QR Codes</h1>
        <p style={{ fontSize: 13, color: '#2a3548' }}>Click a student card to generate and download their QR code</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3d4d60' }} />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
               placeholder="Search students…"
               style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#e8edf5', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
               onFocus={e => e.target.style.borderColor = 'rgba(26,157,117,.5)'}
               onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
      </div>

      {loading ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>Loading…</div>
      ) : students.length === 0 ? (
        <div style={{ padding: '80px 20px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>No students found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {students.map((s, i) => (
            <button key={s.id ?? i} onClick={() => setSelected(s)}
                    style={{ textAlign: 'left', borderRadius: 16, padding: '20px 18px', background: '#0d1117', border: '1px solid rgba(255,255,255,.06)', cursor: 'pointer', transition: 'all .2s', display: 'flex', flexDirection: 'column', gap: 12 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(26,157,117,.4)'; e.currentTarget.style.background = '#111820'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)'; e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(26,157,117,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={18} style={{ color: '#1a9d75' }} />
                </div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(26,157,117,.4)' }} />
              </div>

              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#c8d3e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{s.name}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#3d4d60', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.student_no}</p>
                {s.course && <p style={{ fontSize: 11, color: '#2a3548', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.course} {s.year_level}{s.section}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <span style={{ fontSize: 12, color: '#2a3548' }}>Page {page} of {pages}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['p', <ChevronLeft size={14} />, () => setPage(p => Math.max(1, p-1)), page===1],
              ['n', <ChevronRight size={14} />, () => setPage(p => Math.min(pages, p+1)), page===pages]].map(([k,icon,fn,dis]) => (
              <button key={k} onClick={fn} disabled={dis}
                      style={{ padding: '7px 9px', borderRadius: 8, background: '#0d1117', border: '1px solid rgba(255,255,255,.06)', cursor: dis ? 'not-allowed' : 'pointer', color: dis ? '#2a3548' : '#5a6578', display: 'flex', opacity: dis ? .4 : 1 }}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && <QRModal student={selected} onClose={() => setSelected(null)} />}
      <style>{`input::placeholder { color: #2a3548; }`}</style>
    </div>
  )
}