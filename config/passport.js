const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const connection = require('./database')
const User = connection.models.User

const { isPasswordValid } = require('../lib/passwordUtils')

// verifyLogin immediately adds the req.user object to the
// the request object after successful login for the current request.
// it will then call the passport.serializeUser method if login is successful.
const verifyLogin = (username, password, done) => {
  User.findOne({ username })
    .then(user => {
      if (!user) return done(null, false)

      const isValid = isPasswordValid(password, user.hash, user.salt)

      return isValid ? done(null, user) : done(null, false)
    })
    .catch(err => done(err))
}

const strategy = new LocalStrategy(verifyLogin)

passport.use(strategy)

// this method is called ONLY on login after the verifyLogin function.
// it will add an object to the req.session object that looks like:

// passport: {
//   user: 1001    // or whatever the user id is
// }

// adding that to req.session will cause the session info to get
// saved in the session store as well (with express-session).

// this function can be disabled by setting the middleware on /login to:
// passport.authenticate('local', { session: false })
passport.serializeUser(({ id }, done) => {
  done(null, id)
})

// this method is called ONLY if two conditions are met:
//   1. the passport.session() middleware is enabled.
//   2. there is a req.session.passport.user object on the request.
// it will pass the value from req.session.passport.user as the first parameter.

// on success, it will add an object to the req object that looks like:
// user: {
//   id: 1001,
//   username: joeschmoe@example.com     // or whatever shape the user object should have
// }

// once the req.user object is populated you can use the req.isAuthenticated()
// method in middleware to see if a valid user object is part of the request.
passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then(({ id, username }) =>
        done(null, { id, username })
    )
    .catch(err => done(err))
})
