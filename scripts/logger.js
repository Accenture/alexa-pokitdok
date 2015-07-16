'use strict';

var cfg = require('config');
var util = require('util');

var winston = require('winston');

/* jshint ignore:start */
var logger = new (winston.Logger)();
/* jshint ignore:end */

// Initialize internal variables for keeping track of the session
logger.event = {};

function safeGet(obj, path) {
  var pathArr = path.split('.');
  var curObj = obj;

  for (var i = 0, len = pathArr.length; i < len; i++) {
    curObj = curObj[pathArr[i]];
    if(typeof curObj === 'undefined' || !curObj){
      return 'unknown';
    }
  }
  return curObj;
}

// Replace winston's default log() function with our own in order to rewrite the
// contents of all log statements. 
logger.log = function(){
  var args = arguments;
  var msg = args[1];

  // Capture the following variables to be included in all log statements
  var sessionId = safeGet(this.event, 'session.sessionId');
  var requestType = safeGet(this.event, 'request.type');
  var intentName = safeGet(this.event, 'request.intent.name');
  var userId = safeGet(this.event, 'session.user.userId');

  // Apply the variables to the log statements
  var msgFormat = 'sessionId="%s", requestType="%s", intentName="%s", userId="%s", message="%s"';
  msg = util.format(msgFormat, sessionId, requestType, intentName, userId, msg);

  args[1] = msg;

  // Make sure to call the base log function
  winston.Logger.prototype.log.apply(this,args);
};

// Get the log configuration from our app configuration file ('./config/NODE_ENV.json')
var logConfig = cfg.get('logging');

// Add a console logger if it is enabled
if(logConfig.console.enabled) {
	var consoleOptions = {
		level: logConfig.console.logLevel,
		colorize: logConfig.console.colorize,
		json: logConfig.console.json,
		stringify: logConfig.console.stringify,
		prettyPrint: logConfig.console.prettyPrint,
		depth: logConfig.console.depth,
		humanReadableUnhandledException:  logConfig.console.humanReadableUnhandledException,
		showLevel: logConfig.console.showLevel
	};

	logger.add(winston.transports.Console, consoleOptions);
}

// Add a file logger if it is enabled
if(logConfig.file.enabled) {
	var fileOptions = {
		filename: logConfig.file.filename,
    level: logConfig.file.logLevel,
    silent: logConfig.file.silent,
    colorize: logConfig.file.colorize,
    timestamp: logConfig.file.timestamp,
    maxsize: logConfig.file.maxsize,
    json: logConfig.file.json,
    prettyPrint: logConfig.file.prettyPrint,
    depth: logConfig.file.depth,
    logstash: logConfig.file.logstash,
    tailable: logConfig.file.tailable,
    showLevel: logConfig.file.showLevel
	};

	logger.add(winston.transports.File, fileOptions);
}

module.exports=logger;