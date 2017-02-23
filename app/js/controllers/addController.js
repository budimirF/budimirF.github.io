(function() {
    'use strict';
    angular.module('rssReader').controller('addController', ['$scope', '$state', 'addFeedService', 'dashboardService', function($scope, $state, addFeedService, dashboardService) {
        // $scope.feed = {};
        $scope.getFeed = function () {
            dashboardService.getFeedFromFeedparser($scope.feedUrl).then(function(res) {
                var feed = addFeedService.getParsedFeed(res, $scope.feedCategory);
                addFeedService.saveFeed(feed, $scope.feedUrl).then(function (res) {
                    $state.go('dashboard.list-lg', {sort:res.data._id});
                });
            });
        }
    }]);

})();