'use strict';

module.exports = function (grunt) {
	  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

	grunt.initConfig({

		//Text application locally in Amazon AWS Lambda environment
    lambda_invoke: {
      default: {
        options: {
          handler: 'handler',
          file_name: 'index.js',
          event: 'event.json'
        }
      }
    },

		//Package for deployment to Amazon AWS Lambda
    lambda_package: {
      default: {
        options: {
          include_time: true,
          package_folder: './',
          dist_folder:  'dist'
        }
      }
    },

    //Deploy to Amazon AWS Lambda
    /*  Specify your AWS creditionals in ~/aws/credentials in the following format:
    		[default]
				aws_access_key_id = <YOUR_ACCESS_KEY_ID>
				aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>

				More Detail:  https://www.npmjs.com/package/grunt-aws-lambda
    */
    lambda_deploy: {
      default: {
        //Update deployment location here
        arn: 'arn:aws:lambda:us-east-1:651084418096:function:alexa-pokitdok',
        options: {
	        timeout : 3,
	        memory: 128
        }
      }
    },


    clean: {
      //Delete extra directories included in the Pokitdok package that are unnecessary and cause deployment errors
      pokitdok: ["node_modules/pokitdok-nodejs/.idea", "node_modules/pokitdok-nodejs/venv"]
    },


    copy: {
    	//Copy the start session event data to the event.json file for testing
      startSessionEvent: {
        files: [{
          src: ['test/events/startSession.json'],
          dest: 'event.json'
        }]
      },
      //Copy the intent request event data to the event.json file for testing
      sendIntentEvent: {
        files: [{
          src: ['test/events/sendIntent.json'],
          dest: 'event.json'
        }]
      },
      //Copy the end session event data to the event.json file for testing
      endSessionEvent: {
        files: [{
          src: ['test/events/endSession.json'],
          dest: 'event.json'
        }]
      },
    },


	  // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          'index.js',
          'scripts/{,*/}*.js',
        	'test/{,*/}*.js'
        ]
      }
    }

	});

  //Register grunt tasks
  //---------------------

	grunt.registerTask('start', [
		//'jshint',
		'copy:startSessionEvent',
		'lambda_invoke'
	]);

	grunt.registerTask('request', [
		//'jshint',
		'copy:sendIntentEvent',
		'lambda_invoke'
	]);

	grunt.registerTask('end', [
		//'jshint',
		'copy:endSessionEvent',
		'lambda_invoke'
	]);

  grunt.registerTask('test', [
    'start',
    'request',
    'end'
  ]);

	grunt.registerTask('build', [
    //'jshint',
    'clean:pokitdok',
		'lambda_package'
	]);

	grunt.registerTask('deploy', [
    'build',
		'lambda_deploy'
	]);

	grunt.registerTask('default', [
    'test'
  ]);

};