'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);
var helpers = require('./helpers.js');

/**
 * Called when the user launches the skill without specifying what they want.
 */
exports.onLaunch = function (launchRequest, session, callback) {
  logger.info('onLaunch requestId=' + launchRequest.requestId +
              ', session=' + JSON.stringify(session));

  var sessionAttributes = session.attributes;

  //Setup the default responses
  var cardTitle = responses.onLaunch.cardTitle;
  var speechOutput = responses.onLaunch.speechOutput;

  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  var repromptText = responses.onLaunch.repromptText;
  var shouldEndSession = false;

  if(helpers.promptToCollectData(session, cardTitle, speechOutput, callback)) {
    return;
  }

  callback(sessionAttributes,
           helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
};