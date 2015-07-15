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

  //Setup the default responses
  var cardTitle = responses.onLaunch.cardTitle;
  var speechOutput = responses.onLaunch.speechOutput;
  var shouldEndSession = false;

  if(helpers.promptToCollectData(session, cardTitle, speechOutput, callback)) {
    return;
  }

  callback(session,
           helpers.buildSpeechletResponse(cardTitle, speechOutput, session, shouldEndSession));
};