//require('dotenv').config({ path: path.join(__dirname, '.env') });
var express = require('express');
var bodyParser = require('body-parser')

const accessRouter = require('./Routers/access')
const general = require('./Routers/general')
const user = require('./Routers/user')
const order = require('./Routers/transtraction');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname));

app.use('/', accessRouter);
app.use('/', general);
app.use('/', user);
app.use('/', order);
/*
app.get("/products", (req, res) => {



    var searchAllProduct = "SELECT * FROM Products";
    pool.getConnection(function(err, conn){
        if(err){
            res.status(400).send("can't connect to the database")
            return
        }
        conn.query(searchAllProduct, function(err, rows) {
            if(err){
                res.status(400).send(err["sqlMessage"])
                return
            }
            res.send(rows)
            conn.release();
        })
    })
})
*/




var server = app.listen(3000, ()=>{
    console.log('running on: ', server.address().port)
})