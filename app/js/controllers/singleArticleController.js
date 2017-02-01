(function() {
    'use strict';
    angular.module('rssReader').controller('singleArticle', ['$scope', '$state', '$stateParams', 'dashboardService', function($scope, $state, $stateParams, dashboardService) {
        if (!$stateParams.link) {
            $state.go('^');
        } else {
            $scope.article = dashboardService.getSingleArticle($stateParams.link);
        }
        

    }]);

})();
