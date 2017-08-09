const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { User, WatchList } = require('../models');
const  streamSearchUsers  = require('../stream-search-users.js');
const  streamSearchWatchlists  = require('../stream-search-watchlists.js');

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
});

function seedDb() {
  return new Promise((resolve, reject) => {
    console.log(streamSearchUsers);
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
  beforeEach(function () {
    return seedDb();
  });
  afterEach(function () {
    return teardDownDb();
  });
  after(function () {
    return closeServer();
  });
  it('should login a registered user', function () {
    const regUser = {
      username: 'ccox',
      password: 'thinkful'
    };
    return chai.request(app)
      .post('/login')
      .send(regUser)
      .then(function (res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.include.all.keys('_id', 'username', 'password', 'email', 'watchlist', 'lastName', 'firstName');
      });
  });
});