var mongoose = require('mongoose'),
    fs = require("fs"),
    FeedParser = require('feedparser'),
    request = require('request'),
    Feed = mongoose.model('Feed');

module.exports.getParsedFeed = function(req, res) {
    var parsedFeed = [];
    var req = request(req.body.url);
    var feedparser = new FeedParser({ normalize: true, addmeta: true });

    req.on('error', function(error) {
        console.log('Feed xml req error')
    });

    req.on('response', function(res) {
        var stream = this;

        if (res.statusCode !== 200) {
            this.emit('error', new Error('Bad status code'));
        } else {
            stream.pipe(feedparser);
        }
    });

    feedparser.on('error', function(error) {
        console.log("FeedParser error");
    });

    feedparser.on('readable', function() {
        var stream = this,
            meta = this.meta,
            item;
        while (item = stream.read()) {
            parsedFeed.push(item);
            return parsedFeed;
        }
        res.send({
            feed: parsedFeed
        });
    });
}

module.exports.addFeed = function(req, res) {
    Feed.findOne({ feedLink: req.body.feedLink }, function(error, feed) {
        if (feed) {
            return res.send({
                    duplicate: true
                })
        } else {
            var feed = new Feed();
            feed.feedLink = req.body.feedLink;
            feed.feedTitle = req.body.feedTitle;
            feed.feedCategory = req.body.feedCategory;
            // feed.feedArticles = req.body.feedArticles;
            // feed.markModified('cat'); 
            // feed.markModified('feedArticles');
            feed.save(function(err) {
                if (err) {
                    res.send({
                        err: "Error"
                    })
                }
                res.json(feed);
            });
        }
    });
}
module.exports.getFeed = function(req, res) {
    Feed.find({}, function(error, feed) {
        if (feed) {
            res.json(feed);
        } else {
            res.send({
                err: "Error"
            })
        }
    })
}

module.exports.getFeedById = function(req, res) {
    Feed.findById({_id: req.body.feedId}, function(error, feed) {
        if (feed) {
            res.json(feed);
        } else {
            res.send({
                err: "Error"
            })
        }
    })
}
module.exports.getFeedByCat = function(req, res) {
    console.log(req.body);
    Feed.find(req.body, function(error, feed) {
        if (feed) {
            res.json(feed);
        } else {
            res.send({
                err: "Error"
            })
        }
    })
}


