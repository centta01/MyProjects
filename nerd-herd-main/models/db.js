const mongoose = require('mongoose')
const readLine = require('readline')
const dbURI = process.env.MONGO_URI
// We might want to use env variables to hide the URI at some point

if (process.platform === 'win64') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.on('SIGINT', () => {
    process.emit("SIGINT")
  })
}

mongoose.connect(dbURI, { useNewUrlParser: true })

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to MongoDB database server`)
})

mongoose.connection.on('disconnected', () => {
  console.log(`Mongoose disconnected`)
})
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose error: ${err}`)
})

const shutdownDB = (msg, callback) => {
  console.log(msg)
  mongoose.connection.close()
  callback()
}
// nodemon restart DB disconnect
process.once('SIGUSR2', () => {
  shutdownDB('MongoDB connectiong restarting due to nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2')
  })
})
// app termination
process.once('SIGINT', () => {
  shutdownDB('MongoDB connection severed due to app termination', () => {
    process.exit(0)
  })
})

require('./event')
require('./user')
require('./herd')