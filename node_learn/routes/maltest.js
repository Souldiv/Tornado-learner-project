var express = require('express');
var router = express.Router();
var MAL = require('mal-scrape');
const client = new MAL();

router.get('/', function(req,res,next){
    // res.setHeader('content-type','application/json');
    client.topManga({limit: 0}).then(function(op){
        res.send(JSON.stringify(op[0],null,4));
    });
});

module.exports = router;