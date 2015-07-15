'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Load configuration
var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

var reprompt = require('./reprompt.js');

// --------------- Helpers that build all of the responses -----------------------

exports.buildSpeechletResponse = function (title, output, session, shouldEndSession) {
    var repromptText = reprompt.buildRepromptText(session);
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

    //logger.info('Response=' + JSON.stringify(response));
    return response;
};

exports.buildResponse = function (session, speechletResponse) {
    // If we will be ending the session in this response with the 'shouldEndSession: true'
    // then we should make sure to execute our session cleanup logic
    if(speechletResponse.shouldEndSession) {
        var route = require('./sessionEnd.js');
        var sessionEndedRequest = {
            type: 'SessionEndedRequest',
            requestId: 'request-ShouldEndSession'
        };
        route.onSessionEnded(sessionEndedRequest, session);
    }

    // Format the response to be sent back to Alexa
    var response = {
        version: '1.0',
        sessionAttributes: session.attributes,
        response: speechletResponse
    };

    logger.info('Response=' + JSON.stringify(response));
    return response;
};

exports.setSessionValue = function (session, label, value) {
    var sessionAttributes = session.attributes;
    if(typeof sessionAttributes === 'undefined' || !sessionAttributes) {
        sessionAttributes = {};
    }
    sessionAttributes[label] = value;
    return sessionAttributes;
};

exports.getSessionValue = function (session, label) {
    var sessionAttributes = session.attributes;
    if(typeof sessionAttributes === 'undefined' || !sessionAttributes) {
        return sessionAttributes;
    }
    else {
        return sessionAttributes[label];
    }
};

exports.promptToCollectData = function (session, cardTitle, speechOutput, callback) {
    var shouldEndSession = false;
    var nameSet = this.getSessionValue(session, 'nameSet');
    var addressSet = this.getSessionValue(session, 'addressSet');
    var reprompt = false;

    if(typeof nameSet==='undefined' || !nameSet) {
        speechOutput = speechOutput + ' ' + responses.promptData.nameResponse.speechOutput;
        reprompt = true;
    }
    else if(typeof addressSet==='undefined' || !addressSet) {
        speechOutput = speechOutput + ' ' + responses.promptData.addressResponse.speechOutput;
        reprompt = true;
    }

    if(reprompt) {
        callback(session,
          this.buildSpeechletResponse(cardTitle, speechOutput, session, shouldEndSession));
    }

    return reprompt;
};