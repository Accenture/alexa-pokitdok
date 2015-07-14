'use strict';

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
exports.onSessionEnded = function (sessionEndedRequest, session) {
    console.log('onSessionEnded requestId=' + sessionEndedRequest.requestId + 
            ', session=' + JSON.stringify(session));
    // Add cleanup logic here
};