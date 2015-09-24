'use strict';
/* jshint unused:false */

/* jshint ignore:start */
var logger = require('./logger.js');
/* jshint ignore:end */

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
exports.onSessionEnded = function (sessionEndedRequest, session) {
    // Add cleanup logic here

    logger.info('Successfully ended session');
};