const state = {
  user: null
};

if (localStorage.user) {
  state.user = JSON.parse(localStorage.user);
}

//listens for submission of a new user
function watchSubmit() {
  $('#createUser').on('submit', function (event) {
    event.preventDefault();
    if ($('#password').val() !== $('#password2').val()) {
      $('.pass-check').removeClass('hidden');
      return;
    }
    let user = {
      firstName: $('#firstName').val(),
      lastName: $('#lastName').val(),
      email: $('#email').val(),
      username: $('#username').val(),
      password: $('#password').val(),
      password2: $('#password2').val()
    };
    sendUserData(user, function (data) {
      localStorage.user = JSON.stringify(data);
      window.location = 'dashboard.html';
    });
  });
}

//ajax call to register a new user
function sendUserData(newUser, callback) {
  const details = {
    url: '/users',
    data: JSON.stringify(newUser),
    dataType: 'json',
    type: 'POST',
    contentType: "application/json; charset=utf-8",
    success: callback,
    error: function (data) {
      if (data.status === 422) {
        $('.js-registrationError').removeClass('hidden').text(data.responseJSON.message);
      }
    }
  };
  $.ajax(details);
}

//listens for login submission of an existing user
function userLogin() {
  $('#userLogin').on('submit', function (event) {
    event.preventDefault();
    let user = {
      username: $('#existingUsername').val(),
      password: $('#existingPassword').val()
    };
    sendLoginData(user, function (data) {
      localStorage.user = JSON.stringify(data);
      window.location = 'dashboard.html';
    });
  });
}

//ajax call for logging in an existing user
function sendLoginData(oldUser, callback) {
  const details = {
    url: '/login',
    data: JSON.stringify(oldUser),
    dataType: 'json',
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    success: callback,
    error: function (data) {
      if (data.status === 401) {
        $('.login-check').removeClass('hidden');
      }
      if (data.status === 500) {
        $('.fail-check').removeClass('hidden');
      }
    }
  };
  $.ajax(details);
}

$(function () {
  watchSubmit();
  userLogin();
});