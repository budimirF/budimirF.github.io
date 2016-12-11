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
