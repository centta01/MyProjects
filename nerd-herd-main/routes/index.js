const express = require('express')
const router = express.Router()

const mainCtrl = require('../controllers/mainController')
const authCtrl = require('../controllers/authController')

/* landing page. */
router
  .route('/')
  .get(authCtrl.checkAuthenticated,mainCtrl.rootEventList)

/* about page */
router
  .route('/about')
  .get(mainCtrl.aboutRead)

/* list of events */
router
  .route('/events')
  .get(mainCtrl.eventsRead)

/* specific event */
router
  .route('/event/:eventID')
  .get(mainCtrl.oneEventRead)
  .put(mainCtrl.editEvent)
  .delete(mainCtrl.eventDelete)

router
  .route('/eventCreateRoll')
  .post(mainCtrl.eventCreateRoll)

router
  .route('/eventRollResponse')
  .post(mainCtrl.eventRollResponse)

router
  .route('/eventCreatePoll')
  .post(mainCtrl.eventCreatePoll)

router
  .route('/eventPollResponse')
  .post(mainCtrl.eventPollResponse)

router
  .route('/eventResponse')
  .post(mainCtrl.gatheringInviteResponse)

router.route('/herd/inviteEmail/:herdID') 
  .put(mainCtrl.addEmailInvite)

/* specific herd */
router
  .route('/herd/:herdID')
  .get(mainCtrl.oneHerdRead)
  .put(mainCtrl.editHerd)
  .delete(mainCtrl.herdDelete)
  
/* login */
router
  .route('/login')
  .get(mainCtrl.loginRoute)
  .post(mainCtrl.loginAction)

/* logout */
router
  .route('/logout')
  .get(mainCtrl.logoutAction)

/* recovery */
router
  .route('/recovery')
  .get(mainCtrl.recoveryRoute)
  .post(mainCtrl.recoveryAction)

/* Get register */
router
  .route('/register')
  .get(mainCtrl.registerRoute)
  .post(mainCtrl.createUser)

/* Get create herd page */
router
  .route('/create_herd')
  .get(mainCtrl.createHerdRoute)
  .post(mainCtrl.createHerd)

/* Get create event page */
router
  .route('/create_gathering')
  .get(mainCtrl.createGatheringRoute) 
  .post(mainCtrl.createGathering)

/* Get user profile */
router
  .route('/profile/:userID')
  .get(mainCtrl.viewUserProfile)
  .put(mainCtrl.editUser)
  .delete(mainCtrl.userDelete)

router
  .route('/profile/acceptHerdInvite')
  .post(mainCtrl.acceptHerdInvite)

router
  .route('profile/declineHerdInvite')
  .post(mainCtrl.declineHerdInvite)

//// FOR DEVELOPMENT ONLY ////
/* For Seeding Database */
router
  .route('/seeds/all')
  .get(mainCtrl.seedAll)

/* Delete Database for easy testing */
router
  .route('/delete')
  .get(mainCtrl.clearDatabase)

module.exports = router