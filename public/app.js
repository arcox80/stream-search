var state = {
  user: null
};

if (localStorage.user) {
  state.user = JSON.parse(localStorage.user);
}

function watchSubmit() {
  $('#createUser').on('submit', function (event) {
    event.preventDefault();
    var user = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      email: $('#email').val(),
      username: $('#username').val(),
      password: $('#password').val()
    };
    sendUserData(user, function (data) {
      console.log('User successfully created.', data);
      localStorage.user = JSON.stringify(data);
      window.location = 'dashboard.html';
    });
  });
}

function sendUserData(newUser, callback) {
  var details = {
    url: '/users',
    data: JSON.stringify(newUser),
    dataType: 'json',
    type: 'POST',
    contentType: "application/json; charset=utf-8",
    success: callback
  };
  $.ajax(details);
}

function userLogin() {
  $('#userLogin').on('submit', function (event) {
    event.preventDefault();
    var user = {
      username: $('#existingUsername').val(),
      password: $('#existingPassword').val()
    };
    sendLoginData(user, function (data) {
      console.log('User logged in', data);
      localStorage.user = JSON.stringify(data);
      window.location = 'dashboard.html';
    });
  });
}

function sendLoginData(oldUser, callback) {
  var details = {
    url:'/login',
    data: JSON.stringify(oldUser),
    dataType: 'json',
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    success: callback
  };
  $.ajax(details);
}

$(function() {
  watchSubmit();
  userLogin();
});