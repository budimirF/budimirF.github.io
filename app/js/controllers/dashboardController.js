(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', 'addFeedService', 'dashboardService', 'articles', function($scope, $state, addFeedService, dashboardService, articles) {
        var parsedArticles = [];
        // console.log(!!$scope.articles.length);
        
        // $scope.$watch(function () {
        //     return dashboardService.getSortParam();
        // }, function () {
        //     $scope.titleFeed = dashboardService.getSortParam();
        // });

        parsedArticles = dashboardService.getParsedArticles(articles);
        console.log(parsedArticles);
        $scope.readArticle = function (link) {
            $state.go('^.article', {link:link}); 
        }

        if (!articles.length) {
            $state.go('dashboard.add');
        } else {
            $state.go('dashboard.list-lg', {sort: 'All'});
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
