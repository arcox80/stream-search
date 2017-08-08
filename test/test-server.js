const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { User, Watchlist } = require('../models');
const { streamSearchUsers } = require('../stream-search-users.js');
const { streamSearchWatchlists } = require('../stream-search-watchlists');

const should = chai.should();

chai.use(chaiHttp);

describe('Testing html', function () {
  before(function () {
    return runServer();
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
  User.collection.insertMany(streamSearchUsers, function (err, success) {
    if (err) {
      console.log(err);
      throw "Error seeding users collection";
    } else {
      console.log(success);
    }
  });
  Watchlist.collection.insertMany(streamSearchWatchlists, function (err, success) {
    if (err) {
      console.log(err);
      throw "Error seeding watchlists collection";
    } else {
      console.log(success);
    }
  });
}

function teardDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting Database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('testing API', function () {
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });
  after(function () {
    return closeServer();
  });
  it('')
});