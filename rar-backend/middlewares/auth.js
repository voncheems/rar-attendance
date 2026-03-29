const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ message: 'No token provided' })

  const token = header.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Invalid token format' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Token expired or invalid' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}

module.exports = { verifyToken, requireRole }