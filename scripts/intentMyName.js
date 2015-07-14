'use strict';

// Load configuration
var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

// Include project helper functions
var helpers = require('./helpers.js');

//Include Node utility package to support string formatting
var util = require('util');


exports.executeIntent = function (intent, session, callback) {
  var cardTitle = responses[intent.name].cardTitle;
  var shouldEndSession = false;

  var nameSlot = intent.slots.name;
  var name = nameSlot.value;

  var speechOutput = util.format(responses[intent.name].speechOutput, name);
  var repromptText = util.format(responses[intent.name].repromptText, name);

  var sessionAttributes = helpers.setSessionValue(session, 'username', name);

  callback(sessionAttributes,
      helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
};