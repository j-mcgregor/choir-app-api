const express = require('express');
const bcrypt = require('bcryptJS');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

//sign-up page
router.get('/signup', (request, response) => {
  response.render('signup');
});

//signup request
router.post('/signup', async (request, response) => {
  const username = request.body.username;
  const password = request.body.password;
  const password2 = request.body.password2;
  const email = request.body.email;

  //check if valid input

  request.checkBody('username', 'Username is a required field!').notEmpty();
  request.checkBody('password', 'Password is a required field!').notEmpty();
  request.checkBody('password2', 'Password confirmation is a required field!').notEmpty();
  request.checkBody('email', 'Make sure that your email is valid!').isEmail();
  request.checkBody('password2', 'Passwords do not match!').equals(password);

  let errors = request.validationErrors();

  if (errors) {
    //validation errors?
    response.status(409).json({
      errors: errors
    });
  }

  let newUser;
  if (!errors) {
    //if there were no validation errors (mainly syntax). Prevents duplicate responses.
    await User.find({ username: username })
      .then(result => {
        if (result.length > 0) {
          response.status(409).json(
            {
              errors: [{ msg: 'Username taken' }]
            } //array to not break functionality
          );
          errors = 'Username taken';
        }
      })
      .catch(err => {
        response.json({ errors: err });
        errors = err;
      });

    if (!errors) {
      await User.find({ email: email })
        .then(result => {
          if (result.length > 0) {
            response.status(409).json({
              errors: [{ msg: 'Username taken' }]
            });
            errors = 'Email address taken';
          }
        })
        .catch(err => {
          response.status(404).json({ errors: err });
          errors = err;
        });
    }

    if (!errors) {
      newUser = new User({
        username: username,
        email: email,
        password: password
      });

      await bcrypt.genSalt(8, (err, salt) => {
        bcrypt.hash(newUser.password, salt).then(result => {
          newUser.password = result;

          newUser.save(err => {
            if (err) {
              response.json({ error: err });
            } else {
              response.json({ msg: 'Success - user created!' });
            }
          });
        });
      });
    }
  }
});

//log-in page
router.get('/login', (request, response) => {
  response.render('login', { user: false });
});

//log-in form
// router.post('/login', (request, response, next)=>{
//     passport.authenticate('jwt',{

//         successRedirect:'/',
//         failureRedirect:'/users/login',

//     })(request, response, next)

// });

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({
        message: info ? info.message : 'Login failed',
        user: user
      });
    }

    await req.login(user, { session: false }, err => {
      if (err) {
        res.status(401).send(err);
      } else {
        const token = jwt.sign(user.toJSON(), 'hash_coming_soon', {
          expiresIn: 3600
        });

        return res.status(200).json({ user, token });
      }
    });
  })(req, res, next);
});

//logout

router.get('/logout', (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy(err => {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
