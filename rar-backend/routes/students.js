const router = require('express').Router()
const { verifyToken, requireRole } = require('../middlewares/auth')
const c = require('../controllers/studentsController')

router.use(verifyToken, requireRole('admin'))

router.get('/',     c.getAll)
router.post('/',    c.create)
router.put('/:id',  c.update)
router.delete('/:id', c.remove)

module.exports = router