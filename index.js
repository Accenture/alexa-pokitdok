'use strict';

var helpers = require('./scripts/helpers.js');

// Load configuration
var cfg = require('config');
if(cfg) {
    console.log('Successfully loaded environment variables!');
}
else {
    console.log('Failed to load environment variables!');
}

// Setup logging
/* jshint ignore:start */
var logger = require('./scripts/logger.js');
/* jshint ignore:end */

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    logger.info('onIntent intent=' + JSON.stringify(intentRequest) +
                ', session=' + JSON.stringify(session));

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    logger.info('intentName=' + intentName);

    // Define the route to your skill's intent handler
    var route = require('./scripts/intent' + intentName + '.js');

    // Dispatch to your skill's intent handlers
    route.executeIntent(intent, session, callback);
}

/**
 * Handler for AWS Lambda requests. Called for every request to your Lambda function.
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
*/
exports.handler = function (event, context) {
    try {
        logger.info('event.session.application.applicationId=' + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== cfg.get('global.applicationId')) {
             context.fail('Invalid Application ID: ' + event.session.application.applicationId);
             return;
        }
        */

        /**
         *  Define routes to handlers based on request type
         */
        var route = null;

        // Logic for initializing a new session is contained in sessionStart.js
        if (event.session.new) {
            route = require('./scripts/sessionStart.js');
            event.session = route.onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        // Handler for 'LaunchRequest' is called when the user launches the skill without specifying what they want.
        if (event.request.type === 'LaunchRequest') {
            route = require('./scripts/onLaunch.js');
            route.onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(helpers.buildResponse(sessionAttributes, speechletResponse));
                     });
        }
        // 
        else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(helpers.buildResponse(sessionAttributes, speechletResponse));
                     });
        } 
        else if (event.request.type === 'SessionEndedRequest') {
            route = require('./scripts/sessionEnd.js');
            route.onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail('Exception: ' + e);
    }
};
