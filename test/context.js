'use strict';

exports.buildContext = function (success_callback, fail_callback) {
	return {
	    done: function (error, result) {
	    		console.log('error=' + error);
	        if (error === null) {
	            //this.succeed(result);
	        } else {
	            this.fail(error);
	        }
	    },
	    succeed: success_callback,
	    fail: fail_callback,
	    awsRequestId: 'LAMBDA_INVOKE',
	    logStreamName: 'LAMBDA_INVOKE',
	    clientContext: null,
	    identity: null
	};
};