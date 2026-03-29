const pool = require('../config/db')

exports.getAll = async (req, res) => {
  const { page = 1, limit = 20, search = '', date_from, date_to } = req.query
  const offset = (page - 1) * limit
  const like   = `%${search}%`

  let where = `WHERE (s.name ILIKE $1 OR s.student_no ILIKE $1)`
  const params = [like]

  if (date_from) { params.push(date_from); where += ` AND a.date >= $${params.length}` }
  if (date_to)   { params.push(date_to);   where += ` AND a.date <= $${params.length}` }

  try {
    const { rows: records } = await pool.query(
      `SELECT a.*, s.name AS student_name, s.student_no
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    )
    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM attendance a JOIN students s ON s.id = a.student_id ${where}`,
      params
    )
    res.json({ records, total: parseInt(count) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getRecent = async (req, res) => {
  const limit = req.query.limit || 10
  try {
    const { rows } = await pool.query(
      `SELECT a.*, s.name AS student_name, s.student_no
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const [students, todayCount, monthCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query('SELECT COUNT(*) FROM attendance WHERE date = $1', [today]),
      pool.query(`SELECT COUNT(*) FROM attendance WHERE date >= date_trunc('month', CURRENT_DATE)`),
    ])
    const total = parseInt(students.rows[0].count)
    const todayCnt = parseInt(todayCount.rows[0].count)
    const monthCnt = parseInt(monthCount.rows[0].count)
    const rate = total > 0 ? Math.round((todayCnt / total) * 100) : 0

    res.json({ totalStudents: total, todayCount: todayCnt, monthCount: monthCnt, rate })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.scan = async (req, res) => {
  const { student_no } = req.body
  if (!student_no) return res.status(400).json({ message: 'student_no required' })

  try {
    const { rows } = await pool.query(
      'SELECT * FROM students WHERE student_no = $1', [student_no]
    )
    const student = rows[0]
    if (!student) return res.status(404).json({ message: 'Student not found' })

    const today = new Date().toISOString().slice(0, 10)
    const { rows: existing } = await pool.query(
      'SELECT * FROM attendance WHERE student_id = $1 AND date = $2', [student.id, today]
    )

    let record, type
    if (!existing[0]) {
      // First scan = time in
      const { rows: ins } = await pool.query(
        `INSERT INTO attendance (student_id, date, time_in, type)
         VALUES ($1, $2, NOW(), 'in') RETURNING *`,
        [student.id, today]
      )
      record = ins[0]; type = 'in'
    } else if (!existing[0].time_out) {
      // Second scan = time out
      const { rows: upd } = await pool.query(
        `UPDATE attendance SET time_out = NOW(), type = 'out'
         WHERE id = $1 RETURNING *`,
        [existing[0].id]
      )
      record = upd[0]; type = 'out'
    } else {
      return res.status(409).json({ message: 'Already fully logged for today' })
    }

    res.json({ record, student, type })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.exportCSV = async (req, res) => {
  const { search = '', date_from, date_to } = req.query
  const like = `%${search}%`
  let where = `WHERE (s.name ILIKE $1 OR s.student_no ILIKE $1)`
  const params = [like]

  if (date_from) { params.push(date_from); where += ` AND a.date >= $${params.length}` }
  if (date_to)   { params.push(date_to);   where += ` AND a.date <= $${params.length}` }

  try {
    const { rows } = await pool.query(
      `SELECT s.name, s.student_no, s.course, s.year_level, s.section,
              a.date, a.time_in, a.time_out, a.type
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       ${where}
       ORDER BY a.date DESC, s.name ASC`,
      params
    )

    const header = 'Name,Student No.,Course,Year,Section,Date,Time In,Time Out,Type\n'
    const csv = rows.map(r =>
      [r.name, r.student_no, r.course, r.year_level, r.section,
       r.date?.toISOString().slice(0,10),
       r.time_in ? new Date(r.time_in).toLocaleTimeString() : '',
       r.time_out ? new Date(r.time_out).toLocaleTimeString() : '',
       r.type
      ].join(',')
    ).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="attendance.csv"`)
    res.send(header + csv)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}