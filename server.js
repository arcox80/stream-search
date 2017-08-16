const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const request = require('request');
const cors = require('cors');
var http = require('http')

const { router: usersRouter } = require('./router');

const { User } = require('./models');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// logging
app.use(morgan('common'));

app.use(express.static('public'));
app.use(express.static('views'));

passport.use(new LocalStrategy(
  function (username, password, done) {
    console.log(username);
    console.log('starting strategy');
    User.findOne({ username: username }, function (err, user) {
      console.log(`finding ${user}`);
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      user.validatePassword(password)
        .then(valid => {
          if (!valid) {
            return done(null, false, 'Incorrect password');
          }
          console.log('verified');
          return done(null, user);
        })
    });
  }
));

app.use(cookieParser());
app.use(session({ secret: 'thinkful' }));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function (user, done) {
  console.log("serialize");
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log("deserialize");
  User.findById(id, function (err, user) {
    console.log(err);
    done(err, user);
  });
});

app.use('/users/', usersRouter);

app.post('/login',
  passport.authenticate('local'),
  function (req, res) {
    console.log(req.user.apiRepr());
    res.status(200).json(req.user.apiRepr());
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/index.html');
})

/*
app.use('/', function (req, res) {  
  var url = apiServerHost + req.url;
  req.pipe(request(url)).pipe(res);
});
*/

app.post('/search', function (req, res) {  
  console.log(req.body);
  let url = 'https://api.justwatch.com/titles/en_US/popular';;
  request.post({url: url, headers: {'content-type': 'application/json'}, body: JSON.stringify(req.body)}).pipe(res);
  // var body = JSON.stringify({
  //     query: "gladiator"
  // })

  // var request = new http.ClientRequest({
  //     hostname: "api.justwatch.com",
  //     port: 443,
  //     path: "/titles/en_US/popular",
  //     method: "POST",
  //     headers: {
  //         "Content-Type": "application/json",
  //         "Content-Length": Buffer.byteLength(body)
  //     }
  // })

  // request.end(body)
});

// app.get('/search', cors(), function (req, res, next) {
//   let searchTerm = req.query;
//   let options = {
//     url: 'https://api.justwatch.com/titles/en_US/popular',
//     qs: {
//       query: searchTerm
//     }
//   };
//   request.post(options, function (err, res, body) {
//     console.log(body);
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.status(200).send(body);
//   });
// });

app.use('*', function (req, res) {
  return res.status(404).json({ message: 'Not Found' });
});




// referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(dburl = DATABASE_URL) {
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

module.exports = { app, runServer, closeServer };

