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


/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log('onIntent intent=' + JSON.stringify(intentRequest) +
                ', session=' + JSON.stringify(session));

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    console.log('intentName=' + intentName);

    // Define the route to your skill's intent handler
    var route = require('./scripts/intent' + intentName + '.js');

    // Dispatch to your skill's intent handlers
    route.executeIntent(intent, session, callback);
}


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log('event.session.application.applicationId=' + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             context.fail('Invalid Application ID');
        }
        */
        var route = null;

        if (event.session.new) {
            route = require('./scripts/sessionStart.js');
            route.onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            route = require('./scripts/sessionStart.js');
            route.onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(helpers.buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(helpers.buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === 'SessionEndedRequest') {
            route = require('./scripts/sessionEnd.js');
            route.onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail('Exception: ' + e);
    }
};
