'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Load configuration
var cfg = require('config');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

function getSessionValue(session, label) {
    var sessionAttributes = session.attributes;
    if(typeof sessionAttributes === 'undefined' || !sessionAttributes) {
        return sessionAttributes;
    }
    else {
        return sessionAttributes[label];
    }
}

exports.buildRepromptText = function (session) {
	var repromptText = '';

	var recentIntentSuccessful = getSessionValue(session, 'recentIntentSuccessful');
	logger.debug('recentIntentSuccessful =' + recentIntentSuccessful);

	if(recentIntentSuccessful) {
    var nameSet = getSessionValue(session, 'nameSet');
    var addressSet = getSessionValue(session, 'addressSet');

    if(nameSet && addressSet) {

    	var foundProvider = getSessionValue(session, 'recentIntentSuccessful');
    	if(typeof foundProvider !== 'undefined' && foundProvider) {
    		logger.debug('Reprompt: Everything was sucessful and they have already searched for doctors. Let\'s advertise to try available health plans');
    		repromptText = responses.reprompts.AdvertiseAvailablePlans;
    	}
    	
    }
    else if (!nameSet) {
    	logger.debug('Reprompt: They must be trying to set their name, but ended up at the wrong intent. Let\'s reprompt for address.');
    	repromptText = responses.MyName.repromptText;
    }
    else if (!addressSet) {
    	logger.debug('Reprompt: They must be trying to set their address, but ended up at the wrong intent. Let\'s reprompt for address.');
    	repromptText = responses.MyAddress.repromptText;
    }
	}
	else {
		var recentIntent = getSessionValue(session, 'recentIntent');

		if(typeof recentIntent !== 'undefined' && recentIntent) {
			logger.debug('Reprompt: The most recent intent was not successful, so let\'s reprompt for that');
			repromptText = responses[recentIntent].repromptText;
		}
		else {
			logger.debug('Reprompt: The most recent intent was not successful, and we don\'t have a recent intent recorded,' +
									' therefore we must be at the very beginning of the session. Let\'s start by getting a name.');
			repromptText = responses.MyName.repromptText;
			
		}
	}

	return repromptText;
};