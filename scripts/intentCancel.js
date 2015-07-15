'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);
var helpers = require('./helpers.js');

exports.executeIntent = function (intent, session, callback) {
  var cardTitle = responses[intent.name].cardTitle;
  var sessionAttributes = session.attributes;
  var shouldEndSession = true;

  var speechOutput = responses[intent.name].speechOutput;
  var repromptText = responses[intent.name].repromptText;

  callback(sessionAttributes,
    helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
};