const router = require('express').Router()
const passport = require('passport')
const { genPassword } = require('../lib/passwordUtils')
const connection = require('../config/database')
const User = connection.models.User

/**
 * -------------- MIDDLEWARE ----------------
 */
const loggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return res.writeHead(302, { Location: '/' }).end()

  next()
}

/**
 * -------------- POST ROUTES ----------------
 */

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.send('great success!')
});

router.post('/register', (req, res, next) => {
  const { salt, hash } = genPassword(req.body.password)

  const newUser = new User({
    username: req.body.username,
    hash,
    salt
  })

  newUser.save()
    .then(({ username }) =>
      console.log(`user registration successful to ${username}`)
    )

  res.redirect('/login')
});


 /**
 * -------------- GET ROUTES ----------------
 */

router.get('/', (req, res, next) => {
  res.send(`<h1>Home</h1><h3>Welcome ${req.user.username}</h3><p>Please <a href="/register">register</a></p>`);
});

router.get('/add-session-info', (req, res, next) => {
  req.session.something = "hello"
  res.writeHead(302, { Location: '/' }).end()
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', loggedIn, (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {

    const form = '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="username">\
                    <br>Enter Password:<br><input type="password" name="password">\
                    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);
    
});

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set
 */
router.get('/protected-route', (req, res, next) => {
    // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
    if (req.isAuthenticated()) {
        res.send('<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>');
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>');
    }
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
  // a method added by passport that will remove the user object from
  // the req.session.passport object on the request.
  // this method won't delete the cookie from the user's browser or
  // destroy the session altogether from the session-store by itself.
  req.logout();

  req.session.destroy(err => {
    if (err) console.log(`Session destroy failed with - ${err}`)

    console.log(`Session destroyed successfully - user logged out.`)
  })

  res.clearCookie(process.env.COOKIE_NAME)

  res.redirect('/login');
});

module.exports = router;
