'use strict';

var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);
var helpers = require('./helpers.js');

/**
 * Called when the session starts.
 */
exports.onSessionStarted = function (sessionStartedRequest, session) {
  console.log('onSessionStarted requestId=' + sessionStartedRequest.requestId +
              ', session=' + JSON.stringify(session));
};

/**
 * Called when the user launches the skill without specifying what they want.
 */
exports.onLaunch = function (launchRequest, session, callback) {
  console.log('onLaunch requestId=' + launchRequest.requestId +
              ', session=' + JSON.stringify(session));

  // If we wanted to initialize the session to have some attributes we could add those here.
  var sessionAttributes = {};

  //Setup the default responses
  var cardTitle = responses.SessionStart.cardTitle;
  var speechOutput = responses.SessionStart.speechOutput;

  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  var repromptText = responses.SessionStart.repromptText;
  var shouldEndSession = false;

  callback(sessionAttributes,
           helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
};