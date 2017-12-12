var express = require('express');
var router = express.Router();

router.get('/', function(req,res,next){
    if(!req.session.UserID){
        res.render("login");
    }
    else {
        res.render("search");
    }
});
module.exports = router;