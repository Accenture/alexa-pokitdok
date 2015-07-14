'use strict';

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

    console.log('Response=' + JSON.stringify(response));
    return response;
};

exports.buildResponse = function (sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
};

exports.setSessionValue = function (session, label, value) {
    var sessionAttributes = session.attributes;
    sessionAttributes[label] = value;
    return sessionAttributes;
};

exports.getSessionValue = function (session, label) {
    var sessionAttributes = session.attributes;
    return sessionAttributes[label];
};