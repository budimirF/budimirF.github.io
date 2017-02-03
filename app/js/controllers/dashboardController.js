(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', 'addFeedService', 'dashboardService', function($scope, $state, addFeedService, dashboardService) {
        $scope.articles = dashboardService.getArticles();
        // console.log(!!$scope.articles.length);
        
        $scope.$watch(function () {
            return dashboardService.getSortParam();
        }, function () {
            $scope.titleFeed = dashboardService.getSortParam();
        });

        $scope.readArticle = function (link) {
            $state.go('^.article', {link:link}); 
        }

        if (!$scope.articles.length) {
            $state.go('dashboard.add');
        } else {
            $state.go('dashboard.list-lg');
        }

        $scope.isRead = function() {
            var re = new RegExp("dashboard.add");
            return (!re.test($state.current.name));
        }

        $scope.getAllFeed = function () {
            dashboardService.getFeed();
        }

    }]);

})();
