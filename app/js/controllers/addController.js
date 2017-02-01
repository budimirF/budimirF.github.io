(function() {
    'use strict';
    angular.module('rssReader').controller('addController', ['$scope', '$state', 'addFeedService',  function($scope, $state, addFeedService) {
        // $scope.feed = {};
        $scope.getFeed = function () {
            addFeedService.getSrcFeed($scope.feedUrl).then(function(res) {
                var feed = addFeedService.getParsedFeed(res, $scope.feedCategory);
                addFeedService.saveData(feed);
                $state.go('dashboard.list-lg');
            });
        }
        
    }]);

})();