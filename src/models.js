var mongoose = require('mongoose');
var tickSchema = mongoose.Schema({
  userOpenId: String,
  ctime: Date,
  comment: String,
  tick: String
});
tickSchema.static('findLatest', function(userOpenId, callback) {
  this.find({
    userOpenId: userOpenId
  }).sort({$natural: -1}).limit(1).nextObject(callback);
});
var Tick = mongoose.model('Tick', tickSchema);
module.exports.Tick = Tick;
