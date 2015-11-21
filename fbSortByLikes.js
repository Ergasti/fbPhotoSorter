if (Meteor.isClient) {

  Meteor.startup(function () {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '195283507474254',
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
    }
  });

  Template.body.events({
    'click .fbLoginBtn': function (event, template) {
      FB.login(function (res) {
        console.log(res);
        Session.set('accessToken', res.authResponse.accessToken);
      });
    },

    'click .submitBtn': function (event, template) {
      var photoLinks = [];
      var textInputValue = template.find('textarea').value;
      if (textInputValue) photoLinks = textInputValue.split(/\r\n|\r|\n/g);
      _.each(photoLinks, function (link) {
        console.log('link', link);
        if (getUrlSegments(link).search) {
          console.log(getUrlSegments(link).search);
          var queryParams = getUrlSegments(link).search.substring(1).split(/&|=/);
          console.log('queryParams', queryParams);
          if (queryParams.indexOf('fbid') > -1) {
            // console.log('TRUEEE');
            // HTTP.get('http://graph.facebook.com/' + queryParams[queryParams.indexOf('fbid') + 1], {params: {fields: 'likes'}}, function (err, res) {
            //   console.log('facebook response', res);
            // });
            FB.api(queryParams[queryParams.indexOf('fbid') + 1], {fields: 'likes,picture'}, function (res) {
              console.log(res);
              Results.insert({'link': link, 'likes': res.likes.data.length, 'picture': res.picture});
            });
          } else console.log('FALSEEE');
        }
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