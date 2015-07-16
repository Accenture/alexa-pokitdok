'use strict';

/* jshint ignore:start */
var logger = require('./logger.js');
/* jshint ignore:end */

// Load configuration
var cfg = require('config');
var gcApiConfig = cfg.get('google-geocoder.api');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

//Include library for working with geolocation
var extra = {
    apiKey: gcApiConfig.key,
    formatter: null         
};
var geocoder = require('node-geocoder')('google', 'https', extra);

// Include project helper functions
var helpers = require('./helpers.js');

//Include Node utility package to support string formatting
var util = require('util');

// Safely access geolocation values that may not have been returned from Google
function getGeoValue(geolocation, fieldName) {
  var rtnVal;

  if(typeof geolocation[0] !== 'undefined' && geolocation[0]){
    if(typeof geolocation[0][fieldName] !== 'undefined' && geolocation[0][fieldName]){
      rtnVal = geolocation[0][fieldName];
    }
  }

  return rtnVal;
}

// Safely access slot values that may not have been passed in from Alexa
function getSlotValue(intent, slotName) {
  var rtnVal = '';

  if(typeof intent.slots[slotName] !== 'undefined' && intent.slots[slotName]){
    rtnVal = intent.slots[slotName].value;
  }

  return rtnVal;
}

exports.executeIntent = function (intent, session, callback) {
  var cardTitle = responses[intent.name].cardTitle;
  var shouldEndSession = false;
  var speechOutput = '';

  var streetNumber = getSlotValue(intent, 'streetNumber');
  var streetName = getSlotValue(intent, 'streetName');
  var state = getSlotValue(intent, 'state');
  var city = getSlotValue(intent, 'city');
  var zipcode = getSlotValue(intent, 'zipcode');
  var addressStr = streetNumber + ' ' + streetName + ' ' + city + ' ' + state + ' ' + zipcode;

  logger.info('Search via Google API for address: %s', addressStr);

  geocoder.geocode(addressStr, function(err, geoloc) {
    if(err) {
      // An error occurred getting location data, ask the user to try again.
      speechOutput = responses[intent.name].errorResponse.speechOutput;
      logger.info(err, geoloc.statusCode);
    } 
    else {
      logger.debug('Google\'s geolocation response', geoloc);

      // Extract the geolocation data based on inputs to help resolve location
      var streetNumber = getGeoValue(geoloc, 'streetNumber');
      var streetName = getGeoValue(geoloc, 'streetName');
      var city = getGeoValue(geoloc, 'city');
      var state = getGeoValue(geoloc, 'state');
      var stateCode = getGeoValue(geoloc, 'stateCode');
      var zipcode = getGeoValue(geoloc, 'zipcode');

      // Save values returned into the Alexa session
      if(typeof streetNumber !== 'undefined' && typeof streetName !== 'undefined' && streetNumber && streetName) {
     		session.attributes = helpers.setSessionValue(session, 'streetAddress', streetNumber + ' ' + streetName);
    	}

    	if(typeof city !== 'undefined' && city) {
        // At least the city must have been found or else we are not successful
      	session.attributes = helpers.setSessionValue(session, 'city', city);
        session.attributes = helpers.setSessionValue(session, 'addressSet', true);
        session.attributes = helpers.setSessionValue(session, 'recentIntentSuccessful', true);
        speechOutput = util.format(responses[intent.name].speechOutput, city, state);
        logger.info('Found the city via speech or Google\'s API');
      }
      else {
        // Did not find city, therefore not successful
        speechOutput = responses[intent.name].errorResponse.speechOutput;
        logger.error('Did not find the address the user specified');
      }

      if(typeof stateCode !== 'undefined' && stateCode) {
      	session.attributes = helpers.setSessionValue(session, 'state', stateCode);
      }

      if(typeof zipcode !== 'undefined' && zipcode) {
      	session.attributes = helpers.setSessionValue(session, 'zipcode', zipcode);
      }

    }

    if(helpers.promptToCollectData(session, cardTitle, speechOutput, callback)) {
      return;
    }

	  callback(session,
	      helpers.buildSpeechletResponse(cardTitle, speechOutput, session, shouldEndSession));
  });


};