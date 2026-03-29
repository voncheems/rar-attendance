const router = require('express').Router()
const { verifyToken, requireRole } = require('../middlewares/auth')
const c = require('../controllers/attendanceController')

router.get('/stats',   verifyToken, requireRole('admin'), c.getStats)
router.get('/recent',  verifyToken, requireRole('admin'), c.getRecent)
router.get('/export',  verifyToken, requireRole('admin'), c.exportCSV)
router.get('/',        verifyToken, requireRole('admin'), c.getAll)
router.post('/scan',   verifyToken, c.scan)

module.exports = router