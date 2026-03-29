const pool = require('../config/db')

exports.getAll = async (req, res) => {
  const { page = 1, limit = 15, search = '' } = req.query
  const offset = (page - 1) * limit
  const like   = `%${search}%`

  try {
    const { rows: students } = await pool.query(
      `SELECT * FROM students
       WHERE name ILIKE $1 OR student_no ILIKE $1
       ORDER BY name ASC
       LIMIT $2 OFFSET $3`,
      [like, limit, offset]
    )
    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM students WHERE name ILIKE $1 OR student_no ILIKE $1`,
      [like]
    )
    res.json({ students, total: parseInt(count) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.create = async (req, res) => {
  const { name, student_no, email, course, year_level, section } = req.body
  try {
    const { rows } = await pool.query(
      `INSERT INTO students (name, student_no, email, course, year_level, section)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, student_no, email, course, year_level, section]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.update = async (req, res) => {
  const { id } = req.params
  const { name, student_no, email, course, year_level, section } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE students SET name=$1, student_no=$2, email=$3, course=$4, year_level=$5, section=$6
       WHERE id=$7 RETURNING *`,
      [name, student_no, email, course, year_level, section, id]
    )
    if (!rows[0]) return res.status(404).json({ message: 'Student not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.remove = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM students WHERE id=$1', [id])
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}