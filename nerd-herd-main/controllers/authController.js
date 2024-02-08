const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const mongoose = require('mongoose')
const User = mongoose.model('User')
//const  session = require('express-session')

authUser = async (user, password, done) => {
  console.log(`Value of "User" in authUser function ----> ${user}`)         //passport will populate, user = req.body.username
  console.log(`Value of "Password" in authUser function ----> ${password}`) //passport will popuplate, password = req.body.password

  // Use the "user" and "password" to search the DB and match user/password to authenticate the user
  // 1. If the user not found, done (null, false)
  // 2. If the password does not match, done (null, false)
  // 3. If user found and password match, done (null, user)
  try {
    const user_document = await User.findOne({ email: user })

    if (user_document) {
      // Compare the entered password
      const isPasswordValid = (password === user_document.password)
      console.log("Password:" + isPasswordValid)

      if (isPasswordValid) {
        let authenticated_user = { id: user_document._id, name: user_document.email }
        return done(null, authenticated_user)
      }
    }
  } catch (exception) { return done(null, false) }

  return done(null, false)
}
passport.use(new LocalStrategy(authUser))

passport.serializeUser((user, done) => {
  console.log(`--------> Serialize User`)
  console.log(user)

  done(null, user.id)

  // Passport will pass the authenticated_user to serializeUser as "user" 
  // This is the USER object from the done() in auth function
  // Now attach using done (null, user.id) tie this user to the req.session.passport.user = {id: user.id}, 
  // so that it is tied to the session object

})

passport.deserializeUser(async (id, done)  => {
  console.log("---------> Deserialize Id")
  console.log(id)

  try {
    const userObject = await User.findById(id);

    if (!userObject) {
      return done(null, false)
    }

    await userObject.populate(['herds', 'gatherings', 'herdInvites'])

    done(null, userObject);
  } catch (e) {
    console.error(e);
    done(e, null);
  }
})

checkAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) { return next() }
  res.redirect("/login")
}

module.exports = {
  passport,
  checkAuthenticated
}