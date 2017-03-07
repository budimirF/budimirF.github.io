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
                    feeds: ['dashboardService', 'articlesService', 'sidebarService', function(dashboardService, articlesService, sidebarService) {
                        return dashboardService.getAllFeeds().then(function(res) {
                            sidebarService.setListFeeds(res.data);
                            // return articlesService.getAllArticles(res.data).then(function(res) {
                            //     articlesService.setAllArticles(res);
                            //     return res;
                            // }, function(error) {
                            //     console.log("Can't resolving", error);
                            // });
                            // console.log('resolve', res.data);
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

(function() {
    'use strict';
    angular.module('rssReader').controller('addController', ['$scope', '$state', 'addFeedService', 'articlesService', 'sidebarService', function($scope, $state, addFeedService, articlesService, sidebarService) {
        // $scope.feed = {};
        $scope.getFeed = function () {
            articlesService.getFeedFromFeedparser($scope.feedUrl).then(function(res) {
                var feed = addFeedService.getParsedFeed(res, $scope.feedCategory);
                addFeedService.saveFeed(feed, $scope.feedUrl).then(function (res) {
                    sidebarService.setListFeeds([res.data]);
                    $state.go('dashboard.list-lg', {type: 'id', value:res.data._id});
                });
            });
        }
    }]);

})();
(function() {
    'use strict';
    angular.module('rssReader').controller('articlesController', ['$scope', '$state', '$stateParams', 'dashboardService', 'articlesService', function($scope, $state, $stateParams, dashboardService, articlesService) {
        // console.log('$stateParams', $stateParams.type, $stateParams.value);

        if ($stateParams.type == "id") {
            articlesService.getFeedById($stateParams.value).then(function(res) {
                $scope.articles = res;
            });
        }

        if (($stateParams.type == "category") && ($stateParams.value != 'All')) {
            articlesService.getFeedByCat($stateParams.value).then(function(res) {
                $scope.articles = res;
            });
        }

        if ((!$stateParams.type) || ($stateParams.value == 'All')) {
            articlesService.getAllFeeds().then(function(res) {
                // articlesService.getArticles(res.data).then(function(res) {
                    // console.log(res);
                    $scope.articles = res;
                // });
            });
        } 



        // $scope.articles = dashboardService.getArticles($stateParams.sort, 'articlesController');
        // console.log($scope.articles);
        // $scope.readArticle = function (article) {
        //     $state.go('dashboard.article', {param : article});

        // }; 
    }]);

})();

(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', '$stateParams','addFeedService', 'dashboardService', 'feeds', function($scope, $state, $stateParams, addFeedService, dashboardService, feeds) {
        // console.log(!!$scope.articles.length);
        
        $scope.$watch(function () {
            return dashboardService.getSortParam();
        }, function () {
            $scope.titleFeed = dashboardService.getSortParam();
        });


        $scope.readArticle = function (feedId, link) {
            $state.go('^.article', {feed: feedId, link: link}); 
        }

        if (!feeds.length) {
            $state.go('dashboard.add');
        } 
        else {
            console.log('$state.params', $state.params, $state.params.current);
            if (!Object.entries($state.params).length) {
                $state.go('dashboard.list-lg', {type: $state.params.type, value: $state.params.value});
            }
             //add $state.params variables
            // $state.go($state.params.current, $state.params); 

        }

        $scope.isRead = function() {
            var re = new RegExp("dashboard.add");
            return (!re.test($state.current.name));
        }

        $scope.getAllFeed = function () {
            console.log($state.params, $state.current);
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


/*!
 * Bootstrap v3.3.7 (http://getbootstrap.com)
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under the MIT license
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery')
}

+function ($) {
  'use strict';
  var version = $.fn.jquery.split(' ')[0].split('.')
  if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 4')
  }
}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.7
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.7'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector === '#' ? [] : selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.7
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.7'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d).prop(d, true)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d).prop(d, false)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target).closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
        // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
        e.preventDefault()
        // The target component still receive the focus
        if ($btn.is('input,button')) $btn.trigger('focus')
        else $btn.find('input:visible,button:visible').first().trigger('focus')
      }
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.7'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.7'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.7'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.7'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.7'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.7'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.7'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/*!
 * Jasny Bootstrap v3.1.3 (http://jasny.github.io/bootstrap)
 * Copyright 2012-2014 Arnold Daniels
 * Licensed under Apache-2.0 (https://github.com/jasny/bootstrap/blob/master/LICENSE)
 */

if (typeof jQuery === 'undefined') { throw new Error('Jasny Bootstrap\'s JavaScript requires jQuery') }

/* ========================================================================
 * Bootstrap: transition.js v3.1.3
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  if ($.support.transition !== undefined) return  // Prevent conflict with Twitter Bootstrap

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: offcanvas.js v3.1.3
 * http://jasny.github.io/bootstrap/javascript/#offcanvas
 * ========================================================================
 * Copyright 2013-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+function ($) { "use strict";

  // OFFCANVAS PUBLIC CLASS DEFINITION
  // =================================

  var OffCanvas = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, OffCanvas.DEFAULTS, options)
    this.state    = null
    this.placement = null
    
    if (this.options.recalc) {
      this.calcClone()
      $(window).on('resize', $.proxy(this.recalc, this))
    }
    
    if (this.options.autohide)
      $(document).on('click', $.proxy(this.autohide, this))

    if (this.options.toggle) this.toggle()
    
    if (this.options.disablescrolling) {
        this.options.disableScrolling = this.options.disablescrolling
        delete this.options.disablescrolling
    }
  }

  OffCanvas.DEFAULTS = {
    toggle: true,
    placement: 'auto',
    autohide: true,
    recalc: true,
    disableScrolling: true
  }

  OffCanvas.prototype.offset = function () {
    switch (this.placement) {
      case 'left':
      case 'right':  return this.$element.outerWidth()
      case 'top':
      case 'bottom': return this.$element.outerHeight()
    }
  }
  
  OffCanvas.prototype.calcPlacement = function () {
    if (this.options.placement !== 'auto') {
        this.placement = this.options.placement
        return
    }
    
    if (!this.$element.hasClass('in')) {
      this.$element.css('visiblity', 'hidden !important').addClass('in')
    } 
    
    var horizontal = $(window).width() / this.$element.width()
    var vertical = $(window).height() / this.$element.height()
        
    var element = this.$element
    function ab(a, b) {
      if (element.css(b) === 'auto') return a
      if (element.css(a) === 'auto') return b
      
      var size_a = parseInt(element.css(a), 10)
      var size_b = parseInt(element.css(b), 10)
  
      return size_a > size_b ? b : a
    }
    
    this.placement = horizontal >= vertical ? ab('left', 'right') : ab('top', 'bottom')
      
    if (this.$element.css('visibility') === 'hidden !important') {
      this.$element.removeClass('in').css('visiblity', '')
    }
  }
  
  OffCanvas.prototype.opposite = function (placement) {
    switch (placement) {
      case 'top':    return 'bottom'
      case 'left':   return 'right'
      case 'bottom': return 'top'
      case 'right':  return 'left'
    }
  }
  
  OffCanvas.prototype.getCanvasElements = function() {
    // Return a set containing the canvas plus all fixed elements
    var canvas = this.options.canvas ? $(this.options.canvas) : this.$element
    
    var fixed_elements = canvas.find('*').filter(function() {
      return $(this).css('position') === 'fixed'
    }).not(this.options.exclude)
    
    return canvas.add(fixed_elements)
  }
  
  OffCanvas.prototype.slide = function (elements, offset, callback) {
    // Use jQuery animation if CSS transitions aren't supported
    if (!$.support.transition) {
      var anim = {}
      anim[this.placement] = "+=" + offset
      return elements.animate(anim, 350, callback)
    }

    var placement = this.placement
    var opposite = this.opposite(placement)
    
    elements.each(function() {
      if ($(this).css(placement) !== 'auto')
        $(this).css(placement, (parseInt($(this).css(placement), 10) || 0) + offset)
      
      if ($(this).css(opposite) !== 'auto')
        $(this).css(opposite, (parseInt($(this).css(opposite), 10) || 0) - offset)
    })
    
    this.$element
      .one($.support.transition.end, callback)
      .emulateTransitionEnd(350)
  }

  OffCanvas.prototype.disableScrolling = function() {
    var bodyWidth = $('body').width()
    var prop = 'padding-' + this.opposite(this.placement)

    if ($('body').data('offcanvas-style') === undefined) {
      $('body').data('offcanvas-style', $('body').attr('style') || '')
    }
      
    $('body').css('overflow', 'hidden')

    if ($('body').width() > bodyWidth) {
      var padding = parseInt($('body').css(prop), 10) + $('body').width() - bodyWidth
      
      setTimeout(function() {
        $('body').css(prop, padding)
      }, 1)
    }
  }

  OffCanvas.prototype.show = function () {
    if (this.state) return
    
    var startEvent = $.Event('show.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    this.state = 'slide-in'
    this.calcPlacement();
    
    var elements = this.getCanvasElements()
    var placement = this.placement
    var opposite = this.opposite(placement)
    var offset = this.offset()

    if (elements.index(this.$element) !== -1) {
      $(this.$element).data('offcanvas-style', $(this.$element).attr('style') || '')
      this.$element.css(placement, -1 * offset)
      this.$element.css(placement); // Workaround: Need to get the CSS property for it to be applied before the next line of code
    }

    elements.addClass('canvas-sliding').each(function() {
      if ($(this).data('offcanvas-style') === undefined) $(this).data('offcanvas-style', $(this).attr('style') || '')
      if ($(this).css('position') === 'static') $(this).css('position', 'relative')
      if (($(this).css(placement) === 'auto' || $(this).css(placement) === '0px') &&
          ($(this).css(opposite) === 'auto' || $(this).css(opposite) === '0px')) {
        $(this).css(placement, 0)
      }
    })
    
    if (this.options.disableScrolling) this.disableScrolling()
    
    var complete = function () {
      if (this.state != 'slide-in') return
      
      this.state = 'slid'

      elements.removeClass('canvas-sliding').addClass('canvas-slid')
      this.$element.trigger('shown.bs.offcanvas')
    }

    setTimeout($.proxy(function() {
      this.$element.addClass('in')
      this.slide(elements, offset, $.proxy(complete, this))
    }, this), 1)
  }

  OffCanvas.prototype.hide = function (fast) {
    if (this.state !== 'slid') return

    var startEvent = $.Event('hide.bs.offcanvas')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    this.state = 'slide-out'

    var elements = $('.canvas-slid')
    var placement = this.placement
    var offset = -1 * this.offset()

    var complete = function () {
      if (this.state != 'slide-out') return
      
      this.state = null
      this.placement = null
      
      this.$element.removeClass('in')
      
      elements.removeClass('canvas-sliding')
      elements.add(this.$element).add('body').each(function() {
        $(this).attr('style', $(this).data('offcanvas-style')).removeData('offcanvas-style')
      })

      this.$element.trigger('hidden.bs.offcanvas')
    }

    elements.removeClass('canvas-slid').addClass('canvas-sliding')
    
    setTimeout($.proxy(function() {
      this.slide(elements, offset, $.proxy(complete, this))
    }, this), 1)
  }

  OffCanvas.prototype.toggle = function () {
    if (this.state === 'slide-in' || this.state === 'slide-out') return
    this[this.state === 'slid' ? 'hide' : 'show']()
  }

  OffCanvas.prototype.calcClone = function() {
    this.$calcClone = this.$element.clone()
      .html('')
      .addClass('offcanvas-clone').removeClass('in')
      .appendTo($('body'))
  }

  OffCanvas.prototype.recalc = function () {
    if (this.$calcClone.css('display') === 'none' || (this.state !== 'slid' && this.state !== 'slide-in')) return
    
    this.state = null
    this.placement = null
    var elements = this.getCanvasElements()
    
    this.$element.removeClass('in')
    
    elements.removeClass('canvas-slid')
    elements.add(this.$element).add('body').each(function() {
      $(this).attr('style', $(this).data('offcanvas-style')).removeData('offcanvas-style')
    })
  }
  
  OffCanvas.prototype.autohide = function (e) {
    if ($(e.target).closest(this.$element).length === 0) this.hide()
  }

  // OFFCANVAS PLUGIN DEFINITION
  // ==========================

  var old = $.fn.offcanvas

  $.fn.offcanvas = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.offcanvas')
      var options = $.extend({}, OffCanvas.DEFAULTS, $this.data(), typeof option === 'object' && option)

      if (!data) $this.data('bs.offcanvas', (data = new OffCanvas(this, options)))
      if (typeof option === 'string') data[option]()
    })
  }

  $.fn.offcanvas.Constructor = OffCanvas


  // OFFCANVAS NO CONFLICT
  // ====================

  $.fn.offcanvas.noConflict = function () {
    $.fn.offcanvas = old
    return this
  }


  // OFFCANVAS DATA-API
  // =================

  $(document).on('click.bs.offcanvas.data-api', '[data-toggle=offcanvas]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $canvas = $(target)
    var data    = $canvas.data('bs.offcanvas')
    var option  = data ? 'toggle' : $this.data()

    e.stopPropagation()

    if (data) data.toggle()
      else $canvas.offcanvas(option)
  })

}(window.jQuery);

/* ============================================================
 * Bootstrap: rowlink.js v3.1.3
 * http://jasny.github.io/bootstrap/javascript/#rowlink
 * ============================================================
 * Copyright 2012-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

+function ($) { "use strict";

  var Rowlink = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, Rowlink.DEFAULTS, options)
    
    this.$element.on('click.bs.rowlink', 'td:not(.rowlink-skip)', $.proxy(this.click, this))
  }

  Rowlink.DEFAULTS = {
    target: "a"
  }

  Rowlink.prototype.click = function(e) {
    var target = $(e.currentTarget).closest('tr').find(this.options.target)[0]
    if ($(e.target)[0] === target) return
    
    e.preventDefault();
    
    if (target.click) {
      target.click()
    } else if (document.createEvent) {
      var evt = document.createEvent("MouseEvents"); 
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null); 
      target.dispatchEvent(evt);
    }
  }

  
  // ROWLINK PLUGIN DEFINITION
  // ===========================

  var old = $.fn.rowlink

  $.fn.rowlink = function (options) {
    return this.each(function () {
      var $this = $(this)
      var data = $this.data('bs.rowlink')
      if (!data) $this.data('bs.rowlink', (data = new Rowlink(this, options)))
    })
  }

  $.fn.rowlink.Constructor = Rowlink


  // ROWLINK NO CONFLICT
  // ====================

  $.fn.rowlink.noConflict = function () {
    $.fn.rowlink = old
    return this
  }


  // ROWLINK DATA-API
  // ==================

  $(document).on('click.bs.rowlink.data-api', '[data-link="row"]', function (e) {
    if ($(e.target).closest('.rowlink-skip').length !== 0) return
    
    var $this = $(this)
    if ($this.data('bs.rowlink')) return
    $this.rowlink($this.data())
    $(e.target).trigger('click.bs.rowlink')
  })
  
}(window.jQuery);

/* ===========================================================
 * Bootstrap: inputmask.js v3.1.0
 * http://jasny.github.io/bootstrap/javascript/#inputmask
 * 
 * Based on Masked Input plugin by Josh Bush (digitalbush.com)
 * ===========================================================
 * Copyright 2012-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

+function ($) { "use strict";

  var isIphone = (window.orientation !== undefined)
  var isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1
  var isIE = window.navigator.appName == 'Microsoft Internet Explorer'

  // INPUTMASK PUBLIC CLASS DEFINITION
  // =================================

  var Inputmask = function (element, options) {
    if (isAndroid) return // No support because caret positioning doesn't work on Android
    
    this.$element = $(element)
    this.options = $.extend({}, Inputmask.DEFAULTS, options)
    this.mask = String(this.options.mask)
    
    this.init()
    this.listen()
        
    this.checkVal() //Perform initial check for existing values
  }

  Inputmask.DEFAULTS = {
    mask: "",
    placeholder: "_",
    definitions: {
      '9': "[0-9]",
      'a': "[A-Za-z]",
      'w': "[A-Za-z0-9]",
      '*': "."
    }
  }

  Inputmask.prototype.init = function() {
    var defs = this.options.definitions
    var len = this.mask.length

    this.tests = [] 
    this.partialPosition = this.mask.length
    this.firstNonMaskPos = null

    $.each(this.mask.split(""), $.proxy(function(i, c) {
      if (c == '?') {
        len--
        this.partialPosition = i
      } else if (defs[c]) {
        this.tests.push(new RegExp(defs[c]))
        if (this.firstNonMaskPos === null)
          this.firstNonMaskPos =  this.tests.length - 1
      } else {
        this.tests.push(null)
      }
    }, this))

    this.buffer = $.map(this.mask.split(""), $.proxy(function(c, i) {
      if (c != '?') return defs[c] ? this.options.placeholder : c
    }, this))

    this.focusText = this.$element.val()

    this.$element.data("rawMaskFn", $.proxy(function() {
      return $.map(this.buffer, function(c, i) {
        return this.tests[i] && c != this.options.placeholder ? c : null
      }).join('')
    }, this))
  }
    
  Inputmask.prototype.listen = function() {
    if (this.$element.attr("readonly")) return

    var pasteEventName = (isIE ? 'paste' : 'input') + ".mask"

    this.$element
      .on("unmask.bs.inputmask", $.proxy(this.unmask, this))

      .on("focus.bs.inputmask", $.proxy(this.focusEvent, this))
      .on("blur.bs.inputmask", $.proxy(this.blurEvent, this))

      .on("keydown.bs.inputmask", $.proxy(this.keydownEvent, this))
      .on("keypress.bs.inputmask", $.proxy(this.keypressEvent, this))

      .on(pasteEventName, $.proxy(this.pasteEvent, this))
  }

  //Helper Function for Caret positioning
  Inputmask.prototype.caret = function(begin, end) {
    if (this.$element.length === 0) return
    if (typeof begin == 'number') {
      end = (typeof end == 'number') ? end : begin
      return this.$element.each(function() {
        if (this.setSelectionRange) {
          this.setSelectionRange(begin, end)
        } else if (this.createTextRange) {
          var range = this.createTextRange()
          range.collapse(true)
          range.moveEnd('character', end)
          range.moveStart('character', begin)
          range.select()
        }
      })
    } else {
      if (this.$element[0].setSelectionRange) {
        begin = this.$element[0].selectionStart
        end = this.$element[0].selectionEnd
      } else if (document.selection && document.selection.createRange) {
        var range = document.selection.createRange()
        begin = 0 - range.duplicate().moveStart('character', -100000)
        end = begin + range.text.length
      }
      return {
        begin: begin, 
        end: end
      }
    }
  }
  
  Inputmask.prototype.seekNext = function(pos) {
    var len = this.mask.length
    while (++pos <= len && !this.tests[pos]);

    return pos
  }
  
  Inputmask.prototype.seekPrev = function(pos) {
    while (--pos >= 0 && !this.tests[pos]);

    return pos
  }

  Inputmask.prototype.shiftL = function(begin,end) {
    var len = this.mask.length

    if (begin < 0) return

    for (var i = begin, j = this.seekNext(end); i < len; i++) {
      if (this.tests[i]) {
        if (j < len && this.tests[i].test(this.buffer[j])) {
          this.buffer[i] = this.buffer[j]
          this.buffer[j] = this.options.placeholder
        } else
          break
        j = this.seekNext(j)
      }
    }
    this.writeBuffer()
    this.caret(Math.max(this.firstNonMaskPos, begin))
  }

  Inputmask.prototype.shiftR = function(pos) {
    var len = this.mask.length

    for (var i = pos, c = this.options.placeholder; i < len; i++) {
      if (this.tests[i]) {
        var j = this.seekNext(i)
        var t = this.buffer[i]
        this.buffer[i] = c
        if (j < len && this.tests[j].test(t))
          c = t
        else
          break
      }
    }
  },

  Inputmask.prototype.unmask = function() {
    this.$element
      .unbind(".mask")
      .removeData("inputmask")
  }

  Inputmask.prototype.focusEvent = function() {
    this.focusText = this.$element.val()
    var len = this.mask.length 
    var pos = this.checkVal()
    this.writeBuffer()

    var that = this
    var moveCaret = function() {
      if (pos == len)
        that.caret(0, pos)
      else
        that.caret(pos)
    }

    moveCaret()
    setTimeout(moveCaret, 50)
  }

  Inputmask.prototype.blurEvent = function() {
    this.checkVal()
    if (this.$element.val() !== this.focusText)
      this.$element.trigger('change')
  }

  Inputmask.prototype.keydownEvent = function(e) {
    var k = e.which

    //backspace, delete, and escape get special treatment
    if (k == 8 || k == 46 || (isIphone && k == 127)) {
      var pos = this.caret(),
      begin = pos.begin,
      end = pos.end

      if (end - begin === 0) {
        begin = k != 46 ? this.seekPrev(begin) : (end = this.seekNext(begin - 1))
        end = k == 46 ? this.seekNext(end) : end
      }
      this.clearBuffer(begin, end)
      this.shiftL(begin, end - 1)

      return false
    } else if (k == 27) {//escape
      this.$element.val(this.focusText)
      this.caret(0, this.checkVal())
      return false
    }
  }

  Inputmask.prototype.keypressEvent = function(e) {
    var len = this.mask.length

    var k = e.which,
    pos = this.caret()

    if (e.ctrlKey || e.altKey || e.metaKey || k < 32)  {//Ignore
      return true
    } else if (k) {
      if (pos.end - pos.begin !== 0) {
        this.clearBuffer(pos.begin, pos.end)
        this.shiftL(pos.begin, pos.end - 1)
      }

      var p = this.seekNext(pos.begin - 1)
      if (p < len) {
        var c = String.fromCharCode(k)
        if (this.tests[p].test(c)) {
          this.shiftR(p)
          this.buffer[p] = c
          this.writeBuffer()
          var next = this.seekNext(p)
          this.caret(next)
        }
      }
      return false
    }
  }

  Inputmask.prototype.pasteEvent = function() {
    var that = this

    setTimeout(function() {
      that.caret(that.checkVal(true))
    }, 0)
  }

  Inputmask.prototype.clearBuffer = function(start, end) {
    var len = this.mask.length

    for (var i = start; i < end && i < len; i++) {
      if (this.tests[i])
        this.buffer[i] = this.options.placeholder
    }
  }

  Inputmask.prototype.writeBuffer = function() {
    return this.$element.val(this.buffer.join('')).val()
  }

  Inputmask.prototype.checkVal = function(allow) {
    var len = this.mask.length
    //try to place characters where they belong
    var test = this.$element.val()
    var lastMatch = -1

    for (var i = 0, pos = 0; i < len; i++) {
      if (this.tests[i]) {
        this.buffer[i] = this.options.placeholder
        while (pos++ < test.length) {
          var c = test.charAt(pos - 1)
          if (this.tests[i].test(c)) {
            this.buffer[i] = c
            lastMatch = i
            break
          }
        }
        if (pos > test.length)
          break
      } else if (this.buffer[i] == test.charAt(pos) && i != this.partialPosition) {
        pos++
        lastMatch = i
      }
    }
    if (!allow && lastMatch + 1 < this.partialPosition) {
      this.$element.val("")
      this.clearBuffer(0, len)
    } else if (allow || lastMatch + 1 >= this.partialPosition) {
      this.writeBuffer()
      if (!allow) this.$element.val(this.$element.val().substring(0, lastMatch + 1))
    }
    return (this.partialPosition ? i : this.firstNonMaskPos)
  }

  
  // INPUTMASK PLUGIN DEFINITION
  // ===========================

  var old = $.fn.inputmask
  
  $.fn.inputmask = function (options) {
    return this.each(function () {
      var $this = $(this)
      var data = $this.data('bs.inputmask')
      
      if (!data) $this.data('bs.inputmask', (data = new Inputmask(this, options)))
    })
  }

  $.fn.inputmask.Constructor = Inputmask


  // INPUTMASK NO CONFLICT
  // ====================

  $.fn.inputmask.noConflict = function () {
    $.fn.inputmask = old
    return this
  }


  // INPUTMASK DATA-API
  // ==================

  $(document).on('focus.bs.inputmask.data-api', '[data-mask]', function (e) {
    var $this = $(this)
    if ($this.data('bs.inputmask')) return
    $this.inputmask($this.data())
  })

}(window.jQuery);

/* ===========================================================
 * Bootstrap: fileinput.js v3.1.3
 * http://jasny.github.com/bootstrap/javascript/#fileinput
 * ===========================================================
 * Copyright 2012-2014 Arnold Daniels
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

+function ($) { "use strict";

  var isIE = window.navigator.appName == 'Microsoft Internet Explorer'

  // FILEUPLOAD PUBLIC CLASS DEFINITION
  // =================================

  var Fileinput = function (element, options) {
    this.$element = $(element)
    
    this.$input = this.$element.find(':file')
    if (this.$input.length === 0) return

    this.name = this.$input.attr('name') || options.name

    this.$hidden = this.$element.find('input[type=hidden][name="' + this.name + '"]')
    if (this.$hidden.length === 0) {
      this.$hidden = $('<input type="hidden">').insertBefore(this.$input)
    }

    this.$preview = this.$element.find('.fileinput-preview')
    var height = this.$preview.css('height')
    if (this.$preview.css('display') !== 'inline' && height !== '0px' && height !== 'none') {
      this.$preview.css('line-height', height)
    }
        
    this.original = {
      exists: this.$element.hasClass('fileinput-exists'),
      preview: this.$preview.html(),
      hiddenVal: this.$hidden.val()
    }
    
    this.listen()
  }
  
  Fileinput.prototype.listen = function() {
    this.$input.on('change.bs.fileinput', $.proxy(this.change, this))
    $(this.$input[0].form).on('reset.bs.fileinput', $.proxy(this.reset, this))
    
    this.$element.find('[data-trigger="fileinput"]').on('click.bs.fileinput', $.proxy(this.trigger, this))
    this.$element.find('[data-dismiss="fileinput"]').on('click.bs.fileinput', $.proxy(this.clear, this))
  },

  Fileinput.prototype.change = function(e) {
    var files = e.target.files === undefined ? (e.target && e.target.value ? [{ name: e.target.value.replace(/^.+\\/, '')}] : []) : e.target.files
    
    e.stopPropagation()

    if (files.length === 0) {
      this.clear()
      return
    }

    this.$hidden.val('')
    this.$hidden.attr('name', '')
    this.$input.attr('name', this.name)

    var file = files[0]

    if (this.$preview.length > 0 && (typeof file.type !== "undefined" ? file.type.match(/^image\/(gif|png|jpeg)$/) : file.name.match(/\.(gif|png|jpe?g)$/i)) && typeof FileReader !== "undefined") {
      var reader = new FileReader()
      var preview = this.$preview
      var element = this.$element

      reader.onload = function(re) {
        var $img = $('<img>')
        $img[0].src = re.target.result
        files[0].result = re.target.result
        
        element.find('.fileinput-filename').text(file.name)
        
        // if parent has max-height, using `(max-)height: 100%` on child doesn't take padding and border into account
        if (preview.css('max-height') != 'none') $img.css('max-height', parseInt(preview.css('max-height'), 10) - parseInt(preview.css('padding-top'), 10) - parseInt(preview.css('padding-bottom'), 10)  - parseInt(preview.css('border-top'), 10) - parseInt(preview.css('border-bottom'), 10))
        
        preview.html($img)
        element.addClass('fileinput-exists').removeClass('fileinput-new')

        element.trigger('change.bs.fileinput', files)
      }

      reader.readAsDataURL(file)
    } else {
      this.$element.find('.fileinput-filename').text(file.name)
      this.$preview.text(file.name)
      
      this.$element.addClass('fileinput-exists').removeClass('fileinput-new')
      
      this.$element.trigger('change.bs.fileinput')
    }
  },

  Fileinput.prototype.clear = function(e) {
    if (e) e.preventDefault()
    
    this.$hidden.val('')
    this.$hidden.attr('name', this.name)
    this.$input.attr('name', '')

    //ie8+ doesn't support changing the value of input with type=file so clone instead
    if (isIE) { 
      var inputClone = this.$input.clone(true);
      this.$input.after(inputClone);
      this.$input.remove();
      this.$input = inputClone;
    } else {
      this.$input.val('')
    }

    this.$preview.html('')
    this.$element.find('.fileinput-filename').text('')
    this.$element.addClass('fileinput-new').removeClass('fileinput-exists')
    
    if (e !== undefined) {
      this.$input.trigger('change')
      this.$element.trigger('clear.bs.fileinput')
    }
  },

  Fileinput.prototype.reset = function() {
    this.clear()

    this.$hidden.val(this.original.hiddenVal)
    this.$preview.html(this.original.preview)
    this.$element.find('.fileinput-filename').text('')

    if (this.original.exists) this.$element.addClass('fileinput-exists').removeClass('fileinput-new')
     else this.$element.addClass('fileinput-new').removeClass('fileinput-exists')
    
    this.$element.trigger('reset.bs.fileinput')
  },

  Fileinput.prototype.trigger = function(e) {
    this.$input.trigger('click')
    e.preventDefault()
  }

  
  // FILEUPLOAD PLUGIN DEFINITION
  // ===========================

  var old = $.fn.fileinput
  
  $.fn.fileinput = function (options) {
    return this.each(function () {
      var $this = $(this),
          data = $this.data('bs.fileinput')
      if (!data) $this.data('bs.fileinput', (data = new Fileinput(this, options)))
      if (typeof options == 'string') data[options]()
    })
  }

  $.fn.fileinput.Constructor = Fileinput


  // FILEINPUT NO CONFLICT
  // ====================

  $.fn.fileinput.noConflict = function () {
    $.fn.fileinput = old
    return this
  }


  // FILEUPLOAD DATA-API
  // ==================

  $(document).on('click.fileinput.data-api', '[data-provides="fileinput"]', function (e) {
    var $this = $(this)
    if ($this.data('bs.fileinput')) return
    $this.fileinput($this.data())
      
    var $target = $(e.target).closest('[data-dismiss="fileinput"],[data-trigger="fileinput"]');
    if ($target.length > 0) {
      e.preventDefault()
      $target.trigger('click.bs.fileinput')
    }
  })

}(window.jQuery);

//! moment.js
//! version : 2.17.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return od.apply(null,arguments)}
// This is done to register the method called with moment()
// without creating circular dependencies.
function b(a){od=a}function c(a){return a instanceof Array||"[object Array]"===Object.prototype.toString.call(a)}function d(a){
// IE8 will treat undefined and null as object if it wasn't for
// input != null
return null!=a&&"[object Object]"===Object.prototype.toString.call(a)}function e(a){var b;for(b in a)
// even if its not own property I'd still call it non-empty
return!1;return!0}function f(a){return"number"==typeof a||"[object Number]"===Object.prototype.toString.call(a)}function g(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function h(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function i(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function j(a,b){for(var c in b)i(b,c)&&(a[c]=b[c]);return i(b,"toString")&&(a.toString=b.toString),i(b,"valueOf")&&(a.valueOf=b.valueOf),a}function k(a,b,c,d){return rb(a,b,c,d,!0).utc()}function l(){
// We need to deep clone this object.
return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null}}function m(a){return null==a._pf&&(a._pf=l()),a._pf}function n(a){if(null==a._isValid){var b=m(a),c=qd.call(b.parsedDateParts,function(a){return null!=a}),d=!isNaN(a._d.getTime())&&b.overflow<0&&!b.empty&&!b.invalidMonth&&!b.invalidWeekday&&!b.nullInput&&!b.invalidFormat&&!b.userInvalidated&&(!b.meridiem||b.meridiem&&c);if(a._strict&&(d=d&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour),null!=Object.isFrozen&&Object.isFrozen(a))return d;a._isValid=d}return a._isValid}function o(a){var b=k(NaN);return null!=a?j(m(b),a):m(b).userInvalidated=!0,b}function p(a){return void 0===a}function q(a,b){var c,d,e;if(p(b._isAMomentObject)||(a._isAMomentObject=b._isAMomentObject),p(b._i)||(a._i=b._i),p(b._f)||(a._f=b._f),p(b._l)||(a._l=b._l),p(b._strict)||(a._strict=b._strict),p(b._tzm)||(a._tzm=b._tzm),p(b._isUTC)||(a._isUTC=b._isUTC),p(b._offset)||(a._offset=b._offset),p(b._pf)||(a._pf=m(b)),p(b._locale)||(a._locale=b._locale),rd.length>0)for(c in rd)d=rd[c],e=b[d],p(e)||(a[d]=e);return a}
// Moment prototype object
function r(b){q(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),
// Prevent infinite loop in case updateOffset creates new moment
// objects.
sd===!1&&(sd=!0,a.updateOffset(this),sd=!1)}function s(a){return a instanceof r||null!=a&&null!=a._isAMomentObject}function t(a){return a<0?Math.ceil(a)||0:Math.floor(a)}function u(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=t(b)),c}
// compare two arrays, return the number of differences
function v(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;d<e;d++)(c&&a[d]!==b[d]||!c&&u(a[d])!==u(b[d]))&&g++;return g+f}function w(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function x(b,c){var d=!0;return j(function(){if(null!=a.deprecationHandler&&a.deprecationHandler(null,b),d){for(var e,f=[],g=0;g<arguments.length;g++){if(e="","object"==typeof arguments[g]){e+="\n["+g+"] ";for(var h in arguments[0])e+=h+": "+arguments[0][h]+", ";e=e.slice(0,-2)}else e=arguments[g];f.push(e)}w(b+"\nArguments: "+Array.prototype.slice.call(f).join("")+"\n"+(new Error).stack),d=!1}return c.apply(this,arguments)},c)}function y(b,c){null!=a.deprecationHandler&&a.deprecationHandler(b,c),td[b]||(w(c),td[b]=!0)}function z(a){return a instanceof Function||"[object Function]"===Object.prototype.toString.call(a)}function A(a){var b,c;for(c in a)b=a[c],z(b)?this[c]=b:this["_"+c]=b;this._config=a,
// Lenient ordinal parsing accepts just a number in addition to
// number + (possibly) stuff coming from _ordinalParseLenient.
this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function B(a,b){var c,e=j({},a);for(c in b)i(b,c)&&(d(a[c])&&d(b[c])?(e[c]={},j(e[c],a[c]),j(e[c],b[c])):null!=b[c]?e[c]=b[c]:delete e[c]);for(c in a)i(a,c)&&!i(b,c)&&d(a[c])&&(
// make sure changes to properties don't modify parent config
e[c]=j({},e[c]));return e}function C(a){null!=a&&this.set(a)}function D(a,b,c){var d=this._calendar[a]||this._calendar.sameElse;return z(d)?d.call(b,c):d}function E(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function F(){return this._invalidDate}function G(a){return this._ordinal.replace("%d",a)}function H(a,b,c,d){var e=this._relativeTime[c];return z(e)?e(a,b,c,d):e.replace(/%d/i,a)}function I(a,b){var c=this._relativeTime[a>0?"future":"past"];return z(c)?c(b):c.replace(/%s/i,b)}function J(a,b){var c=a.toLowerCase();Dd[c]=Dd[c+"s"]=Dd[b]=a}function K(a){return"string"==typeof a?Dd[a]||Dd[a.toLowerCase()]:void 0}function L(a){var b,c,d={};for(c in a)i(a,c)&&(b=K(c),b&&(d[b]=a[c]));return d}function M(a,b){Ed[a]=b}function N(a){var b=[];for(var c in a)b.push({unit:c,priority:Ed[c]});return b.sort(function(a,b){return a.priority-b.priority}),b}function O(b,c){return function(d){return null!=d?(Q(this,b,d),a.updateOffset(this,c),this):P(this,b)}}function P(a,b){return a.isValid()?a._d["get"+(a._isUTC?"UTC":"")+b]():NaN}function Q(a,b,c){a.isValid()&&a._d["set"+(a._isUTC?"UTC":"")+b](c)}
// MOMENTS
function R(a){return a=K(a),z(this[a])?this[a]():this}function S(a,b){if("object"==typeof a){a=L(a);for(var c=N(a),d=0;d<c.length;d++)this[c[d].unit](a[c[d].unit])}else if(a=K(a),z(this[a]))return this[a](b);return this}function T(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}
// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function U(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Id[a]=e),b&&(Id[b[0]]=function(){return T(e.apply(this,arguments),b[1],b[2])}),c&&(Id[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function V(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function W(a){var b,c,d=a.match(Fd);for(b=0,c=d.length;b<c;b++)Id[d[b]]?d[b]=Id[d[b]]:d[b]=V(d[b]);return function(b){var e,f="";for(e=0;e<c;e++)f+=d[e]instanceof Function?d[e].call(b,a):d[e];return f}}
// format date using native date object
function X(a,b){return a.isValid()?(b=Y(b,a.localeData()),Hd[b]=Hd[b]||W(b),Hd[b](a)):a.localeData().invalidDate()}function Y(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Gd.lastIndex=0;d>=0&&Gd.test(a);)a=a.replace(Gd,c),Gd.lastIndex=0,d-=1;return a}function Z(a,b,c){$d[a]=z(b)?b:function(a,d){return a&&c?c:b}}function $(a,b){return i($d,a)?$d[a](b._strict,b._locale):new RegExp(_(a))}
// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function _(a){return aa(a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}))}function aa(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function ba(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),f(b)&&(d=function(a,c){c[b]=u(a)}),c=0;c<a.length;c++)_d[a[c]]=d}function ca(a,b){ba(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function da(a,b,c){null!=b&&i(_d,a)&&_d[a](b,c._a,c,a)}function ea(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function fa(a,b){return a?c(this._months)?this._months[a.month()]:this._months[(this._months.isFormat||ke).test(b)?"format":"standalone"][a.month()]:this._months}function ga(a,b){return a?c(this._monthsShort)?this._monthsShort[a.month()]:this._monthsShort[ke.test(b)?"format":"standalone"][a.month()]:this._monthsShort}function ha(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._monthsParse)for(
// this is not used
this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],d=0;d<12;++d)f=k([2e3,d]),this._shortMonthsParse[d]=this.monthsShort(f,"").toLocaleLowerCase(),this._longMonthsParse[d]=this.months(f,"").toLocaleLowerCase();return c?"MMM"===b?(e=je.call(this._shortMonthsParse,g),e!==-1?e:null):(e=je.call(this._longMonthsParse,g),e!==-1?e:null):"MMM"===b?(e=je.call(this._shortMonthsParse,g),e!==-1?e:(e=je.call(this._longMonthsParse,g),e!==-1?e:null)):(e=je.call(this._longMonthsParse,g),e!==-1?e:(e=je.call(this._shortMonthsParse,g),e!==-1?e:null))}function ia(a,b,c){var d,e,f;if(this._monthsParseExact)return ha.call(this,a,b,c);
// TODO: add sorting
// Sorting makes sure if one month (or abbr) is a prefix of another
// see sorting in computeMonthsParse
for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;d<12;d++){
// test the regex
if(
// make the regex if we don't have it already
e=k([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}
// MOMENTS
function ja(a,b){var c;if(!a.isValid())
// No op
return a;if("string"==typeof b)if(/^\d+$/.test(b))b=u(b);else
// TODO: Another silent failure?
if(b=a.localeData().monthsParse(b),!f(b))return a;return c=Math.min(a.date(),ea(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a}function ka(b){return null!=b?(ja(this,b),a.updateOffset(this,!0),this):P(this,"Month")}function la(){return ea(this.year(),this.month())}function ma(a){return this._monthsParseExact?(i(this,"_monthsRegex")||oa.call(this),a?this._monthsShortStrictRegex:this._monthsShortRegex):(i(this,"_monthsShortRegex")||(this._monthsShortRegex=ne),this._monthsShortStrictRegex&&a?this._monthsShortStrictRegex:this._monthsShortRegex)}function na(a){return this._monthsParseExact?(i(this,"_monthsRegex")||oa.call(this),a?this._monthsStrictRegex:this._monthsRegex):(i(this,"_monthsRegex")||(this._monthsRegex=oe),this._monthsStrictRegex&&a?this._monthsStrictRegex:this._monthsRegex)}function oa(){function a(a,b){return b.length-a.length}var b,c,d=[],e=[],f=[];for(b=0;b<12;b++)
// make the regex if we don't have it already
c=k([2e3,b]),d.push(this.monthsShort(c,"")),e.push(this.months(c,"")),f.push(this.months(c,"")),f.push(this.monthsShort(c,""));for(
// Sorting makes sure if one month (or abbr) is a prefix of another it
// will match the longer piece.
d.sort(a),e.sort(a),f.sort(a),b=0;b<12;b++)d[b]=aa(d[b]),e[b]=aa(e[b]);for(b=0;b<24;b++)f[b]=aa(f[b]);this._monthsRegex=new RegExp("^("+f.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+e.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+d.join("|")+")","i")}
// HELPERS
function pa(a){return qa(a)?366:365}function qa(a){return a%4===0&&a%100!==0||a%400===0}function ra(){return qa(this.year())}function sa(a,b,c,d,e,f,g){
//can't just apply() to create a date:
//http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
var h=new Date(a,b,c,d,e,f,g);
//the date constructor remaps years 0-99 to 1900-1999
return a<100&&a>=0&&isFinite(h.getFullYear())&&h.setFullYear(a),h}function ta(a){var b=new Date(Date.UTC.apply(null,arguments));
//the Date.UTC function remaps years 0-99 to 1900-1999
return a<100&&a>=0&&isFinite(b.getUTCFullYear())&&b.setUTCFullYear(a),b}
// start-of-first-week - start-of-year
function ua(a,b,c){var// first-week day -- which january is always in the first week (4 for iso, 1 for other)
d=7+b-c,
// first-week day local weekday -- which local weekday is fwd
e=(7+ta(a,0,d).getUTCDay()-b)%7;return-e+d-1}
//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function va(a,b,c,d,e){var f,g,h=(7+c-d)%7,i=ua(a,d,e),j=1+7*(b-1)+h+i;return j<=0?(f=a-1,g=pa(f)+j):j>pa(a)?(f=a+1,g=j-pa(a)):(f=a,g=j),{year:f,dayOfYear:g}}function wa(a,b,c){var d,e,f=ua(a.year(),b,c),g=Math.floor((a.dayOfYear()-f-1)/7)+1;return g<1?(e=a.year()-1,d=g+xa(e,b,c)):g>xa(a.year(),b,c)?(d=g-xa(a.year(),b,c),e=a.year()+1):(e=a.year(),d=g),{week:d,year:e}}function xa(a,b,c){var d=ua(a,b,c),e=ua(a+1,b,c);return(pa(a)-d+e)/7}
// HELPERS
// LOCALES
function ya(a){return wa(a,this._week.dow,this._week.doy).week}function za(){return this._week.dow}function Aa(){return this._week.doy}
// MOMENTS
function Ba(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function Ca(a){var b=wa(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}
// HELPERS
function Da(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Ea(a,b){return"string"==typeof a?b.weekdaysParse(a)%7||7:isNaN(a)?null:a}function Fa(a,b){return a?c(this._weekdays)?this._weekdays[a.day()]:this._weekdays[this._weekdays.isFormat.test(b)?"format":"standalone"][a.day()]:this._weekdays}function Ga(a){return a?this._weekdaysShort[a.day()]:this._weekdaysShort}function Ha(a){return a?this._weekdaysMin[a.day()]:this._weekdaysMin}function Ia(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],d=0;d<7;++d)f=k([2e3,1]).day(d),this._minWeekdaysParse[d]=this.weekdaysMin(f,"").toLocaleLowerCase(),this._shortWeekdaysParse[d]=this.weekdaysShort(f,"").toLocaleLowerCase(),this._weekdaysParse[d]=this.weekdays(f,"").toLocaleLowerCase();return c?"dddd"===b?(e=je.call(this._weekdaysParse,g),e!==-1?e:null):"ddd"===b?(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:null):(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null):"dddd"===b?(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null))):"ddd"===b?(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null))):(e=je.call(this._minWeekdaysParse,g),e!==-1?e:(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:null)))}function Ja(a,b,c){var d,e,f;if(this._weekdaysParseExact)return Ia.call(this,a,b,c);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),d=0;d<7;d++){
// test the regex
if(
// make the regex if we don't have it already
e=k([2e3,1]).day(d),c&&!this._fullWeekdaysParse[d]&&(this._fullWeekdaysParse[d]=new RegExp("^"+this.weekdays(e,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[d]=new RegExp("^"+this.weekdaysShort(e,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[d]=new RegExp("^"+this.weekdaysMin(e,"").replace(".",".?")+"$","i")),this._weekdaysParse[d]||(f="^"+this.weekdays(e,"")+"|^"+this.weekdaysShort(e,"")+"|^"+this.weekdaysMin(e,""),this._weekdaysParse[d]=new RegExp(f.replace(".",""),"i")),c&&"dddd"===b&&this._fullWeekdaysParse[d].test(a))return d;if(c&&"ddd"===b&&this._shortWeekdaysParse[d].test(a))return d;if(c&&"dd"===b&&this._minWeekdaysParse[d].test(a))return d;if(!c&&this._weekdaysParse[d].test(a))return d}}
// MOMENTS
function Ka(a){if(!this.isValid())return null!=a?this:NaN;var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Da(a,this.localeData()),this.add(a-b,"d")):b}function La(a){if(!this.isValid())return null!=a?this:NaN;var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function Ma(a){if(!this.isValid())return null!=a?this:NaN;
// behaves the same as moment#day except
// as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
// as a setter, sunday should belong to the previous week.
if(null!=a){var b=Ea(a,this.localeData());return this.day(this.day()%7?b:b-7)}return this.day()||7}function Na(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysStrictRegex:this._weekdaysRegex):(i(this,"_weekdaysRegex")||(this._weekdaysRegex=ue),this._weekdaysStrictRegex&&a?this._weekdaysStrictRegex:this._weekdaysRegex)}function Oa(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(i(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ve),this._weekdaysShortStrictRegex&&a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function Pa(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(i(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=we),this._weekdaysMinStrictRegex&&a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Qa(){function a(a,b){return b.length-a.length}var b,c,d,e,f,g=[],h=[],i=[],j=[];for(b=0;b<7;b++)
// make the regex if we don't have it already
c=k([2e3,1]).day(b),d=this.weekdaysMin(c,""),e=this.weekdaysShort(c,""),f=this.weekdays(c,""),g.push(d),h.push(e),i.push(f),j.push(d),j.push(e),j.push(f);for(
// Sorting makes sure if one weekday (or abbr) is a prefix of another it
// will match the longer piece.
g.sort(a),h.sort(a),i.sort(a),j.sort(a),b=0;b<7;b++)h[b]=aa(h[b]),i[b]=aa(i[b]),j[b]=aa(j[b]);this._weekdaysRegex=new RegExp("^("+j.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+h.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+g.join("|")+")","i")}
// FORMATTING
function Ra(){return this.hours()%12||12}function Sa(){return this.hours()||24}function Ta(a,b){U(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}
// PARSING
function Ua(a,b){return b._meridiemParse}
// LOCALES
function Va(a){
// IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
// Using charAt should be more compatible.
return"p"===(a+"").toLowerCase().charAt(0)}function Wa(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Xa(a){return a?a.toLowerCase().replace("_","-"):a}
// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function Ya(a){for(var b,c,d,e,f=0;f<a.length;){for(e=Xa(a[f]).split("-"),b=e.length,c=Xa(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=Za(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&v(e,c,!0)>=b-1)
//the next array item is better than a shallower substring of this one
break;b--}f++}return null}function Za(a){var b=null;
// TODO: Find a better way to register and load all the locales in Node
if(!Be[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=xe._abbr,require("./locale/"+a),
// because defineLocale currently also sets the global locale, we
// want to undo that for lazy loaded locales
$a(b)}catch(a){}return Be[a]}
// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function $a(a,b){var c;
// moment.duration._locale = moment._locale = data;
return a&&(c=p(b)?bb(a):_a(a,b),c&&(xe=c)),xe._abbr}function _a(a,b){if(null!==b){var c=Ae;if(b.abbr=a,null!=Be[a])y("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),c=Be[a]._config;else if(null!=b.parentLocale){if(null==Be[b.parentLocale])return Ce[b.parentLocale]||(Ce[b.parentLocale]=[]),Ce[b.parentLocale].push({name:a,config:b}),null;c=Be[b.parentLocale]._config}
// backwards compat for now: also set the locale
// make sure we set the locale AFTER all child locales have been
// created, so we won't end up with the child locale set.
return Be[a]=new C(B(c,b)),Ce[a]&&Ce[a].forEach(function(a){_a(a.name,a.config)}),$a(a),Be[a]}
// useful for testing
return delete Be[a],null}function ab(a,b){if(null!=b){var c,d=Ae;
// MERGE
null!=Be[a]&&(d=Be[a]._config),b=B(d,b),c=new C(b),c.parentLocale=Be[a],Be[a]=c,
// backwards compat for now: also set the locale
$a(a)}else
// pass null for config to unupdate, useful for tests
null!=Be[a]&&(null!=Be[a].parentLocale?Be[a]=Be[a].parentLocale:null!=Be[a]&&delete Be[a]);return Be[a]}
// returns locale data
function bb(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return xe;if(!c(a)){if(
//short-circuit everything else
b=Za(a))return b;a=[a]}return Ya(a)}function cb(){return wd(Be)}function db(a){var b,c=a._a;return c&&m(a).overflow===-2&&(b=c[be]<0||c[be]>11?be:c[ce]<1||c[ce]>ea(c[ae],c[be])?ce:c[de]<0||c[de]>24||24===c[de]&&(0!==c[ee]||0!==c[fe]||0!==c[ge])?de:c[ee]<0||c[ee]>59?ee:c[fe]<0||c[fe]>59?fe:c[ge]<0||c[ge]>999?ge:-1,m(a)._overflowDayOfYear&&(b<ae||b>ce)&&(b=ce),m(a)._overflowWeeks&&b===-1&&(b=he),m(a)._overflowWeekday&&b===-1&&(b=ie),m(a).overflow=b),a}
// date from iso format
function eb(a){var b,c,d,e,f,g,h=a._i,i=De.exec(h)||Ee.exec(h);if(i){for(m(a).iso=!0,b=0,c=Ge.length;b<c;b++)if(Ge[b][1].exec(i[1])){e=Ge[b][0],d=Ge[b][2]!==!1;break}if(null==e)return void(a._isValid=!1);if(i[3]){for(b=0,c=He.length;b<c;b++)if(He[b][1].exec(i[3])){
// match[2] should be 'T' or space
f=(i[2]||" ")+He[b][0];break}if(null==f)return void(a._isValid=!1)}if(!d&&null!=f)return void(a._isValid=!1);if(i[4]){if(!Fe.exec(i[4]))return void(a._isValid=!1);g="Z"}a._f=e+(f||"")+(g||""),kb(a)}else a._isValid=!1}
// date from iso format or fallback
function fb(b){var c=Ie.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(eb(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}
// Pick the first defined of two or three arguments.
function gb(a,b,c){return null!=a?a:null!=b?b:c}function hb(b){
// hooks is actually the exported moment object
var c=new Date(a.now());return b._useUTC?[c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate()]:[c.getFullYear(),c.getMonth(),c.getDate()]}
// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function ib(a){var b,c,d,e,f=[];if(!a._d){
// Default to current date.
// * if no year, month, day of month are given, default to today
// * if day of month is given, default month and year
// * if month is given, default only year
// * if year is given, don't default anything
for(d=hb(a),
//compute day of the year from weeks and weekdays
a._w&&null==a._a[ce]&&null==a._a[be]&&jb(a),
//if the day of the year is set, figure out what it is
a._dayOfYear&&(e=gb(a._a[ae],d[ae]),a._dayOfYear>pa(e)&&(m(a)._overflowDayOfYear=!0),c=ta(e,0,a._dayOfYear),a._a[be]=c.getUTCMonth(),a._a[ce]=c.getUTCDate()),b=0;b<3&&null==a._a[b];++b)a._a[b]=f[b]=d[b];
// Zero out whatever was not defaulted, including time
for(;b<7;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];
// Check for 24:00:00.000
24===a._a[de]&&0===a._a[ee]&&0===a._a[fe]&&0===a._a[ge]&&(a._nextDay=!0,a._a[de]=0),a._d=(a._useUTC?ta:sa).apply(null,f),
// Apply timezone offset from input. The actual utcOffset can be changed
// with parseZone.
null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[de]=24)}}function jb(a){var b,c,d,e,f,g,h,i;if(b=a._w,null!=b.GG||null!=b.W||null!=b.E)f=1,g=4,
// TODO: We need to take the current isoWeekYear, but that depends on
// how we interpret now (local, utc, fixed offset). So create
// a now version of current config (take local/utc/offset flags, and
// create now).
c=gb(b.GG,a._a[ae],wa(sb(),1,4).year),d=gb(b.W,1),e=gb(b.E,1),(e<1||e>7)&&(i=!0);else{f=a._locale._week.dow,g=a._locale._week.doy;var j=wa(sb(),f,g);c=gb(b.gg,a._a[ae],j.year),
// Default to current week.
d=gb(b.w,j.week),null!=b.d?(
// weekday -- low day numbers are considered next week
e=b.d,(e<0||e>6)&&(i=!0)):null!=b.e?(
// local weekday -- counting starts from begining of week
e=b.e+f,(b.e<0||b.e>6)&&(i=!0)):
// default to begining of week
e=f}d<1||d>xa(c,f,g)?m(a)._overflowWeeks=!0:null!=i?m(a)._overflowWeekday=!0:(h=va(c,d,e,f,g),a._a[ae]=h.year,a._dayOfYear=h.dayOfYear)}
// date from string and format string
function kb(b){
// TODO: Move this to another part of the creation flow to prevent circular deps
if(b._f===a.ISO_8601)return void eb(b);b._a=[],m(b).empty=!0;
// This array is used to make a Date, either with `new Date` or `Date.UTC`
var c,d,e,f,g,h=""+b._i,i=h.length,j=0;for(e=Y(b._f,b._locale).match(Fd)||[],c=0;c<e.length;c++)f=e[c],d=(h.match($(f,b))||[])[0],
// console.log('token', token, 'parsedInput', parsedInput,
//         'regex', getParseRegexForToken(token, config));
d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&m(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),j+=d.length),
// don't parse if it's not a known token
Id[f]?(d?m(b).empty=!1:m(b).unusedTokens.push(f),da(f,d,b)):b._strict&&!d&&m(b).unusedTokens.push(f);
// add remaining unparsed input length to the string
m(b).charsLeftOver=i-j,h.length>0&&m(b).unusedInput.push(h),
// clear _12h flag if hour is <= 12
b._a[de]<=12&&m(b).bigHour===!0&&b._a[de]>0&&(m(b).bigHour=void 0),m(b).parsedDateParts=b._a.slice(0),m(b).meridiem=b._meridiem,
// handle meridiem
b._a[de]=lb(b._locale,b._a[de],b._meridiem),ib(b),db(b)}function lb(a,b,c){var d;
// Fallback
return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&b<12&&(b+=12),d||12!==b||(b=0),b):b}
// date from string and array of format strings
function mb(a){var b,c,d,e,f;if(0===a._f.length)return m(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=q({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],kb(b),n(b)&&(
// if there is any input that was not parsed add a penalty for that format
f+=m(b).charsLeftOver,
//or tokens
f+=10*m(b).unusedTokens.length,m(b).score=f,(null==d||f<d)&&(d=f,c=b));j(a,c||b)}function nb(a){if(!a._d){var b=L(a._i);a._a=h([b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],function(a){return a&&parseInt(a,10)}),ib(a)}}function ob(a){var b=new r(db(pb(a)));
// Adding is smart enough around DST
return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function pb(a){var b=a._i,d=a._f;return a._locale=a._locale||bb(a._l),null===b||void 0===d&&""===b?o({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),s(b)?new r(db(b)):(g(b)?a._d=b:c(d)?mb(a):d?kb(a):qb(a),n(a)||(a._d=null),a))}function qb(b){var d=b._i;void 0===d?b._d=new Date(a.now()):g(d)?b._d=new Date(d.valueOf()):"string"==typeof d?fb(b):c(d)?(b._a=h(d.slice(0),function(a){return parseInt(a,10)}),ib(b)):"object"==typeof d?nb(b):f(d)?
// from milliseconds
b._d=new Date(d):a.createFromInputFallback(b)}function rb(a,b,f,g,h){var i={};
// object construction must be done this way.
// https://github.com/moment/moment/issues/1423
return f!==!0&&f!==!1||(g=f,f=void 0),(d(a)&&e(a)||c(a)&&0===a.length)&&(a=void 0),i._isAMomentObject=!0,i._useUTC=i._isUTC=h,i._l=f,i._i=a,i._f=b,i._strict=g,ob(i)}function sb(a,b,c,d){return rb(a,b,c,d,!1)}
// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function tb(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return sb();for(d=b[0],e=1;e<b.length;++e)b[e].isValid()&&!b[e][a](d)||(d=b[e]);return d}
// TODO: Use [].sort instead?
function ub(){var a=[].slice.call(arguments,0);return tb("isBefore",a)}function vb(){var a=[].slice.call(arguments,0);return tb("isAfter",a)}function wb(a){var b=L(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;
// representation for dateAddRemove
this._milliseconds=+k+1e3*j+// 1000
6e4*i+// 1000 * 60
1e3*h*60*60,//using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
// Because of dateAddRemove treats 24 hours as different from a
// day when working around DST, we need to store them separately
this._days=+g+7*f,
// It is impossible translate months into days without knowing
// which months you are are talking about, so we have to store
// it separately.
this._months=+e+3*d+12*c,this._data={},this._locale=bb(),this._bubble()}function xb(a){return a instanceof wb}function yb(a){return a<0?Math.round(-1*a)*-1:Math.round(a)}
// FORMATTING
function zb(a,b){U(a,0,0,function(){var a=this.utcOffset(),c="+";return a<0&&(a=-a,c="-"),c+T(~~(a/60),2)+b+T(~~a%60,2)})}function Ab(a,b){var c=(b||"").match(a);if(null===c)return null;var d=c[c.length-1]||[],e=(d+"").match(Me)||["-",0,0],f=+(60*e[1])+u(e[2]);return 0===f?0:"+"===e[0]?f:-f}
// Return a moment from input, that is local/utc/zone equivalent to model.
function Bb(b,c){var d,e;
// Use low-level api, because this fn is low-level api.
return c._isUTC?(d=c.clone(),e=(s(b)||g(b)?b.valueOf():sb(b).valueOf())-d.valueOf(),d._d.setTime(d._d.valueOf()+e),a.updateOffset(d,!1),d):sb(b).local()}function Cb(a){
// On Firefox.24 Date#getTimezoneOffset returns a floating point.
// https://github.com/moment/moment/pull/1871
return 15*-Math.round(a._d.getTimezoneOffset()/15)}
// MOMENTS
// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function Db(b,c){var d,e=this._offset||0;if(!this.isValid())return null!=b?this:NaN;if(null!=b){if("string"==typeof b){if(b=Ab(Xd,b),null===b)return this}else Math.abs(b)<16&&(b=60*b);return!this._isUTC&&c&&(d=Cb(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?Tb(this,Ob(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?e:Cb(this)}function Eb(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Fb(a){return this.utcOffset(0,a)}function Gb(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Cb(this),"m")),this}function Hb(){if(null!=this._tzm)this.utcOffset(this._tzm);else if("string"==typeof this._i){var a=Ab(Wd,this._i);null!=a?this.utcOffset(a):this.utcOffset(0,!0)}return this}function Ib(a){return!!this.isValid()&&(a=a?sb(a).utcOffset():0,(this.utcOffset()-a)%60===0)}function Jb(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Kb(){if(!p(this._isDSTShifted))return this._isDSTShifted;var a={};if(q(a,this),a=pb(a),a._a){var b=a._isUTC?k(a._a):sb(a._a);this._isDSTShifted=this.isValid()&&v(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Lb(){return!!this.isValid()&&!this._isUTC}function Mb(){return!!this.isValid()&&this._isUTC}function Nb(){return!!this.isValid()&&(this._isUTC&&0===this._offset)}function Ob(a,b){var c,d,e,g=a,
// matching against regexp is expensive, do it on demand
h=null;// checks for null or undefined
return xb(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:f(a)?(g={},b?g[b]=a:g.milliseconds=a):(h=Ne.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:u(h[ce])*c,h:u(h[de])*c,m:u(h[ee])*c,s:u(h[fe])*c,ms:u(yb(1e3*h[ge]))*c}):(h=Oe.exec(a))?(c="-"===h[1]?-1:1,g={y:Pb(h[2],c),M:Pb(h[3],c),w:Pb(h[4],c),d:Pb(h[5],c),h:Pb(h[6],c),m:Pb(h[7],c),s:Pb(h[8],c)}):null==g?g={}:"object"==typeof g&&("from"in g||"to"in g)&&(e=Rb(sb(g.from),sb(g.to)),g={},g.ms=e.milliseconds,g.M=e.months),d=new wb(g),xb(a)&&i(a,"_locale")&&(d._locale=a._locale),d}function Pb(a,b){
// We'd normally use ~~inp for this, but unfortunately it also
// converts floats to ints.
// inp may be undefined, so careful calling replace on it.
var c=a&&parseFloat(a.replace(",","."));
// apply sign while we're at it
return(isNaN(c)?0:c)*b}function Qb(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function Rb(a,b){var c;return a.isValid()&&b.isValid()?(b=Bb(b,a),a.isBefore(b)?c=Qb(a,b):(c=Qb(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c):{milliseconds:0,months:0}}
// TODO: remove 'name' arg after deprecation is removed
function Sb(a,b){return function(c,d){var e,f;
//invert the arguments, but complain about it
return null===d||isNaN(+d)||(y(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Ob(c,d),Tb(this,e,a),this}}function Tb(b,c,d,e){var f=c._milliseconds,g=yb(c._days),h=yb(c._months);b.isValid()&&(e=null==e||e,f&&b._d.setTime(b._d.valueOf()+f*d),g&&Q(b,"Date",P(b,"Date")+g*d),h&&ja(b,P(b,"Month")+h*d),e&&a.updateOffset(b,g||h))}function Ub(a,b){var c=a.diff(b,"days",!0);return c<-6?"sameElse":c<-1?"lastWeek":c<0?"lastDay":c<1?"sameDay":c<2?"nextDay":c<7?"nextWeek":"sameElse"}function Vb(b,c){
// We want to compare the start of today, vs this.
// Getting start-of-today depends on whether we're local/utc/offset or not.
var d=b||sb(),e=Bb(d,this).startOf("day"),f=a.calendarFormat(this,e)||"sameElse",g=c&&(z(c[f])?c[f].call(this,d):c[f]);return this.format(g||this.localeData().calendar(f,this,sb(d)))}function Wb(){return new r(this)}function Xb(a,b){var c=s(a)?a:sb(a);return!(!this.isValid()||!c.isValid())&&(b=K(p(b)?"millisecond":b),"millisecond"===b?this.valueOf()>c.valueOf():c.valueOf()<this.clone().startOf(b).valueOf())}function Yb(a,b){var c=s(a)?a:sb(a);return!(!this.isValid()||!c.isValid())&&(b=K(p(b)?"millisecond":b),"millisecond"===b?this.valueOf()<c.valueOf():this.clone().endOf(b).valueOf()<c.valueOf())}function Zb(a,b,c,d){return d=d||"()",("("===d[0]?this.isAfter(a,c):!this.isBefore(a,c))&&(")"===d[1]?this.isBefore(b,c):!this.isAfter(b,c))}function $b(a,b){var c,d=s(a)?a:sb(a);return!(!this.isValid()||!d.isValid())&&(b=K(b||"millisecond"),"millisecond"===b?this.valueOf()===d.valueOf():(c=d.valueOf(),this.clone().startOf(b).valueOf()<=c&&c<=this.clone().endOf(b).valueOf()))}function _b(a,b){return this.isSame(a,b)||this.isAfter(a,b)}function ac(a,b){return this.isSame(a,b)||this.isBefore(a,b)}function bc(a,b,c){var d,e,f,g;// 1000
// 1000 * 60
// 1000 * 60 * 60
// 1000 * 60 * 60 * 24, negate dst
// 1000 * 60 * 60 * 24 * 7, negate dst
return this.isValid()?(d=Bb(a,this),d.isValid()?(e=6e4*(d.utcOffset()-this.utcOffset()),b=K(b),"year"===b||"month"===b||"quarter"===b?(g=cc(this,d),"quarter"===b?g/=3:"year"===b&&(g/=12)):(f=this-d,g="second"===b?f/1e3:"minute"===b?f/6e4:"hour"===b?f/36e5:"day"===b?(f-e)/864e5:"week"===b?(f-e)/6048e5:f),c?g:t(g)):NaN):NaN}function cc(a,b){
// difference in months
var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),
// b is in (anchor - 1 month, anchor + 1 month)
f=a.clone().add(e,"months");
//check for negative zero, return zero if negative zero
// linear across the month
// linear across the month
return b-f<0?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)||0}function dc(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function ec(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?z(Date.prototype.toISOString)?this.toDate().toISOString():X(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):X(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
function fc(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var a="moment",b="";this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",b="Z");var c="["+a+'("]',d=0<this.year()&&this.year()<=9999?"YYYY":"YYYYYY",e="-MM-DD[T]HH:mm:ss.SSS",f=b+'[")]';return this.format(c+d+e+f)}function gc(b){b||(b=this.isUtc()?a.defaultFormatUtc:a.defaultFormat);var c=X(this,b);return this.localeData().postformat(c)}function hc(a,b){return this.isValid()&&(s(a)&&a.isValid()||sb(a).isValid())?Ob({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function ic(a){return this.from(sb(),a)}function jc(a,b){return this.isValid()&&(s(a)&&a.isValid()||sb(a).isValid())?Ob({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function kc(a){return this.to(sb(),a)}
// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function lc(a){var b;return void 0===a?this._locale._abbr:(b=bb(a),null!=b&&(this._locale=b),this)}function mc(){return this._locale}function nc(a){
// the following switch intentionally omits break keywords
// to utilize falling through the cases.
switch(a=K(a)){case"year":this.month(0);/* falls through */
case"quarter":case"month":this.date(1);/* falls through */
case"week":case"isoWeek":case"day":case"date":this.hours(0);/* falls through */
case"hour":this.minutes(0);/* falls through */
case"minute":this.seconds(0);/* falls through */
case"second":this.milliseconds(0)}
// weeks are a special case
// quarters are also special
return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function oc(a){
// 'date' is an alias for 'day', so it should be considered as such.
return a=K(a),void 0===a||"millisecond"===a?this:("date"===a&&(a="day"),this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms"))}function pc(){return this._d.valueOf()-6e4*(this._offset||0)}function qc(){return Math.floor(this.valueOf()/1e3)}function rc(){return new Date(this.valueOf())}function sc(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function tc(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function uc(){
// new Date(NaN).toJSON() === null
return this.isValid()?this.toISOString():null}function vc(){return n(this)}function wc(){return j({},m(this))}function xc(){return m(this).overflow}function yc(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function zc(a,b){U(0,[a,a.length],0,b)}
// MOMENTS
function Ac(a){return Ec.call(this,a,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)}function Bc(a){return Ec.call(this,a,this.isoWeek(),this.isoWeekday(),1,4)}function Cc(){return xa(this.year(),1,4)}function Dc(){var a=this.localeData()._week;return xa(this.year(),a.dow,a.doy)}function Ec(a,b,c,d,e){var f;return null==a?wa(this,d,e).year:(f=xa(a,d,e),b>f&&(b=f),Fc.call(this,a,b,c,d,e))}function Fc(a,b,c,d,e){var f=va(a,b,c,d,e),g=ta(f.year,0,f.dayOfYear);return this.year(g.getUTCFullYear()),this.month(g.getUTCMonth()),this.date(g.getUTCDate()),this}
// MOMENTS
function Gc(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}
// HELPERS
// MOMENTS
function Hc(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function Ic(a,b){b[ge]=u(1e3*("0."+a))}
// MOMENTS
function Jc(){return this._isUTC?"UTC":""}function Kc(){return this._isUTC?"Coordinated Universal Time":""}function Lc(a){return sb(1e3*a)}function Mc(){return sb.apply(null,arguments).parseZone()}function Nc(a){return a}function Oc(a,b,c,d){var e=bb(),f=k().set(d,b);return e[c](f,a)}function Pc(a,b,c){if(f(a)&&(b=a,a=void 0),a=a||"",null!=b)return Oc(a,b,c,"month");var d,e=[];for(d=0;d<12;d++)e[d]=Oc(a,d,c,"month");return e}
// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function Qc(a,b,c,d){"boolean"==typeof a?(f(b)&&(c=b,b=void 0),b=b||""):(b=a,c=b,a=!1,f(b)&&(c=b,b=void 0),b=b||"");var e=bb(),g=a?e._week.dow:0;if(null!=c)return Oc(b,(c+g)%7,d,"day");var h,i=[];for(h=0;h<7;h++)i[h]=Oc(b,(h+g)%7,d,"day");return i}function Rc(a,b){return Pc(a,b,"months")}function Sc(a,b){return Pc(a,b,"monthsShort")}function Tc(a,b,c){return Qc(a,b,c,"weekdays")}function Uc(a,b,c){return Qc(a,b,c,"weekdaysShort")}function Vc(a,b,c){return Qc(a,b,c,"weekdaysMin")}function Wc(){var a=this._data;return this._milliseconds=Ze(this._milliseconds),this._days=Ze(this._days),this._months=Ze(this._months),a.milliseconds=Ze(a.milliseconds),a.seconds=Ze(a.seconds),a.minutes=Ze(a.minutes),a.hours=Ze(a.hours),a.months=Ze(a.months),a.years=Ze(a.years),this}function Xc(a,b,c,d){var e=Ob(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}
// supports only 2.0-style add(1, 's') or add(duration)
function Yc(a,b){return Xc(this,a,b,1)}
// supports only 2.0-style subtract(1, 's') or subtract(duration)
function Zc(a,b){return Xc(this,a,b,-1)}function $c(a){return a<0?Math.floor(a):Math.ceil(a)}function _c(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;
// if we have a mix of positive and negative values, bubble down first
// check: https://github.com/moment/moment/issues/2166
// The following code bubbles up values, see the tests for
// examples of what that means.
// convert days to months
// 12 months -> 1 year
return f>=0&&g>=0&&h>=0||f<=0&&g<=0&&h<=0||(f+=864e5*$c(bd(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=t(f/1e3),i.seconds=a%60,b=t(a/60),i.minutes=b%60,c=t(b/60),i.hours=c%24,g+=t(c/24),e=t(ad(g)),h+=e,g-=$c(bd(e)),d=t(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function ad(a){
// 400 years have 146097 days (taking into account leap year rules)
// 400 years have 12 months === 4800
return 4800*a/146097}function bd(a){
// the reverse of daysToMonths
return 146097*a/4800}function cd(a){var b,c,d=this._milliseconds;if(a=K(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+ad(b),"month"===a?c:c/12;switch(
// handle milliseconds separately because of floating point math errors (issue #1867)
b=this._days+Math.round(bd(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;
// Math.floor prevents floating point math errors here
case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}
// TODO: Use this.as('ms')?
function dd(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*u(this._months/12)}function ed(a){return function(){return this.as(a)}}function fd(a){return a=K(a),this[a+"s"]()}function gd(a){return function(){return this._data[a]}}function hd(){return t(this.days()/7)}
// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function id(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function jd(a,b,c){var d=Ob(a).abs(),e=of(d.as("s")),f=of(d.as("m")),g=of(d.as("h")),h=of(d.as("d")),i=of(d.as("M")),j=of(d.as("y")),k=e<pf.s&&["s",e]||f<=1&&["m"]||f<pf.m&&["mm",f]||g<=1&&["h"]||g<pf.h&&["hh",g]||h<=1&&["d"]||h<pf.d&&["dd",h]||i<=1&&["M"]||i<pf.M&&["MM",i]||j<=1&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,id.apply(null,k)}
// This function allows you to set the rounding function for relative time strings
function kd(a){return void 0===a?of:"function"==typeof a&&(of=a,!0)}
// This function allows you to set a threshold for relative time strings
function ld(a,b){return void 0!==pf[a]&&(void 0===b?pf[a]:(pf[a]=b,!0))}function md(a){var b=this.localeData(),c=jd(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function nd(){
// for ISO strings we do not use the normal bubbling rules:
//  * milliseconds bubble up until they become hours
//  * days do not bubble at all
//  * months bubble up until they become years
// This is because there is no context-free conversion between hours and days
// (think of clock changes)
// and also not between days and months (28-31 days per month)
var a,b,c,d=qf(this._milliseconds)/1e3,e=qf(this._days),f=qf(this._months);
// 3600 seconds -> 60 minutes -> 1 hour
a=t(d/60),b=t(a/60),d%=60,a%=60,
// 12 months -> 1 year
c=t(f/12),f%=12;
// inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(m<0?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var od,pd;pd=Array.prototype.some?Array.prototype.some:function(a){for(var b=Object(this),c=b.length>>>0,d=0;d<c;d++)if(d in b&&a.call(this,b[d],d,b))return!0;return!1};var qd=pd,rd=a.momentProperties=[],sd=!1,td={};a.suppressDeprecationWarnings=!1,a.deprecationHandler=null;var ud;ud=Object.keys?Object.keys:function(a){var b,c=[];for(b in a)i(a,b)&&c.push(b);return c};var vd,wd=ud,xd={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},yd={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},zd="Invalid date",Ad="%d",Bd=/\d{1,2}/,Cd={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Dd={},Ed={},Fd=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Gd=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Hd={},Id={},Jd=/\d/,Kd=/\d\d/,Ld=/\d{3}/,Md=/\d{4}/,Nd=/[+-]?\d{6}/,Od=/\d\d?/,Pd=/\d\d\d\d?/,Qd=/\d\d\d\d\d\d?/,Rd=/\d{1,3}/,Sd=/\d{1,4}/,Td=/[+-]?\d{1,6}/,Ud=/\d+/,Vd=/[+-]?\d+/,Wd=/Z|[+-]\d\d:?\d\d/gi,Xd=/Z|[+-]\d\d(?::?\d\d)?/gi,Yd=/[+-]?\d+(\.\d{1,3})?/,Zd=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,$d={},_d={},ae=0,be=1,ce=2,de=3,ee=4,fe=5,ge=6,he=7,ie=8;vd=Array.prototype.indexOf?Array.prototype.indexOf:function(a){
// I know
var b;for(b=0;b<this.length;++b)if(this[b]===a)return b;return-1};var je=vd;
// FORMATTING
U("M",["MM",2],"Mo",function(){return this.month()+1}),U("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),U("MMMM",0,0,function(a){return this.localeData().months(this,a)}),
// ALIASES
J("month","M"),
// PRIORITY
M("month",8),
// PARSING
Z("M",Od),Z("MM",Od,Kd),Z("MMM",function(a,b){return b.monthsShortRegex(a)}),Z("MMMM",function(a,b){return b.monthsRegex(a)}),ba(["M","MM"],function(a,b){b[be]=u(a)-1}),ba(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);
// if we didn't find a month name, mark the date as invalid.
null!=e?b[be]=e:m(c).invalidMonth=a});
// LOCALES
var ke=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,le="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),me="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),ne=Zd,oe=Zd;
// FORMATTING
U("Y",0,0,function(){var a=this.year();return a<=9999?""+a:"+"+a}),U(0,["YY",2],0,function(){return this.year()%100}),U(0,["YYYY",4],0,"year"),U(0,["YYYYY",5],0,"year"),U(0,["YYYYYY",6,!0],0,"year"),
// ALIASES
J("year","y"),
// PRIORITIES
M("year",1),
// PARSING
Z("Y",Vd),Z("YY",Od,Kd),Z("YYYY",Sd,Md),Z("YYYYY",Td,Nd),Z("YYYYYY",Td,Nd),ba(["YYYYY","YYYYYY"],ae),ba("YYYY",function(b,c){c[ae]=2===b.length?a.parseTwoDigitYear(b):u(b)}),ba("YY",function(b,c){c[ae]=a.parseTwoDigitYear(b)}),ba("Y",function(a,b){b[ae]=parseInt(a,10)}),
// HOOKS
a.parseTwoDigitYear=function(a){return u(a)+(u(a)>68?1900:2e3)};
// MOMENTS
var pe=O("FullYear",!0);
// FORMATTING
U("w",["ww",2],"wo","week"),U("W",["WW",2],"Wo","isoWeek"),
// ALIASES
J("week","w"),J("isoWeek","W"),
// PRIORITIES
M("week",5),M("isoWeek",5),
// PARSING
Z("w",Od),Z("ww",Od,Kd),Z("W",Od),Z("WW",Od,Kd),ca(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=u(a)});var qe={dow:0,// Sunday is the first day of the week.
doy:6};
// FORMATTING
U("d",0,"do","day"),U("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),U("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),U("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),U("e",0,0,"weekday"),U("E",0,0,"isoWeekday"),
// ALIASES
J("day","d"),J("weekday","e"),J("isoWeekday","E"),
// PRIORITY
M("day",11),M("weekday",11),M("isoWeekday",11),
// PARSING
Z("d",Od),Z("e",Od),Z("E",Od),Z("dd",function(a,b){return b.weekdaysMinRegex(a)}),Z("ddd",function(a,b){return b.weekdaysShortRegex(a)}),Z("dddd",function(a,b){return b.weekdaysRegex(a)}),ca(["dd","ddd","dddd"],function(a,b,c,d){var e=c._locale.weekdaysParse(a,d,c._strict);
// if we didn't get a weekday name, mark the date as invalid
null!=e?b.d=e:m(c).invalidWeekday=a}),ca(["d","e","E"],function(a,b,c,d){b[d]=u(a)});
// LOCALES
var re="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),se="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),te="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),ue=Zd,ve=Zd,we=Zd;U("H",["HH",2],0,"hour"),U("h",["hh",2],0,Ra),U("k",["kk",2],0,Sa),U("hmm",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)}),U("hmmss",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)+T(this.seconds(),2)}),U("Hmm",0,0,function(){return""+this.hours()+T(this.minutes(),2)}),U("Hmmss",0,0,function(){return""+this.hours()+T(this.minutes(),2)+T(this.seconds(),2)}),Ta("a",!0),Ta("A",!1),
// ALIASES
J("hour","h"),
// PRIORITY
M("hour",13),Z("a",Ua),Z("A",Ua),Z("H",Od),Z("h",Od),Z("HH",Od,Kd),Z("hh",Od,Kd),Z("hmm",Pd),Z("hmmss",Qd),Z("Hmm",Pd),Z("Hmmss",Qd),ba(["H","HH"],de),ba(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),ba(["h","hh"],function(a,b,c){b[de]=u(a),m(c).bigHour=!0}),ba("hmm",function(a,b,c){var d=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d)),m(c).bigHour=!0}),ba("hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d,2)),b[fe]=u(a.substr(e)),m(c).bigHour=!0}),ba("Hmm",function(a,b,c){var d=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d))}),ba("Hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d,2)),b[fe]=u(a.substr(e))});var xe,ye=/[ap]\.?m?\.?/i,ze=O("Hours",!0),Ae={calendar:xd,longDateFormat:yd,invalidDate:zd,ordinal:Ad,ordinalParse:Bd,relativeTime:Cd,months:le,monthsShort:me,week:qe,weekdays:re,weekdaysMin:te,weekdaysShort:se,meridiemParse:ye},Be={},Ce={},De=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ee=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Fe=/Z|[+-]\d\d(?::?\d\d)?/,Ge=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],
// YYYYMM is NOT allowed by the standard
["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],He=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Ie=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=x("value provided is not in a recognized ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),
// constant that refers to the ISO standard
a.ISO_8601=function(){};var Je=x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=sb.apply(null,arguments);return this.isValid()&&a.isValid()?a<this?this:a:o()}),Ke=x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=sb.apply(null,arguments);return this.isValid()&&a.isValid()?a>this?this:a:o()}),Le=function(){return Date.now?Date.now():+new Date};zb("Z",":"),zb("ZZ",""),
// PARSING
Z("Z",Xd),Z("ZZ",Xd),ba(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=Ab(Xd,a)});
// HELPERS
// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var Me=/([\+\-]|\d\d)/gi;
// HOOKS
// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
a.updateOffset=function(){};
// ASP.NET json date format regex
var Ne=/^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,Oe=/^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;Ob.fn=wb.prototype;var Pe=Sb(1,"add"),Qe=Sb(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",a.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var Re=x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});
// FORMATTING
U(0,["gg",2],0,function(){return this.weekYear()%100}),U(0,["GG",2],0,function(){return this.isoWeekYear()%100}),zc("gggg","weekYear"),zc("ggggg","weekYear"),zc("GGGG","isoWeekYear"),zc("GGGGG","isoWeekYear"),
// ALIASES
J("weekYear","gg"),J("isoWeekYear","GG"),
// PRIORITY
M("weekYear",1),M("isoWeekYear",1),
// PARSING
Z("G",Vd),Z("g",Vd),Z("GG",Od,Kd),Z("gg",Od,Kd),Z("GGGG",Sd,Md),Z("gggg",Sd,Md),Z("GGGGG",Td,Nd),Z("ggggg",Td,Nd),ca(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=u(a)}),ca(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),
// FORMATTING
U("Q",0,"Qo","quarter"),
// ALIASES
J("quarter","Q"),
// PRIORITY
M("quarter",7),
// PARSING
Z("Q",Jd),ba("Q",function(a,b){b[be]=3*(u(a)-1)}),
// FORMATTING
U("D",["DD",2],"Do","date"),
// ALIASES
J("date","D"),
// PRIOROITY
M("date",9),
// PARSING
Z("D",Od),Z("DD",Od,Kd),Z("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),ba(["D","DD"],ce),ba("Do",function(a,b){b[ce]=u(a.match(Od)[0],10)});
// MOMENTS
var Se=O("Date",!0);
// FORMATTING
U("DDD",["DDDD",3],"DDDo","dayOfYear"),
// ALIASES
J("dayOfYear","DDD"),
// PRIORITY
M("dayOfYear",4),
// PARSING
Z("DDD",Rd),Z("DDDD",Ld),ba(["DDD","DDDD"],function(a,b,c){c._dayOfYear=u(a)}),
// FORMATTING
U("m",["mm",2],0,"minute"),
// ALIASES
J("minute","m"),
// PRIORITY
M("minute",14),
// PARSING
Z("m",Od),Z("mm",Od,Kd),ba(["m","mm"],ee);
// MOMENTS
var Te=O("Minutes",!1);
// FORMATTING
U("s",["ss",2],0,"second"),
// ALIASES
J("second","s"),
// PRIORITY
M("second",15),
// PARSING
Z("s",Od),Z("ss",Od,Kd),ba(["s","ss"],fe);
// MOMENTS
var Ue=O("Seconds",!1);
// FORMATTING
U("S",0,0,function(){return~~(this.millisecond()/100)}),U(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),U(0,["SSS",3],0,"millisecond"),U(0,["SSSS",4],0,function(){return 10*this.millisecond()}),U(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),U(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),U(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),U(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),U(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),
// ALIASES
J("millisecond","ms"),
// PRIORITY
M("millisecond",16),
// PARSING
Z("S",Rd,Jd),Z("SS",Rd,Kd),Z("SSS",Rd,Ld);var Ve;for(Ve="SSSS";Ve.length<=9;Ve+="S")Z(Ve,Ud);for(Ve="S";Ve.length<=9;Ve+="S")ba(Ve,Ic);
// MOMENTS
var We=O("Milliseconds",!1);
// FORMATTING
U("z",0,0,"zoneAbbr"),U("zz",0,0,"zoneName");var Xe=r.prototype;Xe.add=Pe,Xe.calendar=Vb,Xe.clone=Wb,Xe.diff=bc,Xe.endOf=oc,Xe.format=gc,Xe.from=hc,Xe.fromNow=ic,Xe.to=jc,Xe.toNow=kc,Xe.get=R,Xe.invalidAt=xc,Xe.isAfter=Xb,Xe.isBefore=Yb,Xe.isBetween=Zb,Xe.isSame=$b,Xe.isSameOrAfter=_b,Xe.isSameOrBefore=ac,Xe.isValid=vc,Xe.lang=Re,Xe.locale=lc,Xe.localeData=mc,Xe.max=Ke,Xe.min=Je,Xe.parsingFlags=wc,Xe.set=S,Xe.startOf=nc,Xe.subtract=Qe,Xe.toArray=sc,Xe.toObject=tc,Xe.toDate=rc,Xe.toISOString=ec,Xe.inspect=fc,Xe.toJSON=uc,Xe.toString=dc,Xe.unix=qc,Xe.valueOf=pc,Xe.creationData=yc,
// Year
Xe.year=pe,Xe.isLeapYear=ra,
// Week Year
Xe.weekYear=Ac,Xe.isoWeekYear=Bc,
// Quarter
Xe.quarter=Xe.quarters=Gc,
// Month
Xe.month=ka,Xe.daysInMonth=la,
// Week
Xe.week=Xe.weeks=Ba,Xe.isoWeek=Xe.isoWeeks=Ca,Xe.weeksInYear=Dc,Xe.isoWeeksInYear=Cc,
// Day
Xe.date=Se,Xe.day=Xe.days=Ka,Xe.weekday=La,Xe.isoWeekday=Ma,Xe.dayOfYear=Hc,
// Hour
Xe.hour=Xe.hours=ze,
// Minute
Xe.minute=Xe.minutes=Te,
// Second
Xe.second=Xe.seconds=Ue,
// Millisecond
Xe.millisecond=Xe.milliseconds=We,
// Offset
Xe.utcOffset=Db,Xe.utc=Fb,Xe.local=Gb,Xe.parseZone=Hb,Xe.hasAlignedHourOffset=Ib,Xe.isDST=Jb,Xe.isLocal=Lb,Xe.isUtcOffset=Mb,Xe.isUtc=Nb,Xe.isUTC=Nb,
// Timezone
Xe.zoneAbbr=Jc,Xe.zoneName=Kc,
// Deprecations
Xe.dates=x("dates accessor is deprecated. Use date instead.",Se),Xe.months=x("months accessor is deprecated. Use month instead",ka),Xe.years=x("years accessor is deprecated. Use year instead",pe),Xe.zone=x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",Eb),Xe.isDSTShifted=x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",Kb);var Ye=C.prototype;Ye.calendar=D,Ye.longDateFormat=E,Ye.invalidDate=F,Ye.ordinal=G,Ye.preparse=Nc,Ye.postformat=Nc,Ye.relativeTime=H,Ye.pastFuture=I,Ye.set=A,
// Month
Ye.months=fa,Ye.monthsShort=ga,Ye.monthsParse=ia,Ye.monthsRegex=na,Ye.monthsShortRegex=ma,
// Week
Ye.week=ya,Ye.firstDayOfYear=Aa,Ye.firstDayOfWeek=za,
// Day of Week
Ye.weekdays=Fa,Ye.weekdaysMin=Ha,Ye.weekdaysShort=Ga,Ye.weekdaysParse=Ja,Ye.weekdaysRegex=Na,Ye.weekdaysShortRegex=Oa,Ye.weekdaysMinRegex=Pa,
// Hours
Ye.isPM=Va,Ye.meridiem=Wa,$a("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===u(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),
// Side effect imports
a.lang=x("moment.lang is deprecated. Use moment.locale instead.",$a),a.langData=x("moment.langData is deprecated. Use moment.localeData instead.",bb);var Ze=Math.abs,$e=ed("ms"),_e=ed("s"),af=ed("m"),bf=ed("h"),cf=ed("d"),df=ed("w"),ef=ed("M"),ff=ed("y"),gf=gd("milliseconds"),hf=gd("seconds"),jf=gd("minutes"),kf=gd("hours"),lf=gd("days"),mf=gd("months"),nf=gd("years"),of=Math.round,pf={s:45,// seconds to minute
m:45,// minutes to hour
h:22,// hours to day
d:26,// days to month
M:11},qf=Math.abs,rf=wb.prototype;
// Deprecations
// Side effect imports
// FORMATTING
// PARSING
// Side effect imports
return rf.abs=Wc,rf.add=Yc,rf.subtract=Zc,rf.as=cd,rf.asMilliseconds=$e,rf.asSeconds=_e,rf.asMinutes=af,rf.asHours=bf,rf.asDays=cf,rf.asWeeks=df,rf.asMonths=ef,rf.asYears=ff,rf.valueOf=dd,rf._bubble=_c,rf.get=fd,rf.milliseconds=gf,rf.seconds=hf,rf.minutes=jf,rf.hours=kf,rf.days=lf,rf.weeks=hd,rf.months=mf,rf.years=nf,rf.humanize=md,rf.toISOString=nd,rf.toString=nd,rf.toJSON=nd,rf.locale=lc,rf.localeData=mc,rf.toIsoString=x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",nd),rf.lang=Re,U("X",0,0,"unix"),U("x",0,0,"valueOf"),Z("x",Vd),Z("X",Yd),ba("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),ba("x",function(a,b,c){c._d=new Date(u(a))}),a.version="2.17.1",b(sb),a.fn=Xe,a.min=ub,a.max=vb,a.now=Le,a.utc=k,a.unix=Lc,a.months=Rc,a.isDate=g,a.locale=$a,a.invalid=o,a.duration=Ob,a.isMoment=s,a.weekdays=Tc,a.parseZone=Mc,a.localeData=bb,a.isDuration=xb,a.monthsShort=Sc,a.weekdaysMin=Vc,a.defineLocale=_a,a.updateLocale=ab,a.locales=cb,a.weekdaysShort=Uc,a.normalizeUnits=K,a.relativeTimeRounding=kd,a.relativeTimeThreshold=ld,a.calendarFormat=Ub,a.prototype=Xe,a});
angular.module('rssReader').factory('addFeedService', ['$http', function($http) {
    'use strict';

    function saveFeed(feed, feedUrl) {
        return $http.post('/addFeed', { feedLink: feedUrl, feedCategory: feed.feedCategory, feedTitle: feed.feedTitle })
            .then(function(res) {
                    console.log("response in getSavedFeed: ", res);
                    return res;
                },
                function(error) {
                    console.log('Can not get saved feed');
                });
    }


    function getParsedFeed(feed, category) {
        feed = feed.feed;
        return {
            feedTitle: feed[0].meta.title,
            feedCategory: category,
        }
    }

    return {
        saveFeed: saveFeed,
        getParsedFeed: getParsedFeed,
    }
}]);

angular.module('rssReader').factory('articlesService', ['$http', function($http) {
    'use strict';
    // var allArticles = [];

    function getText(html) {
        return angular.element(`<div>${html}</div>`).text().replace(/\n+/g, ' ');
    }

    function getImgUrl(html) {
        var imgElem = angular.element(`<div>${html}</div>`).find('img')[0];
        return imgElem ? imgElem.src : '';
    }

    function getFeedFromFeedparser(url) {
        return $http.post('/getParsedFeed', { url: url }).then(function(response) {
            return response.data;
        });
    }

    function getArticles(feeds) {
        let articles = [];
        let chain = Promise.resolve();
        feeds.forEach(function(feed) {
            chain = chain
                .then(() => getFeedFromFeedparser(feed.feedLink))
                .then((result) => {
                    result = getParsedArticles(result.feed, feed.feedCategory, feed._id);
                    articles = articles.concat(result);
                });
        });

        return chain.then(() => {
            return articles
        });

    }

    function getParsedArticles(articles, category, feedId) {
        // console.log('getParsedArticles', articles);
        var changedArticles = [];
        articles.forEach(function(el) {
            
            changedArticles.push({
                title: el.title,
                feedId: feedId,
                category: category,
                content: getText(el.description),
                img: getImgUrl(el.description),
                link: el.link,
                date: el.pubDate
            })
        });
        return changedArticles;
    }

    function getSingleArticle(feedId, link) {
        return getFeedById(feedId).then(function(res) {
            return res.find(function(elem) {
                if (elem.link == link) {
                    return elem;
                }
            })
        })
    }

    function getAllFeeds() {
        return $http.post('/getFeed')
            .then(function(res) {
                    return getArticles(res.data)
                        // return res;

                },
                function(error) {
                    console.log('Can not get saved feed');
                })
    }

    function getFeedById(id) {
        return $http.post('/getFeedById', { feedId: id })
            .then(function(res) {
                    return getArticles([res.data]);
                },
                function(error) {
                    console.log('Can not load data', error);
                })
    }

    function getFeedByCat(category) {
        return $http.post('/getFeedByCat', { feedCategory: category })
            .then(function(res) {
                    // console.log('getFeedByCat', res.data);
                    return getArticles(res.data);
                },
                function(error) {
                    console.log('Can not load data', error);
                })
    }

    return {
        // setAllArticles: setAllArticles,
        // getAllArticles: getAllArticles,
        getArticles: getArticles,
        getFeedFromFeedparser: getFeedFromFeedparser,
        getAllFeeds: getAllFeeds,
        getFeedById: getFeedById,
        getFeedByCat: getFeedByCat, 
        getSingleArticle: getSingleArticle
    }
}]);

angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', '$http', function(addFeedService, $filter, $http) {
    'use strict';
    var sortParam; //sorting option got from sidebar


    function getSortParam() {
        if (!sortParam) {
            sortParam = "All";
        }
        return sortParam;
    }

    function getAllFeeds() {
        return $http.post('/getFeed')
            .then(function(res) {
                    return res;
                },
                function(error) {
                    console.log('Can not get saved feed');
                })
    }

    return {
        getSortParam: getSortParam,
        getAllFeeds: getAllFeeds,
    }
}]);

angular.module('rssReader').factory('sidebarService', ['dashboardService', function(dashboardService) {
    'use strict';
    var listFeeds = [];


    function setListFeeds(arr) {

        if (!listFeeds.length) {
            listFeeds = listFeeds.concat(arr);
        } else {
            arr.forEach(element => {
                if (!(listFeeds.some(currentElem => currentElem._id === element._id))) {
                    listFeeds = listFeeds.concat(element);
                }
            });
        }
    }

    function getCategorySidebar(listFeeds) {
        var listFeedSidebar = [];
        var listWork = [];
        var foundElem;

        if (!listFeeds.length) {
            return false;
        } else {
            listFeeds.forEach(function(element, index) {
                listWork.push({
                    feedCategory: element.feedCategory,
                    id: index,
                    feedTitle: [{ feedTitle: element.feedTitle, feedId: element._id }]
                })
            });
        }

        listWork.forEach(function(element, index) {

            foundElem = listFeedSidebar.find(function(elem) {
                return elem.feedCategory == element.feedCategory;
            });

            if (foundElem) {
                foundElem.feedTitle = foundElem.feedTitle.concat(element.feedTitle);
            } else {
                listFeedSidebar.push(element);
            }
        });
        return listFeedSidebar;
    }

    function getListFeeds() {
        return listFeeds;
    }
    return {
        getCategorySidebar: getCategorySidebar,
        setListFeeds: setListFeeds,
        getListFeeds: getListFeeds
    }
}])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvdXRlci5qcyIsImNvbnRyb2xsZXJzL2FkZENvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9hcnRpY2xlc0NvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmRDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9uYXZDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvc2lkZWJhckNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9zaW5nbGVBcnRpY2xlQ29udHJvbGxlci5qcyIsImRpcmVjdGl2ZXMvbG9hZGluZ1NwaW5uZXIuanMiLCJsaWIvYm9vdHN0cmFwLmpzIiwibGliL2phc255LWJvb3RzdHJhcC5qcyIsImxpYi9tb21lbnQubWluLmpzIiwic2VydmljZXMvYWRkRmVlZFNlcnZpY2UuanMiLCJzZXJ2aWNlcy9hcnRpY2xlc1NlcnZpY2UuanMiLCJzZXJ2aWNlcy9kYXNoYm9hcmRTZXJ2aWNlLmpzIiwic2VydmljZXMvc2lkZWJhclNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3owRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hnQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicsIFsndWkucm91dGVyJ10pO1xyXG4gICAgYXBwLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsICckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGh0dHBQcm92aWRlcikge1xyXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJ2hvbWUnKTtcclxuICAgICAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9ob21lJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInRlbXBsYXRlcy9ob21lLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdob21lQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdsb2dpbicsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9sb2dpbicsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcclxuICAgICAgICAgICAgICAgIC8vIGNvbnRyb2xsZXI6ICdsb2dpbkNvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXHJcbiAgICAgICAgICAgICAgICB2aWV3czoge1xyXG4gICAgICAgICAgICAgICAgICAgICcnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2Rhc2hib2FyZC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2Rhc2hib2FyZENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAnaGVhZEBkYXNoYm9hcmQnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2Rhc2hib2FyZEhlYWQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdkYXNoYm9hcmRDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3NpZGViYXInOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3NpZGViYXIuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdzaWRlYmFyQ29udHJvbGxlcidcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZlZWRzOiBbJ2Rhc2hib2FyZFNlcnZpY2UnLCAnYXJ0aWNsZXNTZXJ2aWNlJywgJ3NpZGViYXJTZXJ2aWNlJywgZnVuY3Rpb24oZGFzaGJvYXJkU2VydmljZSwgYXJ0aWNsZXNTZXJ2aWNlLCBzaWRlYmFyU2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGFzaGJvYXJkU2VydmljZS5nZXRBbGxGZWVkcygpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFyU2VydmljZS5zZXRMaXN0RmVlZHMocmVzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIGFydGljbGVzU2VydmljZS5nZXRBbGxBcnRpY2xlcyhyZXMuZGF0YSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBhcnRpY2xlc1NlcnZpY2Uuc2V0QWxsQXJ0aWNsZXMocmVzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcIkNhbid0IHJlc29sdmluZ1wiLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZXNvbHZlJywgcmVzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ2Rhc2hib2FyZC50YWJsZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LXRhYmxlP3R5cGUmdmFsdWUnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQubGlzdC1sZycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LWxnP3R5cGUmdmFsdWUnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQubGlzdC10aCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LXRoP3R5cGUmdmFsdWUnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdFRoLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQuYXJ0aWNsZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9hcnRpY2xlP2ZlZWQmbGluaycsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9zaW5nbGVBcnRpY2xlLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3NpbmdsZUFydGljbGUnLFxyXG5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQuYWRkJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2FkZCcsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZGQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnYWRkQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5jb250cm9sbGVyKCdhZGRDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgJ2FkZEZlZWRTZXJ2aWNlJywgJ2FydGljbGVzU2VydmljZScsICdzaWRlYmFyU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBhZGRGZWVkU2VydmljZSwgYXJ0aWNsZXNTZXJ2aWNlLCBzaWRlYmFyU2VydmljZSkge1xyXG4gICAgICAgIC8vICRzY29wZS5mZWVkID0ge307XHJcbiAgICAgICAgJHNjb3BlLmdldEZlZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGFydGljbGVzU2VydmljZS5nZXRGZWVkRnJvbUZlZWRwYXJzZXIoJHNjb3BlLmZlZWRVcmwpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmVlZCA9IGFkZEZlZWRTZXJ2aWNlLmdldFBhcnNlZEZlZWQocmVzLCAkc2NvcGUuZmVlZENhdGVnb3J5KTtcclxuICAgICAgICAgICAgICAgIGFkZEZlZWRTZXJ2aWNlLnNhdmVGZWVkKGZlZWQsICRzY29wZS5mZWVkVXJsKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzaWRlYmFyU2VydmljZS5zZXRMaXN0RmVlZHMoW3Jlcy5kYXRhXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQubGlzdC1sZycsIHt0eXBlOiAnaWQnLCB2YWx1ZTpyZXMuZGF0YS5faWR9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5jb250cm9sbGVyKCdhcnRpY2xlc0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckc3RhdGUnLCAnJHN0YXRlUGFyYW1zJywgJ2Rhc2hib2FyZFNlcnZpY2UnLCAnYXJ0aWNsZXNTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgZGFzaGJvYXJkU2VydmljZSwgYXJ0aWNsZXNTZXJ2aWNlKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJyRzdGF0ZVBhcmFtcycsICRzdGF0ZVBhcmFtcy50eXBlLCAkc3RhdGVQYXJhbXMudmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnR5cGUgPT0gXCJpZFwiKSB7XHJcbiAgICAgICAgICAgIGFydGljbGVzU2VydmljZS5nZXRGZWVkQnlJZCgkc3RhdGVQYXJhbXMudmFsdWUpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYXJ0aWNsZXMgPSByZXM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCgkc3RhdGVQYXJhbXMudHlwZSA9PSBcImNhdGVnb3J5XCIpICYmICgkc3RhdGVQYXJhbXMudmFsdWUgIT0gJ0FsbCcpKSB7XHJcbiAgICAgICAgICAgIGFydGljbGVzU2VydmljZS5nZXRGZWVkQnlDYXQoJHN0YXRlUGFyYW1zLnZhbHVlKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmFydGljbGVzID0gcmVzO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoISRzdGF0ZVBhcmFtcy50eXBlKSB8fCAoJHN0YXRlUGFyYW1zLnZhbHVlID09ICdBbGwnKSkge1xyXG4gICAgICAgICAgICBhcnRpY2xlc1NlcnZpY2UuZ2V0QWxsRmVlZHMoKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgLy8gYXJ0aWNsZXNTZXJ2aWNlLmdldEFydGljbGVzKHJlcy5kYXRhKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmFydGljbGVzID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gXHJcblxyXG5cclxuXHJcbiAgICAgICAgLy8gJHNjb3BlLmFydGljbGVzID0gZGFzaGJvYXJkU2VydmljZS5nZXRBcnRpY2xlcygkc3RhdGVQYXJhbXMuc29ydCwgJ2FydGljbGVzQ29udHJvbGxlcicpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCRzY29wZS5hcnRpY2xlcyk7XHJcbiAgICAgICAgLy8gJHNjb3BlLnJlYWRBcnRpY2xlID0gZnVuY3Rpb24gKGFydGljbGUpIHtcclxuICAgICAgICAvLyAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQuYXJ0aWNsZScsIHtwYXJhbSA6IGFydGljbGV9KTtcclxuXHJcbiAgICAgICAgLy8gfTsgXHJcbiAgICB9XSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignZGFzaGJvYXJkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzdGF0ZScsICckc3RhdGVQYXJhbXMnLCdhZGRGZWVkU2VydmljZScsICdkYXNoYm9hcmRTZXJ2aWNlJywgJ2ZlZWRzJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgYWRkRmVlZFNlcnZpY2UsIGRhc2hib2FyZFNlcnZpY2UsIGZlZWRzKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coISEkc2NvcGUuYXJ0aWNsZXMubGVuZ3RoKTtcclxuICAgICAgICBcclxuICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhc2hib2FyZFNlcnZpY2UuZ2V0U29ydFBhcmFtKCk7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUudGl0bGVGZWVkID0gZGFzaGJvYXJkU2VydmljZS5nZXRTb3J0UGFyYW0oKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgICRzY29wZS5yZWFkQXJ0aWNsZSA9IGZ1bmN0aW9uIChmZWVkSWQsIGxpbmspIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdeLmFydGljbGUnLCB7ZmVlZDogZmVlZElkLCBsaW5rOiBsaW5rfSk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFmZWVkcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQuYWRkJyk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJyRzdGF0ZS5wYXJhbXMnLCAkc3RhdGUucGFyYW1zLCAkc3RhdGUucGFyYW1zLmN1cnJlbnQpO1xyXG4gICAgICAgICAgICBpZiAoIU9iamVjdC5lbnRyaWVzKCRzdGF0ZS5wYXJhbXMpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQubGlzdC1sZycsIHt0eXBlOiAkc3RhdGUucGFyYW1zLnR5cGUsIHZhbHVlOiAkc3RhdGUucGFyYW1zLnZhbHVlfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIC8vYWRkICRzdGF0ZS5wYXJhbXMgdmFyaWFibGVzXHJcbiAgICAgICAgICAgIC8vICRzdGF0ZS5nbygkc3RhdGUucGFyYW1zLmN1cnJlbnQsICRzdGF0ZS5wYXJhbXMpOyBcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuaXNSZWFkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCJkYXNoYm9hcmQuYWRkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gKCFyZS50ZXN0KCRzdGF0ZS5jdXJyZW50Lm5hbWUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5nZXRBbGxGZWVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc3RhdGUucGFyYW1zLCAkc3RhdGUuY3VycmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1dKTtcclxuXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignaG9tZUNvbnRyb2xsZXInLCBbJyRzY29wZScsICckc3RhdGUnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSl7XHJcbiAgICAgICAgJHNjb3BlLnRlc3QgPSBcImhlbGxvIHdvcmxkISEhXCI7XHJcbiAgICB9XSk7XHJcblxyXG59KSgpO1xyXG5cclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmNvbnRyb2xsZXIoJ25hdkNvbnRyb2xsZXInLCBbJyRzY29wZScsICckc3RhdGUnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICAkc2NvcGUuaXNEYXNib2FyZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gL2Rhc2hib2FyZC8udGVzdCgkc3RhdGUuY3VycmVudC5uYW1lKTtcclxuICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignc2lkZWJhckNvbnRyb2xsZXInLCBbJyRzY29wZScsICckc3RhdGUnLCAnJHJvb3RTY29wZScsICdzaWRlYmFyU2VydmljZScsICdkYXNoYm9hcmRTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRyb290U2NvcGUsIHNpZGViYXJTZXJ2aWNlLCBkYXNoYm9hcmRTZXJ2aWNlKSB7XHJcbiAgICAgICAgdmFyIGdldExpc3RTaWRlYmFyID0gc2lkZWJhclNlcnZpY2UuZ2V0Q2F0ZWdvcnlTaWRlYmFyO1xyXG4gICAgICAgIHZhciBsaXN0RmVlZHMgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gcmV0dXJuIEpTT04uc3RyaW5naWZ5KGdldExpc3RTaWRlYmFyKCkpO1xyXG4gICAgICAgICAgICBsaXN0RmVlZHMgPSBzaWRlYmFyU2VydmljZS5nZXRMaXN0RmVlZHMoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGxpc3RGZWVkcztcclxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RmVlZFNpZGViYXIgPSBnZXRMaXN0U2lkZWJhcihsaXN0RmVlZHMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5zaG93QXJ0aWNsZXNCeVNvcnRpbmcgPSBmdW5jdGlvbiAodHlwZSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc29ydGluZyk7XHJcbiAgICAgICAgICAgIC8vIHRpdGxlRmVlZCA9IHRpdGxlRmVlZCA/IHRpdGxlRmVlZCA6IG51bGw7IFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGl0bGVGZWVkID0gJyArIHRpdGxlRmVlZCk7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkLmxpc3QtbGcnLCB7dHlwZTogdHlwZSwgdmFsdWU6IHZhbHVlfSk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnJvdGF0ZUNoZXZyb24gPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxhcHNlID0gJGV2ZW50LmN1cnJlbnRUYXJnZXQuYXR0cmlidXRlc1snYXJpYS1leHBhbmRlZCddLnZhbHVlO1xyXG4gICAgICAgICAgICB2YXIgY2hldnJvbiA9IGFuZ3VsYXIuZWxlbWVudCgkZXZlbnQuY3VycmVudFRhcmdldCkuZmluZCgnLmdseXBoaWNvbi1jaGV2cm9uLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgIGlmIChjb2xsYXBzZSA9PSBcImZhbHNlXCIpIHtcclxuICAgICAgICAgICAgICAgIGNoZXZyb24uYWRkQ2xhc3MoJ2NoZXZyb25Eb3duJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjaGV2cm9uLnJlbW92ZUNsYXNzKCdjaGV2cm9uRG93bicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1dKTtcclxuXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5jb250cm9sbGVyKCdzaW5nbGVBcnRpY2xlJywgWyckc2NvcGUnLCAnJHN0YXRlJywgJyRzdGF0ZVBhcmFtcycsICdhcnRpY2xlc1NlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBhcnRpY2xlc1NlcnZpY2UpIHtcclxuICAgICAgICBpZiAoISRzdGF0ZVBhcmFtcy5saW5rKSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnXicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFydGljbGVzU2VydmljZS5nZXRTaW5nbGVBcnRpY2xlKCRzdGF0ZVBhcmFtcy5mZWVkLCAkc3RhdGVQYXJhbXMubGluaykudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuYXJ0aWNsZSA9IHJlcztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgIH1dKTtcclxuXHJcbn0pKCk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5kaXJlY3RpdmUoJ2xvYWRpbmcnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICBzY29wZS5pc0xvYWRpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5wZW5kaW5nUmVxdWVzdHMubGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgc2NvcGUuJHdhdGNoKHNjb3BlLmlzTG9hZGluZywgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ25nLWhpZGUnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnbmctaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XSk7XHJcblxyXG4iLCIvKiFcclxuICogQm9vdHN0cmFwIHYzLjMuNyAoaHR0cDovL2dldGJvb3RzdHJhcC5jb20pXHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcclxuICovXHJcblxyXG5pZiAodHlwZW9mIGpRdWVyeSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICB0aHJvdyBuZXcgRXJyb3IoJ0Jvb3RzdHJhcFxcJ3MgSmF2YVNjcmlwdCByZXF1aXJlcyBqUXVlcnknKVxyXG59XHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcbiAgdmFyIHZlcnNpb24gPSAkLmZuLmpxdWVyeS5zcGxpdCgnICcpWzBdLnNwbGl0KCcuJylcclxuICBpZiAoKHZlcnNpb25bMF0gPCAyICYmIHZlcnNpb25bMV0gPCA5KSB8fCAodmVyc2lvblswXSA9PSAxICYmIHZlcnNpb25bMV0gPT0gOSAmJiB2ZXJzaW9uWzJdIDwgMSkgfHwgKHZlcnNpb25bMF0gPiAzKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdCb290c3RyYXBcXCdzIEphdmFTY3JpcHQgcmVxdWlyZXMgalF1ZXJ5IHZlcnNpb24gMS45LjEgb3IgaGlnaGVyLCBidXQgbG93ZXIgdGhhbiB2ZXJzaW9uIDQnKVxyXG4gIH1cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogdHJhbnNpdGlvbi5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdHJhbnNpdGlvbnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIENTUyBUUkFOU0lUSU9OIFNVUFBPUlQgKFNob3V0b3V0OiBodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vKVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xyXG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYm9vdHN0cmFwJylcclxuXHJcbiAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xyXG4gICAgICBXZWJraXRUcmFuc2l0aW9uIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxyXG4gICAgICBNb3pUcmFuc2l0aW9uICAgIDogJ3RyYW5zaXRpb25lbmQnLFxyXG4gICAgICBPVHJhbnNpdGlvbiAgICAgIDogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcclxuICAgICAgdHJhbnNpdGlvbiAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XHJcbiAgICAgIGlmIChlbC5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZW5kOiB0cmFuc0VuZEV2ZW50TmFtZXNbbmFtZV0gfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlIC8vIGV4cGxpY2l0IGZvciBpZTggKCAgLl8uKVxyXG4gIH1cclxuXHJcbiAgLy8gaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vY3NzLXRyYW5zaXRpb25zXHJcbiAgJC5mbi5lbXVsYXRlVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xyXG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlXHJcbiAgICB2YXIgJGVsID0gdGhpc1xyXG4gICAgJCh0aGlzKS5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHsgY2FsbGVkID0gdHJ1ZSB9KVxyXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkgeyBpZiAoIWNhbGxlZCkgJCgkZWwpLnRyaWdnZXIoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSB9XHJcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkdXJhdGlvbilcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAkKGZ1bmN0aW9uICgpIHtcclxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkVuZCgpXHJcblxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuXHJcblxyXG4gICAgJC5ldmVudC5zcGVjaWFsLmJzVHJhbnNpdGlvbkVuZCA9IHtcclxuICAgICAgYmluZFR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcclxuICAgICAgZGVsZWdhdGVUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXHJcbiAgICAgIGhhbmRsZTogZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXModGhpcykpIHJldHVybiBlLmhhbmRsZU9iai5oYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBhbGVydC5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jYWxlcnRzXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBBTEVSVCBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgZGlzbWlzcyA9ICdbZGF0YS1kaXNtaXNzPVwiYWxlcnRcIl0nXHJcbiAgdmFyIEFsZXJ0ICAgPSBmdW5jdGlvbiAoZWwpIHtcclxuICAgICQoZWwpLm9uKCdjbGljaycsIGRpc21pc3MsIHRoaXMuY2xvc2UpXHJcbiAgfVxyXG5cclxuICBBbGVydC5WRVJTSU9OID0gJzMuMy43J1xyXG5cclxuICBBbGVydC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXHJcblxyXG4gIEFsZXJ0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgICAgPSAkKHRoaXMpXHJcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXHJcblxyXG4gICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxyXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICB9XHJcblxyXG4gICAgdmFyICRwYXJlbnQgPSAkKHNlbGVjdG9yID09PSAnIycgPyBbXSA6IHNlbGVjdG9yKVxyXG5cclxuICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICBpZiAoISRwYXJlbnQubGVuZ3RoKSB7XHJcbiAgICAgICRwYXJlbnQgPSAkdGhpcy5jbG9zZXN0KCcuYWxlcnQnKVxyXG4gICAgfVxyXG5cclxuICAgICRwYXJlbnQudHJpZ2dlcihlID0gJC5FdmVudCgnY2xvc2UuYnMuYWxlcnQnKSlcclxuXHJcbiAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgJHBhcmVudC5yZW1vdmVDbGFzcygnaW4nKVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoKSB7XHJcbiAgICAgIC8vIGRldGFjaCBmcm9tIHBhcmVudCwgZmlyZSBldmVudCB0aGVuIGNsZWFuIHVwIGRhdGFcclxuICAgICAgJHBhcmVudC5kZXRhY2goKS50cmlnZ2VyKCdjbG9zZWQuYnMuYWxlcnQnKS5yZW1vdmUoKVxyXG4gICAgfVxyXG5cclxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmICRwYXJlbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XHJcbiAgICAgICRwYXJlbnRcclxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCByZW1vdmVFbGVtZW50KVxyXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChBbGVydC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgIHJlbW92ZUVsZW1lbnQoKVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIEFMRVJUIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgID0gJHRoaXMuZGF0YSgnYnMuYWxlcnQnKVxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5hbGVydCcsIChkYXRhID0gbmV3IEFsZXJ0KHRoaXMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXS5jYWxsKCR0aGlzKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmFsZXJ0XHJcblxyXG4gICQuZm4uYWxlcnQgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmFsZXJ0LkNvbnN0cnVjdG9yID0gQWxlcnRcclxuXHJcblxyXG4gIC8vIEFMRVJUIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5hbGVydC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5hbGVydCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBBTEVSVCBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5hbGVydC5kYXRhLWFwaScsIGRpc21pc3MsIEFsZXJ0LnByb3RvdHlwZS5jbG9zZSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGJ1dHRvbi5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jYnV0dG9uc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQlVUVE9OIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBCdXR0b24gPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgICA9ICQuZXh0ZW5kKHt9LCBCdXR0b24uREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBCdXR0b24uVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIEJ1dHRvbi5ERUZBVUxUUyA9IHtcclxuICAgIGxvYWRpbmdUZXh0OiAnbG9hZGluZy4uLidcclxuICB9XHJcblxyXG4gIEJ1dHRvbi5wcm90b3R5cGUuc2V0U3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcclxuICAgIHZhciBkICAgID0gJ2Rpc2FibGVkJ1xyXG4gICAgdmFyICRlbCAgPSB0aGlzLiRlbGVtZW50XHJcbiAgICB2YXIgdmFsICA9ICRlbC5pcygnaW5wdXQnKSA/ICd2YWwnIDogJ2h0bWwnXHJcbiAgICB2YXIgZGF0YSA9ICRlbC5kYXRhKClcclxuXHJcbiAgICBzdGF0ZSArPSAnVGV4dCdcclxuXHJcbiAgICBpZiAoZGF0YS5yZXNldFRleHQgPT0gbnVsbCkgJGVsLmRhdGEoJ3Jlc2V0VGV4dCcsICRlbFt2YWxdKCkpXHJcblxyXG4gICAgLy8gcHVzaCB0byBldmVudCBsb29wIHRvIGFsbG93IGZvcm1zIHRvIHN1Ym1pdFxyXG4gICAgc2V0VGltZW91dCgkLnByb3h5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgJGVsW3ZhbF0oZGF0YVtzdGF0ZV0gPT0gbnVsbCA/IHRoaXMub3B0aW9uc1tzdGF0ZV0gOiBkYXRhW3N0YXRlXSlcclxuXHJcbiAgICAgIGlmIChzdGF0ZSA9PSAnbG9hZGluZ1RleHQnKSB7XHJcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlXHJcbiAgICAgICAgJGVsLmFkZENsYXNzKGQpLmF0dHIoZCwgZCkucHJvcChkLCB0cnVlKVxyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXNMb2FkaW5nKSB7XHJcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxyXG4gICAgICAgICRlbC5yZW1vdmVDbGFzcyhkKS5yZW1vdmVBdHRyKGQpLnByb3AoZCwgZmFsc2UpXHJcbiAgICAgIH1cclxuICAgIH0sIHRoaXMpLCAwKVxyXG4gIH1cclxuXHJcbiAgQnV0dG9uLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgY2hhbmdlZCA9IHRydWVcclxuICAgIHZhciAkcGFyZW50ID0gdGhpcy4kZWxlbWVudC5jbG9zZXN0KCdbZGF0YS10b2dnbGU9XCJidXR0b25zXCJdJylcclxuXHJcbiAgICBpZiAoJHBhcmVudC5sZW5ndGgpIHtcclxuICAgICAgdmFyICRpbnB1dCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW5wdXQnKVxyXG4gICAgICBpZiAoJGlucHV0LnByb3AoJ3R5cGUnKSA9PSAncmFkaW8nKSB7XHJcbiAgICAgICAgaWYgKCRpbnB1dC5wcm9wKCdjaGVja2VkJykpIGNoYW5nZWQgPSBmYWxzZVxyXG4gICAgICAgICRwYXJlbnQuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIH0gZWxzZSBpZiAoJGlucHV0LnByb3AoJ3R5cGUnKSA9PSAnY2hlY2tib3gnKSB7XHJcbiAgICAgICAgaWYgKCgkaW5wdXQucHJvcCgnY2hlY2tlZCcpKSAhPT0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnYWN0aXZlJykpIGNoYW5nZWQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIH1cclxuICAgICAgJGlucHV0LnByb3AoJ2NoZWNrZWQnLCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdhY3RpdmUnKSlcclxuICAgICAgaWYgKGNoYW5nZWQpICRpbnB1dC50cmlnZ2VyKCdjaGFuZ2UnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLXByZXNzZWQnLCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnYWN0aXZlJykpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQlVUVE9OIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5idXR0b24nKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmJ1dHRvbicsIChkYXRhID0gbmV3IEJ1dHRvbih0aGlzLCBvcHRpb25zKSkpXHJcblxyXG4gICAgICBpZiAob3B0aW9uID09ICd0b2dnbGUnKSBkYXRhLnRvZ2dsZSgpXHJcbiAgICAgIGVsc2UgaWYgKG9wdGlvbikgZGF0YS5zZXRTdGF0ZShvcHRpb24pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uYnV0dG9uXHJcblxyXG4gICQuZm4uYnV0dG9uICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5idXR0b24uQ29uc3RydWN0b3IgPSBCdXR0b25cclxuXHJcblxyXG4gIC8vIEJVVFRPTiBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmJ1dHRvbi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5idXR0b24gPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQlVUVE9OIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpXHJcbiAgICAub24oJ2NsaWNrLmJzLmJ1dHRvbi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGVePVwiYnV0dG9uXCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgdmFyICRidG4gPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuYnRuJylcclxuICAgICAgUGx1Z2luLmNhbGwoJGJ0biwgJ3RvZ2dsZScpXHJcbiAgICAgIGlmICghKCQoZS50YXJnZXQpLmlzKCdpbnB1dFt0eXBlPVwicmFkaW9cIl0sIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpKSkge1xyXG4gICAgICAgIC8vIFByZXZlbnQgZG91YmxlIGNsaWNrIG9uIHJhZGlvcywgYW5kIHRoZSBkb3VibGUgc2VsZWN0aW9ucyAoc28gY2FuY2VsbGF0aW9uKSBvbiBjaGVja2JveGVzXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgLy8gVGhlIHRhcmdldCBjb21wb25lbnQgc3RpbGwgcmVjZWl2ZSB0aGUgZm9jdXNcclxuICAgICAgICBpZiAoJGJ0bi5pcygnaW5wdXQsYnV0dG9uJykpICRidG4udHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICAgIGVsc2UgJGJ0bi5maW5kKCdpbnB1dDp2aXNpYmxlLGJ1dHRvbjp2aXNpYmxlJykuZmlyc3QoKS50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAub24oJ2ZvY3VzLmJzLmJ1dHRvbi5kYXRhLWFwaSBibHVyLmJzLmJ1dHRvbi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGVePVwiYnV0dG9uXCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLmJ0bicpLnRvZ2dsZUNsYXNzKCdmb2N1cycsIC9eZm9jdXMoaW4pPyQvLnRlc3QoZS50eXBlKSlcclxuICAgIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBjYXJvdXNlbC5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jY2Fyb3VzZWxcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIENBUk9VU0VMIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBDYXJvdXNlbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ICAgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy4kaW5kaWNhdG9ycyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmNhcm91c2VsLWluZGljYXRvcnMnKVxyXG4gICAgdGhpcy5vcHRpb25zICAgICA9IG9wdGlvbnNcclxuICAgIHRoaXMucGF1c2VkICAgICAgPSBudWxsXHJcbiAgICB0aGlzLnNsaWRpbmcgICAgID0gbnVsbFxyXG4gICAgdGhpcy5pbnRlcnZhbCAgICA9IG51bGxcclxuICAgIHRoaXMuJGFjdGl2ZSAgICAgPSBudWxsXHJcbiAgICB0aGlzLiRpdGVtcyAgICAgID0gbnVsbFxyXG5cclxuICAgIHRoaXMub3B0aW9ucy5rZXlib2FyZCAmJiB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLmJzLmNhcm91c2VsJywgJC5wcm94eSh0aGlzLmtleWRvd24sIHRoaXMpKVxyXG5cclxuICAgIHRoaXMub3B0aW9ucy5wYXVzZSA9PSAnaG92ZXInICYmICEoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSAmJiB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5vbignbW91c2VlbnRlci5icy5jYXJvdXNlbCcsICQucHJveHkodGhpcy5wYXVzZSwgdGhpcykpXHJcbiAgICAgIC5vbignbW91c2VsZWF2ZS5icy5jYXJvdXNlbCcsICQucHJveHkodGhpcy5jeWNsZSwgdGhpcykpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgQ2Fyb3VzZWwuVFJBTlNJVElPTl9EVVJBVElPTiA9IDYwMFxyXG5cclxuICBDYXJvdXNlbC5ERUZBVUxUUyA9IHtcclxuICAgIGludGVydmFsOiA1MDAwLFxyXG4gICAgcGF1c2U6ICdob3ZlcicsXHJcbiAgICB3cmFwOiB0cnVlLFxyXG4gICAga2V5Ym9hcmQ6IHRydWVcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5rZXlkb3duID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICgvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpKSByZXR1cm5cclxuICAgIHN3aXRjaCAoZS53aGljaCkge1xyXG4gICAgICBjYXNlIDM3OiB0aGlzLnByZXYoKTsgYnJlYWtcclxuICAgICAgY2FzZSAzOTogdGhpcy5uZXh0KCk7IGJyZWFrXHJcbiAgICAgIGRlZmF1bHQ6IHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLmN5Y2xlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUgfHwgKHRoaXMucGF1c2VkID0gZmFsc2UpXHJcblxyXG4gICAgdGhpcy5pbnRlcnZhbCAmJiBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpXHJcblxyXG4gICAgdGhpcy5vcHRpb25zLmludGVydmFsXHJcbiAgICAgICYmICF0aGlzLnBhdXNlZFxyXG4gICAgICAmJiAodGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCQucHJveHkodGhpcy5uZXh0LCB0aGlzKSwgdGhpcy5vcHRpb25zLmludGVydmFsKSlcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLmdldEl0ZW1JbmRleCA9IGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICB0aGlzLiRpdGVtcyA9IGl0ZW0ucGFyZW50KCkuY2hpbGRyZW4oJy5pdGVtJylcclxuICAgIHJldHVybiB0aGlzLiRpdGVtcy5pbmRleChpdGVtIHx8IHRoaXMuJGFjdGl2ZSlcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5nZXRJdGVtRm9yRGlyZWN0aW9uID0gZnVuY3Rpb24gKGRpcmVjdGlvbiwgYWN0aXZlKSB7XHJcbiAgICB2YXIgYWN0aXZlSW5kZXggPSB0aGlzLmdldEl0ZW1JbmRleChhY3RpdmUpXHJcbiAgICB2YXIgd2lsbFdyYXAgPSAoZGlyZWN0aW9uID09ICdwcmV2JyAmJiBhY3RpdmVJbmRleCA9PT0gMClcclxuICAgICAgICAgICAgICAgIHx8IChkaXJlY3Rpb24gPT0gJ25leHQnICYmIGFjdGl2ZUluZGV4ID09ICh0aGlzLiRpdGVtcy5sZW5ndGggLSAxKSlcclxuICAgIGlmICh3aWxsV3JhcCAmJiAhdGhpcy5vcHRpb25zLndyYXApIHJldHVybiBhY3RpdmVcclxuICAgIHZhciBkZWx0YSA9IGRpcmVjdGlvbiA9PSAncHJldicgPyAtMSA6IDFcclxuICAgIHZhciBpdGVtSW5kZXggPSAoYWN0aXZlSW5kZXggKyBkZWx0YSkgJSB0aGlzLiRpdGVtcy5sZW5ndGhcclxuICAgIHJldHVybiB0aGlzLiRpdGVtcy5lcShpdGVtSW5kZXgpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUudG8gPSBmdW5jdGlvbiAocG9zKSB7XHJcbiAgICB2YXIgdGhhdCAgICAgICAgPSB0aGlzXHJcbiAgICB2YXIgYWN0aXZlSW5kZXggPSB0aGlzLmdldEl0ZW1JbmRleCh0aGlzLiRhY3RpdmUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pdGVtLmFjdGl2ZScpKVxyXG5cclxuICAgIGlmIChwb3MgPiAodGhpcy4kaXRlbXMubGVuZ3RoIC0gMSkgfHwgcG9zIDwgMCkgcmV0dXJuXHJcblxyXG4gICAgaWYgKHRoaXMuc2xpZGluZykgICAgICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQub25lKCdzbGlkLmJzLmNhcm91c2VsJywgZnVuY3Rpb24gKCkgeyB0aGF0LnRvKHBvcykgfSkgLy8geWVzLCBcInNsaWRcIlxyXG4gICAgaWYgKGFjdGl2ZUluZGV4ID09IHBvcykgcmV0dXJuIHRoaXMucGF1c2UoKS5jeWNsZSgpXHJcblxyXG4gICAgcmV0dXJuIHRoaXMuc2xpZGUocG9zID4gYWN0aXZlSW5kZXggPyAnbmV4dCcgOiAncHJldicsIHRoaXMuJGl0ZW1zLmVxKHBvcykpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZSB8fCAodGhpcy5wYXVzZWQgPSB0cnVlKVxyXG5cclxuICAgIGlmICh0aGlzLiRlbGVtZW50LmZpbmQoJy5uZXh0LCAucHJldicpLmxlbmd0aCAmJiAkLnN1cHBvcnQudHJhbnNpdGlvbikge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKVxyXG4gICAgICB0aGlzLmN5Y2xlKHRydWUpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbnRlcnZhbCA9IGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zbGlkaW5nKSByZXR1cm5cclxuICAgIHJldHVybiB0aGlzLnNsaWRlKCduZXh0JylcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5wcmV2ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuc2xpZGluZykgcmV0dXJuXHJcbiAgICByZXR1cm4gdGhpcy5zbGlkZSgncHJldicpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUuc2xpZGUgPSBmdW5jdGlvbiAodHlwZSwgbmV4dCkge1xyXG4gICAgdmFyICRhY3RpdmUgICA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLml0ZW0uYWN0aXZlJylcclxuICAgIHZhciAkbmV4dCAgICAgPSBuZXh0IHx8IHRoaXMuZ2V0SXRlbUZvckRpcmVjdGlvbih0eXBlLCAkYWN0aXZlKVxyXG4gICAgdmFyIGlzQ3ljbGluZyA9IHRoaXMuaW50ZXJ2YWxcclxuICAgIHZhciBkaXJlY3Rpb24gPSB0eXBlID09ICduZXh0JyA/ICdsZWZ0JyA6ICdyaWdodCdcclxuICAgIHZhciB0aGF0ICAgICAgPSB0aGlzXHJcblxyXG4gICAgaWYgKCRuZXh0Lmhhc0NsYXNzKCdhY3RpdmUnKSkgcmV0dXJuICh0aGlzLnNsaWRpbmcgPSBmYWxzZSlcclxuXHJcbiAgICB2YXIgcmVsYXRlZFRhcmdldCA9ICRuZXh0WzBdXHJcbiAgICB2YXIgc2xpZGVFdmVudCA9ICQuRXZlbnQoJ3NsaWRlLmJzLmNhcm91c2VsJywge1xyXG4gICAgICByZWxhdGVkVGFyZ2V0OiByZWxhdGVkVGFyZ2V0LFxyXG4gICAgICBkaXJlY3Rpb246IGRpcmVjdGlvblxyXG4gICAgfSlcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzbGlkZUV2ZW50KVxyXG4gICAgaWYgKHNsaWRlRXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHRoaXMuc2xpZGluZyA9IHRydWVcclxuXHJcbiAgICBpc0N5Y2xpbmcgJiYgdGhpcy5wYXVzZSgpXHJcblxyXG4gICAgaWYgKHRoaXMuJGluZGljYXRvcnMubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuJGluZGljYXRvcnMuZmluZCgnLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB2YXIgJG5leHRJbmRpY2F0b3IgPSAkKHRoaXMuJGluZGljYXRvcnMuY2hpbGRyZW4oKVt0aGlzLmdldEl0ZW1JbmRleCgkbmV4dCldKVxyXG4gICAgICAkbmV4dEluZGljYXRvciAmJiAkbmV4dEluZGljYXRvci5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2xpZEV2ZW50ID0gJC5FdmVudCgnc2xpZC5icy5jYXJvdXNlbCcsIHsgcmVsYXRlZFRhcmdldDogcmVsYXRlZFRhcmdldCwgZGlyZWN0aW9uOiBkaXJlY3Rpb24gfSkgLy8geWVzLCBcInNsaWRcIlxyXG4gICAgaWYgKCQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3NsaWRlJykpIHtcclxuICAgICAgJG5leHQuYWRkQ2xhc3ModHlwZSlcclxuICAgICAgJG5leHRbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XHJcbiAgICAgICRhY3RpdmUuYWRkQ2xhc3MoZGlyZWN0aW9uKVxyXG4gICAgICAkbmV4dC5hZGRDbGFzcyhkaXJlY3Rpb24pXHJcbiAgICAgICRhY3RpdmVcclxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAkbmV4dC5yZW1vdmVDbGFzcyhbdHlwZSwgZGlyZWN0aW9uXS5qb2luKCcgJykpLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgICAgJGFjdGl2ZS5yZW1vdmVDbGFzcyhbJ2FjdGl2ZScsIGRpcmVjdGlvbl0uam9pbignICcpKVxyXG4gICAgICAgICAgdGhhdC5zbGlkaW5nID0gZmFsc2VcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoc2xpZEV2ZW50KVxyXG4gICAgICAgICAgfSwgMClcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDYXJvdXNlbC5UUkFOU0lUSU9OX0RVUkFUSU9OKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGFjdGl2ZS5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgJG5leHQuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIHRoaXMuc2xpZGluZyA9IGZhbHNlXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzbGlkRXZlbnQpXHJcbiAgICB9XHJcblxyXG4gICAgaXNDeWNsaW5nICYmIHRoaXMuY3ljbGUoKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ0FST1VTRUwgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY2Fyb3VzZWwnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDYXJvdXNlbC5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcclxuICAgICAgdmFyIGFjdGlvbiAgPSB0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnID8gb3B0aW9uIDogb3B0aW9ucy5zbGlkZVxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5jYXJvdXNlbCcsIChkYXRhID0gbmV3IENhcm91c2VsKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ251bWJlcicpIGRhdGEudG8ob3B0aW9uKVxyXG4gICAgICBlbHNlIGlmIChhY3Rpb24pIGRhdGFbYWN0aW9uXSgpXHJcbiAgICAgIGVsc2UgaWYgKG9wdGlvbnMuaW50ZXJ2YWwpIGRhdGEucGF1c2UoKS5jeWNsZSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uY2Fyb3VzZWxcclxuXHJcbiAgJC5mbi5jYXJvdXNlbCAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uY2Fyb3VzZWwuQ29uc3RydWN0b3IgPSBDYXJvdXNlbFxyXG5cclxuXHJcbiAgLy8gQ0FST1VTRUwgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmNhcm91c2VsLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmNhcm91c2VsID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENBUk9VU0VMIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIGNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgaHJlZlxyXG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICB2YXIgJHRhcmdldCA9ICQoJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSB8fCAoaHJlZiA9ICR0aGlzLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykpIC8vIHN0cmlwIGZvciBpZTdcclxuICAgIGlmICghJHRhcmdldC5oYXNDbGFzcygnY2Fyb3VzZWwnKSkgcmV0dXJuXHJcbiAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxyXG4gICAgdmFyIHNsaWRlSW5kZXggPSAkdGhpcy5hdHRyKCdkYXRhLXNsaWRlLXRvJylcclxuICAgIGlmIChzbGlkZUluZGV4KSBvcHRpb25zLmludGVydmFsID0gZmFsc2VcclxuXHJcbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb25zKVxyXG5cclxuICAgIGlmIChzbGlkZUluZGV4KSB7XHJcbiAgICAgICR0YXJnZXQuZGF0YSgnYnMuY2Fyb3VzZWwnKS50byhzbGlkZUluZGV4KVxyXG4gICAgfVxyXG5cclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gIH1cclxuXHJcbiAgJChkb2N1bWVudClcclxuICAgIC5vbignY2xpY2suYnMuY2Fyb3VzZWwuZGF0YS1hcGknLCAnW2RhdGEtc2xpZGVdJywgY2xpY2tIYW5kbGVyKVxyXG4gICAgLm9uKCdjbGljay5icy5jYXJvdXNlbC5kYXRhLWFwaScsICdbZGF0YS1zbGlkZS10b10nLCBjbGlja0hhbmRsZXIpXHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ1tkYXRhLXJpZGU9XCJjYXJvdXNlbFwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJGNhcm91c2VsID0gJCh0aGlzKVxyXG4gICAgICBQbHVnaW4uY2FsbCgkY2Fyb3VzZWwsICRjYXJvdXNlbC5kYXRhKCkpXHJcbiAgICB9KVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBjb2xsYXBzZS5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jY29sbGFwc2VcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcbi8qIGpzaGludCBsYXRlZGVmOiBmYWxzZSAqL1xyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDT0xMQVBTRSBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBDb2xsYXBzZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLiR0cmlnZ2VyICAgICAgPSAkKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtocmVmPVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXSwnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtdGFyZ2V0PVwiIycgKyBlbGVtZW50LmlkICsgJ1wiXScpXHJcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSBudWxsXHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wYXJlbnQpIHtcclxuICAgICAgdGhpcy4kcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3ModGhpcy4kZWxlbWVudCwgdGhpcy4kdHJpZ2dlcilcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnRvZ2dsZSkgdGhpcy50b2dnbGUoKVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzNTBcclxuXHJcbiAgQ29sbGFwc2UuREVGQVVMVFMgPSB7XHJcbiAgICB0b2dnbGU6IHRydWVcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5kaW1lbnNpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaGFzV2lkdGggPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCd3aWR0aCcpXHJcbiAgICByZXR1cm4gaGFzV2lkdGggPyAnd2lkdGgnIDogJ2hlaWdodCdcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgYWN0aXZlc0RhdGFcclxuICAgIHZhciBhY3RpdmVzID0gdGhpcy4kcGFyZW50ICYmIHRoaXMuJHBhcmVudC5jaGlsZHJlbignLnBhbmVsJykuY2hpbGRyZW4oJy5pbiwgLmNvbGxhcHNpbmcnKVxyXG5cclxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XHJcbiAgICAgIGFjdGl2ZXNEYXRhID0gYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScpXHJcbiAgICAgIGlmIChhY3RpdmVzRGF0YSAmJiBhY3RpdmVzRGF0YS50cmFuc2l0aW9uaW5nKSByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMuY29sbGFwc2UnKVxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXHJcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcclxuICAgICAgUGx1Z2luLmNhbGwoYWN0aXZlcywgJ2hpZGUnKVxyXG4gICAgICBhY3RpdmVzRGF0YSB8fCBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJywgbnVsbClcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpW2RpbWVuc2lvbl0oMClcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG5cclxuICAgIHRoaXMuJHRyaWdnZXJcclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZWQnKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcblxyXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxyXG5cclxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZSBpbicpW2RpbWVuc2lvbl0oJycpXHJcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC50cmlnZ2VyKCdzaG93bi5icy5jb2xsYXBzZScpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcclxuXHJcbiAgICB2YXIgc2Nyb2xsU2l6ZSA9ICQuY2FtZWxDYXNlKFsnc2Nyb2xsJywgZGltZW5zaW9uXS5qb2luKCctJykpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcclxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pW2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFswXVtzY3JvbGxTaXplXSlcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMudHJhbnNpdGlvbmluZyB8fCAhdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLmNvbGxhcHNlJylcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxyXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSgpKVswXS5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UgaW4nKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgIHRoaXMuJHRyaWdnZXJcclxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZWQnKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcclxuXHJcbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDBcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2luZycpXHJcbiAgICAgICAgLmFkZENsYXNzKCdjb2xsYXBzZScpXHJcbiAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy5jb2xsYXBzZScpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuIGNvbXBsZXRlLmNhbGwodGhpcylcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIFtkaW1lbnNpb25dKDApXHJcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxyXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzW3RoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykgPyAnaGlkZScgOiAnc2hvdyddKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gJCh0aGlzLm9wdGlvbnMucGFyZW50KVxyXG4gICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS1wYXJlbnQ9XCInICsgdGhpcy5vcHRpb25zLnBhcmVudCArICdcIl0nKVxyXG4gICAgICAuZWFjaCgkLnByb3h5KGZ1bmN0aW9uIChpLCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKGdldFRhcmdldEZyb21UcmlnZ2VyKCRlbGVtZW50KSwgJGVsZW1lbnQpXHJcbiAgICAgIH0sIHRoaXMpKVxyXG4gICAgICAuZW5kKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLnByb3RvdHlwZS5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MgPSBmdW5jdGlvbiAoJGVsZW1lbnQsICR0cmlnZ2VyKSB7XHJcbiAgICB2YXIgaXNPcGVuID0gJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJylcclxuXHJcbiAgICAkZWxlbWVudC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxyXG4gICAgJHRyaWdnZXJcclxuICAgICAgLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZWQnLCAhaXNPcGVuKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFRhcmdldEZyb21UcmlnZ2VyKCR0cmlnZ2VyKSB7XHJcbiAgICB2YXIgaHJlZlxyXG4gICAgdmFyIHRhcmdldCA9ICR0cmlnZ2VyLmF0dHIoJ2RhdGEtdGFyZ2V0JylcclxuICAgICAgfHwgKGhyZWYgPSAkdHJpZ2dlci5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcclxuXHJcbiAgICByZXR1cm4gJCh0YXJnZXQpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ09MTEFQU0UgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcclxuXHJcbiAgICAgIGlmICghZGF0YSAmJiBvcHRpb25zLnRvZ2dsZSAmJiAvc2hvd3xoaWRlLy50ZXN0KG9wdGlvbikpIG9wdGlvbnMudG9nZ2xlID0gZmFsc2VcclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScsIChkYXRhID0gbmV3IENvbGxhcHNlKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uY29sbGFwc2VcclxuXHJcbiAgJC5mbi5jb2xsYXBzZSAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uY29sbGFwc2UuQ29uc3RydWN0b3IgPSBDb2xsYXBzZVxyXG5cclxuXHJcbiAgLy8gQ09MTEFQU0UgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmNvbGxhcHNlLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmNvbGxhcHNlID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENPTExBUFNFIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLmNvbGxhcHNlLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG5cclxuICAgIGlmICghJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgdmFyICR0YXJnZXQgPSBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdGhpcylcclxuICAgIHZhciBkYXRhICAgID0gJHRhcmdldC5kYXRhKCdicy5jb2xsYXBzZScpXHJcbiAgICB2YXIgb3B0aW9uICA9IGRhdGEgPyAndG9nZ2xlJyA6ICR0aGlzLmRhdGEoKVxyXG5cclxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbilcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogZHJvcGRvd24uanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2Ryb3Bkb3duc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gRFJPUERPV04gQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIGJhY2tkcm9wID0gJy5kcm9wZG93bi1iYWNrZHJvcCdcclxuICB2YXIgdG9nZ2xlICAgPSAnW2RhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIl0nXHJcbiAgdmFyIERyb3Bkb3duID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICQoZWxlbWVudCkub24oJ2NsaWNrLmJzLmRyb3Bkb3duJywgdGhpcy50b2dnbGUpXHJcbiAgfVxyXG5cclxuICBEcm9wZG93bi5WRVJTSU9OID0gJzMuMy43J1xyXG5cclxuICBmdW5jdGlvbiBnZXRQYXJlbnQoJHRoaXMpIHtcclxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JylcclxuXHJcbiAgICBpZiAoIXNlbGVjdG9yKSB7XHJcbiAgICAgIHNlbGVjdG9yID0gJHRoaXMuYXR0cignaHJlZicpXHJcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgJiYgLyNbQS1aYS16XS8udGVzdChzZWxlY3RvcikgJiYgc2VsZWN0b3IucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcclxuICAgIH1cclxuXHJcbiAgICB2YXIgJHBhcmVudCA9IHNlbGVjdG9yICYmICQoc2VsZWN0b3IpXHJcblxyXG4gICAgcmV0dXJuICRwYXJlbnQgJiYgJHBhcmVudC5sZW5ndGggPyAkcGFyZW50IDogJHRoaXMucGFyZW50KClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNsZWFyTWVudXMoZSkge1xyXG4gICAgaWYgKGUgJiYgZS53aGljaCA9PT0gMykgcmV0dXJuXHJcbiAgICAkKGJhY2tkcm9wKS5yZW1vdmUoKVxyXG4gICAgJCh0b2dnbGUpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICAgICAgICA9ICQodGhpcylcclxuICAgICAgdmFyICRwYXJlbnQgICAgICAgPSBnZXRQYXJlbnQoJHRoaXMpXHJcbiAgICAgIHZhciByZWxhdGVkVGFyZ2V0ID0geyByZWxhdGVkVGFyZ2V0OiB0aGlzIH1cclxuXHJcbiAgICAgIGlmICghJHBhcmVudC5oYXNDbGFzcygnb3BlbicpKSByZXR1cm5cclxuXHJcbiAgICAgIGlmIChlICYmIGUudHlwZSA9PSAnY2xpY2snICYmIC9pbnB1dHx0ZXh0YXJlYS9pLnRlc3QoZS50YXJnZXQudGFnTmFtZSkgJiYgJC5jb250YWlucygkcGFyZW50WzBdLCBlLnRhcmdldCkpIHJldHVyblxyXG5cclxuICAgICAgJHBhcmVudC50cmlnZ2VyKGUgPSAkLkV2ZW50KCdoaWRlLmJzLmRyb3Bkb3duJywgcmVsYXRlZFRhcmdldCkpXHJcblxyXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgICAkdGhpcy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJylcclxuICAgICAgJHBhcmVudC5yZW1vdmVDbGFzcygnb3BlbicpLnRyaWdnZXIoJC5FdmVudCgnaGlkZGVuLmJzLmRyb3Bkb3duJywgcmVsYXRlZFRhcmdldCkpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgRHJvcGRvd24ucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcblxyXG4gICAgaWYgKCR0aGlzLmlzKCcuZGlzYWJsZWQsIDpkaXNhYmxlZCcpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgJHBhcmVudCAgPSBnZXRQYXJlbnQoJHRoaXMpXHJcbiAgICB2YXIgaXNBY3RpdmUgPSAkcGFyZW50Lmhhc0NsYXNzKCdvcGVuJylcclxuXHJcbiAgICBjbGVhck1lbnVzKClcclxuXHJcbiAgICBpZiAoIWlzQWN0aXZlKSB7XHJcbiAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgISRwYXJlbnQuY2xvc2VzdCgnLm5hdmJhci1uYXYnKS5sZW5ndGgpIHtcclxuICAgICAgICAvLyBpZiBtb2JpbGUgd2UgdXNlIGEgYmFja2Ryb3AgYmVjYXVzZSBjbGljayBldmVudHMgZG9uJ3QgZGVsZWdhdGVcclxuICAgICAgICAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKVxyXG4gICAgICAgICAgLmFkZENsYXNzKCdkcm9wZG93bi1iYWNrZHJvcCcpXHJcbiAgICAgICAgICAuaW5zZXJ0QWZ0ZXIoJCh0aGlzKSlcclxuICAgICAgICAgIC5vbignY2xpY2snLCBjbGVhck1lbnVzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgcmVsYXRlZFRhcmdldCA9IHsgcmVsYXRlZFRhcmdldDogdGhpcyB9XHJcbiAgICAgICRwYXJlbnQudHJpZ2dlcihlID0gJC5FdmVudCgnc2hvdy5icy5kcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpKVxyXG5cclxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgICAgJHRoaXNcclxuICAgICAgICAudHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ3RydWUnKVxyXG5cclxuICAgICAgJHBhcmVudFxyXG4gICAgICAgIC50b2dnbGVDbGFzcygnb3BlbicpXHJcbiAgICAgICAgLnRyaWdnZXIoJC5FdmVudCgnc2hvd24uYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICghLygzOHw0MHwyN3wzMikvLnRlc3QoZS53aGljaCkgfHwgL2lucHV0fHRleHRhcmVhL2kudGVzdChlLnRhcmdldC50YWdOYW1lKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG5cclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cclxuICAgIGlmICgkdGhpcy5pcygnLmRpc2FibGVkLCA6ZGlzYWJsZWQnKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyICRwYXJlbnQgID0gZ2V0UGFyZW50KCR0aGlzKVxyXG4gICAgdmFyIGlzQWN0aXZlID0gJHBhcmVudC5oYXNDbGFzcygnb3BlbicpXHJcblxyXG4gICAgaWYgKCFpc0FjdGl2ZSAmJiBlLndoaWNoICE9IDI3IHx8IGlzQWN0aXZlICYmIGUud2hpY2ggPT0gMjcpIHtcclxuICAgICAgaWYgKGUud2hpY2ggPT0gMjcpICRwYXJlbnQuZmluZCh0b2dnbGUpLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgcmV0dXJuICR0aGlzLnRyaWdnZXIoJ2NsaWNrJylcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGVzYyA9ICcgbGk6bm90KC5kaXNhYmxlZCk6dmlzaWJsZSBhJ1xyXG4gICAgdmFyICRpdGVtcyA9ICRwYXJlbnQuZmluZCgnLmRyb3Bkb3duLW1lbnUnICsgZGVzYylcclxuXHJcbiAgICBpZiAoISRpdGVtcy5sZW5ndGgpIHJldHVyblxyXG5cclxuICAgIHZhciBpbmRleCA9ICRpdGVtcy5pbmRleChlLnRhcmdldClcclxuXHJcbiAgICBpZiAoZS53aGljaCA9PSAzOCAmJiBpbmRleCA+IDApICAgICAgICAgICAgICAgICBpbmRleC0tICAgICAgICAgLy8gdXBcclxuICAgIGlmIChlLndoaWNoID09IDQwICYmIGluZGV4IDwgJGl0ZW1zLmxlbmd0aCAtIDEpIGluZGV4KysgICAgICAgICAvLyBkb3duXHJcbiAgICBpZiAoIX5pbmRleCkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IDBcclxuXHJcbiAgICAkaXRlbXMuZXEoaW5kZXgpLnRyaWdnZXIoJ2ZvY3VzJylcclxuICB9XHJcblxyXG5cclxuICAvLyBEUk9QRE9XTiBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLmRyb3Bkb3duJylcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuZHJvcGRvd24nLCAoZGF0YSA9IG5ldyBEcm9wZG93bih0aGlzKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0uY2FsbCgkdGhpcylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5kcm9wZG93blxyXG5cclxuICAkLmZuLmRyb3Bkb3duICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5kcm9wZG93bi5Db25zdHJ1Y3RvciA9IERyb3Bkb3duXHJcblxyXG5cclxuICAvLyBEUk9QRE9XTiBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uZHJvcGRvd24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uZHJvcGRvd24gPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQVBQTFkgVE8gU1RBTkRBUkQgRFJPUERPV04gRUxFTUVOVFNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KVxyXG4gICAgLm9uKCdjbGljay5icy5kcm9wZG93bi5kYXRhLWFwaScsIGNsZWFyTWVudXMpXHJcbiAgICAub24oJ2NsaWNrLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgJy5kcm9wZG93biBmb3JtJywgZnVuY3Rpb24gKGUpIHsgZS5zdG9wUHJvcGFnYXRpb24oKSB9KVxyXG4gICAgLm9uKCdjbGljay5icy5kcm9wZG93bi5kYXRhLWFwaScsIHRvZ2dsZSwgRHJvcGRvd24ucHJvdG90eXBlLnRvZ2dsZSlcclxuICAgIC5vbigna2V5ZG93bi5icy5kcm9wZG93bi5kYXRhLWFwaScsIHRvZ2dsZSwgRHJvcGRvd24ucHJvdG90eXBlLmtleWRvd24pXHJcbiAgICAub24oJ2tleWRvd24uYnMuZHJvcGRvd24uZGF0YS1hcGknLCAnLmRyb3Bkb3duLW1lbnUnLCBEcm9wZG93bi5wcm90b3R5cGUua2V5ZG93bilcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IG1vZGFsLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNtb2RhbHNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIE1PREFMIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBNb2RhbCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgICAgICAgPSBvcHRpb25zXHJcbiAgICB0aGlzLiRib2R5ICAgICAgICAgICAgICAgPSAkKGRvY3VtZW50LmJvZHkpXHJcbiAgICB0aGlzLiRlbGVtZW50ICAgICAgICAgICAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLiRkaWFsb2cgICAgICAgICAgICAgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5tb2RhbC1kaWFsb2cnKVxyXG4gICAgdGhpcy4kYmFja2Ryb3AgICAgICAgICAgID0gbnVsbFxyXG4gICAgdGhpcy5pc1Nob3duICAgICAgICAgICAgID0gbnVsbFxyXG4gICAgdGhpcy5vcmlnaW5hbEJvZHlQYWQgICAgID0gbnVsbFxyXG4gICAgdGhpcy5zY3JvbGxiYXJXaWR0aCAgICAgID0gMFxyXG4gICAgdGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrID0gZmFsc2VcclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnJlbW90ZSkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLmZpbmQoJy5tb2RhbC1jb250ZW50JylcclxuICAgICAgICAubG9hZCh0aGlzLm9wdGlvbnMucmVtb3RlLCAkLnByb3h5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignbG9hZGVkLmJzLm1vZGFsJylcclxuICAgICAgICB9LCB0aGlzKSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE1vZGFsLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMzAwXHJcbiAgTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxyXG5cclxuICBNb2RhbC5ERUZBVUxUUyA9IHtcclxuICAgIGJhY2tkcm9wOiB0cnVlLFxyXG4gICAga2V5Ym9hcmQ6IHRydWUsXHJcbiAgICBzaG93OiB0cnVlXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKF9yZWxhdGVkVGFyZ2V0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc1Nob3duID8gdGhpcy5oaWRlKCkgOiB0aGlzLnNob3coX3JlbGF0ZWRUYXJnZXQpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ3Nob3cuYnMubW9kYWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IF9yZWxhdGVkVGFyZ2V0IH0pXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXHJcblxyXG4gICAgaWYgKHRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB0aGlzLmlzU2hvd24gPSB0cnVlXHJcblxyXG4gICAgdGhpcy5jaGVja1Njcm9sbGJhcigpXHJcbiAgICB0aGlzLnNldFNjcm9sbGJhcigpXHJcbiAgICB0aGlzLiRib2R5LmFkZENsYXNzKCdtb2RhbC1vcGVuJylcclxuXHJcbiAgICB0aGlzLmVzY2FwZSgpXHJcbiAgICB0aGlzLnJlc2l6ZSgpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcsICdbZGF0YS1kaXNtaXNzPVwibW9kYWxcIl0nLCAkLnByb3h5KHRoaXMuaGlkZSwgdGhpcykpXHJcblxyXG4gICAgdGhpcy4kZGlhbG9nLm9uKCdtb3VzZWRvd24uZGlzbWlzcy5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhhdC4kZWxlbWVudC5vbmUoJ21vdXNldXAuZGlzbWlzcy5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKHRoYXQuJGVsZW1lbnQpKSB0aGF0Lmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSB0cnVlXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgdHJhbnNpdGlvbiA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoYXQuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKVxyXG5cclxuICAgICAgaWYgKCF0aGF0LiRlbGVtZW50LnBhcmVudCgpLmxlbmd0aCkge1xyXG4gICAgICAgIHRoYXQuJGVsZW1lbnQuYXBwZW5kVG8odGhhdC4kYm9keSkgLy8gZG9uJ3QgbW92ZSBtb2RhbHMgZG9tIHBvc2l0aW9uXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoYXQuJGVsZW1lbnRcclxuICAgICAgICAuc2hvdygpXHJcbiAgICAgICAgLnNjcm9sbFRvcCgwKVxyXG5cclxuICAgICAgdGhhdC5hZGp1c3REaWFsb2coKVxyXG5cclxuICAgICAgaWYgKHRyYW5zaXRpb24pIHtcclxuICAgICAgICB0aGF0LiRlbGVtZW50WzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGF0LiRlbGVtZW50LmFkZENsYXNzKCdpbicpXHJcblxyXG4gICAgICB0aGF0LmVuZm9yY2VGb2N1cygpXHJcblxyXG4gICAgICB2YXIgZSA9ICQuRXZlbnQoJ3Nob3duLmJzLm1vZGFsJywgeyByZWxhdGVkVGFyZ2V0OiBfcmVsYXRlZFRhcmdldCB9KVxyXG5cclxuICAgICAgdHJhbnNpdGlvbiA/XHJcbiAgICAgICAgdGhhdC4kZGlhbG9nIC8vIHdhaXQgZm9yIG1vZGFsIHRvIHNsaWRlIGluXHJcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKS50cmlnZ2VyKGUpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcihlKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICBlID0gJC5FdmVudCgnaGlkZS5icy5tb2RhbCcpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXHJcblxyXG4gICAgaWYgKCF0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5pc1Nob3duID0gZmFsc2VcclxuXHJcbiAgICB0aGlzLmVzY2FwZSgpXHJcbiAgICB0aGlzLnJlc2l6ZSgpXHJcblxyXG4gICAgJChkb2N1bWVudCkub2ZmKCdmb2N1c2luLmJzLm1vZGFsJylcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5yZW1vdmVDbGFzcygnaW4nKVxyXG4gICAgICAub2ZmKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJylcclxuICAgICAgLm9mZignbW91c2V1cC5kaXNtaXNzLmJzLm1vZGFsJylcclxuXHJcbiAgICB0aGlzLiRkaWFsb2cub2ZmKCdtb3VzZWRvd24uZGlzbWlzcy5icy5tb2RhbCcpXHJcblxyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID9cclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkodGhpcy5oaWRlTW9kYWwsIHRoaXMpKVxyXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgIHRoaXMuaGlkZU1vZGFsKClcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5lbmZvcmNlRm9jdXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKGRvY3VtZW50KVxyXG4gICAgICAub2ZmKCdmb2N1c2luLmJzLm1vZGFsJykgLy8gZ3VhcmQgYWdhaW5zdCBpbmZpbml0ZSBmb2N1cyBsb29wXHJcbiAgICAgIC5vbignZm9jdXNpbi5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoZG9jdW1lbnQgIT09IGUudGFyZ2V0ICYmXHJcbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnRbMF0gIT09IGUudGFyZ2V0ICYmXHJcbiAgICAgICAgICAgICF0aGlzLiRlbGVtZW50LmhhcyhlLnRhcmdldCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgICB9XHJcbiAgICAgIH0sIHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmVzY2FwZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmtleWJvYXJkKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2tleWRvd24uZGlzbWlzcy5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLndoaWNoID09IDI3ICYmIHRoaXMuaGlkZSgpXHJcbiAgICAgIH0sIHRoaXMpKVxyXG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1Nob3duKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdrZXlkb3duLmRpc21pc3MuYnMubW9kYWwnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLmlzU2hvd24pIHtcclxuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuYnMubW9kYWwnLCAkLnByb3h5KHRoaXMuaGFuZGxlVXBkYXRlLCB0aGlzKSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5icy5tb2RhbCcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuaGlkZU1vZGFsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICB0aGlzLiRlbGVtZW50LmhpZGUoKVxyXG4gICAgdGhpcy5iYWNrZHJvcChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoYXQuJGJvZHkucmVtb3ZlQ2xhc3MoJ21vZGFsLW9wZW4nKVxyXG4gICAgICB0aGF0LnJlc2V0QWRqdXN0bWVudHMoKVxyXG4gICAgICB0aGF0LnJlc2V0U2Nyb2xsYmFyKClcclxuICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdoaWRkZW4uYnMubW9kYWwnKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5yZW1vdmVCYWNrZHJvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuJGJhY2tkcm9wICYmIHRoaXMuJGJhY2tkcm9wLnJlbW92ZSgpXHJcbiAgICB0aGlzLiRiYWNrZHJvcCA9IG51bGxcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5iYWNrZHJvcCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICB2YXIgYW5pbWF0ZSA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/ICdmYWRlJyA6ICcnXHJcblxyXG4gICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMuYmFja2Ryb3ApIHtcclxuICAgICAgdmFyIGRvQW5pbWF0ZSA9ICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIGFuaW1hdGVcclxuXHJcbiAgICAgIHRoaXMuJGJhY2tkcm9wID0gJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSlcclxuICAgICAgICAuYWRkQ2xhc3MoJ21vZGFsLWJhY2tkcm9wICcgKyBhbmltYXRlKVxyXG4gICAgICAgIC5hcHBlbmRUbyh0aGlzLiRib2R5KVxyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcsICQucHJveHkoZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAodGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrKSB7XHJcbiAgICAgICAgICB0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSBmYWxzZVxyXG4gICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLnRhcmdldCAhPT0gZS5jdXJyZW50VGFyZ2V0KSByZXR1cm5cclxuICAgICAgICB0aGlzLm9wdGlvbnMuYmFja2Ryb3AgPT0gJ3N0YXRpYydcclxuICAgICAgICAgID8gdGhpcy4kZWxlbWVudFswXS5mb2N1cygpXHJcbiAgICAgICAgICA6IHRoaXMuaGlkZSgpXHJcbiAgICAgIH0sIHRoaXMpKVxyXG5cclxuICAgICAgaWYgKGRvQW5pbWF0ZSkgdGhpcy4kYmFja2Ryb3BbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XHJcblxyXG4gICAgICB0aGlzLiRiYWNrZHJvcC5hZGRDbGFzcygnaW4nKVxyXG5cclxuICAgICAgaWYgKCFjYWxsYmFjaykgcmV0dXJuXHJcblxyXG4gICAgICBkb0FuaW1hdGUgP1xyXG4gICAgICAgIHRoaXMuJGJhY2tkcm9wXHJcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjYWxsYmFjaylcclxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgICAgY2FsbGJhY2soKVxyXG5cclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93biAmJiB0aGlzLiRiYWNrZHJvcCkge1xyXG4gICAgICB0aGlzLiRiYWNrZHJvcC5yZW1vdmVDbGFzcygnaW4nKVxyXG5cclxuICAgICAgdmFyIGNhbGxiYWNrUmVtb3ZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoYXQucmVtb3ZlQmFja2Ryb3AoKVxyXG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcclxuICAgICAgfVxyXG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xyXG4gICAgICAgIHRoaXMuJGJhY2tkcm9wXHJcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjYWxsYmFja1JlbW92ZSlcclxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgICAgY2FsbGJhY2tSZW1vdmUoKVxyXG5cclxuICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgY2FsbGJhY2soKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gdGhlc2UgZm9sbG93aW5nIG1ldGhvZHMgYXJlIHVzZWQgdG8gaGFuZGxlIG92ZXJmbG93aW5nIG1vZGFsc1xyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuaGFuZGxlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5hZGp1c3REaWFsb2coKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmFkanVzdERpYWxvZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBtb2RhbElzT3ZlcmZsb3dpbmcgPSB0aGlzLiRlbGVtZW50WzBdLnNjcm9sbEhlaWdodCA+IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHRcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7XHJcbiAgICAgIHBhZGRpbmdMZWZ0OiAgIXRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgJiYgbW9kYWxJc092ZXJmbG93aW5nID8gdGhpcy5zY3JvbGxiYXJXaWR0aCA6ICcnLFxyXG4gICAgICBwYWRkaW5nUmlnaHQ6IHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgJiYgIW1vZGFsSXNPdmVyZmxvd2luZyA/IHRoaXMuc2Nyb2xsYmFyV2lkdGggOiAnJ1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNldEFkanVzdG1lbnRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xyXG4gICAgICBwYWRkaW5nTGVmdDogJycsXHJcbiAgICAgIHBhZGRpbmdSaWdodDogJydcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuY2hlY2tTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZnVsbFdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGhcclxuICAgIGlmICghZnVsbFdpbmRvd1dpZHRoKSB7IC8vIHdvcmthcm91bmQgZm9yIG1pc3Npbmcgd2luZG93LmlubmVyV2lkdGggaW4gSUU4XHJcbiAgICAgIHZhciBkb2N1bWVudEVsZW1lbnRSZWN0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgICAgIGZ1bGxXaW5kb3dXaWR0aCA9IGRvY3VtZW50RWxlbWVudFJlY3QucmlnaHQgLSBNYXRoLmFicyhkb2N1bWVudEVsZW1lbnRSZWN0LmxlZnQpXHJcbiAgICB9XHJcbiAgICB0aGlzLmJvZHlJc092ZXJmbG93aW5nID0gZG9jdW1lbnQuYm9keS5jbGllbnRXaWR0aCA8IGZ1bGxXaW5kb3dXaWR0aFxyXG4gICAgdGhpcy5zY3JvbGxiYXJXaWR0aCA9IHRoaXMubWVhc3VyZVNjcm9sbGJhcigpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGJvZHlQYWQgPSBwYXJzZUludCgodGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnKSB8fCAwKSwgMTApXHJcbiAgICB0aGlzLm9yaWdpbmFsQm9keVBhZCA9IGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0IHx8ICcnXHJcbiAgICBpZiAodGhpcy5ib2R5SXNPdmVyZmxvd2luZykgdGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnLCBib2R5UGFkICsgdGhpcy5zY3JvbGxiYXJXaWR0aClcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JywgdGhpcy5vcmlnaW5hbEJvZHlQYWQpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUubWVhc3VyZVNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHsgLy8gdGh4IHdhbHNoXHJcbiAgICB2YXIgc2Nyb2xsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIHNjcm9sbERpdi5jbGFzc05hbWUgPSAnbW9kYWwtc2Nyb2xsYmFyLW1lYXN1cmUnXHJcbiAgICB0aGlzLiRib2R5LmFwcGVuZChzY3JvbGxEaXYpXHJcbiAgICB2YXIgc2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxEaXYub2Zmc2V0V2lkdGggLSBzY3JvbGxEaXYuY2xpZW50V2lkdGhcclxuICAgIHRoaXMuJGJvZHlbMF0ucmVtb3ZlQ2hpbGQoc2Nyb2xsRGl2KVxyXG4gICAgcmV0dXJuIHNjcm9sbGJhcldpZHRoXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gTU9EQUwgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uLCBfcmVsYXRlZFRhcmdldCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLm1vZGFsJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgTW9kYWwuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLm1vZGFsJywgKGRhdGEgPSBuZXcgTW9kYWwodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKF9yZWxhdGVkVGFyZ2V0KVxyXG4gICAgICBlbHNlIGlmIChvcHRpb25zLnNob3cpIGRhdGEuc2hvdyhfcmVsYXRlZFRhcmdldClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5tb2RhbFxyXG5cclxuICAkLmZuLm1vZGFsICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5tb2RhbC5Db25zdHJ1Y3RvciA9IE1vZGFsXHJcblxyXG5cclxuICAvLyBNT0RBTCBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4ubW9kYWwubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4ubW9kYWwgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gTU9EQUwgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMubW9kYWwuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwibW9kYWxcIl0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICB2YXIgaHJlZiAgICA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxyXG4gICAgdmFyICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykpKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICB2YXIgb3B0aW9uICA9ICR0YXJnZXQuZGF0YSgnYnMubW9kYWwnKSA/ICd0b2dnbGUnIDogJC5leHRlbmQoeyByZW1vdGU6ICEvIy8udGVzdChocmVmKSAmJiBocmVmIH0sICR0YXJnZXQuZGF0YSgpLCAkdGhpcy5kYXRhKCkpXHJcblxyXG4gICAgaWYgKCR0aGlzLmlzKCdhJykpIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgICR0YXJnZXQub25lKCdzaG93LmJzLm1vZGFsJywgZnVuY3Rpb24gKHNob3dFdmVudCkge1xyXG4gICAgICBpZiAoc2hvd0V2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm4gLy8gb25seSByZWdpc3RlciBmb2N1cyByZXN0b3JlciBpZiBtb2RhbCB3aWxsIGFjdHVhbGx5IGdldCBzaG93blxyXG4gICAgICAkdGFyZ2V0Lm9uZSgnaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICR0aGlzLmlzKCc6dmlzaWJsZScpICYmICR0aGlzLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb24sIHRoaXMpXHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHRvb2x0aXAuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3Rvb2x0aXBcclxuICogSW5zcGlyZWQgYnkgdGhlIG9yaWdpbmFsIGpRdWVyeS50aXBzeSBieSBKYXNvbiBGcmFtZVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gVE9PTFRJUCBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIFRvb2x0aXAgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy50eXBlICAgICAgID0gbnVsbFxyXG4gICAgdGhpcy5vcHRpb25zICAgID0gbnVsbFxyXG4gICAgdGhpcy5lbmFibGVkICAgID0gbnVsbFxyXG4gICAgdGhpcy50aW1lb3V0ICAgID0gbnVsbFxyXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxyXG4gICAgdGhpcy4kZWxlbWVudCAgID0gbnVsbFxyXG4gICAgdGhpcy5pblN0YXRlICAgID0gbnVsbFxyXG5cclxuICAgIHRoaXMuaW5pdCgndG9vbHRpcCcsIGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcclxuXHJcbiAgVG9vbHRpcC5ERUZBVUxUUyA9IHtcclxuICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgIHBsYWNlbWVudDogJ3RvcCcsXHJcbiAgICBzZWxlY3RvcjogZmFsc2UsXHJcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0b29sdGlwXCIgcm9sZT1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+JyxcclxuICAgIHRyaWdnZXI6ICdob3ZlciBmb2N1cycsXHJcbiAgICB0aXRsZTogJycsXHJcbiAgICBkZWxheTogMCxcclxuICAgIGh0bWw6IGZhbHNlLFxyXG4gICAgY29udGFpbmVyOiBmYWxzZSxcclxuICAgIHZpZXdwb3J0OiB7XHJcbiAgICAgIHNlbGVjdG9yOiAnYm9keScsXHJcbiAgICAgIHBhZGRpbmc6IDBcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAodHlwZSwgZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5lbmFibGVkICAgPSB0cnVlXHJcbiAgICB0aGlzLnR5cGUgICAgICA9IHR5cGVcclxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zICAgPSB0aGlzLmdldE9wdGlvbnMob3B0aW9ucylcclxuICAgIHRoaXMuJHZpZXdwb3J0ID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmICQoJC5pc0Z1bmN0aW9uKHRoaXMub3B0aW9ucy52aWV3cG9ydCkgPyB0aGlzLm9wdGlvbnMudmlld3BvcnQuY2FsbCh0aGlzLCB0aGlzLiRlbGVtZW50KSA6ICh0aGlzLm9wdGlvbnMudmlld3BvcnQuc2VsZWN0b3IgfHwgdGhpcy5vcHRpb25zLnZpZXdwb3J0KSlcclxuICAgIHRoaXMuaW5TdGF0ZSAgID0geyBjbGljazogZmFsc2UsIGhvdmVyOiBmYWxzZSwgZm9jdXM6IGZhbHNlIH1cclxuXHJcbiAgICBpZiAodGhpcy4kZWxlbWVudFswXSBpbnN0YW5jZW9mIGRvY3VtZW50LmNvbnN0cnVjdG9yICYmICF0aGlzLm9wdGlvbnMuc2VsZWN0b3IpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgc2VsZWN0b3JgIG9wdGlvbiBtdXN0IGJlIHNwZWNpZmllZCB3aGVuIGluaXRpYWxpemluZyAnICsgdGhpcy50eXBlICsgJyBvbiB0aGUgd2luZG93LmRvY3VtZW50IG9iamVjdCEnKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0cmlnZ2VycyA9IHRoaXMub3B0aW9ucy50cmlnZ2VyLnNwbGl0KCcgJylcclxuXHJcbiAgICBmb3IgKHZhciBpID0gdHJpZ2dlcnMubGVuZ3RoOyBpLS07KSB7XHJcbiAgICAgIHZhciB0cmlnZ2VyID0gdHJpZ2dlcnNbaV1cclxuXHJcbiAgICAgIGlmICh0cmlnZ2VyID09ICdjbGljaycpIHtcclxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy50b2dnbGUsIHRoaXMpKVxyXG4gICAgICB9IGVsc2UgaWYgKHRyaWdnZXIgIT0gJ21hbnVhbCcpIHtcclxuICAgICAgICB2YXIgZXZlbnRJbiAgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VlbnRlcicgOiAnZm9jdXNpbidcclxuICAgICAgICB2YXIgZXZlbnRPdXQgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VsZWF2ZScgOiAnZm9jdXNvdXQnXHJcblxyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRJbiAgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmVudGVyLCB0aGlzKSlcclxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50T3V0ICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5sZWF2ZSwgdGhpcykpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm9wdGlvbnMuc2VsZWN0b3IgP1xyXG4gICAgICAodGhpcy5fb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLm9wdGlvbnMsIHsgdHJpZ2dlcjogJ21hbnVhbCcsIHNlbGVjdG9yOiAnJyB9KSkgOlxyXG4gICAgICB0aGlzLmZpeFRpdGxlKClcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFRvb2x0aXAuREVGQVVMVFNcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCB0aGlzLmdldERlZmF1bHRzKCksIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKVxyXG5cclxuICAgIGlmIChvcHRpb25zLmRlbGF5ICYmIHR5cGVvZiBvcHRpb25zLmRlbGF5ID09ICdudW1iZXInKSB7XHJcbiAgICAgIG9wdGlvbnMuZGVsYXkgPSB7XHJcbiAgICAgICAgc2hvdzogb3B0aW9ucy5kZWxheSxcclxuICAgICAgICBoaWRlOiBvcHRpb25zLmRlbGF5XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3B0aW9uc1xyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVsZWdhdGVPcHRpb25zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG9wdGlvbnMgID0ge31cclxuICAgIHZhciBkZWZhdWx0cyA9IHRoaXMuZ2V0RGVmYXVsdHMoKVxyXG5cclxuICAgIHRoaXMuX29wdGlvbnMgJiYgJC5lYWNoKHRoaXMuX29wdGlvbnMsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XHJcbiAgICAgIGlmIChkZWZhdWx0c1trZXldICE9IHZhbHVlKSBvcHRpb25zW2tleV0gPSB2YWx1ZVxyXG4gICAgfSlcclxuXHJcbiAgICByZXR1cm4gb3B0aW9uc1xyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZW50ZXIgPSBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xyXG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxyXG5cclxuICAgIGlmICghc2VsZikge1xyXG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXHJcbiAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcclxuICAgICAgc2VsZi5pblN0YXRlW29iai50eXBlID09ICdmb2N1c2luJyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IHRydWVcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSB8fCBzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykge1xyXG4gICAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXHJcblxyXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xyXG5cclxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdykgcmV0dXJuIHNlbGYuc2hvdygpXHJcblxyXG4gICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ2luJykgc2VsZi5zaG93KClcclxuICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5zaG93KVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuaXNJblN0YXRlVHJ1ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmluU3RhdGUpIHtcclxuICAgICAgaWYgKHRoaXMuaW5TdGF0ZVtrZXldKSByZXR1cm4gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUubGVhdmUgPSBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xyXG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxyXG5cclxuICAgIGlmICghc2VsZikge1xyXG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXHJcbiAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcclxuICAgICAgc2VsZi5pblN0YXRlW29iai50eXBlID09ICdmb2N1c291dCcgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgcmV0dXJuXHJcblxyXG4gICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcclxuXHJcbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnb3V0J1xyXG5cclxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSkgcmV0dXJuIHNlbGYuaGlkZSgpXHJcblxyXG4gICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ291dCcpIHNlbGYuaGlkZSgpXHJcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSlcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZSA9ICQuRXZlbnQoJ3Nob3cuYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICBpZiAodGhpcy5oYXNDb250ZW50KCkgJiYgdGhpcy5lbmFibGVkKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgICAgdmFyIGluRG9tID0gJC5jb250YWlucyh0aGlzLiRlbGVtZW50WzBdLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB0aGlzLiRlbGVtZW50WzBdKVxyXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCAhaW5Eb20pIHJldHVyblxyXG4gICAgICB2YXIgdGhhdCA9IHRoaXNcclxuXHJcbiAgICAgIHZhciAkdGlwID0gdGhpcy50aXAoKVxyXG5cclxuICAgICAgdmFyIHRpcElkID0gdGhpcy5nZXRVSUQodGhpcy50eXBlKVxyXG5cclxuICAgICAgdGhpcy5zZXRDb250ZW50KClcclxuICAgICAgJHRpcC5hdHRyKCdpZCcsIHRpcElkKVxyXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknLCB0aXBJZClcclxuXHJcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uKSAkdGlwLmFkZENsYXNzKCdmYWRlJylcclxuXHJcbiAgICAgIHZhciBwbGFjZW1lbnQgPSB0eXBlb2YgdGhpcy5vcHRpb25zLnBsYWNlbWVudCA9PSAnZnVuY3Rpb24nID9cclxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50LmNhbGwodGhpcywgJHRpcFswXSwgdGhpcy4kZWxlbWVudFswXSkgOlxyXG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnRcclxuXHJcbiAgICAgIHZhciBhdXRvVG9rZW4gPSAvXFxzP2F1dG8/XFxzPy9pXHJcbiAgICAgIHZhciBhdXRvUGxhY2UgPSBhdXRvVG9rZW4udGVzdChwbGFjZW1lbnQpXHJcbiAgICAgIGlmIChhdXRvUGxhY2UpIHBsYWNlbWVudCA9IHBsYWNlbWVudC5yZXBsYWNlKGF1dG9Ub2tlbiwgJycpIHx8ICd0b3AnXHJcblxyXG4gICAgICAkdGlwXHJcbiAgICAgICAgLmRldGFjaCgpXHJcbiAgICAgICAgLmNzcyh7IHRvcDogMCwgbGVmdDogMCwgZGlzcGxheTogJ2Jsb2NrJyB9KVxyXG4gICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXHJcbiAgICAgICAgLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHRoaXMpXHJcblxyXG4gICAgICB0aGlzLm9wdGlvbnMuY29udGFpbmVyID8gJHRpcC5hcHBlbmRUbyh0aGlzLm9wdGlvbnMuY29udGFpbmVyKSA6ICR0aXAuaW5zZXJ0QWZ0ZXIodGhpcy4kZWxlbWVudClcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbnNlcnRlZC5icy4nICsgdGhpcy50eXBlKVxyXG5cclxuICAgICAgdmFyIHBvcyAgICAgICAgICA9IHRoaXMuZ2V0UG9zaXRpb24oKVxyXG4gICAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxyXG4gICAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICAgIGlmIChhdXRvUGxhY2UpIHtcclxuICAgICAgICB2YXIgb3JnUGxhY2VtZW50ID0gcGxhY2VtZW50XHJcbiAgICAgICAgdmFyIHZpZXdwb3J0RGltID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcclxuXHJcbiAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50ID09ICdib3R0b20nICYmIHBvcy5ib3R0b20gKyBhY3R1YWxIZWlnaHQgPiB2aWV3cG9ydERpbS5ib3R0b20gPyAndG9wJyAgICA6XHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgICYmIHBvcy50b3AgICAgLSBhY3R1YWxIZWlnaHQgPCB2aWV3cG9ydERpbS50b3AgICAgPyAnYm90dG9tJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdyaWdodCcgICYmIHBvcy5yaWdodCAgKyBhY3R1YWxXaWR0aCAgPiB2aWV3cG9ydERpbS53aWR0aCAgPyAnbGVmdCcgICA6XHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgICYmIHBvcy5sZWZ0ICAgLSBhY3R1YWxXaWR0aCAgPCB2aWV3cG9ydERpbS5sZWZ0ICAgPyAncmlnaHQnICA6XHJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50XHJcblxyXG4gICAgICAgICR0aXBcclxuICAgICAgICAgIC5yZW1vdmVDbGFzcyhvcmdQbGFjZW1lbnQpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgY2FsY3VsYXRlZE9mZnNldCA9IHRoaXMuZ2V0Q2FsY3VsYXRlZE9mZnNldChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcclxuXHJcbiAgICAgIHRoaXMuYXBwbHlQbGFjZW1lbnQoY2FsY3VsYXRlZE9mZnNldCwgcGxhY2VtZW50KVxyXG5cclxuICAgICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBwcmV2SG92ZXJTdGF0ZSA9IHRoYXQuaG92ZXJTdGF0ZVxyXG4gICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignc2hvd24uYnMuJyArIHRoYXQudHlwZSlcclxuICAgICAgICB0aGF0LmhvdmVyU3RhdGUgPSBudWxsXHJcblxyXG4gICAgICAgIGlmIChwcmV2SG92ZXJTdGF0ZSA9PSAnb3V0JykgdGhhdC5sZWF2ZSh0aGF0KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XHJcbiAgICAgICAgJHRpcFxyXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY29tcGxldGUpXHJcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgICAgY29tcGxldGUoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuYXBwbHlQbGFjZW1lbnQgPSBmdW5jdGlvbiAob2Zmc2V0LCBwbGFjZW1lbnQpIHtcclxuICAgIHZhciAkdGlwICAgPSB0aGlzLnRpcCgpXHJcbiAgICB2YXIgd2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxyXG4gICAgdmFyIGhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgLy8gbWFudWFsbHkgcmVhZCBtYXJnaW5zIGJlY2F1c2UgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGluY2x1ZGVzIGRpZmZlcmVuY2VcclxuICAgIHZhciBtYXJnaW5Ub3AgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLXRvcCcpLCAxMClcclxuICAgIHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi1sZWZ0JyksIDEwKVxyXG5cclxuICAgIC8vIHdlIG11c3QgY2hlY2sgZm9yIE5hTiBmb3IgaWUgOC85XHJcbiAgICBpZiAoaXNOYU4obWFyZ2luVG9wKSkgIG1hcmdpblRvcCAgPSAwXHJcbiAgICBpZiAoaXNOYU4obWFyZ2luTGVmdCkpIG1hcmdpbkxlZnQgPSAwXHJcblxyXG4gICAgb2Zmc2V0LnRvcCAgKz0gbWFyZ2luVG9wXHJcbiAgICBvZmZzZXQubGVmdCArPSBtYXJnaW5MZWZ0XHJcblxyXG4gICAgLy8gJC5mbi5vZmZzZXQgZG9lc24ndCByb3VuZCBwaXhlbCB2YWx1ZXNcclxuICAgIC8vIHNvIHdlIHVzZSBzZXRPZmZzZXQgZGlyZWN0bHkgd2l0aCBvdXIgb3duIGZ1bmN0aW9uIEItMFxyXG4gICAgJC5vZmZzZXQuc2V0T2Zmc2V0KCR0aXBbMF0sICQuZXh0ZW5kKHtcclxuICAgICAgdXNpbmc6IGZ1bmN0aW9uIChwcm9wcykge1xyXG4gICAgICAgICR0aXAuY3NzKHtcclxuICAgICAgICAgIHRvcDogTWF0aC5yb3VuZChwcm9wcy50b3ApLFxyXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChwcm9wcy5sZWZ0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH0sIG9mZnNldCksIDApXHJcblxyXG4gICAgJHRpcC5hZGRDbGFzcygnaW4nKVxyXG5cclxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBwbGFjaW5nIHRpcCBpbiBuZXcgb2Zmc2V0IGNhdXNlZCB0aGUgdGlwIHRvIHJlc2l6ZSBpdHNlbGZcclxuICAgIHZhciBhY3R1YWxXaWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXHJcbiAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICBpZiAocGxhY2VtZW50ID09ICd0b3AnICYmIGFjdHVhbEhlaWdodCAhPSBoZWlnaHQpIHtcclxuICAgICAgb2Zmc2V0LnRvcCA9IG9mZnNldC50b3AgKyBoZWlnaHQgLSBhY3R1YWxIZWlnaHRcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZGVsdGEgPSB0aGlzLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YShwbGFjZW1lbnQsIG9mZnNldCwgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcclxuXHJcbiAgICBpZiAoZGVsdGEubGVmdCkgb2Zmc2V0LmxlZnQgKz0gZGVsdGEubGVmdFxyXG4gICAgZWxzZSBvZmZzZXQudG9wICs9IGRlbHRhLnRvcFxyXG5cclxuICAgIHZhciBpc1ZlcnRpY2FsICAgICAgICAgID0gL3RvcHxib3R0b20vLnRlc3QocGxhY2VtZW50KVxyXG4gICAgdmFyIGFycm93RGVsdGEgICAgICAgICAgPSBpc1ZlcnRpY2FsID8gZGVsdGEubGVmdCAqIDIgLSB3aWR0aCArIGFjdHVhbFdpZHRoIDogZGVsdGEudG9wICogMiAtIGhlaWdodCArIGFjdHVhbEhlaWdodFxyXG4gICAgdmFyIGFycm93T2Zmc2V0UG9zaXRpb24gPSBpc1ZlcnRpY2FsID8gJ29mZnNldFdpZHRoJyA6ICdvZmZzZXRIZWlnaHQnXHJcblxyXG4gICAgJHRpcC5vZmZzZXQob2Zmc2V0KVxyXG4gICAgdGhpcy5yZXBsYWNlQXJyb3coYXJyb3dEZWx0YSwgJHRpcFswXVthcnJvd09mZnNldFBvc2l0aW9uXSwgaXNWZXJ0aWNhbClcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLnJlcGxhY2VBcnJvdyA9IGZ1bmN0aW9uIChkZWx0YSwgZGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XHJcbiAgICB0aGlzLmFycm93KClcclxuICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ2xlZnQnIDogJ3RvcCcsIDUwICogKDEgLSBkZWx0YSAvIGRpbWVuc2lvbikgKyAnJScpXHJcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnLCAnJylcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRpcCAgPSB0aGlzLnRpcCgpXHJcbiAgICB2YXIgdGl0bGUgPSB0aGlzLmdldFRpdGxlKClcclxuXHJcbiAgICAkdGlwLmZpbmQoJy50b29sdGlwLWlubmVyJylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKHRpdGxlKVxyXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHQnKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICB2YXIgJHRpcCA9ICQodGhpcy4kdGlwKVxyXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdoaWRlLmJzLicgKyB0aGlzLnR5cGUpXHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGxldGUoKSB7XHJcbiAgICAgIGlmICh0aGF0LmhvdmVyU3RhdGUgIT0gJ2luJykgJHRpcC5kZXRhY2goKVxyXG4gICAgICBpZiAodGhhdC4kZWxlbWVudCkgeyAvLyBUT0RPOiBDaGVjayB3aGV0aGVyIGd1YXJkaW5nIHRoaXMgY29kZSB3aXRoIHRoaXMgYGlmYCBpcyByZWFsbHkgbmVjZXNzYXJ5LlxyXG4gICAgICAgIHRoYXQuJGVsZW1lbnRcclxuICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JylcclxuICAgICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuJyArIHRoYXQudHlwZSlcclxuICAgICAgfVxyXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXHJcblxyXG4gICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2luJylcclxuXHJcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiAkdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xyXG4gICAgICAkdGlwXHJcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY29tcGxldGUpXHJcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICBjb21wbGV0ZSgpXHJcblxyXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5maXhUaXRsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcclxuICAgIGlmICgkZS5hdHRyKCd0aXRsZScpIHx8IHR5cGVvZiAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykgIT0gJ3N0cmluZycpIHtcclxuICAgICAgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScsICRlLmF0dHIoJ3RpdGxlJykgfHwgJycpLmF0dHIoJ3RpdGxlJywgJycpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcclxuICAgICRlbGVtZW50ICAgPSAkZWxlbWVudCB8fCB0aGlzLiRlbGVtZW50XHJcblxyXG4gICAgdmFyIGVsICAgICA9ICRlbGVtZW50WzBdXHJcbiAgICB2YXIgaXNCb2R5ID0gZWwudGFnTmFtZSA9PSAnQk9EWSdcclxuXHJcbiAgICB2YXIgZWxSZWN0ICAgID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgIGlmIChlbFJlY3Qud2lkdGggPT0gbnVsbCkge1xyXG4gICAgICAvLyB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBtaXNzaW5nIGluIElFOCwgc28gY29tcHV0ZSB0aGVtIG1hbnVhbGx5OyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8xNDA5M1xyXG4gICAgICBlbFJlY3QgPSAkLmV4dGVuZCh7fSwgZWxSZWN0LCB7IHdpZHRoOiBlbFJlY3QucmlnaHQgLSBlbFJlY3QubGVmdCwgaGVpZ2h0OiBlbFJlY3QuYm90dG9tIC0gZWxSZWN0LnRvcCB9KVxyXG4gICAgfVxyXG4gICAgdmFyIGlzU3ZnID0gd2luZG93LlNWR0VsZW1lbnQgJiYgZWwgaW5zdGFuY2VvZiB3aW5kb3cuU1ZHRWxlbWVudFxyXG4gICAgLy8gQXZvaWQgdXNpbmcgJC5vZmZzZXQoKSBvbiBTVkdzIHNpbmNlIGl0IGdpdmVzIGluY29ycmVjdCByZXN1bHRzIGluIGpRdWVyeSAzLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9pc3N1ZXMvMjAyODBcclxuICAgIHZhciBlbE9mZnNldCAgPSBpc0JvZHkgPyB7IHRvcDogMCwgbGVmdDogMCB9IDogKGlzU3ZnID8gbnVsbCA6ICRlbGVtZW50Lm9mZnNldCgpKVxyXG4gICAgdmFyIHNjcm9sbCAgICA9IHsgc2Nyb2xsOiBpc0JvZHkgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIDogJGVsZW1lbnQuc2Nyb2xsVG9wKCkgfVxyXG4gICAgdmFyIG91dGVyRGltcyA9IGlzQm9keSA/IHsgd2lkdGg6ICQod2luZG93KS53aWR0aCgpLCBoZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKSB9IDogbnVsbFxyXG5cclxuICAgIHJldHVybiAkLmV4dGVuZCh7fSwgZWxSZWN0LCBzY3JvbGwsIG91dGVyRGltcywgZWxPZmZzZXQpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRDYWxjdWxhdGVkT2Zmc2V0ID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XHJcbiAgICByZXR1cm4gcGxhY2VtZW50ID09ICdib3R0b20nID8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0LCAgIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcclxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgPyB7IHRvcDogcG9zLnRvcCAtIGFjdHVhbEhlaWdodCwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxyXG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCAtIGFjdHVhbFdpZHRoIH0gOlxyXG4gICAgICAgIC8qIHBsYWNlbWVudCA9PSAncmlnaHQnICovIHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCB9XHJcblxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XHJcbiAgICB2YXIgZGVsdGEgPSB7IHRvcDogMCwgbGVmdDogMCB9XHJcbiAgICBpZiAoIXRoaXMuJHZpZXdwb3J0KSByZXR1cm4gZGVsdGFcclxuXHJcbiAgICB2YXIgdmlld3BvcnRQYWRkaW5nID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmIHRoaXMub3B0aW9ucy52aWV3cG9ydC5wYWRkaW5nIHx8IDBcclxuICAgIHZhciB2aWV3cG9ydERpbWVuc2lvbnMgPSB0aGlzLmdldFBvc2l0aW9uKHRoaXMuJHZpZXdwb3J0KVxyXG5cclxuICAgIGlmICgvcmlnaHR8bGVmdC8udGVzdChwbGFjZW1lbnQpKSB7XHJcbiAgICAgIHZhciB0b3BFZGdlT2Zmc2V0ICAgID0gcG9zLnRvcCAtIHZpZXdwb3J0UGFkZGluZyAtIHZpZXdwb3J0RGltZW5zaW9ucy5zY3JvbGxcclxuICAgICAgdmFyIGJvdHRvbUVkZ2VPZmZzZXQgPSBwb3MudG9wICsgdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbCArIGFjdHVhbEhlaWdodFxyXG4gICAgICBpZiAodG9wRWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy50b3ApIHsgLy8gdG9wIG92ZXJmbG93XHJcbiAgICAgICAgZGVsdGEudG9wID0gdmlld3BvcnREaW1lbnNpb25zLnRvcCAtIHRvcEVkZ2VPZmZzZXRcclxuICAgICAgfSBlbHNlIGlmIChib3R0b21FZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQpIHsgLy8gYm90dG9tIG92ZXJmbG93XHJcbiAgICAgICAgZGVsdGEudG9wID0gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQgLSBib3R0b21FZGdlT2Zmc2V0XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBsZWZ0RWRnZU9mZnNldCAgPSBwb3MubGVmdCAtIHZpZXdwb3J0UGFkZGluZ1xyXG4gICAgICB2YXIgcmlnaHRFZGdlT2Zmc2V0ID0gcG9zLmxlZnQgKyB2aWV3cG9ydFBhZGRpbmcgKyBhY3R1YWxXaWR0aFxyXG4gICAgICBpZiAobGVmdEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCkgeyAvLyBsZWZ0IG92ZXJmbG93XHJcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0IC0gbGVmdEVkZ2VPZmZzZXRcclxuICAgICAgfSBlbHNlIGlmIChyaWdodEVkZ2VPZmZzZXQgPiB2aWV3cG9ydERpbWVuc2lvbnMucmlnaHQpIHsgLy8gcmlnaHQgb3ZlcmZsb3dcclxuICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgKyB2aWV3cG9ydERpbWVuc2lvbnMud2lkdGggLSByaWdodEVkZ2VPZmZzZXRcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkZWx0YVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VGl0bGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGl0bGVcclxuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcclxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xyXG5cclxuICAgIHRpdGxlID0gJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpXHJcbiAgICAgIHx8ICh0eXBlb2Ygby50aXRsZSA9PSAnZnVuY3Rpb24nID8gby50aXRsZS5jYWxsKCRlWzBdKSA6ICBvLnRpdGxlKVxyXG5cclxuICAgIHJldHVybiB0aXRsZVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VUlEID0gZnVuY3Rpb24gKHByZWZpeCkge1xyXG4gICAgZG8gcHJlZml4ICs9IH5+KE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKVxyXG4gICAgd2hpbGUgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByZWZpeCkpXHJcbiAgICByZXR1cm4gcHJlZml4XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS50aXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIXRoaXMuJHRpcCkge1xyXG4gICAgICB0aGlzLiR0aXAgPSAkKHRoaXMub3B0aW9ucy50ZW1wbGF0ZSlcclxuICAgICAgaWYgKHRoaXMuJHRpcC5sZW5ndGggIT0gMSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnR5cGUgKyAnIGB0ZW1wbGF0ZWAgb3B0aW9uIG11c3QgY29uc2lzdCBvZiBleGFjdGx5IDEgdG9wLWxldmVsIGVsZW1lbnQhJylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuJHRpcFxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gKHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcudG9vbHRpcC1hcnJvdycpKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbmFibGVkID0gIXRoaXMuZW5hYmxlZFxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBzZWxmID0gdGhpc1xyXG4gICAgaWYgKGUpIHtcclxuICAgICAgc2VsZiA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxyXG4gICAgICBpZiAoIXNlbGYpIHtcclxuICAgICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZS5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxyXG4gICAgICAgICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGUpIHtcclxuICAgICAgc2VsZi5pblN0YXRlLmNsaWNrID0gIXNlbGYuaW5TdGF0ZS5jbGlja1xyXG4gICAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHNlbGYuZW50ZXIoc2VsZilcclxuICAgICAgZWxzZSBzZWxmLmxlYXZlKHNlbGYpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZWxmLnRpcCgpLmhhc0NsYXNzKCdpbicpID8gc2VsZi5sZWF2ZShzZWxmKSA6IHNlbGYuZW50ZXIoc2VsZilcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXNcclxuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXHJcbiAgICB0aGlzLmhpZGUoZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGF0LiRlbGVtZW50Lm9mZignLicgKyB0aGF0LnR5cGUpLnJlbW92ZURhdGEoJ2JzLicgKyB0aGF0LnR5cGUpXHJcbiAgICAgIGlmICh0aGF0LiR0aXApIHtcclxuICAgICAgICB0aGF0LiR0aXAuZGV0YWNoKClcclxuICAgICAgfVxyXG4gICAgICB0aGF0LiR0aXAgPSBudWxsXHJcbiAgICAgIHRoYXQuJGFycm93ID0gbnVsbFxyXG4gICAgICB0aGF0LiR2aWV3cG9ydCA9IG51bGxcclxuICAgICAgdGhhdC4kZWxlbWVudCA9IG51bGxcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gVE9PTFRJUCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXHJcblxyXG4gICAgICBpZiAoIWRhdGEgJiYgL2Rlc3Ryb3l8aGlkZS8udGVzdChvcHRpb24pKSByZXR1cm5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy50b29sdGlwJywgKGRhdGEgPSBuZXcgVG9vbHRpcCh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLnRvb2x0aXBcclxuXHJcbiAgJC5mbi50b29sdGlwICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yID0gVG9vbHRpcFxyXG5cclxuXHJcbiAgLy8gVE9PTFRJUCBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi50b29sdGlwLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLnRvb2x0aXAgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogcG9wb3Zlci5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jcG9wb3ZlcnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFBPUE9WRVIgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBQb3BvdmVyID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuaW5pdCgncG9wb3ZlcicsIGVsZW1lbnQsIG9wdGlvbnMpXHJcbiAgfVxyXG5cclxuICBpZiAoISQuZm4udG9vbHRpcCkgdGhyb3cgbmV3IEVycm9yKCdQb3BvdmVyIHJlcXVpcmVzIHRvb2x0aXAuanMnKVxyXG5cclxuICBQb3BvdmVyLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBQb3BvdmVyLkRFRkFVTFRTID0gJC5leHRlbmQoe30sICQuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5ERUZBVUxUUywge1xyXG4gICAgcGxhY2VtZW50OiAncmlnaHQnLFxyXG4gICAgdHJpZ2dlcjogJ2NsaWNrJyxcclxuICAgIGNvbnRlbnQ6ICcnLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicG9wb3ZlclwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cImFycm93XCI+PC9kaXY+PGgzIGNsYXNzPVwicG9wb3Zlci10aXRsZVwiPjwvaDM+PGRpdiBjbGFzcz1cInBvcG92ZXItY29udGVudFwiPjwvZGl2PjwvZGl2PidcclxuICB9KVxyXG5cclxuXHJcbiAgLy8gTk9URTogUE9QT1ZFUiBFWFRFTkRTIHRvb2x0aXAuanNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZSA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IucHJvdG90eXBlKVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFBvcG92ZXJcclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gUG9wb3Zlci5ERUZBVUxUU1xyXG4gIH1cclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkdGlwICAgID0gdGhpcy50aXAoKVxyXG4gICAgdmFyIHRpdGxlICAgPSB0aGlzLmdldFRpdGxlKClcclxuICAgIHZhciBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50KClcclxuXHJcbiAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJylbdGhpcy5vcHRpb25zLmh0bWwgPyAnaHRtbCcgOiAndGV4dCddKHRpdGxlKVxyXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci1jb250ZW50JykuY2hpbGRyZW4oKS5kZXRhY2goKS5lbmQoKVsgLy8gd2UgdXNlIGFwcGVuZCBmb3IgaHRtbCBvYmplY3RzIHRvIG1haW50YWluIGpzIGV2ZW50c1xyXG4gICAgICB0aGlzLm9wdGlvbnMuaHRtbCA/ICh0eXBlb2YgY29udGVudCA9PSAnc3RyaW5nJyA/ICdodG1sJyA6ICdhcHBlbmQnKSA6ICd0ZXh0J1xyXG4gICAgXShjb250ZW50KVxyXG5cclxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0IGluJylcclxuXHJcbiAgICAvLyBJRTggZG9lc24ndCBhY2NlcHQgaGlkaW5nIHZpYSB0aGUgYDplbXB0eWAgcHNldWRvIHNlbGVjdG9yLCB3ZSBoYXZlIHRvIGRvXHJcbiAgICAvLyB0aGlzIG1hbnVhbGx5IGJ5IGNoZWNraW5nIHRoZSBjb250ZW50cy5cclxuICAgIGlmICghJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpLmh0bWwoKSkgJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpLmhpZGUoKVxyXG4gIH1cclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKCkgfHwgdGhpcy5nZXRDb250ZW50KClcclxuICB9XHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XHJcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcclxuXHJcbiAgICByZXR1cm4gJGUuYXR0cignZGF0YS1jb250ZW50JylcclxuICAgICAgfHwgKHR5cGVvZiBvLmNvbnRlbnQgPT0gJ2Z1bmN0aW9uJyA/XHJcbiAgICAgICAgICAgIG8uY29udGVudC5jYWxsKCRlWzBdKSA6XHJcbiAgICAgICAgICAgIG8uY29udGVudClcclxuICB9XHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLmFycm93JykpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gUE9QT1ZFUiBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnBvcG92ZXInKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXHJcblxyXG4gICAgICBpZiAoIWRhdGEgJiYgL2Rlc3Ryb3l8aGlkZS8udGVzdChvcHRpb24pKSByZXR1cm5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJywgKGRhdGEgPSBuZXcgUG9wb3Zlcih0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLnBvcG92ZXJcclxuXHJcbiAgJC5mbi5wb3BvdmVyICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5wb3BvdmVyLkNvbnN0cnVjdG9yID0gUG9wb3ZlclxyXG5cclxuXHJcbiAgLy8gUE9QT1ZFUiBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5wb3BvdmVyLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLnBvcG92ZXIgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogc2Nyb2xsc3B5LmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNzY3JvbGxzcHlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFNDUk9MTFNQWSBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gU2Nyb2xsU3B5KGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGJvZHkgICAgICAgICAgPSAkKGRvY3VtZW50LmJvZHkpXHJcbiAgICB0aGlzLiRzY3JvbGxFbGVtZW50ID0gJChlbGVtZW50KS5pcyhkb2N1bWVudC5ib2R5KSA/ICQod2luZG93KSA6ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyAgICAgICAgPSAkLmV4dGVuZCh7fSwgU2Nyb2xsU3B5LkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgdGhpcy5zZWxlY3RvciAgICAgICA9ICh0aGlzLm9wdGlvbnMudGFyZ2V0IHx8ICcnKSArICcgLm5hdiBsaSA+IGEnXHJcbiAgICB0aGlzLm9mZnNldHMgICAgICAgID0gW11cclxuICAgIHRoaXMudGFyZ2V0cyAgICAgICAgPSBbXVxyXG4gICAgdGhpcy5hY3RpdmVUYXJnZXQgICA9IG51bGxcclxuICAgIHRoaXMuc2Nyb2xsSGVpZ2h0ICAgPSAwXHJcblxyXG4gICAgdGhpcy4kc2Nyb2xsRWxlbWVudC5vbignc2Nyb2xsLmJzLnNjcm9sbHNweScsICQucHJveHkodGhpcy5wcm9jZXNzLCB0aGlzKSlcclxuICAgIHRoaXMucmVmcmVzaCgpXHJcbiAgICB0aGlzLnByb2Nlc3MoKVxyXG4gIH1cclxuXHJcbiAgU2Nyb2xsU3B5LlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBTY3JvbGxTcHkuREVGQVVMVFMgPSB7XHJcbiAgICBvZmZzZXQ6IDEwXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLmdldFNjcm9sbEhlaWdodCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLiRzY3JvbGxFbGVtZW50WzBdLnNjcm9sbEhlaWdodCB8fCBNYXRoLm1heCh0aGlzLiRib2R5WzBdLnNjcm9sbEhlaWdodCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodClcclxuICB9XHJcblxyXG4gIFNjcm9sbFNweS5wcm90b3R5cGUucmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0aGF0ICAgICAgICAgID0gdGhpc1xyXG4gICAgdmFyIG9mZnNldE1ldGhvZCAgPSAnb2Zmc2V0J1xyXG4gICAgdmFyIG9mZnNldEJhc2UgICAgPSAwXHJcblxyXG4gICAgdGhpcy5vZmZzZXRzICAgICAgPSBbXVxyXG4gICAgdGhpcy50YXJnZXRzICAgICAgPSBbXVxyXG4gICAgdGhpcy5zY3JvbGxIZWlnaHQgPSB0aGlzLmdldFNjcm9sbEhlaWdodCgpXHJcblxyXG4gICAgaWYgKCEkLmlzV2luZG93KHRoaXMuJHNjcm9sbEVsZW1lbnRbMF0pKSB7XHJcbiAgICAgIG9mZnNldE1ldGhvZCA9ICdwb3NpdGlvbidcclxuICAgICAgb2Zmc2V0QmFzZSAgID0gdGhpcy4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGJvZHlcclxuICAgICAgLmZpbmQodGhpcy5zZWxlY3RvcilcclxuICAgICAgLm1hcChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyICRlbCAgID0gJCh0aGlzKVxyXG4gICAgICAgIHZhciBocmVmICA9ICRlbC5kYXRhKCd0YXJnZXQnKSB8fCAkZWwuYXR0cignaHJlZicpXHJcbiAgICAgICAgdmFyICRocmVmID0gL14jLi8udGVzdChocmVmKSAmJiAkKGhyZWYpXHJcblxyXG4gICAgICAgIHJldHVybiAoJGhyZWZcclxuICAgICAgICAgICYmICRocmVmLmxlbmd0aFxyXG4gICAgICAgICAgJiYgJGhyZWYuaXMoJzp2aXNpYmxlJylcclxuICAgICAgICAgICYmIFtbJGhyZWZbb2Zmc2V0TWV0aG9kXSgpLnRvcCArIG9mZnNldEJhc2UsIGhyZWZdXSkgfHwgbnVsbFxyXG4gICAgICB9KVxyXG4gICAgICAuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYVswXSAtIGJbMF0gfSlcclxuICAgICAgLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoYXQub2Zmc2V0cy5wdXNoKHRoaXNbMF0pXHJcbiAgICAgICAgdGhhdC50YXJnZXRzLnB1c2godGhpc1sxXSlcclxuICAgICAgfSlcclxuICB9XHJcblxyXG4gIFNjcm9sbFNweS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBzY3JvbGxUb3AgICAgPSB0aGlzLiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpICsgdGhpcy5vcHRpb25zLm9mZnNldFxyXG4gICAgdmFyIHNjcm9sbEhlaWdodCA9IHRoaXMuZ2V0U2Nyb2xsSGVpZ2h0KClcclxuICAgIHZhciBtYXhTY3JvbGwgICAgPSB0aGlzLm9wdGlvbnMub2Zmc2V0ICsgc2Nyb2xsSGVpZ2h0IC0gdGhpcy4kc2Nyb2xsRWxlbWVudC5oZWlnaHQoKVxyXG4gICAgdmFyIG9mZnNldHMgICAgICA9IHRoaXMub2Zmc2V0c1xyXG4gICAgdmFyIHRhcmdldHMgICAgICA9IHRoaXMudGFyZ2V0c1xyXG4gICAgdmFyIGFjdGl2ZVRhcmdldCA9IHRoaXMuYWN0aXZlVGFyZ2V0XHJcbiAgICB2YXIgaVxyXG5cclxuICAgIGlmICh0aGlzLnNjcm9sbEhlaWdodCAhPSBzY3JvbGxIZWlnaHQpIHtcclxuICAgICAgdGhpcy5yZWZyZXNoKClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2Nyb2xsVG9wID49IG1heFNjcm9sbCkge1xyXG4gICAgICByZXR1cm4gYWN0aXZlVGFyZ2V0ICE9IChpID0gdGFyZ2V0c1t0YXJnZXRzLmxlbmd0aCAtIDFdKSAmJiB0aGlzLmFjdGl2YXRlKGkpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFjdGl2ZVRhcmdldCAmJiBzY3JvbGxUb3AgPCBvZmZzZXRzWzBdKSB7XHJcbiAgICAgIHRoaXMuYWN0aXZlVGFyZ2V0ID0gbnVsbFxyXG4gICAgICByZXR1cm4gdGhpcy5jbGVhcigpXHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChpID0gb2Zmc2V0cy5sZW5ndGg7IGktLTspIHtcclxuICAgICAgYWN0aXZlVGFyZ2V0ICE9IHRhcmdldHNbaV1cclxuICAgICAgICAmJiBzY3JvbGxUb3AgPj0gb2Zmc2V0c1tpXVxyXG4gICAgICAgICYmIChvZmZzZXRzW2kgKyAxXSA9PT0gdW5kZWZpbmVkIHx8IHNjcm9sbFRvcCA8IG9mZnNldHNbaSArIDFdKVxyXG4gICAgICAgICYmIHRoaXMuYWN0aXZhdGUodGFyZ2V0c1tpXSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFNjcm9sbFNweS5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICB0aGlzLmFjdGl2ZVRhcmdldCA9IHRhcmdldFxyXG5cclxuICAgIHRoaXMuY2xlYXIoKVxyXG5cclxuICAgIHZhciBzZWxlY3RvciA9IHRoaXMuc2VsZWN0b3IgK1xyXG4gICAgICAnW2RhdGEtdGFyZ2V0PVwiJyArIHRhcmdldCArICdcIl0sJyArXHJcbiAgICAgIHRoaXMuc2VsZWN0b3IgKyAnW2hyZWY9XCInICsgdGFyZ2V0ICsgJ1wiXSdcclxuXHJcbiAgICB2YXIgYWN0aXZlID0gJChzZWxlY3RvcilcclxuICAgICAgLnBhcmVudHMoJ2xpJylcclxuICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxyXG5cclxuICAgIGlmIChhY3RpdmUucGFyZW50KCcuZHJvcGRvd24tbWVudScpLmxlbmd0aCkge1xyXG4gICAgICBhY3RpdmUgPSBhY3RpdmVcclxuICAgICAgICAuY2xvc2VzdCgnbGkuZHJvcGRvd24nKVxyXG4gICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgIH1cclxuXHJcbiAgICBhY3RpdmUudHJpZ2dlcignYWN0aXZhdGUuYnMuc2Nyb2xsc3B5JylcclxuICB9XHJcblxyXG4gIFNjcm9sbFNweS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgIC5wYXJlbnRzVW50aWwodGhpcy5vcHRpb25zLnRhcmdldCwgJy5hY3RpdmUnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gU0NST0xMU1BZIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5zY3JvbGxzcHknKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnNjcm9sbHNweScsIChkYXRhID0gbmV3IFNjcm9sbFNweSh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLnNjcm9sbHNweVxyXG5cclxuICAkLmZuLnNjcm9sbHNweSAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uc2Nyb2xsc3B5LkNvbnN0cnVjdG9yID0gU2Nyb2xsU3B5XHJcblxyXG5cclxuICAvLyBTQ1JPTExTUFkgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5zY3JvbGxzcHkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uc2Nyb2xsc3B5ID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIFNDUk9MTFNQWSBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQuYnMuc2Nyb2xsc3B5LmRhdGEtYXBpJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnW2RhdGEtc3B5PVwic2Nyb2xsXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkc3B5ID0gJCh0aGlzKVxyXG4gICAgICBQbHVnaW4uY2FsbCgkc3B5LCAkc3B5LmRhdGEoKSlcclxuICAgIH0pXHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHRhYi5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdGFic1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gVEFCIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgVGFiID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgIC8vIGpzY3M6ZGlzYWJsZSByZXF1aXJlRG9sbGFyQmVmb3JlalF1ZXJ5QXNzaWdubWVudFxyXG4gICAgdGhpcy5lbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgLy8ganNjczplbmFibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcclxuICB9XHJcblxyXG4gIFRhYi5WRVJTSU9OID0gJzMuMy43J1xyXG5cclxuICBUYWIuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxyXG5cclxuICBUYWIucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRoaXMgICAgPSB0aGlzLmVsZW1lbnRcclxuICAgIHZhciAkdWwgICAgICA9ICR0aGlzLmNsb3Nlc3QoJ3VsOm5vdCguZHJvcGRvd24tbWVudSknKVxyXG4gICAgdmFyIHNlbGVjdG9yID0gJHRoaXMuZGF0YSgndGFyZ2V0JylcclxuXHJcbiAgICBpZiAoIXNlbGVjdG9yKSB7XHJcbiAgICAgIHNlbGVjdG9yID0gJHRoaXMuYXR0cignaHJlZicpXHJcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3IucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcclxuICAgIH1cclxuXHJcbiAgICBpZiAoJHRoaXMucGFyZW50KCdsaScpLmhhc0NsYXNzKCdhY3RpdmUnKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyICRwcmV2aW91cyA9ICR1bC5maW5kKCcuYWN0aXZlOmxhc3QgYScpXHJcbiAgICB2YXIgaGlkZUV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy50YWInLCB7XHJcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXHJcbiAgICB9KVxyXG4gICAgdmFyIHNob3dFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMudGFiJywge1xyXG4gICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cclxuICAgIH0pXHJcblxyXG4gICAgJHByZXZpb3VzLnRyaWdnZXIoaGlkZUV2ZW50KVxyXG4gICAgJHRoaXMudHJpZ2dlcihzaG93RXZlbnQpXHJcblxyXG4gICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCBoaWRlRXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHZhciAkdGFyZ2V0ID0gJChzZWxlY3RvcilcclxuXHJcbiAgICB0aGlzLmFjdGl2YXRlKCR0aGlzLmNsb3Nlc3QoJ2xpJyksICR1bClcclxuICAgIHRoaXMuYWN0aXZhdGUoJHRhcmdldCwgJHRhcmdldC5wYXJlbnQoKSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkcHJldmlvdXMudHJpZ2dlcih7XHJcbiAgICAgICAgdHlwZTogJ2hpZGRlbi5icy50YWInLFxyXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXHJcbiAgICAgIH0pXHJcbiAgICAgICR0aGlzLnRyaWdnZXIoe1xyXG4gICAgICAgIHR5cGU6ICdzaG93bi5icy50YWInLFxyXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIFRhYi5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgY29udGFpbmVyLCBjYWxsYmFjaykge1xyXG4gICAgdmFyICRhY3RpdmUgICAgPSBjb250YWluZXIuZmluZCgnPiAuYWN0aXZlJylcclxuICAgIHZhciB0cmFuc2l0aW9uID0gY2FsbGJhY2tcclxuICAgICAgJiYgJC5zdXBwb3J0LnRyYW5zaXRpb25cclxuICAgICAgJiYgKCRhY3RpdmUubGVuZ3RoICYmICRhY3RpdmUuaGFzQ2xhc3MoJ2ZhZGUnKSB8fCAhIWNvbnRhaW5lci5maW5kKCc+IC5mYWRlJykubGVuZ3RoKVxyXG5cclxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICRhY3RpdmVcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgLmZpbmQoJz4gLmRyb3Bkb3duLW1lbnUgPiAuYWN0aXZlJylcclxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAuZW5kKClcclxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcclxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXHJcblxyXG4gICAgICBlbGVtZW50XHJcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxyXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG5cclxuICAgICAgaWYgKHRyYW5zaXRpb24pIHtcclxuICAgICAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoIC8vIHJlZmxvdyBmb3IgdHJhbnNpdGlvblxyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCdmYWRlJylcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGVsZW1lbnQucGFyZW50KCcuZHJvcGRvd24tbWVudScpLmxlbmd0aCkge1xyXG4gICAgICAgIGVsZW1lbnRcclxuICAgICAgICAgIC5jbG9zZXN0KCdsaS5kcm9wZG93bicpXHJcbiAgICAgICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAgIC5lbmQoKVxyXG4gICAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXHJcbiAgICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuICAgICAgfVxyXG5cclxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxyXG4gICAgfVxyXG5cclxuICAgICRhY3RpdmUubGVuZ3RoICYmIHRyYW5zaXRpb24gP1xyXG4gICAgICAkYWN0aXZlXHJcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgbmV4dClcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVGFiLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgbmV4dCgpXHJcblxyXG4gICAgJGFjdGl2ZS5yZW1vdmVDbGFzcygnaW4nKVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIFRBQiBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy50YWInKVxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy50YWInLCAoZGF0YSA9IG5ldyBUYWIodGhpcykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi50YWJcclxuXHJcbiAgJC5mbi50YWIgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLnRhYi5Db25zdHJ1Y3RvciA9IFRhYlxyXG5cclxuXHJcbiAgLy8gVEFCIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4udGFiLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLnRhYiA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBUQUIgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT1cclxuXHJcbiAgdmFyIGNsaWNrSGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIFBsdWdpbi5jYWxsKCQodGhpcyksICdzaG93JylcclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpXHJcbiAgICAub24oJ2NsaWNrLmJzLnRhYi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nLCBjbGlja0hhbmRsZXIpXHJcbiAgICAub24oJ2NsaWNrLmJzLnRhYi5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJwaWxsXCJdJywgY2xpY2tIYW5kbGVyKVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogYWZmaXguanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2FmZml4XHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBBRkZJWCBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgQWZmaXggPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEFmZml4LkRFRkFVTFRTLCBvcHRpb25zKVxyXG5cclxuICAgIHRoaXMuJHRhcmdldCA9ICQodGhpcy5vcHRpb25zLnRhcmdldClcclxuICAgICAgLm9uKCdzY3JvbGwuYnMuYWZmaXguZGF0YS1hcGknLCAkLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbiwgdGhpcykpXHJcbiAgICAgIC5vbignY2xpY2suYnMuYWZmaXguZGF0YS1hcGknLCAgJC5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb25XaXRoRXZlbnRMb29wLCB0aGlzKSlcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50ICAgICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMuYWZmaXhlZCAgICAgID0gbnVsbFxyXG4gICAgdGhpcy51bnBpbiAgICAgICAgPSBudWxsXHJcbiAgICB0aGlzLnBpbm5lZE9mZnNldCA9IG51bGxcclxuXHJcbiAgICB0aGlzLmNoZWNrUG9zaXRpb24oKVxyXG4gIH1cclxuXHJcbiAgQWZmaXguVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIEFmZml4LlJFU0VUICAgID0gJ2FmZml4IGFmZml4LXRvcCBhZmZpeC1ib3R0b20nXHJcblxyXG4gIEFmZml4LkRFRkFVTFRTID0ge1xyXG4gICAgb2Zmc2V0OiAwLFxyXG4gICAgdGFyZ2V0OiB3aW5kb3dcclxuICB9XHJcblxyXG4gIEFmZml4LnByb3RvdHlwZS5nZXRTdGF0ZSA9IGZ1bmN0aW9uIChzY3JvbGxIZWlnaHQsIGhlaWdodCwgb2Zmc2V0VG9wLCBvZmZzZXRCb3R0b20pIHtcclxuICAgIHZhciBzY3JvbGxUb3AgICAgPSB0aGlzLiR0YXJnZXQuc2Nyb2xsVG9wKClcclxuICAgIHZhciBwb3NpdGlvbiAgICAgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpXHJcbiAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gdGhpcy4kdGFyZ2V0LmhlaWdodCgpXHJcblxyXG4gICAgaWYgKG9mZnNldFRvcCAhPSBudWxsICYmIHRoaXMuYWZmaXhlZCA9PSAndG9wJykgcmV0dXJuIHNjcm9sbFRvcCA8IG9mZnNldFRvcCA/ICd0b3AnIDogZmFsc2VcclxuXHJcbiAgICBpZiAodGhpcy5hZmZpeGVkID09ICdib3R0b20nKSB7XHJcbiAgICAgIGlmIChvZmZzZXRUb3AgIT0gbnVsbCkgcmV0dXJuIChzY3JvbGxUb3AgKyB0aGlzLnVucGluIDw9IHBvc2l0aW9uLnRvcCkgPyBmYWxzZSA6ICdib3R0b20nXHJcbiAgICAgIHJldHVybiAoc2Nyb2xsVG9wICsgdGFyZ2V0SGVpZ2h0IDw9IHNjcm9sbEhlaWdodCAtIG9mZnNldEJvdHRvbSkgPyBmYWxzZSA6ICdib3R0b20nXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGluaXRpYWxpemluZyAgID0gdGhpcy5hZmZpeGVkID09IG51bGxcclxuICAgIHZhciBjb2xsaWRlclRvcCAgICA9IGluaXRpYWxpemluZyA/IHNjcm9sbFRvcCA6IHBvc2l0aW9uLnRvcFxyXG4gICAgdmFyIGNvbGxpZGVySGVpZ2h0ID0gaW5pdGlhbGl6aW5nID8gdGFyZ2V0SGVpZ2h0IDogaGVpZ2h0XHJcblxyXG4gICAgaWYgKG9mZnNldFRvcCAhPSBudWxsICYmIHNjcm9sbFRvcCA8PSBvZmZzZXRUb3ApIHJldHVybiAndG9wJ1xyXG4gICAgaWYgKG9mZnNldEJvdHRvbSAhPSBudWxsICYmIChjb2xsaWRlclRvcCArIGNvbGxpZGVySGVpZ2h0ID49IHNjcm9sbEhlaWdodCAtIG9mZnNldEJvdHRvbSkpIHJldHVybiAnYm90dG9tJ1xyXG5cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgQWZmaXgucHJvdG90eXBlLmdldFBpbm5lZE9mZnNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnBpbm5lZE9mZnNldCkgcmV0dXJuIHRoaXMucGlubmVkT2Zmc2V0XHJcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKEFmZml4LlJFU0VUKS5hZGRDbGFzcygnYWZmaXgnKVxyXG4gICAgdmFyIHNjcm9sbFRvcCA9IHRoaXMuJHRhcmdldC5zY3JvbGxUb3AoKVxyXG4gICAgdmFyIHBvc2l0aW9uICA9IHRoaXMuJGVsZW1lbnQub2Zmc2V0KClcclxuICAgIHJldHVybiAodGhpcy5waW5uZWRPZmZzZXQgPSBwb3NpdGlvbi50b3AgLSBzY3JvbGxUb3ApXHJcbiAgfVxyXG5cclxuICBBZmZpeC5wcm90b3R5cGUuY2hlY2tQb3NpdGlvbldpdGhFdmVudExvb3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBzZXRUaW1lb3V0KCQucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLCB0aGlzKSwgMSlcclxuICB9XHJcblxyXG4gIEFmZml4LnByb3RvdHlwZS5jaGVja1Bvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKCF0aGlzLiRlbGVtZW50LmlzKCc6dmlzaWJsZScpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgaGVpZ2h0ICAgICAgID0gdGhpcy4kZWxlbWVudC5oZWlnaHQoKVxyXG4gICAgdmFyIG9mZnNldCAgICAgICA9IHRoaXMub3B0aW9ucy5vZmZzZXRcclxuICAgIHZhciBvZmZzZXRUb3AgICAgPSBvZmZzZXQudG9wXHJcbiAgICB2YXIgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0LmJvdHRvbVxyXG4gICAgdmFyIHNjcm9sbEhlaWdodCA9IE1hdGgubWF4KCQoZG9jdW1lbnQpLmhlaWdodCgpLCAkKGRvY3VtZW50LmJvZHkpLmhlaWdodCgpKVxyXG5cclxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0ICE9ICdvYmplY3QnKSAgICAgICAgIG9mZnNldEJvdHRvbSA9IG9mZnNldFRvcCA9IG9mZnNldFxyXG4gICAgaWYgKHR5cGVvZiBvZmZzZXRUb3AgPT0gJ2Z1bmN0aW9uJykgICAgb2Zmc2V0VG9wICAgID0gb2Zmc2V0LnRvcCh0aGlzLiRlbGVtZW50KVxyXG4gICAgaWYgKHR5cGVvZiBvZmZzZXRCb3R0b20gPT0gJ2Z1bmN0aW9uJykgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0LmJvdHRvbSh0aGlzLiRlbGVtZW50KVxyXG5cclxuICAgIHZhciBhZmZpeCA9IHRoaXMuZ2V0U3RhdGUoc2Nyb2xsSGVpZ2h0LCBoZWlnaHQsIG9mZnNldFRvcCwgb2Zmc2V0Qm90dG9tKVxyXG5cclxuICAgIGlmICh0aGlzLmFmZml4ZWQgIT0gYWZmaXgpIHtcclxuICAgICAgaWYgKHRoaXMudW5waW4gIT0gbnVsbCkgdGhpcy4kZWxlbWVudC5jc3MoJ3RvcCcsICcnKVxyXG5cclxuICAgICAgdmFyIGFmZml4VHlwZSA9ICdhZmZpeCcgKyAoYWZmaXggPyAnLScgKyBhZmZpeCA6ICcnKVxyXG4gICAgICB2YXIgZSAgICAgICAgID0gJC5FdmVudChhZmZpeFR5cGUgKyAnLmJzLmFmZml4JylcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgICAgdGhpcy5hZmZpeGVkID0gYWZmaXhcclxuICAgICAgdGhpcy51bnBpbiA9IGFmZml4ID09ICdib3R0b20nID8gdGhpcy5nZXRQaW5uZWRPZmZzZXQoKSA6IG51bGxcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoQWZmaXguUkVTRVQpXHJcbiAgICAgICAgLmFkZENsYXNzKGFmZml4VHlwZSlcclxuICAgICAgICAudHJpZ2dlcihhZmZpeFR5cGUucmVwbGFjZSgnYWZmaXgnLCAnYWZmaXhlZCcpICsgJy5icy5hZmZpeCcpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFmZml4ID09ICdib3R0b20nKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub2Zmc2V0KHtcclxuICAgICAgICB0b3A6IHNjcm9sbEhlaWdodCAtIGhlaWdodCAtIG9mZnNldEJvdHRvbVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIEFGRklYIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmFmZml4JylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5hZmZpeCcsIChkYXRhID0gbmV3IEFmZml4KHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uYWZmaXhcclxuXHJcbiAgJC5mbi5hZmZpeCAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uYWZmaXguQ29uc3RydWN0b3IgPSBBZmZpeFxyXG5cclxuXHJcbiAgLy8gQUZGSVggTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmFmZml4Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmFmZml4ID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEFGRklYIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT1cclxuXHJcbiAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnW2RhdGEtc3B5PVwiYWZmaXhcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICRzcHkgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhID0gJHNweS5kYXRhKClcclxuXHJcbiAgICAgIGRhdGEub2Zmc2V0ID0gZGF0YS5vZmZzZXQgfHwge31cclxuXHJcbiAgICAgIGlmIChkYXRhLm9mZnNldEJvdHRvbSAhPSBudWxsKSBkYXRhLm9mZnNldC5ib3R0b20gPSBkYXRhLm9mZnNldEJvdHRvbVxyXG4gICAgICBpZiAoZGF0YS5vZmZzZXRUb3AgICAgIT0gbnVsbCkgZGF0YS5vZmZzZXQudG9wICAgID0gZGF0YS5vZmZzZXRUb3BcclxuXHJcbiAgICAgIFBsdWdpbi5jYWxsKCRzcHksIGRhdGEpXHJcbiAgICB9KVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcbiIsIi8qIVxyXG4gKiBKYXNueSBCb290c3RyYXAgdjMuMS4zIChodHRwOi8vamFzbnkuZ2l0aHViLmlvL2Jvb3RzdHJhcClcclxuICogQ29weXJpZ2h0IDIwMTItMjAxNCBBcm5vbGQgRGFuaWVsc1xyXG4gKiBMaWNlbnNlZCB1bmRlciBBcGFjaGUtMi4wIChodHRwczovL2dpdGh1Yi5jb20vamFzbnkvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBqUXVlcnkgPT09ICd1bmRlZmluZWQnKSB7IHRocm93IG5ldyBFcnJvcignSmFzbnkgQm9vdHN0cmFwXFwncyBKYXZhU2NyaXB0IHJlcXVpcmVzIGpRdWVyeScpIH1cclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHRyYW5zaXRpb24uanMgdjMuMS4zXHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RyYW5zaXRpb25zXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE0IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDU1MgVFJBTlNJVElPTiBTVVBQT1JUIChTaG91dG91dDogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tLylcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCgpIHtcclxuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jvb3RzdHJhcCcpXHJcblxyXG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcclxuICAgICAgV2Via2l0VHJhbnNpdGlvbiA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcclxuICAgICAgTW96VHJhbnNpdGlvbiAgICA6ICd0cmFuc2l0aW9uZW5kJyxcclxuICAgICAgT1RyYW5zaXRpb24gICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgIHRyYW5zaXRpb24gICAgICAgOiAndHJhbnNpdGlvbmVuZCdcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYW5zRW5kRXZlbnROYW1lcykge1xyXG4gICAgICBpZiAoZWwuc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiB7IGVuZDogdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZSAvLyBleHBsaWNpdCBmb3IgaWU4ICggIC5fLilcclxuICB9XHJcblxyXG4gIGlmICgkLnN1cHBvcnQudHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkKSByZXR1cm4gIC8vIFByZXZlbnQgY29uZmxpY3Qgd2l0aCBUd2l0dGVyIEJvb3RzdHJhcFxyXG5cclxuICAvLyBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9jc3MtdHJhbnNpdGlvbnNcclxuICAkLmZuLmVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XHJcbiAgICB2YXIgY2FsbGVkID0gZmFsc2UsICRlbCA9IHRoaXNcclxuICAgICQodGhpcykub25lKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCwgZnVuY3Rpb24gKCkgeyBjYWxsZWQgPSB0cnVlIH0pXHJcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7IGlmICghY2FsbGVkKSAkKCRlbCkudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpIH1cclxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gICQoZnVuY3Rpb24gKCkge1xyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uRW5kKClcclxuICB9KVxyXG5cclxufSh3aW5kb3cualF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IG9mZmNhbnZhcy5qcyB2My4xLjNcclxuICogaHR0cDovL2phc255LmdpdGh1Yi5pby9ib290c3RyYXAvamF2YXNjcmlwdC8jb2ZmY2FudmFzXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE0IEFybm9sZCBEYW5pZWxzXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIilcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxyXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG4rZnVuY3Rpb24gKCQpIHsgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIC8vIE9GRkNBTlZBUyBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgT2ZmQ2FudmFzID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgID0gJC5leHRlbmQoe30sIE9mZkNhbnZhcy5ERUZBVUxUUywgb3B0aW9ucylcclxuICAgIHRoaXMuc3RhdGUgICAgPSBudWxsXHJcbiAgICB0aGlzLnBsYWNlbWVudCA9IG51bGxcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZWNhbGMpIHtcclxuICAgICAgdGhpcy5jYWxjQ2xvbmUoKVxyXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsICQucHJveHkodGhpcy5yZWNhbGMsIHRoaXMpKVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9oaWRlKVxyXG4gICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAkLnByb3h5KHRoaXMuYXV0b2hpZGUsIHRoaXMpKVxyXG5cclxuICAgIGlmICh0aGlzLm9wdGlvbnMudG9nZ2xlKSB0aGlzLnRvZ2dsZSgpXHJcbiAgICBcclxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzYWJsZXNjcm9sbGluZykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5kaXNhYmxlU2Nyb2xsaW5nID0gdGhpcy5vcHRpb25zLmRpc2FibGVzY3JvbGxpbmdcclxuICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zLmRpc2FibGVzY3JvbGxpbmdcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5ERUZBVUxUUyA9IHtcclxuICAgIHRvZ2dsZTogdHJ1ZSxcclxuICAgIHBsYWNlbWVudDogJ2F1dG8nLFxyXG4gICAgYXV0b2hpZGU6IHRydWUsXHJcbiAgICByZWNhbGM6IHRydWUsXHJcbiAgICBkaXNhYmxlU2Nyb2xsaW5nOiB0cnVlXHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMucHJvdG90eXBlLm9mZnNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHN3aXRjaCAodGhpcy5wbGFjZW1lbnQpIHtcclxuICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzogIHJldHVybiB0aGlzLiRlbGVtZW50Lm91dGVyV2lkdGgoKVxyXG4gICAgICBjYXNlICd0b3AnOlxyXG4gICAgICBjYXNlICdib3R0b20nOiByZXR1cm4gdGhpcy4kZWxlbWVudC5vdXRlckhlaWdodCgpXHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuY2FsY1BsYWNlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLm9wdGlvbnMucGxhY2VtZW50ICE9PSAnYXV0bycpIHtcclxuICAgICAgICB0aGlzLnBsYWNlbWVudCA9IHRoaXMub3B0aW9ucy5wbGFjZW1lbnRcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKCd2aXNpYmxpdHknLCAnaGlkZGVuICFpbXBvcnRhbnQnKS5hZGRDbGFzcygnaW4nKVxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgdmFyIGhvcml6b250YWwgPSAkKHdpbmRvdykud2lkdGgoKSAvIHRoaXMuJGVsZW1lbnQud2lkdGgoKVxyXG4gICAgdmFyIHZlcnRpY2FsID0gJCh3aW5kb3cpLmhlaWdodCgpIC8gdGhpcy4kZWxlbWVudC5oZWlnaHQoKVxyXG4gICAgICAgIFxyXG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50XHJcbiAgICBmdW5jdGlvbiBhYihhLCBiKSB7XHJcbiAgICAgIGlmIChlbGVtZW50LmNzcyhiKSA9PT0gJ2F1dG8nKSByZXR1cm4gYVxyXG4gICAgICBpZiAoZWxlbWVudC5jc3MoYSkgPT09ICdhdXRvJykgcmV0dXJuIGJcclxuICAgICAgXHJcbiAgICAgIHZhciBzaXplX2EgPSBwYXJzZUludChlbGVtZW50LmNzcyhhKSwgMTApXHJcbiAgICAgIHZhciBzaXplX2IgPSBwYXJzZUludChlbGVtZW50LmNzcyhiKSwgMTApXHJcbiAgXHJcbiAgICAgIHJldHVybiBzaXplX2EgPiBzaXplX2IgPyBiIDogYVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLnBsYWNlbWVudCA9IGhvcml6b250YWwgPj0gdmVydGljYWwgPyBhYignbGVmdCcsICdyaWdodCcpIDogYWIoJ3RvcCcsICdib3R0b20nKVxyXG4gICAgICBcclxuICAgIGlmICh0aGlzLiRlbGVtZW50LmNzcygndmlzaWJpbGl0eScpID09PSAnaGlkZGVuICFpbXBvcnRhbnQnKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2luJykuY3NzKCd2aXNpYmxpdHknLCAnJylcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5vcHBvc2l0ZSA9IGZ1bmN0aW9uIChwbGFjZW1lbnQpIHtcclxuICAgIHN3aXRjaCAocGxhY2VtZW50KSB7XHJcbiAgICAgIGNhc2UgJ3RvcCc6ICAgIHJldHVybiAnYm90dG9tJ1xyXG4gICAgICBjYXNlICdsZWZ0JzogICByZXR1cm4gJ3JpZ2h0J1xyXG4gICAgICBjYXNlICdib3R0b20nOiByZXR1cm4gJ3RvcCdcclxuICAgICAgY2FzZSAncmlnaHQnOiAgcmV0dXJuICdsZWZ0J1xyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBPZmZDYW52YXMucHJvdG90eXBlLmdldENhbnZhc0VsZW1lbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyBSZXR1cm4gYSBzZXQgY29udGFpbmluZyB0aGUgY2FudmFzIHBsdXMgYWxsIGZpeGVkIGVsZW1lbnRzXHJcbiAgICB2YXIgY2FudmFzID0gdGhpcy5vcHRpb25zLmNhbnZhcyA/ICQodGhpcy5vcHRpb25zLmNhbnZhcykgOiB0aGlzLiRlbGVtZW50XHJcbiAgICBcclxuICAgIHZhciBmaXhlZF9lbGVtZW50cyA9IGNhbnZhcy5maW5kKCcqJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gJCh0aGlzKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCdcclxuICAgIH0pLm5vdCh0aGlzLm9wdGlvbnMuZXhjbHVkZSlcclxuICAgIFxyXG4gICAgcmV0dXJuIGNhbnZhcy5hZGQoZml4ZWRfZWxlbWVudHMpXHJcbiAgfVxyXG4gIFxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuc2xpZGUgPSBmdW5jdGlvbiAoZWxlbWVudHMsIG9mZnNldCwgY2FsbGJhY2spIHtcclxuICAgIC8vIFVzZSBqUXVlcnkgYW5pbWF0aW9uIGlmIENTUyB0cmFuc2l0aW9ucyBhcmVuJ3Qgc3VwcG9ydGVkXHJcbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSB7XHJcbiAgICAgIHZhciBhbmltID0ge31cclxuICAgICAgYW5pbVt0aGlzLnBsYWNlbWVudF0gPSBcIis9XCIgKyBvZmZzZXRcclxuICAgICAgcmV0dXJuIGVsZW1lbnRzLmFuaW1hdGUoYW5pbSwgMzUwLCBjYWxsYmFjaylcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGxhY2VtZW50ID0gdGhpcy5wbGFjZW1lbnRcclxuICAgIHZhciBvcHBvc2l0ZSA9IHRoaXMub3Bwb3NpdGUocGxhY2VtZW50KVxyXG4gICAgXHJcbiAgICBlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoJCh0aGlzKS5jc3MocGxhY2VtZW50KSAhPT0gJ2F1dG8nKVxyXG4gICAgICAgICQodGhpcykuY3NzKHBsYWNlbWVudCwgKHBhcnNlSW50KCQodGhpcykuY3NzKHBsYWNlbWVudCksIDEwKSB8fCAwKSArIG9mZnNldClcclxuICAgICAgXHJcbiAgICAgIGlmICgkKHRoaXMpLmNzcyhvcHBvc2l0ZSkgIT09ICdhdXRvJylcclxuICAgICAgICAkKHRoaXMpLmNzcyhvcHBvc2l0ZSwgKHBhcnNlSW50KCQodGhpcykuY3NzKG9wcG9zaXRlKSwgMTApIHx8IDApIC0gb2Zmc2V0KVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAub25lKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCwgY2FsbGJhY2spXHJcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZCgzNTApXHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMucHJvdG90eXBlLmRpc2FibGVTY3JvbGxpbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBib2R5V2lkdGggPSAkKCdib2R5Jykud2lkdGgoKVxyXG4gICAgdmFyIHByb3AgPSAncGFkZGluZy0nICsgdGhpcy5vcHBvc2l0ZSh0aGlzLnBsYWNlbWVudClcclxuXHJcbiAgICBpZiAoJCgnYm9keScpLmRhdGEoJ29mZmNhbnZhcy1zdHlsZScpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgJCgnYm9keScpLmRhdGEoJ29mZmNhbnZhcy1zdHlsZScsICQoJ2JvZHknKS5hdHRyKCdzdHlsZScpIHx8ICcnKVxyXG4gICAgfVxyXG4gICAgICBcclxuICAgICQoJ2JvZHknKS5jc3MoJ292ZXJmbG93JywgJ2hpZGRlbicpXHJcblxyXG4gICAgaWYgKCQoJ2JvZHknKS53aWR0aCgpID4gYm9keVdpZHRoKSB7XHJcbiAgICAgIHZhciBwYWRkaW5nID0gcGFyc2VJbnQoJCgnYm9keScpLmNzcyhwcm9wKSwgMTApICsgJCgnYm9keScpLndpZHRoKCkgLSBib2R5V2lkdGhcclxuICAgICAgXHJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnYm9keScpLmNzcyhwcm9wLCBwYWRkaW5nKVxyXG4gICAgICB9LCAxKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUpIHJldHVyblxyXG4gICAgXHJcbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ3Nob3cuYnMub2ZmY2FudmFzJylcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxyXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHRoaXMuc3RhdGUgPSAnc2xpZGUtaW4nXHJcbiAgICB0aGlzLmNhbGNQbGFjZW1lbnQoKTtcclxuICAgIFxyXG4gICAgdmFyIGVsZW1lbnRzID0gdGhpcy5nZXRDYW52YXNFbGVtZW50cygpXHJcbiAgICB2YXIgcGxhY2VtZW50ID0gdGhpcy5wbGFjZW1lbnRcclxuICAgIHZhciBvcHBvc2l0ZSA9IHRoaXMub3Bwb3NpdGUocGxhY2VtZW50KVxyXG4gICAgdmFyIG9mZnNldCA9IHRoaXMub2Zmc2V0KClcclxuXHJcbiAgICBpZiAoZWxlbWVudHMuaW5kZXgodGhpcy4kZWxlbWVudCkgIT09IC0xKSB7XHJcbiAgICAgICQodGhpcy4kZWxlbWVudCkuZGF0YSgnb2ZmY2FudmFzLXN0eWxlJywgJCh0aGlzLiRlbGVtZW50KS5hdHRyKCdzdHlsZScpIHx8ICcnKVxyXG4gICAgICB0aGlzLiRlbGVtZW50LmNzcyhwbGFjZW1lbnQsIC0xICogb2Zmc2V0KVxyXG4gICAgICB0aGlzLiRlbGVtZW50LmNzcyhwbGFjZW1lbnQpOyAvLyBXb3JrYXJvdW5kOiBOZWVkIHRvIGdldCB0aGUgQ1NTIHByb3BlcnR5IGZvciBpdCB0byBiZSBhcHBsaWVkIGJlZm9yZSB0aGUgbmV4dCBsaW5lIG9mIGNvZGVcclxuICAgIH1cclxuXHJcbiAgICBlbGVtZW50cy5hZGRDbGFzcygnY2FudmFzLXNsaWRpbmcnKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoJCh0aGlzKS5kYXRhKCdvZmZjYW52YXMtc3R5bGUnKSA9PT0gdW5kZWZpbmVkKSAkKHRoaXMpLmRhdGEoJ29mZmNhbnZhcy1zdHlsZScsICQodGhpcykuYXR0cignc3R5bGUnKSB8fCAnJylcclxuICAgICAgaWYgKCQodGhpcykuY3NzKCdwb3NpdGlvbicpID09PSAnc3RhdGljJykgJCh0aGlzKS5jc3MoJ3Bvc2l0aW9uJywgJ3JlbGF0aXZlJylcclxuICAgICAgaWYgKCgkKHRoaXMpLmNzcyhwbGFjZW1lbnQpID09PSAnYXV0bycgfHwgJCh0aGlzKS5jc3MocGxhY2VtZW50KSA9PT0gJzBweCcpICYmXHJcbiAgICAgICAgICAoJCh0aGlzKS5jc3Mob3Bwb3NpdGUpID09PSAnYXV0bycgfHwgJCh0aGlzKS5jc3Mob3Bwb3NpdGUpID09PSAnMHB4JykpIHtcclxuICAgICAgICAkKHRoaXMpLmNzcyhwbGFjZW1lbnQsIDApXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBcclxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGlzYWJsZVNjcm9sbGluZykgdGhpcy5kaXNhYmxlU2Nyb2xsaW5nKClcclxuICAgIFxyXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAodGhpcy5zdGF0ZSAhPSAnc2xpZGUtaW4nKSByZXR1cm5cclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RhdGUgPSAnc2xpZCdcclxuXHJcbiAgICAgIGVsZW1lbnRzLnJlbW92ZUNsYXNzKCdjYW52YXMtc2xpZGluZycpLmFkZENsYXNzKCdjYW52YXMtc2xpZCcpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvd24uYnMub2ZmY2FudmFzJylcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KCQucHJveHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcclxuICAgICAgdGhpcy5zbGlkZShlbGVtZW50cywgb2Zmc2V0LCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcclxuICAgIH0sIHRoaXMpLCAxKVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGZhc3QpIHtcclxuICAgIGlmICh0aGlzLnN0YXRlICE9PSAnc2xpZCcpIHJldHVyblxyXG5cclxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy5vZmZjYW52YXMnKVxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXHJcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5zdGF0ZSA9ICdzbGlkZS1vdXQnXHJcblxyXG4gICAgdmFyIGVsZW1lbnRzID0gJCgnLmNhbnZhcy1zbGlkJylcclxuICAgIHZhciBwbGFjZW1lbnQgPSB0aGlzLnBsYWNlbWVudFxyXG4gICAgdmFyIG9mZnNldCA9IC0xICogdGhpcy5vZmZzZXQoKVxyXG5cclxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUgIT0gJ3NsaWRlLW91dCcpIHJldHVyblxyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGF0ZSA9IG51bGxcclxuICAgICAgdGhpcy5wbGFjZW1lbnQgPSBudWxsXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpbicpXHJcbiAgICAgIFxyXG4gICAgICBlbGVtZW50cy5yZW1vdmVDbGFzcygnY2FudmFzLXNsaWRpbmcnKVxyXG4gICAgICBlbGVtZW50cy5hZGQodGhpcy4kZWxlbWVudCkuYWRkKCdib2R5JykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKHRoaXMpLmF0dHIoJ3N0eWxlJywgJCh0aGlzKS5kYXRhKCdvZmZjYW52YXMtc3R5bGUnKSkucmVtb3ZlRGF0YSgnb2ZmY2FudmFzLXN0eWxlJylcclxuICAgICAgfSlcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZGVuLmJzLm9mZmNhbnZhcycpXHJcbiAgICB9XHJcblxyXG4gICAgZWxlbWVudHMucmVtb3ZlQ2xhc3MoJ2NhbnZhcy1zbGlkJykuYWRkQ2xhc3MoJ2NhbnZhcy1zbGlkaW5nJylcclxuICAgIFxyXG4gICAgc2V0VGltZW91dCgkLnByb3h5KGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLnNsaWRlKGVsZW1lbnRzLCBvZmZzZXQsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxyXG4gICAgfSwgdGhpcyksIDEpXHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnN0YXRlID09PSAnc2xpZGUtaW4nIHx8IHRoaXMuc3RhdGUgPT09ICdzbGlkZS1vdXQnKSByZXR1cm5cclxuICAgIHRoaXNbdGhpcy5zdGF0ZSA9PT0gJ3NsaWQnID8gJ2hpZGUnIDogJ3Nob3cnXSgpXHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMucHJvdG90eXBlLmNhbGNDbG9uZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy4kY2FsY0Nsb25lID0gdGhpcy4kZWxlbWVudC5jbG9uZSgpXHJcbiAgICAgIC5odG1sKCcnKVxyXG4gICAgICAuYWRkQ2xhc3MoJ29mZmNhbnZhcy1jbG9uZScpLnJlbW92ZUNsYXNzKCdpbicpXHJcbiAgICAgIC5hcHBlbmRUbygkKCdib2R5JykpXHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMucHJvdG90eXBlLnJlY2FsYyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLiRjYWxjQ2xvbmUuY3NzKCdkaXNwbGF5JykgPT09ICdub25lJyB8fCAodGhpcy5zdGF0ZSAhPT0gJ3NsaWQnICYmIHRoaXMuc3RhdGUgIT09ICdzbGlkZS1pbicpKSByZXR1cm5cclxuICAgIFxyXG4gICAgdGhpcy5zdGF0ZSA9IG51bGxcclxuICAgIHRoaXMucGxhY2VtZW50ID0gbnVsbFxyXG4gICAgdmFyIGVsZW1lbnRzID0gdGhpcy5nZXRDYW52YXNFbGVtZW50cygpXHJcbiAgICBcclxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2luJylcclxuICAgIFxyXG4gICAgZWxlbWVudHMucmVtb3ZlQ2xhc3MoJ2NhbnZhcy1zbGlkJylcclxuICAgIGVsZW1lbnRzLmFkZCh0aGlzLiRlbGVtZW50KS5hZGQoJ2JvZHknKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAkKHRoaXMpLmF0dHIoJ3N0eWxlJywgJCh0aGlzKS5kYXRhKCdvZmZjYW52YXMtc3R5bGUnKSkucmVtb3ZlRGF0YSgnb2ZmY2FudmFzLXN0eWxlJylcclxuICAgIH0pXHJcbiAgfVxyXG4gIFxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuYXV0b2hpZGUgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCQoZS50YXJnZXQpLmNsb3Nlc3QodGhpcy4kZWxlbWVudCkubGVuZ3RoID09PSAwKSB0aGlzLmhpZGUoKVxyXG4gIH1cclxuXHJcbiAgLy8gT0ZGQ0FOVkFTIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4ub2ZmY2FudmFzXHJcblxyXG4gICQuZm4ub2ZmY2FudmFzID0gZnVuY3Rpb24gKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLm9mZmNhbnZhcycpXHJcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIE9mZkNhbnZhcy5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLm9mZmNhbnZhcycsIChkYXRhID0gbmV3IE9mZkNhbnZhcyh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkLmZuLm9mZmNhbnZhcy5Db25zdHJ1Y3RvciA9IE9mZkNhbnZhc1xyXG5cclxuXHJcbiAgLy8gT0ZGQ0FOVkFTIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5vZmZjYW52YXMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4ub2ZmY2FudmFzID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIE9GRkNBTlZBUyBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5vZmZjYW52YXMuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPW9mZmNhbnZhc10nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpLCBocmVmXHJcbiAgICB2YXIgdGFyZ2V0ICA9ICR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JylcclxuICAgICAgICB8fCBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB8fCAoaHJlZiA9ICR0aGlzLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykgLy9zdHJpcCBmb3IgaWU3XHJcbiAgICB2YXIgJGNhbnZhcyA9ICQodGFyZ2V0KVxyXG4gICAgdmFyIGRhdGEgICAgPSAkY2FudmFzLmRhdGEoJ2JzLm9mZmNhbnZhcycpXHJcbiAgICB2YXIgb3B0aW9uICA9IGRhdGEgPyAndG9nZ2xlJyA6ICR0aGlzLmRhdGEoKVxyXG5cclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHJcbiAgICBpZiAoZGF0YSkgZGF0YS50b2dnbGUoKVxyXG4gICAgICBlbHNlICRjYW52YXMub2ZmY2FudmFzKG9wdGlvbilcclxuICB9KVxyXG5cclxufSh3aW5kb3cualF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHJvd2xpbmsuanMgdjMuMS4zXHJcbiAqIGh0dHA6Ly9qYXNueS5naXRodWIuaW8vYm9vdHN0cmFwL2phdmFzY3JpcHQvI3Jvd2xpbmtcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDEyLTIwMTQgQXJub2xkIERhbmllbHNcclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxyXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG4rZnVuY3Rpb24gKCQpIHsgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIHZhciBSb3dsaW5rID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgUm93bGluay5ERUZBVUxUUywgb3B0aW9ucylcclxuICAgIFxyXG4gICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suYnMucm93bGluaycsICd0ZDpub3QoLnJvd2xpbmstc2tpcCknLCAkLnByb3h5KHRoaXMuY2xpY2ssIHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgUm93bGluay5ERUZBVUxUUyA9IHtcclxuICAgIHRhcmdldDogXCJhXCJcclxuICB9XHJcblxyXG4gIFJvd2xpbmsucHJvdG90eXBlLmNsaWNrID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdmFyIHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5jbG9zZXN0KCd0cicpLmZpbmQodGhpcy5vcHRpb25zLnRhcmdldClbMF1cclxuICAgIGlmICgkKGUudGFyZ2V0KVswXSA9PT0gdGFyZ2V0KSByZXR1cm5cclxuICAgIFxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgXHJcbiAgICBpZiAodGFyZ2V0LmNsaWNrKSB7XHJcbiAgICAgIHRhcmdldC5jbGljaygpXHJcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50KSB7XHJcbiAgICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIk1vdXNlRXZlbnRzXCIpOyBcclxuICAgICAgZXZ0LmluaXRNb3VzZUV2ZW50KFwiY2xpY2tcIiwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAwLCAwLCAwLCAwLCAwLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCk7IFxyXG4gICAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChldnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgXHJcbiAgLy8gUk9XTElOSyBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5yb3dsaW5rXHJcblxyXG4gICQuZm4ucm93bGluayA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSA9ICR0aGlzLmRhdGEoJ2JzLnJvd2xpbmsnKVxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnJvd2xpbmsnLCAoZGF0YSA9IG5ldyBSb3dsaW5rKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkLmZuLnJvd2xpbmsuQ29uc3RydWN0b3IgPSBSb3dsaW5rXHJcblxyXG5cclxuICAvLyBST1dMSU5LIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5yb3dsaW5rLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLnJvd2xpbmsgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gUk9XTElOSyBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMucm93bGluay5kYXRhLWFwaScsICdbZGF0YS1saW5rPVwicm93XCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICgkKGUudGFyZ2V0KS5jbG9zZXN0KCcucm93bGluay1za2lwJykubGVuZ3RoICE9PSAwKSByZXR1cm5cclxuICAgIFxyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgaWYgKCR0aGlzLmRhdGEoJ2JzLnJvd2xpbmsnKSkgcmV0dXJuXHJcbiAgICAkdGhpcy5yb3dsaW5rKCR0aGlzLmRhdGEoKSlcclxuICAgICQoZS50YXJnZXQpLnRyaWdnZXIoJ2NsaWNrLmJzLnJvd2xpbmsnKVxyXG4gIH0pXHJcbiAgXHJcbn0od2luZG93LmpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGlucHV0bWFzay5qcyB2My4xLjBcclxuICogaHR0cDovL2phc255LmdpdGh1Yi5pby9ib290c3RyYXAvamF2YXNjcmlwdC8jaW5wdXRtYXNrXHJcbiAqIFxyXG4gKiBCYXNlZCBvbiBNYXNrZWQgSW5wdXQgcGx1Z2luIGJ5IEpvc2ggQnVzaCAoZGlnaXRhbGJ1c2guY29tKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDE0IEFybm9sZCBEYW5pZWxzXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIilcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxyXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB2YXIgaXNJcGhvbmUgPSAod2luZG93Lm9yaWVudGF0aW9uICE9PSB1bmRlZmluZWQpXHJcbiAgdmFyIGlzQW5kcm9pZCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwiYW5kcm9pZFwiKSA+IC0xXHJcbiAgdmFyIGlzSUUgPSB3aW5kb3cubmF2aWdhdG9yLmFwcE5hbWUgPT0gJ01pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlcidcclxuXHJcbiAgLy8gSU5QVVRNQVNLIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBJbnB1dG1hc2sgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgaWYgKGlzQW5kcm9pZCkgcmV0dXJuIC8vIE5vIHN1cHBvcnQgYmVjYXVzZSBjYXJldCBwb3NpdGlvbmluZyBkb2Vzbid0IHdvcmsgb24gQW5kcm9pZFxyXG4gICAgXHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIElucHV0bWFzay5ERUZBVUxUUywgb3B0aW9ucylcclxuICAgIHRoaXMubWFzayA9IFN0cmluZyh0aGlzLm9wdGlvbnMubWFzaylcclxuICAgIFxyXG4gICAgdGhpcy5pbml0KClcclxuICAgIHRoaXMubGlzdGVuKClcclxuICAgICAgICBcclxuICAgIHRoaXMuY2hlY2tWYWwoKSAvL1BlcmZvcm0gaW5pdGlhbCBjaGVjayBmb3IgZXhpc3RpbmcgdmFsdWVzXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2suREVGQVVMVFMgPSB7XHJcbiAgICBtYXNrOiBcIlwiLFxyXG4gICAgcGxhY2Vob2xkZXI6IFwiX1wiLFxyXG4gICAgZGVmaW5pdGlvbnM6IHtcclxuICAgICAgJzknOiBcIlswLTldXCIsXHJcbiAgICAgICdhJzogXCJbQS1aYS16XVwiLFxyXG4gICAgICAndyc6IFwiW0EtWmEtejAtOV1cIixcclxuICAgICAgJyonOiBcIi5cIlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZGVmcyA9IHRoaXMub3B0aW9ucy5kZWZpbml0aW9uc1xyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGhcclxuXHJcbiAgICB0aGlzLnRlc3RzID0gW10gXHJcbiAgICB0aGlzLnBhcnRpYWxQb3NpdGlvbiA9IHRoaXMubWFzay5sZW5ndGhcclxuICAgIHRoaXMuZmlyc3ROb25NYXNrUG9zID0gbnVsbFxyXG5cclxuICAgICQuZWFjaCh0aGlzLm1hc2suc3BsaXQoXCJcIiksICQucHJveHkoZnVuY3Rpb24oaSwgYykge1xyXG4gICAgICBpZiAoYyA9PSAnPycpIHtcclxuICAgICAgICBsZW4tLVxyXG4gICAgICAgIHRoaXMucGFydGlhbFBvc2l0aW9uID0gaVxyXG4gICAgICB9IGVsc2UgaWYgKGRlZnNbY10pIHtcclxuICAgICAgICB0aGlzLnRlc3RzLnB1c2gobmV3IFJlZ0V4cChkZWZzW2NdKSlcclxuICAgICAgICBpZiAodGhpcy5maXJzdE5vbk1hc2tQb3MgPT09IG51bGwpXHJcbiAgICAgICAgICB0aGlzLmZpcnN0Tm9uTWFza1BvcyA9ICB0aGlzLnRlc3RzLmxlbmd0aCAtIDFcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnRlc3RzLnB1c2gobnVsbClcclxuICAgICAgfVxyXG4gICAgfSwgdGhpcykpXHJcblxyXG4gICAgdGhpcy5idWZmZXIgPSAkLm1hcCh0aGlzLm1hc2suc3BsaXQoXCJcIiksICQucHJveHkoZnVuY3Rpb24oYywgaSkge1xyXG4gICAgICBpZiAoYyAhPSAnPycpIHJldHVybiBkZWZzW2NdID8gdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyIDogY1xyXG4gICAgfSwgdGhpcykpXHJcblxyXG4gICAgdGhpcy5mb2N1c1RleHQgPSB0aGlzLiRlbGVtZW50LnZhbCgpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5kYXRhKFwicmF3TWFza0ZuXCIsICQucHJveHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiAkLm1hcCh0aGlzLmJ1ZmZlciwgZnVuY3Rpb24oYywgaSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRlc3RzW2ldICYmIGMgIT0gdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyID8gYyA6IG51bGxcclxuICAgICAgfSkuam9pbignJylcclxuICAgIH0sIHRoaXMpKVxyXG4gIH1cclxuICAgIFxyXG4gIElucHV0bWFzay5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAodGhpcy4kZWxlbWVudC5hdHRyKFwicmVhZG9ubHlcIikpIHJldHVyblxyXG5cclxuICAgIHZhciBwYXN0ZUV2ZW50TmFtZSA9IChpc0lFID8gJ3Bhc3RlJyA6ICdpbnB1dCcpICsgXCIubWFza1wiXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAub24oXCJ1bm1hc2suYnMuaW5wdXRtYXNrXCIsICQucHJveHkodGhpcy51bm1hc2ssIHRoaXMpKVxyXG5cclxuICAgICAgLm9uKFwiZm9jdXMuYnMuaW5wdXRtYXNrXCIsICQucHJveHkodGhpcy5mb2N1c0V2ZW50LCB0aGlzKSlcclxuICAgICAgLm9uKFwiYmx1ci5icy5pbnB1dG1hc2tcIiwgJC5wcm94eSh0aGlzLmJsdXJFdmVudCwgdGhpcykpXHJcblxyXG4gICAgICAub24oXCJrZXlkb3duLmJzLmlucHV0bWFza1wiLCAkLnByb3h5KHRoaXMua2V5ZG93bkV2ZW50LCB0aGlzKSlcclxuICAgICAgLm9uKFwia2V5cHJlc3MuYnMuaW5wdXRtYXNrXCIsICQucHJveHkodGhpcy5rZXlwcmVzc0V2ZW50LCB0aGlzKSlcclxuXHJcbiAgICAgIC5vbihwYXN0ZUV2ZW50TmFtZSwgJC5wcm94eSh0aGlzLnBhc3RlRXZlbnQsIHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgLy9IZWxwZXIgRnVuY3Rpb24gZm9yIENhcmV0IHBvc2l0aW9uaW5nXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5jYXJldCA9IGZ1bmN0aW9uKGJlZ2luLCBlbmQpIHtcclxuICAgIGlmICh0aGlzLiRlbGVtZW50Lmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcbiAgICBpZiAodHlwZW9mIGJlZ2luID09ICdudW1iZXInKSB7XHJcbiAgICAgIGVuZCA9ICh0eXBlb2YgZW5kID09ICdudW1iZXInKSA/IGVuZCA6IGJlZ2luXHJcbiAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50LmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2V0U2VsZWN0aW9uUmFuZ2UpIHtcclxuICAgICAgICAgIHRoaXMuc2V0U2VsZWN0aW9uUmFuZ2UoYmVnaW4sIGVuZClcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY3JlYXRlVGV4dFJhbmdlKSB7XHJcbiAgICAgICAgICB2YXIgcmFuZ2UgPSB0aGlzLmNyZWF0ZVRleHRSYW5nZSgpXHJcbiAgICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKVxyXG4gICAgICAgICAgcmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgZW5kKVxyXG4gICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBiZWdpbilcclxuICAgICAgICAgIHJhbmdlLnNlbGVjdCgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0uc2V0U2VsZWN0aW9uUmFuZ2UpIHtcclxuICAgICAgICBiZWdpbiA9IHRoaXMuJGVsZW1lbnRbMF0uc2VsZWN0aW9uU3RhcnRcclxuICAgICAgICBlbmQgPSB0aGlzLiRlbGVtZW50WzBdLnNlbGVjdGlvbkVuZFxyXG4gICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnNlbGVjdGlvbiAmJiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UpIHtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKVxyXG4gICAgICAgIGJlZ2luID0gMCAtIHJhbmdlLmR1cGxpY2F0ZSgpLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLTEwMDAwMClcclxuICAgICAgICBlbmQgPSBiZWdpbiArIHJhbmdlLnRleHQubGVuZ3RoXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBiZWdpbjogYmVnaW4sIFxyXG4gICAgICAgIGVuZDogZW5kXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5zZWVrTmV4dCA9IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGhcclxuICAgIHdoaWxlICgrK3BvcyA8PSBsZW4gJiYgIXRoaXMudGVzdHNbcG9zXSk7XHJcblxyXG4gICAgcmV0dXJuIHBvc1xyXG4gIH1cclxuICBcclxuICBJbnB1dG1hc2sucHJvdG90eXBlLnNlZWtQcmV2ID0gZnVuY3Rpb24ocG9zKSB7XHJcbiAgICB3aGlsZSAoLS1wb3MgPj0gMCAmJiAhdGhpcy50ZXN0c1twb3NdKTtcclxuXHJcbiAgICByZXR1cm4gcG9zXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLnNoaWZ0TCA9IGZ1bmN0aW9uKGJlZ2luLGVuZCkge1xyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGhcclxuXHJcbiAgICBpZiAoYmVnaW4gPCAwKSByZXR1cm5cclxuXHJcbiAgICBmb3IgKHZhciBpID0gYmVnaW4sIGogPSB0aGlzLnNlZWtOZXh0KGVuZCk7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBpZiAodGhpcy50ZXN0c1tpXSkge1xyXG4gICAgICAgIGlmIChqIDwgbGVuICYmIHRoaXMudGVzdHNbaV0udGVzdCh0aGlzLmJ1ZmZlcltqXSkpIHtcclxuICAgICAgICAgIHRoaXMuYnVmZmVyW2ldID0gdGhpcy5idWZmZXJbal1cclxuICAgICAgICAgIHRoaXMuYnVmZmVyW2pdID0gdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyXHJcbiAgICAgICAgfSBlbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIGogPSB0aGlzLnNlZWtOZXh0KGopXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMud3JpdGVCdWZmZXIoKVxyXG4gICAgdGhpcy5jYXJldChNYXRoLm1heCh0aGlzLmZpcnN0Tm9uTWFza1BvcywgYmVnaW4pKVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5zaGlmdFIgPSBmdW5jdGlvbihwb3MpIHtcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IHBvcywgYyA9IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlcjsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGlmICh0aGlzLnRlc3RzW2ldKSB7XHJcbiAgICAgICAgdmFyIGogPSB0aGlzLnNlZWtOZXh0KGkpXHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLmJ1ZmZlcltpXVxyXG4gICAgICAgIHRoaXMuYnVmZmVyW2ldID0gY1xyXG4gICAgICAgIGlmIChqIDwgbGVuICYmIHRoaXMudGVzdHNbal0udGVzdCh0KSlcclxuICAgICAgICAgIGMgPSB0XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUudW5tYXNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC51bmJpbmQoXCIubWFza1wiKVxyXG4gICAgICAucmVtb3ZlRGF0YShcImlucHV0bWFza1wiKVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5mb2N1c0V2ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmZvY3VzVGV4dCA9IHRoaXMuJGVsZW1lbnQudmFsKClcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoIFxyXG4gICAgdmFyIHBvcyA9IHRoaXMuY2hlY2tWYWwoKVxyXG4gICAgdGhpcy53cml0ZUJ1ZmZlcigpXHJcblxyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICB2YXIgbW92ZUNhcmV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmIChwb3MgPT0gbGVuKVxyXG4gICAgICAgIHRoYXQuY2FyZXQoMCwgcG9zKVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgdGhhdC5jYXJldChwb3MpXHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUNhcmV0KClcclxuICAgIHNldFRpbWVvdXQobW92ZUNhcmV0LCA1MClcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuYmx1ckV2ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNoZWNrVmFsKClcclxuICAgIGlmICh0aGlzLiRlbGVtZW50LnZhbCgpICE9PSB0aGlzLmZvY3VzVGV4dClcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjaGFuZ2UnKVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5rZXlkb3duRXZlbnQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICB2YXIgayA9IGUud2hpY2hcclxuXHJcbiAgICAvL2JhY2tzcGFjZSwgZGVsZXRlLCBhbmQgZXNjYXBlIGdldCBzcGVjaWFsIHRyZWF0bWVudFxyXG4gICAgaWYgKGsgPT0gOCB8fCBrID09IDQ2IHx8IChpc0lwaG9uZSAmJiBrID09IDEyNykpIHtcclxuICAgICAgdmFyIHBvcyA9IHRoaXMuY2FyZXQoKSxcclxuICAgICAgYmVnaW4gPSBwb3MuYmVnaW4sXHJcbiAgICAgIGVuZCA9IHBvcy5lbmRcclxuXHJcbiAgICAgIGlmIChlbmQgLSBiZWdpbiA9PT0gMCkge1xyXG4gICAgICAgIGJlZ2luID0gayAhPSA0NiA/IHRoaXMuc2Vla1ByZXYoYmVnaW4pIDogKGVuZCA9IHRoaXMuc2Vla05leHQoYmVnaW4gLSAxKSlcclxuICAgICAgICBlbmQgPSBrID09IDQ2ID8gdGhpcy5zZWVrTmV4dChlbmQpIDogZW5kXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5jbGVhckJ1ZmZlcihiZWdpbiwgZW5kKVxyXG4gICAgICB0aGlzLnNoaWZ0TChiZWdpbiwgZW5kIC0gMSlcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfSBlbHNlIGlmIChrID09IDI3KSB7Ly9lc2NhcGVcclxuICAgICAgdGhpcy4kZWxlbWVudC52YWwodGhpcy5mb2N1c1RleHQpXHJcbiAgICAgIHRoaXMuY2FyZXQoMCwgdGhpcy5jaGVja1ZhbCgpKVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUua2V5cHJlc3NFdmVudCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoXHJcblxyXG4gICAgdmFyIGsgPSBlLndoaWNoLFxyXG4gICAgcG9zID0gdGhpcy5jYXJldCgpXHJcblxyXG4gICAgaWYgKGUuY3RybEtleSB8fCBlLmFsdEtleSB8fCBlLm1ldGFLZXkgfHwgayA8IDMyKSAgey8vSWdub3JlXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9IGVsc2UgaWYgKGspIHtcclxuICAgICAgaWYgKHBvcy5lbmQgLSBwb3MuYmVnaW4gIT09IDApIHtcclxuICAgICAgICB0aGlzLmNsZWFyQnVmZmVyKHBvcy5iZWdpbiwgcG9zLmVuZClcclxuICAgICAgICB0aGlzLnNoaWZ0TChwb3MuYmVnaW4sIHBvcy5lbmQgLSAxKVxyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgcCA9IHRoaXMuc2Vla05leHQocG9zLmJlZ2luIC0gMSlcclxuICAgICAgaWYgKHAgPCBsZW4pIHtcclxuICAgICAgICB2YXIgYyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoaylcclxuICAgICAgICBpZiAodGhpcy50ZXN0c1twXS50ZXN0KGMpKSB7XHJcbiAgICAgICAgICB0aGlzLnNoaWZ0UihwKVxyXG4gICAgICAgICAgdGhpcy5idWZmZXJbcF0gPSBjXHJcbiAgICAgICAgICB0aGlzLndyaXRlQnVmZmVyKClcclxuICAgICAgICAgIHZhciBuZXh0ID0gdGhpcy5zZWVrTmV4dChwKVxyXG4gICAgICAgICAgdGhpcy5jYXJldChuZXh0KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUucGFzdGVFdmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgdGhhdC5jYXJldCh0aGF0LmNoZWNrVmFsKHRydWUpKVxyXG4gICAgfSwgMClcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuY2xlYXJCdWZmZXIgPSBmdW5jdGlvbihzdGFydCwgZW5kKSB7XHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aFxyXG5cclxuICAgIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZCAmJiBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMudGVzdHNbaV0pXHJcbiAgICAgICAgdGhpcy5idWZmZXJbaV0gPSB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXJcclxuICAgIH1cclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUud3JpdGVCdWZmZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLiRlbGVtZW50LnZhbCh0aGlzLmJ1ZmZlci5qb2luKCcnKSkudmFsKClcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuY2hlY2tWYWwgPSBmdW5jdGlvbihhbGxvdykge1xyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGhcclxuICAgIC8vdHJ5IHRvIHBsYWNlIGNoYXJhY3RlcnMgd2hlcmUgdGhleSBiZWxvbmdcclxuICAgIHZhciB0ZXN0ID0gdGhpcy4kZWxlbWVudC52YWwoKVxyXG4gICAgdmFyIGxhc3RNYXRjaCA9IC0xXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDAsIHBvcyA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBpZiAodGhpcy50ZXN0c1tpXSkge1xyXG4gICAgICAgIHRoaXMuYnVmZmVyW2ldID0gdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyXHJcbiAgICAgICAgd2hpbGUgKHBvcysrIDwgdGVzdC5sZW5ndGgpIHtcclxuICAgICAgICAgIHZhciBjID0gdGVzdC5jaGFyQXQocG9zIC0gMSlcclxuICAgICAgICAgIGlmICh0aGlzLnRlc3RzW2ldLnRlc3QoYykpIHtcclxuICAgICAgICAgICAgdGhpcy5idWZmZXJbaV0gPSBjXHJcbiAgICAgICAgICAgIGxhc3RNYXRjaCA9IGlcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBvcyA+IHRlc3QubGVuZ3RoKVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmJ1ZmZlcltpXSA9PSB0ZXN0LmNoYXJBdChwb3MpICYmIGkgIT0gdGhpcy5wYXJ0aWFsUG9zaXRpb24pIHtcclxuICAgICAgICBwb3MrK1xyXG4gICAgICAgIGxhc3RNYXRjaCA9IGlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCFhbGxvdyAmJiBsYXN0TWF0Y2ggKyAxIDwgdGhpcy5wYXJ0aWFsUG9zaXRpb24pIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC52YWwoXCJcIilcclxuICAgICAgdGhpcy5jbGVhckJ1ZmZlcigwLCBsZW4pXHJcbiAgICB9IGVsc2UgaWYgKGFsbG93IHx8IGxhc3RNYXRjaCArIDEgPj0gdGhpcy5wYXJ0aWFsUG9zaXRpb24pIHtcclxuICAgICAgdGhpcy53cml0ZUJ1ZmZlcigpXHJcbiAgICAgIGlmICghYWxsb3cpIHRoaXMuJGVsZW1lbnQudmFsKHRoaXMuJGVsZW1lbnQudmFsKCkuc3Vic3RyaW5nKDAsIGxhc3RNYXRjaCArIDEpKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuICh0aGlzLnBhcnRpYWxQb3NpdGlvbiA/IGkgOiB0aGlzLmZpcnN0Tm9uTWFza1BvcylcclxuICB9XHJcblxyXG4gIFxyXG4gIC8vIElOUFVUTUFTSyBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5pbnB1dG1hc2tcclxuICBcclxuICAkLmZuLmlucHV0bWFzayA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSA9ICR0aGlzLmRhdGEoJ2JzLmlucHV0bWFzaycpXHJcbiAgICAgIFxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmlucHV0bWFzaycsIChkYXRhID0gbmV3IElucHV0bWFzayh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJC5mbi5pbnB1dG1hc2suQ29uc3RydWN0b3IgPSBJbnB1dG1hc2tcclxuXHJcblxyXG4gIC8vIElOUFVUTUFTSyBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uaW5wdXRtYXNrLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmlucHV0bWFzayA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBJTlBVVE1BU0sgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2ZvY3VzLmJzLmlucHV0bWFzay5kYXRhLWFwaScsICdbZGF0YS1tYXNrXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICBpZiAoJHRoaXMuZGF0YSgnYnMuaW5wdXRtYXNrJykpIHJldHVyblxyXG4gICAgJHRoaXMuaW5wdXRtYXNrKCR0aGlzLmRhdGEoKSlcclxuICB9KVxyXG5cclxufSh3aW5kb3cualF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogZmlsZWlucHV0LmpzIHYzLjEuM1xyXG4gKiBodHRwOi8vamFzbnkuZ2l0aHViLmNvbS9ib290c3RyYXAvamF2YXNjcmlwdC8jZmlsZWlucHV0XHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDEyLTIwMTQgQXJub2xkIERhbmllbHNcclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKVxyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG4rZnVuY3Rpb24gKCQpIHsgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIHZhciBpc0lFID0gd2luZG93Lm5hdmlnYXRvci5hcHBOYW1lID09ICdNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXInXHJcblxyXG4gIC8vIEZJTEVVUExPQUQgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIEZpbGVpbnB1dCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgXHJcbiAgICB0aGlzLiRpbnB1dCA9IHRoaXMuJGVsZW1lbnQuZmluZCgnOmZpbGUnKVxyXG4gICAgaWYgKHRoaXMuJGlucHV0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5uYW1lID0gdGhpcy4kaW5wdXQuYXR0cignbmFtZScpIHx8IG9wdGlvbnMubmFtZVxyXG5cclxuICAgIHRoaXMuJGhpZGRlbiA9IHRoaXMuJGVsZW1lbnQuZmluZCgnaW5wdXRbdHlwZT1oaWRkZW5dW25hbWU9XCInICsgdGhpcy5uYW1lICsgJ1wiXScpXHJcbiAgICBpZiAodGhpcy4kaGlkZGVuLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aGlzLiRoaWRkZW4gPSAkKCc8aW5wdXQgdHlwZT1cImhpZGRlblwiPicpLmluc2VydEJlZm9yZSh0aGlzLiRpbnB1dClcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRwcmV2aWV3ID0gdGhpcy4kZWxlbWVudC5maW5kKCcuZmlsZWlucHV0LXByZXZpZXcnKVxyXG4gICAgdmFyIGhlaWdodCA9IHRoaXMuJHByZXZpZXcuY3NzKCdoZWlnaHQnKVxyXG4gICAgaWYgKHRoaXMuJHByZXZpZXcuY3NzKCdkaXNwbGF5JykgIT09ICdpbmxpbmUnICYmIGhlaWdodCAhPT0gJzBweCcgJiYgaGVpZ2h0ICE9PSAnbm9uZScpIHtcclxuICAgICAgdGhpcy4kcHJldmlldy5jc3MoJ2xpbmUtaGVpZ2h0JywgaGVpZ2h0KVxyXG4gICAgfVxyXG4gICAgICAgIFxyXG4gICAgdGhpcy5vcmlnaW5hbCA9IHtcclxuICAgICAgZXhpc3RzOiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmaWxlaW5wdXQtZXhpc3RzJyksXHJcbiAgICAgIHByZXZpZXc6IHRoaXMuJHByZXZpZXcuaHRtbCgpLFxyXG4gICAgICBoaWRkZW5WYWw6IHRoaXMuJGhpZGRlbi52YWwoKVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0aGlzLmxpc3RlbigpXHJcbiAgfVxyXG4gIFxyXG4gIEZpbGVpbnB1dC5wcm90b3R5cGUubGlzdGVuID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLiRpbnB1dC5vbignY2hhbmdlLmJzLmZpbGVpbnB1dCcsICQucHJveHkodGhpcy5jaGFuZ2UsIHRoaXMpKVxyXG4gICAgJCh0aGlzLiRpbnB1dFswXS5mb3JtKS5vbigncmVzZXQuYnMuZmlsZWlucHV0JywgJC5wcm94eSh0aGlzLnJlc2V0LCB0aGlzKSlcclxuICAgIFxyXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10cmlnZ2VyPVwiZmlsZWlucHV0XCJdJykub24oJ2NsaWNrLmJzLmZpbGVpbnB1dCcsICQucHJveHkodGhpcy50cmlnZ2VyLCB0aGlzKSlcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtZGlzbWlzcz1cImZpbGVpbnB1dFwiXScpLm9uKCdjbGljay5icy5maWxlaW5wdXQnLCAkLnByb3h5KHRoaXMuY2xlYXIsIHRoaXMpKVxyXG4gIH0sXHJcblxyXG4gIEZpbGVpbnB1dC5wcm90b3R5cGUuY2hhbmdlID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdmFyIGZpbGVzID0gZS50YXJnZXQuZmlsZXMgPT09IHVuZGVmaW5lZCA/IChlLnRhcmdldCAmJiBlLnRhcmdldC52YWx1ZSA/IFt7IG5hbWU6IGUudGFyZ2V0LnZhbHVlLnJlcGxhY2UoL14uK1xcXFwvLCAnJyl9XSA6IFtdKSA6IGUudGFyZ2V0LmZpbGVzXHJcbiAgICBcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHJcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHRoaXMuY2xlYXIoKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRoaWRkZW4udmFsKCcnKVxyXG4gICAgdGhpcy4kaGlkZGVuLmF0dHIoJ25hbWUnLCAnJylcclxuICAgIHRoaXMuJGlucHV0LmF0dHIoJ25hbWUnLCB0aGlzLm5hbWUpXHJcblxyXG4gICAgdmFyIGZpbGUgPSBmaWxlc1swXVxyXG5cclxuICAgIGlmICh0aGlzLiRwcmV2aWV3Lmxlbmd0aCA+IDAgJiYgKHR5cGVvZiBmaWxlLnR5cGUgIT09IFwidW5kZWZpbmVkXCIgPyBmaWxlLnR5cGUubWF0Y2goL15pbWFnZVxcLyhnaWZ8cG5nfGpwZWcpJC8pIDogZmlsZS5uYW1lLm1hdGNoKC9cXC4oZ2lmfHBuZ3xqcGU/ZykkL2kpKSAmJiB0eXBlb2YgRmlsZVJlYWRlciAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxyXG4gICAgICB2YXIgcHJldmlldyA9IHRoaXMuJHByZXZpZXdcclxuICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50XHJcblxyXG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24ocmUpIHtcclxuICAgICAgICB2YXIgJGltZyA9ICQoJzxpbWc+JylcclxuICAgICAgICAkaW1nWzBdLnNyYyA9IHJlLnRhcmdldC5yZXN1bHRcclxuICAgICAgICBmaWxlc1swXS5yZXN1bHQgPSByZS50YXJnZXQucmVzdWx0XHJcbiAgICAgICAgXHJcbiAgICAgICAgZWxlbWVudC5maW5kKCcuZmlsZWlucHV0LWZpbGVuYW1lJykudGV4dChmaWxlLm5hbWUpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gaWYgcGFyZW50IGhhcyBtYXgtaGVpZ2h0LCB1c2luZyBgKG1heC0paGVpZ2h0OiAxMDAlYCBvbiBjaGlsZCBkb2Vzbid0IHRha2UgcGFkZGluZyBhbmQgYm9yZGVyIGludG8gYWNjb3VudFxyXG4gICAgICAgIGlmIChwcmV2aWV3LmNzcygnbWF4LWhlaWdodCcpICE9ICdub25lJykgJGltZy5jc3MoJ21heC1oZWlnaHQnLCBwYXJzZUludChwcmV2aWV3LmNzcygnbWF4LWhlaWdodCcpLCAxMCkgLSBwYXJzZUludChwcmV2aWV3LmNzcygncGFkZGluZy10b3AnKSwgMTApIC0gcGFyc2VJbnQocHJldmlldy5jc3MoJ3BhZGRpbmctYm90dG9tJyksIDEwKSAgLSBwYXJzZUludChwcmV2aWV3LmNzcygnYm9yZGVyLXRvcCcpLCAxMCkgLSBwYXJzZUludChwcmV2aWV3LmNzcygnYm9yZGVyLWJvdHRvbScpLCAxMCkpXHJcbiAgICAgICAgXHJcbiAgICAgICAgcHJldmlldy5odG1sKCRpbWcpXHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnZmlsZWlucHV0LWV4aXN0cycpLnJlbW92ZUNsYXNzKCdmaWxlaW5wdXQtbmV3JylcclxuXHJcbiAgICAgICAgZWxlbWVudC50cmlnZ2VyKCdjaGFuZ2UuYnMuZmlsZWlucHV0JywgZmlsZXMpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5maWxlaW5wdXQtZmlsZW5hbWUnKS50ZXh0KGZpbGUubmFtZSlcclxuICAgICAgdGhpcy4kcHJldmlldy50ZXh0KGZpbGUubmFtZSlcclxuICAgICAgXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2ZpbGVpbnB1dC1leGlzdHMnKS5yZW1vdmVDbGFzcygnZmlsZWlucHV0LW5ldycpXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZS5icy5maWxlaW5wdXQnKVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIEZpbGVpbnB1dC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbihlKSB7XHJcbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBcclxuICAgIHRoaXMuJGhpZGRlbi52YWwoJycpXHJcbiAgICB0aGlzLiRoaWRkZW4uYXR0cignbmFtZScsIHRoaXMubmFtZSlcclxuICAgIHRoaXMuJGlucHV0LmF0dHIoJ25hbWUnLCAnJylcclxuXHJcbiAgICAvL2llOCsgZG9lc24ndCBzdXBwb3J0IGNoYW5naW5nIHRoZSB2YWx1ZSBvZiBpbnB1dCB3aXRoIHR5cGU9ZmlsZSBzbyBjbG9uZSBpbnN0ZWFkXHJcbiAgICBpZiAoaXNJRSkgeyBcclxuICAgICAgdmFyIGlucHV0Q2xvbmUgPSB0aGlzLiRpbnB1dC5jbG9uZSh0cnVlKTtcclxuICAgICAgdGhpcy4kaW5wdXQuYWZ0ZXIoaW5wdXRDbG9uZSk7XHJcbiAgICAgIHRoaXMuJGlucHV0LnJlbW92ZSgpO1xyXG4gICAgICB0aGlzLiRpbnB1dCA9IGlucHV0Q2xvbmU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLiRpbnB1dC52YWwoJycpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kcHJldmlldy5odG1sKCcnKVxyXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCcuZmlsZWlucHV0LWZpbGVuYW1lJykudGV4dCgnJylcclxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2ZpbGVpbnB1dC1uZXcnKS5yZW1vdmVDbGFzcygnZmlsZWlucHV0LWV4aXN0cycpXHJcbiAgICBcclxuICAgIGlmIChlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhpcy4kaW5wdXQudHJpZ2dlcignY2hhbmdlJylcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbGVhci5icy5maWxlaW5wdXQnKVxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIEZpbGVpbnB1dC5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2xlYXIoKVxyXG5cclxuICAgIHRoaXMuJGhpZGRlbi52YWwodGhpcy5vcmlnaW5hbC5oaWRkZW5WYWwpXHJcbiAgICB0aGlzLiRwcmV2aWV3Lmh0bWwodGhpcy5vcmlnaW5hbC5wcmV2aWV3KVxyXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCcuZmlsZWlucHV0LWZpbGVuYW1lJykudGV4dCgnJylcclxuXHJcbiAgICBpZiAodGhpcy5vcmlnaW5hbC5leGlzdHMpIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2ZpbGVpbnB1dC1leGlzdHMnKS5yZW1vdmVDbGFzcygnZmlsZWlucHV0LW5ldycpXHJcbiAgICAgZWxzZSB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdmaWxlaW5wdXQtbmV3JykucmVtb3ZlQ2xhc3MoJ2ZpbGVpbnB1dC1leGlzdHMnKVxyXG4gICAgXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Jlc2V0LmJzLmZpbGVpbnB1dCcpXHJcbiAgfSxcclxuXHJcbiAgRmlsZWlucHV0LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdGhpcy4kaW5wdXQudHJpZ2dlcignY2xpY2snKVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgfVxyXG5cclxuICBcclxuICAvLyBGSUxFVVBMT0FEIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmZpbGVpbnB1dFxyXG4gIFxyXG4gICQuZm4uZmlsZWlucHV0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgZGF0YSA9ICR0aGlzLmRhdGEoJ2JzLmZpbGVpbnB1dCcpXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuZmlsZWlucHV0JywgKGRhdGEgPSBuZXcgRmlsZWlucHV0KHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbnNdKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkLmZuLmZpbGVpbnB1dC5Db25zdHJ1Y3RvciA9IEZpbGVpbnB1dFxyXG5cclxuXHJcbiAgLy8gRklMRUlOUFVUIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5maWxlaW5wdXQubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uZmlsZWlucHV0ID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEZJTEVVUExPQUQgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmZpbGVpbnB1dC5kYXRhLWFwaScsICdbZGF0YS1wcm92aWRlcz1cImZpbGVpbnB1dFwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICBpZiAoJHRoaXMuZGF0YSgnYnMuZmlsZWlucHV0JykpIHJldHVyblxyXG4gICAgJHRoaXMuZmlsZWlucHV0KCR0aGlzLmRhdGEoKSlcclxuICAgICAgXHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWRpc21pc3M9XCJmaWxlaW5wdXRcIl0sW2RhdGEtdHJpZ2dlcj1cImZpbGVpbnB1dFwiXScpO1xyXG4gICAgaWYgKCR0YXJnZXQubGVuZ3RoID4gMCkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgJHRhcmdldC50cmlnZ2VyKCdjbGljay5icy5maWxlaW5wdXQnKVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG59KHdpbmRvdy5qUXVlcnkpO1xyXG4iLCIvLyEgbW9tZW50LmpzXG4vLyEgdmVyc2lvbiA6IDIuMTcuMVxuLy8hIGF1dGhvcnMgOiBUaW0gV29vZCwgSXNrcmVuIENoZXJuZXYsIE1vbWVudC5qcyBjb250cmlidXRvcnNcbi8vISBsaWNlbnNlIDogTUlUXG4vLyEgbW9tZW50anMuY29tXG4hZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1iKCk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShiKTphLm1vbWVudD1iKCl9KHRoaXMsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBhKCl7cmV0dXJuIG9kLmFwcGx5KG51bGwsYXJndW1lbnRzKX1cbi8vIFRoaXMgaXMgZG9uZSB0byByZWdpc3RlciB0aGUgbWV0aG9kIGNhbGxlZCB3aXRoIG1vbWVudCgpXG4vLyB3aXRob3V0IGNyZWF0aW5nIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbmZ1bmN0aW9uIGIoYSl7b2Q9YX1mdW5jdGlvbiBjKGEpe3JldHVybiBhIGluc3RhbmNlb2YgQXJyYXl8fFwiW29iamVjdCBBcnJheV1cIj09PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKX1mdW5jdGlvbiBkKGEpe1xuLy8gSUU4IHdpbGwgdHJlYXQgdW5kZWZpbmVkIGFuZCBudWxsIGFzIG9iamVjdCBpZiBpdCB3YXNuJ3QgZm9yXG4vLyBpbnB1dCAhPSBudWxsXG5yZXR1cm4gbnVsbCE9YSYmXCJbb2JqZWN0IE9iamVjdF1cIj09PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKX1mdW5jdGlvbiBlKGEpe3ZhciBiO2ZvcihiIGluIGEpXG4vLyBldmVuIGlmIGl0cyBub3Qgb3duIHByb3BlcnR5IEknZCBzdGlsbCBjYWxsIGl0IG5vbi1lbXB0eVxucmV0dXJuITE7cmV0dXJuITB9ZnVuY3Rpb24gZihhKXtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgYXx8XCJbb2JqZWN0IE51bWJlcl1cIj09PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKX1mdW5jdGlvbiBnKGEpe3JldHVybiBhIGluc3RhbmNlb2YgRGF0ZXx8XCJbb2JqZWN0IERhdGVdXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSl9ZnVuY3Rpb24gaChhLGIpe3ZhciBjLGQ9W107Zm9yKGM9MDtjPGEubGVuZ3RoOysrYylkLnB1c2goYihhW2NdLGMpKTtyZXR1cm4gZH1mdW5jdGlvbiBpKGEsYil7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhLGIpfWZ1bmN0aW9uIGooYSxiKXtmb3IodmFyIGMgaW4gYilpKGIsYykmJihhW2NdPWJbY10pO3JldHVybiBpKGIsXCJ0b1N0cmluZ1wiKSYmKGEudG9TdHJpbmc9Yi50b1N0cmluZyksaShiLFwidmFsdWVPZlwiKSYmKGEudmFsdWVPZj1iLnZhbHVlT2YpLGF9ZnVuY3Rpb24gayhhLGIsYyxkKXtyZXR1cm4gcmIoYSxiLGMsZCwhMCkudXRjKCl9ZnVuY3Rpb24gbCgpe1xuLy8gV2UgbmVlZCB0byBkZWVwIGNsb25lIHRoaXMgb2JqZWN0LlxucmV0dXJue2VtcHR5OiExLHVudXNlZFRva2VuczpbXSx1bnVzZWRJbnB1dDpbXSxvdmVyZmxvdzotMixjaGFyc0xlZnRPdmVyOjAsbnVsbElucHV0OiExLGludmFsaWRNb250aDpudWxsLGludmFsaWRGb3JtYXQ6ITEsdXNlckludmFsaWRhdGVkOiExLGlzbzohMSxwYXJzZWREYXRlUGFydHM6W10sbWVyaWRpZW06bnVsbH19ZnVuY3Rpb24gbShhKXtyZXR1cm4gbnVsbD09YS5fcGYmJihhLl9wZj1sKCkpLGEuX3BmfWZ1bmN0aW9uIG4oYSl7aWYobnVsbD09YS5faXNWYWxpZCl7dmFyIGI9bShhKSxjPXFkLmNhbGwoYi5wYXJzZWREYXRlUGFydHMsZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWF9KSxkPSFpc05hTihhLl9kLmdldFRpbWUoKSkmJmIub3ZlcmZsb3c8MCYmIWIuZW1wdHkmJiFiLmludmFsaWRNb250aCYmIWIuaW52YWxpZFdlZWtkYXkmJiFiLm51bGxJbnB1dCYmIWIuaW52YWxpZEZvcm1hdCYmIWIudXNlckludmFsaWRhdGVkJiYoIWIubWVyaWRpZW18fGIubWVyaWRpZW0mJmMpO2lmKGEuX3N0cmljdCYmKGQ9ZCYmMD09PWIuY2hhcnNMZWZ0T3ZlciYmMD09PWIudW51c2VkVG9rZW5zLmxlbmd0aCYmdm9pZCAwPT09Yi5iaWdIb3VyKSxudWxsIT1PYmplY3QuaXNGcm96ZW4mJk9iamVjdC5pc0Zyb3plbihhKSlyZXR1cm4gZDthLl9pc1ZhbGlkPWR9cmV0dXJuIGEuX2lzVmFsaWR9ZnVuY3Rpb24gbyhhKXt2YXIgYj1rKE5hTik7cmV0dXJuIG51bGwhPWE/aihtKGIpLGEpOm0oYikudXNlckludmFsaWRhdGVkPSEwLGJ9ZnVuY3Rpb24gcChhKXtyZXR1cm4gdm9pZCAwPT09YX1mdW5jdGlvbiBxKGEsYil7dmFyIGMsZCxlO2lmKHAoYi5faXNBTW9tZW50T2JqZWN0KXx8KGEuX2lzQU1vbWVudE9iamVjdD1iLl9pc0FNb21lbnRPYmplY3QpLHAoYi5faSl8fChhLl9pPWIuX2kpLHAoYi5fZil8fChhLl9mPWIuX2YpLHAoYi5fbCl8fChhLl9sPWIuX2wpLHAoYi5fc3RyaWN0KXx8KGEuX3N0cmljdD1iLl9zdHJpY3QpLHAoYi5fdHptKXx8KGEuX3R6bT1iLl90em0pLHAoYi5faXNVVEMpfHwoYS5faXNVVEM9Yi5faXNVVEMpLHAoYi5fb2Zmc2V0KXx8KGEuX29mZnNldD1iLl9vZmZzZXQpLHAoYi5fcGYpfHwoYS5fcGY9bShiKSkscChiLl9sb2NhbGUpfHwoYS5fbG9jYWxlPWIuX2xvY2FsZSkscmQubGVuZ3RoPjApZm9yKGMgaW4gcmQpZD1yZFtjXSxlPWJbZF0scChlKXx8KGFbZF09ZSk7cmV0dXJuIGF9XG4vLyBNb21lbnQgcHJvdG90eXBlIG9iamVjdFxuZnVuY3Rpb24gcihiKXtxKHRoaXMsYiksdGhpcy5fZD1uZXcgRGF0ZShudWxsIT1iLl9kP2IuX2QuZ2V0VGltZSgpOk5hTiksdGhpcy5pc1ZhbGlkKCl8fCh0aGlzLl9kPW5ldyBEYXRlKE5hTikpLFxuLy8gUHJldmVudCBpbmZpbml0ZSBsb29wIGluIGNhc2UgdXBkYXRlT2Zmc2V0IGNyZWF0ZXMgbmV3IG1vbWVudFxuLy8gb2JqZWN0cy5cbnNkPT09ITEmJihzZD0hMCxhLnVwZGF0ZU9mZnNldCh0aGlzKSxzZD0hMSl9ZnVuY3Rpb24gcyhhKXtyZXR1cm4gYSBpbnN0YW5jZW9mIHJ8fG51bGwhPWEmJm51bGwhPWEuX2lzQU1vbWVudE9iamVjdH1mdW5jdGlvbiB0KGEpe3JldHVybiBhPDA/TWF0aC5jZWlsKGEpfHwwOk1hdGguZmxvb3IoYSl9ZnVuY3Rpb24gdShhKXt2YXIgYj0rYSxjPTA7cmV0dXJuIDAhPT1iJiZpc0Zpbml0ZShiKSYmKGM9dChiKSksY31cbi8vIGNvbXBhcmUgdHdvIGFycmF5cywgcmV0dXJuIHRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXNcbmZ1bmN0aW9uIHYoYSxiLGMpe3ZhciBkLGU9TWF0aC5taW4oYS5sZW5ndGgsYi5sZW5ndGgpLGY9TWF0aC5hYnMoYS5sZW5ndGgtYi5sZW5ndGgpLGc9MDtmb3IoZD0wO2Q8ZTtkKyspKGMmJmFbZF0hPT1iW2RdfHwhYyYmdShhW2RdKSE9PXUoYltkXSkpJiZnKys7cmV0dXJuIGcrZn1mdW5jdGlvbiB3KGIpe2Euc3VwcHJlc3NEZXByZWNhdGlvbldhcm5pbmdzPT09ITEmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBjb25zb2xlJiZjb25zb2xlLndhcm4mJmNvbnNvbGUud2FybihcIkRlcHJlY2F0aW9uIHdhcm5pbmc6IFwiK2IpfWZ1bmN0aW9uIHgoYixjKXt2YXIgZD0hMDtyZXR1cm4gaihmdW5jdGlvbigpe2lmKG51bGwhPWEuZGVwcmVjYXRpb25IYW5kbGVyJiZhLmRlcHJlY2F0aW9uSGFuZGxlcihudWxsLGIpLGQpe2Zvcih2YXIgZSxmPVtdLGc9MDtnPGFyZ3VtZW50cy5sZW5ndGg7ZysrKXtpZihlPVwiXCIsXCJvYmplY3RcIj09dHlwZW9mIGFyZ3VtZW50c1tnXSl7ZSs9XCJcXG5bXCIrZytcIl0gXCI7Zm9yKHZhciBoIGluIGFyZ3VtZW50c1swXSllKz1oK1wiOiBcIithcmd1bWVudHNbMF1baF0rXCIsIFwiO2U9ZS5zbGljZSgwLC0yKX1lbHNlIGU9YXJndW1lbnRzW2ddO2YucHVzaChlKX13KGIrXCJcXG5Bcmd1bWVudHM6IFwiK0FycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGYpLmpvaW4oXCJcIikrXCJcXG5cIisobmV3IEVycm9yKS5zdGFjayksZD0hMX1yZXR1cm4gYy5hcHBseSh0aGlzLGFyZ3VtZW50cyl9LGMpfWZ1bmN0aW9uIHkoYixjKXtudWxsIT1hLmRlcHJlY2F0aW9uSGFuZGxlciYmYS5kZXByZWNhdGlvbkhhbmRsZXIoYixjKSx0ZFtiXXx8KHcoYyksdGRbYl09ITApfWZ1bmN0aW9uIHooYSl7cmV0dXJuIGEgaW5zdGFuY2VvZiBGdW5jdGlvbnx8XCJbb2JqZWN0IEZ1bmN0aW9uXVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpfWZ1bmN0aW9uIEEoYSl7dmFyIGIsYztmb3IoYyBpbiBhKWI9YVtjXSx6KGIpP3RoaXNbY109Yjp0aGlzW1wiX1wiK2NdPWI7dGhpcy5fY29uZmlnPWEsXG4vLyBMZW5pZW50IG9yZGluYWwgcGFyc2luZyBhY2NlcHRzIGp1c3QgYSBudW1iZXIgaW4gYWRkaXRpb24gdG9cbi8vIG51bWJlciArIChwb3NzaWJseSkgc3R1ZmYgY29taW5nIGZyb20gX29yZGluYWxQYXJzZUxlbmllbnQuXG50aGlzLl9vcmRpbmFsUGFyc2VMZW5pZW50PW5ldyBSZWdFeHAodGhpcy5fb3JkaW5hbFBhcnNlLnNvdXJjZStcInxcIisvXFxkezEsMn0vLnNvdXJjZSl9ZnVuY3Rpb24gQihhLGIpe3ZhciBjLGU9aih7fSxhKTtmb3IoYyBpbiBiKWkoYixjKSYmKGQoYVtjXSkmJmQoYltjXSk/KGVbY109e30saihlW2NdLGFbY10pLGooZVtjXSxiW2NdKSk6bnVsbCE9YltjXT9lW2NdPWJbY106ZGVsZXRlIGVbY10pO2ZvcihjIGluIGEpaShhLGMpJiYhaShiLGMpJiZkKGFbY10pJiYoXG4vLyBtYWtlIHN1cmUgY2hhbmdlcyB0byBwcm9wZXJ0aWVzIGRvbid0IG1vZGlmeSBwYXJlbnQgY29uZmlnXG5lW2NdPWooe30sZVtjXSkpO3JldHVybiBlfWZ1bmN0aW9uIEMoYSl7bnVsbCE9YSYmdGhpcy5zZXQoYSl9ZnVuY3Rpb24gRChhLGIsYyl7dmFyIGQ9dGhpcy5fY2FsZW5kYXJbYV18fHRoaXMuX2NhbGVuZGFyLnNhbWVFbHNlO3JldHVybiB6KGQpP2QuY2FsbChiLGMpOmR9ZnVuY3Rpb24gRShhKXt2YXIgYj10aGlzLl9sb25nRGF0ZUZvcm1hdFthXSxjPXRoaXMuX2xvbmdEYXRlRm9ybWF0W2EudG9VcHBlckNhc2UoKV07cmV0dXJuIGJ8fCFjP2I6KHRoaXMuX2xvbmdEYXRlRm9ybWF0W2FdPWMucmVwbGFjZSgvTU1NTXxNTXxERHxkZGRkL2csZnVuY3Rpb24oYSl7cmV0dXJuIGEuc2xpY2UoMSl9KSx0aGlzLl9sb25nRGF0ZUZvcm1hdFthXSl9ZnVuY3Rpb24gRigpe3JldHVybiB0aGlzLl9pbnZhbGlkRGF0ZX1mdW5jdGlvbiBHKGEpe3JldHVybiB0aGlzLl9vcmRpbmFsLnJlcGxhY2UoXCIlZFwiLGEpfWZ1bmN0aW9uIEgoYSxiLGMsZCl7dmFyIGU9dGhpcy5fcmVsYXRpdmVUaW1lW2NdO3JldHVybiB6KGUpP2UoYSxiLGMsZCk6ZS5yZXBsYWNlKC8lZC9pLGEpfWZ1bmN0aW9uIEkoYSxiKXt2YXIgYz10aGlzLl9yZWxhdGl2ZVRpbWVbYT4wP1wiZnV0dXJlXCI6XCJwYXN0XCJdO3JldHVybiB6KGMpP2MoYik6Yy5yZXBsYWNlKC8lcy9pLGIpfWZ1bmN0aW9uIEooYSxiKXt2YXIgYz1hLnRvTG93ZXJDYXNlKCk7RGRbY109RGRbYytcInNcIl09RGRbYl09YX1mdW5jdGlvbiBLKGEpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBhP0RkW2FdfHxEZFthLnRvTG93ZXJDYXNlKCldOnZvaWQgMH1mdW5jdGlvbiBMKGEpe3ZhciBiLGMsZD17fTtmb3IoYyBpbiBhKWkoYSxjKSYmKGI9SyhjKSxiJiYoZFtiXT1hW2NdKSk7cmV0dXJuIGR9ZnVuY3Rpb24gTShhLGIpe0VkW2FdPWJ9ZnVuY3Rpb24gTihhKXt2YXIgYj1bXTtmb3IodmFyIGMgaW4gYSliLnB1c2goe3VuaXQ6Yyxwcmlvcml0eTpFZFtjXX0pO3JldHVybiBiLnNvcnQoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS5wcmlvcml0eS1iLnByaW9yaXR5fSksYn1mdW5jdGlvbiBPKGIsYyl7cmV0dXJuIGZ1bmN0aW9uKGQpe3JldHVybiBudWxsIT1kPyhRKHRoaXMsYixkKSxhLnVwZGF0ZU9mZnNldCh0aGlzLGMpLHRoaXMpOlAodGhpcyxiKX19ZnVuY3Rpb24gUChhLGIpe3JldHVybiBhLmlzVmFsaWQoKT9hLl9kW1wiZ2V0XCIrKGEuX2lzVVRDP1wiVVRDXCI6XCJcIikrYl0oKTpOYU59ZnVuY3Rpb24gUShhLGIsYyl7YS5pc1ZhbGlkKCkmJmEuX2RbXCJzZXRcIisoYS5faXNVVEM/XCJVVENcIjpcIlwiKStiXShjKX1cbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIFIoYSl7cmV0dXJuIGE9SyhhKSx6KHRoaXNbYV0pP3RoaXNbYV0oKTp0aGlzfWZ1bmN0aW9uIFMoYSxiKXtpZihcIm9iamVjdFwiPT10eXBlb2YgYSl7YT1MKGEpO2Zvcih2YXIgYz1OKGEpLGQ9MDtkPGMubGVuZ3RoO2QrKyl0aGlzW2NbZF0udW5pdF0oYVtjW2RdLnVuaXRdKX1lbHNlIGlmKGE9SyhhKSx6KHRoaXNbYV0pKXJldHVybiB0aGlzW2FdKGIpO3JldHVybiB0aGlzfWZ1bmN0aW9uIFQoYSxiLGMpe3ZhciBkPVwiXCIrTWF0aC5hYnMoYSksZT1iLWQubGVuZ3RoLGY9YT49MDtyZXR1cm4oZj9jP1wiK1wiOlwiXCI6XCItXCIpK01hdGgucG93KDEwLE1hdGgubWF4KDAsZSkpLnRvU3RyaW5nKCkuc3Vic3RyKDEpK2R9XG4vLyB0b2tlbjogICAgJ00nXG4vLyBwYWRkZWQ6ICAgWydNTScsIDJdXG4vLyBvcmRpbmFsOiAgJ01vJ1xuLy8gY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHsgdGhpcy5tb250aCgpICsgMSB9XG5mdW5jdGlvbiBVKGEsYixjLGQpe3ZhciBlPWQ7XCJzdHJpbmdcIj09dHlwZW9mIGQmJihlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXNbZF0oKX0pLGEmJihJZFthXT1lKSxiJiYoSWRbYlswXV09ZnVuY3Rpb24oKXtyZXR1cm4gVChlLmFwcGx5KHRoaXMsYXJndW1lbnRzKSxiWzFdLGJbMl0pfSksYyYmKElkW2NdPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm9yZGluYWwoZS5hcHBseSh0aGlzLGFyZ3VtZW50cyksYSl9KX1mdW5jdGlvbiBWKGEpe3JldHVybiBhLm1hdGNoKC9cXFtbXFxzXFxTXS8pP2EucmVwbGFjZSgvXlxcW3xcXF0kL2csXCJcIik6YS5yZXBsYWNlKC9cXFxcL2csXCJcIil9ZnVuY3Rpb24gVyhhKXt2YXIgYixjLGQ9YS5tYXRjaChGZCk7Zm9yKGI9MCxjPWQubGVuZ3RoO2I8YztiKyspSWRbZFtiXV0/ZFtiXT1JZFtkW2JdXTpkW2JdPVYoZFtiXSk7cmV0dXJuIGZ1bmN0aW9uKGIpe3ZhciBlLGY9XCJcIjtmb3IoZT0wO2U8YztlKyspZis9ZFtlXWluc3RhbmNlb2YgRnVuY3Rpb24/ZFtlXS5jYWxsKGIsYSk6ZFtlXTtyZXR1cm4gZn19XG4vLyBmb3JtYXQgZGF0ZSB1c2luZyBuYXRpdmUgZGF0ZSBvYmplY3RcbmZ1bmN0aW9uIFgoYSxiKXtyZXR1cm4gYS5pc1ZhbGlkKCk/KGI9WShiLGEubG9jYWxlRGF0YSgpKSxIZFtiXT1IZFtiXXx8VyhiKSxIZFtiXShhKSk6YS5sb2NhbGVEYXRhKCkuaW52YWxpZERhdGUoKX1mdW5jdGlvbiBZKGEsYil7ZnVuY3Rpb24gYyhhKXtyZXR1cm4gYi5sb25nRGF0ZUZvcm1hdChhKXx8YX12YXIgZD01O2ZvcihHZC5sYXN0SW5kZXg9MDtkPj0wJiZHZC50ZXN0KGEpOylhPWEucmVwbGFjZShHZCxjKSxHZC5sYXN0SW5kZXg9MCxkLT0xO3JldHVybiBhfWZ1bmN0aW9uIFooYSxiLGMpeyRkW2FdPXooYik/YjpmdW5jdGlvbihhLGQpe3JldHVybiBhJiZjP2M6Yn19ZnVuY3Rpb24gJChhLGIpe3JldHVybiBpKCRkLGEpPyRkW2FdKGIuX3N0cmljdCxiLl9sb2NhbGUpOm5ldyBSZWdFeHAoXyhhKSl9XG4vLyBDb2RlIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNTYxNDkzL2lzLXRoZXJlLWEtcmVnZXhwLWVzY2FwZS1mdW5jdGlvbi1pbi1qYXZhc2NyaXB0XG5mdW5jdGlvbiBfKGEpe3JldHVybiBhYShhLnJlcGxhY2UoXCJcXFxcXCIsXCJcIikucmVwbGFjZSgvXFxcXChcXFspfFxcXFwoXFxdKXxcXFsoW15cXF1cXFtdKilcXF18XFxcXCguKS9nLGZ1bmN0aW9uKGEsYixjLGQsZSl7cmV0dXJuIGJ8fGN8fGR8fGV9KSl9ZnVuY3Rpb24gYWEoYSl7cmV0dXJuIGEucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLFwiXFxcXCQmXCIpfWZ1bmN0aW9uIGJhKGEsYil7dmFyIGMsZD1iO2ZvcihcInN0cmluZ1wiPT10eXBlb2YgYSYmKGE9W2FdKSxmKGIpJiYoZD1mdW5jdGlvbihhLGMpe2NbYl09dShhKX0pLGM9MDtjPGEubGVuZ3RoO2MrKylfZFthW2NdXT1kfWZ1bmN0aW9uIGNhKGEsYil7YmEoYSxmdW5jdGlvbihhLGMsZCxlKXtkLl93PWQuX3d8fHt9LGIoYSxkLl93LGQsZSl9KX1mdW5jdGlvbiBkYShhLGIsYyl7bnVsbCE9YiYmaShfZCxhKSYmX2RbYV0oYixjLl9hLGMsYSl9ZnVuY3Rpb24gZWEoYSxiKXtyZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoYSxiKzEsMCkpLmdldFVUQ0RhdGUoKX1mdW5jdGlvbiBmYShhLGIpe3JldHVybiBhP2ModGhpcy5fbW9udGhzKT90aGlzLl9tb250aHNbYS5tb250aCgpXTp0aGlzLl9tb250aHNbKHRoaXMuX21vbnRocy5pc0Zvcm1hdHx8a2UpLnRlc3QoYik/XCJmb3JtYXRcIjpcInN0YW5kYWxvbmVcIl1bYS5tb250aCgpXTp0aGlzLl9tb250aHN9ZnVuY3Rpb24gZ2EoYSxiKXtyZXR1cm4gYT9jKHRoaXMuX21vbnRoc1Nob3J0KT90aGlzLl9tb250aHNTaG9ydFthLm1vbnRoKCldOnRoaXMuX21vbnRoc1Nob3J0W2tlLnRlc3QoYik/XCJmb3JtYXRcIjpcInN0YW5kYWxvbmVcIl1bYS5tb250aCgpXTp0aGlzLl9tb250aHNTaG9ydH1mdW5jdGlvbiBoYShhLGIsYyl7dmFyIGQsZSxmLGc9YS50b0xvY2FsZUxvd2VyQ2FzZSgpO2lmKCF0aGlzLl9tb250aHNQYXJzZSlmb3IoXG4vLyB0aGlzIGlzIG5vdCB1c2VkXG50aGlzLl9tb250aHNQYXJzZT1bXSx0aGlzLl9sb25nTW9udGhzUGFyc2U9W10sdGhpcy5fc2hvcnRNb250aHNQYXJzZT1bXSxkPTA7ZDwxMjsrK2QpZj1rKFsyZTMsZF0pLHRoaXMuX3Nob3J0TW9udGhzUGFyc2VbZF09dGhpcy5tb250aHNTaG9ydChmLFwiXCIpLnRvTG9jYWxlTG93ZXJDYXNlKCksdGhpcy5fbG9uZ01vbnRoc1BhcnNlW2RdPXRoaXMubW9udGhzKGYsXCJcIikudG9Mb2NhbGVMb3dlckNhc2UoKTtyZXR1cm4gYz9cIk1NTVwiPT09Yj8oZT1qZS5jYWxsKHRoaXMuX3Nob3J0TW9udGhzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCk6KGU9amUuY2FsbCh0aGlzLl9sb25nTW9udGhzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCk6XCJNTU1cIj09PWI/KGU9amUuY2FsbCh0aGlzLl9zaG9ydE1vbnRoc1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fbG9uZ01vbnRoc1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpKTooZT1qZS5jYWxsKHRoaXMuX2xvbmdNb250aHNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX3Nob3J0TW9udGhzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCkpfWZ1bmN0aW9uIGlhKGEsYixjKXt2YXIgZCxlLGY7aWYodGhpcy5fbW9udGhzUGFyc2VFeGFjdClyZXR1cm4gaGEuY2FsbCh0aGlzLGEsYixjKTtcbi8vIFRPRE86IGFkZCBzb3J0aW5nXG4vLyBTb3J0aW5nIG1ha2VzIHN1cmUgaWYgb25lIG1vbnRoIChvciBhYmJyKSBpcyBhIHByZWZpeCBvZiBhbm90aGVyXG4vLyBzZWUgc29ydGluZyBpbiBjb21wdXRlTW9udGhzUGFyc2VcbmZvcih0aGlzLl9tb250aHNQYXJzZXx8KHRoaXMuX21vbnRoc1BhcnNlPVtdLHRoaXMuX2xvbmdNb250aHNQYXJzZT1bXSx0aGlzLl9zaG9ydE1vbnRoc1BhcnNlPVtdKSxkPTA7ZDwxMjtkKyspe1xuLy8gdGVzdCB0aGUgcmVnZXhcbmlmKFxuLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG5lPWsoWzJlMyxkXSksYyYmIXRoaXMuX2xvbmdNb250aHNQYXJzZVtkXSYmKHRoaXMuX2xvbmdNb250aHNQYXJzZVtkXT1uZXcgUmVnRXhwKFwiXlwiK3RoaXMubW9udGhzKGUsXCJcIikucmVwbGFjZShcIi5cIixcIlwiKStcIiRcIixcImlcIiksdGhpcy5fc2hvcnRNb250aHNQYXJzZVtkXT1uZXcgUmVnRXhwKFwiXlwiK3RoaXMubW9udGhzU2hvcnQoZSxcIlwiKS5yZXBsYWNlKFwiLlwiLFwiXCIpK1wiJFwiLFwiaVwiKSksY3x8dGhpcy5fbW9udGhzUGFyc2VbZF18fChmPVwiXlwiK3RoaXMubW9udGhzKGUsXCJcIikrXCJ8XlwiK3RoaXMubW9udGhzU2hvcnQoZSxcIlwiKSx0aGlzLl9tb250aHNQYXJzZVtkXT1uZXcgUmVnRXhwKGYucmVwbGFjZShcIi5cIixcIlwiKSxcImlcIikpLGMmJlwiTU1NTVwiPT09YiYmdGhpcy5fbG9uZ01vbnRoc1BhcnNlW2RdLnRlc3QoYSkpcmV0dXJuIGQ7aWYoYyYmXCJNTU1cIj09PWImJnRoaXMuX3Nob3J0TW9udGhzUGFyc2VbZF0udGVzdChhKSlyZXR1cm4gZDtpZighYyYmdGhpcy5fbW9udGhzUGFyc2VbZF0udGVzdChhKSlyZXR1cm4gZH19XG4vLyBNT01FTlRTXG5mdW5jdGlvbiBqYShhLGIpe3ZhciBjO2lmKCFhLmlzVmFsaWQoKSlcbi8vIE5vIG9wXG5yZXR1cm4gYTtpZihcInN0cmluZ1wiPT10eXBlb2YgYilpZigvXlxcZCskLy50ZXN0KGIpKWI9dShiKTtlbHNlXG4vLyBUT0RPOiBBbm90aGVyIHNpbGVudCBmYWlsdXJlP1xuaWYoYj1hLmxvY2FsZURhdGEoKS5tb250aHNQYXJzZShiKSwhZihiKSlyZXR1cm4gYTtyZXR1cm4gYz1NYXRoLm1pbihhLmRhdGUoKSxlYShhLnllYXIoKSxiKSksYS5fZFtcInNldFwiKyhhLl9pc1VUQz9cIlVUQ1wiOlwiXCIpK1wiTW9udGhcIl0oYixjKSxhfWZ1bmN0aW9uIGthKGIpe3JldHVybiBudWxsIT1iPyhqYSh0aGlzLGIpLGEudXBkYXRlT2Zmc2V0KHRoaXMsITApLHRoaXMpOlAodGhpcyxcIk1vbnRoXCIpfWZ1bmN0aW9uIGxhKCl7cmV0dXJuIGVhKHRoaXMueWVhcigpLHRoaXMubW9udGgoKSl9ZnVuY3Rpb24gbWEoYSl7cmV0dXJuIHRoaXMuX21vbnRoc1BhcnNlRXhhY3Q/KGkodGhpcyxcIl9tb250aHNSZWdleFwiKXx8b2EuY2FsbCh0aGlzKSxhP3RoaXMuX21vbnRoc1Nob3J0U3RyaWN0UmVnZXg6dGhpcy5fbW9udGhzU2hvcnRSZWdleCk6KGkodGhpcyxcIl9tb250aHNTaG9ydFJlZ2V4XCIpfHwodGhpcy5fbW9udGhzU2hvcnRSZWdleD1uZSksdGhpcy5fbW9udGhzU2hvcnRTdHJpY3RSZWdleCYmYT90aGlzLl9tb250aHNTaG9ydFN0cmljdFJlZ2V4OnRoaXMuX21vbnRoc1Nob3J0UmVnZXgpfWZ1bmN0aW9uIG5hKGEpe3JldHVybiB0aGlzLl9tb250aHNQYXJzZUV4YWN0PyhpKHRoaXMsXCJfbW9udGhzUmVnZXhcIil8fG9hLmNhbGwodGhpcyksYT90aGlzLl9tb250aHNTdHJpY3RSZWdleDp0aGlzLl9tb250aHNSZWdleCk6KGkodGhpcyxcIl9tb250aHNSZWdleFwiKXx8KHRoaXMuX21vbnRoc1JlZ2V4PW9lKSx0aGlzLl9tb250aHNTdHJpY3RSZWdleCYmYT90aGlzLl9tb250aHNTdHJpY3RSZWdleDp0aGlzLl9tb250aHNSZWdleCl9ZnVuY3Rpb24gb2EoKXtmdW5jdGlvbiBhKGEsYil7cmV0dXJuIGIubGVuZ3RoLWEubGVuZ3RofXZhciBiLGMsZD1bXSxlPVtdLGY9W107Zm9yKGI9MDtiPDEyO2IrKylcbi8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuYz1rKFsyZTMsYl0pLGQucHVzaCh0aGlzLm1vbnRoc1Nob3J0KGMsXCJcIikpLGUucHVzaCh0aGlzLm1vbnRocyhjLFwiXCIpKSxmLnB1c2godGhpcy5tb250aHMoYyxcIlwiKSksZi5wdXNoKHRoaXMubW9udGhzU2hvcnQoYyxcIlwiKSk7Zm9yKFxuLy8gU29ydGluZyBtYWtlcyBzdXJlIGlmIG9uZSBtb250aCAob3IgYWJicikgaXMgYSBwcmVmaXggb2YgYW5vdGhlciBpdFxuLy8gd2lsbCBtYXRjaCB0aGUgbG9uZ2VyIHBpZWNlLlxuZC5zb3J0KGEpLGUuc29ydChhKSxmLnNvcnQoYSksYj0wO2I8MTI7YisrKWRbYl09YWEoZFtiXSksZVtiXT1hYShlW2JdKTtmb3IoYj0wO2I8MjQ7YisrKWZbYl09YWEoZltiXSk7dGhpcy5fbW9udGhzUmVnZXg9bmV3IFJlZ0V4cChcIl4oXCIrZi5qb2luKFwifFwiKStcIilcIixcImlcIiksdGhpcy5fbW9udGhzU2hvcnRSZWdleD10aGlzLl9tb250aHNSZWdleCx0aGlzLl9tb250aHNTdHJpY3RSZWdleD1uZXcgUmVnRXhwKFwiXihcIitlLmpvaW4oXCJ8XCIpK1wiKVwiLFwiaVwiKSx0aGlzLl9tb250aHNTaG9ydFN0cmljdFJlZ2V4PW5ldyBSZWdFeHAoXCJeKFwiK2Quam9pbihcInxcIikrXCIpXCIsXCJpXCIpfVxuLy8gSEVMUEVSU1xuZnVuY3Rpb24gcGEoYSl7cmV0dXJuIHFhKGEpPzM2NjozNjV9ZnVuY3Rpb24gcWEoYSl7cmV0dXJuIGElND09PTAmJmElMTAwIT09MHx8YSU0MDA9PT0wfWZ1bmN0aW9uIHJhKCl7cmV0dXJuIHFhKHRoaXMueWVhcigpKX1mdW5jdGlvbiBzYShhLGIsYyxkLGUsZixnKXtcbi8vY2FuJ3QganVzdCBhcHBseSgpIHRvIGNyZWF0ZSBhIGRhdGU6XG4vL2h0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTgxMzQ4L2luc3RhbnRpYXRpbmctYS1qYXZhc2NyaXB0LW9iamVjdC1ieS1jYWxsaW5nLXByb3RvdHlwZS1jb25zdHJ1Y3Rvci1hcHBseVxudmFyIGg9bmV3IERhdGUoYSxiLGMsZCxlLGYsZyk7XG4vL3RoZSBkYXRlIGNvbnN0cnVjdG9yIHJlbWFwcyB5ZWFycyAwLTk5IHRvIDE5MDAtMTk5OVxucmV0dXJuIGE8MTAwJiZhPj0wJiZpc0Zpbml0ZShoLmdldEZ1bGxZZWFyKCkpJiZoLnNldEZ1bGxZZWFyKGEpLGh9ZnVuY3Rpb24gdGEoYSl7dmFyIGI9bmV3IERhdGUoRGF0ZS5VVEMuYXBwbHkobnVsbCxhcmd1bWVudHMpKTtcbi8vdGhlIERhdGUuVVRDIGZ1bmN0aW9uIHJlbWFwcyB5ZWFycyAwLTk5IHRvIDE5MDAtMTk5OVxucmV0dXJuIGE8MTAwJiZhPj0wJiZpc0Zpbml0ZShiLmdldFVUQ0Z1bGxZZWFyKCkpJiZiLnNldFVUQ0Z1bGxZZWFyKGEpLGJ9XG4vLyBzdGFydC1vZi1maXJzdC13ZWVrIC0gc3RhcnQtb2YteWVhclxuZnVuY3Rpb24gdWEoYSxiLGMpe3Zhci8vIGZpcnN0LXdlZWsgZGF5IC0tIHdoaWNoIGphbnVhcnkgaXMgYWx3YXlzIGluIHRoZSBmaXJzdCB3ZWVrICg0IGZvciBpc28sIDEgZm9yIG90aGVyKVxuZD03K2ItYyxcbi8vIGZpcnN0LXdlZWsgZGF5IGxvY2FsIHdlZWtkYXkgLS0gd2hpY2ggbG9jYWwgd2Vla2RheSBpcyBmd2RcbmU9KDcrdGEoYSwwLGQpLmdldFVUQ0RheSgpLWIpJTc7cmV0dXJuLWUrZC0xfVxuLy9odHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGUjQ2FsY3VsYXRpbmdfYV9kYXRlX2dpdmVuX3RoZV95ZWFyLjJDX3dlZWtfbnVtYmVyX2FuZF93ZWVrZGF5XG5mdW5jdGlvbiB2YShhLGIsYyxkLGUpe3ZhciBmLGcsaD0oNytjLWQpJTcsaT11YShhLGQsZSksaj0xKzcqKGItMSkraCtpO3JldHVybiBqPD0wPyhmPWEtMSxnPXBhKGYpK2opOmo+cGEoYSk/KGY9YSsxLGc9ai1wYShhKSk6KGY9YSxnPWopLHt5ZWFyOmYsZGF5T2ZZZWFyOmd9fWZ1bmN0aW9uIHdhKGEsYixjKXt2YXIgZCxlLGY9dWEoYS55ZWFyKCksYixjKSxnPU1hdGguZmxvb3IoKGEuZGF5T2ZZZWFyKCktZi0xKS83KSsxO3JldHVybiBnPDE/KGU9YS55ZWFyKCktMSxkPWcreGEoZSxiLGMpKTpnPnhhKGEueWVhcigpLGIsYyk/KGQ9Zy14YShhLnllYXIoKSxiLGMpLGU9YS55ZWFyKCkrMSk6KGU9YS55ZWFyKCksZD1nKSx7d2VlazpkLHllYXI6ZX19ZnVuY3Rpb24geGEoYSxiLGMpe3ZhciBkPXVhKGEsYixjKSxlPXVhKGErMSxiLGMpO3JldHVybihwYShhKS1kK2UpLzd9XG4vLyBIRUxQRVJTXG4vLyBMT0NBTEVTXG5mdW5jdGlvbiB5YShhKXtyZXR1cm4gd2EoYSx0aGlzLl93ZWVrLmRvdyx0aGlzLl93ZWVrLmRveSkud2Vla31mdW5jdGlvbiB6YSgpe3JldHVybiB0aGlzLl93ZWVrLmRvd31mdW5jdGlvbiBBYSgpe3JldHVybiB0aGlzLl93ZWVrLmRveX1cbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIEJhKGEpe3ZhciBiPXRoaXMubG9jYWxlRGF0YSgpLndlZWsodGhpcyk7cmV0dXJuIG51bGw9PWE/Yjp0aGlzLmFkZCg3KihhLWIpLFwiZFwiKX1mdW5jdGlvbiBDYShhKXt2YXIgYj13YSh0aGlzLDEsNCkud2VlaztyZXR1cm4gbnVsbD09YT9iOnRoaXMuYWRkKDcqKGEtYiksXCJkXCIpfVxuLy8gSEVMUEVSU1xuZnVuY3Rpb24gRGEoYSxiKXtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgYT9hOmlzTmFOKGEpPyhhPWIud2Vla2RheXNQYXJzZShhKSxcIm51bWJlclwiPT10eXBlb2YgYT9hOm51bGwpOnBhcnNlSW50KGEsMTApfWZ1bmN0aW9uIEVhKGEsYil7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGE/Yi53ZWVrZGF5c1BhcnNlKGEpJTd8fDc6aXNOYU4oYSk/bnVsbDphfWZ1bmN0aW9uIEZhKGEsYil7cmV0dXJuIGE/Yyh0aGlzLl93ZWVrZGF5cyk/dGhpcy5fd2Vla2RheXNbYS5kYXkoKV06dGhpcy5fd2Vla2RheXNbdGhpcy5fd2Vla2RheXMuaXNGb3JtYXQudGVzdChiKT9cImZvcm1hdFwiOlwic3RhbmRhbG9uZVwiXVthLmRheSgpXTp0aGlzLl93ZWVrZGF5c31mdW5jdGlvbiBHYShhKXtyZXR1cm4gYT90aGlzLl93ZWVrZGF5c1Nob3J0W2EuZGF5KCldOnRoaXMuX3dlZWtkYXlzU2hvcnR9ZnVuY3Rpb24gSGEoYSl7cmV0dXJuIGE/dGhpcy5fd2Vla2RheXNNaW5bYS5kYXkoKV06dGhpcy5fd2Vla2RheXNNaW59ZnVuY3Rpb24gSWEoYSxiLGMpe3ZhciBkLGUsZixnPWEudG9Mb2NhbGVMb3dlckNhc2UoKTtpZighdGhpcy5fd2Vla2RheXNQYXJzZSlmb3IodGhpcy5fd2Vla2RheXNQYXJzZT1bXSx0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2U9W10sdGhpcy5fbWluV2Vla2RheXNQYXJzZT1bXSxkPTA7ZDw3OysrZClmPWsoWzJlMywxXSkuZGF5KGQpLHRoaXMuX21pbldlZWtkYXlzUGFyc2VbZF09dGhpcy53ZWVrZGF5c01pbihmLFwiXCIpLnRvTG9jYWxlTG93ZXJDYXNlKCksdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlW2RdPXRoaXMud2Vla2RheXNTaG9ydChmLFwiXCIpLnRvTG9jYWxlTG93ZXJDYXNlKCksdGhpcy5fd2Vla2RheXNQYXJzZVtkXT10aGlzLndlZWtkYXlzKGYsXCJcIikudG9Mb2NhbGVMb3dlckNhc2UoKTtyZXR1cm4gYz9cImRkZGRcIj09PWI/KGU9amUuY2FsbCh0aGlzLl93ZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpOlwiZGRkXCI9PT1iPyhlPWplLmNhbGwodGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpOihlPWplLmNhbGwodGhpcy5fbWluV2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKTpcImRkZGRcIj09PWI/KGU9amUuY2FsbCh0aGlzLl93ZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fbWluV2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKSkpOlwiZGRkXCI9PT1iPyhlPWplLmNhbGwodGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fd2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX21pbldlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCkpKTooZT1qZS5jYWxsKHRoaXMuX21pbldlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl93ZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpKSl9ZnVuY3Rpb24gSmEoYSxiLGMpe3ZhciBkLGUsZjtpZih0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3QpcmV0dXJuIElhLmNhbGwodGhpcyxhLGIsYyk7Zm9yKHRoaXMuX3dlZWtkYXlzUGFyc2V8fCh0aGlzLl93ZWVrZGF5c1BhcnNlPVtdLHRoaXMuX21pbldlZWtkYXlzUGFyc2U9W10sdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlPVtdLHRoaXMuX2Z1bGxXZWVrZGF5c1BhcnNlPVtdKSxkPTA7ZDw3O2QrKyl7XG4vLyB0ZXN0IHRoZSByZWdleFxuaWYoXG4vLyBtYWtlIHRoZSByZWdleCBpZiB3ZSBkb24ndCBoYXZlIGl0IGFscmVhZHlcbmU9ayhbMmUzLDFdKS5kYXkoZCksYyYmIXRoaXMuX2Z1bGxXZWVrZGF5c1BhcnNlW2RdJiYodGhpcy5fZnVsbFdlZWtkYXlzUGFyc2VbZF09bmV3IFJlZ0V4cChcIl5cIit0aGlzLndlZWtkYXlzKGUsXCJcIikucmVwbGFjZShcIi5cIixcIi4/XCIpK1wiJFwiLFwiaVwiKSx0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2VbZF09bmV3IFJlZ0V4cChcIl5cIit0aGlzLndlZWtkYXlzU2hvcnQoZSxcIlwiKS5yZXBsYWNlKFwiLlwiLFwiLj9cIikrXCIkXCIsXCJpXCIpLHRoaXMuX21pbldlZWtkYXlzUGFyc2VbZF09bmV3IFJlZ0V4cChcIl5cIit0aGlzLndlZWtkYXlzTWluKGUsXCJcIikucmVwbGFjZShcIi5cIixcIi4/XCIpK1wiJFwiLFwiaVwiKSksdGhpcy5fd2Vla2RheXNQYXJzZVtkXXx8KGY9XCJeXCIrdGhpcy53ZWVrZGF5cyhlLFwiXCIpK1wifF5cIit0aGlzLndlZWtkYXlzU2hvcnQoZSxcIlwiKStcInxeXCIrdGhpcy53ZWVrZGF5c01pbihlLFwiXCIpLHRoaXMuX3dlZWtkYXlzUGFyc2VbZF09bmV3IFJlZ0V4cChmLnJlcGxhY2UoXCIuXCIsXCJcIiksXCJpXCIpKSxjJiZcImRkZGRcIj09PWImJnRoaXMuX2Z1bGxXZWVrZGF5c1BhcnNlW2RdLnRlc3QoYSkpcmV0dXJuIGQ7aWYoYyYmXCJkZGRcIj09PWImJnRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZVtkXS50ZXN0KGEpKXJldHVybiBkO2lmKGMmJlwiZGRcIj09PWImJnRoaXMuX21pbldlZWtkYXlzUGFyc2VbZF0udGVzdChhKSlyZXR1cm4gZDtpZighYyYmdGhpcy5fd2Vla2RheXNQYXJzZVtkXS50ZXN0KGEpKXJldHVybiBkfX1cbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIEthKGEpe2lmKCF0aGlzLmlzVmFsaWQoKSlyZXR1cm4gbnVsbCE9YT90aGlzOk5hTjt2YXIgYj10aGlzLl9pc1VUQz90aGlzLl9kLmdldFVUQ0RheSgpOnRoaXMuX2QuZ2V0RGF5KCk7cmV0dXJuIG51bGwhPWE/KGE9RGEoYSx0aGlzLmxvY2FsZURhdGEoKSksdGhpcy5hZGQoYS1iLFwiZFwiKSk6Yn1mdW5jdGlvbiBMYShhKXtpZighdGhpcy5pc1ZhbGlkKCkpcmV0dXJuIG51bGwhPWE/dGhpczpOYU47dmFyIGI9KHRoaXMuZGF5KCkrNy10aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3cpJTc7cmV0dXJuIG51bGw9PWE/Yjp0aGlzLmFkZChhLWIsXCJkXCIpfWZ1bmN0aW9uIE1hKGEpe2lmKCF0aGlzLmlzVmFsaWQoKSlyZXR1cm4gbnVsbCE9YT90aGlzOk5hTjtcbi8vIGJlaGF2ZXMgdGhlIHNhbWUgYXMgbW9tZW50I2RheSBleGNlcHRcbi8vIGFzIGEgZ2V0dGVyLCByZXR1cm5zIDcgaW5zdGVhZCBvZiAwICgxLTcgcmFuZ2UgaW5zdGVhZCBvZiAwLTYpXG4vLyBhcyBhIHNldHRlciwgc3VuZGF5IHNob3VsZCBiZWxvbmcgdG8gdGhlIHByZXZpb3VzIHdlZWsuXG5pZihudWxsIT1hKXt2YXIgYj1FYShhLHRoaXMubG9jYWxlRGF0YSgpKTtyZXR1cm4gdGhpcy5kYXkodGhpcy5kYXkoKSU3P2I6Yi03KX1yZXR1cm4gdGhpcy5kYXkoKXx8N31mdW5jdGlvbiBOYShhKXtyZXR1cm4gdGhpcy5fd2Vla2RheXNQYXJzZUV4YWN0PyhpKHRoaXMsXCJfd2Vla2RheXNSZWdleFwiKXx8UWEuY2FsbCh0aGlzKSxhP3RoaXMuX3dlZWtkYXlzU3RyaWN0UmVnZXg6dGhpcy5fd2Vla2RheXNSZWdleCk6KGkodGhpcyxcIl93ZWVrZGF5c1JlZ2V4XCIpfHwodGhpcy5fd2Vla2RheXNSZWdleD11ZSksdGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleCYmYT90aGlzLl93ZWVrZGF5c1N0cmljdFJlZ2V4OnRoaXMuX3dlZWtkYXlzUmVnZXgpfWZ1bmN0aW9uIE9hKGEpe3JldHVybiB0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3Q/KGkodGhpcyxcIl93ZWVrZGF5c1JlZ2V4XCIpfHxRYS5jYWxsKHRoaXMpLGE/dGhpcy5fd2Vla2RheXNTaG9ydFN0cmljdFJlZ2V4OnRoaXMuX3dlZWtkYXlzU2hvcnRSZWdleCk6KGkodGhpcyxcIl93ZWVrZGF5c1Nob3J0UmVnZXhcIil8fCh0aGlzLl93ZWVrZGF5c1Nob3J0UmVnZXg9dmUpLHRoaXMuX3dlZWtkYXlzU2hvcnRTdHJpY3RSZWdleCYmYT90aGlzLl93ZWVrZGF5c1Nob3J0U3RyaWN0UmVnZXg6dGhpcy5fd2Vla2RheXNTaG9ydFJlZ2V4KX1mdW5jdGlvbiBQYShhKXtyZXR1cm4gdGhpcy5fd2Vla2RheXNQYXJzZUV4YWN0PyhpKHRoaXMsXCJfd2Vla2RheXNSZWdleFwiKXx8UWEuY2FsbCh0aGlzKSxhP3RoaXMuX3dlZWtkYXlzTWluU3RyaWN0UmVnZXg6dGhpcy5fd2Vla2RheXNNaW5SZWdleCk6KGkodGhpcyxcIl93ZWVrZGF5c01pblJlZ2V4XCIpfHwodGhpcy5fd2Vla2RheXNNaW5SZWdleD13ZSksdGhpcy5fd2Vla2RheXNNaW5TdHJpY3RSZWdleCYmYT90aGlzLl93ZWVrZGF5c01pblN0cmljdFJlZ2V4OnRoaXMuX3dlZWtkYXlzTWluUmVnZXgpfWZ1bmN0aW9uIFFhKCl7ZnVuY3Rpb24gYShhLGIpe3JldHVybiBiLmxlbmd0aC1hLmxlbmd0aH12YXIgYixjLGQsZSxmLGc9W10saD1bXSxpPVtdLGo9W107Zm9yKGI9MDtiPDc7YisrKVxuLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG5jPWsoWzJlMywxXSkuZGF5KGIpLGQ9dGhpcy53ZWVrZGF5c01pbihjLFwiXCIpLGU9dGhpcy53ZWVrZGF5c1Nob3J0KGMsXCJcIiksZj10aGlzLndlZWtkYXlzKGMsXCJcIiksZy5wdXNoKGQpLGgucHVzaChlKSxpLnB1c2goZiksai5wdXNoKGQpLGoucHVzaChlKSxqLnB1c2goZik7Zm9yKFxuLy8gU29ydGluZyBtYWtlcyBzdXJlIGlmIG9uZSB3ZWVrZGF5IChvciBhYmJyKSBpcyBhIHByZWZpeCBvZiBhbm90aGVyIGl0XG4vLyB3aWxsIG1hdGNoIHRoZSBsb25nZXIgcGllY2UuXG5nLnNvcnQoYSksaC5zb3J0KGEpLGkuc29ydChhKSxqLnNvcnQoYSksYj0wO2I8NztiKyspaFtiXT1hYShoW2JdKSxpW2JdPWFhKGlbYl0pLGpbYl09YWEoaltiXSk7dGhpcy5fd2Vla2RheXNSZWdleD1uZXcgUmVnRXhwKFwiXihcIitqLmpvaW4oXCJ8XCIpK1wiKVwiLFwiaVwiKSx0aGlzLl93ZWVrZGF5c1Nob3J0UmVnZXg9dGhpcy5fd2Vla2RheXNSZWdleCx0aGlzLl93ZWVrZGF5c01pblJlZ2V4PXRoaXMuX3dlZWtkYXlzUmVnZXgsdGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleD1uZXcgUmVnRXhwKFwiXihcIitpLmpvaW4oXCJ8XCIpK1wiKVwiLFwiaVwiKSx0aGlzLl93ZWVrZGF5c1Nob3J0U3RyaWN0UmVnZXg9bmV3IFJlZ0V4cChcIl4oXCIraC5qb2luKFwifFwiKStcIilcIixcImlcIiksdGhpcy5fd2Vla2RheXNNaW5TdHJpY3RSZWdleD1uZXcgUmVnRXhwKFwiXihcIitnLmpvaW4oXCJ8XCIpK1wiKVwiLFwiaVwiKX1cbi8vIEZPUk1BVFRJTkdcbmZ1bmN0aW9uIFJhKCl7cmV0dXJuIHRoaXMuaG91cnMoKSUxMnx8MTJ9ZnVuY3Rpb24gU2EoKXtyZXR1cm4gdGhpcy5ob3VycygpfHwyNH1mdW5jdGlvbiBUYShhLGIpe1UoYSwwLDAsZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubWVyaWRpZW0odGhpcy5ob3VycygpLHRoaXMubWludXRlcygpLGIpfSl9XG4vLyBQQVJTSU5HXG5mdW5jdGlvbiBVYShhLGIpe3JldHVybiBiLl9tZXJpZGllbVBhcnNlfVxuLy8gTE9DQUxFU1xuZnVuY3Rpb24gVmEoYSl7XG4vLyBJRTggUXVpcmtzIE1vZGUgJiBJRTcgU3RhbmRhcmRzIE1vZGUgZG8gbm90IGFsbG93IGFjY2Vzc2luZyBzdHJpbmdzIGxpa2UgYXJyYXlzXG4vLyBVc2luZyBjaGFyQXQgc2hvdWxkIGJlIG1vcmUgY29tcGF0aWJsZS5cbnJldHVyblwicFwiPT09KGErXCJcIikudG9Mb3dlckNhc2UoKS5jaGFyQXQoMCl9ZnVuY3Rpb24gV2EoYSxiLGMpe3JldHVybiBhPjExP2M/XCJwbVwiOlwiUE1cIjpjP1wiYW1cIjpcIkFNXCJ9ZnVuY3Rpb24gWGEoYSl7cmV0dXJuIGE/YS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoXCJfXCIsXCItXCIpOmF9XG4vLyBwaWNrIHRoZSBsb2NhbGUgZnJvbSB0aGUgYXJyYXlcbi8vIHRyeSBbJ2VuLWF1JywgJ2VuLWdiJ10gYXMgJ2VuLWF1JywgJ2VuLWdiJywgJ2VuJywgYXMgaW4gbW92ZSB0aHJvdWdoIHRoZSBsaXN0IHRyeWluZyBlYWNoXG4vLyBzdWJzdHJpbmcgZnJvbSBtb3N0IHNwZWNpZmljIHRvIGxlYXN0LCBidXQgbW92ZSB0byB0aGUgbmV4dCBhcnJheSBpdGVtIGlmIGl0J3MgYSBtb3JlIHNwZWNpZmljIHZhcmlhbnQgdGhhbiB0aGUgY3VycmVudCByb290XG5mdW5jdGlvbiBZYShhKXtmb3IodmFyIGIsYyxkLGUsZj0wO2Y8YS5sZW5ndGg7KXtmb3IoZT1YYShhW2ZdKS5zcGxpdChcIi1cIiksYj1lLmxlbmd0aCxjPVhhKGFbZisxXSksYz1jP2Muc3BsaXQoXCItXCIpOm51bGw7Yj4wOyl7aWYoZD1aYShlLnNsaWNlKDAsYikuam9pbihcIi1cIikpKXJldHVybiBkO2lmKGMmJmMubGVuZ3RoPj1iJiZ2KGUsYywhMCk+PWItMSlcbi8vdGhlIG5leHQgYXJyYXkgaXRlbSBpcyBiZXR0ZXIgdGhhbiBhIHNoYWxsb3dlciBzdWJzdHJpbmcgb2YgdGhpcyBvbmVcbmJyZWFrO2ItLX1mKyt9cmV0dXJuIG51bGx9ZnVuY3Rpb24gWmEoYSl7dmFyIGI9bnVsbDtcbi8vIFRPRE86IEZpbmQgYSBiZXR0ZXIgd2F5IHRvIHJlZ2lzdGVyIGFuZCBsb2FkIGFsbCB0aGUgbG9jYWxlcyBpbiBOb2RlXG5pZighQmVbYV0mJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGUmJm1vZHVsZSYmbW9kdWxlLmV4cG9ydHMpdHJ5e2I9eGUuX2FiYnIscmVxdWlyZShcIi4vbG9jYWxlL1wiK2EpLFxuLy8gYmVjYXVzZSBkZWZpbmVMb2NhbGUgY3VycmVudGx5IGFsc28gc2V0cyB0aGUgZ2xvYmFsIGxvY2FsZSwgd2Vcbi8vIHdhbnQgdG8gdW5kbyB0aGF0IGZvciBsYXp5IGxvYWRlZCBsb2NhbGVzXG4kYShiKX1jYXRjaChhKXt9cmV0dXJuIEJlW2FdfVxuLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGxvYWQgbG9jYWxlIGFuZCB0aGVuIHNldCB0aGUgZ2xvYmFsIGxvY2FsZS4gIElmXG4vLyBubyBhcmd1bWVudHMgYXJlIHBhc3NlZCBpbiwgaXQgd2lsbCBzaW1wbHkgcmV0dXJuIHRoZSBjdXJyZW50IGdsb2JhbFxuLy8gbG9jYWxlIGtleS5cbmZ1bmN0aW9uICRhKGEsYil7dmFyIGM7XG4vLyBtb21lbnQuZHVyYXRpb24uX2xvY2FsZSA9IG1vbWVudC5fbG9jYWxlID0gZGF0YTtcbnJldHVybiBhJiYoYz1wKGIpP2JiKGEpOl9hKGEsYiksYyYmKHhlPWMpKSx4ZS5fYWJicn1mdW5jdGlvbiBfYShhLGIpe2lmKG51bGwhPT1iKXt2YXIgYz1BZTtpZihiLmFiYnI9YSxudWxsIT1CZVthXSl5KFwiZGVmaW5lTG9jYWxlT3ZlcnJpZGVcIixcInVzZSBtb21lbnQudXBkYXRlTG9jYWxlKGxvY2FsZU5hbWUsIGNvbmZpZykgdG8gY2hhbmdlIGFuIGV4aXN0aW5nIGxvY2FsZS4gbW9tZW50LmRlZmluZUxvY2FsZShsb2NhbGVOYW1lLCBjb25maWcpIHNob3VsZCBvbmx5IGJlIHVzZWQgZm9yIGNyZWF0aW5nIGEgbmV3IGxvY2FsZSBTZWUgaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9kZWZpbmUtbG9jYWxlLyBmb3IgbW9yZSBpbmZvLlwiKSxjPUJlW2FdLl9jb25maWc7ZWxzZSBpZihudWxsIT1iLnBhcmVudExvY2FsZSl7aWYobnVsbD09QmVbYi5wYXJlbnRMb2NhbGVdKXJldHVybiBDZVtiLnBhcmVudExvY2FsZV18fChDZVtiLnBhcmVudExvY2FsZV09W10pLENlW2IucGFyZW50TG9jYWxlXS5wdXNoKHtuYW1lOmEsY29uZmlnOmJ9KSxudWxsO2M9QmVbYi5wYXJlbnRMb2NhbGVdLl9jb25maWd9XG4vLyBiYWNrd2FyZHMgY29tcGF0IGZvciBub3c6IGFsc28gc2V0IHRoZSBsb2NhbGVcbi8vIG1ha2Ugc3VyZSB3ZSBzZXQgdGhlIGxvY2FsZSBBRlRFUiBhbGwgY2hpbGQgbG9jYWxlcyBoYXZlIGJlZW5cbi8vIGNyZWF0ZWQsIHNvIHdlIHdvbid0IGVuZCB1cCB3aXRoIHRoZSBjaGlsZCBsb2NhbGUgc2V0LlxucmV0dXJuIEJlW2FdPW5ldyBDKEIoYyxiKSksQ2VbYV0mJkNlW2FdLmZvckVhY2goZnVuY3Rpb24oYSl7X2EoYS5uYW1lLGEuY29uZmlnKX0pLCRhKGEpLEJlW2FdfVxuLy8gdXNlZnVsIGZvciB0ZXN0aW5nXG5yZXR1cm4gZGVsZXRlIEJlW2FdLG51bGx9ZnVuY3Rpb24gYWIoYSxiKXtpZihudWxsIT1iKXt2YXIgYyxkPUFlO1xuLy8gTUVSR0Vcbm51bGwhPUJlW2FdJiYoZD1CZVthXS5fY29uZmlnKSxiPUIoZCxiKSxjPW5ldyBDKGIpLGMucGFyZW50TG9jYWxlPUJlW2FdLEJlW2FdPWMsXG4vLyBiYWNrd2FyZHMgY29tcGF0IGZvciBub3c6IGFsc28gc2V0IHRoZSBsb2NhbGVcbiRhKGEpfWVsc2Vcbi8vIHBhc3MgbnVsbCBmb3IgY29uZmlnIHRvIHVudXBkYXRlLCB1c2VmdWwgZm9yIHRlc3RzXG5udWxsIT1CZVthXSYmKG51bGwhPUJlW2FdLnBhcmVudExvY2FsZT9CZVthXT1CZVthXS5wYXJlbnRMb2NhbGU6bnVsbCE9QmVbYV0mJmRlbGV0ZSBCZVthXSk7cmV0dXJuIEJlW2FdfVxuLy8gcmV0dXJucyBsb2NhbGUgZGF0YVxuZnVuY3Rpb24gYmIoYSl7dmFyIGI7aWYoYSYmYS5fbG9jYWxlJiZhLl9sb2NhbGUuX2FiYnImJihhPWEuX2xvY2FsZS5fYWJiciksIWEpcmV0dXJuIHhlO2lmKCFjKGEpKXtpZihcbi8vc2hvcnQtY2lyY3VpdCBldmVyeXRoaW5nIGVsc2VcbmI9WmEoYSkpcmV0dXJuIGI7YT1bYV19cmV0dXJuIFlhKGEpfWZ1bmN0aW9uIGNiKCl7cmV0dXJuIHdkKEJlKX1mdW5jdGlvbiBkYihhKXt2YXIgYixjPWEuX2E7cmV0dXJuIGMmJm0oYSkub3ZlcmZsb3c9PT0tMiYmKGI9Y1tiZV08MHx8Y1tiZV0+MTE/YmU6Y1tjZV08MXx8Y1tjZV0+ZWEoY1thZV0sY1tiZV0pP2NlOmNbZGVdPDB8fGNbZGVdPjI0fHwyND09PWNbZGVdJiYoMCE9PWNbZWVdfHwwIT09Y1tmZV18fDAhPT1jW2dlXSk/ZGU6Y1tlZV08MHx8Y1tlZV0+NTk/ZWU6Y1tmZV08MHx8Y1tmZV0+NTk/ZmU6Y1tnZV08MHx8Y1tnZV0+OTk5P2dlOi0xLG0oYSkuX292ZXJmbG93RGF5T2ZZZWFyJiYoYjxhZXx8Yj5jZSkmJihiPWNlKSxtKGEpLl9vdmVyZmxvd1dlZWtzJiZiPT09LTEmJihiPWhlKSxtKGEpLl9vdmVyZmxvd1dlZWtkYXkmJmI9PT0tMSYmKGI9aWUpLG0oYSkub3ZlcmZsb3c9YiksYX1cbi8vIGRhdGUgZnJvbSBpc28gZm9ybWF0XG5mdW5jdGlvbiBlYihhKXt2YXIgYixjLGQsZSxmLGcsaD1hLl9pLGk9RGUuZXhlYyhoKXx8RWUuZXhlYyhoKTtpZihpKXtmb3IobShhKS5pc289ITAsYj0wLGM9R2UubGVuZ3RoO2I8YztiKyspaWYoR2VbYl1bMV0uZXhlYyhpWzFdKSl7ZT1HZVtiXVswXSxkPUdlW2JdWzJdIT09ITE7YnJlYWt9aWYobnVsbD09ZSlyZXR1cm4gdm9pZChhLl9pc1ZhbGlkPSExKTtpZihpWzNdKXtmb3IoYj0wLGM9SGUubGVuZ3RoO2I8YztiKyspaWYoSGVbYl1bMV0uZXhlYyhpWzNdKSl7XG4vLyBtYXRjaFsyXSBzaG91bGQgYmUgJ1QnIG9yIHNwYWNlXG5mPShpWzJdfHxcIiBcIikrSGVbYl1bMF07YnJlYWt9aWYobnVsbD09ZilyZXR1cm4gdm9pZChhLl9pc1ZhbGlkPSExKX1pZighZCYmbnVsbCE9ZilyZXR1cm4gdm9pZChhLl9pc1ZhbGlkPSExKTtpZihpWzRdKXtpZighRmUuZXhlYyhpWzRdKSlyZXR1cm4gdm9pZChhLl9pc1ZhbGlkPSExKTtnPVwiWlwifWEuX2Y9ZSsoZnx8XCJcIikrKGd8fFwiXCIpLGtiKGEpfWVsc2UgYS5faXNWYWxpZD0hMX1cbi8vIGRhdGUgZnJvbSBpc28gZm9ybWF0IG9yIGZhbGxiYWNrXG5mdW5jdGlvbiBmYihiKXt2YXIgYz1JZS5leGVjKGIuX2kpO3JldHVybiBudWxsIT09Yz92b2lkKGIuX2Q9bmV3IERhdGUoK2NbMV0pKTooZWIoYiksdm9pZChiLl9pc1ZhbGlkPT09ITEmJihkZWxldGUgYi5faXNWYWxpZCxhLmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrKGIpKSkpfVxuLy8gUGljayB0aGUgZmlyc3QgZGVmaW5lZCBvZiB0d28gb3IgdGhyZWUgYXJndW1lbnRzLlxuZnVuY3Rpb24gZ2IoYSxiLGMpe3JldHVybiBudWxsIT1hP2E6bnVsbCE9Yj9iOmN9ZnVuY3Rpb24gaGIoYil7XG4vLyBob29rcyBpcyBhY3R1YWxseSB0aGUgZXhwb3J0ZWQgbW9tZW50IG9iamVjdFxudmFyIGM9bmV3IERhdGUoYS5ub3coKSk7cmV0dXJuIGIuX3VzZVVUQz9bYy5nZXRVVENGdWxsWWVhcigpLGMuZ2V0VVRDTW9udGgoKSxjLmdldFVUQ0RhdGUoKV06W2MuZ2V0RnVsbFllYXIoKSxjLmdldE1vbnRoKCksYy5nZXREYXRlKCldfVxuLy8gY29udmVydCBhbiBhcnJheSB0byBhIGRhdGUuXG4vLyB0aGUgYXJyYXkgc2hvdWxkIG1pcnJvciB0aGUgcGFyYW1ldGVycyBiZWxvd1xuLy8gbm90ZTogYWxsIHZhbHVlcyBwYXN0IHRoZSB5ZWFyIGFyZSBvcHRpb25hbCBhbmQgd2lsbCBkZWZhdWx0IHRvIHRoZSBsb3dlc3QgcG9zc2libGUgdmFsdWUuXG4vLyBbeWVhciwgbW9udGgsIGRheSAsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZF1cbmZ1bmN0aW9uIGliKGEpe3ZhciBiLGMsZCxlLGY9W107aWYoIWEuX2Qpe1xuLy8gRGVmYXVsdCB0byBjdXJyZW50IGRhdGUuXG4vLyAqIGlmIG5vIHllYXIsIG1vbnRoLCBkYXkgb2YgbW9udGggYXJlIGdpdmVuLCBkZWZhdWx0IHRvIHRvZGF5XG4vLyAqIGlmIGRheSBvZiBtb250aCBpcyBnaXZlbiwgZGVmYXVsdCBtb250aCBhbmQgeWVhclxuLy8gKiBpZiBtb250aCBpcyBnaXZlbiwgZGVmYXVsdCBvbmx5IHllYXJcbi8vICogaWYgeWVhciBpcyBnaXZlbiwgZG9uJ3QgZGVmYXVsdCBhbnl0aGluZ1xuZm9yKGQ9aGIoYSksXG4vL2NvbXB1dGUgZGF5IG9mIHRoZSB5ZWFyIGZyb20gd2Vla3MgYW5kIHdlZWtkYXlzXG5hLl93JiZudWxsPT1hLl9hW2NlXSYmbnVsbD09YS5fYVtiZV0mJmpiKGEpLFxuLy9pZiB0aGUgZGF5IG9mIHRoZSB5ZWFyIGlzIHNldCwgZmlndXJlIG91dCB3aGF0IGl0IGlzXG5hLl9kYXlPZlllYXImJihlPWdiKGEuX2FbYWVdLGRbYWVdKSxhLl9kYXlPZlllYXI+cGEoZSkmJihtKGEpLl9vdmVyZmxvd0RheU9mWWVhcj0hMCksYz10YShlLDAsYS5fZGF5T2ZZZWFyKSxhLl9hW2JlXT1jLmdldFVUQ01vbnRoKCksYS5fYVtjZV09Yy5nZXRVVENEYXRlKCkpLGI9MDtiPDMmJm51bGw9PWEuX2FbYl07KytiKWEuX2FbYl09ZltiXT1kW2JdO1xuLy8gWmVybyBvdXQgd2hhdGV2ZXIgd2FzIG5vdCBkZWZhdWx0ZWQsIGluY2x1ZGluZyB0aW1lXG5mb3IoO2I8NztiKyspYS5fYVtiXT1mW2JdPW51bGw9PWEuX2FbYl0/Mj09PWI/MTowOmEuX2FbYl07XG4vLyBDaGVjayBmb3IgMjQ6MDA6MDAuMDAwXG4yND09PWEuX2FbZGVdJiYwPT09YS5fYVtlZV0mJjA9PT1hLl9hW2ZlXSYmMD09PWEuX2FbZ2VdJiYoYS5fbmV4dERheT0hMCxhLl9hW2RlXT0wKSxhLl9kPShhLl91c2VVVEM/dGE6c2EpLmFwcGx5KG51bGwsZiksXG4vLyBBcHBseSB0aW1lem9uZSBvZmZzZXQgZnJvbSBpbnB1dC4gVGhlIGFjdHVhbCB1dGNPZmZzZXQgY2FuIGJlIGNoYW5nZWRcbi8vIHdpdGggcGFyc2Vab25lLlxubnVsbCE9YS5fdHptJiZhLl9kLnNldFVUQ01pbnV0ZXMoYS5fZC5nZXRVVENNaW51dGVzKCktYS5fdHptKSxhLl9uZXh0RGF5JiYoYS5fYVtkZV09MjQpfX1mdW5jdGlvbiBqYihhKXt2YXIgYixjLGQsZSxmLGcsaCxpO2lmKGI9YS5fdyxudWxsIT1iLkdHfHxudWxsIT1iLld8fG51bGwhPWIuRSlmPTEsZz00LFxuLy8gVE9ETzogV2UgbmVlZCB0byB0YWtlIHRoZSBjdXJyZW50IGlzb1dlZWtZZWFyLCBidXQgdGhhdCBkZXBlbmRzIG9uXG4vLyBob3cgd2UgaW50ZXJwcmV0IG5vdyAobG9jYWwsIHV0YywgZml4ZWQgb2Zmc2V0KS4gU28gY3JlYXRlXG4vLyBhIG5vdyB2ZXJzaW9uIG9mIGN1cnJlbnQgY29uZmlnICh0YWtlIGxvY2FsL3V0Yy9vZmZzZXQgZmxhZ3MsIGFuZFxuLy8gY3JlYXRlIG5vdykuXG5jPWdiKGIuR0csYS5fYVthZV0sd2Eoc2IoKSwxLDQpLnllYXIpLGQ9Z2IoYi5XLDEpLGU9Z2IoYi5FLDEpLChlPDF8fGU+NykmJihpPSEwKTtlbHNle2Y9YS5fbG9jYWxlLl93ZWVrLmRvdyxnPWEuX2xvY2FsZS5fd2Vlay5kb3k7dmFyIGo9d2Eoc2IoKSxmLGcpO2M9Z2IoYi5nZyxhLl9hW2FlXSxqLnllYXIpLFxuLy8gRGVmYXVsdCB0byBjdXJyZW50IHdlZWsuXG5kPWdiKGIudyxqLndlZWspLG51bGwhPWIuZD8oXG4vLyB3ZWVrZGF5IC0tIGxvdyBkYXkgbnVtYmVycyBhcmUgY29uc2lkZXJlZCBuZXh0IHdlZWtcbmU9Yi5kLChlPDB8fGU+NikmJihpPSEwKSk6bnVsbCE9Yi5lPyhcbi8vIGxvY2FsIHdlZWtkYXkgLS0gY291bnRpbmcgc3RhcnRzIGZyb20gYmVnaW5pbmcgb2Ygd2Vla1xuZT1iLmUrZiwoYi5lPDB8fGIuZT42KSYmKGk9ITApKTpcbi8vIGRlZmF1bHQgdG8gYmVnaW5pbmcgb2Ygd2Vla1xuZT1mfWQ8MXx8ZD54YShjLGYsZyk/bShhKS5fb3ZlcmZsb3dXZWVrcz0hMDpudWxsIT1pP20oYSkuX292ZXJmbG93V2Vla2RheT0hMDooaD12YShjLGQsZSxmLGcpLGEuX2FbYWVdPWgueWVhcixhLl9kYXlPZlllYXI9aC5kYXlPZlllYXIpfVxuLy8gZGF0ZSBmcm9tIHN0cmluZyBhbmQgZm9ybWF0IHN0cmluZ1xuZnVuY3Rpb24ga2IoYil7XG4vLyBUT0RPOiBNb3ZlIHRoaXMgdG8gYW5vdGhlciBwYXJ0IG9mIHRoZSBjcmVhdGlvbiBmbG93IHRvIHByZXZlbnQgY2lyY3VsYXIgZGVwc1xuaWYoYi5fZj09PWEuSVNPXzg2MDEpcmV0dXJuIHZvaWQgZWIoYik7Yi5fYT1bXSxtKGIpLmVtcHR5PSEwO1xuLy8gVGhpcyBhcnJheSBpcyB1c2VkIHRvIG1ha2UgYSBEYXRlLCBlaXRoZXIgd2l0aCBgbmV3IERhdGVgIG9yIGBEYXRlLlVUQ2BcbnZhciBjLGQsZSxmLGcsaD1cIlwiK2IuX2ksaT1oLmxlbmd0aCxqPTA7Zm9yKGU9WShiLl9mLGIuX2xvY2FsZSkubWF0Y2goRmQpfHxbXSxjPTA7YzxlLmxlbmd0aDtjKyspZj1lW2NdLGQ9KGgubWF0Y2goJChmLGIpKXx8W10pWzBdLFxuLy8gY29uc29sZS5sb2coJ3Rva2VuJywgdG9rZW4sICdwYXJzZWRJbnB1dCcsIHBhcnNlZElucHV0LFxuLy8gICAgICAgICAncmVnZXgnLCBnZXRQYXJzZVJlZ2V4Rm9yVG9rZW4odG9rZW4sIGNvbmZpZykpO1xuZCYmKGc9aC5zdWJzdHIoMCxoLmluZGV4T2YoZCkpLGcubGVuZ3RoPjAmJm0oYikudW51c2VkSW5wdXQucHVzaChnKSxoPWguc2xpY2UoaC5pbmRleE9mKGQpK2QubGVuZ3RoKSxqKz1kLmxlbmd0aCksXG4vLyBkb24ndCBwYXJzZSBpZiBpdCdzIG5vdCBhIGtub3duIHRva2VuXG5JZFtmXT8oZD9tKGIpLmVtcHR5PSExOm0oYikudW51c2VkVG9rZW5zLnB1c2goZiksZGEoZixkLGIpKTpiLl9zdHJpY3QmJiFkJiZtKGIpLnVudXNlZFRva2Vucy5wdXNoKGYpO1xuLy8gYWRkIHJlbWFpbmluZyB1bnBhcnNlZCBpbnB1dCBsZW5ndGggdG8gdGhlIHN0cmluZ1xubShiKS5jaGFyc0xlZnRPdmVyPWktaixoLmxlbmd0aD4wJiZtKGIpLnVudXNlZElucHV0LnB1c2goaCksXG4vLyBjbGVhciBfMTJoIGZsYWcgaWYgaG91ciBpcyA8PSAxMlxuYi5fYVtkZV08PTEyJiZtKGIpLmJpZ0hvdXI9PT0hMCYmYi5fYVtkZV0+MCYmKG0oYikuYmlnSG91cj12b2lkIDApLG0oYikucGFyc2VkRGF0ZVBhcnRzPWIuX2Euc2xpY2UoMCksbShiKS5tZXJpZGllbT1iLl9tZXJpZGllbSxcbi8vIGhhbmRsZSBtZXJpZGllbVxuYi5fYVtkZV09bGIoYi5fbG9jYWxlLGIuX2FbZGVdLGIuX21lcmlkaWVtKSxpYihiKSxkYihiKX1mdW5jdGlvbiBsYihhLGIsYyl7dmFyIGQ7XG4vLyBGYWxsYmFja1xucmV0dXJuIG51bGw9PWM/YjpudWxsIT1hLm1lcmlkaWVtSG91cj9hLm1lcmlkaWVtSG91cihiLGMpOm51bGwhPWEuaXNQTT8oZD1hLmlzUE0oYyksZCYmYjwxMiYmKGIrPTEyKSxkfHwxMiE9PWJ8fChiPTApLGIpOmJ9XG4vLyBkYXRlIGZyb20gc3RyaW5nIGFuZCBhcnJheSBvZiBmb3JtYXQgc3RyaW5nc1xuZnVuY3Rpb24gbWIoYSl7dmFyIGIsYyxkLGUsZjtpZigwPT09YS5fZi5sZW5ndGgpcmV0dXJuIG0oYSkuaW52YWxpZEZvcm1hdD0hMCx2b2lkKGEuX2Q9bmV3IERhdGUoTmFOKSk7Zm9yKGU9MDtlPGEuX2YubGVuZ3RoO2UrKylmPTAsYj1xKHt9LGEpLG51bGwhPWEuX3VzZVVUQyYmKGIuX3VzZVVUQz1hLl91c2VVVEMpLGIuX2Y9YS5fZltlXSxrYihiKSxuKGIpJiYoXG4vLyBpZiB0aGVyZSBpcyBhbnkgaW5wdXQgdGhhdCB3YXMgbm90IHBhcnNlZCBhZGQgYSBwZW5hbHR5IGZvciB0aGF0IGZvcm1hdFxuZis9bShiKS5jaGFyc0xlZnRPdmVyLFxuLy9vciB0b2tlbnNcbmYrPTEwKm0oYikudW51c2VkVG9rZW5zLmxlbmd0aCxtKGIpLnNjb3JlPWYsKG51bGw9PWR8fGY8ZCkmJihkPWYsYz1iKSk7aihhLGN8fGIpfWZ1bmN0aW9uIG5iKGEpe2lmKCFhLl9kKXt2YXIgYj1MKGEuX2kpO2EuX2E9aChbYi55ZWFyLGIubW9udGgsYi5kYXl8fGIuZGF0ZSxiLmhvdXIsYi5taW51dGUsYi5zZWNvbmQsYi5taWxsaXNlY29uZF0sZnVuY3Rpb24oYSl7cmV0dXJuIGEmJnBhcnNlSW50KGEsMTApfSksaWIoYSl9fWZ1bmN0aW9uIG9iKGEpe3ZhciBiPW5ldyByKGRiKHBiKGEpKSk7XG4vLyBBZGRpbmcgaXMgc21hcnQgZW5vdWdoIGFyb3VuZCBEU1RcbnJldHVybiBiLl9uZXh0RGF5JiYoYi5hZGQoMSxcImRcIiksYi5fbmV4dERheT12b2lkIDApLGJ9ZnVuY3Rpb24gcGIoYSl7dmFyIGI9YS5faSxkPWEuX2Y7cmV0dXJuIGEuX2xvY2FsZT1hLl9sb2NhbGV8fGJiKGEuX2wpLG51bGw9PT1ifHx2b2lkIDA9PT1kJiZcIlwiPT09Yj9vKHtudWxsSW5wdXQ6ITB9KTooXCJzdHJpbmdcIj09dHlwZW9mIGImJihhLl9pPWI9YS5fbG9jYWxlLnByZXBhcnNlKGIpKSxzKGIpP25ldyByKGRiKGIpKTooZyhiKT9hLl9kPWI6YyhkKT9tYihhKTpkP2tiKGEpOnFiKGEpLG4oYSl8fChhLl9kPW51bGwpLGEpKX1mdW5jdGlvbiBxYihiKXt2YXIgZD1iLl9pO3ZvaWQgMD09PWQ/Yi5fZD1uZXcgRGF0ZShhLm5vdygpKTpnKGQpP2IuX2Q9bmV3IERhdGUoZC52YWx1ZU9mKCkpOlwic3RyaW5nXCI9PXR5cGVvZiBkP2ZiKGIpOmMoZCk/KGIuX2E9aChkLnNsaWNlKDApLGZ1bmN0aW9uKGEpe3JldHVybiBwYXJzZUludChhLDEwKX0pLGliKGIpKTpcIm9iamVjdFwiPT10eXBlb2YgZD9uYihiKTpmKGQpP1xuLy8gZnJvbSBtaWxsaXNlY29uZHNcbmIuX2Q9bmV3IERhdGUoZCk6YS5jcmVhdGVGcm9tSW5wdXRGYWxsYmFjayhiKX1mdW5jdGlvbiByYihhLGIsZixnLGgpe3ZhciBpPXt9O1xuLy8gb2JqZWN0IGNvbnN0cnVjdGlvbiBtdXN0IGJlIGRvbmUgdGhpcyB3YXkuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTQyM1xucmV0dXJuIGYhPT0hMCYmZiE9PSExfHwoZz1mLGY9dm9pZCAwKSwoZChhKSYmZShhKXx8YyhhKSYmMD09PWEubGVuZ3RoKSYmKGE9dm9pZCAwKSxpLl9pc0FNb21lbnRPYmplY3Q9ITAsaS5fdXNlVVRDPWkuX2lzVVRDPWgsaS5fbD1mLGkuX2k9YSxpLl9mPWIsaS5fc3RyaWN0PWcsb2IoaSl9ZnVuY3Rpb24gc2IoYSxiLGMsZCl7cmV0dXJuIHJiKGEsYixjLGQsITEpfVxuLy8gUGljayBhIG1vbWVudCBtIGZyb20gbW9tZW50cyBzbyB0aGF0IG1bZm5dKG90aGVyKSBpcyB0cnVlIGZvciBhbGxcbi8vIG90aGVyLiBUaGlzIHJlbGllcyBvbiB0aGUgZnVuY3Rpb24gZm4gdG8gYmUgdHJhbnNpdGl2ZS5cbi8vXG4vLyBtb21lbnRzIHNob3VsZCBlaXRoZXIgYmUgYW4gYXJyYXkgb2YgbW9tZW50IG9iamVjdHMgb3IgYW4gYXJyYXksIHdob3NlXG4vLyBmaXJzdCBlbGVtZW50IGlzIGFuIGFycmF5IG9mIG1vbWVudCBvYmplY3RzLlxuZnVuY3Rpb24gdGIoYSxiKXt2YXIgZCxlO2lmKDE9PT1iLmxlbmd0aCYmYyhiWzBdKSYmKGI9YlswXSksIWIubGVuZ3RoKXJldHVybiBzYigpO2ZvcihkPWJbMF0sZT0xO2U8Yi5sZW5ndGg7KytlKWJbZV0uaXNWYWxpZCgpJiYhYltlXVthXShkKXx8KGQ9YltlXSk7cmV0dXJuIGR9XG4vLyBUT0RPOiBVc2UgW10uc29ydCBpbnN0ZWFkP1xuZnVuY3Rpb24gdWIoKXt2YXIgYT1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtyZXR1cm4gdGIoXCJpc0JlZm9yZVwiLGEpfWZ1bmN0aW9uIHZiKCl7dmFyIGE9W10uc2xpY2UuY2FsbChhcmd1bWVudHMsMCk7cmV0dXJuIHRiKFwiaXNBZnRlclwiLGEpfWZ1bmN0aW9uIHdiKGEpe3ZhciBiPUwoYSksYz1iLnllYXJ8fDAsZD1iLnF1YXJ0ZXJ8fDAsZT1iLm1vbnRofHwwLGY9Yi53ZWVrfHwwLGc9Yi5kYXl8fDAsaD1iLmhvdXJ8fDAsaT1iLm1pbnV0ZXx8MCxqPWIuc2Vjb25kfHwwLGs9Yi5taWxsaXNlY29uZHx8MDtcbi8vIHJlcHJlc2VudGF0aW9uIGZvciBkYXRlQWRkUmVtb3ZlXG50aGlzLl9taWxsaXNlY29uZHM9K2srMWUzKmorLy8gMTAwMFxuNmU0KmkrLy8gMTAwMCAqIDYwXG4xZTMqaCo2MCo2MCwvL3VzaW5nIDEwMDAgKiA2MCAqIDYwIGluc3RlYWQgb2YgMzZlNSB0byBhdm9pZCBmbG9hdGluZyBwb2ludCByb3VuZGluZyBlcnJvcnMgaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzI5Nzhcbi8vIEJlY2F1c2Ugb2YgZGF0ZUFkZFJlbW92ZSB0cmVhdHMgMjQgaG91cnMgYXMgZGlmZmVyZW50IGZyb20gYVxuLy8gZGF5IHdoZW4gd29ya2luZyBhcm91bmQgRFNULCB3ZSBuZWVkIHRvIHN0b3JlIHRoZW0gc2VwYXJhdGVseVxudGhpcy5fZGF5cz0rZys3KmYsXG4vLyBJdCBpcyBpbXBvc3NpYmxlIHRyYW5zbGF0ZSBtb250aHMgaW50byBkYXlzIHdpdGhvdXQga25vd2luZ1xuLy8gd2hpY2ggbW9udGhzIHlvdSBhcmUgYXJlIHRhbGtpbmcgYWJvdXQsIHNvIHdlIGhhdmUgdG8gc3RvcmVcbi8vIGl0IHNlcGFyYXRlbHkuXG50aGlzLl9tb250aHM9K2UrMypkKzEyKmMsdGhpcy5fZGF0YT17fSx0aGlzLl9sb2NhbGU9YmIoKSx0aGlzLl9idWJibGUoKX1mdW5jdGlvbiB4YihhKXtyZXR1cm4gYSBpbnN0YW5jZW9mIHdifWZ1bmN0aW9uIHliKGEpe3JldHVybiBhPDA/TWF0aC5yb3VuZCgtMSphKSotMTpNYXRoLnJvdW5kKGEpfVxuLy8gRk9STUFUVElOR1xuZnVuY3Rpb24gemIoYSxiKXtVKGEsMCwwLGZ1bmN0aW9uKCl7dmFyIGE9dGhpcy51dGNPZmZzZXQoKSxjPVwiK1wiO3JldHVybiBhPDAmJihhPS1hLGM9XCItXCIpLGMrVCh+fihhLzYwKSwyKStiK1Qofn5hJTYwLDIpfSl9ZnVuY3Rpb24gQWIoYSxiKXt2YXIgYz0oYnx8XCJcIikubWF0Y2goYSk7aWYobnVsbD09PWMpcmV0dXJuIG51bGw7dmFyIGQ9Y1tjLmxlbmd0aC0xXXx8W10sZT0oZCtcIlwiKS5tYXRjaChNZSl8fFtcIi1cIiwwLDBdLGY9Kyg2MCplWzFdKSt1KGVbMl0pO3JldHVybiAwPT09Zj8wOlwiK1wiPT09ZVswXT9mOi1mfVxuLy8gUmV0dXJuIGEgbW9tZW50IGZyb20gaW5wdXQsIHRoYXQgaXMgbG9jYWwvdXRjL3pvbmUgZXF1aXZhbGVudCB0byBtb2RlbC5cbmZ1bmN0aW9uIEJiKGIsYyl7dmFyIGQsZTtcbi8vIFVzZSBsb3ctbGV2ZWwgYXBpLCBiZWNhdXNlIHRoaXMgZm4gaXMgbG93LWxldmVsIGFwaS5cbnJldHVybiBjLl9pc1VUQz8oZD1jLmNsb25lKCksZT0ocyhiKXx8ZyhiKT9iLnZhbHVlT2YoKTpzYihiKS52YWx1ZU9mKCkpLWQudmFsdWVPZigpLGQuX2Quc2V0VGltZShkLl9kLnZhbHVlT2YoKStlKSxhLnVwZGF0ZU9mZnNldChkLCExKSxkKTpzYihiKS5sb2NhbCgpfWZ1bmN0aW9uIENiKGEpe1xuLy8gT24gRmlyZWZveC4yNCBEYXRlI2dldFRpbWV6b25lT2Zmc2V0IHJldHVybnMgYSBmbG9hdGluZyBwb2ludC5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L3B1bGwvMTg3MVxucmV0dXJuIDE1Ki1NYXRoLnJvdW5kKGEuX2QuZ2V0VGltZXpvbmVPZmZzZXQoKS8xNSl9XG4vLyBNT01FTlRTXG4vLyBrZWVwTG9jYWxUaW1lID0gdHJ1ZSBtZWFucyBvbmx5IGNoYW5nZSB0aGUgdGltZXpvbmUsIHdpdGhvdXRcbi8vIGFmZmVjdGluZyB0aGUgbG9jYWwgaG91ci4gU28gNTozMToyNiArMDMwMCAtLVt1dGNPZmZzZXQoMiwgdHJ1ZSldLS0+XG4vLyA1OjMxOjI2ICswMjAwIEl0IGlzIHBvc3NpYmxlIHRoYXQgNTozMToyNiBkb2Vzbid0IGV4aXN0IHdpdGggb2Zmc2V0XG4vLyArMDIwMCwgc28gd2UgYWRqdXN0IHRoZSB0aW1lIGFzIG5lZWRlZCwgdG8gYmUgdmFsaWQuXG4vL1xuLy8gS2VlcGluZyB0aGUgdGltZSBhY3R1YWxseSBhZGRzL3N1YnRyYWN0cyAob25lIGhvdXIpXG4vLyBmcm9tIHRoZSBhY3R1YWwgcmVwcmVzZW50ZWQgdGltZS4gVGhhdCBpcyB3aHkgd2UgY2FsbCB1cGRhdGVPZmZzZXRcbi8vIGEgc2Vjb25kIHRpbWUuIEluIGNhc2UgaXQgd2FudHMgdXMgdG8gY2hhbmdlIHRoZSBvZmZzZXQgYWdhaW5cbi8vIF9jaGFuZ2VJblByb2dyZXNzID09IHRydWUgY2FzZSwgdGhlbiB3ZSBoYXZlIHRvIGFkanVzdCwgYmVjYXVzZVxuLy8gdGhlcmUgaXMgbm8gc3VjaCB0aW1lIGluIHRoZSBnaXZlbiB0aW1lem9uZS5cbmZ1bmN0aW9uIERiKGIsYyl7dmFyIGQsZT10aGlzLl9vZmZzZXR8fDA7aWYoIXRoaXMuaXNWYWxpZCgpKXJldHVybiBudWxsIT1iP3RoaXM6TmFOO2lmKG51bGwhPWIpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiBiKXtpZihiPUFiKFhkLGIpLG51bGw9PT1iKXJldHVybiB0aGlzfWVsc2UgTWF0aC5hYnMoYik8MTYmJihiPTYwKmIpO3JldHVybiF0aGlzLl9pc1VUQyYmYyYmKGQ9Q2IodGhpcykpLHRoaXMuX29mZnNldD1iLHRoaXMuX2lzVVRDPSEwLG51bGwhPWQmJnRoaXMuYWRkKGQsXCJtXCIpLGUhPT1iJiYoIWN8fHRoaXMuX2NoYW5nZUluUHJvZ3Jlc3M/VGIodGhpcyxPYihiLWUsXCJtXCIpLDEsITEpOnRoaXMuX2NoYW5nZUluUHJvZ3Jlc3N8fCh0aGlzLl9jaGFuZ2VJblByb2dyZXNzPSEwLGEudXBkYXRlT2Zmc2V0KHRoaXMsITApLHRoaXMuX2NoYW5nZUluUHJvZ3Jlc3M9bnVsbCkpLHRoaXN9cmV0dXJuIHRoaXMuX2lzVVRDP2U6Q2IodGhpcyl9ZnVuY3Rpb24gRWIoYSxiKXtyZXR1cm4gbnVsbCE9YT8oXCJzdHJpbmdcIiE9dHlwZW9mIGEmJihhPS1hKSx0aGlzLnV0Y09mZnNldChhLGIpLHRoaXMpOi10aGlzLnV0Y09mZnNldCgpfWZ1bmN0aW9uIEZiKGEpe3JldHVybiB0aGlzLnV0Y09mZnNldCgwLGEpfWZ1bmN0aW9uIEdiKGEpe3JldHVybiB0aGlzLl9pc1VUQyYmKHRoaXMudXRjT2Zmc2V0KDAsYSksdGhpcy5faXNVVEM9ITEsYSYmdGhpcy5zdWJ0cmFjdChDYih0aGlzKSxcIm1cIikpLHRoaXN9ZnVuY3Rpb24gSGIoKXtpZihudWxsIT10aGlzLl90em0pdGhpcy51dGNPZmZzZXQodGhpcy5fdHptKTtlbHNlIGlmKFwic3RyaW5nXCI9PXR5cGVvZiB0aGlzLl9pKXt2YXIgYT1BYihXZCx0aGlzLl9pKTtudWxsIT1hP3RoaXMudXRjT2Zmc2V0KGEpOnRoaXMudXRjT2Zmc2V0KDAsITApfXJldHVybiB0aGlzfWZ1bmN0aW9uIEliKGEpe3JldHVybiEhdGhpcy5pc1ZhbGlkKCkmJihhPWE/c2IoYSkudXRjT2Zmc2V0KCk6MCwodGhpcy51dGNPZmZzZXQoKS1hKSU2MD09PTApfWZ1bmN0aW9uIEpiKCl7cmV0dXJuIHRoaXMudXRjT2Zmc2V0KCk+dGhpcy5jbG9uZSgpLm1vbnRoKDApLnV0Y09mZnNldCgpfHx0aGlzLnV0Y09mZnNldCgpPnRoaXMuY2xvbmUoKS5tb250aCg1KS51dGNPZmZzZXQoKX1mdW5jdGlvbiBLYigpe2lmKCFwKHRoaXMuX2lzRFNUU2hpZnRlZCkpcmV0dXJuIHRoaXMuX2lzRFNUU2hpZnRlZDt2YXIgYT17fTtpZihxKGEsdGhpcyksYT1wYihhKSxhLl9hKXt2YXIgYj1hLl9pc1VUQz9rKGEuX2EpOnNiKGEuX2EpO3RoaXMuX2lzRFNUU2hpZnRlZD10aGlzLmlzVmFsaWQoKSYmdihhLl9hLGIudG9BcnJheSgpKT4wfWVsc2UgdGhpcy5faXNEU1RTaGlmdGVkPSExO3JldHVybiB0aGlzLl9pc0RTVFNoaWZ0ZWR9ZnVuY3Rpb24gTGIoKXtyZXR1cm4hIXRoaXMuaXNWYWxpZCgpJiYhdGhpcy5faXNVVEN9ZnVuY3Rpb24gTWIoKXtyZXR1cm4hIXRoaXMuaXNWYWxpZCgpJiZ0aGlzLl9pc1VUQ31mdW5jdGlvbiBOYigpe3JldHVybiEhdGhpcy5pc1ZhbGlkKCkmJih0aGlzLl9pc1VUQyYmMD09PXRoaXMuX29mZnNldCl9ZnVuY3Rpb24gT2IoYSxiKXt2YXIgYyxkLGUsZz1hLFxuLy8gbWF0Y2hpbmcgYWdhaW5zdCByZWdleHAgaXMgZXhwZW5zaXZlLCBkbyBpdCBvbiBkZW1hbmRcbmg9bnVsbDsvLyBjaGVja3MgZm9yIG51bGwgb3IgdW5kZWZpbmVkXG5yZXR1cm4geGIoYSk/Zz17bXM6YS5fbWlsbGlzZWNvbmRzLGQ6YS5fZGF5cyxNOmEuX21vbnRoc306ZihhKT8oZz17fSxiP2dbYl09YTpnLm1pbGxpc2Vjb25kcz1hKTooaD1OZS5leGVjKGEpKT8oYz1cIi1cIj09PWhbMV0/LTE6MSxnPXt5OjAsZDp1KGhbY2VdKSpjLGg6dShoW2RlXSkqYyxtOnUoaFtlZV0pKmMsczp1KGhbZmVdKSpjLG1zOnUoeWIoMWUzKmhbZ2VdKSkqY30pOihoPU9lLmV4ZWMoYSkpPyhjPVwiLVwiPT09aFsxXT8tMToxLGc9e3k6UGIoaFsyXSxjKSxNOlBiKGhbM10sYyksdzpQYihoWzRdLGMpLGQ6UGIoaFs1XSxjKSxoOlBiKGhbNl0sYyksbTpQYihoWzddLGMpLHM6UGIoaFs4XSxjKX0pOm51bGw9PWc/Zz17fTpcIm9iamVjdFwiPT10eXBlb2YgZyYmKFwiZnJvbVwiaW4gZ3x8XCJ0b1wiaW4gZykmJihlPVJiKHNiKGcuZnJvbSksc2IoZy50bykpLGc9e30sZy5tcz1lLm1pbGxpc2Vjb25kcyxnLk09ZS5tb250aHMpLGQ9bmV3IHdiKGcpLHhiKGEpJiZpKGEsXCJfbG9jYWxlXCIpJiYoZC5fbG9jYWxlPWEuX2xvY2FsZSksZH1mdW5jdGlvbiBQYihhLGIpe1xuLy8gV2UnZCBub3JtYWxseSB1c2Ugfn5pbnAgZm9yIHRoaXMsIGJ1dCB1bmZvcnR1bmF0ZWx5IGl0IGFsc29cbi8vIGNvbnZlcnRzIGZsb2F0cyB0byBpbnRzLlxuLy8gaW5wIG1heSBiZSB1bmRlZmluZWQsIHNvIGNhcmVmdWwgY2FsbGluZyByZXBsYWNlIG9uIGl0LlxudmFyIGM9YSYmcGFyc2VGbG9hdChhLnJlcGxhY2UoXCIsXCIsXCIuXCIpKTtcbi8vIGFwcGx5IHNpZ24gd2hpbGUgd2UncmUgYXQgaXRcbnJldHVybihpc05hTihjKT8wOmMpKmJ9ZnVuY3Rpb24gUWIoYSxiKXt2YXIgYz17bWlsbGlzZWNvbmRzOjAsbW9udGhzOjB9O3JldHVybiBjLm1vbnRocz1iLm1vbnRoKCktYS5tb250aCgpKzEyKihiLnllYXIoKS1hLnllYXIoKSksYS5jbG9uZSgpLmFkZChjLm1vbnRocyxcIk1cIikuaXNBZnRlcihiKSYmLS1jLm1vbnRocyxjLm1pbGxpc2Vjb25kcz0rYi0rYS5jbG9uZSgpLmFkZChjLm1vbnRocyxcIk1cIiksY31mdW5jdGlvbiBSYihhLGIpe3ZhciBjO3JldHVybiBhLmlzVmFsaWQoKSYmYi5pc1ZhbGlkKCk/KGI9QmIoYixhKSxhLmlzQmVmb3JlKGIpP2M9UWIoYSxiKTooYz1RYihiLGEpLGMubWlsbGlzZWNvbmRzPS1jLm1pbGxpc2Vjb25kcyxjLm1vbnRocz0tYy5tb250aHMpLGMpOnttaWxsaXNlY29uZHM6MCxtb250aHM6MH19XG4vLyBUT0RPOiByZW1vdmUgJ25hbWUnIGFyZyBhZnRlciBkZXByZWNhdGlvbiBpcyByZW1vdmVkXG5mdW5jdGlvbiBTYihhLGIpe3JldHVybiBmdW5jdGlvbihjLGQpe3ZhciBlLGY7XG4vL2ludmVydCB0aGUgYXJndW1lbnRzLCBidXQgY29tcGxhaW4gYWJvdXQgaXRcbnJldHVybiBudWxsPT09ZHx8aXNOYU4oK2QpfHwoeShiLFwibW9tZW50KCkuXCIrYitcIihwZXJpb2QsIG51bWJlcikgaXMgZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSBtb21lbnQoKS5cIitiK1wiKG51bWJlciwgcGVyaW9kKS4gU2VlIGh0dHA6Ly9tb21lbnRqcy5jb20vZ3VpZGVzLyMvd2FybmluZ3MvYWRkLWludmVydGVkLXBhcmFtLyBmb3IgbW9yZSBpbmZvLlwiKSxmPWMsYz1kLGQ9ZiksYz1cInN0cmluZ1wiPT10eXBlb2YgYz8rYzpjLGU9T2IoYyxkKSxUYih0aGlzLGUsYSksdGhpc319ZnVuY3Rpb24gVGIoYixjLGQsZSl7dmFyIGY9Yy5fbWlsbGlzZWNvbmRzLGc9eWIoYy5fZGF5cyksaD15YihjLl9tb250aHMpO2IuaXNWYWxpZCgpJiYoZT1udWxsPT1lfHxlLGYmJmIuX2Quc2V0VGltZShiLl9kLnZhbHVlT2YoKStmKmQpLGcmJlEoYixcIkRhdGVcIixQKGIsXCJEYXRlXCIpK2cqZCksaCYmamEoYixQKGIsXCJNb250aFwiKStoKmQpLGUmJmEudXBkYXRlT2Zmc2V0KGIsZ3x8aCkpfWZ1bmN0aW9uIFViKGEsYil7dmFyIGM9YS5kaWZmKGIsXCJkYXlzXCIsITApO3JldHVybiBjPC02P1wic2FtZUVsc2VcIjpjPC0xP1wibGFzdFdlZWtcIjpjPDA/XCJsYXN0RGF5XCI6YzwxP1wic2FtZURheVwiOmM8Mj9cIm5leHREYXlcIjpjPDc/XCJuZXh0V2Vla1wiOlwic2FtZUVsc2VcIn1mdW5jdGlvbiBWYihiLGMpe1xuLy8gV2Ugd2FudCB0byBjb21wYXJlIHRoZSBzdGFydCBvZiB0b2RheSwgdnMgdGhpcy5cbi8vIEdldHRpbmcgc3RhcnQtb2YtdG9kYXkgZGVwZW5kcyBvbiB3aGV0aGVyIHdlJ3JlIGxvY2FsL3V0Yy9vZmZzZXQgb3Igbm90LlxudmFyIGQ9Ynx8c2IoKSxlPUJiKGQsdGhpcykuc3RhcnRPZihcImRheVwiKSxmPWEuY2FsZW5kYXJGb3JtYXQodGhpcyxlKXx8XCJzYW1lRWxzZVwiLGc9YyYmKHooY1tmXSk/Y1tmXS5jYWxsKHRoaXMsZCk6Y1tmXSk7cmV0dXJuIHRoaXMuZm9ybWF0KGd8fHRoaXMubG9jYWxlRGF0YSgpLmNhbGVuZGFyKGYsdGhpcyxzYihkKSkpfWZ1bmN0aW9uIFdiKCl7cmV0dXJuIG5ldyByKHRoaXMpfWZ1bmN0aW9uIFhiKGEsYil7dmFyIGM9cyhhKT9hOnNiKGEpO3JldHVybiEoIXRoaXMuaXNWYWxpZCgpfHwhYy5pc1ZhbGlkKCkpJiYoYj1LKHAoYik/XCJtaWxsaXNlY29uZFwiOmIpLFwibWlsbGlzZWNvbmRcIj09PWI/dGhpcy52YWx1ZU9mKCk+Yy52YWx1ZU9mKCk6Yy52YWx1ZU9mKCk8dGhpcy5jbG9uZSgpLnN0YXJ0T2YoYikudmFsdWVPZigpKX1mdW5jdGlvbiBZYihhLGIpe3ZhciBjPXMoYSk/YTpzYihhKTtyZXR1cm4hKCF0aGlzLmlzVmFsaWQoKXx8IWMuaXNWYWxpZCgpKSYmKGI9SyhwKGIpP1wibWlsbGlzZWNvbmRcIjpiKSxcIm1pbGxpc2Vjb25kXCI9PT1iP3RoaXMudmFsdWVPZigpPGMudmFsdWVPZigpOnRoaXMuY2xvbmUoKS5lbmRPZihiKS52YWx1ZU9mKCk8Yy52YWx1ZU9mKCkpfWZ1bmN0aW9uIFpiKGEsYixjLGQpe3JldHVybiBkPWR8fFwiKClcIiwoXCIoXCI9PT1kWzBdP3RoaXMuaXNBZnRlcihhLGMpOiF0aGlzLmlzQmVmb3JlKGEsYykpJiYoXCIpXCI9PT1kWzFdP3RoaXMuaXNCZWZvcmUoYixjKTohdGhpcy5pc0FmdGVyKGIsYykpfWZ1bmN0aW9uICRiKGEsYil7dmFyIGMsZD1zKGEpP2E6c2IoYSk7cmV0dXJuISghdGhpcy5pc1ZhbGlkKCl8fCFkLmlzVmFsaWQoKSkmJihiPUsoYnx8XCJtaWxsaXNlY29uZFwiKSxcIm1pbGxpc2Vjb25kXCI9PT1iP3RoaXMudmFsdWVPZigpPT09ZC52YWx1ZU9mKCk6KGM9ZC52YWx1ZU9mKCksdGhpcy5jbG9uZSgpLnN0YXJ0T2YoYikudmFsdWVPZigpPD1jJiZjPD10aGlzLmNsb25lKCkuZW5kT2YoYikudmFsdWVPZigpKSl9ZnVuY3Rpb24gX2IoYSxiKXtyZXR1cm4gdGhpcy5pc1NhbWUoYSxiKXx8dGhpcy5pc0FmdGVyKGEsYil9ZnVuY3Rpb24gYWMoYSxiKXtyZXR1cm4gdGhpcy5pc1NhbWUoYSxiKXx8dGhpcy5pc0JlZm9yZShhLGIpfWZ1bmN0aW9uIGJjKGEsYixjKXt2YXIgZCxlLGYsZzsvLyAxMDAwXG4vLyAxMDAwICogNjBcbi8vIDEwMDAgKiA2MCAqIDYwXG4vLyAxMDAwICogNjAgKiA2MCAqIDI0LCBuZWdhdGUgZHN0XG4vLyAxMDAwICogNjAgKiA2MCAqIDI0ICogNywgbmVnYXRlIGRzdFxucmV0dXJuIHRoaXMuaXNWYWxpZCgpPyhkPUJiKGEsdGhpcyksZC5pc1ZhbGlkKCk/KGU9NmU0KihkLnV0Y09mZnNldCgpLXRoaXMudXRjT2Zmc2V0KCkpLGI9SyhiKSxcInllYXJcIj09PWJ8fFwibW9udGhcIj09PWJ8fFwicXVhcnRlclwiPT09Yj8oZz1jYyh0aGlzLGQpLFwicXVhcnRlclwiPT09Yj9nLz0zOlwieWVhclwiPT09YiYmKGcvPTEyKSk6KGY9dGhpcy1kLGc9XCJzZWNvbmRcIj09PWI/Zi8xZTM6XCJtaW51dGVcIj09PWI/Zi82ZTQ6XCJob3VyXCI9PT1iP2YvMzZlNTpcImRheVwiPT09Yj8oZi1lKS84NjRlNTpcIndlZWtcIj09PWI/KGYtZSkvNjA0OGU1OmYpLGM/Zzp0KGcpKTpOYU4pOk5hTn1mdW5jdGlvbiBjYyhhLGIpe1xuLy8gZGlmZmVyZW5jZSBpbiBtb250aHNcbnZhciBjLGQsZT0xMiooYi55ZWFyKCktYS55ZWFyKCkpKyhiLm1vbnRoKCktYS5tb250aCgpKSxcbi8vIGIgaXMgaW4gKGFuY2hvciAtIDEgbW9udGgsIGFuY2hvciArIDEgbW9udGgpXG5mPWEuY2xvbmUoKS5hZGQoZSxcIm1vbnRoc1wiKTtcbi8vY2hlY2sgZm9yIG5lZ2F0aXZlIHplcm8sIHJldHVybiB6ZXJvIGlmIG5lZ2F0aXZlIHplcm9cbi8vIGxpbmVhciBhY3Jvc3MgdGhlIG1vbnRoXG4vLyBsaW5lYXIgYWNyb3NzIHRoZSBtb250aFxucmV0dXJuIGItZjwwPyhjPWEuY2xvbmUoKS5hZGQoZS0xLFwibW9udGhzXCIpLGQ9KGItZikvKGYtYykpOihjPWEuY2xvbmUoKS5hZGQoZSsxLFwibW9udGhzXCIpLGQ9KGItZikvKGMtZikpLC0oZStkKXx8MH1mdW5jdGlvbiBkYygpe3JldHVybiB0aGlzLmNsb25lKCkubG9jYWxlKFwiZW5cIikuZm9ybWF0KFwiZGRkIE1NTSBERCBZWVlZIEhIOm1tOnNzIFtHTVRdWlpcIil9ZnVuY3Rpb24gZWMoKXt2YXIgYT10aGlzLmNsb25lKCkudXRjKCk7cmV0dXJuIDA8YS55ZWFyKCkmJmEueWVhcigpPD05OTk5P3ooRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmcpP3RoaXMudG9EYXRlKCkudG9JU09TdHJpbmcoKTpYKGEsXCJZWVlZLU1NLUREW1RdSEg6bW06c3MuU1NTW1pdXCIpOlgoYSxcIllZWVlZWS1NTS1ERFtUXUhIOm1tOnNzLlNTU1taXVwiKX0vKipcbiAqIFJldHVybiBhIGh1bWFuIHJlYWRhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbW9tZW50IHRoYXQgY2FuXG4gKiBhbHNvIGJlIGV2YWx1YXRlZCB0byBnZXQgYSBuZXcgbW9tZW50IHdoaWNoIGlzIHRoZSBzYW1lXG4gKlxuICogQGxpbmsgaHR0cHM6Ly9ub2RlanMub3JnL2Rpc3QvbGF0ZXN0L2RvY3MvYXBpL3V0aWwuaHRtbCN1dGlsX2N1c3RvbV9pbnNwZWN0X2Z1bmN0aW9uX29uX29iamVjdHNcbiAqL1xuZnVuY3Rpb24gZmMoKXtpZighdGhpcy5pc1ZhbGlkKCkpcmV0dXJuXCJtb21lbnQuaW52YWxpZCgvKiBcIit0aGlzLl9pK1wiICovKVwiO3ZhciBhPVwibW9tZW50XCIsYj1cIlwiO3RoaXMuaXNMb2NhbCgpfHwoYT0wPT09dGhpcy51dGNPZmZzZXQoKT9cIm1vbWVudC51dGNcIjpcIm1vbWVudC5wYXJzZVpvbmVcIixiPVwiWlwiKTt2YXIgYz1cIltcIithKycoXCJdJyxkPTA8dGhpcy55ZWFyKCkmJnRoaXMueWVhcigpPD05OTk5P1wiWVlZWVwiOlwiWVlZWVlZXCIsZT1cIi1NTS1ERFtUXUhIOm1tOnNzLlNTU1wiLGY9YisnW1wiKV0nO3JldHVybiB0aGlzLmZvcm1hdChjK2QrZStmKX1mdW5jdGlvbiBnYyhiKXtifHwoYj10aGlzLmlzVXRjKCk/YS5kZWZhdWx0Rm9ybWF0VXRjOmEuZGVmYXVsdEZvcm1hdCk7dmFyIGM9WCh0aGlzLGIpO3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS5wb3N0Zm9ybWF0KGMpfWZ1bmN0aW9uIGhjKGEsYil7cmV0dXJuIHRoaXMuaXNWYWxpZCgpJiYocyhhKSYmYS5pc1ZhbGlkKCl8fHNiKGEpLmlzVmFsaWQoKSk/T2Ioe3RvOnRoaXMsZnJvbTphfSkubG9jYWxlKHRoaXMubG9jYWxlKCkpLmh1bWFuaXplKCFiKTp0aGlzLmxvY2FsZURhdGEoKS5pbnZhbGlkRGF0ZSgpfWZ1bmN0aW9uIGljKGEpe3JldHVybiB0aGlzLmZyb20oc2IoKSxhKX1mdW5jdGlvbiBqYyhhLGIpe3JldHVybiB0aGlzLmlzVmFsaWQoKSYmKHMoYSkmJmEuaXNWYWxpZCgpfHxzYihhKS5pc1ZhbGlkKCkpP09iKHtmcm9tOnRoaXMsdG86YX0pLmxvY2FsZSh0aGlzLmxvY2FsZSgpKS5odW1hbml6ZSghYik6dGhpcy5sb2NhbGVEYXRhKCkuaW52YWxpZERhdGUoKX1mdW5jdGlvbiBrYyhhKXtyZXR1cm4gdGhpcy50byhzYigpLGEpfVxuLy8gSWYgcGFzc2VkIGEgbG9jYWxlIGtleSwgaXQgd2lsbCBzZXQgdGhlIGxvY2FsZSBmb3IgdGhpc1xuLy8gaW5zdGFuY2UuICBPdGhlcndpc2UsIGl0IHdpbGwgcmV0dXJuIHRoZSBsb2NhbGUgY29uZmlndXJhdGlvblxuLy8gdmFyaWFibGVzIGZvciB0aGlzIGluc3RhbmNlLlxuZnVuY3Rpb24gbGMoYSl7dmFyIGI7cmV0dXJuIHZvaWQgMD09PWE/dGhpcy5fbG9jYWxlLl9hYmJyOihiPWJiKGEpLG51bGwhPWImJih0aGlzLl9sb2NhbGU9YiksdGhpcyl9ZnVuY3Rpb24gbWMoKXtyZXR1cm4gdGhpcy5fbG9jYWxlfWZ1bmN0aW9uIG5jKGEpe1xuLy8gdGhlIGZvbGxvd2luZyBzd2l0Y2ggaW50ZW50aW9uYWxseSBvbWl0cyBicmVhayBrZXl3b3Jkc1xuLy8gdG8gdXRpbGl6ZSBmYWxsaW5nIHRocm91Z2ggdGhlIGNhc2VzLlxuc3dpdGNoKGE9SyhhKSl7Y2FzZVwieWVhclwiOnRoaXMubW9udGgoMCk7LyogZmFsbHMgdGhyb3VnaCAqL1xuY2FzZVwicXVhcnRlclwiOmNhc2VcIm1vbnRoXCI6dGhpcy5kYXRlKDEpOy8qIGZhbGxzIHRocm91Z2ggKi9cbmNhc2VcIndlZWtcIjpjYXNlXCJpc29XZWVrXCI6Y2FzZVwiZGF5XCI6Y2FzZVwiZGF0ZVwiOnRoaXMuaG91cnMoMCk7LyogZmFsbHMgdGhyb3VnaCAqL1xuY2FzZVwiaG91clwiOnRoaXMubWludXRlcygwKTsvKiBmYWxscyB0aHJvdWdoICovXG5jYXNlXCJtaW51dGVcIjp0aGlzLnNlY29uZHMoMCk7LyogZmFsbHMgdGhyb3VnaCAqL1xuY2FzZVwic2Vjb25kXCI6dGhpcy5taWxsaXNlY29uZHMoMCl9XG4vLyB3ZWVrcyBhcmUgYSBzcGVjaWFsIGNhc2Vcbi8vIHF1YXJ0ZXJzIGFyZSBhbHNvIHNwZWNpYWxcbnJldHVyblwid2Vla1wiPT09YSYmdGhpcy53ZWVrZGF5KDApLFwiaXNvV2Vla1wiPT09YSYmdGhpcy5pc29XZWVrZGF5KDEpLFwicXVhcnRlclwiPT09YSYmdGhpcy5tb250aCgzKk1hdGguZmxvb3IodGhpcy5tb250aCgpLzMpKSx0aGlzfWZ1bmN0aW9uIG9jKGEpe1xuLy8gJ2RhdGUnIGlzIGFuIGFsaWFzIGZvciAnZGF5Jywgc28gaXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgYXMgc3VjaC5cbnJldHVybiBhPUsoYSksdm9pZCAwPT09YXx8XCJtaWxsaXNlY29uZFwiPT09YT90aGlzOihcImRhdGVcIj09PWEmJihhPVwiZGF5XCIpLHRoaXMuc3RhcnRPZihhKS5hZGQoMSxcImlzb1dlZWtcIj09PWE/XCJ3ZWVrXCI6YSkuc3VidHJhY3QoMSxcIm1zXCIpKX1mdW5jdGlvbiBwYygpe3JldHVybiB0aGlzLl9kLnZhbHVlT2YoKS02ZTQqKHRoaXMuX29mZnNldHx8MCl9ZnVuY3Rpb24gcWMoKXtyZXR1cm4gTWF0aC5mbG9vcih0aGlzLnZhbHVlT2YoKS8xZTMpfWZ1bmN0aW9uIHJjKCl7cmV0dXJuIG5ldyBEYXRlKHRoaXMudmFsdWVPZigpKX1mdW5jdGlvbiBzYygpe3ZhciBhPXRoaXM7cmV0dXJuW2EueWVhcigpLGEubW9udGgoKSxhLmRhdGUoKSxhLmhvdXIoKSxhLm1pbnV0ZSgpLGEuc2Vjb25kKCksYS5taWxsaXNlY29uZCgpXX1mdW5jdGlvbiB0Yygpe3ZhciBhPXRoaXM7cmV0dXJue3llYXJzOmEueWVhcigpLG1vbnRoczphLm1vbnRoKCksZGF0ZTphLmRhdGUoKSxob3VyczphLmhvdXJzKCksbWludXRlczphLm1pbnV0ZXMoKSxzZWNvbmRzOmEuc2Vjb25kcygpLG1pbGxpc2Vjb25kczphLm1pbGxpc2Vjb25kcygpfX1mdW5jdGlvbiB1Yygpe1xuLy8gbmV3IERhdGUoTmFOKS50b0pTT04oKSA9PT0gbnVsbFxucmV0dXJuIHRoaXMuaXNWYWxpZCgpP3RoaXMudG9JU09TdHJpbmcoKTpudWxsfWZ1bmN0aW9uIHZjKCl7cmV0dXJuIG4odGhpcyl9ZnVuY3Rpb24gd2MoKXtyZXR1cm4gaih7fSxtKHRoaXMpKX1mdW5jdGlvbiB4Yygpe3JldHVybiBtKHRoaXMpLm92ZXJmbG93fWZ1bmN0aW9uIHljKCl7cmV0dXJue2lucHV0OnRoaXMuX2ksZm9ybWF0OnRoaXMuX2YsbG9jYWxlOnRoaXMuX2xvY2FsZSxpc1VUQzp0aGlzLl9pc1VUQyxzdHJpY3Q6dGhpcy5fc3RyaWN0fX1mdW5jdGlvbiB6YyhhLGIpe1UoMCxbYSxhLmxlbmd0aF0sMCxiKX1cbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIEFjKGEpe3JldHVybiBFYy5jYWxsKHRoaXMsYSx0aGlzLndlZWsoKSx0aGlzLndlZWtkYXkoKSx0aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3csdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWsuZG95KX1mdW5jdGlvbiBCYyhhKXtyZXR1cm4gRWMuY2FsbCh0aGlzLGEsdGhpcy5pc29XZWVrKCksdGhpcy5pc29XZWVrZGF5KCksMSw0KX1mdW5jdGlvbiBDYygpe3JldHVybiB4YSh0aGlzLnllYXIoKSwxLDQpfWZ1bmN0aW9uIERjKCl7dmFyIGE9dGhpcy5sb2NhbGVEYXRhKCkuX3dlZWs7cmV0dXJuIHhhKHRoaXMueWVhcigpLGEuZG93LGEuZG95KX1mdW5jdGlvbiBFYyhhLGIsYyxkLGUpe3ZhciBmO3JldHVybiBudWxsPT1hP3dhKHRoaXMsZCxlKS55ZWFyOihmPXhhKGEsZCxlKSxiPmYmJihiPWYpLEZjLmNhbGwodGhpcyxhLGIsYyxkLGUpKX1mdW5jdGlvbiBGYyhhLGIsYyxkLGUpe3ZhciBmPXZhKGEsYixjLGQsZSksZz10YShmLnllYXIsMCxmLmRheU9mWWVhcik7cmV0dXJuIHRoaXMueWVhcihnLmdldFVUQ0Z1bGxZZWFyKCkpLHRoaXMubW9udGgoZy5nZXRVVENNb250aCgpKSx0aGlzLmRhdGUoZy5nZXRVVENEYXRlKCkpLHRoaXN9XG4vLyBNT01FTlRTXG5mdW5jdGlvbiBHYyhhKXtyZXR1cm4gbnVsbD09YT9NYXRoLmNlaWwoKHRoaXMubW9udGgoKSsxKS8zKTp0aGlzLm1vbnRoKDMqKGEtMSkrdGhpcy5tb250aCgpJTMpfVxuLy8gSEVMUEVSU1xuLy8gTU9NRU5UU1xuZnVuY3Rpb24gSGMoYSl7dmFyIGI9TWF0aC5yb3VuZCgodGhpcy5jbG9uZSgpLnN0YXJ0T2YoXCJkYXlcIiktdGhpcy5jbG9uZSgpLnN0YXJ0T2YoXCJ5ZWFyXCIpKS84NjRlNSkrMTtyZXR1cm4gbnVsbD09YT9iOnRoaXMuYWRkKGEtYixcImRcIil9ZnVuY3Rpb24gSWMoYSxiKXtiW2dlXT11KDFlMyooXCIwLlwiK2EpKX1cbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIEpjKCl7cmV0dXJuIHRoaXMuX2lzVVRDP1wiVVRDXCI6XCJcIn1mdW5jdGlvbiBLYygpe3JldHVybiB0aGlzLl9pc1VUQz9cIkNvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lXCI6XCJcIn1mdW5jdGlvbiBMYyhhKXtyZXR1cm4gc2IoMWUzKmEpfWZ1bmN0aW9uIE1jKCl7cmV0dXJuIHNiLmFwcGx5KG51bGwsYXJndW1lbnRzKS5wYXJzZVpvbmUoKX1mdW5jdGlvbiBOYyhhKXtyZXR1cm4gYX1mdW5jdGlvbiBPYyhhLGIsYyxkKXt2YXIgZT1iYigpLGY9aygpLnNldChkLGIpO3JldHVybiBlW2NdKGYsYSl9ZnVuY3Rpb24gUGMoYSxiLGMpe2lmKGYoYSkmJihiPWEsYT12b2lkIDApLGE9YXx8XCJcIixudWxsIT1iKXJldHVybiBPYyhhLGIsYyxcIm1vbnRoXCIpO3ZhciBkLGU9W107Zm9yKGQ9MDtkPDEyO2QrKyllW2RdPU9jKGEsZCxjLFwibW9udGhcIik7cmV0dXJuIGV9XG4vLyAoKVxuLy8gKDUpXG4vLyAoZm10LCA1KVxuLy8gKGZtdClcbi8vICh0cnVlKVxuLy8gKHRydWUsIDUpXG4vLyAodHJ1ZSwgZm10LCA1KVxuLy8gKHRydWUsIGZtdClcbmZ1bmN0aW9uIFFjKGEsYixjLGQpe1wiYm9vbGVhblwiPT10eXBlb2YgYT8oZihiKSYmKGM9YixiPXZvaWQgMCksYj1ifHxcIlwiKTooYj1hLGM9YixhPSExLGYoYikmJihjPWIsYj12b2lkIDApLGI9Ynx8XCJcIik7dmFyIGU9YmIoKSxnPWE/ZS5fd2Vlay5kb3c6MDtpZihudWxsIT1jKXJldHVybiBPYyhiLChjK2cpJTcsZCxcImRheVwiKTt2YXIgaCxpPVtdO2ZvcihoPTA7aDw3O2grKylpW2hdPU9jKGIsKGgrZyklNyxkLFwiZGF5XCIpO3JldHVybiBpfWZ1bmN0aW9uIFJjKGEsYil7cmV0dXJuIFBjKGEsYixcIm1vbnRoc1wiKX1mdW5jdGlvbiBTYyhhLGIpe3JldHVybiBQYyhhLGIsXCJtb250aHNTaG9ydFwiKX1mdW5jdGlvbiBUYyhhLGIsYyl7cmV0dXJuIFFjKGEsYixjLFwid2Vla2RheXNcIil9ZnVuY3Rpb24gVWMoYSxiLGMpe3JldHVybiBRYyhhLGIsYyxcIndlZWtkYXlzU2hvcnRcIil9ZnVuY3Rpb24gVmMoYSxiLGMpe3JldHVybiBRYyhhLGIsYyxcIndlZWtkYXlzTWluXCIpfWZ1bmN0aW9uIFdjKCl7dmFyIGE9dGhpcy5fZGF0YTtyZXR1cm4gdGhpcy5fbWlsbGlzZWNvbmRzPVplKHRoaXMuX21pbGxpc2Vjb25kcyksdGhpcy5fZGF5cz1aZSh0aGlzLl9kYXlzKSx0aGlzLl9tb250aHM9WmUodGhpcy5fbW9udGhzKSxhLm1pbGxpc2Vjb25kcz1aZShhLm1pbGxpc2Vjb25kcyksYS5zZWNvbmRzPVplKGEuc2Vjb25kcyksYS5taW51dGVzPVplKGEubWludXRlcyksYS5ob3Vycz1aZShhLmhvdXJzKSxhLm1vbnRocz1aZShhLm1vbnRocyksYS55ZWFycz1aZShhLnllYXJzKSx0aGlzfWZ1bmN0aW9uIFhjKGEsYixjLGQpe3ZhciBlPU9iKGIsYyk7cmV0dXJuIGEuX21pbGxpc2Vjb25kcys9ZCplLl9taWxsaXNlY29uZHMsYS5fZGF5cys9ZCplLl9kYXlzLGEuX21vbnRocys9ZCplLl9tb250aHMsYS5fYnViYmxlKCl9XG4vLyBzdXBwb3J0cyBvbmx5IDIuMC1zdHlsZSBhZGQoMSwgJ3MnKSBvciBhZGQoZHVyYXRpb24pXG5mdW5jdGlvbiBZYyhhLGIpe3JldHVybiBYYyh0aGlzLGEsYiwxKX1cbi8vIHN1cHBvcnRzIG9ubHkgMi4wLXN0eWxlIHN1YnRyYWN0KDEsICdzJykgb3Igc3VidHJhY3QoZHVyYXRpb24pXG5mdW5jdGlvbiBaYyhhLGIpe3JldHVybiBYYyh0aGlzLGEsYiwtMSl9ZnVuY3Rpb24gJGMoYSl7cmV0dXJuIGE8MD9NYXRoLmZsb29yKGEpOk1hdGguY2VpbChhKX1mdW5jdGlvbiBfYygpe3ZhciBhLGIsYyxkLGUsZj10aGlzLl9taWxsaXNlY29uZHMsZz10aGlzLl9kYXlzLGg9dGhpcy5fbW9udGhzLGk9dGhpcy5fZGF0YTtcbi8vIGlmIHdlIGhhdmUgYSBtaXggb2YgcG9zaXRpdmUgYW5kIG5lZ2F0aXZlIHZhbHVlcywgYnViYmxlIGRvd24gZmlyc3Rcbi8vIGNoZWNrOiBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMjE2NlxuLy8gVGhlIGZvbGxvd2luZyBjb2RlIGJ1YmJsZXMgdXAgdmFsdWVzLCBzZWUgdGhlIHRlc3RzIGZvclxuLy8gZXhhbXBsZXMgb2Ygd2hhdCB0aGF0IG1lYW5zLlxuLy8gY29udmVydCBkYXlzIHRvIG1vbnRoc1xuLy8gMTIgbW9udGhzIC0+IDEgeWVhclxucmV0dXJuIGY+PTAmJmc+PTAmJmg+PTB8fGY8PTAmJmc8PTAmJmg8PTB8fChmKz04NjRlNSokYyhiZChoKStnKSxnPTAsaD0wKSxpLm1pbGxpc2Vjb25kcz1mJTFlMyxhPXQoZi8xZTMpLGkuc2Vjb25kcz1hJTYwLGI9dChhLzYwKSxpLm1pbnV0ZXM9YiU2MCxjPXQoYi82MCksaS5ob3Vycz1jJTI0LGcrPXQoYy8yNCksZT10KGFkKGcpKSxoKz1lLGctPSRjKGJkKGUpKSxkPXQoaC8xMiksaCU9MTIsaS5kYXlzPWcsaS5tb250aHM9aCxpLnllYXJzPWQsdGhpc31mdW5jdGlvbiBhZChhKXtcbi8vIDQwMCB5ZWFycyBoYXZlIDE0NjA5NyBkYXlzICh0YWtpbmcgaW50byBhY2NvdW50IGxlYXAgeWVhciBydWxlcylcbi8vIDQwMCB5ZWFycyBoYXZlIDEyIG1vbnRocyA9PT0gNDgwMFxucmV0dXJuIDQ4MDAqYS8xNDYwOTd9ZnVuY3Rpb24gYmQoYSl7XG4vLyB0aGUgcmV2ZXJzZSBvZiBkYXlzVG9Nb250aHNcbnJldHVybiAxNDYwOTcqYS80ODAwfWZ1bmN0aW9uIGNkKGEpe3ZhciBiLGMsZD10aGlzLl9taWxsaXNlY29uZHM7aWYoYT1LKGEpLFwibW9udGhcIj09PWF8fFwieWVhclwiPT09YSlyZXR1cm4gYj10aGlzLl9kYXlzK2QvODY0ZTUsYz10aGlzLl9tb250aHMrYWQoYiksXCJtb250aFwiPT09YT9jOmMvMTI7c3dpdGNoKFxuLy8gaGFuZGxlIG1pbGxpc2Vjb25kcyBzZXBhcmF0ZWx5IGJlY2F1c2Ugb2YgZmxvYXRpbmcgcG9pbnQgbWF0aCBlcnJvcnMgKGlzc3VlICMxODY3KVxuYj10aGlzLl9kYXlzK01hdGgucm91bmQoYmQodGhpcy5fbW9udGhzKSksYSl7Y2FzZVwid2Vla1wiOnJldHVybiBiLzcrZC82MDQ4ZTU7Y2FzZVwiZGF5XCI6cmV0dXJuIGIrZC84NjRlNTtjYXNlXCJob3VyXCI6cmV0dXJuIDI0KmIrZC8zNmU1O2Nhc2VcIm1pbnV0ZVwiOnJldHVybiAxNDQwKmIrZC82ZTQ7Y2FzZVwic2Vjb25kXCI6cmV0dXJuIDg2NDAwKmIrZC8xZTM7XG4vLyBNYXRoLmZsb29yIHByZXZlbnRzIGZsb2F0aW5nIHBvaW50IG1hdGggZXJyb3JzIGhlcmVcbmNhc2VcIm1pbGxpc2Vjb25kXCI6cmV0dXJuIE1hdGguZmxvb3IoODY0ZTUqYikrZDtkZWZhdWx0OnRocm93IG5ldyBFcnJvcihcIlVua25vd24gdW5pdCBcIithKX19XG4vLyBUT0RPOiBVc2UgdGhpcy5hcygnbXMnKT9cbmZ1bmN0aW9uIGRkKCl7cmV0dXJuIHRoaXMuX21pbGxpc2Vjb25kcys4NjRlNSp0aGlzLl9kYXlzK3RoaXMuX21vbnRocyUxMioyNTkyZTYrMzE1MzZlNip1KHRoaXMuX21vbnRocy8xMil9ZnVuY3Rpb24gZWQoYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYXMoYSl9fWZ1bmN0aW9uIGZkKGEpe3JldHVybiBhPUsoYSksdGhpc1thK1wic1wiXSgpfWZ1bmN0aW9uIGdkKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiB0aGlzLl9kYXRhW2FdfX1mdW5jdGlvbiBoZCgpe3JldHVybiB0KHRoaXMuZGF5cygpLzcpfVxuLy8gaGVscGVyIGZ1bmN0aW9uIGZvciBtb21lbnQuZm4uZnJvbSwgbW9tZW50LmZuLmZyb21Ob3csIGFuZCBtb21lbnQuZHVyYXRpb24uZm4uaHVtYW5pemVcbmZ1bmN0aW9uIGlkKGEsYixjLGQsZSl7cmV0dXJuIGUucmVsYXRpdmVUaW1lKGJ8fDEsISFjLGEsZCl9ZnVuY3Rpb24gamQoYSxiLGMpe3ZhciBkPU9iKGEpLmFicygpLGU9b2YoZC5hcyhcInNcIikpLGY9b2YoZC5hcyhcIm1cIikpLGc9b2YoZC5hcyhcImhcIikpLGg9b2YoZC5hcyhcImRcIikpLGk9b2YoZC5hcyhcIk1cIikpLGo9b2YoZC5hcyhcInlcIikpLGs9ZTxwZi5zJiZbXCJzXCIsZV18fGY8PTEmJltcIm1cIl18fGY8cGYubSYmW1wibW1cIixmXXx8Zzw9MSYmW1wiaFwiXXx8ZzxwZi5oJiZbXCJoaFwiLGddfHxoPD0xJiZbXCJkXCJdfHxoPHBmLmQmJltcImRkXCIsaF18fGk8PTEmJltcIk1cIl18fGk8cGYuTSYmW1wiTU1cIixpXXx8ajw9MSYmW1wieVwiXXx8W1wieXlcIixqXTtyZXR1cm4ga1syXT1iLGtbM109K2E+MCxrWzRdPWMsaWQuYXBwbHkobnVsbCxrKX1cbi8vIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHlvdSB0byBzZXQgdGhlIHJvdW5kaW5nIGZ1bmN0aW9uIGZvciByZWxhdGl2ZSB0aW1lIHN0cmluZ3NcbmZ1bmN0aW9uIGtkKGEpe3JldHVybiB2b2lkIDA9PT1hP29mOlwiZnVuY3Rpb25cIj09dHlwZW9mIGEmJihvZj1hLCEwKX1cbi8vIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHlvdSB0byBzZXQgYSB0aHJlc2hvbGQgZm9yIHJlbGF0aXZlIHRpbWUgc3RyaW5nc1xuZnVuY3Rpb24gbGQoYSxiKXtyZXR1cm4gdm9pZCAwIT09cGZbYV0mJih2b2lkIDA9PT1iP3BmW2FdOihwZlthXT1iLCEwKSl9ZnVuY3Rpb24gbWQoYSl7dmFyIGI9dGhpcy5sb2NhbGVEYXRhKCksYz1qZCh0aGlzLCFhLGIpO3JldHVybiBhJiYoYz1iLnBhc3RGdXR1cmUoK3RoaXMsYykpLGIucG9zdGZvcm1hdChjKX1mdW5jdGlvbiBuZCgpe1xuLy8gZm9yIElTTyBzdHJpbmdzIHdlIGRvIG5vdCB1c2UgdGhlIG5vcm1hbCBidWJibGluZyBydWxlczpcbi8vICAqIG1pbGxpc2Vjb25kcyBidWJibGUgdXAgdW50aWwgdGhleSBiZWNvbWUgaG91cnNcbi8vICAqIGRheXMgZG8gbm90IGJ1YmJsZSBhdCBhbGxcbi8vICAqIG1vbnRocyBidWJibGUgdXAgdW50aWwgdGhleSBiZWNvbWUgeWVhcnNcbi8vIFRoaXMgaXMgYmVjYXVzZSB0aGVyZSBpcyBubyBjb250ZXh0LWZyZWUgY29udmVyc2lvbiBiZXR3ZWVuIGhvdXJzIGFuZCBkYXlzXG4vLyAodGhpbmsgb2YgY2xvY2sgY2hhbmdlcylcbi8vIGFuZCBhbHNvIG5vdCBiZXR3ZWVuIGRheXMgYW5kIG1vbnRocyAoMjgtMzEgZGF5cyBwZXIgbW9udGgpXG52YXIgYSxiLGMsZD1xZih0aGlzLl9taWxsaXNlY29uZHMpLzFlMyxlPXFmKHRoaXMuX2RheXMpLGY9cWYodGhpcy5fbW9udGhzKTtcbi8vIDM2MDAgc2Vjb25kcyAtPiA2MCBtaW51dGVzIC0+IDEgaG91clxuYT10KGQvNjApLGI9dChhLzYwKSxkJT02MCxhJT02MCxcbi8vIDEyIG1vbnRocyAtPiAxIHllYXJcbmM9dChmLzEyKSxmJT0xMjtcbi8vIGluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9kb3JkaWxsZS9tb21lbnQtaXNvZHVyYXRpb24vYmxvYi9tYXN0ZXIvbW9tZW50Lmlzb2R1cmF0aW9uLmpzXG52YXIgZz1jLGg9ZixpPWUsaj1iLGs9YSxsPWQsbT10aGlzLmFzU2Vjb25kcygpO3JldHVybiBtPyhtPDA/XCItXCI6XCJcIikrXCJQXCIrKGc/ZytcIllcIjpcIlwiKSsoaD9oK1wiTVwiOlwiXCIpKyhpP2krXCJEXCI6XCJcIikrKGp8fGt8fGw/XCJUXCI6XCJcIikrKGo/aitcIkhcIjpcIlwiKSsoaz9rK1wiTVwiOlwiXCIpKyhsP2wrXCJTXCI6XCJcIik6XCJQMERcIn12YXIgb2QscGQ7cGQ9QXJyYXkucHJvdG90eXBlLnNvbWU/QXJyYXkucHJvdG90eXBlLnNvbWU6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPU9iamVjdCh0aGlzKSxjPWIubGVuZ3RoPj4+MCxkPTA7ZDxjO2QrKylpZihkIGluIGImJmEuY2FsbCh0aGlzLGJbZF0sZCxiKSlyZXR1cm4hMDtyZXR1cm4hMX07dmFyIHFkPXBkLHJkPWEubW9tZW50UHJvcGVydGllcz1bXSxzZD0hMSx0ZD17fTthLnN1cHByZXNzRGVwcmVjYXRpb25XYXJuaW5ncz0hMSxhLmRlcHJlY2F0aW9uSGFuZGxlcj1udWxsO3ZhciB1ZDt1ZD1PYmplY3Qua2V5cz9PYmplY3Qua2V5czpmdW5jdGlvbihhKXt2YXIgYixjPVtdO2ZvcihiIGluIGEpaShhLGIpJiZjLnB1c2goYik7cmV0dXJuIGN9O3ZhciB2ZCx3ZD11ZCx4ZD17c2FtZURheTpcIltUb2RheSBhdF0gTFRcIixuZXh0RGF5OlwiW1RvbW9ycm93IGF0XSBMVFwiLG5leHRXZWVrOlwiZGRkZCBbYXRdIExUXCIsbGFzdERheTpcIltZZXN0ZXJkYXkgYXRdIExUXCIsbGFzdFdlZWs6XCJbTGFzdF0gZGRkZCBbYXRdIExUXCIsc2FtZUVsc2U6XCJMXCJ9LHlkPXtMVFM6XCJoOm1tOnNzIEFcIixMVDpcImg6bW0gQVwiLEw6XCJNTS9ERC9ZWVlZXCIsTEw6XCJNTU1NIEQsIFlZWVlcIixMTEw6XCJNTU1NIEQsIFlZWVkgaDptbSBBXCIsTExMTDpcImRkZGQsIE1NTU0gRCwgWVlZWSBoOm1tIEFcIn0semQ9XCJJbnZhbGlkIGRhdGVcIixBZD1cIiVkXCIsQmQ9L1xcZHsxLDJ9LyxDZD17ZnV0dXJlOlwiaW4gJXNcIixwYXN0OlwiJXMgYWdvXCIsczpcImEgZmV3IHNlY29uZHNcIixtOlwiYSBtaW51dGVcIixtbTpcIiVkIG1pbnV0ZXNcIixoOlwiYW4gaG91clwiLGhoOlwiJWQgaG91cnNcIixkOlwiYSBkYXlcIixkZDpcIiVkIGRheXNcIixNOlwiYSBtb250aFwiLE1NOlwiJWQgbW9udGhzXCIseTpcImEgeWVhclwiLHl5OlwiJWQgeWVhcnNcIn0sRGQ9e30sRWQ9e30sRmQ9LyhcXFtbXlxcW10qXFxdKXwoXFxcXCk/KFtIaF1tbShzcyk/fE1vfE1NP00/TT98RG98REREb3xERD9EP0Q/fGRkZD9kP3xkbz98d1tvfHddP3xXW298V10/fFFvP3xZWVlZWVl8WVlZWVl8WVlZWXxZWXxnZyhnZ2c/KT98R0coR0dHPyk/fGV8RXxhfEF8aGg/fEhIP3xraz98bW0/fHNzP3xTezEsOX18eHxYfHp6P3xaWj98LikvZyxHZD0vKFxcW1teXFxbXSpcXF0pfChcXFxcKT8oTFRTfExUfExMP0w/TD98bHsxLDR9KS9nLEhkPXt9LElkPXt9LEpkPS9cXGQvLEtkPS9cXGRcXGQvLExkPS9cXGR7M30vLE1kPS9cXGR7NH0vLE5kPS9bKy1dP1xcZHs2fS8sT2Q9L1xcZFxcZD8vLFBkPS9cXGRcXGRcXGRcXGQ/LyxRZD0vXFxkXFxkXFxkXFxkXFxkXFxkPy8sUmQ9L1xcZHsxLDN9LyxTZD0vXFxkezEsNH0vLFRkPS9bKy1dP1xcZHsxLDZ9LyxVZD0vXFxkKy8sVmQ9L1srLV0/XFxkKy8sV2Q9L1p8WystXVxcZFxcZDo/XFxkXFxkL2dpLFhkPS9afFsrLV1cXGRcXGQoPzo6P1xcZFxcZCk/L2dpLFlkPS9bKy1dP1xcZCsoXFwuXFxkezEsM30pPy8sWmQ9L1swLTldKlsnYS16XFx1MDBBMC1cXHUwNUZGXFx1MDcwMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSt8W1xcdTA2MDAtXFx1MDZGRlxcL10rKFxccyo/W1xcdTA2MDAtXFx1MDZGRl0rKXsxLDJ9L2ksJGQ9e30sX2Q9e30sYWU9MCxiZT0xLGNlPTIsZGU9MyxlZT00LGZlPTUsZ2U9NixoZT03LGllPTg7dmQ9QXJyYXkucHJvdG90eXBlLmluZGV4T2Y/QXJyYXkucHJvdG90eXBlLmluZGV4T2Y6ZnVuY3Rpb24oYSl7XG4vLyBJIGtub3dcbnZhciBiO2ZvcihiPTA7Yjx0aGlzLmxlbmd0aDsrK2IpaWYodGhpc1tiXT09PWEpcmV0dXJuIGI7cmV0dXJuLTF9O3ZhciBqZT12ZDtcbi8vIEZPUk1BVFRJTkdcblUoXCJNXCIsW1wiTU1cIiwyXSxcIk1vXCIsZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tb250aCgpKzF9KSxVKFwiTU1NXCIsMCwwLGZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tb250aHNTaG9ydCh0aGlzLGEpfSksVShcIk1NTU1cIiwwLDAsZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm1vbnRocyh0aGlzLGEpfSksXG4vLyBBTElBU0VTXG5KKFwibW9udGhcIixcIk1cIiksXG4vLyBQUklPUklUWVxuTShcIm1vbnRoXCIsOCksXG4vLyBQQVJTSU5HXG5aKFwiTVwiLE9kKSxaKFwiTU1cIixPZCxLZCksWihcIk1NTVwiLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIubW9udGhzU2hvcnRSZWdleChhKX0pLFooXCJNTU1NXCIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi5tb250aHNSZWdleChhKX0pLGJhKFtcIk1cIixcIk1NXCJdLGZ1bmN0aW9uKGEsYil7YltiZV09dShhKS0xfSksYmEoW1wiTU1NXCIsXCJNTU1NXCJdLGZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWMuX2xvY2FsZS5tb250aHNQYXJzZShhLGQsYy5fc3RyaWN0KTtcbi8vIGlmIHdlIGRpZG4ndCBmaW5kIGEgbW9udGggbmFtZSwgbWFyayB0aGUgZGF0ZSBhcyBpbnZhbGlkLlxubnVsbCE9ZT9iW2JlXT1lOm0oYykuaW52YWxpZE1vbnRoPWF9KTtcbi8vIExPQ0FMRVNcbnZhciBrZT0vRFtvRF0/KFxcW1teXFxbXFxdXSpcXF18XFxzKStNTU1NPy8sbGU9XCJKYW51YXJ5X0ZlYnJ1YXJ5X01hcmNoX0FwcmlsX01heV9KdW5lX0p1bHlfQXVndXN0X1NlcHRlbWJlcl9PY3RvYmVyX05vdmVtYmVyX0RlY2VtYmVyXCIuc3BsaXQoXCJfXCIpLG1lPVwiSmFuX0ZlYl9NYXJfQXByX01heV9KdW5fSnVsX0F1Z19TZXBfT2N0X05vdl9EZWNcIi5zcGxpdChcIl9cIiksbmU9WmQsb2U9WmQ7XG4vLyBGT1JNQVRUSU5HXG5VKFwiWVwiLDAsMCxmdW5jdGlvbigpe3ZhciBhPXRoaXMueWVhcigpO3JldHVybiBhPD05OTk5P1wiXCIrYTpcIitcIithfSksVSgwLFtcIllZXCIsMl0sMCxmdW5jdGlvbigpe3JldHVybiB0aGlzLnllYXIoKSUxMDB9KSxVKDAsW1wiWVlZWVwiLDRdLDAsXCJ5ZWFyXCIpLFUoMCxbXCJZWVlZWVwiLDVdLDAsXCJ5ZWFyXCIpLFUoMCxbXCJZWVlZWVlcIiw2LCEwXSwwLFwieWVhclwiKSxcbi8vIEFMSUFTRVNcbkooXCJ5ZWFyXCIsXCJ5XCIpLFxuLy8gUFJJT1JJVElFU1xuTShcInllYXJcIiwxKSxcbi8vIFBBUlNJTkdcblooXCJZXCIsVmQpLFooXCJZWVwiLE9kLEtkKSxaKFwiWVlZWVwiLFNkLE1kKSxaKFwiWVlZWVlcIixUZCxOZCksWihcIllZWVlZWVwiLFRkLE5kKSxiYShbXCJZWVlZWVwiLFwiWVlZWVlZXCJdLGFlKSxiYShcIllZWVlcIixmdW5jdGlvbihiLGMpe2NbYWVdPTI9PT1iLmxlbmd0aD9hLnBhcnNlVHdvRGlnaXRZZWFyKGIpOnUoYil9KSxiYShcIllZXCIsZnVuY3Rpb24oYixjKXtjW2FlXT1hLnBhcnNlVHdvRGlnaXRZZWFyKGIpfSksYmEoXCJZXCIsZnVuY3Rpb24oYSxiKXtiW2FlXT1wYXJzZUludChhLDEwKX0pLFxuLy8gSE9PS1NcbmEucGFyc2VUd29EaWdpdFllYXI9ZnVuY3Rpb24oYSl7cmV0dXJuIHUoYSkrKHUoYSk+Njg/MTkwMDoyZTMpfTtcbi8vIE1PTUVOVFNcbnZhciBwZT1PKFwiRnVsbFllYXJcIiwhMCk7XG4vLyBGT1JNQVRUSU5HXG5VKFwid1wiLFtcInd3XCIsMl0sXCJ3b1wiLFwid2Vla1wiKSxVKFwiV1wiLFtcIldXXCIsMl0sXCJXb1wiLFwiaXNvV2Vla1wiKSxcbi8vIEFMSUFTRVNcbkooXCJ3ZWVrXCIsXCJ3XCIpLEooXCJpc29XZWVrXCIsXCJXXCIpLFxuLy8gUFJJT1JJVElFU1xuTShcIndlZWtcIiw1KSxNKFwiaXNvV2Vla1wiLDUpLFxuLy8gUEFSU0lOR1xuWihcIndcIixPZCksWihcInd3XCIsT2QsS2QpLFooXCJXXCIsT2QpLFooXCJXV1wiLE9kLEtkKSxjYShbXCJ3XCIsXCJ3d1wiLFwiV1wiLFwiV1dcIl0sZnVuY3Rpb24oYSxiLGMsZCl7YltkLnN1YnN0cigwLDEpXT11KGEpfSk7dmFyIHFlPXtkb3c6MCwvLyBTdW5kYXkgaXMgdGhlIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cbmRveTo2fTtcbi8vIEZPUk1BVFRJTkdcblUoXCJkXCIsMCxcImRvXCIsXCJkYXlcIiksVShcImRkXCIsMCwwLGZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5c01pbih0aGlzLGEpfSksVShcImRkZFwiLDAsMCxmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXNTaG9ydCh0aGlzLGEpfSksVShcImRkZGRcIiwwLDAsZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzKHRoaXMsYSl9KSxVKFwiZVwiLDAsMCxcIndlZWtkYXlcIiksVShcIkVcIiwwLDAsXCJpc29XZWVrZGF5XCIpLFxuLy8gQUxJQVNFU1xuSihcImRheVwiLFwiZFwiKSxKKFwid2Vla2RheVwiLFwiZVwiKSxKKFwiaXNvV2Vla2RheVwiLFwiRVwiKSxcbi8vIFBSSU9SSVRZXG5NKFwiZGF5XCIsMTEpLE0oXCJ3ZWVrZGF5XCIsMTEpLE0oXCJpc29XZWVrZGF5XCIsMTEpLFxuLy8gUEFSU0lOR1xuWihcImRcIixPZCksWihcImVcIixPZCksWihcIkVcIixPZCksWihcImRkXCIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi53ZWVrZGF5c01pblJlZ2V4KGEpfSksWihcImRkZFwiLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIud2Vla2RheXNTaG9ydFJlZ2V4KGEpfSksWihcImRkZGRcIixmdW5jdGlvbihhLGIpe3JldHVybiBiLndlZWtkYXlzUmVnZXgoYSl9KSxjYShbXCJkZFwiLFwiZGRkXCIsXCJkZGRkXCJdLGZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWMuX2xvY2FsZS53ZWVrZGF5c1BhcnNlKGEsZCxjLl9zdHJpY3QpO1xuLy8gaWYgd2UgZGlkbid0IGdldCBhIHdlZWtkYXkgbmFtZSwgbWFyayB0aGUgZGF0ZSBhcyBpbnZhbGlkXG5udWxsIT1lP2IuZD1lOm0oYykuaW52YWxpZFdlZWtkYXk9YX0pLGNhKFtcImRcIixcImVcIixcIkVcIl0sZnVuY3Rpb24oYSxiLGMsZCl7YltkXT11KGEpfSk7XG4vLyBMT0NBTEVTXG52YXIgcmU9XCJTdW5kYXlfTW9uZGF5X1R1ZXNkYXlfV2VkbmVzZGF5X1RodXJzZGF5X0ZyaWRheV9TYXR1cmRheVwiLnNwbGl0KFwiX1wiKSxzZT1cIlN1bl9Nb25fVHVlX1dlZF9UaHVfRnJpX1NhdFwiLnNwbGl0KFwiX1wiKSx0ZT1cIlN1X01vX1R1X1dlX1RoX0ZyX1NhXCIuc3BsaXQoXCJfXCIpLHVlPVpkLHZlPVpkLHdlPVpkO1UoXCJIXCIsW1wiSEhcIiwyXSwwLFwiaG91clwiKSxVKFwiaFwiLFtcImhoXCIsMl0sMCxSYSksVShcImtcIixbXCJra1wiLDJdLDAsU2EpLFUoXCJobW1cIiwwLDAsZnVuY3Rpb24oKXtyZXR1cm5cIlwiK1JhLmFwcGx5KHRoaXMpK1QodGhpcy5taW51dGVzKCksMil9KSxVKFwiaG1tc3NcIiwwLDAsZnVuY3Rpb24oKXtyZXR1cm5cIlwiK1JhLmFwcGx5KHRoaXMpK1QodGhpcy5taW51dGVzKCksMikrVCh0aGlzLnNlY29uZHMoKSwyKX0pLFUoXCJIbW1cIiwwLDAsZnVuY3Rpb24oKXtyZXR1cm5cIlwiK3RoaXMuaG91cnMoKStUKHRoaXMubWludXRlcygpLDIpfSksVShcIkhtbXNzXCIsMCwwLGZ1bmN0aW9uKCl7cmV0dXJuXCJcIit0aGlzLmhvdXJzKCkrVCh0aGlzLm1pbnV0ZXMoKSwyKStUKHRoaXMuc2Vjb25kcygpLDIpfSksVGEoXCJhXCIsITApLFRhKFwiQVwiLCExKSxcbi8vIEFMSUFTRVNcbkooXCJob3VyXCIsXCJoXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJob3VyXCIsMTMpLFooXCJhXCIsVWEpLFooXCJBXCIsVWEpLFooXCJIXCIsT2QpLFooXCJoXCIsT2QpLFooXCJISFwiLE9kLEtkKSxaKFwiaGhcIixPZCxLZCksWihcImhtbVwiLFBkKSxaKFwiaG1tc3NcIixRZCksWihcIkhtbVwiLFBkKSxaKFwiSG1tc3NcIixRZCksYmEoW1wiSFwiLFwiSEhcIl0sZGUpLGJhKFtcImFcIixcIkFcIl0sZnVuY3Rpb24oYSxiLGMpe2MuX2lzUG09Yy5fbG9jYWxlLmlzUE0oYSksYy5fbWVyaWRpZW09YX0pLGJhKFtcImhcIixcImhoXCJdLGZ1bmN0aW9uKGEsYixjKXtiW2RlXT11KGEpLG0oYykuYmlnSG91cj0hMH0pLGJhKFwiaG1tXCIsZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWEubGVuZ3RoLTI7YltkZV09dShhLnN1YnN0cigwLGQpKSxiW2VlXT11KGEuc3Vic3RyKGQpKSxtKGMpLmJpZ0hvdXI9ITB9KSxiYShcImhtbXNzXCIsZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWEubGVuZ3RoLTQsZT1hLmxlbmd0aC0yO2JbZGVdPXUoYS5zdWJzdHIoMCxkKSksYltlZV09dShhLnN1YnN0cihkLDIpKSxiW2ZlXT11KGEuc3Vic3RyKGUpKSxtKGMpLmJpZ0hvdXI9ITB9KSxiYShcIkhtbVwiLGZ1bmN0aW9uKGEsYixjKXt2YXIgZD1hLmxlbmd0aC0yO2JbZGVdPXUoYS5zdWJzdHIoMCxkKSksYltlZV09dShhLnN1YnN0cihkKSl9KSxiYShcIkhtbXNzXCIsZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWEubGVuZ3RoLTQsZT1hLmxlbmd0aC0yO2JbZGVdPXUoYS5zdWJzdHIoMCxkKSksYltlZV09dShhLnN1YnN0cihkLDIpKSxiW2ZlXT11KGEuc3Vic3RyKGUpKX0pO3ZhciB4ZSx5ZT0vW2FwXVxcLj9tP1xcLj8vaSx6ZT1PKFwiSG91cnNcIiwhMCksQWU9e2NhbGVuZGFyOnhkLGxvbmdEYXRlRm9ybWF0OnlkLGludmFsaWREYXRlOnpkLG9yZGluYWw6QWQsb3JkaW5hbFBhcnNlOkJkLHJlbGF0aXZlVGltZTpDZCxtb250aHM6bGUsbW9udGhzU2hvcnQ6bWUsd2VlazpxZSx3ZWVrZGF5czpyZSx3ZWVrZGF5c01pbjp0ZSx3ZWVrZGF5c1Nob3J0OnNlLG1lcmlkaWVtUGFyc2U6eWV9LEJlPXt9LENlPXt9LERlPS9eXFxzKigoPzpbKy1dXFxkezZ9fFxcZHs0fSktKD86XFxkXFxkLVxcZFxcZHxXXFxkXFxkLVxcZHxXXFxkXFxkfFxcZFxcZFxcZHxcXGRcXGQpKSg/OihUfCApKFxcZFxcZCg/OjpcXGRcXGQoPzo6XFxkXFxkKD86Wy4sXVxcZCspPyk/KT8pKFtcXCtcXC1dXFxkXFxkKD86Oj9cXGRcXGQpP3xcXHMqWik/KT8kLyxFZT0vXlxccyooKD86WystXVxcZHs2fXxcXGR7NH0pKD86XFxkXFxkXFxkXFxkfFdcXGRcXGRcXGR8V1xcZFxcZHxcXGRcXGRcXGR8XFxkXFxkKSkoPzooVHwgKShcXGRcXGQoPzpcXGRcXGQoPzpcXGRcXGQoPzpbLixdXFxkKyk/KT8pPykoW1xcK1xcLV1cXGRcXGQoPzo6P1xcZFxcZCk/fFxccypaKT8pPyQvLEZlPS9afFsrLV1cXGRcXGQoPzo6P1xcZFxcZCk/LyxHZT1bW1wiWVlZWVlZLU1NLUREXCIsL1srLV1cXGR7Nn0tXFxkXFxkLVxcZFxcZC9dLFtcIllZWVktTU0tRERcIiwvXFxkezR9LVxcZFxcZC1cXGRcXGQvXSxbXCJHR0dHLVtXXVdXLUVcIiwvXFxkezR9LVdcXGRcXGQtXFxkL10sW1wiR0dHRy1bV11XV1wiLC9cXGR7NH0tV1xcZFxcZC8sITFdLFtcIllZWVktREREXCIsL1xcZHs0fS1cXGR7M30vXSxbXCJZWVlZLU1NXCIsL1xcZHs0fS1cXGRcXGQvLCExXSxbXCJZWVlZWVlNTUREXCIsL1srLV1cXGR7MTB9L10sW1wiWVlZWU1NRERcIiwvXFxkezh9L10sXG4vLyBZWVlZTU0gaXMgTk9UIGFsbG93ZWQgYnkgdGhlIHN0YW5kYXJkXG5bXCJHR0dHW1ddV1dFXCIsL1xcZHs0fVdcXGR7M30vXSxbXCJHR0dHW1ddV1dcIiwvXFxkezR9V1xcZHsyfS8sITFdLFtcIllZWVlERERcIiwvXFxkezd9L11dLEhlPVtbXCJISDptbTpzcy5TU1NTXCIsL1xcZFxcZDpcXGRcXGQ6XFxkXFxkXFwuXFxkKy9dLFtcIkhIOm1tOnNzLFNTU1NcIiwvXFxkXFxkOlxcZFxcZDpcXGRcXGQsXFxkKy9dLFtcIkhIOm1tOnNzXCIsL1xcZFxcZDpcXGRcXGQ6XFxkXFxkL10sW1wiSEg6bW1cIiwvXFxkXFxkOlxcZFxcZC9dLFtcIkhIbW1zcy5TU1NTXCIsL1xcZFxcZFxcZFxcZFxcZFxcZFxcLlxcZCsvXSxbXCJISG1tc3MsU1NTU1wiLC9cXGRcXGRcXGRcXGRcXGRcXGQsXFxkKy9dLFtcIkhIbW1zc1wiLC9cXGRcXGRcXGRcXGRcXGRcXGQvXSxbXCJISG1tXCIsL1xcZFxcZFxcZFxcZC9dLFtcIkhIXCIsL1xcZFxcZC9dXSxJZT0vXlxcLz9EYXRlXFwoKFxcLT9cXGQrKS9pO2EuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2s9eChcInZhbHVlIHByb3ZpZGVkIGlzIG5vdCBpbiBhIHJlY29nbml6ZWQgSVNPIGZvcm1hdC4gbW9tZW50IGNvbnN0cnVjdGlvbiBmYWxscyBiYWNrIHRvIGpzIERhdGUoKSwgd2hpY2ggaXMgbm90IHJlbGlhYmxlIGFjcm9zcyBhbGwgYnJvd3NlcnMgYW5kIHZlcnNpb25zLiBOb24gSVNPIGRhdGUgZm9ybWF0cyBhcmUgZGlzY291cmFnZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhbiB1cGNvbWluZyBtYWpvciByZWxlYXNlLiBQbGVhc2UgcmVmZXIgdG8gaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9qcy1kYXRlLyBmb3IgbW9yZSBpbmZvLlwiLGZ1bmN0aW9uKGEpe2EuX2Q9bmV3IERhdGUoYS5faSsoYS5fdXNlVVRDP1wiIFVUQ1wiOlwiXCIpKX0pLFxuLy8gY29uc3RhbnQgdGhhdCByZWZlcnMgdG8gdGhlIElTTyBzdGFuZGFyZFxuYS5JU09fODYwMT1mdW5jdGlvbigpe307dmFyIEplPXgoXCJtb21lbnQoKS5taW4gaXMgZGVwcmVjYXRlZCwgdXNlIG1vbWVudC5tYXggaW5zdGVhZC4gaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9taW4tbWF4L1wiLGZ1bmN0aW9uKCl7dmFyIGE9c2IuYXBwbHkobnVsbCxhcmd1bWVudHMpO3JldHVybiB0aGlzLmlzVmFsaWQoKSYmYS5pc1ZhbGlkKCk/YTx0aGlzP3RoaXM6YTpvKCl9KSxLZT14KFwibW9tZW50KCkubWF4IGlzIGRlcHJlY2F0ZWQsIHVzZSBtb21lbnQubWluIGluc3RlYWQuIGh0dHA6Ly9tb21lbnRqcy5jb20vZ3VpZGVzLyMvd2FybmluZ3MvbWluLW1heC9cIixmdW5jdGlvbigpe3ZhciBhPXNiLmFwcGx5KG51bGwsYXJndW1lbnRzKTtyZXR1cm4gdGhpcy5pc1ZhbGlkKCkmJmEuaXNWYWxpZCgpP2E+dGhpcz90aGlzOmE6bygpfSksTGU9ZnVuY3Rpb24oKXtyZXR1cm4gRGF0ZS5ub3c/RGF0ZS5ub3coKTorbmV3IERhdGV9O3piKFwiWlwiLFwiOlwiKSx6YihcIlpaXCIsXCJcIiksXG4vLyBQQVJTSU5HXG5aKFwiWlwiLFhkKSxaKFwiWlpcIixYZCksYmEoW1wiWlwiLFwiWlpcIl0sZnVuY3Rpb24oYSxiLGMpe2MuX3VzZVVUQz0hMCxjLl90em09QWIoWGQsYSl9KTtcbi8vIEhFTFBFUlNcbi8vIHRpbWV6b25lIGNodW5rZXJcbi8vICcrMTA6MDAnID4gWycxMCcsICAnMDAnXVxuLy8gJy0xNTMwJyAgPiBbJy0xNScsICczMCddXG52YXIgTWU9LyhbXFwrXFwtXXxcXGRcXGQpL2dpO1xuLy8gSE9PS1Ncbi8vIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXIgYSBtb21lbnQgaXMgbXV0YXRlZC5cbi8vIEl0IGlzIGludGVuZGVkIHRvIGtlZXAgdGhlIG9mZnNldCBpbiBzeW5jIHdpdGggdGhlIHRpbWV6b25lLlxuYS51cGRhdGVPZmZzZXQ9ZnVuY3Rpb24oKXt9O1xuLy8gQVNQLk5FVCBqc29uIGRhdGUgZm9ybWF0IHJlZ2V4XG52YXIgTmU9L14oXFwtKT8oPzooXFxkKilbLiBdKT8oXFxkKylcXDooXFxkKykoPzpcXDooXFxkKykoXFwuXFxkKik/KT8kLyxPZT0vXigtKT9QKD86KC0/WzAtOSwuXSopWSk/KD86KC0/WzAtOSwuXSopTSk/KD86KC0/WzAtOSwuXSopVyk/KD86KC0/WzAtOSwuXSopRCk/KD86VCg/OigtP1swLTksLl0qKUgpPyg/OigtP1swLTksLl0qKU0pPyg/OigtP1swLTksLl0qKVMpPyk/JC87T2IuZm49d2IucHJvdG90eXBlO3ZhciBQZT1TYigxLFwiYWRkXCIpLFFlPVNiKC0xLFwic3VidHJhY3RcIik7YS5kZWZhdWx0Rm9ybWF0PVwiWVlZWS1NTS1ERFRISDptbTpzc1pcIixhLmRlZmF1bHRGb3JtYXRVdGM9XCJZWVlZLU1NLUREVEhIOm1tOnNzW1pdXCI7dmFyIFJlPXgoXCJtb21lbnQoKS5sYW5nKCkgaXMgZGVwcmVjYXRlZC4gSW5zdGVhZCwgdXNlIG1vbWVudCgpLmxvY2FsZURhdGEoKSB0byBnZXQgdGhlIGxhbmd1YWdlIGNvbmZpZ3VyYXRpb24uIFVzZSBtb21lbnQoKS5sb2NhbGUoKSB0byBjaGFuZ2UgbGFuZ3VhZ2VzLlwiLGZ1bmN0aW9uKGEpe3JldHVybiB2b2lkIDA9PT1hP3RoaXMubG9jYWxlRGF0YSgpOnRoaXMubG9jYWxlKGEpfSk7XG4vLyBGT1JNQVRUSU5HXG5VKDAsW1wiZ2dcIiwyXSwwLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMud2Vla1llYXIoKSUxMDB9KSxVKDAsW1wiR0dcIiwyXSwwLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaXNvV2Vla1llYXIoKSUxMDB9KSx6YyhcImdnZ2dcIixcIndlZWtZZWFyXCIpLHpjKFwiZ2dnZ2dcIixcIndlZWtZZWFyXCIpLHpjKFwiR0dHR1wiLFwiaXNvV2Vla1llYXJcIiksemMoXCJHR0dHR1wiLFwiaXNvV2Vla1llYXJcIiksXG4vLyBBTElBU0VTXG5KKFwid2Vla1llYXJcIixcImdnXCIpLEooXCJpc29XZWVrWWVhclwiLFwiR0dcIiksXG4vLyBQUklPUklUWVxuTShcIndlZWtZZWFyXCIsMSksTShcImlzb1dlZWtZZWFyXCIsMSksXG4vLyBQQVJTSU5HXG5aKFwiR1wiLFZkKSxaKFwiZ1wiLFZkKSxaKFwiR0dcIixPZCxLZCksWihcImdnXCIsT2QsS2QpLFooXCJHR0dHXCIsU2QsTWQpLFooXCJnZ2dnXCIsU2QsTWQpLFooXCJHR0dHR1wiLFRkLE5kKSxaKFwiZ2dnZ2dcIixUZCxOZCksY2EoW1wiZ2dnZ1wiLFwiZ2dnZ2dcIixcIkdHR0dcIixcIkdHR0dHXCJdLGZ1bmN0aW9uKGEsYixjLGQpe2JbZC5zdWJzdHIoMCwyKV09dShhKX0pLGNhKFtcImdnXCIsXCJHR1wiXSxmdW5jdGlvbihiLGMsZCxlKXtjW2VdPWEucGFyc2VUd29EaWdpdFllYXIoYil9KSxcbi8vIEZPUk1BVFRJTkdcblUoXCJRXCIsMCxcIlFvXCIsXCJxdWFydGVyXCIpLFxuLy8gQUxJQVNFU1xuSihcInF1YXJ0ZXJcIixcIlFcIiksXG4vLyBQUklPUklUWVxuTShcInF1YXJ0ZXJcIiw3KSxcbi8vIFBBUlNJTkdcblooXCJRXCIsSmQpLGJhKFwiUVwiLGZ1bmN0aW9uKGEsYil7YltiZV09MyoodShhKS0xKX0pLFxuLy8gRk9STUFUVElOR1xuVShcIkRcIixbXCJERFwiLDJdLFwiRG9cIixcImRhdGVcIiksXG4vLyBBTElBU0VTXG5KKFwiZGF0ZVwiLFwiRFwiKSxcbi8vIFBSSU9ST0lUWVxuTShcImRhdGVcIiw5KSxcbi8vIFBBUlNJTkdcblooXCJEXCIsT2QpLFooXCJERFwiLE9kLEtkKSxaKFwiRG9cIixmdW5jdGlvbihhLGIpe3JldHVybiBhP2IuX29yZGluYWxQYXJzZTpiLl9vcmRpbmFsUGFyc2VMZW5pZW50fSksYmEoW1wiRFwiLFwiRERcIl0sY2UpLGJhKFwiRG9cIixmdW5jdGlvbihhLGIpe2JbY2VdPXUoYS5tYXRjaChPZClbMF0sMTApfSk7XG4vLyBNT01FTlRTXG52YXIgU2U9TyhcIkRhdGVcIiwhMCk7XG4vLyBGT1JNQVRUSU5HXG5VKFwiREREXCIsW1wiRERERFwiLDNdLFwiREREb1wiLFwiZGF5T2ZZZWFyXCIpLFxuLy8gQUxJQVNFU1xuSihcImRheU9mWWVhclwiLFwiREREXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJkYXlPZlllYXJcIiw0KSxcbi8vIFBBUlNJTkdcblooXCJERERcIixSZCksWihcIkRERERcIixMZCksYmEoW1wiREREXCIsXCJEREREXCJdLGZ1bmN0aW9uKGEsYixjKXtjLl9kYXlPZlllYXI9dShhKX0pLFxuLy8gRk9STUFUVElOR1xuVShcIm1cIixbXCJtbVwiLDJdLDAsXCJtaW51dGVcIiksXG4vLyBBTElBU0VTXG5KKFwibWludXRlXCIsXCJtXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJtaW51dGVcIiwxNCksXG4vLyBQQVJTSU5HXG5aKFwibVwiLE9kKSxaKFwibW1cIixPZCxLZCksYmEoW1wibVwiLFwibW1cIl0sZWUpO1xuLy8gTU9NRU5UU1xudmFyIFRlPU8oXCJNaW51dGVzXCIsITEpO1xuLy8gRk9STUFUVElOR1xuVShcInNcIixbXCJzc1wiLDJdLDAsXCJzZWNvbmRcIiksXG4vLyBBTElBU0VTXG5KKFwic2Vjb25kXCIsXCJzXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJzZWNvbmRcIiwxNSksXG4vLyBQQVJTSU5HXG5aKFwic1wiLE9kKSxaKFwic3NcIixPZCxLZCksYmEoW1wic1wiLFwic3NcIl0sZmUpO1xuLy8gTU9NRU5UU1xudmFyIFVlPU8oXCJTZWNvbmRzXCIsITEpO1xuLy8gRk9STUFUVElOR1xuVShcIlNcIiwwLDAsZnVuY3Rpb24oKXtyZXR1cm5+fih0aGlzLm1pbGxpc2Vjb25kKCkvMTAwKX0pLFUoMCxbXCJTU1wiLDJdLDAsZnVuY3Rpb24oKXtyZXR1cm5+fih0aGlzLm1pbGxpc2Vjb25kKCkvMTApfSksVSgwLFtcIlNTU1wiLDNdLDAsXCJtaWxsaXNlY29uZFwiKSxVKDAsW1wiU1NTU1wiLDRdLDAsZnVuY3Rpb24oKXtyZXR1cm4gMTAqdGhpcy5taWxsaXNlY29uZCgpfSksVSgwLFtcIlNTU1NTXCIsNV0sMCxmdW5jdGlvbigpe3JldHVybiAxMDAqdGhpcy5taWxsaXNlY29uZCgpfSksVSgwLFtcIlNTU1NTU1wiLDZdLDAsZnVuY3Rpb24oKXtyZXR1cm4gMWUzKnRoaXMubWlsbGlzZWNvbmQoKX0pLFUoMCxbXCJTU1NTU1NTXCIsN10sMCxmdW5jdGlvbigpe3JldHVybiAxZTQqdGhpcy5taWxsaXNlY29uZCgpfSksVSgwLFtcIlNTU1NTU1NTXCIsOF0sMCxmdW5jdGlvbigpe3JldHVybiAxZTUqdGhpcy5taWxsaXNlY29uZCgpfSksVSgwLFtcIlNTU1NTU1NTU1wiLDldLDAsZnVuY3Rpb24oKXtyZXR1cm4gMWU2KnRoaXMubWlsbGlzZWNvbmQoKX0pLFxuLy8gQUxJQVNFU1xuSihcIm1pbGxpc2Vjb25kXCIsXCJtc1wiKSxcbi8vIFBSSU9SSVRZXG5NKFwibWlsbGlzZWNvbmRcIiwxNiksXG4vLyBQQVJTSU5HXG5aKFwiU1wiLFJkLEpkKSxaKFwiU1NcIixSZCxLZCksWihcIlNTU1wiLFJkLExkKTt2YXIgVmU7Zm9yKFZlPVwiU1NTU1wiO1ZlLmxlbmd0aDw9OTtWZSs9XCJTXCIpWihWZSxVZCk7Zm9yKFZlPVwiU1wiO1ZlLmxlbmd0aDw9OTtWZSs9XCJTXCIpYmEoVmUsSWMpO1xuLy8gTU9NRU5UU1xudmFyIFdlPU8oXCJNaWxsaXNlY29uZHNcIiwhMSk7XG4vLyBGT1JNQVRUSU5HXG5VKFwielwiLDAsMCxcInpvbmVBYmJyXCIpLFUoXCJ6elwiLDAsMCxcInpvbmVOYW1lXCIpO3ZhciBYZT1yLnByb3RvdHlwZTtYZS5hZGQ9UGUsWGUuY2FsZW5kYXI9VmIsWGUuY2xvbmU9V2IsWGUuZGlmZj1iYyxYZS5lbmRPZj1vYyxYZS5mb3JtYXQ9Z2MsWGUuZnJvbT1oYyxYZS5mcm9tTm93PWljLFhlLnRvPWpjLFhlLnRvTm93PWtjLFhlLmdldD1SLFhlLmludmFsaWRBdD14YyxYZS5pc0FmdGVyPVhiLFhlLmlzQmVmb3JlPVliLFhlLmlzQmV0d2Vlbj1aYixYZS5pc1NhbWU9JGIsWGUuaXNTYW1lT3JBZnRlcj1fYixYZS5pc1NhbWVPckJlZm9yZT1hYyxYZS5pc1ZhbGlkPXZjLFhlLmxhbmc9UmUsWGUubG9jYWxlPWxjLFhlLmxvY2FsZURhdGE9bWMsWGUubWF4PUtlLFhlLm1pbj1KZSxYZS5wYXJzaW5nRmxhZ3M9d2MsWGUuc2V0PVMsWGUuc3RhcnRPZj1uYyxYZS5zdWJ0cmFjdD1RZSxYZS50b0FycmF5PXNjLFhlLnRvT2JqZWN0PXRjLFhlLnRvRGF0ZT1yYyxYZS50b0lTT1N0cmluZz1lYyxYZS5pbnNwZWN0PWZjLFhlLnRvSlNPTj11YyxYZS50b1N0cmluZz1kYyxYZS51bml4PXFjLFhlLnZhbHVlT2Y9cGMsWGUuY3JlYXRpb25EYXRhPXljLFxuLy8gWWVhclxuWGUueWVhcj1wZSxYZS5pc0xlYXBZZWFyPXJhLFxuLy8gV2VlayBZZWFyXG5YZS53ZWVrWWVhcj1BYyxYZS5pc29XZWVrWWVhcj1CYyxcbi8vIFF1YXJ0ZXJcblhlLnF1YXJ0ZXI9WGUucXVhcnRlcnM9R2MsXG4vLyBNb250aFxuWGUubW9udGg9a2EsWGUuZGF5c0luTW9udGg9bGEsXG4vLyBXZWVrXG5YZS53ZWVrPVhlLndlZWtzPUJhLFhlLmlzb1dlZWs9WGUuaXNvV2Vla3M9Q2EsWGUud2Vla3NJblllYXI9RGMsWGUuaXNvV2Vla3NJblllYXI9Q2MsXG4vLyBEYXlcblhlLmRhdGU9U2UsWGUuZGF5PVhlLmRheXM9S2EsWGUud2Vla2RheT1MYSxYZS5pc29XZWVrZGF5PU1hLFhlLmRheU9mWWVhcj1IYyxcbi8vIEhvdXJcblhlLmhvdXI9WGUuaG91cnM9emUsXG4vLyBNaW51dGVcblhlLm1pbnV0ZT1YZS5taW51dGVzPVRlLFxuLy8gU2Vjb25kXG5YZS5zZWNvbmQ9WGUuc2Vjb25kcz1VZSxcbi8vIE1pbGxpc2Vjb25kXG5YZS5taWxsaXNlY29uZD1YZS5taWxsaXNlY29uZHM9V2UsXG4vLyBPZmZzZXRcblhlLnV0Y09mZnNldD1EYixYZS51dGM9RmIsWGUubG9jYWw9R2IsWGUucGFyc2Vab25lPUhiLFhlLmhhc0FsaWduZWRIb3VyT2Zmc2V0PUliLFhlLmlzRFNUPUpiLFhlLmlzTG9jYWw9TGIsWGUuaXNVdGNPZmZzZXQ9TWIsWGUuaXNVdGM9TmIsWGUuaXNVVEM9TmIsXG4vLyBUaW1lem9uZVxuWGUuem9uZUFiYnI9SmMsWGUuem9uZU5hbWU9S2MsXG4vLyBEZXByZWNhdGlvbnNcblhlLmRhdGVzPXgoXCJkYXRlcyBhY2Nlc3NvciBpcyBkZXByZWNhdGVkLiBVc2UgZGF0ZSBpbnN0ZWFkLlwiLFNlKSxYZS5tb250aHM9eChcIm1vbnRocyBhY2Nlc3NvciBpcyBkZXByZWNhdGVkLiBVc2UgbW9udGggaW5zdGVhZFwiLGthKSxYZS55ZWFycz14KFwieWVhcnMgYWNjZXNzb3IgaXMgZGVwcmVjYXRlZC4gVXNlIHllYXIgaW5zdGVhZFwiLHBlKSxYZS56b25lPXgoXCJtb21lbnQoKS56b25lIGlzIGRlcHJlY2F0ZWQsIHVzZSBtb21lbnQoKS51dGNPZmZzZXQgaW5zdGVhZC4gaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy96b25lL1wiLEViKSxYZS5pc0RTVFNoaWZ0ZWQ9eChcImlzRFNUU2hpZnRlZCBpcyBkZXByZWNhdGVkLiBTZWUgaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9kc3Qtc2hpZnRlZC8gZm9yIG1vcmUgaW5mb3JtYXRpb25cIixLYik7dmFyIFllPUMucHJvdG90eXBlO1llLmNhbGVuZGFyPUQsWWUubG9uZ0RhdGVGb3JtYXQ9RSxZZS5pbnZhbGlkRGF0ZT1GLFllLm9yZGluYWw9RyxZZS5wcmVwYXJzZT1OYyxZZS5wb3N0Zm9ybWF0PU5jLFllLnJlbGF0aXZlVGltZT1ILFllLnBhc3RGdXR1cmU9SSxZZS5zZXQ9QSxcbi8vIE1vbnRoXG5ZZS5tb250aHM9ZmEsWWUubW9udGhzU2hvcnQ9Z2EsWWUubW9udGhzUGFyc2U9aWEsWWUubW9udGhzUmVnZXg9bmEsWWUubW9udGhzU2hvcnRSZWdleD1tYSxcbi8vIFdlZWtcblllLndlZWs9eWEsWWUuZmlyc3REYXlPZlllYXI9QWEsWWUuZmlyc3REYXlPZldlZWs9emEsXG4vLyBEYXkgb2YgV2Vla1xuWWUud2Vla2RheXM9RmEsWWUud2Vla2RheXNNaW49SGEsWWUud2Vla2RheXNTaG9ydD1HYSxZZS53ZWVrZGF5c1BhcnNlPUphLFllLndlZWtkYXlzUmVnZXg9TmEsWWUud2Vla2RheXNTaG9ydFJlZ2V4PU9hLFllLndlZWtkYXlzTWluUmVnZXg9UGEsXG4vLyBIb3Vyc1xuWWUuaXNQTT1WYSxZZS5tZXJpZGllbT1XYSwkYShcImVuXCIse29yZGluYWxQYXJzZTovXFxkezEsMn0odGh8c3R8bmR8cmQpLyxvcmRpbmFsOmZ1bmN0aW9uKGEpe3ZhciBiPWElMTAsYz0xPT09dShhJTEwMC8xMCk/XCJ0aFwiOjE9PT1iP1wic3RcIjoyPT09Yj9cIm5kXCI6Mz09PWI/XCJyZFwiOlwidGhcIjtyZXR1cm4gYStjfX0pLFxuLy8gU2lkZSBlZmZlY3QgaW1wb3J0c1xuYS5sYW5nPXgoXCJtb21lbnQubGFuZyBpcyBkZXByZWNhdGVkLiBVc2UgbW9tZW50LmxvY2FsZSBpbnN0ZWFkLlwiLCRhKSxhLmxhbmdEYXRhPXgoXCJtb21lbnQubGFuZ0RhdGEgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbWVudC5sb2NhbGVEYXRhIGluc3RlYWQuXCIsYmIpO3ZhciBaZT1NYXRoLmFicywkZT1lZChcIm1zXCIpLF9lPWVkKFwic1wiKSxhZj1lZChcIm1cIiksYmY9ZWQoXCJoXCIpLGNmPWVkKFwiZFwiKSxkZj1lZChcIndcIiksZWY9ZWQoXCJNXCIpLGZmPWVkKFwieVwiKSxnZj1nZChcIm1pbGxpc2Vjb25kc1wiKSxoZj1nZChcInNlY29uZHNcIiksamY9Z2QoXCJtaW51dGVzXCIpLGtmPWdkKFwiaG91cnNcIiksbGY9Z2QoXCJkYXlzXCIpLG1mPWdkKFwibW9udGhzXCIpLG5mPWdkKFwieWVhcnNcIiksb2Y9TWF0aC5yb3VuZCxwZj17czo0NSwvLyBzZWNvbmRzIHRvIG1pbnV0ZVxubTo0NSwvLyBtaW51dGVzIHRvIGhvdXJcbmg6MjIsLy8gaG91cnMgdG8gZGF5XG5kOjI2LC8vIGRheXMgdG8gbW9udGhcbk06MTF9LHFmPU1hdGguYWJzLHJmPXdiLnByb3RvdHlwZTtcbi8vIERlcHJlY2F0aW9uc1xuLy8gU2lkZSBlZmZlY3QgaW1wb3J0c1xuLy8gRk9STUFUVElOR1xuLy8gUEFSU0lOR1xuLy8gU2lkZSBlZmZlY3QgaW1wb3J0c1xucmV0dXJuIHJmLmFicz1XYyxyZi5hZGQ9WWMscmYuc3VidHJhY3Q9WmMscmYuYXM9Y2QscmYuYXNNaWxsaXNlY29uZHM9JGUscmYuYXNTZWNvbmRzPV9lLHJmLmFzTWludXRlcz1hZixyZi5hc0hvdXJzPWJmLHJmLmFzRGF5cz1jZixyZi5hc1dlZWtzPWRmLHJmLmFzTW9udGhzPWVmLHJmLmFzWWVhcnM9ZmYscmYudmFsdWVPZj1kZCxyZi5fYnViYmxlPV9jLHJmLmdldD1mZCxyZi5taWxsaXNlY29uZHM9Z2YscmYuc2Vjb25kcz1oZixyZi5taW51dGVzPWpmLHJmLmhvdXJzPWtmLHJmLmRheXM9bGYscmYud2Vla3M9aGQscmYubW9udGhzPW1mLHJmLnllYXJzPW5mLHJmLmh1bWFuaXplPW1kLHJmLnRvSVNPU3RyaW5nPW5kLHJmLnRvU3RyaW5nPW5kLHJmLnRvSlNPTj1uZCxyZi5sb2NhbGU9bGMscmYubG9jYWxlRGF0YT1tYyxyZi50b0lzb1N0cmluZz14KFwidG9Jc29TdHJpbmcoKSBpcyBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIHRvSVNPU3RyaW5nKCkgaW5zdGVhZCAobm90aWNlIHRoZSBjYXBpdGFscylcIixuZCkscmYubGFuZz1SZSxVKFwiWFwiLDAsMCxcInVuaXhcIiksVShcInhcIiwwLDAsXCJ2YWx1ZU9mXCIpLFooXCJ4XCIsVmQpLFooXCJYXCIsWWQpLGJhKFwiWFwiLGZ1bmN0aW9uKGEsYixjKXtjLl9kPW5ldyBEYXRlKDFlMypwYXJzZUZsb2F0KGEsMTApKX0pLGJhKFwieFwiLGZ1bmN0aW9uKGEsYixjKXtjLl9kPW5ldyBEYXRlKHUoYSkpfSksYS52ZXJzaW9uPVwiMi4xNy4xXCIsYihzYiksYS5mbj1YZSxhLm1pbj11YixhLm1heD12YixhLm5vdz1MZSxhLnV0Yz1rLGEudW5peD1MYyxhLm1vbnRocz1SYyxhLmlzRGF0ZT1nLGEubG9jYWxlPSRhLGEuaW52YWxpZD1vLGEuZHVyYXRpb249T2IsYS5pc01vbWVudD1zLGEud2Vla2RheXM9VGMsYS5wYXJzZVpvbmU9TWMsYS5sb2NhbGVEYXRhPWJiLGEuaXNEdXJhdGlvbj14YixhLm1vbnRoc1Nob3J0PVNjLGEud2Vla2RheXNNaW49VmMsYS5kZWZpbmVMb2NhbGU9X2EsYS51cGRhdGVMb2NhbGU9YWIsYS5sb2NhbGVzPWNiLGEud2Vla2RheXNTaG9ydD1VYyxhLm5vcm1hbGl6ZVVuaXRzPUssYS5yZWxhdGl2ZVRpbWVSb3VuZGluZz1rZCxhLnJlbGF0aXZlVGltZVRocmVzaG9sZD1sZCxhLmNhbGVuZGFyRm9ybWF0PVViLGEucHJvdG90eXBlPVhlLGF9KTsiLCJhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuZmFjdG9yeSgnYWRkRmVlZFNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlRmVlZChmZWVkLCBmZWVkVXJsKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hZGRGZWVkJywgeyBmZWVkTGluazogZmVlZFVybCwgZmVlZENhdGVnb3J5OiBmZWVkLmZlZWRDYXRlZ29yeSwgZmVlZFRpdGxlOiBmZWVkLmZlZWRUaXRsZSB9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInJlc3BvbnNlIGluIGdldFNhdmVkRmVlZDogXCIsIHJlcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW4gbm90IGdldCBzYXZlZCBmZWVkJyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0UGFyc2VkRmVlZChmZWVkLCBjYXRlZ29yeSkge1xyXG4gICAgICAgIGZlZWQgPSBmZWVkLmZlZWQ7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZmVlZFRpdGxlOiBmZWVkWzBdLm1ldGEudGl0bGUsXHJcbiAgICAgICAgICAgIGZlZWRDYXRlZ29yeTogY2F0ZWdvcnksXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2F2ZUZlZWQ6IHNhdmVGZWVkLFxyXG4gICAgICAgIGdldFBhcnNlZEZlZWQ6IGdldFBhcnNlZEZlZWQsXHJcbiAgICB9XHJcbn1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmZhY3RvcnkoJ2FydGljbGVzU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgLy8gdmFyIGFsbEFydGljbGVzID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VGV4dChodG1sKSB7XHJcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZWxlbWVudChgPGRpdj4ke2h0bWx9PC9kaXY+YCkudGV4dCgpLnJlcGxhY2UoL1xcbisvZywgJyAnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRJbWdVcmwoaHRtbCkge1xyXG4gICAgICAgIHZhciBpbWdFbGVtID0gYW5ndWxhci5lbGVtZW50KGA8ZGl2PiR7aHRtbH08L2Rpdj5gKS5maW5kKCdpbWcnKVswXTtcclxuICAgICAgICByZXR1cm4gaW1nRWxlbSA/IGltZ0VsZW0uc3JjIDogJyc7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RmVlZEZyb21GZWVkcGFyc2VyKHVybCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvZ2V0UGFyc2VkRmVlZCcsIHsgdXJsOiB1cmwgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRBcnRpY2xlcyhmZWVkcykge1xyXG4gICAgICAgIGxldCBhcnRpY2xlcyA9IFtdO1xyXG4gICAgICAgIGxldCBjaGFpbiA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIGZlZWRzLmZvckVhY2goZnVuY3Rpb24oZmVlZCkge1xyXG4gICAgICAgICAgICBjaGFpbiA9IGNoYWluXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBnZXRGZWVkRnJvbUZlZWRwYXJzZXIoZmVlZC5mZWVkTGluaykpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2V0UGFyc2VkQXJ0aWNsZXMocmVzdWx0LmZlZWQsIGZlZWQuZmVlZENhdGVnb3J5LCBmZWVkLl9pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJ0aWNsZXMgPSBhcnRpY2xlcy5jb25jYXQocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hhaW4udGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnRpY2xlc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYXJzZWRBcnRpY2xlcyhhcnRpY2xlcywgY2F0ZWdvcnksIGZlZWRJZCkge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdnZXRQYXJzZWRBcnRpY2xlcycsIGFydGljbGVzKTtcclxuICAgICAgICB2YXIgY2hhbmdlZEFydGljbGVzID0gW107XHJcbiAgICAgICAgYXJ0aWNsZXMuZm9yRWFjaChmdW5jdGlvbihlbCkge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY2hhbmdlZEFydGljbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6IGVsLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgZmVlZElkOiBmZWVkSWQsXHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICBjb250ZW50OiBnZXRUZXh0KGVsLmRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgICAgIGltZzogZ2V0SW1nVXJsKGVsLmRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgICAgIGxpbms6IGVsLmxpbmssXHJcbiAgICAgICAgICAgICAgICBkYXRlOiBlbC5wdWJEYXRlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZWRBcnRpY2xlcztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTaW5nbGVBcnRpY2xlKGZlZWRJZCwgbGluaykge1xyXG4gICAgICAgIHJldHVybiBnZXRGZWVkQnlJZChmZWVkSWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXMuZmluZChmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbS5saW5rID09IGxpbmspIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEFsbEZlZWRzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvZ2V0RmVlZCcpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRBcnRpY2xlcyhyZXMuZGF0YSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmV0dXJuIHJlcztcclxuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FuIG5vdCBnZXQgc2F2ZWQgZmVlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGZWVkQnlJZChpZCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvZ2V0RmVlZEJ5SWQnLCB7IGZlZWRJZDogaWQgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldEFydGljbGVzKFtyZXMuZGF0YV0pO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbiBub3QgbG9hZCBkYXRhJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGZWVkQnlDYXQoY2F0ZWdvcnkpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2dldEZlZWRCeUNhdCcsIHsgZmVlZENhdGVnb3J5OiBjYXRlZ29yeSB9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnZ2V0RmVlZEJ5Q2F0JywgcmVzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRBcnRpY2xlcyhyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FuIG5vdCBsb2FkIGRhdGEnLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgLy8gc2V0QWxsQXJ0aWNsZXM6IHNldEFsbEFydGljbGVzLFxyXG4gICAgICAgIC8vIGdldEFsbEFydGljbGVzOiBnZXRBbGxBcnRpY2xlcyxcclxuICAgICAgICBnZXRBcnRpY2xlczogZ2V0QXJ0aWNsZXMsXHJcbiAgICAgICAgZ2V0RmVlZEZyb21GZWVkcGFyc2VyOiBnZXRGZWVkRnJvbUZlZWRwYXJzZXIsXHJcbiAgICAgICAgZ2V0QWxsRmVlZHM6IGdldEFsbEZlZWRzLFxyXG4gICAgICAgIGdldEZlZWRCeUlkOiBnZXRGZWVkQnlJZCxcclxuICAgICAgICBnZXRGZWVkQnlDYXQ6IGdldEZlZWRCeUNhdCwgXHJcbiAgICAgICAgZ2V0U2luZ2xlQXJ0aWNsZTogZ2V0U2luZ2xlQXJ0aWNsZVxyXG4gICAgfVxyXG59XSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5mYWN0b3J5KCdkYXNoYm9hcmRTZXJ2aWNlJywgWydhZGRGZWVkU2VydmljZScsICckZmlsdGVyJywgJyRodHRwJywgZnVuY3Rpb24oYWRkRmVlZFNlcnZpY2UsICRmaWx0ZXIsICRodHRwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICB2YXIgc29ydFBhcmFtOyAvL3NvcnRpbmcgb3B0aW9uIGdvdCBmcm9tIHNpZGViYXJcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U29ydFBhcmFtKCkge1xyXG4gICAgICAgIGlmICghc29ydFBhcmFtKSB7XHJcbiAgICAgICAgICAgIHNvcnRQYXJhbSA9IFwiQWxsXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzb3J0UGFyYW07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QWxsRmVlZHMoKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9nZXRGZWVkJylcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW4gbm90IGdldCBzYXZlZCBmZWVkJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0U29ydFBhcmFtOiBnZXRTb3J0UGFyYW0sXHJcbiAgICAgICAgZ2V0QWxsRmVlZHM6IGdldEFsbEZlZWRzLFxyXG4gICAgfVxyXG59XSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5mYWN0b3J5KCdzaWRlYmFyU2VydmljZScsIFsnZGFzaGJvYXJkU2VydmljZScsIGZ1bmN0aW9uKGRhc2hib2FyZFNlcnZpY2UpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHZhciBsaXN0RmVlZHMgPSBbXTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gc2V0TGlzdEZlZWRzKGFycikge1xyXG5cclxuICAgICAgICBpZiAoIWxpc3RGZWVkcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgbGlzdEZlZWRzID0gbGlzdEZlZWRzLmNvbmNhdChhcnIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGFyci5mb3JFYWNoKGVsZW1lbnQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEobGlzdEZlZWRzLnNvbWUoY3VycmVudEVsZW0gPT4gY3VycmVudEVsZW0uX2lkID09PSBlbGVtZW50Ll9pZCkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdEZlZWRzID0gbGlzdEZlZWRzLmNvbmNhdChlbGVtZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldENhdGVnb3J5U2lkZWJhcihsaXN0RmVlZHMpIHtcclxuICAgICAgICB2YXIgbGlzdEZlZWRTaWRlYmFyID0gW107XHJcbiAgICAgICAgdmFyIGxpc3RXb3JrID0gW107XHJcbiAgICAgICAgdmFyIGZvdW5kRWxlbTtcclxuXHJcbiAgICAgICAgaWYgKCFsaXN0RmVlZHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsaXN0RmVlZHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdFdvcmsucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZmVlZENhdGVnb3J5OiBlbGVtZW50LmZlZWRDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgICAgICBpZDogaW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgZmVlZFRpdGxlOiBbeyBmZWVkVGl0bGU6IGVsZW1lbnQuZmVlZFRpdGxlLCBmZWVkSWQ6IGVsZW1lbnQuX2lkIH1dXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxpc3RXb3JrLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcclxuXHJcbiAgICAgICAgICAgIGZvdW5kRWxlbSA9IGxpc3RGZWVkU2lkZWJhci5maW5kKGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLmZlZWRDYXRlZ29yeSA9PSBlbGVtZW50LmZlZWRDYXRlZ29yeTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZm91bmRFbGVtKSB7XHJcbiAgICAgICAgICAgICAgICBmb3VuZEVsZW0uZmVlZFRpdGxlID0gZm91bmRFbGVtLmZlZWRUaXRsZS5jb25jYXQoZWxlbWVudC5mZWVkVGl0bGUpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGlzdEZlZWRTaWRlYmFyLnB1c2goZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gbGlzdEZlZWRTaWRlYmFyO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldExpc3RGZWVkcygpIHtcclxuICAgICAgICByZXR1cm4gbGlzdEZlZWRzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRDYXRlZ29yeVNpZGViYXI6IGdldENhdGVnb3J5U2lkZWJhcixcclxuICAgICAgICBzZXRMaXN0RmVlZHM6IHNldExpc3RGZWVkcyxcclxuICAgICAgICBnZXRMaXN0RmVlZHM6IGdldExpc3RGZWVkc1xyXG4gICAgfVxyXG59XSlcclxuIl19
