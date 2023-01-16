const path = require('path'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var AWS = require("aws-sdk");
var jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');


var jwk = {"keys":[{"alg":"RS256","e":"AQAB","kid":"UvcC6JDyoJX8f+qfhnnFDHB7xCQqdQksmO5Pq/ZS/SQ=","kty":"RSA","n":"tOb4ZNU6xWicp2zjSTw9yQejF3kSXK6dIdMIcHxfoli4cdfAVPfyorx7vxGv-eTyWWhviVQeGPjrwE59_c_8JLOQCv5nX6EGAOKOxRIWyxWyQqEtkX3KbECHSrIGlcxNNF2wzJWvZsNz1bWn4VnQbemztnRW9-V77CzMvvisG8WPtFgh48Q1dH1iZDRpZDEbTys43h2oscJO8TO5327kqawr7GliPx7C1Lh1ZWkGyKni6ENcC_MzgJu8BmD8vAeqQfFcW9QXINiztIa1OaAh6EqtolmAvm6mtKvQmJdyGC6_Fa6sGwwhs7vw1VkSyyDsnCkjub-eouK0-EaY2MTzxQ","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"VOr/TocPJSxiAbjQwCMNXaOlvpmqI1FFpoBLaYDz0XA=","kty":"RSA","n":"uCbFOkQH6jxoShB-gV_w_uoAwBUAn9DqQwrxgrKg2piO3r2oN9rP0ooh6NH9zOm2G2NnLLe8QTl9Eu65KkZ09Wwt7-RRADIDquMAE-g8TKWwmAlyCtcY6w96tskWk05K_LEY6zyPpRskT5Vg_dv6D3pn1fbQFavMRX-fdGyYJ0dsRWYskOQuqY9bfNKJGVI2vYKozD_eH4uyJjW_KQ_0GM_CePi8WokAq53Ivs71-CpNxiECK4p8j4NWHoKidTVGgCp-igHIpOryi_gS9P3KDSTwqjGpNEwtR6BoEvqLUEBk2Z1ff7pHiD_ZbTi0U1ZneORSSX7Urz5YH2Jl-4SaTQ","use":"sig"}]}

exports.confirm_email = (req, res) => {
    var confirmCode = req.body.confirm_code;
    var username = req.body.username;

    var poolData = {
        UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
        ClientId: process.env.CLIENT_ID, // Your client id here
    };
    
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: username,
        Pool: userPool,
    };
    
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(confirmCode, true, function(err, result) {
        if (err) {
            //console.log(err.message || JSON.stringify(err));
            res.status(400).send(err)
            return;
        }
        console.log('call result: ' + result);
        res.send("Confirm successfully")
    });
}

exports.register = (req, res) => {
    var email = req.body.email;
    var phone_number = req.body.phone_number;
    var birthdate = req.body.birthdate;
    var gender = req.body.gender;
    var username = req.body.username;
    var password = req.body.password;
    var user_role = req.body.user_role;

    var poolData = {
        UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
        ClientId: process.env.CLIENT_ID, // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    var attributeList = [];
    
    var dataEmail = {
        Name: 'email',
        Value: email,
    };
    
    var dataPhoneNumber = {
        Name: 'phone_number',
        Value: phone_number,
    };
    var dataBirth = {
        Name: 'birthdate',
        Value: birthdate,
    }
    var dataGender = {
        Name: 'gender',
        Value: gender,
    }

    var dataUserRole = {
        Name: 'custom:user_role',
        Value: user_role,
    }
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributePhoneNumber = new AmazonCognitoIdentity.CognitoUserAttribute(
        dataPhoneNumber
    );
    var attributeBirth = new AmazonCognitoIdentity.CognitoUserAttribute(dataBirth);
    var attributeGender = new AmazonCognitoIdentity.CognitoUserAttribute(dataGender);
    var attributeUserRole = new AmazonCognitoIdentity.CognitoUserAttribute(dataUserRole);
    
    attributeList.push(attributeEmail);
    attributeList.push(attributePhoneNumber);
    attributeList.push(attributeBirth);
    attributeList.push(attributeGender);
    attributeList.push(attributeUserRole);

    userPool.signUp(username, password, attributeList, null, function(err,result){
        if (err) {
            res.status(400).send(err.message || JSON.stringify(err))
            return
        }
        var cognitoUser = result.user;
        res.send("Register successfully username: "+cognitoUser.getUsername());
    });
}

exports.login = (req, res) => {
    var username = req.body.username;
    var password = req.body.password;

    var authenticationData = {
        Username: username,
        Password: password,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(
        authenticationData
    );
    var poolData = {
        UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
        ClientId: process.env.CLIENT_ID, // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username: username,
        Pool: userPool,
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function(result) {
            var accessToken = result.getAccessToken().getJwtToken();
            var refreshToken = result.getRefreshToken();
            var idToken = result.getIdToken().getJwtToken();
            
            AWS.config.region = 'ap-southeast-1';
    
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: process.env.IDENTITY_POOL_ID, // your identity pool id here
                Logins: {
                    'cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Fs7IcH1kr': result
                        .getIdToken()
                        .getJwtToken(),
                },
            });
    
            //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
            AWS.config.credentials.refresh(error => {
                if (error) {
                    console.error(error);
                } else {
                    var respond = {
                        accessToken: accessToken,
                        idToken: idToken,
                        refreshToken: refreshToken
                    }
                    res.send(respond)
                }
            });
        },
    
        onFailure: function(err) {
            res.status(400).send(err.message || JSON.stringify(err));
            return;
        },
    });
}

exports.signout = (req, res) => {
    var accessToken = req.body.accessToken;

    var poolData = {
        UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
        ClientId: process.env.CLIENT_ID, // Your client id here
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    var accessToken = req.body.accessToken;

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send(err);
            return
        }

        var userData = {
            Username: decoded.username,
            Pool: userPool,
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.getSession((err, result) =>{
            if(result){
                cognitoUser.globalSignOut({
                    onSuccess: function(result){
                        res.send(result)
                    },
                    onFailure: function(err){
                        res.status(400).send(err)
                        return
                    },
                });
            }else{
                res.status(400).send("Already signed out");
                return
            }
        })
    })
}

