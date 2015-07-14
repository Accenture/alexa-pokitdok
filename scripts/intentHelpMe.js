'use strict';

var startSession = require('./sessionStart.js');

exports.executeIntent = function (intent, session, callback) {
	startSession.onLaunch(intent, session, callback);
};