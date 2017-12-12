var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var authSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    salt:{
        type: String,
        required: true
    }
});

authSchema.pre('save', function(next){
    var user = this;
    console.log("here1");
    bcrypt.genSalt(12, function(err, salt) {
        if(err) return next(err);
        console.log("i am here");
        user.salt = salt;
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

var auth = module.exports = mongoose.model('auth', authSchema);

module.exports.getCreds = function(username, callback){
    auth.find({username: username}, callback);
};

module.exports.addCreds = function(creds, callback){
    auth.create(creds, callback);
};

