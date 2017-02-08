(function() {
    'use strict';
    angular.module('rssReader').controller('sidebarController', ['$scope', '$state', '$rootScope', 'dashboardService', function($scope, $state, $rootScope, dashboardService) {
        var getListSidebar = dashboardService.getCategorySidebar;
        
        $scope.$watch(function () {
            return JSON.stringify(getListSidebar());
        }, function () {
            $scope.listFeedSidebar = getListSidebar();
        });
        
        $scope.showArticlesBySorting = function (sorting) {
            
            // titleFeed = titleFeed ? titleFeed : null; 
            // console.log('titleFeed = ' + titleFeed);
            $state.go('dashboard.list-lg', {sort:sorting}); 
        }

        $scope.rotateChevron = function($event) {
            var collapse = $event.currentTarget.attributes['aria-expanded'].value;
            var chevron = angular.element($event.currentTarget).find('.glyphicon-chevron-right');
            if (collapse == "false") {
                chevron.addClass('chevronDown');
            } else {
                chevron.removeClass('chevronDown');
            }
        }

    }]);

})();
