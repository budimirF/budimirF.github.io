var mongoose = require('mongoose'),
	express = require('express'),
	router = express.Router(),
	feedCtrl = require('../controllers/feeds');

router.post('/getParsedFeed', feedCtrl.getParsedFeed);
router.post('/addFeed', feedCtrl.addFeed);
router.post('/getFeed', feedCtrl.getFeed);
router.post('/getFeedById', feedCtrl.getFeedById);

module.exports = router;
