var models = require('./models');
var express = require('express');
var router = express.Router();

module.exports = router;
router.get('/ticks', function(req, res) {
  if (!req.query.user) {
    res.status(401).json({
      error: 'Invalid input'
    });
    return;
  }
  var lo = new Date(req.query.year, req.query.month/1 - 1, req.query.date);
  var hi = new Date(req.query.year, req.query.month/1 - 1, req.query.date/1 + 1);
  models.Tick.count({
    userOpenId: req.query.user,
    ctime: {
      $lt: hi,
      $gte: lo
    }
  }, function(err, counts) {
    if (err) {
      console.error(err.stack);
      res.status(500).json({
        error: 'Server error'
      });
      return;
    }
    res.status(200).json({
      ticks: counts > 5 ? 5 : counts
    });
  });
});
