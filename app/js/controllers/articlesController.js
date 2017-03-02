(function() {
    'use strict';
    angular.module('rssReader').controller('articlesController', ['$scope', '$state', '$stateParams', 'dashboardService', 'articlesService', function($scope, $state, $stateParams, dashboardService, articlesService) {
        // $scope.articles = [];
        console.log($stateParams.sort);
        // $scope.articles = articlesService.getArticles();

        articlesService.getFeedById($stateParams.sort).then(function (res) {
            // articlesService.getAllArticles([res.data]).then(function (res) {
                $scope.articles = res;
            // })
            
        });

        // $scope.articles = dashboardService.getArticles($stateParams.sort, 'articlesController');
        // console.log($scope.articles);
        // $scope.readArticle = function (article) {
        //     $state.go('dashboard.article', {param : article});
            
        // }; 
    }]);

})();
