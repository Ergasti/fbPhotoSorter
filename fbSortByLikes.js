if (Meteor.isClient) {

  Meteor.startup(function () {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : Meteor.settings.public.APP_ID,
        status     : true,
        xfbml      : true,
        version    : 'v2.5'
      });
    };

    var fbScriptId = 'facebook-jssdk';
    var firstScript = document.getElementsByTagName('script')[0];
    var fbScript = document.getElementById(fbScriptId);
    if (!fbScript) {
      fbScript = document.createElement('script');
      fbScript.id = fbScriptId;
      fbScript.src = "//connect.facebook.net/en_US/all/debug.js";
      firstScript.parentNode.insertBefore(fbScript, firstScript);
    }
  });

  Template.body.helpers({
    results: function () {
      return Results.find({}, {sort: {likes: -1}});
    },

    validToken: function () {
      return Session.get('pageToken');
    }
  });

  Template.body.events({
    'click .fbLoginBtn': function (event, template) {
      FB.login(function (res) {
        FB.api(res.authResponse.userID + '/accounts', 'get', {'access_token': res.authResponse.accessToken}, function (response) {
          _.each(response.data, function(pageInfo) {
            if (pageInfo.name === "Ceramica Verdi") Session.set('pageToken', pageInfo.access_token);
          });
        });
      } ,{scope: 'public_profile,manage_pages'});
    },

    'click .submitBtn': function (event, template) {
      var photoLinks = [];
      var textInputValue = template.find('textarea').value;
      // if (textInputValue) photoLinks = textInputValue.split(/\r\n|\r|\n/);
      if (textInputValue) {
        // photoLinks = textInputValue.replace(/\n/g, '<br />');
        photoLinks = textInputValue.trim().split(/\n/);
      }
      _.each(photoLinks, function (link) {
        if (getUrlSegments(link).search) {
          var queryParams = getUrlSegments(link).search.substring(1).split(/&|=/);
          if (queryParams.indexOf('fbid') > -1) {
            FB.api(queryParams[queryParams.indexOf('fbid') + 1], {fields: 'likes.limit(1).summary(true),picture', 'access_token': Session.get('pageToken')}, function (res) {
              Results.insert({'link': link, 'likes': res.likes.summary.total_count, 'picture': res.picture});
            });
          }
        } else alert('Please check links');
      });
    },

    'click .clearBtn': function (event, template) {
      template.find('textarea').value = '';
      Meteor.call('removeResults');
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.methods({
    removeResults: function () {
      return Results.remove({});
    }
  });
}

Results = new Mongo.Collection('results');

function getUrlSegments (url) {
  var anchor = document.createElement('a');
  anchor.href = url;
  return anchor;
};