const {pool}  = require("../database");

const {Duplex} = require('stream'); 

var fs = require('fs');

var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var AWS = require("aws-sdk");
var jwk = {"keys":[{"alg":"RS256","e":"AQAB","kid":"UvcC6JDyoJX8f+qfhnnFDHB7xCQqdQksmO5Pq/ZS/SQ=","kty":"RSA","n":"tOb4ZNU6xWicp2zjSTw9yQejF3kSXK6dIdMIcHxfoli4cdfAVPfyorx7vxGv-eTyWWhviVQeGPjrwE59_c_8JLOQCv5nX6EGAOKOxRIWyxWyQqEtkX3KbECHSrIGlcxNNF2wzJWvZsNz1bWn4VnQbemztnRW9-V77CzMvvisG8WPtFgh48Q1dH1iZDRpZDEbTys43h2oscJO8TO5327kqawr7GliPx7C1Lh1ZWkGyKni6ENcC_MzgJu8BmD8vAeqQfFcW9QXINiztIa1OaAh6EqtolmAvm6mtKvQmJdyGC6_Fa6sGwwhs7vw1VkSyyDsnCkjub-eouK0-EaY2MTzxQ","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"VOr/TocPJSxiAbjQwCMNXaOlvpmqI1FFpoBLaYDz0XA=","kty":"RSA","n":"uCbFOkQH6jxoShB-gV_w_uoAwBUAn9DqQwrxgrKg2piO3r2oN9rP0ooh6NH9zOm2G2NnLLe8QTl9Eu65KkZ09Wwt7-RRADIDquMAE-g8TKWwmAlyCtcY6w96tskWk05K_LEY6zyPpRskT5Vg_dv6D3pn1fbQFavMRX-fdGyYJ0dsRWYskOQuqY9bfNKJGVI2vYKozD_eH4uyJjW_KQ_0GM_CePi8WokAq53Ivs71-CpNxiECK4p8j4NWHoKidTVGgCp-igHIpOryi_gS9P3KDSTwqjGpNEwtR6BoEvqLUEBk2Z1ff7pHiD_ZbTi0U1ZneORSSX7Urz5YH2Jl-4SaTQ","use":"sig"}]}
var jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');

const multer = require('multer');
var storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const multerupload =  upload.fields([{name: "images", maxCount: 4}]);

function bufferToStream(myBuffer) {
    let tmp = new Duplex();
    tmp.push(myBuffer);
    tmp.push(null);
    return tmp;
}

exports.put_products = (req,res) => {

    multerupload(req, res, function(error){
        if(error instanceof multer.MulterError){
            console.log("okayasdadsadsa")
            res.status(404).send('Sorry, something wrong');
        }else{
            const files = [];
            const filesName = [];
            for(var i =0; i< req.files['images'].length; i++){
                files[i] = bufferToStream(req.files['images'][i].buffer);
                filesName[i] = req.files['images'][i].originalname;
            }

            var accessToken = req.body.accessToken;
            var category = req.body.category;
            var title = req.body.title;
            var price = req.body.price;
            var colors = req.body.colors;
            var sizes = req.body.sizes;
            var description = req.body.description;
            var brand = req.body.brand;
            var quantity = req.body.quantity

            
            var pem = jwkToPem(jwk.keys[1]);
            jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
                if(err){
                    res.status(400).send("Invalid Token")
                    return
                }


                var poolData = {
                    UserPoolId: process.env.USER_POOL_ID, // Your user pool id here
                    ClientId: process.env.CLIENT_ID, // Your client id here
                };
                var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
                
                var userData = {
                    Username: decoded.username,
                    Pool: userPool,
                };
                var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
            

                cognitoUser.getSession((err, result) =>{
                    if(result){
                        AWS.config.region = 'ap-southeast-1';
        
                        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                            IdentityPoolId: process.env.IDENTITY_POOL_ID, // your identity pool id here
                            Logins: {
                                // Change the key below according to the specific region your user pool is in.
                                'cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_Fs7IcH1kr': result
                                    .getIdToken()
                                    .getJwtToken(),
                            },
                        });
            
                        AWS.config.credentials.refresh(error => {
                            if (error) {
                                console.error(error);
                            } else {
                                var s3 = new AWS.S3();

                               for(var i =0; i < files.length; i++){
                                    const params = {
                                        Bucket: 'androidecommercebucket', 
                                        Key: filesName[i] + ".png",
                                        Body: files[i]
                                    };
                                    s3.upload(params, function(err, data) {
                                        if (err) {
                                            res.status(400).send("Can't upload")
                                            return;
                                        }
                                        console.log(`File uploaded successfully at ${data.Location}`)
                                        return
                                    });
                               }
                            }
                        });
                    }else{
                        res.status(400).send(err)
                        return
                    }
                })


                var query = "SELECT * FROM `Users` WHERE username = '" + decoded.username +"'";
                pool.getConnection(function(err, conn){
                    if(err){
                        res.status(400).send("can't connect to the database")
                        return
                    }
                    conn.query(query, function(err, rows) {
                        if(err){
                            res.status(400).send(err["sqlMessage"])
                            return
                        }
                        var sellerId = rows[0].Id;

                        var data = {
                            seller_id: sellerId,
                            category: category,
                            title: title,
                            price: price,
                            colors: colors,
                            sizes: sizes,
                            descriptions: description,
                            stars: 0,
                            brand: brand,
                            thumbnail: filesName[0] + ".png",
                            quantity: quantity
                        }

                        
                        var query = "INSERT INTO `Products` SET ?"
                            conn.query(query,[data], function(err, rows) {
                                if(err){
                                    res.send(err["sqlMessage"])
                                    return
                                }
                                
                                var productId = rows.insertId;

                                var imageArray = [];
                                for(var i = 0; i < filesName.length; i++){
                                    var imageInfor = {
                                        product_id: productId,
                                        link: filesName[i] + ".png"
                                    }
                                    imageArray[i] = imageInfor
                                }

                                var query = "INSERT INTO `Images` ( product_id, link) VALUES ?"
                                conn.query(query,[imageArray.map(image => [image.product_id, image.link])], function(err, rows) {
                                    if(err){
                                        res.send(err["sqlMessage"])
                                        return
                                    }
                                    //res.send("what");
                                    conn.release();
                                    
                                })
                            })
                        
                    })
                })

                
            })
        }
    })
    

}

exports.update_order_status = (req, res) => {
    var accessToken = req.body.accessToken;
    var order_id = req.body.order_id;
    var order_status = req.body.order_status;

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send("Invalid Token")
            return
        }

        var query = "SELECT * FROM `Users` WHERE username = '" + decoded.username +"'";
        pool.getConnection(function(err, conn){
            if(err){
                res.status(400).send("can't connect to the database")
                return
            }
            conn.query(query, function(err, rows) {
                if(err){
                    res.status(400).send(err["sqlMessage"])
                    return
                }
                var sellerId = rows[0].Id;

                var query = "UPDATE `Orders` SET order_status = '"+ order_status + "' " + "WHERE id = " + order_id;
                conn.query(query, function(err, rows) {
                    if(err){
                        res.status(400).send(err["sqlMessage"])
                        return
                    }
                    res.status(200).send(rows);
                    conn.release();
    
                })

            })
        })

    })
}