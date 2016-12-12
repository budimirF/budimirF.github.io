(function() {
    'use strict';
    angular.module('rssReader').controller('sidebarController', ['$scope', '$state', 'dashboardService', function($scope, $state, dashboardService) {
        $scope.getListCategory = function () {
           $scope.listFeedSidebar = dashboardService.getCategorySidebar();
           // console.log($scope.listSidebar);
        } 

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
