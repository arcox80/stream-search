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
        htmlItem.find('.js-mark-watched').html("<i class='glyphicon glyphicon-ok js-glyph-ok'></i> Already Watched");
        htmlItem.find('.js-mark-watched').addClass('watched');
        fdsafdsafsdadsa
      }
      htmlItem.removeClass('templ');
      $('.js-watchlist-results').append(htmlItem);
      $('.watchlist').show();
    });
    console.log("Watchlist retrieved");
  });
}

function markAsWatched() {
  $('.js-watchlist-results').on('click', '.js-mark-watched', function (event) {
    let titleId = $(this).attr('title-id');
    let isWatched = $(this).attr('watched');
    if (JSON.parse(isWatched)) {
      $(this).attr('watched', false);
      isWatched = false;
      $(this).removeClass('watched');
      $(this).attr('title', 'Mark as Watched');
      $(this).html("<i class='glyphicon glyphicon-ok js-glyph-ok'></i> Mark as Watched");
    } else {
      $(this).attr('watched', true);
      isWatched = true;
      $(this).addClass('watched');
      $(this).attr('title', 'Already Watched');
      $(this).html("<i class='glyphicon glyphicon-ok js-glyph-ok'></i> Already Watched");

    }
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
      data: JSON.stringify({ titleId: titleId }),
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
  let details = {
    url: 'https://api.justwatch.com/titles/en_US/popular',
    data: JSON.stringify({ "query": searchTerm }),
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
    let query = $('#search').val();
    searchTitlefromApi(query, function (data) {
      console.log(data);
      state.movies = data.items;
      displayResults();
    });
  });
}

function displayResults() {
  state.movies.forEach(function (item) {
    let htmlItem = $('.js-result.templ').clone();
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
      for (let i = 0; i < item.offers.length; i++) {
    let htmlItemOffer = $('.js-item-offers.templ').clone();
    if (item.offers[i].presentation_type === 'sd') {
      var found = item.offers.find(function(offer){
        if(offer.presentation_type === 'hd' && offer.provider_id === item.offers[i].provider_id)
          return true;
      })
      if(found)
        continue;
    }
        console.log(item.title);
        console.log (item.offers[i]);
        let providerIdImg;
          let text;
          switch (item.offers[i].provider_id) {
            case 2:
              text = 'apple-itunes.jpeg';
              break;
            case 3:
              text = 'google-play-movies.jpeg';
              break;
            case 7:
              text = 'vudu.jpeg';
              break;
            case 8:
              text = 'netflix.jpeg';
              break;
            case 9:
              text = 'amazon-prime-instant-video.jpeg';
              break;
            case 10:
              text = 'amazon-instant-video.jpeg';
              break;
            case 11:
              text = 'mubi.jpeg';
              break;
            case 12:
              text = 'crackle.jpeg';
              break;
            case 14:
              text = 'realeyz.jpeg';
              break;
            case 15:
              text = 'hulu.jpeg';
              break;
            case 18:
              text = 'playstation.jpeg';
              break;
            case 25:
              text = 'fandor.jpeg';
              break;
            case 27:
              text = 'hbo-now.jpeg';
              break;
            case 31:
              text = 'hbo-go.jpeg';
              break;
            case 34:
              text = 'epix.jpeg';
              break;
            case 37:
              text = 'showtime.jpeg';
              break;
            case 43:
              text = 'starz.jpeg';
              break;
            case 68:
              text = 'microsoft-store.jpeg';
              break;
            case 73:
              text = 'tubi-tv.jpeg';
              break;
            case 78:
              text = 'cbs.jpeg';
              break;
            case 79:
              text = 'nbc.jpeg';
              break;
            case 80:
              text = 'amc.jpeg';
              break;
            case 83:
              text = 'the-cw.jpeg';
              break;
            case 87:
              text = 'acorn-tv.jpeg';
              break;
            case 92:
              text = 'yahoo-view.jpeg';
              break;
            case 99:
              text = 'shudder.jpeg';
              break;
            case 100:
              text = 'guidedoc.jpeg';
              break;
            case 102:
              text = 'filmstruck.jpeg';
              break;
            case 105:
              text = 'fandangonow.jpeg';
              break;
            case 123:
              text = 'fxnow.jpeg';
              break;
            case 139:
              text = 'max-go.jpeg';
              break;
            case 143:
              text = 'sundance-now.jpeg';
              break;
            case 148:
              text = 'abc.jpeg';
              break;
            case 151:
              text = 'brtibox.jpeg';
              break;
            case 155:
              text = 'history.jpeg';
              break;
            case 156:
              text = 'aande.jpeg';
              break;
            case 157:
              text = 'lifetime.jpeg';
              break;
            default:
              text = 'placeholder.jpg';
          }
          providerIdImg = text;
        

        if (item.offers[i].monetization_type === 'flatrate') {
          htmlItem.find('.js-offer-type-sub .js-offer-bar').html('SUBS');
          htmlItemOffer.find('.js-offer-link').attr('href', item.offers[i].urls.standard_web);
          htmlItemOffer.find('.js-offer-img').attr('src', 'img/' + providerIdImg);
          htmlItemOffer.find('.js-presentation').html(item.offers[i].presentation_type.toUpperCase());
          htmlItem.find('.js-sub-row').append(htmlItemOffer);
        } else if (item.offers[i].monetization_type === 'rent') {
          htmlItem.find('.js-offer-type-rent .js-offer-bar').html('RENT');
          htmlItemOffer.find('.js-offer-link').attr('href', item.offers[i].urls.standard_web);
          htmlItemOffer.find('.js-offer-img').attr('src', 'img/' + providerIdImg);
          htmlItemOffer.find('.js-presentation').html(item.offers[i].presentation_type.toUpperCase());
          htmlItem.find('.js-rent-row').append(htmlItemOffer);
        } else {
          htmlItem.find('.js-offer-type-buy .js-offer-bar').html('BUY');
          htmlItemOffer.find('.js-offer-link').attr('href', item.offers[i].urls.standard_web);
          htmlItemOffer.find('.js-offer-img').attr('src', 'img/' + providerIdImg);
          htmlItemOffer.find('.js-presentation').html(item.offers[i].presentation_type.toUpperCase());
          htmlItem.find('.js-buy-row').append(htmlItemOffer);
        };
        htmlItemOffer.removeClass('templ');
      }
    }

    htmlItem.removeClass('templ');
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
  $('.userResults').on('click', '.js-username', function (event) {
    event.preventDefault();
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
9 - amazon prime
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