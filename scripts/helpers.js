'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Load configuration
var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

// --------------- Helpers that build all of the responses -----------------------

exports.buildSpeechletResponse = function (title, output, repromptText, shouldEndSession) {
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

exports.buildResponse = function (sessionAttributes, speechletResponse) {
    var response = {
        version: '1.0',
        sessionAttributes: sessionAttributes,
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
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var nameSet = this.getSessionValue(session, 'nameSet');
    var addressSet = this.getSessionValue(session, 'addressSet');
    var repromptText = '';
    var reprompt = false;

    if(typeof nameSet==='undefined' || !nameSet) {
        speechOutput = speechOutput + ' ' + responses.promptData.nameResponse.speechOutput;
        repromptText = responses.promptData.nameResponse.repromptText;
        reprompt = true;
    }
    else if(typeof addressSet==='undefined' || !addressSet) {
        speechOutput = speechOutput + ' ' + responses.promptData.addressResponse.speechOutput;
        repromptText = responses.promptData.addressResponse.repromptText;
        reprompt = true;
    }

    if(reprompt) {
        callback(sessionAttributes,
          this.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }

    return reprompt;
};