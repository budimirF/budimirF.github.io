(function() {
    'use strict';
    angular.module('rssReader').controller('navController', ['$scope', '$state', function($scope, $state) {
      $scope.isDasboard = function () {
        return /dashboard/.test($state.current.name);
      }
    }]);

})();