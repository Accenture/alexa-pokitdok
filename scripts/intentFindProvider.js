'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Load configuration
var cfg = require('config');
var pkdApiConfig = cfg.get('pokitdok.api');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);


// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(pkdApiConfig.clientId, pkdApiConfig.clientSecret, pkdApiConfig.apiVersion);

// Include project helper functions
var helpers = require('./helpers.js');

//Include Node utility package to support string formatting
var util = require('util');

// Safely access slot values that may not have been passed in from Alexa
function getSlotValue(intent, slotName) {
  var rtnVal;

  if(typeof intent.slots[slotName] !== 'undefined' && intent.slots[slotName]){
    rtnVal = intent.slots[slotName].value;
  }

  return rtnVal;
}

exports.executeIntent = function (intent, session, callback) {
  var cardTitle = responses[intent.name].cardTitle;
  var repromptText = '';
  var sessionAttributes = session.attributes;
  var shouldEndSession = false;
  var speechOutput = '';

  var state = helpers.getSessionValue(session, 'state');
  var city = helpers.getSessionValue(session, 'city');
  var zipcode = helpers.getSessionValue(session, 'zipcode');
  var radius = getSlotValue(intent, 'radius') || '5';    //Default to 5mi radius
  var specialty = getSlotValue(intent, 'specialty');
  var firstName = getSlotValue(intent, 'firstName');
  var lastName = getSlotValue(intent, 'lastName');
  var organizationName = getSlotValue(intent, 'organizationName');

  if(helpers.promptToCollectData(session, cardTitle, 'Ok, let me find you a doctor, first', callback)) {
      return;
  }

  // Log our input parameters
  var provParams = {
    city: city,
    state: state,
    first_name: firstName,
    last_name: lastName,
    specialty: specialty,
    organization_name: organizationName,
    zipcode: zipcode,
    radius: radius + 'mi',
    limit: 5    // return top 5 providers found
  };
  logger.info('Input provParams=' + JSON.stringify(provParams));

  // get a provider using a npi id
  pokitdok.providers(provParams, function(err, res){
    if(err) {
      // An error occurred finding providers, ask the user to try again.
      speechOutput = responses[intent.name].errorResponse.speechOutput;
      repromptText = responses[intent.name].errorResponse.repromptText;
      logger.info(err, res.statusCode);
    }
    else {
      var provStr = '';

      // Iterate through the provider names
      for (var i = 0, ilen = res.data.length; i < ilen; i++) {
        var provider = res.data[i].provider;
        if(typeof provider.last_name !== 'undefined' && provider.last_name){
          logger.info(provider.first_name + ' ' + provider.last_name);
          provStr = provStr + provider.first_name + ' ' + provider.last_name + ', ';
        }
        else if (typeof provider.organization_name !== 'undefined' && provider.organization_name) {
          logger.info(provider.organization_name);
          provStr = provStr + provider.organization_name + ', ';
        }
      }

      // It worked! Read back all the providers found
      if(typeof specialty !== 'undefined' && specialty) {
        speechOutput = util.format(responses[intent.name].speechOutput, specialty, provStr);
        repromptText = util.format(responses[intent.name].repromptText, specialty, provStr);
      }
      else {
        speechOutput = util.format(responses[intent.name].speechOutput, '', provStr);
        repromptText = util.format(responses[intent.name].repromptText, '', provStr);
      }
    }

    callback(sessionAttributes,
      helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
  });
};