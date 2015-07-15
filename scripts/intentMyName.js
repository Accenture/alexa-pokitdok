'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

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
  var repromptText = responses[intent.name].repromptText;

  var sessionAttributes = helpers.setSessionValue(session, 'username', name);
  sessionAttributes = helpers.setSessionValue(session, 'nameSet', true);
  session.attributes = sessionAttributes;

  if(helpers.promptToCollectData(session, cardTitle, speechOutput, callback)) {
  	return;
  }

  callback(sessionAttributes,
      helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
};