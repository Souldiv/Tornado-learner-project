var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('poem', {roads: 'big', difference: 'made', made: 'origami', wood: 'burning' });
});

module.exports = router;
