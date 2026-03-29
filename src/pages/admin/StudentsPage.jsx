import { useEffect, useState, useCallback } from 'react'
import api from '../../lib/api'
import toast from 'react-hot-toast'
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Users } from 'lucide-react'

const EMPTY = { name: '', student_no: '', email: '', course: '', year_level: '', section: '' }

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13,
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
  color: '#e8edf5', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
}

function Modal({ title, onClose, onSubmit, form, setForm, saving }) {
  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const fields = [
    { name: 'name',       label: 'Full Name',   type: 'text',   required: true,  span: 2 },
    { name: 'student_no', label: 'Student No.', type: 'text',   required: true  },
    { name: 'email',      label: 'Email',       type: 'email',  required: false },
    { name: 'course',     label: 'Course',      type: 'text',   required: false },
    { name: 'year_level', label: 'Year Level',  type: 'number', required: false },
    { name: 'section',    label: 'Section',     type: 'text',   required: false },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 520, background: '#0d1117', border: '1px solid rgba(255,255,255,.1)', borderRadius: 20, padding: 36, boxShadow: '0 40px 100px rgba(0,0,0,.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#e8edf5', letterSpacing: '-.01em' }}>{title}</h2>
            <p style={{ fontSize: 12, color: '#2a3548', marginTop: 3 }}>Fill in the student information below</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#5a6578', display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e8edf5'}
                  onMouseLeave={e => e.currentTarget.style.color = '#5a6578'}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {fields.map(f => (
            <div key={f.name} style={{ gridColumn: f.span === 2 ? '1 / -1' : undefined }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#3d4d60', marginBottom: 7 }}>
                {f.label}{f.required && <span style={{ color: '#f87171' }}> *</span>}
              </label>
              <input name={f.name} type={f.type} value={form[f.name]} onChange={h} required={f.required}
                     style={inputStyle}
                     onFocus={e => e.target.style.borderColor = 'rgba(26,157,117,.6)'}
                     onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose}
                    style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: '#5a6578', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
                    style={{ padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#1a9d75,#0a6647)', color: 'white', border: 'none', cursor: saving ? 'wait' : 'pointer', boxShadow: saving ? 'none' : '0 4px 20px rgba(26,157,117,.3)', fontFamily: 'Syne, sans-serif' }}>
              {saving ? 'Saving…' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const limit = 15

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

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = s => { setForm({ ...EMPTY, ...s }); setModal(s) }

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (modal === 'add') { await api.post('/students', form); toast.success('Student added!') }
      else { await api.put(`/students/${modal.id}`, form); toast.success('Student updated!') }
      setModal(null); load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const del = async s => {
    if (!confirm(`Delete ${s.name}? This cannot be undone.`)) return
    try { await api.delete(`/students/${s.id}`); toast.success('Deleted'); load() }
    catch (err) { toast.error(err.message) }
  }

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div style={{ padding: '36px 40px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#e8edf5', letterSpacing: '-.02em', marginBottom: 4 }}>Students</h1>
          <p style={{ fontSize: 13, color: '#2a3548' }}>{total} enrolled students</p>
        </div>
        <button onClick={openAdd}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg,#1a9d75,#0a6647)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, boxShadow: '0 4px 20px rgba(26,157,117,.3)', fontFamily: 'Syne, sans-serif', transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(26,157,117,.4)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,157,117,.3)'}>
          <Plus size={15} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#3d4d60' }} />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
               placeholder="Search by name or student number…"
               style={{ ...inputStyle, paddingLeft: 40 }}
               onFocus={e => e.target.style.borderColor = 'rgba(26,157,117,.5)'}
               onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.08)'} />
      </div>

      {/* Table */}
      <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              {['Name', 'Student No.', 'Course', 'Year', 'Section', ''].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#2a3548' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>Loading…</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', fontSize: 13, color: '#2a3548' }}>
                <Users size={32} style={{ color: '#1e2836', display: 'block', margin: '0 auto 12px' }} />
                No students found.
              </td></tr>
            ) : students.map((s, i) => (
              <tr key={s.id ?? i} style={{ borderBottom: '1px solid rgba(255,255,255,.03)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(26,157,117,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1a9d75', flexShrink: 0 }}>
                      {s.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 500, color: '#c8d3e0' }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#3d4d60' }}>{s.student_no}</td>
                <td style={{ padding: '14px 20px', color: '#3d4d60' }}>{s.course || '—'}</td>
                <td style={{ padding: '14px 20px', color: '#3d4d60' }}>{s.year_level || '—'}</td>
                <td style={{ padding: '14px 20px', color: '#3d4d60' }}>{s.section || '—'}</td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <button onClick={() => openEdit(s)}
                            style={{ padding: '6px 8px', borderRadius: 8, background: 'none', border: '1px solid transparent', cursor: 'pointer', color: '#3d4d60', display: 'flex', transition: 'all .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,.1)'; e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.borderColor = 'rgba(96,165,250,.2)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#3d4d60'; e.currentTarget.style.borderColor = 'transparent' }}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => del(s)}
                            style={{ padding: '6px 8px', borderRadius: 8, background: 'none', border: '1px solid transparent', cursor: 'pointer', color: '#3d4d60', display: 'flex', transition: 'all .15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,.2)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#3d4d60'; e.currentTarget.style.borderColor = 'transparent' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#2a3548' }}>Page {page} of {pages} · {total} students</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['prev', <ChevronLeft size={14} />, () => setPage(p => Math.max(1, p - 1)), page === 1],
                ['next', <ChevronRight size={14} />, () => setPage(p => Math.min(pages, p + 1)), page === pages]].map(([k, icon, fn, disabled]) => (
                <button key={k} onClick={fn} disabled={disabled}
                        style={{ padding: '6px 8px', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', cursor: disabled ? 'not-allowed' : 'pointer', color: disabled ? '#2a3548' : '#5a6578', display: 'flex', opacity: disabled ? .4 : 1 }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && <Modal title={modal === 'add' ? 'Add Student' : 'Edit Student'} onClose={() => setModal(null)} onSubmit={save} form={form} setForm={setForm} saving={saving} />}
      <style>{`input::placeholder { color: #2a3548; }`}</style>
    </div>
  )
}