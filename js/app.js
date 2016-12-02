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

// console.log($scope.category);

(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', 'dataService', function($scope, $state, dataService) {
      $scope.articles = dataService.dataArticles.feedArticles;
      
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

angular.module('rssReader').factory('dataService', ['$http', function($http){
    function getCategorySidebar(){
        return {
            category : [{
                title: "IT",
                id: 0,
                titleFeeds: ["Linux.org.ru: Новости", "Интересные / Публикации / Хабралента"]
            }, {
                title: "Job",
                id: 1,
                titleFeeds: ["Вакансии в Львове для начинающих на DOU.ua"]
            }, {
                title: "Job",
                id: 2,
                titleFeeds: ["Вакансии в Львове для начинающих на DOU.ua"]
            }]
        }
    }

    function getDataArticles(){
        return {
            feedArticles : [{
                title: "10 книг по UI/UX дизайну, которые стоит прочитать",
                imgUrl: "https://habrastorage.org/files/66e/c47/8be/66ec478be601474684a976860200b4c1.jpg",
                description: "Хабы: Интерфейсы, Дизайн мобильных приложений, Веб-дизайн, Usability, Блог компании Everyday Tools Стать отличным UI/UX дизайнером не так просто: нужно знать основы, постоянно отслеживать последние тенденции и использовать их на практике. Каждый из нас время от времени обращается за советом к коллегам или друзьям, но когда нужна проверенная информация, лучшие советчики – это специализированные издания.",
                date: "28/11/16 22:40"
            }, {
                title: "[Перевод] Руководство для начинающих VR-разработчиков",
                imgUrl: "https://habrastorage.org/files/c3b/6bb/d40/c3b6bbd40dc847e2ab3246f6a028fc01.jpg",
                description: "В этом руководстве собраны базовые ссылки и рекомендации, которые могут послужить вам точкой отсчёта в освоении VR-разработки. 1. Изучаем оборудование Спросите себя: меня интересует разработка для десктопных устройств, наподобие HTC Vive, или меня больше привлекают мобильные устройства вроде Samsung Gear VR или Google Cardboard? Если вы пока не определились, то почитайте обзоры и подумайте о том, что лучше выбрать для вашего рынка. Если для ваших идей требуются контроллеры движения или качественная графика, то ориентируйтесь на подключаемые к компьютеру очки VR. Модели, которые сегодня поддерживаются движками Unity, Unreal и веб-реaлизациями:",
                date: "24/11/16 14:12"
            }]
        }
    }
    return {
        categorySidebar : getCategorySidebar(),
        dataArticles : getDataArticles()
    }
}]);