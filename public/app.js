let state = {
  user: null
};

if (localStorage.user) {
  state.user = JSON.parse(localStorage.user);
}

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
      console.log('User successfully created.', data);
      localStorage.user = JSON.stringify(data);
      window.location = 'dashboard.html';
    });
  });
}

function sendUserData(newUser, callback) {
  let details = {
    url: '/users',
    data: JSON.stringify(newUser),
    dataType: 'json',
    type: 'POST',
    contentType: "application/json; charset=utf-8",
    success: callback,
    error: function (data) {
      if (data.status === 422) {
        $('.js-existingUser').removeClass('hidden');
      }
      if (data.status === 409) {
        $('.js-existingEmail').removeClass('hidden');
      }
    }
  };
  $.ajax(details);
}

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

function sendLoginData(oldUser, callback) {
  let details = {
    url: '/login',
    data: JSON.stringify(oldUser),
    dataType: 'json',
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    success: callback,
    error: function (data) {
      //get the status code
      console.log(data);
      if (data.status === 401) {
        $('.login-check').removeClass('hidden');
      }
      if (data.status === 500) {
        $('.fail-check').removeClass('hidden');
      }
    }
  };
  $.ajax(details)
    .fail(function (xhr, status, errorThrown) {
      console.log(`Error: ${errorThrown}`);
      console.log(`Status: ${status}`);
    });
}

$(function () {
  watchSubmit();
  userLogin();
});