angular.module('rssReader').factory('articlesService', ['$http', function($http) {
    'use strict';
    // var allArticles = [];

    function getText(html) {
        return angular.element(`<div>${html}</div>`).text().replace(/\n+/g, ' ');
    }

    function getImgUrl(html) {
        var imgElem = angular.element(`<div>${html}</div>`).find('img')[0];
        return imgElem ? imgElem.src : '';
    }

    function getFeedFromFeedparser(url) {
        return $http.post('/getParsedFeed', { url: url }).then(function(response) {
            return response.data;
        });
    }

    function getArticles(feeds) {
        let articles = [];
        let chain = Promise.resolve();
        feeds.forEach(function(feed) {
            chain = chain
                .then(() => getFeedFromFeedparser(feed.feedLink))
                .then((result) => {
                    result = getParsedArticles(result.feed, feed.feedCategory, feed._id);
                    articles = articles.concat(result);
                });
        });

        return chain.then(() => {
            return articles
        });

    }

    function getParsedArticles(articles, category, feedId) {
        // console.log('getParsedArticles', articles);
        var changedArticles = [];
        articles.forEach(function(el) {
            
            changedArticles.push({
                title: el.title,
                feedId: feedId,
                category: category,
                content: getText(el.description),
                img: getImgUrl(el.description),
                link: el.link,
                date: el.pubDate
            })
        });
        return changedArticles;
    }

    function getSingleArticle(feedId, link) {
        return getFeedById(feedId).then(function(res) {
            return res.find(function(elem) {
                if (elem.link == link) {
                    return elem;
                }
            })
        })
    }

    function getAllFeeds() {
        return $http.post('/getFeed')
            .then(function(res) {
                    return getArticles(res.data)
                        // return res;

                },
                function(error) {
                    console.log('Can not get saved feed');
                })
    }

    function getFeedById(id) {
        return $http.post('/getFeedById', { feedId: id })
            .then(function(res) {
                    return getArticles([res.data]);
                },
                function(error) {
                    console.log('Can not load data', error);
                })
    }

    function getFeedByCat(category) {
        return $http.post('/getFeedByCat', { feedCategory: category })
            .then(function(res) {
                    // console.log('getFeedByCat', res.data);
                    return getArticles(res.data);
                },
                function(error) {
                    console.log('Can not load data', error);
                })
    }

    return {
        // setAllArticles: setAllArticles,
        // getAllArticles: getAllArticles,
        getArticles: getArticles,
        getFeedFromFeedparser: getFeedFromFeedparser,
        getAllFeeds: getAllFeeds,
        getFeedById: getFeedById,
        getFeedByCat: getFeedByCat, 
        getSingleArticle: getSingleArticle
    }
}]);
