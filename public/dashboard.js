var state = {
  user: null
};

if (localStorage.user) {
  state.user = JSON.parse(localStorage.user);
}

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
    $('.results').append(htmlItem).show();
    $
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
    $.ajax({
      type: "POST",
      url: '/users/593b59a56af2b154c255b944/watchlist', 
      data: JSON.stringify(jsonData), 
      success: function () {
        console.log("Success");
        $(this).html('Saved to Watchlist');
      },
      dataType: 'json',
      contentType: "application/json; charset=utf-8"
    });
  });
}

function retrieveWatchList() {
  $.getJSON('/users/me', function (json) {
      const listArray = json.watchlist;
      console.log(listArray);
      listArray.forEach(function (item) {
        let htmlItem = $('.js-list-item.templ').clone();
        htmlItem.find('.js-item-title').append(item.title);
        let imgUrl = item.poster;
        console.log(imgUrl);
        imgUrl.replace("{profile}", "s166");
        htmlItem.find('.js-item-img').attr('src', "https://www.justwatch.com/images" + imgUrl);
        htmlItem.find('.js-item-link').attr('href', "https://www.justwatch.com" + item.path);
        htmlItem.removeClass('templ');
      $('.watchlist').append(htmlItem);
      });
      console.log("Watchlist retrieved");
  });
 /*
  $.ajax({
    type: "GET",
    url:'/users/me',
    dataType: 'json',
    data: data,
    contentType: 'application/json; charset=utf-8',
    success: function () {
  
      
    }
  });
  */
}

$(function () {
  console.log(state.user);
  $('.js-welcome').append(' ' + state.user.firstName);
  retrieveWatchList();
  searchSubmit();
  addToList();
});



/*
headers: { 'Authorization': "Basic " + btoa(USERNAME + ":" + PASSWORD) }
*/


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