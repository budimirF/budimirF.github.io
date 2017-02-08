angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', '$http', function(addFeedService, $filter, $http) {
    'use strict';
    var listFeeds = [];
    var sortParam; //sorting option got from sidebar

    function getCategorySidebar() {
        var listFeedSidebar = [];
        var listWork = [];
        var foundElem;

        if (!listFeeds.length) {
            return false;
        } else {
            listFeeds.forEach(function(element, index) {
                listWork.push({
                    feedId : element._id,
                    feedCategory: element.feedCategory,
                    id: index,
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
        return listFeedSidebar;
    }

    function getArticles(allFeed) {
        var articles = [];
        if (listFeeds.length) {
            listFeeds.forEach(function(elem) {
                    articles = articles.concat(elem.feedArticles);
            });
        }
        // console.log(articles);
        return articles;
    }

    function getSingleArticle(link) {
        var articles = getArticles();
        if (!articles) {
            return false;
        }
        return articles.find(function(elem) {
            return elem.link == link;
        })
    }

    function getSortParam() {
        if (!sortParam) {
            sortParam = "All";
        }
        return sortParam;
    }

    function getFeed () {
        return $http.post('/getFeed')
            .then(function(res) {
                listFeeds = res.data;
                return res;
            },
            function(error) {
                console.log('Can not get saved feed');
            })
    }

    return {
        getArticles: getArticles,
        getCategorySidebar: getCategorySidebar,
        getSingleArticle: getSingleArticle,
        getSortParam: getSortParam,
        getFeed: getFeed
    }
}]);
