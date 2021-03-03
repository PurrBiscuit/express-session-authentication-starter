const express = require('express');
const session = require('express-session');
var passport = require('passport');
var routes = require('./routes');
const mongooseConnection = require('./config/database');

// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo')(session);

// Need to require the entire Passport config module so app.js knows about it
require('./config/passport');

// Create the Express application
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * -------------- SESSION SETUP ----------------
 */

const store = new MongoStore({
  mongooseConnection,
  collection: 'sessions'
})

app.use(session({
  name: process.env.COOKIE_NAME,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

const loggedIn = (req, res, next) => {
  if (req.isAuthenticated() || req.url === '/login' || req.url === '/register')
    return next()

  res.writeHead(302, { Location: '/login' }).end()
}

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// can use this middleware to trigger the passport.session() middleware
// to run the passport.deserializeUser without express-sessions enabled.

// app.use((req, res, next) => {
//   req.session = {
//     passport: {
//       user: 13435436436536
//     }
//   }

//   next()
// })

app.use(passport.initialize());

// this middleware is only activated if the req.session.passport
// object is present on a request.
// it will call the passport.deserializeUser method to take the information
// in that req.session.passport object and turn it into a req.user object
// for future middleware to use to check if the user is authenticated.
// req.session gets set by session middleware on requests, like express-session,
// so it's important express-session middleware is before password.session()
app.use(passport.session());

app.use(loggedIn)

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(routes);


/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000);
