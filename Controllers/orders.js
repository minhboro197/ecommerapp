const {pool}  = require("../database");
var jwk = {"keys":[{"alg":"RS256","e":"AQAB","kid":"UvcC6JDyoJX8f+qfhnnFDHB7xCQqdQksmO5Pq/ZS/SQ=","kty":"RSA","n":"tOb4ZNU6xWicp2zjSTw9yQejF3kSXK6dIdMIcHxfoli4cdfAVPfyorx7vxGv-eTyWWhviVQeGPjrwE59_c_8JLOQCv5nX6EGAOKOxRIWyxWyQqEtkX3KbECHSrIGlcxNNF2wzJWvZsNz1bWn4VnQbemztnRW9-V77CzMvvisG8WPtFgh48Q1dH1iZDRpZDEbTys43h2oscJO8TO5327kqawr7GliPx7C1Lh1ZWkGyKni6ENcC_MzgJu8BmD8vAeqQfFcW9QXINiztIa1OaAh6EqtolmAvm6mtKvQmJdyGC6_Fa6sGwwhs7vw1VkSyyDsnCkjub-eouK0-EaY2MTzxQ","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"VOr/TocPJSxiAbjQwCMNXaOlvpmqI1FFpoBLaYDz0XA=","kty":"RSA","n":"uCbFOkQH6jxoShB-gV_w_uoAwBUAn9DqQwrxgrKg2piO3r2oN9rP0ooh6NH9zOm2G2NnLLe8QTl9Eu65KkZ09Wwt7-RRADIDquMAE-g8TKWwmAlyCtcY6w96tskWk05K_LEY6zyPpRskT5Vg_dv6D3pn1fbQFavMRX-fdGyYJ0dsRWYskOQuqY9bfNKJGVI2vYKozD_eH4uyJjW_KQ_0GM_CePi8WokAq53Ivs71-CpNxiECK4p8j4NWHoKidTVGgCp-igHIpOryi_gS9P3KDSTwqjGpNEwtR6BoEvqLUEBk2Z1ff7pHiD_ZbTi0U1ZneORSSX7Urz5YH2Jl-4SaTQ","use":"sig"}]}
var jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');

exports.put_orders = (req, res) =>{
    var accessToken = req.body.accessToken;
    var total = req.body.total;
    var shipping_address = req.body.shipping_address;
    var items = req.body.items;
    order_status = "placed order";

    if(!accessToken || !total || !shipping_address){
        res.status(400).send("Error in request body")
    }

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send(err);
            return
        }

        var userId = "";
        var query = "SELECT * FROM `Users` WHERE username = '" + decoded.username +"'";
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
                        userId = rows[0].Id;

                        var data = {
                            user_id: userId,
                            total: total,
                            shipping_adress: shipping_address,
                            order_status: order_status
                        }
                    
                            var query = "INSERT INTO `Orders` SET ?"
                            conn.query(query,[data], function(err, rows) {
                                if(err){
                                    res.send(err["sqlMessage"])
                                    return
                                }
                                 //res.send(rows);
                                var orderId = rows.insertId;
                                var query = "INSERT INTO `Order_item` (order_id, product_id, quantity) VALUES ?"
                                conn.query(query,[items.map(item => [orderId, item.product_id, item.quantity])], function(err, rows) {
                                    if(err){
                                        res.send(err["sqlMessage"])
                                        return
                                    }
                                     res.status(200).send(rows);
                                     conn.release();
                                })
                            })
                        
                })
            })
        
    })
    


}

exports.get_orders = (req,res) => {
    var accessToken = req.query.accessToken;

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send(err);
            return
        }

        var userId = "";
        var query = "SELECT * FROM `Users` WHERE username = '" + decoded.username +"'";
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
                    userId = rows[0].Id;
                    
                    var query = "SELECT * FROM `Orders` WHERE user_id = '" + userId + "'";
                    conn.query(query, function(err, rows) {
                        if(err){
                            res.send(err["sqlMessage"])
                            return
                        }
   
                        res.status(200).send(rows);
                        conn.release();
                    })

                })
        })


    })
}

exports.get_orders_for_sellers = (req,res) =>{

    var accessToken = req.query.accessToken;

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send(err);
            return
        }

        var userId = "";
        var query = "SELECT * FROM `Users` WHERE username = '" + decoded.username +"'";
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
                    userId = rows[0].Id;

                    var query = "SELECT Orders.Id,Orders.shipping_adress, Orders.order_status, Orders.total, Users.username FROM Orders, Users WHERE Orders.Id in (SELECT order_id FROM Order_item WHERE product_id in (SELECT Id FROM Products WHERE seller_id = "+ userId +")) and Orders.user_id = Users.id ";
                    conn.query(query, function(err, rows) {
                        if(err){
                            res.send(err["sqlMessage"])
                            return
                        }
                        var buyerId = rows

                        res.status(200).send(rows);
                            conn.release();
                        
                    })

                })
            })

    })

}

exports.get_order_items = (req,res) => {
    var accessToken = req.body.accessToken;
    var orderId = req.body.order_id;

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send(err);
            return
        }

        pool.getConnection(function(err, conn){
            if(err){
                res.status(400).send("can't connect to the database")
                return
            }
            var query = "SELECT * FROM Order_item INNER JOIN Products ON Products.Id = Order_item.product_id WHERE order_id = " + orderId;
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
}

exports.get_order_items_for_sellers = (req,res) =>{
    var accessToken = req.query.accessToken;
    var order_id = req.query.order_id;

    var pem = jwkToPem(jwk.keys[1]);
    jwt.verify(accessToken, pem,{algorithms: ["RS256"]} , function(err, decoded) {
        if(err){
            res.status(400).send(err);
            return
        }


        var seller_Id = "";
        var query = "SELECT * FROM `Users` WHERE username = '" + decoded.username +"'";
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
                    seller_Id = rows[0].Id;


                    var query = "SELECT * FROM Products WHERE Id in (SELECT product_id FROM Order_item WHERE order_id = "+order_id+") and seller_id = " + seller_Id;

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

                })
        })

    })
}
