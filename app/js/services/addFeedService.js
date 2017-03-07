angular.module('rssReader').factory('addFeedService', ['$http', function($http) {
    'use strict';

    function saveFeed(feed, feedUrl) {
        return $http.post('/addFeed', { feedLink: feedUrl, feedCategory: feed.feedCategory, feedTitle: feed.feedTitle })
            .then(function(res) {
                    console.log("response in getSavedFeed: ", res);
                    return res;
                },
                function(error) {
                    console.log('Can not get saved feed');
                });
    }


    function getParsedFeed(feed, category) {
        feed = feed.feed;
        return {
            feedTitle: feed[0].meta.title,
            feedCategory: category,
        }
    }

    return {
        saveFeed: saveFeed,
        getParsedFeed: getParsedFeed,
    }
}]);
