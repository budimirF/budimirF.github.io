(function() {
    'use strict';
    var app = angular.module('rssReader', ['ui.router']);
    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise('home');
        $stateProvider.state('home', {
                url: '/home',
                templateUrl: "templates/home.html",
                controller: 'homeController'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                // controller: 'loginController'
            })
            .state('dashboard', {
                url: '/dashboard',
                views: {
                    '': {
                        templateUrl: 'templates/dashboard.html',
                        controller: 'dashboardController'
                    },
                    'head@dashboard' : {
                        templateUrl: 'templates/dashboardHead.html',
                        controller: 'dashboardController'
                    },
                    'sidebar' : {
                        templateUrl: 'templates/sidebar.html',
                        controller: 'sidebarController'
                    }
                }
            })
            .state('dashboard.list-lg', {
                url: '/list-lg',
                templateUrl: 'templates/dashboardListLg.html',
                controller: 'dashboardController'
            })
            .state('dashboard.add', {
                    url: '/add',
                    templateUrl: 'templates/add.html',
                    controller: 'addController'
            });
    }]);
})();

(function() {
    'use strict';
    angular.module('rssReader').controller('addController', ['$scope', '$state', 'addFeedService',  function($scope, $state, addFeedService) {
        $scope.feed = {};
        $scope.getFeed = function () {
            addFeedService.getSrcFeed($scope.feedUrl).then(function(res) {
                console.log(res);
                $scope.feed = addFeedService.getParsedFeed(res, $scope.feedCategory);
                addFeedService.saveData($scope.feed);
                console.log($scope.feed)
                $state.go('dashboard.list-lg');
            });
        }
        
    }]);

})();
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
(function () {
    'use strict';
    angular.module('rssReader').controller('homeController', ['$scope', '$state', function($scope, $state){
        $scope.test = "hello world!!!";
    }]);

})();


(function() {
    'use strict';
    angular.module('rssReader').controller('navController', ['$scope', '$state', function($scope, $state) {
      $scope.isDasboard = function () {
        return /dashboard/.test($state.current.name);
      }
    }]);

})();
(function() {
    'use strict';
    angular.module('rssReader').controller('sidebarController', ['$scope', '$state', 'dashboardService', function($scope, $state, dashboardService) {
        $scope.getListCategory = function () {
           $scope.listSidebar = dashboardService.getCategorySidebar();
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

angular.module('rssReader').factory('addFeedService', ['$http', function($http) {
    'use strict';
    var listFeeds = [];

    function saveData (feed) {
        listFeeds.push(feed);
    }

    function getText(html) {
        return angular.element(`<div>${html}</div>`).text().replace(/\n+/g,' ');
    }

    function getImgUrl (html) {
        var imgElem = angular.element(`<div>${html}</div>`).find('img')[0];
        return imgElem ? imgElem.src : '';
    }

    function getDate (dateRaw) {
        console.log(dateRaw);
        var date = new Date(dateRaw);
        console.log(date);
        return date;
    }

    function getSrcFeed(url) {
        return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url)).
        then(function(response) {
            return response.data;
        });
    }

    function getParsedArticles (articles, category) {
        var changedArticles = [];
        articles.forEach( function(el) {
            changedArticles.push({
                title : el.title,
                category: category,
                content : getText(el.content),
                img : getImgUrl(el.content),
                link : el.link,
                date : getDate(el.publishedDate)
            })
        });
        return changedArticles;
    }

    function getParsedFeed(feed, category) {
        feed = feed.responseData.feed;
        return {
            feedTitle : feed.title,
            feedCategory: category,
            feedDescription : feed.description,
            feedArticles : getParsedArticles(feed.entries, category)
        }
    }

    function getSavedFeeds () {
        return  listFeeds;
    }

    return {
        getSrcFeed : getSrcFeed,
        getParsedFeed: getParsedFeed,
        saveData : saveData,
        getSavedFeeds : getSavedFeeds
    }
}]);

angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', function(addFeedService, $filter) {
    'use strict';
    var listFeeds = addFeedService.getSavedFeeds();

    function getCategorySidebar() {
        var listFeedSidebar = [];

        if (listFeeds.length) {
            listFeeds.forEach(function(elem, index) {
                listFeedSidebar.push({
                    category: elem.feedCategory,
                    id: index,
                    titleFeeds: [elem.feedTitle]
                })
            });
        }
        return listFeedSidebar;
    }


    function getArticles(category) {
        var articles;

        if (listFeeds.length) {
            articles = [];
            listFeeds.forEach( function(elem) {
                // console.log(elem.feedArticles);
                elem.feedArticles.forEach( function(elem) {
                    articles.push(elem)
                });
            });
        }
        return articles;
        // return listFeeds.length ? listFeeds[0].feedArticles : '';
    }

    return {
        getArticles: getArticles,
        getCategorySidebar: getCategorySidebar
    }
}]);
