angular.module('rssReader').factory('articlesService', ['$http', function($http) {
    'use strict';
    var allArticles = [];

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

    function getFeedFromFeedparser(url) {
        return $http.post('/getParsedFeed', { url: url }).then(function(response) {
            return response.data;
        });
    }

    function getAllArticles(allFeeds) {
        let articles = [];
        let chain = Promise.resolve();
        allFeeds.forEach(function(feed) {
            chain = chain
                .then(() => getFeedFromFeedparser(feed.feedLink))
                .then((result) => {
                    result = getParsedArticles(result.feed, feed.feedCategory);
                    articles = articles.concat(result);
                });
        });

        return chain.then(() => {
            return articles
        });

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

    function getSingleArticle(link) {
        var articles = getAllArticles();
        if (!articles) {
            return false;
        }
        return articles.find(function(elem) {
            return elem.link == link;
        })
    }

    function setAllArticles(listFeeds) {
        allArticles = listFeeds;
    }

    function getArticles() {
        return allArticles;
    }

    function getFeedById(id) {
        return $http.post('/getFeedById', {feedId: id})
               .then(function(res) {
                    return getAllArticles([res.data]);
                },
                function(error) {
                    console.log('Can not load data', error);
                })
    }

    return {
        setAllArticles: setAllArticles,
        getAllArticles: getAllArticles,
        getArticles: getArticles,
        getFeedFromFeedparser: getFeedFromFeedparser,
        getFeedById: getFeedById
    }
}]);
