'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Load configuration
var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

// Include project helper functions
var helpers = require('./helpers.js');

exports.executeIntent = function (intent, session, callback) {

  var sessionAttributes = session.attributes;

  //Setup the default responses
  var cardTitle = responses[intent.name].cardTitle;
  var speechOutput = responses[intent.name].speechOutput;
  var repromptText = responses[intent.name].repromptText;
  var shouldEndSession = false;

  if(helpers.promptToCollectData(session, cardTitle, speechOutput, callback)) {
    return;
  }

  callback(sessionAttributes,
    helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
};