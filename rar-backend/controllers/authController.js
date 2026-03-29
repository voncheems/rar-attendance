const pool    = require('../config/db')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')

exports.login = async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' })

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1', [username]
    )
    const user = rows[0]
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}