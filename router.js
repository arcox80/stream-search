const {BasicStrategy} = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const {User} = require('./models');
const {WatchList} = require('./models');

const router = express.Router();

router.use(jsonParser);


router.use(passport.initialize());

router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(400).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field: username'});
  }

  let {username, password, firstName, lastName, email} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: username'});
  }

  username = username.trim();

  if (username.length < 3) {
    return res.status(422).json({message: 'Incorrect field length: username'});
  }

  if (!(password)) {
    return res.status(422).json({message: 'Missing field: password'});
  }

  if (typeof password !== 'string') {
    return res.status(422).json({message: 'Incorrect field type: password'});
  }

  password = password.trim();

  if (password.length < 5) {
    return res.status(422).json({message: 'Incorrect field length: password'});
  }

//Need valid email check
  email = email.trim();

  // check for existing user
  return User
    .find({username})
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'username already taken'});
      }
      // if no existing user, hash password
      return User.hashPassword(password)
    })
    .then(hash => {
      return User
        .create({
          username: username,
          password: hash,
          firstName: firstName,
          lastName: lastName,
          email: email
        })
    })
    .then(user => {
      return res.status(201).json(user.apiRepr());
    })
    .catch(err => {
      res.status(500).json({message: 'Internal server error'})
      console.log(err);
    });
});

router.post('/:uid/watchlist', (req, res) => {
  const requiredFields = ['id', 'title', 'type', 'poster', 'path'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const list = WatchList.create({
    id: req.body.id,
    title: req.body.title,
    type: req.body.type,
    poster: req.body.poster,
    path: req.body.path
  })
    .then(listItem => {
      User.findById(req.params.uid)
        .then(user => { 
          user.watchlist.push(listItem);
          return user.save();
        })
        .then(res.status(201).send({}));
    })
});

// never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => {
  return User
    .find()
    .exec()
    .then(users => res.json(users.map(user => user.apiRepr())))
    .catch(err => console.log(err) && res.status(500).json({message: 'Internal server error'}));
});




router.get('/me',
  passport.authenticate('local'),
  (req, res) => {
    console.log("me");
    return User
      .findById('593b59a56af2b154c255b944')
      .populate({path: 'watchlist', select: 'title poster path'})
      .exec(function (err, user) {
        if (!err) {
          res.json(user)
        } else {
          console.log(err);
          res.status(500).json({message: 'Internal server error'});
        }  
      })
  }
);


module.exports = {router};
