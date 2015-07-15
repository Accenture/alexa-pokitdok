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
  //Setup the default responses
  var cardTitle = responses[intent.name].cardTitle;
  var speechOutput = responses[intent.name].speechOutput;
  var shouldEndSession = false;

  if(helpers.promptToCollectData(session, cardTitle, speechOutput, callback)) {
    return;
  }

  callback(session,
    helpers.buildSpeechletResponse(cardTitle, speechOutput, session, shouldEndSession));
};