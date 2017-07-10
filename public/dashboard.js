var state = {
  user: null
};

if (localStorage.user) {
  state.user = JSON.parse(localStorage.user);
}

//Current Watchlist Functions
function retrieveWatchList() {
  $.getJSON('/users/me/', function (json) {
      const listArray = json.watchlist;
      console.log(listArray);
      listArray.forEach(function (item) {
        let htmlItem = $('.js-list-item.templ').clone();
        htmlItem.find('.js-item-title').append(item.title);
        let imgUrl = item.poster;
        console.log(imgUrl);
        imgUrl = imgUrl.replace("{profile}", "s166");
        htmlItem.find('.js-item-img').attr('src', "https://www.justwatch.com/images" + imgUrl);
        htmlItem.find('.js-item-link').attr('href', "https://www.justwatch.com" + item.path);
        htmlItem.find('.js-remove-title').attr('title-id', item._id);
        htmlItem.find('.js-mark-watched').attr({
          'watched': item.watched,
          'title-id': item._id
        });
        if (item.watched) { 
          htmlItem.find('.js-mark-watched').attr('title', 'Already Watched');
          htmlItem.find('.js-glyph-ok').append(' Already Watched');
          htmlItem.find('.js-mark-watched').addClass('watched');
        }
        htmlItem.removeClass('templ');
      $('.js-watchlist-results').append(htmlItem);
      $('.watchlist').show();
      });
      console.log("Watchlist retrieved");
  });
}

function markAsWatched () {
  $('.js-watchlist-results').on('click', '.js-mark-watched', function (event) {
    let titleId = $(this).attr('title-id');
    let isWatched = $(this).attr('watched');
    if (JSON.parse(isWatched)) {
      $(this).attr('watched', false);
      isWatched = false;
      $(this).removeClass('watched');
      $(this).attr('title', 'Mark as Watched');
      $('.js-glyph-ok').append(' Mark as Watched');
    } else {
      $(this).attr('watched', true);
      isWatched = true;
      $(this).addClass('watched');
      $(this).attr('title', 'Already Watched');
      $('.js-glyph-ok').append(' Already Watched');
      
    }
    console.log(isWatched);
    $.ajax({
      type: "PUT",
      url: '/users/me/item/' + titleId,
      data: JSON.stringify({
        titleId: titleId,
        watched: isWatched
      }),
      success: function () {
        console.log("Item watched is " + isWatched);
      },
      dataType: 'json',
      contentType: "application/json; charset=utf-8"
    });
  });
}

function removeFromList() {
  $('.js-watchlist-results').on('click', '.js-remove-title', function (event) {
    let titleId = $(this).attr('title-id');
    $.ajax({
      type: "DELETE",
      url: '/users/me/item/' + titleId,
      data: JSON.stringify({titleId: titleId}),
      success: function () {
        console.log("Item removed");
        $(this).html('Removed from Watchlist');
      },
      dataType: 'json',
      contentType: "application/json; charset=utf-8"
    });
    $(this).closest('.js-list-item').remove();
  });
}

//Title Search Functions
function searchTitlefromApi(searchTerm, callback) {
  var details = {
    url: 'https://api.justwatch.com/titles/en_US/popular',
    data: JSON.stringify({"query": searchTerm}),
    dataType: 'json',
    type: 'POST',
    contentType: "application/json; charset=utf-8",
    success: callback
  };
  $.ajax(details);
}

function searchSubmit() {
  $('#searchTitle').on('submit', function (event) {
    event.preventDefault();
    $('.js-result-container').empty();
    var query = $('#search').val();
    searchTitlefromApi(query, function (data) {
      console.log(data);
      state.movies = data.items;
      displayResults();
    });
  });
}

function displayResults() {
  state.movies.forEach(function (item) {
    var htmlItem = $('.js-result.templ').clone();
    htmlItem.find('.item-title').append(item.title);
    htmlItem.find('.item-description').append(item.short_description);
    htmlItem.find('.js-release').append("(" + item.original_release_year + ")");
    htmlItem.find('.js-addToWatchList').attr({
      'media-id': item.id,
      'title': item.title,
      'poster': item.poster,
      'object-type': item.object_type,
      'path': item.full_path
    });

    if (item.offers) {
      for (var i=0; i<item.offers.length; i++) {
      htmlItem.find('.item-offers').append('<li>' + item.offers[i].provider_id + " " + item.offers[i].urls.standard_web + '</li>');
      }
    }
    
    htmlItem.removeClass('templ');
    console.log(htmlItem);
    $('.results').removeClass('hidden');
    $('.js-result-container').append(htmlItem);
    $('.watchlist').html('');
    //show link/button to return to watchlist
  });
}

function addToList() {
  $('.results').on('click', '.js-addToWatchList', function (event) {
    var jsonData = {};
    jsonData['id'] = $(this).attr('media-id');
    jsonData['title'] = $(this).attr('title');
    jsonData['poster'] = $(this).attr('poster');
    jsonData['type'] = $(this).attr('object-type');
    jsonData['path'] = $(this).attr('path');
    jsonData['watched'] = false;
    $.ajax({
      type: "POST",
      url: '/users/me/watchlist', 
      data: JSON.stringify(jsonData), 
      success: function () {
        console.log("Success");
      },
      dataType: 'json',
      contentType: "application/json; charset=utf-8"
    });
    $(this).html('Saved to Watchlist');
  });
}

//User Search Functions
function searchUsers(searchTerm, callback) {
  var details = {
    url: 'users/?q=' + searchTerm,
    dataType: 'json',
    type: 'GET',
    contentType: "application/json; charset=utf-8",
    success: callback
  };
  $.ajax(details);
}

function userSearchSubmit() {
  $('#searchUsers').on('submit', function (event) {
    event.preventDefault();
    var query = $('#userSearch').val();
    searchUsers(query, function (data) {
      console.log(data);
      state.userResults = data;
      displayUserResults();
    });
  });
}

function displayUserResults() {
  state.userResults.forEach(function (item) {
    var htmlItem = $('.js-userResult.templ').clone();
    htmlItem.find('.js-username').append(item.username).attr('uid', item._id);
    htmlItem.find('.js-name').append("(" + item.firstName + " " + item.lastName + ")");
    if (item.watchlist.length === 1) {
      htmlItem.find('.js-listCount').append(item.watchlist.length + " item in their Watchlist.");
    } else {
      htmlItem.find('.js-listCount').append(item.watchlist.length + " items in their Watchlist.");
    }
    htmlItem.removeClass('templ');
    $('.userResults').append(htmlItem).show();
  });
  $('.watchlist').hide();
  $('.js-watchlist-results').html('');
}

function usernameClick() {
  $('.userResults').on('click', '.js-username', function(event) {
    event.preventDefault();
    console.log('username click');
    let userId = $(this).attr('uid');
    $('.js-userResult').hide();
    //say user's watchlist
    $.getJSON('/users/' + userId, function (json) {
      const listArray = json.watchlist;
      console.log(listArray);
      listArray.forEach(function (item) {
        let htmlItem = $('.js-list-item.templ').clone();
        htmlItem.find('.js-item-title').append(item.title);
        let imgUrl = item.poster;
        console.log(imgUrl);
        imgUrl = imgUrl.replace("{profile}", "s166");
        htmlItem.find('.js-item-img').attr('src', "https://www.justwatch.com/images" + imgUrl);
        htmlItem.find('.js-item-link').attr('href', "https://www.justwatch.com" + item.path);
        htmlItem.removeClass('templ');
      $('.js-watchlist-results').append(htmlItem);
      $('.watchlist').show();
    });
    });
  });
};


$(function () {
  console.log(state.user);
  $('.js-welcome').append(' ' + state.user.firstName + '!');
  retrieveWatchList();
  searchSubmit();
  addToList();
  userSearchSubmit();
  usernameClick();
  removeFromList();
  markAsWatched();
});



/* JSON Data

{
  "content_types": -- null or ['movie', 'show']
	"presentation_types": -- null or ['hd', 'sd']
	"providers": -- null or ["mbi", "qfs", "tpl", "msf", "pls", "ply", "itu", "ddi", "crk", "qfx", "prs", "stn", "nfx"]
	"genres": -- null or ["act", "ani", "cmy", "crm", "drm", "msc", "hrr", "hst", "fnt", "trl", "war", "wsn", "rma", "scf","doc", "fml", "spt"]
	"languages": -- null
	"release_year_from": -- null or year > 1900
	"release_year_until": -- null or year < current year
	"monetization_types": -- null or ["flatrate", "ads", "rent", "buy", "free"]
	"min_price": -- null or integer value
	"max_price": -- null or integer value,
	"scoring_filter_types": -- null or {
		"imdb:score": {
			"min_scoring_value":0.0,"max_scoring_value":10.0
			},
			"tomato:meter":	{
				"min_scoring_value":0,"max_scoring_value":100
				}
	},
	"cinema_release": -- null,
	"query": -- null or title as string 
}
*/

/*

2 - itunes
3 - google
7 - vudu
8 - netflix
10 - amazon
11 - mubi
12 - crackle
14 - realeyz
15 - hulu
18 - psn
25 - fandor
27 - hbo now
31 - hbo go
34 - epix
37 - showtime
43 - starz
68 - microsoft
73 - tubitv
78 - cbs
79 - nbc
80 - amc
83 - cw
87 - acorn
92 - yahoo
99 - shudder
100 - guidedoc
102 - filmstruck
105 - fandango
123 - fx now
139 - max go
143 - sundance now
148 - abc
151 - britbox
155 - history
156 - a&e
157 - lifetime

*/