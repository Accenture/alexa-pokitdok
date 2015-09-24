'use strict';

/* jshint ignore:start */
var logger = require('./logger.js');
/* jshint ignore:end */

var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);
var helpers = require('./helpers.js');

exports.executeIntent = function (intent, session, callback) {
  var cardTitle = responses[intent.name].cardTitle;
  var shouldEndSession = true;

  var speechOutput = responses[intent.name].speechOutput;

  callback(session,
    helpers.buildSpeechletResponse(cardTitle, speechOutput, session, shouldEndSession));
};