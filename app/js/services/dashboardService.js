angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', '$http', function(addFeedService, $filter, $http) {
    'use strict';
    var listFeeds = [];
    var sortParam; //sorting option got from sidebar

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
            // console.log(response.data);
            return response.data;
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

    function getArticles(allFeeds) {
        console.log('getArticles', arguments);
        let articles = [];
        let urls = allFeeds.map(function(element) {
            return element.feedLink;
        });

        // return Promise.all(urls.map(getFeedFromFeedparser)).then(function(res) {
        //     res.forEach(function(element) {
        //         articles = articles.concat(element.feed);
        //     });
        //     return articles;
        // });

        let chain = Promise.resolve();
        allFeeds.forEach( function(feed) {
            chain = chain
                .then(() => getFeedFromFeedparser(feed.feedLink))
                .then((result) => {
                    articles = articles.concat(result.feed);
                });
        });
        
        return chain.then(() => {
            return articles
        });       

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

    function getAllFeeds() {
        return $http.post('/getFeed')
            .then(function(res) {
                    listFeeds = res.data;
                    return res;
                },
                function(error) {
                    console.log('Can not get saved feed');
                })
    }

    function getListFeeds() {
        return listFeeds;
    }

    return {
        getArticles: getArticles,
        getFeedFromFeedparser: getFeedFromFeedparser,
        getSingleArticle: getSingleArticle,
        getSortParam: getSortParam,
        getAllFeeds: getAllFeeds,
        getParsedArticles: getParsedArticles,
        getListFeeds: getListFeeds
    }
}]);
