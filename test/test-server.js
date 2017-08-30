const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { User, WatchList } = require('../models');
const streamSearchUsers = require('../stream-search-users.js');
const streamSearchWatchlists = require('../stream-search-watchlists.js');

const should = chai.should();

let Cookies = null;

chai.use(chaiHttp);

describe('Testing html and registration', function () {
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });
  after(function () {
    return closeServer();
  });
  it('should return a 200 status code and index.html', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        res.should.have.status(200);
        res.should.be.html;
      });
  });
  it('should return a 200 status code and dashboard.html', function () {
    return chai.request(app)
      .get('/dashboard.html')
      .then(function (res) {
        res.should.have.status(200);
        res.should.be.html;
      });
  });
  it('should return a 201 status code and new registered user', function () {
    const newUser = {
      firstName: 'Terry',
      lastName: 'Cox',
      username: 'tcox',
      email: 'tcox@email.com',
      password: 'thinkful',
      password2: 'thinkful'
    };
    return chai.request(app)
      .post('/users/')
      .send(newUser)
      .then(function (res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.include.all.keys('username', 'email', 'lastName', 'firstName', 'watchlist');
        return User.findOne({ username: newUser.username });
      })
      .then(function (user) {
        user.username.should.equal(newUser.username);
        user.email.should.equal(newUser.email);
        user.firstName.should.equal(newUser.firstName);
        user.lastName.should.equal(newUser.lastName);
      });
  });
});

const userList = [
  { username: 'acox', password: 'thinkful', firstName: 'Andrew', lastName: 'Cox', email: 'acox@email.com', watchlist: [] },
  { username: 'ccox', password: 'thinkful', firstName: 'Charles', lastName: 'Cox', email: 'ccox@email.com', watchlist: [] }
];

const titleList = [
  { id: 123345, title: 'Trolls', type: 'movie', poster: '/poster/1356624/{profile}', path: '/us/movie/trolls', watched: true },
  { id: 181359, title: 'Frozen', type: 'movie', poster: '/poster/401363/{profile}', path: '/us/movie/frozen-2013', watched: false },
  { id: 135902, title: 'Inside Out', type: 'movie', poster: '/poster/672669/{profile}', path: '/us/movie/inside-out-2015', watched: true },
  { id: 43784, title: 'Saving Silverman', type: 'movie', poster: '/poster/89978/{profile}', path: '/us/movie/saving-silverman', watched: false }
];

function createDb(done) {
  User.hashPassword("thinkful")
    .then(function (hash) {
      let user = userList[1];
      user.password = hash;
      User.create(user)
        .then(function (obj) {
          console.log('first user done');
          console.log("starting second user");
          user = userList[0];
          user.password = hash;
          User.create(user)
            .then(function (user) {
              console.log('second user done');
              console.log("titles start");
              Promise.all(titleList.map(function (title) {
                return new Promise(function (resolve, reject) {
                  WatchList.create(title)
                    .then(listItem => {
                      console.log("title done");
                      user.watchlist.push(listItem);
                      console.log('title added to user watchlist')
                      return user.save(resolve);
                    });
                })
              }))
                .then(function () {
                  done();
                });
            })
        })
    });
}

function seedDb(done) {
  createDb(done);
}

function teardDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting Database');
    mongoose.connection.dropDatabase()
      .then(resolve())
      .catch(err => reject(err));
  });
}

describe('testing API', function () {
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function (done) {
    teardDownDb()
      .then(function () {
        seedDb(function () {
          console.log("login start");
          chai.request(app)
            .post('/login')
            .set('contentType', 'application/json')
            .send({ username: 'acox', password: 'thinkful' })
            .end(function (err, res) {
              Cookies = res.headers['set-cookie'].pop().split(';')[0];
              console.log("Cookies");
              done();
            });
        });
      })
  });
  after(function () {
    return closeServer();
  });
  it('should add a title to a user watchlist', function () {
    const newTitle = {
      id: 139586,
      title: "Weekend at Bernie's",
      type: "movie",
      poster: "/poster/296760/{profile}",
      path: "/us/movie/weekend-at-bernies",
      watched: false
    };
    let req = chai.request(app)
      .post('/users/me/watchlist');
    req.cookies = Cookies;
    return req.send(newTitle)
      .then(function (res) {
        res.should.have.status(201);
        return WatchList.findOne({ id: newTitle.id });
      })
      .then(function (movie) {
        movie.id.should.equal(newTitle.id);
        movie.title.should.equal(newTitle.title);
        movie.type.should.equal(newTitle.type);
        movie.poster.should.equal(newTitle.poster);
        movie.path.should.equal(newTitle.path);
        movie.watched.should.equal(newTitle.watched);
      });
  });
  it('should mark a title as watched or unwatched', function () {
    WatchList.findOne({ id: 181359 })
      .then(function (nowWatched) {
        nowWatched.watched = true;
        let req = chai.request(app)
          .put(`/users/me/item/${nowWatched._id}`);
        req.cookies = Cookies;
        return req.send(nowWatched)
          .then(function (res) {
            res.should.have.status(204);
            return WatchList.findById(nowWatched.titleId);
          })
          .then(function (movie) {
            movie.watched.should.equal(nowWatched.watched);
          });
      });
  });
  it('should remove a title from the user watchlist', function () {
    console.log("Starting delete");
    WatchList.findOne({ id: 123345 })
      .then(function (titleToRemove) {
        console.log("about to delete");
        let req = chai.request(app)
          .delete(`/users/me/item/${titleToRemove._id}`);
        req.cookies = Cookies;
        return req.send(titleToRemove._id)
          .then(function (res) {
            res.should.have.status(204);
            return WatchList.findById(titleToRemove._id).exec();
          })
          .then(function (deletedTitle) {
            should.not.exist(deletedTitle);
          });
      })
  });
  it('should return a list of users matching the query search term', function () {
    let searchTerm = 'cox';
    return chai.request(app)
      .get(`/users/?q=${searchTerm}`)
      .then(function (res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.length.should.be.above(0);
      });
  });
});