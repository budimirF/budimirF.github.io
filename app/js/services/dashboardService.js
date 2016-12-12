angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', function(addFeedService, $filter) {
    'use strict';
    var listFeeds = addFeedService.getSavedFeeds();

    function getCategorySidebar() {
        var listFeedSidebar = [];
        var listWork = [];
        var foundElem;

        if (!listFeeds.length) {
            return false;
        } else {
            listFeeds.forEach(function(element, index) {
                listWork.push({
                    feedCategory: element.feedCategory,
                    feedId: index,
                    feedTitle: [element.feedTitle]
                })
            });
        }

        listWork.forEach(function(element, index) {

            foundElem = listFeedSidebar.find(function(elem) {
                return elem.feedCategory == element.feedCategory;
            });

            if (foundElem) {
                foundElem.feedTitle = foundElem.feedTitle.concat(element.feedTitle);
            } else {
                listFeedSidebar.push(element);
            }

        });

        console.log(listFeedSidebar);
        return listFeedSidebar;
    }

    function getArticles(category) {
        var articles;
        if (listFeeds.length) {
            articles = [];
            listFeeds.forEach(function(elem) {
                elem.feedArticles.forEach(function(elem) {
                    articles.push(elem)
                });
            });
        }
        return articles;
    }

    return {
        getArticles: getArticles,
        getCategorySidebar: getCategorySidebar
    }
}]);
