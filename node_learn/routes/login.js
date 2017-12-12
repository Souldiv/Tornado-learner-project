var express = require('express');
var router = express.Router();
auth = require('../models/auth');
var bcrypt = require('bcrypt');

router.get('/', function(req,res,next){
    if(!req.session.UserID) res.render("login");
    else res.redirect('/search');
});

router.post('/', function(req, res, next){
    var username = req.body.user;
    var password = req.body.pass;
    console.log(req.body);
    auth.getCreds(username, function(err, creds){
        console.log(1);
        if(err) next(err);
        if(creds.length !== 0) {
            bcrypt.hash(password, creds[0].salt, function (err, hashed) {
                console.log(hashed);
                console.log(creds[0].password);
                if (hashed === creds[0].password) {
                    req.session.UserID = creds[0]._id;
                    console.log(req.session.UserID);
                    res.locals.UserID = req.session.UserID;
                    res.redirect('/search');
                    // console.log(req.locals.UserID);
                }
                else {
                    req.session.FlashMessage = "Please check your username/password and try again.";
                    res.redirect('/login');
                }
            });
        }
        else{
            req.session.FlashMessage = "Invalid Credentials!";
            console.log(req.session.FlashMessage);
            res.redirect('/login');
        }
    });
});
module.exports = router;