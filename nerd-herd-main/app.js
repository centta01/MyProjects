const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const methodOverride = require('method-override')
const passport = require('passport')
const  session = require('express-session')
const localStrategy = require('passport-local').Strategy
const bodyParser = require('body-parser')
require('dotenv').config()
require('./models/db')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(methodOverride('_method'))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// authentication middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true, // persist session on routing, but potential performance loss
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/users', usersRouter)

require('./controllers/scheduleController')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

module.exports = app
