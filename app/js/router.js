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
                    'head@dashboard': {
                        templateUrl: 'templates/dashboardHead.html',
                        controller: 'dashboardController'
                    },
                    'sidebar': {
                        templateUrl: 'templates/sidebar.html',
                        controller: 'sidebarController'
                    }
                },
                resolve: {
                    allFeed: ['dashboardService', function(dashboardService) {
                        return dashboardService.getFeed().then(function(res) {
                            // return dashboardService.getFeedFromFeedparser(res.data.feedLink).then(function(res) {
                                console.log('resolve', res);
                                    return res;
                                // })
                                // console.log(res);
                        });
                    }]
                }
            })
            .state('dashboard.table', {
                url: '/list-table?sort',
                templateUrl: 'templates/dashboardListLg.html',
                controller: 'articlesController'
            })
            .state('dashboard.list-lg', {
                url: '/list-lg?sort',
                templateUrl: 'templates/dashboardListLg.html',
                controller: 'articlesController'
            })
            .state('dashboard.list-th', {
                url: '/list-th?sort',
                templateUrl: 'templates/dashboardListLg.html',
                controller: 'articlesController'
            })
            .state('dashboard.article', {
                url: '/article?link',
                templateUrl: 'templates/singleArticle.html',
                controller: 'singleArticle',

            })
            .state('dashboard.add', {
                url: '/add',
                templateUrl: 'templates/add.html',
                controller: 'addController'
            });
    }]);
})();
