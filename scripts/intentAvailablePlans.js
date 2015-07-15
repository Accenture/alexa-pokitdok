'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Load configuration
var cfg = require('config');
var pkdApiConfig = cfg.get('pokitdok.api');
var responses = cfg.get('responses.regions.' + cfg.get('global').region);

// get a connection to the PokitDok Platform for the most recent version
var PokitDok = require('pokitdok-nodejs');
var pokitdok = new PokitDok(pkdApiConfig.clientId, pkdApiConfig.clientSecret, pkdApiConfig.apiVersion);

// Include project helper functions
var helpers = require('./helpers.js');

//Include Node utility package to support string formatting
var util = require('util');

//Include library for working with addresses
var usps = require('node-usps');

/***
* Gets a list of plans available in the current state and plan type
*/
exports.executeIntent = function (intent, session, callback) {
    var cardTitle = responses[intent.name].cardTitle;
    var stateSlot = intent.slots.state;
    var planTypeSlot = intent.slots.planType;
    var repromptText = '';
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    var speechOutput = ''; 

    if(helpers.promptToCollectData(session, cardTitle, 'Ok, let me find you some health plans, first', callback)) {
      return;
    }

    var state = helpers.getSessionValue(session, 'state');
    var city = helpers.getSessionValue(session, 'city');
    var zipcode = helpers.getSessionValue(session, 'zipcode');

    //Default planType to 'PPO' if not specified
    var planType = planTypeSlot.value || 'PPO';

    //Convert name of state to abbreviation
    state = stateSlot.value || state;
    var address = new usps.AddressBuilder();
    address.State = state;
    address = address.abbreviate();
    state = address.State;

    //Log our input parameters
    var planParams = {
        plan_type: planType,
        state: state,
        city: city,
        zipcode: zipcode
    };
    logger.info('Input planParams=' + JSON.stringify(planParams));

    // fetch plan information based on planType and state inputs
    pokitdok.plans(planParams, function (err, res) {
        if (err) {
            //An error occurred, ask the user to try again.
            speechOutput = responses[intent.name].errorResponse.speechOutput;
            repromptText = responses[intent.name].errorResponse.repromptText;
            logger.info(err, res.statusCode);
        }
        else {
            var planStr = '';

            // print the plan names and ids to the console
            for (var i = 0, ilen = res.data.length; i < ilen; i++) {
                var plan = res.data[i];
                logger.info(plan.plan_name);
                planStr = planStr + plan.plan_name + ', ';
            }

            // It worked! Read back all the plans found
            speechOutput = util.format(responses[intent.name].speechOutput, planStr);
            repromptText = util.format(responses[intent.name].repromptText, planStr);
        }

        callback(sessionAttributes,
            helpers.buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    });
};