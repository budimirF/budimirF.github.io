(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', '$stateParams','addFeedService', 'dashboardService', 'feeds', function($scope, $state, $stateParams, addFeedService, dashboardService, feeds) {
        // console.log(!!$scope.articles.length);
        
        $scope.$watch(function () {
            return dashboardService.getSortParam();
        }, function () {
            $scope.titleFeed = dashboardService.getSortParam();
        });


        $scope.readArticle = function (feedId, link) {
            $state.go('^.article', {feed: feedId, link: link}); 
        }

        if (!feeds.length) {
            $state.go('dashboard.add');
        } 
        else {
            console.log('$state.params', $state.params, $state.params.current);
            if (!Object.entries($state.params).length) {
                $state.go('dashboard.list-lg', {type: $state.params.type, value: $state.params.value});
            }
             //add $state.params variables
            // $state.go($state.params.current, $state.params); 

        }

        $scope.isRead = function() {
            var re = new RegExp("dashboard.add");
            return (!re.test($state.current.name));
        }

        $scope.getAllFeed = function () {
            console.log($state.params, $state.current);
        }

    }]);

})();
