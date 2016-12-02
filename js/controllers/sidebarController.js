(function() {
    'use strict';
    angular.module('rssReader').controller('sidebarController', ['$scope', '$state', 'dataService', function($scope, $state, dataService) {
        $scope.category = dataService.categorySidebar.category;
        
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
