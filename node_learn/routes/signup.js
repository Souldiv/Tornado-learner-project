var express = require('express');
var router = express.Router();
details = require('../models/signup');
auth = require('../models/auth');

router.get('/', function(req,res,next){
    res.render('signup');
});

router.post('/', function(req,res,next) {
    var userAuth = {
        username: req.body.email,
        password: req.body.pass,
        salt: 'something'
    };

    var userDetails = {
        username: req.body.email,
        fname: req.body.fname,
        lname: req.body.lname
    };

    var flag = false;
    auth.getCreds(userAuth.username, function (err, credentials) {
        if (err) {
           return next(err);
        }

        if (credentials.length !== 0) {
            req.session.FlashMessage = "Username already exists!";
            res.redirect('/signup');
        }
        else {
            auth.addCreds(userAuth, function (err, result) {
                if (err) return next(err);
                console.log(result);
                flag = true;
                details.AddDetails(userDetails, function (errr, results) {
                    console.log(userDetails);
                    if (errr) return next(errr);
                    else {
                        console.log(results);
                        req.session.UserID = results._id;
                        res.redirect('/');
                        console.log(res.locals.UserID);
                    }
                });
            });
        }
    });
});
module.exports = router;
