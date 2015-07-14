'use strict';

// Setup test libraries
var chai = require('chai');
var should = require('chai').should();
chai.config.showDiff = true; 

// Setup shared lambda testing context
var context = require('./context.js');
var lambda = require('../index.js');

describe('Find Providers', function() {

	// Populate the JSON event that will be sent from Alexa to AWS Lambda
	var eventData = {
	  'version': '1.0',
	  'session': {
	    'new': false,
	    'application': {
	      'applicationId': 'amzn1.echo-sdk-ams.app.alexa-pokitdok-test'
	    },
	    'sessionId': 'session1234',
	    'attributes': { 
	    	'username':'Michael Klein'
	    },
	    'user': {
	      'userId': null
	    }
	  },
	  'request': {
	    'type': 'IntentRequest',
	    'requestId': 'request5678',
	    'intent': {
	      'name': 'FindProvider',
	      'slots': {
	        'address': {
	          'name': 'address',
	          'value': '1201 Fannin St'
	        },
	        'city': {
	          'name': 'city',
	          'value': 'Houston'
	        },
	        'state': {
	          'name': 'state',
	          'value': 'Texas'
	        },
	        'radius': {
	          'name': 'radius',
	          'value': '1'
	        },
	        'specialty': {
	          'name': 'specialty',
	          'value': 'rheumatology'
	        },
	        'zipcode': {
	          'name': 'zipcode',
	          'value': '77002'
	        }
	      }
	    }
	  }
	};

	describe('request#', function() {

		it('should invoke the lamba function', function(done){

			//Set async test timeout - Needs enough time for Pokitdoc and geocoder to return a response
			this.timeout(7000);

			// This is the async callback that will be called upon success
			var success = function (result) {

				describe('Find Providers', function() {
					describe('#response-Success', function() {

						it('shoud return output speech text', function () {
							result.response.outputSpeech.should.have.property('text').to.have.length.of.at.least(10);
						});

						it('should say back the name given in the request', function() {
							result.response.outputSpeech.text.should.contain(eventData.request.intent.slots.name.value);
						});

						it('should have output speech type of \'PlainText\'', function () {
							result.response.outputSpeech.type.should.equal('PlainText');
						});

						it('shoud return reprompt output speech text', function () {
							result.response.reprompt.outputSpeech.should.have.property('text').to.have.length.of.at.least(10);
						});

						it('should have reprompt output speech type of \'PlainText\'', function () {
							result.response.reprompt.outputSpeech.type.should.equal('PlainText');
						});

						it('should not end the session', function() {
							result.response.shouldEndSession.should.equal(false);
						});

						it('should have card type of \'Simple\'', function () {
							result.response.card.type.should.equal('Simple');
						});

						it('should have card title', function () {
							result.response.card.should.have.property('title').to.have.length.of.at.least(3);
						});

						it('should have card content', function () {
							result.response.card.should.have.property('content').to.have.length.of.at.least(10);
						});

						done();

					});
				});
			};

			// This is the async callback that will be called upon failure
			var failure = function (error) {

				describe('Find Providers', function() {
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
