const {pool}  = require("../database");

var jwk = {"keys":[{"alg":"RS256","e":"AQAB","kid":"UvcC6JDyoJX8f+qfhnnFDHB7xCQqdQksmO5Pq/ZS/SQ=","kty":"RSA","n":"tOb4ZNU6xWicp2zjSTw9yQejF3kSXK6dIdMIcHxfoli4cdfAVPfyorx7vxGv-eTyWWhviVQeGPjrwE59_c_8JLOQCv5nX6EGAOKOxRIWyxWyQqEtkX3KbECHSrIGlcxNNF2wzJWvZsNz1bWn4VnQbemztnRW9-V77CzMvvisG8WPtFgh48Q1dH1iZDRpZDEbTys43h2oscJO8TO5327kqawr7GliPx7C1Lh1ZWkGyKni6ENcC_MzgJu8BmD8vAeqQfFcW9QXINiztIa1OaAh6EqtolmAvm6mtKvQmJdyGC6_Fa6sGwwhs7vw1VkSyyDsnCkjub-eouK0-EaY2MTzxQ","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"VOr/TocPJSxiAbjQwCMNXaOlvpmqI1FFpoBLaYDz0XA=","kty":"RSA","n":"uCbFOkQH6jxoShB-gV_w_uoAwBUAn9DqQwrxgrKg2piO3r2oN9rP0ooh6NH9zOm2G2NnLLe8QTl9Eu65KkZ09Wwt7-RRADIDquMAE-g8TKWwmAlyCtcY6w96tskWk05K_LEY6zyPpRskT5Vg_dv6D3pn1fbQFavMRX-fdGyYJ0dsRWYskOQuqY9bfNKJGVI2vYKozD_eH4uyJjW_KQ_0GM_CePi8WokAq53Ivs71-CpNxiECK4p8j4NWHoKidTVGgCp-igHIpOryi_gS9P3KDSTwqjGpNEwtR6BoEvqLUEBk2Z1ff7pHiD_ZbTi0U1ZneORSSX7Urz5YH2Jl-4SaTQ","use":"sig"}]}
var jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');

exports.general_search = (req, res) => {
    var input = req.query.input;
    var inputArray = input.split(" ");

    var pagesize = req.params.pagesize;
    var pagenum = req.params.pagenum -1;

    if(pagesize < 0 || pagenum < 0){
        res.status(404).send("Not found, wrong pagesize or pagenum");
        return;
    }

    if(!input){
        res.status(400).send("empty query");
        return;
    }

    var query = "SELECT * FROM `Products` WHERE";
    var pagination = "LIMIT " + pagesize + " OFFSET " + pagenum * pagesize;

    for (var i =0; i< inputArray.length; i++){
        if(i > 0){
            query += " or";
        }
        var subquery = " title like '%"+ inputArray[i] +"%' or colors like '%"+ inputArray[i] +"%' or descriptions like '%"+ inputArray[i] +"%'";
        query += subquery;
    }
    query += pagination;

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
            res.send(rows)
            conn.release();
        })
    })
}

exports.filter_products = (req, res) =>{

    var priceFrom = req.query.price_from;
    var priceTo = req.query.price_to;
    var starsFrom = req.query.stars_from;
    var color = req.query.color;
    var size = req.query.size;
    var brand = req.query.brand;
    var category = req.query.category;

    var pagesize = req.params.pagesize;
    var pagenum = req.params.pagenum -1;

    if(pagesize < 0 || pagenum < 0){
        res.status(404).send("Not found, wrong pagesize or pagenum");
        return
    }

    if(Object.keys(req.query).length == 0){
        res.status(400).send("Missing queries")
        return
    }

    var pagination = "LIMIT " + pagesize + " OFFSET " + pagenum * pagesize;

    var hasQueries = false;
    var conditions = '';

    if((priceFrom != undefined && priceFrom != '' ) || (priceTo != undefined && priceTo != '' )){
        if(hasQueries){
            conditions += "and ";
        }
        conditions += "price >= "+ priceFrom + " and price <= "+ priceTo + " ";
        hasQueries = true;
    }

    if(color != undefined && color != ''){
        if(hasQueries){
            conditions += "and ";
        }
        conditions += "color like '%"+ color +"%' ";
        hasQueries = true;
    }

    if(starsFrom != undefined && starsFrom != ''){
        if(hasQueries){
            conditions += "and ";
        }
        conditions += "stars <= " + starsFrom + " ";
        hasQueries = true;
    }

    if(brand != undefined && brand != ''){
        if(hasQueries){
            conditions += "and ";
        }
        conditions += "brand like '%"+ brand +"%' ";
        hasQueries = true;
    }

    if(size != undefined && size != ''){
        if(hasQueries){
            conditions += "and ";
        }
        conditions += "size like '%"+ size +"%' ";
    }
    if(category != undefined && category != ''){
        if(hasQueries){
            conditions += "and ";
        }
        conditions += "category like '%"+ category +"%' ";
    }
    
    var query = "SELECT * FROM `Products`"
    if(conditions != ''){
        query += " WHERE " + conditions + " "+ pagination;
        console.log(query);
        pool.getConnection(function(err, conn){
                if(err){
                    res.status(400).send("can't connect to the database")
                    return
                }
                conn.query(query, function(err, rows) {
                    if(err){
                        res.send(err["sqlMessage"])
                        return
                    }
                     res.send(rows);
                     conn.release();
                })
            })
            
        return
    }else{
        res.status(400).send("wrong query")
        return
    }
};

exports.get_allproducts = (req, res) =>{
    var pagesize = req.params.pagesize;
    var pagenum = req.params.pagenum -1;

    var query = "SELECT * FROM `Products`";
    var pagination = "LIMIT " + pagesize + " OFFSET " + pagenum * pagesize;
    query += pagination;

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
            res.send(rows)
            conn.release();
        })
    })
}

exports.get_all_image_from_product = (req, res) =>{
    var product_id = req.query.product_id;
    var query = "SELECT * FROM `Images` WHERE product_id = " + product_id;

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
            res.send(rows)
            conn.release();
        })
    })
}

exports.add_product_to_favorite = (req, res) => {
    var accessToken = req.body.accessToken;
    var product_id = req.body.product_id;

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send("Invalid Token")
            return
        }

        var query = "SELECT * FROM `Favorite` WHERE id = " + product_id;
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
                if(rows.length == 0){

                    var query = "SELECT * FROM `Users` WHERE username = '" + decoded.username +"'";
                    conn.query(query, function(err, rows) {
                        if(err){
                            res.status(400).send(err["sqlMessage"])
                            return
                        }
                        var userId = rows[0].Id;
                        var data = {
                            user_id: userId,
                            product_id: product_id
                        }

                            var query = "INSERT INTO `Favorite` SET ?"
                            conn.query(query,[data], function(err, rows) {
                                if(err){
                                    res.status(400).send(err["sqlMessage"])
                                    return
                                }
                                res.send(rows);
                                
                            })

                    })

                }else{
                    res.status.send("Already favorite")
                }
                
            })
        })
    })
}

exports.get_all_user_favorite = (req, res) =>{
    var accessToken = req.query.accessToken;

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
                var userId = rows[0].Id;
                var query = "SELECT * FROM `Favorite` WHERE user_id = " + userId;
                conn.query(query, function(err, rows) {
                    if(err){
                        res.status(400).send(err["sqlMessage"])
                        return
                    }

                    if(rows == 0){
                        res.status(404).send("Empty favorite");
                        return;
                    }

                    var ids = "";
                    for(var i = 0; i < rows.length; i++){
                        if(i == 0){
                            ids += rows[i].product_id;
                        }else{
                            ids += ","+rows[i].product_id;
                        }
                    }

                    var query = "SELECT * FROM `Products` WHERE Id in (" + ids + ")";

                    conn.query(query, function(err, rows) {
                        if(err){
                            res.status(400).send(err["sqlMessage"])
                            return
                        }
    
                        
                        res.send(rows)
                        conn.release();
                    })
                })
            })
        })
    })
}

exports.delete_favorite = (req, res) =>{
    var accessToken = req.body.accessToken;
    var product_id = req.body.product_id;

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
                var userId = rows[0].Id;
                
                var query = "DELETE FROM `Favorite` WHERE product_id = " + product_id + " and user_id = " + userId;
                conn.query(query, function(err, rows) {
                    if(err){
                        res.status(400).send(err["sqlMessage"])
                        return
                    }
                    res.send(rows);
                    conn.release();
                    
                })

            })
        })
    })
}
