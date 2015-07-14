'use strict';

// Load configuration
var cfg = require('config');
var pkdApiConfig = cfg.get('pokitdok.api');
var gcApiConfig = cfg.get('google-geocoder.api');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

//Include library for working with geolocation
var extra = {
    apiKey: gcApiConfig.key,
    formatter: null         
};
var geocoder = require('node-geocoder')('google', 'https', extra);

// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(pkdApiConfig.clientId, pkdApiConfig.clientSecret, pkdApiConfig.apiVersion);

// Include project helper functions
var helpers = require('./helpers.js');

//Include Node utility package to support string formatting
var util = require('util');

exports.executeIntent = function (intent, session, callback) {
  var cardTitle = responses[intent.name].cardTitle;
  var stateSlot = intent.slots.state;
  var addressSlot = intent.slots.address;
  var citySlot = intent.slots.city;
  var radiusSlot = intent.slots.radius;
  var specialtySlot = intent.slots.specialty;
  var zipcodeSlot = intent.slots.zipcode;
  var repromptText = '';
  var sessionAttributes = session.attributes;
  var shouldEndSession = false;
  var speechOutput = '';

  var address = addressSlot.value;
  var state = stateSlot.value;
  var city = citySlot.value;
  var radius = radiusSlot.value || '5';    //Default to 5mi radius
  var specialty = specialtySlot.value;
  var zipcode = zipcodeSlot.value;

  var reqData = {
      address: address,
      city: city,
      state: state,
      zipcode: zipcode,
      country: 'United States'
  };
  console.log('reqData=' + JSON.stringify(reqData));

  geocoder.geocode(reqData, function(err, geoloc) {
    if(err) {
      // An error occurred getting location data, ask the user to try again.
      speechOutput = responses[intent.name].errorResponse.speechOutput;
      repromptText = responses[intent.name].errorResponse.repromptText;
      console.log(err, geoloc.statusCode);
    } 
    else {
      console.log('geocoded response=' + JSON.stringify(geoloc));
      console.log('geoloc.zipcode=' + geoloc[0].zipcode);
      //Log our input parameters
      var provParams = {
        zipcode: geoloc[0].zipcode,
        radius: radius + 'mi',
        limit: 3
      };
      console.log('Input provParams=' + JSON.stringify(provParams));

      // get a provider using a npi id
      pokitdok.providers(provParams, function(err, res){
          if(err) {
            // An error occurred finding providers, ask the user to try again.
            speechOutput = responses[intent.name].errorResponse.speechOutput;
            repromptText = responses[intent.name].errorResponse.repromptText;
            console.log(err, res.statusCode);
          }
          else {
            var provStr = '';

            // print the provider names to the console
            for (var i = 0, ilen = res.data.length; i < ilen; i++) {
              var provider = res.data[i].provider;
              if(typeof provider.last_name !== 'undefined' && provider.last_name){
                console.log(provider.first_name + ' ' + provider.last_name);
                provStr = provStr + provider.first_name + ' ' + provider.last_name + ', ';
              }
            }

            // It worked! Read back all the providers found
            speechOutput = util.format(responses[intent.name].speechOutput, provStr);
            repromptText = util.format(responses[intent.name].repromptText, provStr);
          }

          callback(sessionAttributes,
            helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
      });
    }

  });
};