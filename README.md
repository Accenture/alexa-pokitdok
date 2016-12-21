Amazon Echo PokitDok Demo
===================================
This is a demo implementation of an Amazon Alexa application deployed to Amazon's Lambda service which utilizes the [PokitDok](https://pokitdok.com/) API to return valuable information about health care services in your local area via the voice interface of your Amazon Echo.

Amazon provides a great deal of documentation on how to build Echo applications using their SDK. The following two articles were the primary ones referred to, but there are many more. 

*  [Alexa Skills Kit - Getting Started Guide](https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/getting-started-guide)
*  [Alexa Skills Kit - Developing an Alexa Skill as a Lambda function](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function)

PokitDoc's API is well documented and can be viewed after signing up for a free account at [platform.pokitdok.com](https://platform.pokitdok.com)

Prerequisites
--------------
*  An [Amazon Alexa](http://www.amazon.com/Amazon-SK705DI-Echo/dp/B00X4WHP5E) device
*  An Amazon AWS account with access to Amazon Lambda
*  An Amazon [developer account](https://developer.amazon.com/)
*  A PokitDoc [developer account](https://platform.pokitdok.com) with API keys and available credits


Setup Instructions
==================

Amazon Credentials
-------------------
In order to deploy the application to Amazon's Lambda service, you will need to store your credentials in your user's home directory. You can create your Amazon Access Keys within your AWS account by going [here](https://console.aws.amazon.com/iam/home?region=us-east-1#security_credential). 

Create the directory and file to store your credentials...

		$ mkdir ~/.aws
		$ cd ~/.aws
		$ touch credentials

Add the following to the 'credentials' file you created in the previous step

		[default]
		aws_access_key_id = <YOUR_ACCESS_KEY_ID>
		aws_secret_access_key = <YOUR_SECRET_ACCESS_KEY>

External API Credentials
--------------------
In order to communicate with PokitDok's and Google Geolocation API you will need API Keys. To populate your own keys, use the following steps:

		$ cd config/
		$ cp default.example.json default.json

Edit the default.json file in your favorite text edited and populate the API keys.

	  "pokitdok": {
	    "api": {
	      "clientId": "",				//Your PokitDok API client ID here
	      "clientSecret": "",		//Your PokitDok API client secret here
	      "apiVersion": "v4"
	    }
	  },
	  "google-geocoder" : {
	  	"api": {
	  		"key": ""							//Your Google geocoder API key here
	  	}
	  }

Test the Application Locally
----------------------------
You can test the application using the [mocha](http://mochajs.org/) testing framework with the [Chai](chaijs.com/) assertion framework. To test an individual Alexa intent you can do this directly using the mocha framework by using the following steps:

Ensure the mocha framework is installed globally on your machine...

		$ npm install mocha -g

Execute the specific Alexa intent you would like to run...

		$ mocha test/startSession.spec.js

If you would like to test all the application behaviors, the test suite can be executed from grunt using the following...

		$ grunt test


Deploy the Application to AWS Lambda
------------------------------------
First you will need to create the AWS Lambda function within the [AWS Console](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions). 

1. Click 'Create Lambda function'
2. Give your function a name and create a new 'Basic execute role' (leave everything else as defaults)
3. Click 'Create Lambda function'
4. Select your function name and click 'Actions' and choose 'Add Event Source'
5. Select 'Alexa Skills Kit' and click 'Submit'
6. Copy the ARN path to your new Lambda function. It should look like arn:aws:lambda:us-east-1:000000000000:function:myFunctionName

After the function is created in AWS, you need to update your Gruntfile.js with the deployment location. Find the following section in your Gruntfile.js and update the ARN path to your path.

    lambda_deploy: {
     default: {
       //Update deployment location here
       arn: 'arn:aws:lambda:us-east-1:00000000000:function:myFunctionName',
       options: {
	        timeout : 3,
	        memory: 128
        }
      }
    },

Now that you have the function created in AWS, and your local environment knows where to deploy the code to, you can deploy your package directly to AWS. This is a simple grunt task...

		$ grunt deploy

Create Alexa Skill and Point it to Lambda
-----------------------------------------
Your Node app hosted on AWS Lambda only provides the backend for your new Alexa skill. The front end for Alexa skills is of course speech, and that interface is defined through the Amazon developer portal. 

1. Login to the Amazon [developer portal](https://developer.amazon.com/)
2. Navigate to the 'Alexa' section
3. Click 'Add a New Skill'
4. Complete the forms following the instructions provided. 

A few notes on how to complete the forms...

*  **Endpoint**:  This will be the same ARN path you copied into your Gruntfile.js
*  **Intent Schema and Utterances**:  Samples are available in the repository 'skill/' folder
*  **Testing**:  You will need to ensure your Echo device is associated with the same Amazon account as utilized for your developer account. After you have saved your skill, you should be able to view the skill on your Echo iOS/Android application.