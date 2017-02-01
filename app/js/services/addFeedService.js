angular.module('rssReader').factory('addFeedService', ['$http', function($http) {
    'use strict';
    var listFeeds = [];
    function saveData(feed) {
        return $http.post('/addFeed', {feedArticles: feed.feedArticles, feedTitle: feed.feedTitle, feedCategory: feed.feedCategory })
            .then(function(res) {
                console.log("response in getSavedFeed: ", res);
                listFeeds.push(res.data)
                return res;
            },
            function(error) {
                console.log('Can not get saved feed');
            })
    }
    // function saveData (feed) {
    //     listFeeds.push(feed);
    // }
    function getText(html) {
        return angular.element(`<div>${html}</div>`).text().replace(/\n+/g, ' ');
    }

    function getImgUrl(html) {
        var imgElem = angular.element(`<div>${html}</div>`).find('img')[0];
        return imgElem ? imgElem.src : '';
    }

    function getDate(dateRaw) {
        return moment(new Date(dateRaw)).format('DD-MM-YYYY HH:mm');
    }

    function getSrcFeed(url) {
        return $http.post('/getParsedFeed', { url: url }).then(function(response) {
            // console.log(response.data);
            return response.data;
        });
        // return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url)).
        // then(function(response) {
        //     return response.data;
        // });
    }


    function getParsedArticles(articles, category) {
        var changedArticles = [];
        articles.forEach(function(el) {
            changedArticles.push({
                title: el.title,
                category: category,
                content: getText(el.description),
                img: getImgUrl(el.description),
                link: el.permalink,
                date: el.pubDate
            })
        });
        return changedArticles;
    }

    function getParsedFeed(feed, category) {
        feed = feed.feed;
        return {
            feedTitle: feed[0].meta.title,
            feedCategory: category,
            feedArticles: getParsedArticles(feed, category)
        }
    }

    function getSavedFeeds() {
        return listFeeds;
    }

    return {
        getSrcFeed: getSrcFeed,
        getParsedFeed: getParsedFeed,
        saveData: saveData,
        getSavedFeeds: getSavedFeeds
    }
}]);
