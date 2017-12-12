var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var signupSchema = new Schema({
    username: {
        type: String,
        unique: true
    },
    fname: {
        type: String
    },
    lname:{
        type: String
    }
});

var details = module.exports = mongoose.model('details', signupSchema);

module.exports.getDetails = function(username, callback){
    details.find({username: username}, callback);
};

module.exports.AddDetails = function(dets, callback){
    details.create(dets, callback);
};