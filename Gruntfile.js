'use strict';

module.exports = function (grunt) {
	  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

	grunt.initConfig({

    //Test application locally in Amazon AWS Lambda environment
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

    // Tell grunt which files to watch for changes
    watch: {
      options: {
        spawn: false,
      },
      gruntfile: {
          files: 'Gruntfile.js',
          tasks: ['jshint:gruntfile']
      },
      config: {
        files: 'config/*.json',
        tasks: ['test']
      },
      src: {
          files: ['index.js', 'scripts/*.js'],
          tasks: ['test']
      },
      test: {
          files: '<%= jshint.test.src %>',
          tasks: ['test']
      }
    },

    // Define test configuration
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true,
          quiet: false
        },
        src: ['test/*.spec.js']
      },
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
	        timeout : 5,
	        memory: 128
        }
      }
    },

    copy: {
       // Copy the production configuration file, to the default config file, 
       // since AWS Lambda does not support environment variables, we must use default.json
      prodConfig: {
        files: [{
          src: ['config/production.json'],
          dest: 'config/default.json'
        }]
      },
       // Copy the dev configuration file, to the default config file, 
       // this is only necessary if you have not configured your local environment
       // variable to 'export NODE_ENV=dev'
      devConfig: {
        files: [{
          src: ['config/dev.json'],
          dest: 'config/default.json'
        }]
      },
       // Copy the example default configuration to the actual default config file. This
       // is useful only when you are starting out your project
      exampleConfig: {
        files: [{
          src: ['config/default.example.json'],
          dest: 'config/default.json'
        }]
      },
    },


    clean: {
      //Delete extra directories included in the Pokitdok package that are unnecessary and cause deployment errors
      pokitdok: ['node_modules/pokitdok-nodejs/.idea', 'node_modules/pokitdok-nodejs/venv']
    },


	  // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        options: {
          force: false,
          verbose: true
        },
        src: [
          'index.js',
          'Gruntfile.js',
          'scripts/{,*/}*.js',
          'test/{,*/}*.js'
        ]
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      test: {
        src: 'test/{,*/}*.js'
      }
    }

	});

  //Register grunt tasks
  //---------------------

  grunt.registerTask('test', [
    'jshint:all',
    'mochaTest'
  ]);

	grunt.registerTask('build', [
    'jshint:all',
    //'mochaTest',    // lambda_package does not execute successfully when unit tests are performed in the same build task
    'clean:pokitdok',
		'lambda_package'
	]);

	grunt.registerTask('deploy', [
    'build',
		'lambda_deploy'
	]);

	grunt.registerTask('default', [
    'test',
    'watch'
  ]);

};