const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  eventTitle: {
    type: String,
    required: true
  },
  eventDescription: String,
  eventDate: Date,
  eventCreateDate: {
    type: Date,
    'default': Date.now
  },
  eventHost:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eventLocation: {
    type: String,
    required: true
  },
  eventAddress: {
    type: String,
    'default': "Address Private"
  },
  userCreated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  eventHerd:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Herd'
  },
  eventPotentialHosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  eventNerdResponses: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['Pending', 'Going', 'Not Going'],
        default: 'Pending',
      },
    },
  ],
  eventRolls: [
    {
      title: {
        type: String
      },
      roll: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        value: {
          type: Number,
          default: 0
        }
      }]
    },
  ],
  eventPolls: [
    {
      title: {
        type: String
      },
      selections: [{
        phrase: {
          type: String,
          default: "Choice"
        },
        votes: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }],
      }],
    },
  ],
})

mongoose.model('Event', eventSchema)