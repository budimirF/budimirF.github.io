(function() {
    'use strict';
    angular.module('rssReader').controller('sidebarController', ['$scope', '$rootScope', '$state', 'dashboardService', function($scope, $state, $rootScope, dashboardService) {
        var getListSidebar = dashboardService.getCategorySidebar;
        
        $scope.$watch(function () {
            return JSON.stringify(getListSidebar());
        }, function () {
            $scope.listFeedSidebar = getListSidebar();
        });

        $scope.rotateChevron = function($event) {
            var chevronRigth = angular.element($event.target).children().hasClass('chevronRotate'),
                chevronDown = angular.element($event.target).children().hasClass('chevronRotated');
            
            if (chevronRigth && !chevronDown) {
                angular.element($event.target).children().addClass('chevronRotated');
            } else {
                angular.element($event.target).children().removeClass('chevronRotated');
            }
        }
    }]);

})();
