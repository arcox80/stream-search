const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

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