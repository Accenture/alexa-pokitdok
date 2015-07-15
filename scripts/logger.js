'use strict';

var cfg = require('config');

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Get the log configuration from our app configuration file ('./config/NODE_ENV.json')
var logConfig = cfg.get('logging');

// Remove the default console logger
logger.remove(logger.transports.Console);

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

	logger.add(logger.transports.Console, consoleOptions);
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

	logger.add(logger.transports.File, fileOptions);
}

module.exports=logger;