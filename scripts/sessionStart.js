'use strict';

/* jshint ignore:start */
var logger = require('./logger.js');
/* jshint ignore:end */

var helpers = require('./helpers.js');

/**
 * Called when the session starts.
 */
exports.onSessionStarted = function (sessionStartedRequest, session) {
  // Execute the following to initiate a new user session
  session.attributes = helpers.setSessionValue(session, 'nameSet', false);
  session.attributes = helpers.setSessionValue(session, 'addressSet', false);
  session.attributes = helpers.setSessionValue(session, 'recentIntent', null);
  session.attributes = helpers.setSessionValue(session, 'recentIntentSuccessful', false);
  session.attributes = helpers.setSessionValue(session, 'previousIntent', null);
  session.attributes = helpers.setSessionValue(session, 'foundProvider', false);
  session.attributes = helpers.setSessionValue(session, 'foundPlans', false);

  logger.info('Successfully initialized the session');
  logger.debug('The values of the session after being initialized', session.attributes);

  return session;
};

