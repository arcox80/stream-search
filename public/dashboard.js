var state = {
  user: null
};

if (localStorage.user) {
  state.user = JSON.parse(localStorage.user);
}

$(function () {
  console.log(state.user);
  $('.js-welcome').append(' ' + state.user.firstName);
});



/*
headers: { 'Authorization': "Basic " + btoa(USERNAME + ":" + PASSWORD) }
*/