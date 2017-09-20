const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//schema for a new user added to the user collection
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
}, { runSettersOnQuery: true });

//schema for a title added to the watchlist collection
const WatchListSchema = mongoose.Schema({
  title: String,
  id: Number,
  type: String,
  poster: String,
  path: String,
  watched: Boolean
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