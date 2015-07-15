'use strict';

var cfg = require('config');

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

//logger.add(winston.transports.File, { filename: "../logs/production.log" });
var logConfig = cfg.get('logging');

logger.remove(logger.transports.Console);
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
	console.log(consoleOptions);
	logger.add(logger.transports.Console, consoleOptions);
}

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
	console.log(fileOptions);
	logger.add(logger.transports.File, fileOptions);
}

/*var consoleOptions = {};
logger.level = logConfig.console.logLevel;
logger.colorize = logConfig.colorize;
logger.json = logConfig.json;
logger.stringify = logConfig.stringify;
logger.prettyPrint = logConfig.prettyPrint;
logger.depth = logConfig.depth;
logger.humanReadableUnhandledException = logConfig.humanReadableUnhandledException;
logger.showLevel = logConfig.showLevel;
*/
module.exports=logger;