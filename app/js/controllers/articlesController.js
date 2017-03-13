(function() {
    'use strict';
    angular.module('rssReader').controller('articlesController', ['$scope', '$state', '$stateParams', 'dashboardService', 'articlesService', function($scope, $state, $stateParams, dashboardService, articlesService) {

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
            articlesService.getAllArticles().then(function(res) {
                    $scope.articles = res;
            });
        } 
    }]);

})();
