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
                    feeds: ['dashboardService', 'articlesService', 'sidebarService', function(dashboardService, articlesService, sidebarService) {
                        return articlesService.getAllFeeds().then(function(res) {
                            sidebarService.setListFeeds(res.data);
                            return res.data;
                        });
                    }]
                }
            })
            .state('dashboard.table', {
                url: '/list-table?type&value',
                templateUrl: 'templates/dashboardListLg.html',
                controller: 'articlesController'
            })
            .state('dashboard.list-lg', {
                url: '/list-lg?type&value',
                templateUrl: 'templates/dashboardListLg.html',
                controller: 'articlesController'
            })
            .state('dashboard.list-th', {
                url: '/list-th?type&value',
                templateUrl: 'templates/dashboardListTh.html',
                controller: 'articlesController'
            })
            .state('dashboard.article', {
                url: '/article?feed&link',
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
