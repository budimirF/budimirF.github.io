angular.module('rssReader').factory('addFeedService', ['$http', function($http) {
    'use strict';
    var listFeeds = [];
    function saveFeed(feed, feedUrl) {
        return $http.post('/addFeed', {feedLink: feedUrl, feedCategory: feed.feedCategory, feedTitle: feed.feedTitle })
            .then(function(res) {
                console.log("response in getSavedFeed: ", res);
                // listFeeds.push(res.data)
                return res;
            },
            function(error) {
                console.log('Can not get saved feed');
            })
    }
    // function saveData (feed) {
    //     listFeeds.push(feed);
    // }
 

    function getParsedFeed(feed, category) {
        feed = feed.feed;
        return {
            feedTitle: feed[0].meta.title,
            feedCategory: category,
        }
    }

    // function getSavedFeeds() {
    //     return listFeeds;
    // }

    return {
        saveFeed: saveFeed,
        getParsedFeed: getParsedFeed,
    }
}]);
