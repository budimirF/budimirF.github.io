(function() {
    'use strict';
    angular.module('rssReader').controller('addController-', ['$scope', '$state', 'addFeedService',  function($scope, $state, addFeedService) {
        // $scope.feed = {};
        $scope.getFeed = function () {
            addFeedService.saveFeed($scope.feedUrl, $scope.feedCategory).then(function(response) {
                // console.log(res);

                addFeedService.getFeedFromFeedparser(response.data.feedLink).then(function (res) {
                    // console.log(res.feed);
                    var feed = addFeedService.getParsedFeed(res.feed);//.then(function (res) {
                        console.log(feed);
                        $state.go('dashboard.list-lg', {sort:response.data._id});
                    //});
                });
            });
        }
    }]);

})();