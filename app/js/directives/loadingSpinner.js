angular.module('rssReader').directive('loading', ['$http', function($http) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            scope.isLoading = function() {
                return $http.pendingRequests.length > 0;
            };
            scope.$watch(scope.isLoading, function(value) {
                if (value) {
                    element.removeClass('ng-hide');
                } else {
                    element.addClass('ng-hide');
                }
            });
        }
    };
}]);

