(function() {
    'use strict';
    angular.module('rssReader').controller('sidebarController', ['$scope', '$state', '$rootScope', 'sidebarService', 'dashboardService', function($scope, $state, $rootScope, sidebarService, dashboardService) {
        var getListSidebar = sidebarService.getCategorySidebar;
        var listFeeds = [];
        
        $scope.$watch(function () {
            // return JSON.stringify(getListSidebar());
            listFeeds = sidebarService.getListFeeds();
            return listFeeds;
        }, function () {
            $scope.listFeedSidebar = getListSidebar(listFeeds);
        });
        
        $scope.showArticlesBySorting = function (type, value) {
            // console.log(sorting);
            // titleFeed = titleFeed ? titleFeed : null; 
            // console.log('titleFeed = ' + titleFeed);
            $state.go('dashboard.list-lg', {type: type, value: value}); 
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
