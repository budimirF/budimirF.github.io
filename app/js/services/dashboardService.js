angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', function(addFeedService, $filter) {
    'use strict';
    var listFeeds = addFeedService.getSavedFeeds();

    function getCategorySidebar() {
        var listFeedSidebar = [];

        if (listFeeds.length) {
            listFeeds.forEach(function(elem, index) {
                listFeedSidebar.push({
                    category: elem.feedCategory,
                    id: index,
                    titleFeeds: [elem.feedTitle]
                })
            });
        }
        return listFeedSidebar;
    }


    function getArticles(category) {
        var articles;

        if (listFeeds.length) {
            articles = [];
            listFeeds.forEach( function(elem) {
                // console.log(elem.feedArticles);
                elem.feedArticles.forEach( function(elem) {
                    articles.push(elem)
                });
            });
        }
        return articles;
        // return listFeeds.length ? listFeeds[0].feedArticles : '';
    }

    return {
        getArticles: getArticles,
        getCategorySidebar: getCategorySidebar
    }
}]);
