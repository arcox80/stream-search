const state = {
  user: null
};

if (localStorage.user) {
  state.user = JSON.parse(localStorage.user);
}

//Current Watchlist Functions

//api call to retrieve user's saved watchlist and reveal populated templates
function retrieveWatchList() {
  $.getJSON('/users/me/')
    .done(function (json) {
    const listArray = json.watchlist;
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
        htmlItem.find('.js-mark-watched').html(`<i class="glyphicon glyphicon-ok js-glyph-ok"></i>`);
        htmlItem.find('.js-mark-watched').addClass('watched');
      }
      htmlItem.removeClass('templ');
      $('.js-watchlist-results').append(htmlItem);
      $('.js-your-watchlist').html('Your Watchlist');
      $('.js-watchlist').show();
      $('.js-returnButton').addClass('hidden');
      $('.js-welcome').removeClass('hidden');
    });
  })
  .fail(function (error) {
    if (error.status === 401) {
      window.location = 'index.html';
    }
  });
}

//click event that marks a title as watched on the user's dashboard and is saved to database
function markAsWatched() {
  $('.js-watchlist-results').on('click', '.js-mark-watched', function (event) {
    let titleId = $(this).attr('title-id');
    let isWatched = $(this).attr('watched');
    if (JSON.parse(isWatched)) {
      $(this).attr('watched', false);
      isWatched = false;
      $(this).removeClass('watched');
      $(this).attr('title', 'Mark as Watched');
      $(this).html(`<i class="glyphicon glyphicon-eye-open js-glyph-ok"></i>`);
    } else {
      $(this).attr('watched', true);
      isWatched = true;
      $(this).addClass('watched');
      $(this).attr('title', 'Already Watched');
      $(this).html(`<i class="glyphicon glyphicon-ok js-glyph-ok"></i>`);
    }
    $.ajax({
      type: "PUT",
      url: `/users/me/item/${titleId}`,
      data: JSON.stringify({
        titleId: titleId,
        watched: isWatched
      }),
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function () {
        console.log(`success`);
      },
      error: function (data) {
        if (data.status === 404) {
          console.log(`404 Error`);
        }
      }
    });
  });
}

//will remove a title from a user's watchlist on the dashboard and database
function removeFromList() {
  $('.js-watchlist-results').on('click', '.js-remove-title', function (event) {
    let titleId = $(this).attr('title-id');
    let elem = $(this);
    $.ajax({
      type: "DELETE",
      url: '/users/me/item/' + titleId,
      data: JSON.stringify({
        titleId: titleId
      }),
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      success: function () {
        elem.closest('.js-list-item').remove();
      },
      error: function (data) {
        if (data.status === 404) {
          console.log(`404 Error`);
        }
      }
    });
  });
}

//Title Search Functions

//sends search terms to api to access justwatch api
function searchTitlefromApi(searchTerm, callback) {
  let details = {
    url: '/search',
    data: JSON.stringify({
      "query": searchTerm
    }),
    dataType: 'json',
    type: 'POST',
    contentType: "application/json; charset=utf-8",
    success: callback,
    error: function (data) {
      if (data.status === 404) {
        $('.js-noResults').text(`Error code 404: Sorry, there was an error processing your request.`);
        $('.js-noResults').removeClass('hidden');
      }
    }
  };
  $.ajax(details);
}

//listens for click event to execute searchTitlefromApi function
function searchSubmit() {
  $('#searchTitle').on('submit', function (event) {
    event.preventDefault();
    $('.js-result-container').empty();
    let query = $('#search').val();
    searchTitlefromApi(query, function (data) {
      state.movies = data.items;
      if (data.items.length === 0) {
        $('.js-noResults').text(`Sorry, there were no results for your search of "${query}"`);
        $('.js-noResults').removeClass('hidden');
        $('.results').removeClass('hidden');
        $('.results').show();
        $('.js-watchlist-results').html('');
        $('.js-watchlist').hide();
        $('.js-userResults').hide();
        $('.js-userResults-list').html('');
        $('.js-returnButton').removeClass('hidden');
        $('.js-welcome').addClass('hidden');
      } else {
        displayResults();
      }
    });
  });
}

//displays results of the search, if any, and reveals filled out templates
function displayResults() {
  state.movies.forEach(function (item) {
    let htmlItem = $('.js-result.templ').clone();
    let imgUrl = item.poster;
    imgUrl = imgUrl.replace("{profile}", "s166");
    htmlItem.find('.js-img').attr('src', "https://www.justwatch.com/images" + imgUrl);
    htmlItem.find('.item-title').append(item.title);
    htmlItem.find('.item-description').append(item.short_description);
    htmlItem.find('.js-release').append(`(${item.original_release_year})`);
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
          let found = item.offers.find(function (offer) {
            if (offer.presentation_type === 'hd' && offer.provider_id === item.offers[i].provider_id)
              return true;
          })
          if (found)
            continue;
        }
        //justwatch has special provider id code to identify different streaming services
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
          case 60:
            text = 'fandango.jpeg';
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
          case 175:
            text = 'netflix-kids.jpeg';
            break;
          default:
            text = 'placeholder.jpg';
        }
        providerIdImg = text;

        //where available streaming options are placed in the template
        if (item.offers[i].monetization_type === 'flatrate') {
          htmlItem.find('.js-offer-type-sub').addClass('offers');
          htmlItem.find('.js-offer-type-sub .js-offer-bar').html('STREAM');
          htmlItemOffer.find('.js-offer-link').attr('href', item.offers[i].urls.standard_web);
          htmlItemOffer.find('.js-offer-img').attr('src', 'img/' + providerIdImg);
          htmlItemOffer.find('.js-presentation').html(item.offers[i].presentation_type.toUpperCase());
          htmlItem.find('.js-sub-row').append(htmlItemOffer);
        } else if (item.offers[i].monetization_type === 'rent') {
          htmlItem.find('.js-offer-type-rent').addClass('offers');
          htmlItem.find('.js-offer-type-rent .js-offer-bar').html('RENT');
          htmlItemOffer.find('.js-offer-link').attr('href', item.offers[i].urls.standard_web);
          htmlItemOffer.find('.js-offer-img').attr('src', 'img/' + providerIdImg);
          htmlItemOffer.find('.js-presentation').html(item.offers[i].presentation_type.toUpperCase());
          htmlItem.find('.js-rent-row').append(htmlItemOffer);
        } else if (item.offers[i].monetization_type === 'cinema') {
          htmlItem.find('.js-offer-type-cinema').addClass('offers');
          htmlItem.find('.js-offer-type-cinema .js-offer-bar').html('CINEMA');
          htmlItemOffer.find('.js-offer-link').attr('href', item.offers[i].urls.standard_web);
          htmlItemOffer.find('.js-offer-img').attr('src', 'img/' + providerIdImg);
          htmlItemOffer.find('.js-presentation').html('TICKET');
          htmlItem.find('.js-cinema-row').append(htmlItemOffer);
        } else {
          htmlItem.find('.js-offer-type-buy').addClass('offers');
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
    $('.js-noResults').addClass('hidden');
    $('.results').removeClass('hidden');
    $('.results').show();
    $('.js-result-container').append(htmlItem);
    $('.js-watchlist-results').html('');
    $('.js-watchlist').hide();
    $('.js-userResults').hide();
    $('.js-userResults-list').html('');
    $('.js-returnButton').removeClass('hidden');
    $('.js-welcome').addClass('hidden');
  });
}

//extracts data from button attributes and uses it to add the title to the user's watchlist
function addToList() {
  $('.results, .js-watchlist').on('click', '.js-addToWatchList', function (event) {
    const clickedItem = $(this);
    let jsonData = {};
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
        clickedItem.html('Saved to Watchlist');
      },
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      error: function (data) {
        if (data.status === 403) {
          clickedItem.parent().next('.js-alreadyAdded').removeClass('hidden');
        }
        if (data.status === 500) {
          clickedItem.parent().next('.js-addingError').removeClass('hidden');
        }
      }
    });
  });
}

//User Search Functions

//makes an ajax call to find matching users based on search terms
function searchUsers(searchTerm, callback) {
  let details = {
    url: 'users/?q=' + searchTerm,
    dataType: 'json',
    type: 'GET',
    contentType: "application/json; charset=utf-8",
    success: callback
  };
  $.ajax(details);
}

//listens for click event to call searchUsers and then calls displayUserResults if there are matches
function userSearchSubmit() {
  $('#searchUsers').on('submit', function (event) {
    event.preventDefault();
    let query = $('#userSearch').val();
    searchUsers(query, function (data) {
      state.userResults = data;
      $('.js-userResults-list').html('');
      if (state.userResults.length === 0) {
        $('.js-noUsers').text(`Sorry, no users were found based on your search of "${query}"`);
        $('.js-noUsers').removeClass('hidden');
        $('.js-userResults').removeClass('hidden');
        $('.js-userResults').show();
        $('.js-watchlist').hide();
        $('.js-watchlist-results').html('');
        $('.results').hide();
        $('.js-results-container').html('');
        $('.js-returnButton').removeClass('hidden');
        $('.js-welcome').addClass('hidden');
      } else {
        displayUserResults();
      }
    });
  });
}

//fills the search results templates with the users found in the search
function displayUserResults() {
  state.userResults.forEach(function (item) {
    let htmlItem = $('.js-userResult.templ').clone();
    htmlItem.find('.js-username').append(item.username).attr('uid', item._id);
    htmlItem.find('.js-username').attr('firstName', item.firstName);
    htmlItem.find('.js-name').append(`(${item.firstName} ${item.lastName})`);
    if (item.watchlist.length === 1) {
      htmlItem.find('.js-listCount').append(`${item.watchlist.length} item in their Watchlist.`);
    } else {
      htmlItem.find('.js-listCount').append(`${item.watchlist.length} items in their Watchlist.`);
    }
    htmlItem.removeClass('templ');
    $('.js-userResults-list').append(htmlItem);
    $('.js-userResults').removeClass('hidden');
    $('.js-userResults').show();
  });
  $('.js-noUsers').addClass('hidden');
  $('.js-watchlist').hide();
  $('.js-watchlist-results').html('');
  $('.results').hide();
  $('.js-results-container').html('');
  $('.js-returnButton').removeClass('hidden');
  $('.js-welcome').addClass('hidden');
}

//listens for click event on username, then makes ajax call to retrieve user's watchlist
function usernameClick() {
  $('.js-userResults').on('click', '.js-username', function (event) {
    event.preventDefault();
    let userId = $(this).attr('uid');
    let firstName = $(this).attr('firstName');
    $('.js-userResults-list').html('');
    $('.js-userResults').addClass('hidden');
    $.getJSON('/users/' + userId, function (json) {
      const listArray = json.watchlist;
      listArray.forEach(function (item) {
        let htmlItem = $('.js-list-item.templ').clone();
        htmlItem.find('.js-item-title').append(item.title);
        let imgUrl = item.poster;
        imgUrl = imgUrl.replace("{profile}", "s166");
        htmlItem.find('.js-item-img').attr('src', "https://www.justwatch.com/images" + imgUrl);
        htmlItem.find('.js-item-link').attr('href', "https://www.justwatch.com" + item.path);
        htmlItem.find('.js-addToWatchList').attr({
          'media-id': item.id,
          'title': item.title,
          'poster': item.poster,
          'object-type': item.type,
          'path': item.path
        });
        htmlItem.removeClass('templ');
        $('.js-watchlist-results').append(htmlItem);
        $('.js-your-watchlist').html(firstName + "'s Watchlist");
        $('.js-user-options').addClass('hidden');
        $('.js-addButton').removeClass('hidden');
        $('.js-watchlist').show();
      });
    });
  });
}


$(function () {
  $('.js-welcome').append(` ${state.user.firstName}!`);
  retrieveWatchList();
  searchSubmit();
  addToList();
  userSearchSubmit();
  usernameClick();
  removeFromList();
  markAsWatched();
});