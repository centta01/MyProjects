const schedule = require('node-schedule')
const mongoose = require('mongoose')
const Event = mongoose.model('Event')
const User = mongoose.model('User')
const emailer = require('./emailController')

async function getUsersAndEvents() {
  try {

    const currentDate = new Date()

    const next24Hours = new Date(currentDate)
    next24Hours.setHours(currentDate.getHours() + 24)

    const events = await Event.find({
      eventDate: {
        $gte: currentDate,
        $lt: next24Hours
      }
    }).populate('userCreated') 

    const userEmailsAndEventTitles = events.map(event => ({
      userEmail: event.userCreated.email,
      eventTitle: event.eventTitle
    }))

    return userEmailsAndEventTitles
  } catch (error) {
    console.error('Error getting user emails and event titles with events:', error)
    throw error
  }
}

//fires every day at 12:00 AM
const alertUsers = schedule.scheduleJob('0 0 * * *', async function() {
  let records = await getUsersAndEvents()
  for(let i = 0; i < records.length; i++){
    await emailer.sendEMail(records[i].userEmail, 'Event Reminder', 'Reminder: the event ' + records[i].eventTitle + ' is happening soon')
    console.log('emailed reminder message for ' + records[i].eventTitle + ' to ' + records[i].userEmail)
  }
})
