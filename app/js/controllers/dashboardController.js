(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', 'addFeedService', 'dashboardService', function($scope, $state, addFeedService, dashboardService) {
        $scope.articles = dashboardService.getArticles();
        // console.log($scope.articles);
        if (!$scope.articles) {
            $state.go('dashboard.add');
        }

        $scope.isRead = function () {
            let re = new RegExp("dashboard.add");
            return (!re.test($state.current.name));
        }

    }]);

})();