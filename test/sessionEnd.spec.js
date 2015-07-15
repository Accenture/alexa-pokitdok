'use strict';

/* jshint ignore:start */
var logger = require('winston');
/* jshint ignore:end */

// Setup test libraries
var chai = require('chai');
var should = require('chai').should();
chai.config.showDiff = true; 

// Setup shared lambda testing context
var context = require('./context.js');
var lambda = require('../index.js');

describe('Session End', function() {

	// Populate the JSON event that will be sent from Alexa to AWS Lambda
	var eventData = {
	  'version': '1.0',
	  'session': {
	    'new': false,
	    'application': {
	      'applicationId': 'amzn1.echo-sdk-ams.app.alexa-pokitdok-test'
	    },
	    'sessionId': 'session1234',
	    'attributes': {},
	    'user': {
	      'userId': null
	    }
	  },
	  'request': {
	    'type': 'SessionEndedRequest',
	    'requestId': 'request5678'
	  }
	};

	describe('#request', function() {
		
		it('should invoke the lambda function', function(done){

			// This is the async callback that will be called upon success
			var success = function (result) {
				describe('Session End', function() {
					describe('#response-Success', function() {
						it('shoud not return an error or results', function () {
							should.not.exist(result);
						});

						done();
					});
				});
			};

			// This is the async callback that will be called upon failure
			var failure = function (error) {
				describe('Session End', function() {
					describe('#response-Error', function() {
						it('shoud not return an error', function () {
							should.not.exist(error);
						});

						done();
					});
				});
			};

			// Build the context that will be created by Alexa and sent in the request to the lambda function
			var ctx = context.buildContext(success, failure);

			// Call our lambda function with the Alexa event and the Alexa context
			lambda.handler(eventData, ctx);

		});

	});

});
