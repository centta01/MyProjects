const mongoose = require('mongoose')

const validateEmail = (email) => {
  let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  return regex.test(email)
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    validate: [validateEmail, 'Please provide valid email']
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    data: Buffer,
    contentType: String
  },
  phoneNum: String,
  phoneProvider: String,
  birthday: Date,
  herds: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Herd'
    }],
    default: []
  },
  gatherings: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    default: []
  },
  herdInvites:{
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Herd'
    }],
    default: []
  }
})

mongoose.model('User', userSchema)