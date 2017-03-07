(function() {
    'use strict';
    angular.module('rssReader').controller('singleArticle', ['$scope', '$state', '$stateParams', 'articlesService', function($scope, $state, $stateParams, articlesService) {
        if (!$stateParams.link) {
            $state.go('^');
        } else {
            articlesService.getSingleArticle($stateParams.feed, $stateParams.link).then(function (res) {
                $scope.article = res;
            });
        }
        

    }]);

})();
