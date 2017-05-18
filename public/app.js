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
    sendUserData(user, function () {
      console.log('User successfully created.');
    });
  });
}

function sendUserData(newUser, callback) {
  var details = {
    url: '/users',
    data: newUser,
    dataType: 'json',
    type: 'POST',
    success: callback
  };
  $.ajax(details);
}


$(function() {
  watchSubmit();
});