'use strict';


var config = require('config');
var apiConfig = config.get('pokitdok.api');

if(apiConfig) {
    console.log('Successfully loaded environment variables!')
}
else {
    console.log('Failed to load environment variables!')
}

// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(apiConfig.clientId, apiConfig.clientSecret, apiConfig.apiVersion);

//Include library for working with addresses
var usps = require('node-usps');

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * For additional samples, visit the Alexa Skills Kit developer documentation at
 * https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function
 */

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

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail('Exception: ' + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    //console.log('onSessionStarted requestId=' + sessionStartedRequest.requestId
    //            + ', sessionId=' + session.sessionId);
    console.log('onSessionStarted requestId=' + sessionStartedRequest.requestId
                + ', session=' + JSON.stringify(session));
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    //console.log('onLaunch requestId=' + launchRequest.requestId
    //            + ', sessionId=' + session.sessionId);
    console.log('onLaunch requestId=' + launchRequest.requestId
                + ', session=' + JSON.stringify(session));

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    //console.log('onIntent requestId=' + intentRequest.requestId
    //            + ', sessionId=' + session.sessionId);
    console.log('onIntent intent=' + JSON.stringify(intentRequest)
                + ', session=' + JSON.stringify(session));

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    console.log('intentName=' + intentName);

    // Dispatch to your skill's intent handlers
    if ('AvailablePlans' === intentName) {
        getAvaiablePlans(intent, session, callback);
    } else if ('HelpIntent' === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw 'Invalid intent';
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    //console.log('onSessionEnded requestId=' + sessionEndedRequest.requestId
    //            + ', sessionId=' + session.sessionId);

    console.log('onSessionEnded requestId=' + sessionEndedRequest.requestId
            + ', sessio=' + JSON.stringify(session));
    // Add cleanup logic here
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = 'Welcome to the Alexa Pokitdok demo';
    var speechOutput = 'Welcome to the Alexa Pokitdok demo, '
                + 'We can meet all your health needs by just listening to your voice, '
                + 'Try us by saying, find available health plans in Texas';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = 'Please ask me to find available health plans in Texas by saying, '
                + 'find available health plans in Texas';
    var shouldEndSession = false;

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/***
* Gets a list of plans available in the current state and plan type
*/
function getAvaiablePlans(intent, session, callback) {
    var cardTitle = intent.name;
    var stateSlot = intent.slots.state;
    var planTypeSlot = intent.slots.planType;
    var repromptText = '';
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = '';

    //Default the plan type to PPO if on is not specified
    var planType = planTypeSlot.value || 'PPO';

    //Convert name of state to abbreviation
    var state = stateSlot.value;
    var address = new usps.AddressBuilder();
    address.State = state;
    address = address.abbreviate();
    state = address.State;

    //Log our input parameters
    console.log('Input planType=' + JSON.stringify(planType));
    console.log('Input state=' + JSON.stringify(state));

    // fetch plan information for PPOs in Texas
    pokitdok.plans({plan_type:planType, state: state}, function (err, res) {
        if (err) {
            //An error occurred, ask the user to try again.
            speechOutput = 'I could not find any plans for your location, please try again';
            repromptText = 'I could not find any plans for your location, you can ask me to '
                    + 'find available plans by saying, find PPO plans for Texas';
            console.log(err, res.statusCode);
        }
        else {
            //It worked! Read back all theh plans found
            speechOutput = "We found the following plans in your state, ";
            repromptText = 'You can ask me to find available plans by saying, find PPO plans for Texas';

            // print the plan names and ids to the console
            for (var i = 0, ilen = res.data.length; i < ilen; i++) {
                var plan = res.data[i];
                console.log(plan.plan_name + ':' + plan.plan_id);
                speechOutput = speechOutput + plan.plan_name + ', ';
            }

            speechOutput = speechOutput + 'you can ask me to find additional plans by saying, find PPO plans for Texas';
        }

        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
}




// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    var response = {
        outputSpeech: {
            type: 'PlainText',
            text: output
        },
        card: {
            type: 'Simple',
            title: 'PokitDok Demo - ' + title,
            content: 'PokitDok Demo - ' + output
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }

    console.log('Response=' + JSON.stringify(response));
    return response;
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}