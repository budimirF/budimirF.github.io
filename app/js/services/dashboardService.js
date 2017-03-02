angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', '$http', function(addFeedService, $filter, $http) {
    'use strict';
    var sortParam; //sorting option got from sidebar


    function getSortParam() {
        if (!sortParam) {
            sortParam = "All";
        }
        return sortParam;
    }

    function getAllFeeds() {
        return $http.post('/getFeed')
            .then(function(res) {
                    return res;
                },
                function(error) {
                    console.log('Can not get saved feed');
                })
    }

    return {
        getSortParam: getSortParam,
        getAllFeeds: getAllFeeds,
    }
}]);
