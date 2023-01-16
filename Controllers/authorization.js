const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var AWS = require("aws-sdk");
var jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');


exports.refresh_token = (req, res) => {
    var refresh_Token = req.body.refreshToken;
    var params = {
        AuthFlow: "REFRESH_TOKEN_AUTH", /* required */
        ClientId: process.env.CLIENT_ID, /* required */
        AuthParameters: {
          'REFRESH_TOKEN': refresh_Token,
        }
      };
      var cognito = new AWS.CognitoIdentityServiceProvider();
      cognito.initiateAuth(params, function(err, data) {
        if (err){
            res.status(400).send(err)
            return
        }
        else {
            res.send(data);
        }
    });
}

exports.get_presigned_url = (req, res) => {

    res.status(200).send("ok")
}