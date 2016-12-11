angular.module('rssReader').factory('addFeedService', ['$http', function($http) {
    'use strict';
    var listFeeds = [];

    function saveData (feed) {
        listFeeds.push(feed);
    }

    function getText(html) {
        return angular.element(`<div>${html}</div>`).text().replace(/\n+/g,' ');
    }

    function getImgUrl (html) {
        var imgElem = angular.element(`<div>${html}</div>`).find('img')[0];
        return imgElem ? imgElem.src : '';
    }

    function getDate (dateRaw) {
        console.log(dateRaw);
        var date = new Date(dateRaw);
        console.log(date);
        return date;
    }

    function getSrcFeed(url) {
        return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url)).
        then(function(response) {
            return response.data;
        });
    }

    function getParsedArticles (articles, category) {
        var changedArticles = [];
        articles.forEach( function(el) {
            changedArticles.push({
                title : el.title,
                category: category,
                content : getText(el.content),
                img : getImgUrl(el.content),
                link : el.link,
                date : getDate(el.publishedDate)
            })
        });
        return changedArticles;
    }

    function getParsedFeed(feed, category) {
        feed = feed.responseData.feed;
        return {
            feedTitle : feed.title,
            feedCategory: category,
            feedDescription : feed.description,
            feedArticles : getParsedArticles(feed.entries, category)
        }
    }

    function getSavedFeeds () {
        return  listFeeds;
    }

    return {
        getSrcFeed : getSrcFeed,
        getParsedFeed: getParsedFeed,
        saveData : saveData,
        getSavedFeeds : getSavedFeeds
    }
}]);
