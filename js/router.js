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
                    dashboardSidebar : {
                        templateUrl: 'templates/sidebar.html',
                        controller: 'sidebarController'
                    }
                }
            });
            // .state('addPage',{
            //     '': views {
            //         url: '/add',
            //         templateUrl: 'templates/add.html'
            //         // controller: 'addPage'
            //     },

            // });
    }]);
})();
