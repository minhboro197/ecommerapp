const {pool}  = require("../database");

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

    var input = req.query.title;
    var inputArray = input.split(" ");

    var title = req.query.title;
    var priceFrom = req.query.price_from;
    var priceTo = req.query.price_to;
    var starsFrom = req.query.stars_from;
    var color = req.query.color;
    var size = req.query.size;
    var brand = req.query.brand;

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

    if(!input){
        res.status(400).send("Must have title query");
        return;
    }

    var pagination = "LIMIT " + pagesize + " OFFSET " + pagenum * pagesize;

    var hasQueries = true;
    var conditions = '';

    for (var i =0; i< inputArray.length; i++){
        if(i > 0){
            conditions += " or";
        }
        var subquery = " title like '%"+ inputArray[i] +"%' or category like '%"+ inputArray[i] +"%' or colors like '%"+ inputArray[i] +"%' or brand like '%"+ inputArray[i] +"%' ";
        conditions += subquery;
    }

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
        //hasQueries = true;
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