(function() {
    'use strict';
    angular.module('rssReader').controller('articlesController', ['$scope', '$state', '$stateParams', 'dashboardService', 'articlesService', function($scope, $state, $stateParams, dashboardService, articlesService) {
        // console.log('$stateParams', $stateParams.type, $stateParams.value);

        if ($stateParams.type == "id") {
            articlesService.getFeedById($stateParams.value).then(function(res) {
                $scope.articles = res;
            });
        }

        if (($stateParams.type == "category") && ($stateParams.value != 'All')) {
            articlesService.getFeedByCat($stateParams.value).then(function(res) {
                $scope.articles = res;
            });
        }

        if ((!$stateParams.type) || ($stateParams.value == 'All')) {
            articlesService.getAllFeeds().then(function(res) {
                // articlesService.getArticles(res.data).then(function(res) {
                    // console.log(res);
                    $scope.articles = res;
                // });
            });
        } 



        // $scope.articles = dashboardService.getArticles($stateParams.sort, 'articlesController');
        // console.log($scope.articles);
        // $scope.readArticle = function (article) {
        //     $state.go('dashboard.article', {param : article});

        // }; 
    }]);

})();
