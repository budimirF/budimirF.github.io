(function() {
    'use strict';
    angular.module('rssReader').controller('addController', ['$scope', '$state', 'addFeedService', 'articlesService', 'sidebarService', function($scope, $state, addFeedService, articlesService, sidebarService) {
        // $scope.feed = {};
        $scope.getFeed = function () {
            articlesService.getFeedFromFeedparser($scope.feedUrl).then(function(res) {
                var feed = addFeedService.getParsedFeed(res, $scope.feedCategory);
                addFeedService.saveFeed(feed, $scope.feedUrl).then(function (res) {
                    sidebarService.setListFeeds([res.data]);
                    $state.go('dashboard.list-lg', {sort:res.data._id});
                });
            });
        }
    }]);

})();