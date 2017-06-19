const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');

const {router: usersRouter} = require('./router');

const {User} = require('./models');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// logging
app.use(morgan('common'));

app.use(express.static('public'));
app.use(express.static('views'));

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("hello");
    User.findOne({ username: username }, function (err, user) {
      console.log(user);
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.validatePassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

app.use(cookieParser());
app.use(session({ secret: 'thinkful' }));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
  console.log("serialize");
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserialize");
  User.findById(id, function(err, user) {
    done(err, user);
});
});

app.use('/users/', usersRouter);

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/index.html' }),
  function(req, res) {
    console.log("working?");
    res.status(200).json(req.user);
  }
);

app.get('/logout', (req, res) => { 
  req.logout();
  res.redirect('/index.html');
})

app.use('*', function(req, res) {
  return res.status(404).json({message: 'Not Found'});
});

// referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

