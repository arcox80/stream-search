const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//const STATE_ABBREVIATIONS = Object.keys(require('./state-abbreviations'));

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ""},
  lastName: {type: String, default: ""},
  email: {
    type: String, 
    required: true,
    unique: true
  },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Watchlist' }]
});

const WatchListSchema = mongoose.Schema({
  title: String,
  id: Number,
  type: String,
  poster: String,
  path: String
});

UserSchema.methods.apiRepr = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    email: this.email || '',
    watchlist: this.watchlist || ''
  };
}

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);
const WatchList = mongoose.model('Watchlist', WatchListSchema);

module.exports = {User, WatchList};