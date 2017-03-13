(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', '$stateParams','addFeedService', 'dashboardService', 'feeds', function($scope, $state, $stateParams, addFeedService, dashboardService, feeds) {
        $scope.dashboardService = dashboardService;

        $scope.readArticle = function (feedId, link) {
            $state.go('^.article', {feed: feedId, link: link}); 
        }

        if (!feeds.length) {
            $state.go('dashboard.add');
        } 
        else {
            if (!Object.entries($state.params).length) {
                $state.go('dashboard.list-lg', {type: $state.params.type, value: $state.params.value});
            }
        }

        $scope.isList = function() {
            var re = new RegExp(".list");
            return (re.test($state.current.name));
        }

        $scope.getAllFeed = function () {
            console.log($state.params, $state.current);
        }

    }]);

})();
