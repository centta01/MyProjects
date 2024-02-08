const mongoose = require('mongoose')

const herdSchema = new mongoose.Schema({
  herdName: {
    type: String,
    required: true
  },
  herdDescription: String,
  public: {
    type: Boolean,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  gatherings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  invitedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})

mongoose.model('Herd', herdSchema)