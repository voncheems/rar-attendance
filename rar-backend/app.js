const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes       = require('./routes/auth')
const studentsRoutes   = require('./routes/students')
const attendanceRoutes = require('./routes/attendance')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth',       authRoutes)
app.use('/api/students',   studentsRoutes)
app.use('/api/attendance', attendanceRoutes)

module.exports = app