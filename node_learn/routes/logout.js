var express = require('express');
var router = express.Router();

router.get('/', function(req,res,next){
    console.log(req.session.UserID);
    if(req.session.UserID){
        console.log(req.session.id + ' ' +req.session.UserID );
        req.session.destroy();
        res.redirect('/');
    }
    else{
        console.log("not logged in");
        res.redirect('/');
    }
});

module.exports = router;