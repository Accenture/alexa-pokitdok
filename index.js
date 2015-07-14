'use strict';

var config = require('config');
var pkdApiConfig = config.get('pokitdok.api');
var gcApiConfig = config.get('google-geocoder.api');
var responses = config.get('responses.regions.' + config.get('global').region);

if(pkdApiConfig && gcApiConfig && responses) {
    console.log('Successfully loaded environment variables!');
}
else {
    console.log('Failed to load environment variables!');
}

// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(pkdApiConfig.clientId, pkdApiConfig.clientSecret, pkdApiConfig.apiVersion);

//Include library for working with addresses
var usps = require('node-usps');

//Include library for working with geolocation
var extra = {
    apiKey: gcApiConfig.key,
    formatter: null         
};
var geocoder = require('node-geocoder')('google', 'https', extra);

//Include Node utility package to support string formatting
var util = require('util');



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
        console.log(context.succeed);

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
    } else if ('MyName' === intentName) {
        setMyName(intent, session, callback);
    } else if ('FindProvider' === intentName) {
        getFindProvider(intent, session, callback);
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
            + ', session=' + JSON.stringify(session));
    // Add cleanup logic here
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};

    //Setup the default responses
    var cardTitle = responses.SessionStart.cardTitle;
    var speechOutput = responses.SessionStart.speechOutput;

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = responses.SessionStart.repromptText;
    var shouldEndSession = false;

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function setMyName(intent, session, callback) {
    var cardTitle = responses[intent.name].cardTitle;
    var shouldEndSession = false;

    var nameSlot = intent.slots.name;
    var name = nameSlot.value;

    var speechOutput = util.format(responses[intent.name].speechOutput, name);
    var repromptText = util.format(responses[intent.name].repromptText, name);

    var sessionAttributes = setSessionValue(session, 'username', name);

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function setSessionValue(session, label, value) {
    var sessionAttributes = session.attributes;
    sessionAttributes[label] = value;
    return sessionAttributes;
}

function getSessionValue(session, lablel) {
    var sessionAttributes = session.attributes;
    return sessionAttributes[label];
}

function getFindProvider(intent, session, callback) {
    var cardTitle = responses[intent.name].cardTitle;
    var stateSlot = intent.slots.state;
    var addressSlot = intent.slots.address;
    var citySlot = intent.slots.city;
    var radiusSlot = intent.slots.radius;
    var specialtySlot = intent.slots.specialty;
    var zipcodeSlot = intent.slots.zipcode;
    var repromptText = '';
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = '';

    var address = addressSlot.value;
    var state = stateSlot.value;
    var city = citySlot.value;
    var radius = radiusSlot.value || '5';    //Default to 5mi radius
    var specialty = specialtySlot.value;
    var zipcode = zipcodeSlot.value;

    var reqData = {
        address: address,
        city: city,
        state: state,
        zipcode: zipcode,
        country: 'United States'
    };
    console.log('reqData=' + JSON.stringify(reqData));

    geocoder.geocode(reqData, function(err, res) {
        console.log('geocoded response=' + JSON.stringify(res));
    });
}

/***
* Gets a list of plans available in the current state and plan type
*/
function getAvaiablePlans(intent, session, callback) {
    var cardTitle = responses[intent.name].cardTitle;
    var stateSlot = intent.slots.state;
    var planTypeSlot = intent.slots.planType;
    var repromptText = '';
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = ''; 

    //Default planType to 'PPO' if not specified
    var planType = planTypeSlot.value || 'PPO';

    //Convert name of state to abbreviation
    var state = stateSlot.value;
    var address = new usps.AddressBuilder();
    address.State = state;
    address = address.abbreviate();
    state = address.State;

    //Log our input parameters
    var planParams = {
        plan_type: planType,
        state: state
    };
    console.log('Input planParams=' + JSON.stringify(planParams));

    // fetch plan information based on planType and state inputs
    pokitdok.plans(planParams, function (err, res) {
        if (err) {
            //An error occurred, ask the user to try again.
            speechOutput = responses[intent.name].errorResponse.speechOutput;
            repromptText = responses[intent.name].errorResponse.repromptText;;
            console.log(err, res.statusCode);
        }
        else {
            var planStr = '';

            // print the plan names and ids to the console
            for (var i = 0, ilen = res.data.length; i < ilen; i++) {
                var plan = res.data[i];
                console.log(plan.plan_name);
                planStr = planStr + plan.plan_name + ', ';
            }

            // It worked! Read back all the plans found
            speechOutput = util.format(responses[intent.name].speechOutput, planStr);
            repromptText = util.format(responses[intent.name].repromptText, planStr);
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
    };

    console.log('Response=' + JSON.stringify(response));
    return response;
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}