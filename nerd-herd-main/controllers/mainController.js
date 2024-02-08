const mongoose = require('mongoose')
const Event = mongoose.model('Event')
const Herd = mongoose.model('Herd')
const User = mongoose.model('User')
const authCtrl = require('./authController')
const passport = authCtrl.passport
const emailer = require('./emailController')

const getConfigOptions = async (req) => {
  const user = req.user
  return {
    loggedIn: req.isAuthenticated(),
    userId: req.isAuthenticated() ? req.user._id : null,
    clientUser: user
  }
}

// called on / GET

const rootEventList = async (req, res) => {
  const configOptions = await getConfigOptions(req)
  try {
    let events = await Event.find({}).populate(['userCreated', 'eventHerd', 'eventHerd._id'])
    let user = await User.findById(configOptions.userId).populate(['herds', 'gatherings', 'herdInvites'])
    await User.populate(user, { path: 'herds.owner'})

    console.log(user)

    let eventList = events.map((result) => {
      return {
        eventId: result._id,
        eventTitle: result.eventTitle,
        eventDescription: result.eventDescription,
        eventDate: result.eventDate,
        eventLocation: result.eventLocation,
        eventAddress: result.eventAddress,
        userCreated: result.userCreated.username,
        eventHerd: result.eventHerd
      }
    })
    //Filters out events from private herds that the user is not a part of
    eventList = eventList.filter((event) => {
      let isPublic = event.eventHerd.public
      if (!isPublic && !event.eventHerd.members.includes(configOptions.userId)) {
        return false
      }
      return true
    })
    eventList = eventList.sort((a, b) => {
      return new Date(a.eventDate) - new Date(b.eventDate)
    })

    let userEvents = user.gatherings.map((userEvent) => {
      return {
        uEventId: userEvent._id,
        uEventTitle: userEvent.eventTitle,
        uEventTime: userEvent.eventDate,
        uEventLocation: userEvent.eventLocation,
        uEventAddress: userEvent.eventAddress
      }
    })

    let herds = user.herds.map((herd) => {
      return {
        herdId: herd._id,
        herdName: herd.herdName,
        herdPublic: herd.public,
        herdOwner: herd.owner.username
      }
    })

    return res.render('layout', {
      title: 'Nerd-Herd',
      content: 'index',
      eventList: eventList,
      user: user,
      userEvents: userEvents,
      herds: herds,
      ...configOptions
    })
  } catch (err) {
    console.log(err)
    res.status(400).json({ Message: err })
  }
}

// called on /about GET
const aboutRead = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  return res.render('layout', {
    title: 'About',
    content: 'about',
    ...configOptions
  })
}

// called on /events GET
const eventsRead = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  return res.render('layout', {
    title: 'Gatherings',
    content: 'eventList',
    ...configOptions
  })
}

// called on /event/:eventID GET
const oneEventRead = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  const eventId = req.params.eventID
  const thisEvent = await Event.findById(eventId).populate('userCreated').populate('eventNerdResponses').populate('eventPotentialHosts')
    .populate('eventNerdResponses.user').populate('eventNerdResponses.status').populate('eventHerd').populate('eventPolls').populate('eventRolls')
    .populate('eventPolls.title').populate('eventRolls.roll.user')

  return res.render('layout', {
    title: "A Gathering",
    content: 'event',
    event: thisEvent,
    ...configOptions
  })
}

// Called on /event/:eventID PUT
const editEvent = async (req, res) => {
  const newEventName = req.body.newEventName
  const newEventDescription = req.body.newEventDescription
  const eventId = req.params.eventID

  const update = {
    eventTitle: newEventName,
    eventDescription: newEventDescription
  }

  try {
    let updatedEvent = await Event.findByIdAndUpdate(eventId, update)
    console.log('Update Success: ' + updatedEvent)
    res.redirect(`/event/${eventId}`)
  } catch (err) {
    console.log(err)
  }
}

// called on /login GET
const loginRoute = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  return res.render('layout', {
    title: 'Login',
    content: 'login',
    ...configOptions
  })
}

const loginAction = (passport.authenticate('local', {
  successRedirect: "/",
  failureRedirect: "/login"
}))

const logoutAction = async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log('Error during logout: ', err)
      return res.redirect('/')
    }

    req.session.destroy((err) => {
      if (err) {
        console.log('Error destroying session: ', err)
      }

      res.redirect('/login')
    })
  })
}

//called on /recovery GET
const recoveryRoute = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  res.render('layout', {
    title: 'Account Recovery',
    content: 'recovery',
    ...configOptions
  })
}

const recoveryAction = async (req, res) => {
  const configOptions = await getConfigOptions(req)
  let inputEmail = req.body.uid
  console.log('Email recovery from: ' + inputEmail)
  let userInfo = await User.findOne({
    'email': inputEmail
  })
  if(userInfo){
    emailer.sendEMail(inputEmail, 'Nerd-Herd account recovery', 'Your password is ' + userInfo.password )
  }
  res.render('layout', {
    title: 'Email Sent',
    content: 'email_sent',
    ...configOptions
  })
}

// called on /register GET
const registerRoute = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  return res.render('layout', {
    title: 'Register',
    content: 'register',
    ...configOptions
  })
}

//Called on /create_herd GET
const createHerdRoute = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  return res.render('layout', {
    title: 'Create Herd',
    content: 'create_herd',
    ...configOptions
  })
}

//Called on /create_herd POST
const createHerd = async (req, res) => {
  const userId = req.user._id
  const user = await User.findById(userId)
  const herdName = req.body.herdName
  const herdDescription = req.body.herdDescription
  const isPublic = (req.body.herdVisibility === 'public')
  const herdInviteListString = req.body.email_invite_list
  const herdInviteList = herdInviteListString.split(',')
  console.log(`\n${userId} is attempting to create Herd: ${herdName}`)
  console.log(`Description: ${herdDescription}, public?: ${isPublic}`)
  console.log(`Invitees: ${herdInviteList}\n`)

  let invitedMemberList = []

  for (const email of herdInviteList) {
    const invitedUser = await User.findOne({ email: email })
    if (invitedUser) {
      invitedMemberList.push(invitedUser._id)
    }
  }

  try {
    const newHerd = await Herd.create({
      herdName: herdName,
      herdDescription: herdDescription,
      public: isPublic,
      owner: user,
      members: [user],
      invitedMembers: invitedMemberList
    })
    await User.updateOne(
      { _id: userId },
      { $push: { herds: newHerd } }
    )

    for (const user of newHerd.invitedMembers) {
      await User.findByIdAndUpdate(user._id, {$push:{herdInvites: newHerd}})
    }

    res.status(201).redirect('/')
    console.log('Created new herd!')
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err })
  }
}

// Called on /herd/:herdID GET
const oneHerdRead = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  const { herdID } = req.params
  const thisHerd = await Herd.findById(herdID).populate('owner').populate('members').populate('invitedMembers').populate('gatherings')

  return res.render('layout', {
    title: thisHerd.herdName,
    content: 'herd',
    herd: thisHerd,
    ...configOptions
  }) 
}

// Called on /herd/:herdID PUT
const editHerd = async (req, res) => {
  const newHerdName = req.body.newHerdName
  const newHerdDescription = req.body.newHerdDescription
  const herdID = req.params.herdID

  const update = {
    herdName: newHerdName,
    herdDescription: newHerdDescription
  }

  try {
    let updatedHerd = await Herd.findByIdAndUpdate(herdID, update)
    console.log('Update Success: ' + updatedHerd)
    res.redirect(`/herd/${herdID}`)
  } catch (err) {
    console.log(err)
  }
}

// Called on /herd/:herdID PUT
const addEmailInvite = async (req, res) => {
  const herdID = req.params.herdID
  const newNerdEmail = req.body.nerdEmail

  const user = await User.findOne({email: newNerdEmail})

  if(user){
    const update_herd = {
      $push: { invitedMembers:  user._id}
    }

    const update_user = {
      $push: {herdInvites: herdID}
    }

    try {
      let updatedHerd = await Herd.findByIdAndUpdate(herdID, update_herd)
      console.log('Update Success: ' + updatedHerd)

      await User.findByIdAndUpdate(user._id, update_user)

      return res.redirect(`/herd/${herdID}`)
    } catch (err) {
      console.log(err)
    }
  }

  res.redirect(`/herd/${herdID}`)
}

// Called on /herd/:herdID DELETE
const herdDelete = async (req, res) => {
  const { herdID } = req.params
  await Herd.findByIdAndDelete(herdID)

  res.redirect('/')
}

//Called on /create_gathering GET 
const createGatheringRoute = async (req, res) => {
  const configOptions = await getConfigOptions(req)
  const herdNames = await Herd.find({ members: configOptions.userId }, 'herdName')

  return res.render('layout', {
    title: 'Create Gathering',
    content: 'create_gathering',
    userHerds: herdNames,
    ...configOptions
  })
}

// called on /create_gathering POST
const createGathering = async (req, res) => {
  const userId = req.user._id
  const herdId = req.body.herdName
  const gatheringName = req.body.eventName
  const gatheringDescription = req.body.eventDescription
  const gatheringLocation = req.body.locationName
  const gatheringAddress = req.body.addressValue
  const gatheringDate = req.body.datePicker
  const gatheringTime = req.body.timePicker
  const dateTimeObj = new Date(gatheringDate + ' ' + gatheringTime)
  console.log(gatheringDate)
  console.log(gatheringTime)
  console.log(dateTimeObj)

  const found_herd = await Herd.findById(herdId)
  let eventNerdResponses = []
  found_herd.members.forEach(member => {
    eventNerdResponses.push({
      user: member,
      status: "Pending"
    })
  })

  

  try {
    const newGathering = await Event.create({
      eventTitle: gatheringName,
      eventDescription: gatheringDescription,
      eventLocation: gatheringLocation,
      eventAddress: gatheringAddress,
      userCreated: userId,
      eventDate: dateTimeObj,
      eventHerd: herdId,
      eventNerdResponses: eventNerdResponses,
    })
    await User.updateOne(
      { _id: userId },
      { $push: { gatherings: newGathering } }
    )

    await Herd.updateOne(
      { _id: herdId },
      { $push: { gatherings: newGathering } }
    )
    

    res.status(201).redirect('/')
    console.log('Created new gathering!')
  } catch (err) {
    console.log(err)
    res.json({err})
  }
}

// called on /register POST
const createUser = async (req, res) => {
  const userEmail = req.body.uid
  const userPassword = req.body.password
  const userName = req.body.username
  const userFirst = req.body.firstname
  const userLast = req.body.lastname
  const userPhone = req.body.phonenumber
  const userProvider = req.body.phoneprovider
  const userBirthday = req.body.birthday
  console.log(`Creating user: ${userFirst} ${userLast}`)
  console.log(userEmail + userPassword + userFirst + userLast + userPhone + userProvider + userBirthday)
  try {
    await User.create({
      firstName: userFirst,
      lastName: userLast,
      email: userEmail,
      username: userName,
      password: userPassword,
      phoneNum: userPhone,
      phoneProvider: userProvider,
      birthday: userBirthday

    })
    res.status(201).redirect('/')
    console.log('Created new user!')

  } catch (err) {
    res.send(400, err)
  }
}

// Called on /profile/:userID GET
const viewUserProfile = async (req, res) => {
  const configOptions = await getConfigOptions(req)

  const user = await User.findOne({_id: req.params.userID}).populate(['herds', 'gatherings','herdInvites'])

  const userHerds = user.herds.map((herd) => {
    return {
      herdId: herd._id,
      herdName: herd.herdName
    }
  })
  const userGatherings = user.gatherings.map((gathering) => {
    return {
      gatheringId: gathering._id,
      gatheringTitle: gathering.eventTitle
    }
  })
  return res.render('layout', {
    title: `${user.username}'s Profile`,
    content: 'profileSettings',
    user: user,
    uHerds: userHerds,
    uGatherings: userGatherings,
    ...configOptions
  })
}

const editUser = async (req, res) => {
  const newUsername = req.body.newUsername
  const newFirstName = req.body.newFirstname
  const newLastName = req.body.newLastname
  const newEmail = req.body.newEmail
  const newNum = req.body.newNum
  const newProvider = req.body.newProvider
  const newBirthday = req.body.newBirthday
  const { userID } = req.params

  const update = {
    firstName: newFirstName,
    lastName: newLastName,
    username: newUsername,
    email: newEmail,
    Number: newNum,
    phoneprovider: newProvider,
    birthday: newBirthday
  }

  try {
    let updatedUser = await User.findByIdAndUpdate(userID, update)
    console.log('Update Success: ' + updatedUser)
    res.redirect(`/profile/${userID}`)
  } catch (err) {
    console.log(err)
  }
}

// Called on /profile/:userID DELETE
const userDelete = async (req, res) => {
  const { userID } = req.params
  console.log(`Attempting to delete eventID=${userID}...`)
  try {
    await Event.deleteMany({ userCreated: userID })
    await Herd.deleteMany({ owner: userID })
    await User.findByIdAndDelete(userID)
    console.log(`Account deleted!`)
    await logoutAction(req, res)
    res.redirect('/login')
  } catch (err) {
    console.log(err)
  }
}

// Called on /event/:eventID DELETE
const eventDelete = async (req, res) => {
  const { eventID } = req.params
  console.log(`Attempting to delete eventID=${eventID}...`)
  try {
    await Event.findByIdAndDelete(eventID)
    console.log(`${eventID} deleted!`)
    res.redirect('/')
  } catch (err) {
    res.status(500).send('Internal Error')
  }
}

/* Seeding Database */
const seedAll = async (req, res) => {
  console.log('\n\nAttempting to seed database...')
  if(process.env.ALLOW_DB_SEED !== 'True'){
    res.status(400).send('Failed: DB Seeding Disabled')
    return
  }
  try {
    await seedUsers()
    await seedHerds()
    await seedGatherings()
  } catch (err) {
    console.log(err)
  }
  console.log('Finished seeding the database\n\n')
  res.status(201).send('DB Seeded Successfully')
}
const seedUsers = async (req, res) => {
  try {
    for (let i = 0; i < 10; ++i) {
      const newUser = await User.create({
        firstName: `TestUser${i}`,
        lastName: `TestLast${i}`,
        email: `test${i}@test.com`,
        username: `cooldude${i}`,
        password: '12345',
        phoneNum: '1234567890',
        phoneProvider: 'MintMobile'
      })
      console.log('New user! ' + newUser._id)
    }
  } catch (err) {
    console.log(err)
  }
}
const seedHerds = async (req, res) => {
  try {
    let userList = await User.find({})
    let testOwner = await User.findOne({})
    for (let i = 0; i < 10; ++i) {
      const newHerd = await Herd.create({
        herdName: `Seed Herd ${i}`,
        herdDescription: 'Seed Herd description',
        public: true,
        owner: testOwner,
        members: [...userList]
      })
      userList.forEach(async (member) => {
        await User.updateOne(
          { _id: member._id },
          { $push: { herds: newHerd } }
        )
      })
      console.log('New herd! ' + newHerd._id)
    }
  } catch (err) {
    console.log(err)
  }
}
const seedGatherings = async (req, res) => {
  try {
    let userCreated = await User.findOne({})
    let firstDate = new Date('2024-01-01T12:00:00Z')
    let userList = await User.find({})
    for (let i = 0; i < 10; ++i) {
      const newGathering = await Event.create({
        eventTitle: `Gathering ${i}`,
        eventDate: new Date(firstDate.getTime() + i * 24 * 60 * 60 * 1000),
        eventDescription: `This is a test gathering: ${i}`,
        eventLocation: `LocationName ${i}`,
        userCreated: userCreated
      })
      userList.forEach(async (user) => {
        await User.updateOne(
          { _id: user._id },
          { $push: { gatherings: newGathering } }
        )
      })
      console.log('New gathering! ' + newGathering._id)
    }
  } catch (err) {
    console.log(err)
  }
}


const acceptHerdInvite = async (req, res) => {
  try{
    const userId = req.body.userId
    const herdId = req.body.herdId

    const herdUpdate = {
      $push: {members: userId},
      $pull: {invitedMembers: userId}
    }

    const userUpdate = {
      $push: {herds: herdId},
      $pull: {herdInvites: herdId}
    }

    const user = await User.findByIdAndUpdate(userId, userUpdate)
    await Herd.findByIdAndUpdate(herdId, herdUpdate)
    res.redirect(`/profile/${userId}`)
  }catch (err) {
    console.log(err)
    res.status(500).send('Internal Error')
  }
}

const declineHerdInvite = async(req,res)=>{
  try{
    const userId = req.body.userId
    const herdId = req.body.herdId

    const herdUpdate = {
      $pull: {invitedMembers: userId}
    }

    const userUpdate = {
      $pull: {herdInvites: herdId}
    }

    await User.findByIdAndUpdate(userId, userUpdate)
    await Herd.findByIdAndUpdate(herdId, herdUpdate)
    res.redirect(`/profile/${userId}`)
  }catch (err) {
    console.log(err)
    res.status(500).send('Internal Error')
  }
}

const gatheringInviteResponse = async(req,res)=>{
  try{
    const eventId = req.body.event_Id
    const userId = req.body.user_Id
    const response = req.body.response

    console.log("Gathering Invite Response: " + eventId + " "  + userId + " " + response)

    await Event.findOneAndUpdate(
      { _id: eventId, 'eventNerdResponses.user': userId },
      { $set: { 'eventNerdResponses.$.status': response } }
    )

    res.redirect(`/event/${eventId}`)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Error')
  }
}

const eventCreateRoll = async (req, res) => {
  try {
    const eventId = req.body.rollEventId
    const userId = req.body.rollUserId
    const rollText = req.body.rollText

    const rollData = {
      title: rollText,
      roll: []
    }

    const event = await Event.findById(eventId)

    if (!event) {
      console.error('Event not found')
      return
    }
    event.eventRolls.push(rollData)

    await event.save()

    res.redirect(`/event/${eventId}`)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Error')
  }
}

const eventCreatePoll = async (req, res) => {
  try {
    const eventId = req.body.pollEventId
    const pollTitle = req.body.pollTitle
    const pollOptionsConcat = req.body.optionsConcatenated
    const pollOptions = pollOptionsConcat.split(';')

    let selections = []

    pollOptions.forEach((option) => {
      selections.push({
        phrase: option,
        votes: []
      })
    })

    const pollData = {
      title: pollTitle,
      selections: selections,
    }

    const event = await Event.findById(eventId)

    if (!event) {
      console.error('Event not found')
      return
    }
    event.eventPolls.push(pollData)

    await event.save()

    res.redirect(`/event/${eventId}`)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Error')
  }
}

const eventPollResponse = async (req, res) => {
  try {
    const eventId = req.body.pollEventId
    const pollId = req.body.pollId
    const userId = req.body.pollUserId
    const phrase = req.body.selection

    const event = await Event.findById(eventId)

    if (!event) {
      console.error('Event not found')
      return res.status(404).send('Event Not found')
    }
    const eventPoll = await event.eventPolls.id(pollId)

    if (!eventPoll) {
      console.error('Event Poll not found')
      return res.status(404).send('Event Poll not found')
    }


    let flag = false
    await eventPoll.selections.forEach((selection) => {

      if (selection.votes.includes(userId)) {
        console.error('User already voted for this option')
        flag = true
      }
    })

    if (flag) { return res.redirect(`/event/${eventId}`) }

    const selectedOption = await eventPoll.selections.find(
      (option) => option.phrase === phrase
    )

    selectedOption.votes.push(userId)

    await event.save()

    res.redirect(`/event/${eventId}`)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Error')
  }
}


const eventRollResponse = async (req, res) => {
  try {
    const eventId = req.body.eventId
    const rollId = req.body.eventRollId
    const userId = req.body.userId
    const rollValue = req.body.rollValue

    const rollData = {
      user: userId,
      value: rollValue
    }

    const event = await Event.findById(eventId)

    if (!event) {
      console.error('Event not found')
      return res.status(404).send('Event Roll not found')
    }

    const eventRoll = await event.eventRolls.id(rollId)

    if (!eventRoll) {
      console.error('Event Roll not found')
      return res.status(404).send('Event Roll not found')
    }

    let alreadyRolledFlag = false
    await eventRoll.roll.forEach((roll_data) => {
      if (roll_data.user._id == userId) {
        alreadyRolledFlag = true
      }
    })

    if (alreadyRolledFlag)
      return res.redirect(`/event/${eventId}`)

    eventRoll.roll.push(rollData)

    await event.save()

    res.redirect(`/event/${eventId}`)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal Error')
  }
}

const clearDatabase = async (req, res) => {
  await logoutAction(req, res)
  if(process.env.ALLOW_DB_CLEAR !== 'True'){
    console.log('DB Clearing Disabled')
    return
  }
  console.log('\n\nAttempting to clear database...')
  await User.deleteMany({})
  await Herd.deleteMany({})
  await Event.deleteMany({})
  console.log('Database cleared!\n\n')
}
const clearDatabaseForTestOnly = async (req,res) => {
  await User.deleteMany({})
  await Herd.deleteMany({})
  await Event.deleteMany({})
}

module.exports = {
  rootEventList,
  aboutRead,
  eventsRead,
  oneEventRead,
  eventDelete,
  loginRoute,
  logoutAction,
  registerRoute,
  loginAction,
  recoveryRoute,
  recoveryAction,
  createHerdRoute,
  createHerd,
  editHerd,
  addEmailInvite,
  editEvent,
  createGatheringRoute,
  createGathering,
  createUser,
  seedAll,
  clearDatabase,
  clearDatabaseForTestOnly,
  viewUserProfile,
  userDelete,
  oneHerdRead,
  herdDelete,
  editUser,
  acceptHerdInvite,
  declineHerdInvite,
  gatheringInviteResponse,
  eventCreateRoll,
  eventPollResponse,
  eventCreatePoll,
  eventRollResponse,
}