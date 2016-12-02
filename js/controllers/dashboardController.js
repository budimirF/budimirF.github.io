(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', 'dataService', function($scope, $state, dataService) {
      $scope.articles = dataService.dataArticles.feedArticles;
      
    }]);

})();