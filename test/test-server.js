const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { User, WatchList } = require('../models');
const streamSearchUsers = require('../stream-search-users.js');
const streamSearchWatchlists = require('../stream-search-watchlists.js');

const should = chai.should();

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
      firstNAme: 'Terry',
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
      });
  });
});

function seedDb() {
  return new Promise((resolve, reject) => {
    let docs = streamSearchUsers.map(function (val) {
      return new User(val);
    });
    User.insertMany(docs, function (err, success) {
      if (err) {
        reject(err);
        console.log(err);
        throw "Error seeding users collection";
      } else {
        console.log(success);
        let watchDocs = streamSearchWatchlists.map(function (val) {
          return new WatchList(val);
        });
        WatchList.insertMany(watchDocs, function (err, success) {
          if (err) {
            reject(err);
            console.log(err);
            throw "Error seeding watchlists collection";
          } else {
            console.log(success);
            resolve();
          }
        });
      }
    });
  });
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
    teardDownDb().then(function () {
      return seedDb().then(function () {
        done();
      });
    });
  });
  afterEach(function () {
  });
  after(function () {
    return closeServer();
  });
  it('should login a registered user', function () {
    const regUser = {
      username: 'acox',
      password: 'thinkful'
    };
    return chai.request(app)
      .post('/login')
      .send(regUser)
      .then(function (res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.include.all.keys('username', 'email', 'watchlist', 'lastName', 'firstName');
      });
  });
  it('should add a title to a user watchlist', function () {
    const regUser = {
      username: 'acox',
      password: 'thinkful'
    };
    const newTitle = {
      id: 139586,
      title: "Weekend at Bernie's",
      type: "movie",
      poster: "/poster/296760/{profile}",
      path: "/us/movie/weekend-at-bernies",
      watched: false
    };
    return chai.request(app)
      .post('/login')
      .send(regUser)
      .post('/users/me/watchlist')
      .send(newTitle)
      .then(function (res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.include.all.keys('id', 'title', 'type', 'poster', 'path', 'watched');
      });
  });
  it('should mark a title as watched or unwatched', function () {
    const movieId = '595afa307dd438f90e37a0bd';
    const nowWatched = {
        watched: true,
        titleId: '595afa307dd438f90e37a0bd'
      }
    return chai.request(app)
      .put(`/users/me/item/${movieId}`)
      .send(nowWatched)
      .then(function (res) {
        res.should.have.status();
        res.should.be.json;
        res.body.should.include.all.keys();
      });
  });
  it('should remove a title from the user watchlist', function () {
    //code
  });
  it('should return a list of users matching the query search term', function () {
    //code
  });
});