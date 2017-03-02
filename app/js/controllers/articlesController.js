(function() {
    'use strict';
    angular.module('rssReader').controller('articlesController', ['$scope', '$state', '$stateParams', 'dashboardService', 'articlesService', function($scope, $state, $stateParams, dashboardService, articlesService) {
        
        $scope.articles = articlesService.getArticles();
        // $scope.articles = dashboardService.getArticles($stateParams.sort, 'articlesController');
        // console.log($scope.articles);
        // $scope.readArticle = function (article) {
        //     $state.go('dashboard.article', {param : article});
            
        // }; 
    }]);

})();
