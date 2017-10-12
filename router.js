const { BasicStrategy } = require('passport-http');
const express = require('express');
const jsonParser = require('body-parser').json();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const { User } = require('./models');
const { WatchList } = require('./models');

const router = express.Router();

router.use(jsonParser);


router.use(passport.initialize());

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.status(401).json({message: 'Error 401: You must be authenticated to access this resource'});
}

//user search
router.get('/', (req, res) => {
  let searchTerm = req.query.q;
  return User.find(
    { 'username': { '$regex': searchTerm, '$options': 'i' } },
    function (err, users) {
      if (err) {
        console.log(err);
      }
      return res.status(200).json(users);
    }
  );
});

//new user registration
router.post('/', (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Please fill out the form in order to register' });
  }

  if (!('username' in req.body)) {
    return res.status(422).json({ message: 'You must enter a username' });
  }

  let { username, password, password2, firstName, lastName, email } = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({ message: 'Username needs to consist of letters and/or numbers' });
  }

  username = username.trim();

  if (username.length < 3) {
    return res.status(422).json({ message: 'A username must be at least 3 characters long' });
  }

  if (!(password)) {
    return res.status(422).json({ message: 'You must enter a password' });
  }

  if (typeof password !== 'string') {
    return res.status(422).json({ message: 'Your password must consist or letters and/or numbers' });
  }

  password = password.trim();

  if (password.length < 5) {
    return res.status(422).json({ message: 'Your password must be at least 5 characters long' });
  }

  if (password !== password2) {
    return res.status(422).json({ message: 'Your passwords do not match' });
  }

  // check for existing user and email
  email = email.trim();
  return User
    .find({ username })
    .count()
    .exec()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({ message: 'This username is already taken' });
      }
      return User
      .find({ email: email })
      .count()
      .exec()
      .then(count => {
        if (count > 0) {
          return res.status(422).json({message: 'This email is already taken' });
        }
        // if no existing user or email, hash password
        return User.hashPassword(password)
      });
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
      return next();
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error' })
      console.log(err);
    });
}, passport.authenticate('local'), function (req, res) {
  res.status(201).send(req.user.apiRepr());
});

//title added to watchlist
router.post('/me/watchlist', isAuthenticated, (req, res) => {
  const requiredFields = ['id', 'title', 'type', 'poster', 'path', 'watched'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  User.findById(req.user.id)
    .populate({ path: 'watchlist', select: 'id' })
    .exec((err, user) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        for (let i = 0; i < user.watchlist.length; i++) {
          if (user.watchlist[i].id == req.body.id) {
            const message = `This tile is already in your watchlist`;
            return res.status(403).send(message);
          }
        }
        const list = WatchList.create({
          id: req.body.id,
          title: req.body.title,
          type: req.body.type,
          poster: req.body.poster,
          path: req.body.path,
          watched: req.body.watched
        })
          .then(listItem => {
            user.watchlist.push(listItem);
            return user.save();
          })
          .then(res.status(201).send({}));
      }
    })
});

//retrieve user's watchlist
router.get('/:id', isAuthenticated, (req, res) => {
  const uid = (req.params.id === 'me') ? req.user.id : req.params.id;
  return User
    .findById(uid)
    .populate({ path: 'watchlist', select: 'title poster path watched id type' })
    .exec(function (err, user) {
      if (!err) {
        console.log('user watchlist retrieved');
        res.json(user)
      } else {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    })
});

//mark title as watched/unwatched in watchlist
router.put('/me/item/:id', (req, res) => {
  WatchList.findByIdAndUpdate(req.params.id,
    { $set: { watched: req.body.watched } },
    { new: true },
    function (err) {
      if (!err) {
        console.log('Title watched was set to ' + req.body.watched);
        res.status(204).send();
      } else {
        console.log(err);
        res.status(404).json({message: 'Error 404: The title could not be found'});
      }
    });
});

//remove title from watchlist
router.delete('/me/item/:id', (req, res) => {
  console.log(req.params.id);
  WatchList.findByIdAndRemove(req.params.id, function (err) {
    if (!err) {
      console.log('Title removed from watchlist');
      //Also needs to delete reference from User
      User.findOne({ '_id': req.user.id }, function (err, me) {
        me.watchlist.remove(req.params.id);
        me.save(function (err) {
          console.log(err);
          res.status(204).send();
        });
      });
    } else {
      console.log(err);
      res.status(404).json({message: 'Error 404: The title could not be found'});
    }
  });
});

module.exports = { router };
