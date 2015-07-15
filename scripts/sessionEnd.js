'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
exports.onSessionEnded = function (sessionEndedRequest, session) {
    logger.info('onSessionEnded requestId=' + sessionEndedRequest.requestId + 
            ', session=' + JSON.stringify(session));
    // Add cleanup logic here
};