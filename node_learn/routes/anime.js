var express = require('express');
var router = express.Router();
var MAL = require('mal-scraper');

router.get('/', function(req,res,next){
    if(req.session.UserID) {
        if (req.query.search) {
            var username = req.query.search;
            MAL.getWatchListFromUser(username
            ).then(function (info) {
                res.render("anime", {data: info})
            }).catch(function (err) {
                next(err)
            });
        }
    }
    else{
        res.redirect('/login');
        }
});

module.exports = router;