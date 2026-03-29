import { useEffect, useState, useCallback } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Search, Download, ChevronLeft, ChevronRight, Filter, ClipboardList } from 'lucide-react'

const inputStyle = {
  padding: '10px 14px', borderRadius: 10, fontSize: 13,
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
  color: '#e8edf5', outline: 'none', transition: 'border-color .15s',
}

function TypeBadge({ type }) {
  const isIn = type?.toLowerCase() === 'in'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
      background: isIn ? 'rgba(52,211,153,.1)' : 'rgba(96,165,250,.1)',
      color:      isIn ? '#34d399' : '#60a5fa',
      border:     `1px solid ${isIn ? 'rgba(52,211,153,.2)' : 'rgba(96,165,250,.2)'}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: isIn ? '#34d399' : '#60a5fa' }} />
      {isIn ? 'Time In' : 'Time Out'}
    </span>
  )
}

export default function RecordsPage() {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/attendance', { params: { page, limit, search, date_from: dateFrom, date_to: dateTo } })
      setRecords(data.records ?? data.data ?? data)
      setTotal(data.total ?? data.count ?? 0)
    } catch { toast.error('Failed to load records') }
    finally { setLoading(false) }
  }, [page, search, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const exportCSV = async () => {
    try {
      const { data } = await api.get('/attendance/export', { params: { search, date_from: dateFrom, date_to: dateTo }, responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const a = document.createElement('a'); a.href = url; a.download = `attendance-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url)
      toast.success('Export ready!')
    } catch { toast.error('Export failed') }
  }

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#e8edf5', letterSpacing: '-.02em', marginBottom: 4 }}>Records</h1>
          <p style={{ fontSize: 13, color: '#2a3548' }}>{total} attendance entries</p>
        </div>
        <button onClick={exportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', color: '#c8d3e0', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.14)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.09)' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#3d4d60' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                 placeholder="Search student…"
                 style={{ ...inputStyle, paddingLeft: 38, width: '100%', boxSizing: 'border-box' }}
                 onFocus={e => e.target.style.borderColor = 'rgba(26,157,117,.5)'}
                 onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
          <Filter size={13} style={{ color: '#3d4d60' }} />
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                 style={{ ...inputStyle, padding: '4px 8px', border: 'none', background: 'none', fontSize: 12 }}
                 onFocus={e => e.target.style.borderColor = 'transparent'}
                 onBlur={e => e.target.style.borderColor = 'transparent'} />
          <span style={{ color: '#2a3548', fontSize: 12 }}>to</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
                 style={{ ...inputStyle, padding: '4px 8px', border: 'none', background: 'none', fontSize: 12 }}
                 onFocus={e => e.target.style.borderColor = 'transparent'}
                 onBlur={e => e.target.style.borderColor = 'transparent'} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              {['Student', 'Student No.', 'Date', 'Time In', 'Time Out', 'Type'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2a3548' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>Loading…</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>
                <ClipboardList size={32} style={{ color: '#1e2836', display: 'block', margin: '0 auto 12px' }} />
                No records found.
              </td></tr>
            ) : records.map((r, i) => (
              <tr key={r.id ?? i} style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '13px 20px', fontWeight: 500, color: '#c8d3e0' }}>{r.student_name || r.name || '—'}</td>
                <td style={{ padding: '13px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#3d4d60' }}>{r.student_no || '—'}</td>
                <td style={{ padding: '13px 20px', fontSize: 12, color: '#3d4d60' }}>{r.date ? new Date(r.date).toLocaleDateString('en-PH') : '—'}</td>
                <td style={{ padding: '13px 20px', color: '#34d399', fontWeight: 500 }}>{r.time_in ? new Date(r.time_in).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td style={{ padding: '13px 20px', color: '#3d4d60' }}>{r.time_out ? new Date(r.time_out).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                <td style={{ padding: '13px 20px' }}><TypeBadge type={r.type} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#2a3548' }}>Page {page} of {pages} · {total} records</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['p', <ChevronLeft size={14} />, () => setPage(p => Math.max(1, p - 1)), page === 1],
                ['n', <ChevronRight size={14} />, () => setPage(p => Math.min(pages, p + 1)), page === pages]].map(([k, icon, fn, dis]) => (
                <button key={k} onClick={fn} disabled={dis}
                        style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', cursor: dis ? 'not-allowed' : 'pointer', color: dis ? '#2a3548' : '#5a6578', display: 'flex', opacity: dis ? .4 : 1 }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`input::placeholder { color: #2a3548; } input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3); }`}</style>
    </div>
  )
}