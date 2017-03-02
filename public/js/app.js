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
                            return articlesService.getAllArticles(res.data).then(function(res) {
                                articlesService.setAllArticles(res);
                                return res;
                            }, function(error) {
                                console.log("Can't resolving", error);
                            });
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

(function() {
    'use strict';
    angular.module('rssReader').controller('addController', ['$scope', '$state', 'addFeedService', 'articlesService', 'sidebarService', function($scope, $state, addFeedService, articlesService, sidebarService) {
        // $scope.feed = {};
        $scope.getFeed = function () {
            articlesService.getFeedFromFeedparser($scope.feedUrl).then(function(res) {
                var feed = addFeedService.getParsedFeed(res, $scope.feedCategory);
                addFeedService.saveFeed(feed, $scope.feedUrl).then(function (res) {
                    sidebarService.setListFeeds([res.data]);
                    $state.go('dashboard.list-lg', {sort:res.data._id});
                });
            });
        }
    }]);

})();
(function() {
    'use strict';
    angular.module('rssReader').controller('articlesController', ['$scope', '$state', '$stateParams', 'dashboardService', 'articlesService', function($scope, $state, $stateParams, dashboardService, articlesService) {
        
        $scope.articles = articlesService.getArticles();
        // $scope.articles = dashboardService.getArticles($stateParams.sort, 'articlesController');
        // console.log($scope.articles);
        // $scope.readArticle = function (article) {
        //     $state.go('dashboard.article', {param : article});
            
        // }; 
    }]);

})();

(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', 'addFeedService', 'dashboardService', 'feeds', function($scope, $state, addFeedService, dashboardService, feeds) {
        // console.log(!!$scope.articles.length);
        
        $scope.$watch(function () {
            return dashboardService.getSortParam();
        }, function () {
            $scope.titleFeed = dashboardService.getSortParam();
        });

        $scope.readArticle = function (link) {
            $state.go('^.article', {link:link}); 
        }

        if (!feeds.length) {
            $state.go('dashboard.add');
        } else {
            $state.go('dashboard.list-lg');
        }

        $scope.isRead = function() {
            var re = new RegExp("dashboard.add");
            return (!re.test($state.current.name));
        }

        $scope.getAllFeed = function () {
            dashboardService.getFeed();
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
        
        $scope.showArticlesBySorting = function (sorting) {
            // console.log(sorting);
            // titleFeed = titleFeed ? titleFeed : null; 
            // console.log('titleFeed = ' + titleFeed);
            $state.go('dashboard.list-lg', {sort:sorting}); 
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
    angular.module('rssReader').controller('singleArticle', ['$scope', '$state', '$stateParams', 'dashboardService', function($scope, $state, $stateParams, dashboardService) {
        if (!$stateParams.link) {
            $state.go('^');
        } else {
            $scope.article = dashboardService.getSingleArticle($stateParams.link);
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
    var listFeeds = [];
    function saveFeed(feed, feedUrl) {
        return $http.post('/addFeed', {feedLink: feedUrl, feedCategory: feed.feedCategory, feedTitle: feed.feedTitle })
            .then(function(res) {
                console.log("response in getSavedFeed: ", res);
                // listFeeds.push(res.data)
                return res;
            },
            function(error) {
                console.log('Can not get saved feed');
            })
    }
    // function saveData (feed) {
    //     listFeeds.push(feed);
    // }
 

    function getParsedFeed(feed, category) {
        feed = feed.feed;
        return {
            feedTitle: feed[0].meta.title,
            feedCategory: category,
        }
    }

    // function getSavedFeeds() {
    //     return listFeeds;
    // }

    return {
        saveFeed: saveFeed,
        getParsedFeed: getParsedFeed,
    }
}]);

angular.module('rssReader').factory('articlesService', ['$http', function($http) {
    'use strict';
    var allArticles = [];

    function getText(html) {
        return angular.element(`<div>${html}</div>`).text().replace(/\n+/g, ' ');
    }

    function getImgUrl(html) {
        var imgElem = angular.element(`<div>${html}</div>`).find('img')[0];
        return imgElem ? imgElem.src : '';
    }

    function getDate(dateRaw) {
        return moment(new Date(dateRaw)).format('DD-MM-YYYY HH:mm');
    }

    function getFeedFromFeedparser(url) {
        return $http.post('/getParsedFeed', { url: url }).then(function(response) {
            // console.log(response.data);
            return response.data;
        });
    }

    function getAllArticles(allFeeds) {
        // console.log('getAllArticles', arguments);
        let articles = [];
        let chain = Promise.resolve();
        allFeeds.forEach(function(feed) {
            chain = chain
                .then(() => getFeedFromFeedparser(feed.feedLink))
                .then((result) => {
                    result = getParsedArticles(result.feed, feed.feedCategory);
                    articles = articles.concat(result);
                });
        });

        return chain.then(() => {
            return articles
        });

    }

    function getParsedArticles(articles, category) {
        var changedArticles = [];
        articles.forEach(function(el) {
            changedArticles.push({
                title: el.title,
                category: category,
                content: getText(el.description),
                img: getImgUrl(el.description),
                link: el.permalink,
                date: el.pubDate
            })
        });
        return changedArticles;
    }

    function getSingleArticle(link) {
        var articles = getAllArticles();
        if (!articles) {
            return false;
        }
        return articles.find(function(elem) {
            return elem.link == link;
        })
    }

    function setAllArticles(listFeeds) {
        allArticles = listFeeds;
    }

        function getArticles() {
        return allArticles;
    }

    return {
        setAllArticles: setAllArticles,
        getAllArticles: getAllArticles,
        getArticles: getArticles,
        getFeedFromFeedparser: getFeedFromFeedparser
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
    var listFeeds = [];


    function setListFeeds (arr) {
        listFeeds = listFeeds.concat(arr);
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
                    feedTitle: [{feedTitle: element.feedTitle, feedId: element._id}]
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

    function getListFeeds () {
        return listFeeds;
    }
    return {
        getCategorySidebar: getCategorySidebar,
        setListFeeds: setListFeeds,
        getListFeeds: getListFeeds
    }
}])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvdXRlci5qcyIsImNvbnRyb2xsZXJzL2FkZENvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9hcnRpY2xlc0NvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmRDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9uYXZDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvc2lkZWJhckNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9zaW5nbGVBcnRpY2xlQ29udHJvbGxlci5qcyIsImRpcmVjdGl2ZXMvbG9hZGluZ1NwaW5uZXIuanMiLCJsaWIvYm9vdHN0cmFwLmpzIiwibGliL2phc255LWJvb3RzdHJhcC5qcyIsImxpYi9tb21lbnQubWluLmpzIiwic2VydmljZXMvYWRkRmVlZFNlcnZpY2UuanMiLCJzZXJ2aWNlcy9hcnRpY2xlc1NlcnZpY2UuanMiLCJzZXJ2aWNlcy9kYXNoYm9hcmRTZXJ2aWNlLmpzIiwic2VydmljZXMvc2lkZWJhclNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6MEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoZ0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0aUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJywgWyd1aS5yb3V0ZXInXSk7XHJcbiAgICBhcHAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJywgJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkaHR0cFByb3ZpZGVyKSB7XHJcbiAgICAgICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnaG9tZScpO1xyXG4gICAgICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2hvbWUnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwidGVtcGxhdGVzL2hvbWUuaHRtbFwiLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2hvbWVDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ2xvZ2luJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2xvZ2luJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvZ2luLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgLy8gY29udHJvbGxlcjogJ2xvZ2luQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcclxuICAgICAgICAgICAgICAgIHZpZXdzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJyc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnZGFzaGJvYXJkQ29udHJvbGxlcidcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICdoZWFkQGRhc2hib2FyZCc6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkSGVhZC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2Rhc2hib2FyZENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAnc2lkZWJhcic6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvc2lkZWJhci5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3NpZGViYXJDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmVlZHM6IFsnZGFzaGJvYXJkU2VydmljZScsICdhcnRpY2xlc1NlcnZpY2UnLCAnc2lkZWJhclNlcnZpY2UnLCBmdW5jdGlvbihkYXNoYm9hcmRTZXJ2aWNlLCBhcnRpY2xlc1NlcnZpY2UsIHNpZGViYXJTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXNoYm9hcmRTZXJ2aWNlLmdldEFsbEZlZWRzKCkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpZGViYXJTZXJ2aWNlLnNldExpc3RGZWVkcyhyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJ0aWNsZXNTZXJ2aWNlLmdldEFsbEFydGljbGVzKHJlcy5kYXRhKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFydGljbGVzU2VydmljZS5zZXRBbGxBcnRpY2xlcyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2FuJ3QgcmVzb2x2aW5nXCIsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ2Rhc2hib2FyZC50YWJsZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LXRhYmxlP3NvcnQnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQubGlzdC1sZycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LWxnP3NvcnQnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQubGlzdC10aCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LXRoP3NvcnQnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQuYXJ0aWNsZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9hcnRpY2xlP2xpbmsnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvc2luZ2xlQXJ0aWNsZS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdzaW5nbGVBcnRpY2xlJyxcclxuXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkLmFkZCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9hZGQnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRkLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FkZENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfV0pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignYWRkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzdGF0ZScsICdhZGRGZWVkU2VydmljZScsICdhcnRpY2xlc1NlcnZpY2UnLCAnc2lkZWJhclNlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgYWRkRmVlZFNlcnZpY2UsIGFydGljbGVzU2VydmljZSwgc2lkZWJhclNlcnZpY2UpIHtcclxuICAgICAgICAvLyAkc2NvcGUuZmVlZCA9IHt9O1xyXG4gICAgICAgICRzY29wZS5nZXRGZWVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhcnRpY2xlc1NlcnZpY2UuZ2V0RmVlZEZyb21GZWVkcGFyc2VyKCRzY29wZS5mZWVkVXJsKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZlZWQgPSBhZGRGZWVkU2VydmljZS5nZXRQYXJzZWRGZWVkKHJlcywgJHNjb3BlLmZlZWRDYXRlZ29yeSk7XHJcbiAgICAgICAgICAgICAgICBhZGRGZWVkU2VydmljZS5zYXZlRmVlZChmZWVkLCAkc2NvcGUuZmVlZFVybCkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2lkZWJhclNlcnZpY2Uuc2V0TGlzdEZlZWRzKFtyZXMuZGF0YV0pO1xyXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkLmxpc3QtbGcnLCB7c29ydDpyZXMuZGF0YS5faWR9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XSk7XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5jb250cm9sbGVyKCdhcnRpY2xlc0NvbnRyb2xsZXInLCBbJyRzY29wZScsICckc3RhdGUnLCAnJHN0YXRlUGFyYW1zJywgJ2Rhc2hib2FyZFNlcnZpY2UnLCAnYXJ0aWNsZXNTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgZGFzaGJvYXJkU2VydmljZSwgYXJ0aWNsZXNTZXJ2aWNlKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLmFydGljbGVzID0gYXJ0aWNsZXNTZXJ2aWNlLmdldEFydGljbGVzKCk7XHJcbiAgICAgICAgLy8gJHNjb3BlLmFydGljbGVzID0gZGFzaGJvYXJkU2VydmljZS5nZXRBcnRpY2xlcygkc3RhdGVQYXJhbXMuc29ydCwgJ2FydGljbGVzQ29udHJvbGxlcicpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCRzY29wZS5hcnRpY2xlcyk7XHJcbiAgICAgICAgLy8gJHNjb3BlLnJlYWRBcnRpY2xlID0gZnVuY3Rpb24gKGFydGljbGUpIHtcclxuICAgICAgICAvLyAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQuYXJ0aWNsZScsIHtwYXJhbSA6IGFydGljbGV9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gfTsgXHJcbiAgICB9XSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignZGFzaGJvYXJkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzdGF0ZScsICdhZGRGZWVkU2VydmljZScsICdkYXNoYm9hcmRTZXJ2aWNlJywgJ2ZlZWRzJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIGFkZEZlZWRTZXJ2aWNlLCBkYXNoYm9hcmRTZXJ2aWNlLCBmZWVkcykge1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCEhJHNjb3BlLmFydGljbGVzLmxlbmd0aCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXNoYm9hcmRTZXJ2aWNlLmdldFNvcnRQYXJhbSgpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRpdGxlRmVlZCA9IGRhc2hib2FyZFNlcnZpY2UuZ2V0U29ydFBhcmFtKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICRzY29wZS5yZWFkQXJ0aWNsZSA9IGZ1bmN0aW9uIChsaW5rKSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnXi5hcnRpY2xlJywge2xpbms6bGlua30pOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZmVlZHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkLmFkZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkLmxpc3QtbGcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5pc1JlYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcImRhc2hib2FyZC5hZGRcIik7XHJcbiAgICAgICAgICAgIHJldHVybiAoIXJlLnRlc3QoJHN0YXRlLmN1cnJlbnQubmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmdldEFsbEZlZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGRhc2hib2FyZFNlcnZpY2UuZ2V0RmVlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmNvbnRyb2xsZXIoJ2hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpe1xyXG4gICAgICAgICRzY29wZS50ZXN0ID0gXCJoZWxsbyB3b3JsZCEhIVwiO1xyXG4gICAgfV0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5jb250cm9sbGVyKCduYXZDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcclxuICAgICAgJHNjb3BlLmlzRGFzYm9hcmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIC9kYXNoYm9hcmQvLnRlc3QoJHN0YXRlLmN1cnJlbnQubmFtZSk7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmNvbnRyb2xsZXIoJ3NpZGViYXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnc2lkZWJhclNlcnZpY2UnLCAnZGFzaGJvYXJkU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCBzaWRlYmFyU2VydmljZSwgZGFzaGJvYXJkU2VydmljZSkge1xyXG4gICAgICAgIHZhciBnZXRMaXN0U2lkZWJhciA9IHNpZGViYXJTZXJ2aWNlLmdldENhdGVnb3J5U2lkZWJhcjtcclxuICAgICAgICB2YXIgbGlzdEZlZWRzID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIHJldHVybiBKU09OLnN0cmluZ2lmeShnZXRMaXN0U2lkZWJhcigpKTtcclxuICAgICAgICAgICAgbGlzdEZlZWRzID0gc2lkZWJhclNlcnZpY2UuZ2V0TGlzdEZlZWRzKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBsaXN0RmVlZHM7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdEZlZWRTaWRlYmFyID0gZ2V0TGlzdFNpZGViYXIobGlzdEZlZWRzKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAkc2NvcGUuc2hvd0FydGljbGVzQnlTb3J0aW5nID0gZnVuY3Rpb24gKHNvcnRpbmcpIHtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coc29ydGluZyk7XHJcbiAgICAgICAgICAgIC8vIHRpdGxlRmVlZCA9IHRpdGxlRmVlZCA/IHRpdGxlRmVlZCA6IG51bGw7IFxyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygndGl0bGVGZWVkID0gJyArIHRpdGxlRmVlZCk7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkLmxpc3QtbGcnLCB7c29ydDpzb3J0aW5nfSk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnJvdGF0ZUNoZXZyb24gPSBmdW5jdGlvbigkZXZlbnQpIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxhcHNlID0gJGV2ZW50LmN1cnJlbnRUYXJnZXQuYXR0cmlidXRlc1snYXJpYS1leHBhbmRlZCddLnZhbHVlO1xyXG4gICAgICAgICAgICB2YXIgY2hldnJvbiA9IGFuZ3VsYXIuZWxlbWVudCgkZXZlbnQuY3VycmVudFRhcmdldCkuZmluZCgnLmdseXBoaWNvbi1jaGV2cm9uLXJpZ2h0Jyk7XHJcbiAgICAgICAgICAgIGlmIChjb2xsYXBzZSA9PSBcImZhbHNlXCIpIHtcclxuICAgICAgICAgICAgICAgIGNoZXZyb24uYWRkQ2xhc3MoJ2NoZXZyb25Eb3duJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjaGV2cm9uLnJlbW92ZUNsYXNzKCdjaGV2cm9uRG93bicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1dKTtcclxuXHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5jb250cm9sbGVyKCdzaW5nbGVBcnRpY2xlJywgWyckc2NvcGUnLCAnJHN0YXRlJywgJyRzdGF0ZVBhcmFtcycsICdkYXNoYm9hcmRTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgZGFzaGJvYXJkU2VydmljZSkge1xyXG4gICAgICAgIGlmICghJHN0YXRlUGFyYW1zLmxpbmspIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdeJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLmFydGljbGUgPSBkYXNoYm9hcmRTZXJ2aWNlLmdldFNpbmdsZUFydGljbGUoJHN0YXRlUGFyYW1zLmxpbmspO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICB9XSk7XHJcblxyXG59KSgpO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuZGlyZWN0aXZlKCdsb2FkaW5nJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgc2NvcGUuaXNMb2FkaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJGh0dHAucGVuZGluZ1JlcXVlc3RzLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaChzY29wZS5pc0xvYWRpbmcsIGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUNsYXNzKCduZy1oaWRlJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ25nLWhpZGUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufV0pO1xyXG5cclxuIiwiLyohXHJcbiAqIEJvb3RzdHJhcCB2My4zLjcgKGh0dHA6Ly9nZXRib290c3RyYXAuY29tKVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBqUXVlcnkgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgdGhyb3cgbmV3IEVycm9yKCdCb290c3RyYXBcXCdzIEphdmFTY3JpcHQgcmVxdWlyZXMgalF1ZXJ5JylcclxufVxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHZhciB2ZXJzaW9uID0gJC5mbi5qcXVlcnkuc3BsaXQoJyAnKVswXS5zcGxpdCgnLicpXHJcbiAgaWYgKCh2ZXJzaW9uWzBdIDwgMiAmJiB2ZXJzaW9uWzFdIDwgOSkgfHwgKHZlcnNpb25bMF0gPT0gMSAmJiB2ZXJzaW9uWzFdID09IDkgJiYgdmVyc2lvblsyXSA8IDEpIHx8ICh2ZXJzaW9uWzBdID4gMykpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignQm9vdHN0cmFwXFwncyBKYXZhU2NyaXB0IHJlcXVpcmVzIGpRdWVyeSB2ZXJzaW9uIDEuOS4xIG9yIGhpZ2hlciwgYnV0IGxvd2VyIHRoYW4gdmVyc2lvbiA0JylcclxuICB9XHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHRyYW5zaXRpb24uanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RyYW5zaXRpb25zXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDU1MgVFJBTlNJVElPTiBTVVBQT1JUIChTaG91dG91dDogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tLylcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCgpIHtcclxuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2Jvb3RzdHJhcCcpXHJcblxyXG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcclxuICAgICAgV2Via2l0VHJhbnNpdGlvbiA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcclxuICAgICAgTW96VHJhbnNpdGlvbiAgICA6ICd0cmFuc2l0aW9uZW5kJyxcclxuICAgICAgT1RyYW5zaXRpb24gICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgIHRyYW5zaXRpb24gICAgICAgOiAndHJhbnNpdGlvbmVuZCdcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBuYW1lIGluIHRyYW5zRW5kRXZlbnROYW1lcykge1xyXG4gICAgICBpZiAoZWwuc3R5bGVbbmFtZV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiB7IGVuZDogdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZSAvLyBleHBsaWNpdCBmb3IgaWU4ICggIC5fLilcclxuICB9XHJcblxyXG4gIC8vIGh0dHA6Ly9ibG9nLmFsZXhtYWNjYXcuY29tL2Nzcy10cmFuc2l0aW9uc1xyXG4gICQuZm4uZW11bGF0ZVRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcclxuICAgIHZhciBjYWxsZWQgPSBmYWxzZVxyXG4gICAgdmFyICRlbCA9IHRoaXNcclxuICAgICQodGhpcykub25lKCdic1RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbiAoKSB7IGNhbGxlZCA9IHRydWUgfSlcclxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgaWYgKCFjYWxsZWQpICQoJGVsKS50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkgfVxyXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgZHVyYXRpb24pXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgJChmdW5jdGlvbiAoKSB7XHJcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25FbmQoKVxyXG5cclxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVyblxyXG5cclxuICAgICQuZXZlbnQuc3BlY2lhbC5ic1RyYW5zaXRpb25FbmQgPSB7XHJcbiAgICAgIGJpbmRUeXBlOiAkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsXHJcbiAgICAgIGRlbGVnYXRlVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxyXG4gICAgICBoYW5kbGU6IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKCQoZS50YXJnZXQpLmlzKHRoaXMpKSByZXR1cm4gZS5oYW5kbGVPYmouaGFuZGxlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogYWxlcnQuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2FsZXJ0c1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQUxFUlQgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIGRpc21pc3MgPSAnW2RhdGEtZGlzbWlzcz1cImFsZXJ0XCJdJ1xyXG4gIHZhciBBbGVydCAgID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAkKGVsKS5vbignY2xpY2snLCBkaXNtaXNzLCB0aGlzLmNsb3NlKVxyXG4gIH1cclxuXHJcbiAgQWxlcnQuVkVSU0lPTiA9ICczLjMuNydcclxuXHJcbiAgQWxlcnQuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxyXG5cclxuICBBbGVydC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzICAgID0gJCh0aGlzKVxyXG4gICAgdmFyIHNlbGVjdG9yID0gJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKVxyXG5cclxuICAgIGlmICghc2VsZWN0b3IpIHtcclxuICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcclxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xyXG4gICAgfVxyXG5cclxuICAgIHZhciAkcGFyZW50ID0gJChzZWxlY3RvciA9PT0gJyMnID8gW10gOiBzZWxlY3RvcilcclxuXHJcbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgaWYgKCEkcGFyZW50Lmxlbmd0aCkge1xyXG4gICAgICAkcGFyZW50ID0gJHRoaXMuY2xvc2VzdCgnLmFsZXJ0JylcclxuICAgIH1cclxuXHJcbiAgICAkcGFyZW50LnRyaWdnZXIoZSA9ICQuRXZlbnQoJ2Nsb3NlLmJzLmFsZXJ0JykpXHJcblxyXG4gICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgICRwYXJlbnQucmVtb3ZlQ2xhc3MoJ2luJylcclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmVFbGVtZW50KCkge1xyXG4gICAgICAvLyBkZXRhY2ggZnJvbSBwYXJlbnQsIGZpcmUgZXZlbnQgdGhlbiBjbGVhbiB1cCBkYXRhXHJcbiAgICAgICRwYXJlbnQuZGV0YWNoKCkudHJpZ2dlcignY2xvc2VkLmJzLmFsZXJ0JykucmVtb3ZlKClcclxuICAgIH1cclxuXHJcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiAkcGFyZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xyXG4gICAgICAkcGFyZW50XHJcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgcmVtb3ZlRWxlbWVudClcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQWxlcnQuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICByZW1vdmVFbGVtZW50KClcclxuICB9XHJcblxyXG5cclxuICAvLyBBTEVSVCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLmFsZXJ0JylcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuYWxlcnQnLCAoZGF0YSA9IG5ldyBBbGVydCh0aGlzKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0uY2FsbCgkdGhpcylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5hbGVydFxyXG5cclxuICAkLmZuLmFsZXJ0ICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5hbGVydC5Db25zdHJ1Y3RvciA9IEFsZXJ0XHJcblxyXG5cclxuICAvLyBBTEVSVCBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uYWxlcnQubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uYWxlcnQgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQUxFUlQgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuYWxlcnQuZGF0YS1hcGknLCBkaXNtaXNzLCBBbGVydC5wcm90b3R5cGUuY2xvc2UpXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBidXR0b24uanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2J1dHRvbnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIEJVVFRPTiBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgQnV0dG9uID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zICAgPSAkLmV4dGVuZCh7fSwgQnV0dG9uLkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgQnV0dG9uLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBCdXR0b24uREVGQVVMVFMgPSB7XHJcbiAgICBsb2FkaW5nVGV4dDogJ2xvYWRpbmcuLi4nXHJcbiAgfVxyXG5cclxuICBCdXR0b24ucHJvdG90eXBlLnNldFN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XHJcbiAgICB2YXIgZCAgICA9ICdkaXNhYmxlZCdcclxuICAgIHZhciAkZWwgID0gdGhpcy4kZWxlbWVudFxyXG4gICAgdmFyIHZhbCAgPSAkZWwuaXMoJ2lucHV0JykgPyAndmFsJyA6ICdodG1sJ1xyXG4gICAgdmFyIGRhdGEgPSAkZWwuZGF0YSgpXHJcblxyXG4gICAgc3RhdGUgKz0gJ1RleHQnXHJcblxyXG4gICAgaWYgKGRhdGEucmVzZXRUZXh0ID09IG51bGwpICRlbC5kYXRhKCdyZXNldFRleHQnLCAkZWxbdmFsXSgpKVxyXG5cclxuICAgIC8vIHB1c2ggdG8gZXZlbnQgbG9vcCB0byBhbGxvdyBmb3JtcyB0byBzdWJtaXRcclxuICAgIHNldFRpbWVvdXQoJC5wcm94eShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICRlbFt2YWxdKGRhdGFbc3RhdGVdID09IG51bGwgPyB0aGlzLm9wdGlvbnNbc3RhdGVdIDogZGF0YVtzdGF0ZV0pXHJcblxyXG4gICAgICBpZiAoc3RhdGUgPT0gJ2xvYWRpbmdUZXh0Jykge1xyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZVxyXG4gICAgICAgICRlbC5hZGRDbGFzcyhkKS5hdHRyKGQsIGQpLnByb3AoZCwgdHJ1ZSlcclxuICAgICAgfSBlbHNlIGlmICh0aGlzLmlzTG9hZGluZykge1xyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2VcclxuICAgICAgICAkZWwucmVtb3ZlQ2xhc3MoZCkucmVtb3ZlQXR0cihkKS5wcm9wKGQsIGZhbHNlKVxyXG4gICAgICB9XHJcbiAgICB9LCB0aGlzKSwgMClcclxuICB9XHJcblxyXG4gIEJ1dHRvbi5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGNoYW5nZWQgPSB0cnVlXHJcbiAgICB2YXIgJHBhcmVudCA9IHRoaXMuJGVsZW1lbnQuY2xvc2VzdCgnW2RhdGEtdG9nZ2xlPVwiYnV0dG9uc1wiXScpXHJcblxyXG4gICAgaWYgKCRwYXJlbnQubGVuZ3RoKSB7XHJcbiAgICAgIHZhciAkaW5wdXQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0JylcclxuICAgICAgaWYgKCRpbnB1dC5wcm9wKCd0eXBlJykgPT0gJ3JhZGlvJykge1xyXG4gICAgICAgIGlmICgkaW5wdXQucHJvcCgnY2hlY2tlZCcpKSBjaGFuZ2VkID0gZmFsc2VcclxuICAgICAgICAkcGFyZW50LmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB9IGVsc2UgaWYgKCRpbnB1dC5wcm9wKCd0eXBlJykgPT0gJ2NoZWNrYm94Jykge1xyXG4gICAgICAgIGlmICgoJGlucHV0LnByb3AoJ2NoZWNrZWQnKSkgIT09IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2FjdGl2ZScpKSBjaGFuZ2VkID0gZmFsc2VcclxuICAgICAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB9XHJcbiAgICAgICRpbnB1dC5wcm9wKCdjaGVja2VkJywgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnYWN0aXZlJykpXHJcbiAgICAgIGlmIChjaGFuZ2VkKSAkaW5wdXQudHJpZ2dlcignY2hhbmdlJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1wcmVzc2VkJywgIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2FjdGl2ZScpKVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRvZ2dsZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIEJVVFRPTiBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuYnV0dG9uJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5idXR0b24nLCAoZGF0YSA9IG5ldyBCdXR0b24odGhpcywgb3B0aW9ucykpKVxyXG5cclxuICAgICAgaWYgKG9wdGlvbiA9PSAndG9nZ2xlJykgZGF0YS50b2dnbGUoKVxyXG4gICAgICBlbHNlIGlmIChvcHRpb24pIGRhdGEuc2V0U3RhdGUob3B0aW9uKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmJ1dHRvblxyXG5cclxuICAkLmZuLmJ1dHRvbiAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uYnV0dG9uLkNvbnN0cnVjdG9yID0gQnV0dG9uXHJcblxyXG5cclxuICAvLyBCVVRUT04gTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5idXR0b24ubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uYnV0dG9uID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEJVVFRPTiBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KVxyXG4gICAgLm9uKCdjbGljay5icy5idXR0b24uZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlXj1cImJ1dHRvblwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIHZhciAkYnRuID0gJChlLnRhcmdldCkuY2xvc2VzdCgnLmJ0bicpXHJcbiAgICAgIFBsdWdpbi5jYWxsKCRidG4sICd0b2dnbGUnKVxyXG4gICAgICBpZiAoISgkKGUudGFyZ2V0KS5pcygnaW5wdXRbdHlwZT1cInJhZGlvXCJdLCBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKSkpIHtcclxuICAgICAgICAvLyBQcmV2ZW50IGRvdWJsZSBjbGljayBvbiByYWRpb3MsIGFuZCB0aGUgZG91YmxlIHNlbGVjdGlvbnMgKHNvIGNhbmNlbGxhdGlvbikgb24gY2hlY2tib3hlc1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIC8vIFRoZSB0YXJnZXQgY29tcG9uZW50IHN0aWxsIHJlY2VpdmUgdGhlIGZvY3VzXHJcbiAgICAgICAgaWYgKCRidG4uaXMoJ2lucHV0LGJ1dHRvbicpKSAkYnRuLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgICBlbHNlICRidG4uZmluZCgnaW5wdXQ6dmlzaWJsZSxidXR0b246dmlzaWJsZScpLmZpcnN0KCkudHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgLm9uKCdmb2N1cy5icy5idXR0b24uZGF0YS1hcGkgYmx1ci5icy5idXR0b24uZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlXj1cImJ1dHRvblwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5idG4nKS50b2dnbGVDbGFzcygnZm9jdXMnLCAvXmZvY3VzKGluKT8kLy50ZXN0KGUudHlwZSkpXHJcbiAgICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogY2Fyb3VzZWwuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2Nhcm91c2VsXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBDQVJPVVNFTCBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgQ2Fyb3VzZWwgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCAgICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMuJGluZGljYXRvcnMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5jYXJvdXNlbC1pbmRpY2F0b3JzJylcclxuICAgIHRoaXMub3B0aW9ucyAgICAgPSBvcHRpb25zXHJcbiAgICB0aGlzLnBhdXNlZCAgICAgID0gbnVsbFxyXG4gICAgdGhpcy5zbGlkaW5nICAgICA9IG51bGxcclxuICAgIHRoaXMuaW50ZXJ2YWwgICAgPSBudWxsXHJcbiAgICB0aGlzLiRhY3RpdmUgICAgID0gbnVsbFxyXG4gICAgdGhpcy4kaXRlbXMgICAgICA9IG51bGxcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMua2V5Ym9hcmQgJiYgdGhpcy4kZWxlbWVudC5vbigna2V5ZG93bi5icy5jYXJvdXNlbCcsICQucHJveHkodGhpcy5rZXlkb3duLCB0aGlzKSlcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMucGF1c2UgPT0gJ2hvdmVyJyAmJiAhKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkgJiYgdGhpcy4kZWxlbWVudFxyXG4gICAgICAub24oJ21vdXNlZW50ZXIuYnMuY2Fyb3VzZWwnLCAkLnByb3h5KHRoaXMucGF1c2UsIHRoaXMpKVxyXG4gICAgICAub24oJ21vdXNlbGVhdmUuYnMuY2Fyb3VzZWwnLCAkLnByb3h5KHRoaXMuY3ljbGUsIHRoaXMpKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIENhcm91c2VsLlRSQU5TSVRJT05fRFVSQVRJT04gPSA2MDBcclxuXHJcbiAgQ2Fyb3VzZWwuREVGQVVMVFMgPSB7XHJcbiAgICBpbnRlcnZhbDogNTAwMCxcclxuICAgIHBhdXNlOiAnaG92ZXInLFxyXG4gICAgd3JhcDogdHJ1ZSxcclxuICAgIGtleWJvYXJkOiB0cnVlXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUua2V5ZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoL2lucHV0fHRleHRhcmVhL2kudGVzdChlLnRhcmdldC50YWdOYW1lKSkgcmV0dXJuXHJcbiAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgY2FzZSAzNzogdGhpcy5wcmV2KCk7IGJyZWFrXHJcbiAgICAgIGNhc2UgMzk6IHRoaXMubmV4dCgpOyBicmVha1xyXG4gICAgICBkZWZhdWx0OiByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5jeWNsZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlIHx8ICh0aGlzLnBhdXNlZCA9IGZhbHNlKVxyXG5cclxuICAgIHRoaXMuaW50ZXJ2YWwgJiYgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKVxyXG5cclxuICAgIHRoaXMub3B0aW9ucy5pbnRlcnZhbFxyXG4gICAgICAmJiAhdGhpcy5wYXVzZWRcclxuICAgICAgJiYgKHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgkLnByb3h5KHRoaXMubmV4dCwgdGhpcyksIHRoaXMub3B0aW9ucy5pbnRlcnZhbCkpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5nZXRJdGVtSW5kZXggPSBmdW5jdGlvbiAoaXRlbSkge1xyXG4gICAgdGhpcy4kaXRlbXMgPSBpdGVtLnBhcmVudCgpLmNoaWxkcmVuKCcuaXRlbScpXHJcbiAgICByZXR1cm4gdGhpcy4kaXRlbXMuaW5kZXgoaXRlbSB8fCB0aGlzLiRhY3RpdmUpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUuZ2V0SXRlbUZvckRpcmVjdGlvbiA9IGZ1bmN0aW9uIChkaXJlY3Rpb24sIGFjdGl2ZSkge1xyXG4gICAgdmFyIGFjdGl2ZUluZGV4ID0gdGhpcy5nZXRJdGVtSW5kZXgoYWN0aXZlKVxyXG4gICAgdmFyIHdpbGxXcmFwID0gKGRpcmVjdGlvbiA9PSAncHJldicgJiYgYWN0aXZlSW5kZXggPT09IDApXHJcbiAgICAgICAgICAgICAgICB8fCAoZGlyZWN0aW9uID09ICduZXh0JyAmJiBhY3RpdmVJbmRleCA9PSAodGhpcy4kaXRlbXMubGVuZ3RoIC0gMSkpXHJcbiAgICBpZiAod2lsbFdyYXAgJiYgIXRoaXMub3B0aW9ucy53cmFwKSByZXR1cm4gYWN0aXZlXHJcbiAgICB2YXIgZGVsdGEgPSBkaXJlY3Rpb24gPT0gJ3ByZXYnID8gLTEgOiAxXHJcbiAgICB2YXIgaXRlbUluZGV4ID0gKGFjdGl2ZUluZGV4ICsgZGVsdGEpICUgdGhpcy4kaXRlbXMubGVuZ3RoXHJcbiAgICByZXR1cm4gdGhpcy4kaXRlbXMuZXEoaXRlbUluZGV4KVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLnRvID0gZnVuY3Rpb24gKHBvcykge1xyXG4gICAgdmFyIHRoYXQgICAgICAgID0gdGhpc1xyXG4gICAgdmFyIGFjdGl2ZUluZGV4ID0gdGhpcy5nZXRJdGVtSW5kZXgodGhpcy4kYWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXRlbS5hY3RpdmUnKSlcclxuXHJcbiAgICBpZiAocG9zID4gKHRoaXMuJGl0ZW1zLmxlbmd0aCAtIDEpIHx8IHBvcyA8IDApIHJldHVyblxyXG5cclxuICAgIGlmICh0aGlzLnNsaWRpbmcpICAgICAgIHJldHVybiB0aGlzLiRlbGVtZW50Lm9uZSgnc2xpZC5icy5jYXJvdXNlbCcsIGZ1bmN0aW9uICgpIHsgdGhhdC50byhwb3MpIH0pIC8vIHllcywgXCJzbGlkXCJcclxuICAgIGlmIChhY3RpdmVJbmRleCA9PSBwb3MpIHJldHVybiB0aGlzLnBhdXNlKCkuY3ljbGUoKVxyXG5cclxuICAgIHJldHVybiB0aGlzLnNsaWRlKHBvcyA+IGFjdGl2ZUluZGV4ID8gJ25leHQnIDogJ3ByZXYnLCB0aGlzLiRpdGVtcy5lcShwb3MpKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUgfHwgKHRoaXMucGF1c2VkID0gdHJ1ZSlcclxuXHJcbiAgICBpZiAodGhpcy4kZWxlbWVudC5maW5kKCcubmV4dCwgLnByZXYnKS5sZW5ndGggJiYgJC5zdXBwb3J0LnRyYW5zaXRpb24pIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZClcclxuICAgICAgdGhpcy5jeWNsZSh0cnVlKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW50ZXJ2YWwgPSBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuc2xpZGluZykgcmV0dXJuXHJcbiAgICByZXR1cm4gdGhpcy5zbGlkZSgnbmV4dCcpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUucHJldiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnNsaWRpbmcpIHJldHVyblxyXG4gICAgcmV0dXJuIHRoaXMuc2xpZGUoJ3ByZXYnKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLnNsaWRlID0gZnVuY3Rpb24gKHR5cGUsIG5leHQpIHtcclxuICAgIHZhciAkYWN0aXZlICAgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pdGVtLmFjdGl2ZScpXHJcbiAgICB2YXIgJG5leHQgICAgID0gbmV4dCB8fCB0aGlzLmdldEl0ZW1Gb3JEaXJlY3Rpb24odHlwZSwgJGFjdGl2ZSlcclxuICAgIHZhciBpc0N5Y2xpbmcgPSB0aGlzLmludGVydmFsXHJcbiAgICB2YXIgZGlyZWN0aW9uID0gdHlwZSA9PSAnbmV4dCcgPyAnbGVmdCcgOiAncmlnaHQnXHJcbiAgICB2YXIgdGhhdCAgICAgID0gdGhpc1xyXG5cclxuICAgIGlmICgkbmV4dC5oYXNDbGFzcygnYWN0aXZlJykpIHJldHVybiAodGhpcy5zbGlkaW5nID0gZmFsc2UpXHJcblxyXG4gICAgdmFyIHJlbGF0ZWRUYXJnZXQgPSAkbmV4dFswXVxyXG4gICAgdmFyIHNsaWRlRXZlbnQgPSAkLkV2ZW50KCdzbGlkZS5icy5jYXJvdXNlbCcsIHtcclxuICAgICAgcmVsYXRlZFRhcmdldDogcmVsYXRlZFRhcmdldCxcclxuICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25cclxuICAgIH0pXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc2xpZGVFdmVudClcclxuICAgIGlmIChzbGlkZUV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB0aGlzLnNsaWRpbmcgPSB0cnVlXHJcblxyXG4gICAgaXNDeWNsaW5nICYmIHRoaXMucGF1c2UoKVxyXG5cclxuICAgIGlmICh0aGlzLiRpbmRpY2F0b3JzLmxlbmd0aCkge1xyXG4gICAgICB0aGlzLiRpbmRpY2F0b3JzLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgdmFyICRuZXh0SW5kaWNhdG9yID0gJCh0aGlzLiRpbmRpY2F0b3JzLmNoaWxkcmVuKClbdGhpcy5nZXRJdGVtSW5kZXgoJG5leHQpXSlcclxuICAgICAgJG5leHRJbmRpY2F0b3IgJiYgJG5leHRJbmRpY2F0b3IuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNsaWRFdmVudCA9ICQuRXZlbnQoJ3NsaWQuYnMuY2Fyb3VzZWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IHJlbGF0ZWRUYXJnZXQsIGRpcmVjdGlvbjogZGlyZWN0aW9uIH0pIC8vIHllcywgXCJzbGlkXCJcclxuICAgIGlmICgkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdzbGlkZScpKSB7XHJcbiAgICAgICRuZXh0LmFkZENsYXNzKHR5cGUpXHJcbiAgICAgICRuZXh0WzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xyXG4gICAgICAkYWN0aXZlLmFkZENsYXNzKGRpcmVjdGlvbilcclxuICAgICAgJG5leHQuYWRkQ2xhc3MoZGlyZWN0aW9uKVxyXG4gICAgICAkYWN0aXZlXHJcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgJG5leHQucmVtb3ZlQ2xhc3MoW3R5cGUsIGRpcmVjdGlvbl0uam9pbignICcpKS5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoWydhY3RpdmUnLCBkaXJlY3Rpb25dLmpvaW4oJyAnKSlcclxuICAgICAgICAgIHRoYXQuc2xpZGluZyA9IGZhbHNlXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKHNsaWRFdmVudClcclxuICAgICAgICAgIH0sIDApXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ2Fyb3VzZWwuVFJBTlNJVElPTl9EVVJBVElPTilcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICRuZXh0LmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICB0aGlzLnNsaWRpbmcgPSBmYWxzZVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc2xpZEV2ZW50KVxyXG4gICAgfVxyXG5cclxuICAgIGlzQ3ljbGluZyAmJiB0aGlzLmN5Y2xlKClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENBUk9VU0VMIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmNhcm91c2VsJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ2Fyb3VzZWwuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcbiAgICAgIHZhciBhY3Rpb24gID0gdHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJyA/IG9wdGlvbiA6IG9wdGlvbnMuc2xpZGVcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY2Fyb3VzZWwnLCAoZGF0YSA9IG5ldyBDYXJvdXNlbCh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdudW1iZXInKSBkYXRhLnRvKG9wdGlvbilcclxuICAgICAgZWxzZSBpZiAoYWN0aW9uKSBkYXRhW2FjdGlvbl0oKVxyXG4gICAgICBlbHNlIGlmIChvcHRpb25zLmludGVydmFsKSBkYXRhLnBhdXNlKCkuY3ljbGUoKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmNhcm91c2VsXHJcblxyXG4gICQuZm4uY2Fyb3VzZWwgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmNhcm91c2VsLkNvbnN0cnVjdG9yID0gQ2Fyb3VzZWxcclxuXHJcblxyXG4gIC8vIENBUk9VU0VMIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5jYXJvdXNlbC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5jYXJvdXNlbCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBDQVJPVVNFTCBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIGhyZWZcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgdmFyICR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykgfHwgKGhyZWYgPSAkdGhpcy5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICBpZiAoISR0YXJnZXQuaGFzQ2xhc3MoJ2Nhcm91c2VsJykpIHJldHVyblxyXG4gICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJHRhcmdldC5kYXRhKCksICR0aGlzLmRhdGEoKSlcclxuICAgIHZhciBzbGlkZUluZGV4ID0gJHRoaXMuYXR0cignZGF0YS1zbGlkZS10bycpXHJcbiAgICBpZiAoc2xpZGVJbmRleCkgb3B0aW9ucy5pbnRlcnZhbCA9IGZhbHNlXHJcblxyXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9ucylcclxuXHJcbiAgICBpZiAoc2xpZGVJbmRleCkge1xyXG4gICAgICAkdGFyZ2V0LmRhdGEoJ2JzLmNhcm91c2VsJykudG8oc2xpZGVJbmRleClcclxuICAgIH1cclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICB9XHJcblxyXG4gICQoZG9jdW1lbnQpXHJcbiAgICAub24oJ2NsaWNrLmJzLmNhcm91c2VsLmRhdGEtYXBpJywgJ1tkYXRhLXNsaWRlXScsIGNsaWNrSGFuZGxlcilcclxuICAgIC5vbignY2xpY2suYnMuY2Fyb3VzZWwuZGF0YS1hcGknLCAnW2RhdGEtc2xpZGUtdG9dJywgY2xpY2tIYW5kbGVyKVxyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdbZGF0YS1yaWRlPVwiY2Fyb3VzZWxcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICRjYXJvdXNlbCA9ICQodGhpcylcclxuICAgICAgUGx1Z2luLmNhbGwoJGNhcm91c2VsLCAkY2Fyb3VzZWwuZGF0YSgpKVxyXG4gICAgfSlcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogY29sbGFwc2UuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI2NvbGxhcHNlXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG4vKiBqc2hpbnQgbGF0ZWRlZjogZmFsc2UgKi9cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQ09MTEFQU0UgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgQ29sbGFwc2UgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCAgICAgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zICAgICAgID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgdGhpcy4kdHJpZ2dlciAgICAgID0gJCgnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1baHJlZj1cIiMnICsgZWxlbWVudC5pZCArICdcIl0sJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXRhcmdldD1cIiMnICsgZWxlbWVudC5pZCArICdcIl0nKVxyXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gbnVsbFxyXG5cclxuICAgIGlmICh0aGlzLm9wdGlvbnMucGFyZW50KSB7XHJcbiAgICAgIHRoaXMuJHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzKHRoaXMuJGVsZW1lbnQsIHRoaXMuJHRyaWdnZXIpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy50b2dnbGUpIHRoaXMudG9nZ2xlKClcclxuICB9XHJcblxyXG4gIENvbGxhcHNlLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMzUwXHJcblxyXG4gIENvbGxhcHNlLkRFRkFVTFRTID0ge1xyXG4gICAgdG9nZ2xlOiB0cnVlXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuZGltZW5zaW9uID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGhhc1dpZHRoID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnd2lkdGgnKVxyXG4gICAgcmV0dXJuIGhhc1dpZHRoID8gJ3dpZHRoJyA6ICdoZWlnaHQnXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIGFjdGl2ZXNEYXRhXHJcbiAgICB2YXIgYWN0aXZlcyA9IHRoaXMuJHBhcmVudCAmJiB0aGlzLiRwYXJlbnQuY2hpbGRyZW4oJy5wYW5lbCcpLmNoaWxkcmVuKCcuaW4sIC5jb2xsYXBzaW5nJylcclxuXHJcbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xyXG4gICAgICBhY3RpdmVzRGF0YSA9IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnKVxyXG4gICAgICBpZiAoYWN0aXZlc0RhdGEgJiYgYWN0aXZlc0RhdGEudHJhbnNpdGlvbmluZykgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLmNvbGxhcHNlJylcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxyXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIGlmIChhY3RpdmVzICYmIGFjdGl2ZXMubGVuZ3RoKSB7XHJcbiAgICAgIFBsdWdpbi5jYWxsKGFjdGl2ZXMsICdoaWRlJylcclxuICAgICAgYWN0aXZlc0RhdGEgfHwgYWN0aXZlcy5kYXRhKCdicy5jb2xsYXBzZScsIG51bGwpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVtkaW1lbnNpb25dKDApXHJcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuXHJcbiAgICB0aGlzLiR0cmlnZ2VyXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnY29sbGFwc2VkJylcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG5cclxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IDFcclxuXHJcbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UgaW4nKVtkaW1lbnNpb25dKCcnKVxyXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAudHJpZ2dlcignc2hvd24uYnMuY29sbGFwc2UnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXHJcblxyXG4gICAgdmFyIHNjcm9sbFNpemUgPSAkLmNhbWVsQ2FzZShbJ3Njcm9sbCcsIGRpbWVuc2lvbl0uam9pbignLScpKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXHJcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OKVtkaW1lbnNpb25dKHRoaXMuJGVsZW1lbnRbMF1bc2Nyb2xsU2l6ZV0pXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnRyYW5zaXRpb25pbmcgfHwgIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxyXG5cclxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnaGlkZS5icy5jb2xsYXBzZScpXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcclxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgZGltZW5zaW9uID0gdGhpcy5kaW1lbnNpb24oKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0oKSlbMF0ub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlIGluJylcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcclxuXHJcbiAgICB0aGlzLiR0cmlnZ2VyXHJcbiAgICAgIC5hZGRDbGFzcygnY29sbGFwc2VkJylcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcclxuXHJcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXHJcblxyXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAwXHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNpbmcnKVxyXG4gICAgICAgIC5hZGRDbGFzcygnY29sbGFwc2UnKVxyXG4gICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuY29sbGFwc2UnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHJldHVybiBjb21wbGV0ZS5jYWxsKHRoaXMpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICBbZGltZW5zaW9uXSgwKVxyXG4gICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcclxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENvbGxhcHNlLlRSQU5TSVRJT05fRFVSQVRJT04pXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpc1t0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpID8gJ2hpZGUnIDogJ3Nob3cnXSgpXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuZ2V0UGFyZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICQodGhpcy5vcHRpb25zLnBhcmVudClcclxuICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2RhdGEtcGFyZW50PVwiJyArIHRoaXMub3B0aW9ucy5wYXJlbnQgKyAnXCJdJylcclxuICAgICAgLmVhY2goJC5wcm94eShmdW5jdGlvbiAoaSwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyhnZXRUYXJnZXRGcm9tVHJpZ2dlcigkZWxlbWVudCksICRlbGVtZW50KVxyXG4gICAgICB9LCB0aGlzKSlcclxuICAgICAgLmVuZCgpXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5wcm90b3R5cGUuYWRkQXJpYUFuZENvbGxhcHNlZENsYXNzID0gZnVuY3Rpb24gKCRlbGVtZW50LCAkdHJpZ2dlcikge1xyXG4gICAgdmFyIGlzT3BlbiA9ICRlbGVtZW50Lmhhc0NsYXNzKCdpbicpXHJcblxyXG4gICAgJGVsZW1lbnQuYXR0cignYXJpYS1leHBhbmRlZCcsIGlzT3BlbilcclxuICAgICR0cmlnZ2VyXHJcbiAgICAgIC50b2dnbGVDbGFzcygnY29sbGFwc2VkJywgIWlzT3BlbilcclxuICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09wZW4pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRUYXJnZXRGcm9tVHJpZ2dlcigkdHJpZ2dlcikge1xyXG4gICAgdmFyIGhyZWZcclxuICAgIHZhciB0YXJnZXQgPSAkdHJpZ2dlci5hdHRyKCdkYXRhLXRhcmdldCcpXHJcbiAgICAgIHx8IChocmVmID0gJHRyaWdnZXIuYXR0cignaHJlZicpKSAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XHJcblxyXG4gICAgcmV0dXJuICQodGFyZ2V0KVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIENPTExBUFNFIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmNvbGxhcHNlJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQ29sbGFwc2UuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb24pXHJcblxyXG4gICAgICBpZiAoIWRhdGEgJiYgb3B0aW9ucy50b2dnbGUgJiYgL3Nob3d8aGlkZS8udGVzdChvcHRpb24pKSBvcHRpb25zLnRvZ2dsZSA9IGZhbHNlXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuY29sbGFwc2UnLCAoZGF0YSA9IG5ldyBDb2xsYXBzZSh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmNvbGxhcHNlXHJcblxyXG4gICQuZm4uY29sbGFwc2UgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmNvbGxhcHNlLkNvbnN0cnVjdG9yID0gQ29sbGFwc2VcclxuXHJcblxyXG4gIC8vIENPTExBUFNFIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5jb2xsYXBzZS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5jb2xsYXBzZSA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBDT0xMQVBTRSBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5jb2xsYXBzZS5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuXHJcbiAgICBpZiAoISR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JykpIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgIHZhciAkdGFyZ2V0ID0gZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJHRoaXMpXHJcbiAgICB2YXIgZGF0YSAgICA9ICR0YXJnZXQuZGF0YSgnYnMuY29sbGFwc2UnKVxyXG4gICAgdmFyIG9wdGlvbiAgPSBkYXRhID8gJ3RvZ2dsZScgOiAkdGhpcy5kYXRhKClcclxuXHJcbiAgICBQbHVnaW4uY2FsbCgkdGFyZ2V0LCBvcHRpb24pXHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGRyb3Bkb3duLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNkcm9wZG93bnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIERST1BET1dOIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBiYWNrZHJvcCA9ICcuZHJvcGRvd24tYmFja2Ryb3AnXHJcbiAgdmFyIHRvZ2dsZSAgID0gJ1tkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCJdJ1xyXG4gIHZhciBEcm9wZG93biA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAkKGVsZW1lbnQpLm9uKCdjbGljay5icy5kcm9wZG93bicsIHRoaXMudG9nZ2xlKVxyXG4gIH1cclxuXHJcbiAgRHJvcGRvd24uVkVSU0lPTiA9ICczLjMuNydcclxuXHJcbiAgZnVuY3Rpb24gZ2V0UGFyZW50KCR0aGlzKSB7XHJcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXHJcblxyXG4gICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxyXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIC8jW0EtWmEtel0vLnRlc3Qoc2VsZWN0b3IpICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICB9XHJcblxyXG4gICAgdmFyICRwYXJlbnQgPSBzZWxlY3RvciAmJiAkKHNlbGVjdG9yKVxyXG5cclxuICAgIHJldHVybiAkcGFyZW50ICYmICRwYXJlbnQubGVuZ3RoID8gJHBhcmVudCA6ICR0aGlzLnBhcmVudCgpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjbGVhck1lbnVzKGUpIHtcclxuICAgIGlmIChlICYmIGUud2hpY2ggPT09IDMpIHJldHVyblxyXG4gICAgJChiYWNrZHJvcCkucmVtb3ZlKClcclxuICAgICQodG9nZ2xlKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgICAgICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciAkcGFyZW50ICAgICAgID0gZ2V0UGFyZW50KCR0aGlzKVxyXG4gICAgICB2YXIgcmVsYXRlZFRhcmdldCA9IHsgcmVsYXRlZFRhcmdldDogdGhpcyB9XHJcblxyXG4gICAgICBpZiAoISRwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKSkgcmV0dXJuXHJcblxyXG4gICAgICBpZiAoZSAmJiBlLnR5cGUgPT0gJ2NsaWNrJyAmJiAvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpICYmICQuY29udGFpbnMoJHBhcmVudFswXSwgZS50YXJnZXQpKSByZXR1cm5cclxuXHJcbiAgICAgICRwYXJlbnQudHJpZ2dlcihlID0gJC5FdmVudCgnaGlkZS5icy5kcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpKVxyXG5cclxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgICAgJHRoaXMuYXR0cignYXJpYS1leHBhbmRlZCcsICdmYWxzZScpXHJcbiAgICAgICRwYXJlbnQucmVtb3ZlQ2xhc3MoJ29wZW4nKS50cmlnZ2VyKCQuRXZlbnQoJ2hpZGRlbi5icy5kcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIERyb3Bkb3duLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG5cclxuICAgIGlmICgkdGhpcy5pcygnLmRpc2FibGVkLCA6ZGlzYWJsZWQnKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyICRwYXJlbnQgID0gZ2V0UGFyZW50KCR0aGlzKVxyXG4gICAgdmFyIGlzQWN0aXZlID0gJHBhcmVudC5oYXNDbGFzcygnb3BlbicpXHJcblxyXG4gICAgY2xlYXJNZW51cygpXHJcblxyXG4gICAgaWYgKCFpc0FjdGl2ZSkge1xyXG4gICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICEkcGFyZW50LmNsb3Nlc3QoJy5uYXZiYXItbmF2JykubGVuZ3RoKSB7XHJcbiAgICAgICAgLy8gaWYgbW9iaWxlIHdlIHVzZSBhIGJhY2tkcm9wIGJlY2F1c2UgY2xpY2sgZXZlbnRzIGRvbid0IGRlbGVnYXRlXHJcbiAgICAgICAgJChkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSlcclxuICAgICAgICAgIC5hZGRDbGFzcygnZHJvcGRvd24tYmFja2Ryb3AnKVxyXG4gICAgICAgICAgLmluc2VydEFmdGVyKCQodGhpcykpXHJcbiAgICAgICAgICAub24oJ2NsaWNrJywgY2xlYXJNZW51cylcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHJlbGF0ZWRUYXJnZXQgPSB7IHJlbGF0ZWRUYXJnZXQ6IHRoaXMgfVxyXG4gICAgICAkcGFyZW50LnRyaWdnZXIoZSA9ICQuRXZlbnQoJ3Nob3cuYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KSlcclxuXHJcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAgICR0aGlzXHJcbiAgICAgICAgLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJylcclxuXHJcbiAgICAgICRwYXJlbnRcclxuICAgICAgICAudG9nZ2xlQ2xhc3MoJ29wZW4nKVxyXG4gICAgICAgIC50cmlnZ2VyKCQuRXZlbnQoJ3Nob3duLmJzLmRyb3Bkb3duJywgcmVsYXRlZFRhcmdldCkpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBEcm9wZG93bi5wcm90b3R5cGUua2V5ZG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoIS8oMzh8NDB8Mjd8MzIpLy50ZXN0KGUud2hpY2gpIHx8IC9pbnB1dHx0ZXh0YXJlYS9pLnRlc3QoZS50YXJnZXQudGFnTmFtZSkpIHJldHVyblxyXG5cclxuICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuXHJcbiAgICBpZiAoJHRoaXMuaXMoJy5kaXNhYmxlZCwgOmRpc2FibGVkJykpIHJldHVyblxyXG5cclxuICAgIHZhciAkcGFyZW50ICA9IGdldFBhcmVudCgkdGhpcylcclxuICAgIHZhciBpc0FjdGl2ZSA9ICRwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKVxyXG5cclxuICAgIGlmICghaXNBY3RpdmUgJiYgZS53aGljaCAhPSAyNyB8fCBpc0FjdGl2ZSAmJiBlLndoaWNoID09IDI3KSB7XHJcbiAgICAgIGlmIChlLndoaWNoID09IDI3KSAkcGFyZW50LmZpbmQodG9nZ2xlKS50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgIHJldHVybiAkdGhpcy50cmlnZ2VyKCdjbGljaycpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlc2MgPSAnIGxpOm5vdCguZGlzYWJsZWQpOnZpc2libGUgYSdcclxuICAgIHZhciAkaXRlbXMgPSAkcGFyZW50LmZpbmQoJy5kcm9wZG93bi1tZW51JyArIGRlc2MpXHJcblxyXG4gICAgaWYgKCEkaXRlbXMubGVuZ3RoKSByZXR1cm5cclxuXHJcbiAgICB2YXIgaW5kZXggPSAkaXRlbXMuaW5kZXgoZS50YXJnZXQpXHJcblxyXG4gICAgaWYgKGUud2hpY2ggPT0gMzggJiYgaW5kZXggPiAwKSAgICAgICAgICAgICAgICAgaW5kZXgtLSAgICAgICAgIC8vIHVwXHJcbiAgICBpZiAoZS53aGljaCA9PSA0MCAmJiBpbmRleCA8ICRpdGVtcy5sZW5ndGggLSAxKSBpbmRleCsrICAgICAgICAgLy8gZG93blxyXG4gICAgaWYgKCF+aW5kZXgpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAwXHJcblxyXG4gICAgJGl0ZW1zLmVxKGluZGV4KS50cmlnZ2VyKCdmb2N1cycpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gRFJPUERPV04gUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy5kcm9wZG93bicpXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmRyb3Bkb3duJywgKGRhdGEgPSBuZXcgRHJvcGRvd24odGhpcykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dLmNhbGwoJHRoaXMpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uZHJvcGRvd25cclxuXHJcbiAgJC5mbi5kcm9wZG93biAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uZHJvcGRvd24uQ29uc3RydWN0b3IgPSBEcm9wZG93blxyXG5cclxuXHJcbiAgLy8gRFJPUERPV04gTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmRyb3Bkb3duLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmRyb3Bkb3duID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEFQUExZIFRPIFNUQU5EQVJEIERST1BET1dOIEVMRU1FTlRTXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudClcclxuICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCBjbGVhck1lbnVzKVxyXG4gICAgLm9uKCdjbGljay5icy5kcm9wZG93bi5kYXRhLWFwaScsICcuZHJvcGRvd24gZm9ybScsIGZ1bmN0aW9uIChlKSB7IGUuc3RvcFByb3BhZ2F0aW9uKCkgfSlcclxuICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCB0b2dnbGUsIERyb3Bkb3duLnByb3RvdHlwZS50b2dnbGUpXHJcbiAgICAub24oJ2tleWRvd24uYnMuZHJvcGRvd24uZGF0YS1hcGknLCB0b2dnbGUsIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duKVxyXG4gICAgLm9uKCdrZXlkb3duLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgJy5kcm9wZG93bi1tZW51JywgRHJvcGRvd24ucHJvdG90eXBlLmtleWRvd24pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBtb2RhbC5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jbW9kYWxzXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBNT0RBTCBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgTW9kYWwgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5vcHRpb25zICAgICAgICAgICAgID0gb3B0aW9uc1xyXG4gICAgdGhpcy4kYm9keSAgICAgICAgICAgICAgID0gJChkb2N1bWVudC5ib2R5KVxyXG4gICAgdGhpcy4kZWxlbWVudCAgICAgICAgICAgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy4kZGlhbG9nICAgICAgICAgICAgID0gdGhpcy4kZWxlbWVudC5maW5kKCcubW9kYWwtZGlhbG9nJylcclxuICAgIHRoaXMuJGJhY2tkcm9wICAgICAgICAgICA9IG51bGxcclxuICAgIHRoaXMuaXNTaG93biAgICAgICAgICAgICA9IG51bGxcclxuICAgIHRoaXMub3JpZ2luYWxCb2R5UGFkICAgICA9IG51bGxcclxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggICAgICA9IDBcclxuICAgIHRoaXMuaWdub3JlQmFja2Ryb3BDbGljayA9IGZhbHNlXHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZW1vdGUpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5maW5kKCcubW9kYWwtY29udGVudCcpXHJcbiAgICAgICAgLmxvYWQodGhpcy5vcHRpb25zLnJlbW90ZSwgJC5wcm94eShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2xvYWRlZC5icy5tb2RhbCcpXHJcbiAgICAgICAgfSwgdGhpcykpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNb2RhbC5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTiA9IDMwMFxyXG4gIE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcclxuXHJcbiAgTW9kYWwuREVGQVVMVFMgPSB7XHJcbiAgICBiYWNrZHJvcDogdHJ1ZSxcclxuICAgIGtleWJvYXJkOiB0cnVlLFxyXG4gICAgc2hvdzogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChfcmVsYXRlZFRhcmdldCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNTaG93biA/IHRoaXMuaGlkZSgpIDogdGhpcy5zaG93KF9yZWxhdGVkVGFyZ2V0KVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoX3JlbGF0ZWRUYXJnZXQpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdzaG93LmJzLm1vZGFsJywgeyByZWxhdGVkVGFyZ2V0OiBfcmVsYXRlZFRhcmdldCB9KVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgIGlmICh0aGlzLmlzU2hvd24gfHwgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5pc1Nob3duID0gdHJ1ZVxyXG5cclxuICAgIHRoaXMuY2hlY2tTY3JvbGxiYXIoKVxyXG4gICAgdGhpcy5zZXRTY3JvbGxiYXIoKVxyXG4gICAgdGhpcy4kYm9keS5hZGRDbGFzcygnbW9kYWwtb3BlbicpXHJcblxyXG4gICAgdGhpcy5lc2NhcGUoKVxyXG4gICAgdGhpcy5yZXNpemUoKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAnW2RhdGEtZGlzbWlzcz1cIm1vZGFsXCJdJywgJC5wcm94eSh0aGlzLmhpZGUsIHRoaXMpKVxyXG5cclxuICAgIHRoaXMuJGRpYWxvZy5vbignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoYXQuJGVsZW1lbnQub25lKCdtb3VzZXVwLmRpc21pc3MuYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGF0LiRlbGVtZW50KSkgdGhhdC5pZ25vcmVCYWNrZHJvcENsaWNrID0gdHJ1ZVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuXHJcbiAgICB0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHRyYW5zaXRpb24gPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGF0LiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJylcclxuXHJcbiAgICAgIGlmICghdGhhdC4kZWxlbWVudC5wYXJlbnQoKS5sZW5ndGgpIHtcclxuICAgICAgICB0aGF0LiRlbGVtZW50LmFwcGVuZFRvKHRoYXQuJGJvZHkpIC8vIGRvbid0IG1vdmUgbW9kYWxzIGRvbSBwb3NpdGlvblxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGF0LiRlbGVtZW50XHJcbiAgICAgICAgLnNob3coKVxyXG4gICAgICAgIC5zY3JvbGxUb3AoMClcclxuXHJcbiAgICAgIHRoYXQuYWRqdXN0RGlhbG9nKClcclxuXHJcbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XHJcbiAgICAgICAgdGhhdC4kZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhhdC4kZWxlbWVudC5hZGRDbGFzcygnaW4nKVxyXG5cclxuICAgICAgdGhhdC5lbmZvcmNlRm9jdXMoKVxyXG5cclxuICAgICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93bi5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcclxuXHJcbiAgICAgIHRyYW5zaXRpb24gP1xyXG4gICAgICAgIHRoYXQuJGRpYWxvZyAvLyB3YWl0IGZvciBtb2RhbCB0byBzbGlkZSBpblxyXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2ZvY3VzJykudHJpZ2dlcihlKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChNb2RhbC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpLnRyaWdnZXIoZSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoZSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgZSA9ICQuRXZlbnQoJ2hpZGUuYnMubW9kYWwnKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgIGlmICghdGhpcy5pc1Nob3duIHx8IGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHRoaXMuaXNTaG93biA9IGZhbHNlXHJcblxyXG4gICAgdGhpcy5lc2NhcGUoKVxyXG4gICAgdGhpcy5yZXNpemUoKVxyXG5cclxuICAgICQoZG9jdW1lbnQpLm9mZignZm9jdXNpbi5icy5tb2RhbCcpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2luJylcclxuICAgICAgLm9mZignY2xpY2suZGlzbWlzcy5icy5tb2RhbCcpXHJcbiAgICAgIC5vZmYoJ21vdXNldXAuZGlzbWlzcy5icy5tb2RhbCcpXHJcblxyXG4gICAgdGhpcy4kZGlhbG9nLm9mZignbW91c2Vkb3duLmRpc21pc3MuYnMubW9kYWwnKVxyXG5cclxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCAkLnByb3h5KHRoaXMuaGlkZU1vZGFsLCB0aGlzKSlcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICB0aGlzLmhpZGVNb2RhbCgpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuZW5mb3JjZUZvY3VzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJChkb2N1bWVudClcclxuICAgICAgLm9mZignZm9jdXNpbi5icy5tb2RhbCcpIC8vIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgZm9jdXMgbG9vcFxyXG4gICAgICAub24oJ2ZvY3VzaW4uYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKGRvY3VtZW50ICE9PSBlLnRhcmdldCAmJlxyXG4gICAgICAgICAgICB0aGlzLiRlbGVtZW50WzBdICE9PSBlLnRhcmdldCAmJlxyXG4gICAgICAgICAgICAhdGhpcy4kZWxlbWVudC5oYXMoZS50YXJnZXQpLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB0aGlzKSlcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5lc2NhcGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5rZXlib2FyZCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgZS53aGljaCA9PSAyNyAmJiB0aGlzLmhpZGUoKVxyXG4gICAgICB9LCB0aGlzKSlcclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuaXNTaG93bikge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigna2V5ZG93bi5kaXNtaXNzLmJzLm1vZGFsJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5pc1Nob3duKSB7XHJcbiAgICAgICQod2luZG93KS5vbigncmVzaXplLmJzLm1vZGFsJywgJC5wcm94eSh0aGlzLmhhbmRsZVVwZGF0ZSwgdGhpcykpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYnMubW9kYWwnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmhpZGVNb2RhbCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdGhpcy4kZWxlbWVudC5oaWRlKClcclxuICAgIHRoaXMuYmFja2Ryb3AoZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGF0LiRib2R5LnJlbW92ZUNsYXNzKCdtb2RhbC1vcGVuJylcclxuICAgICAgdGhhdC5yZXNldEFkanVzdG1lbnRzKClcclxuICAgICAgdGhhdC5yZXNldFNjcm9sbGJhcigpXHJcbiAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignaGlkZGVuLmJzLm1vZGFsJylcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUucmVtb3ZlQmFja2Ryb3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLiRiYWNrZHJvcCAmJiB0aGlzLiRiYWNrZHJvcC5yZW1vdmUoKVxyXG4gICAgdGhpcy4kYmFja2Ryb3AgPSBudWxsXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuYmFja2Ryb3AgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdmFyIGFuaW1hdGUgPSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgPyAnZmFkZScgOiAnJ1xyXG5cclxuICAgIGlmICh0aGlzLmlzU2hvd24gJiYgdGhpcy5vcHRpb25zLmJhY2tkcm9wKSB7XHJcbiAgICAgIHZhciBkb0FuaW1hdGUgPSAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiBhbmltYXRlXHJcblxyXG4gICAgICB0aGlzLiRiYWNrZHJvcCA9ICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpXHJcbiAgICAgICAgLmFkZENsYXNzKCdtb2RhbC1iYWNrZHJvcCAnICsgYW5pbWF0ZSlcclxuICAgICAgICAuYXBwZW5kVG8odGhpcy4kYm9keSlcclxuXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaWdub3JlQmFja2Ryb3BDbGljaykge1xyXG4gICAgICAgICAgdGhpcy5pZ25vcmVCYWNrZHJvcENsaWNrID0gZmFsc2VcclxuICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldCkgcmV0dXJuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmJhY2tkcm9wID09ICdzdGF0aWMnXHJcbiAgICAgICAgICA/IHRoaXMuJGVsZW1lbnRbMF0uZm9jdXMoKVxyXG4gICAgICAgICAgOiB0aGlzLmhpZGUoKVxyXG4gICAgICB9LCB0aGlzKSlcclxuXHJcbiAgICAgIGlmIChkb0FuaW1hdGUpIHRoaXMuJGJhY2tkcm9wWzBdLm9mZnNldFdpZHRoIC8vIGZvcmNlIHJlZmxvd1xyXG5cclxuICAgICAgdGhpcy4kYmFja2Ryb3AuYWRkQ2xhc3MoJ2luJylcclxuXHJcbiAgICAgIGlmICghY2FsbGJhY2spIHJldHVyblxyXG5cclxuICAgICAgZG9BbmltYXRlID9cclxuICAgICAgICB0aGlzLiRiYWNrZHJvcFxyXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2spXHJcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICAgIGNhbGxiYWNrKClcclxuXHJcbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzU2hvd24gJiYgdGhpcy4kYmFja2Ryb3ApIHtcclxuICAgICAgdGhpcy4kYmFja2Ryb3AucmVtb3ZlQ2xhc3MoJ2luJylcclxuXHJcbiAgICAgIHZhciBjYWxsYmFja1JlbW92ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGF0LnJlbW92ZUJhY2tkcm9wKClcclxuICAgICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXHJcbiAgICAgIH1cclxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID9cclxuICAgICAgICB0aGlzLiRiYWNrZHJvcFxyXG4gICAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgY2FsbGJhY2tSZW1vdmUpXHJcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuQkFDS0RST1BfVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICAgIGNhbGxiYWNrUmVtb3ZlKClcclxuXHJcbiAgICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgIGNhbGxiYWNrKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIHRoZXNlIGZvbGxvd2luZyBtZXRob2RzIGFyZSB1c2VkIHRvIGhhbmRsZSBvdmVyZmxvd2luZyBtb2RhbHNcclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmhhbmRsZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuYWRqdXN0RGlhbG9nKClcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5hZGp1c3REaWFsb2cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbW9kYWxJc092ZXJmbG93aW5nID0gdGhpcy4kZWxlbWVudFswXS5zY3JvbGxIZWlnaHQgPiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0XHJcblxyXG4gICAgdGhpcy4kZWxlbWVudC5jc3Moe1xyXG4gICAgICBwYWRkaW5nTGVmdDogICF0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmIG1vZGFsSXNPdmVyZmxvd2luZyA/IHRoaXMuc2Nyb2xsYmFyV2lkdGggOiAnJyxcclxuICAgICAgcGFkZGluZ1JpZ2h0OiB0aGlzLmJvZHlJc092ZXJmbG93aW5nICYmICFtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJydcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRBZGp1c3RtZW50cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcclxuICAgICAgcGFkZGluZ0xlZnQ6ICcnLFxyXG4gICAgICBwYWRkaW5nUmlnaHQ6ICcnXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmNoZWNrU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGZ1bGxXaW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXHJcbiAgICBpZiAoIWZ1bGxXaW5kb3dXaWR0aCkgeyAvLyB3b3JrYXJvdW5kIGZvciBtaXNzaW5nIHdpbmRvdy5pbm5lcldpZHRoIGluIElFOFxyXG4gICAgICB2YXIgZG9jdW1lbnRFbGVtZW50UmVjdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICBmdWxsV2luZG93V2lkdGggPSBkb2N1bWVudEVsZW1lbnRSZWN0LnJpZ2h0IC0gTWF0aC5hYnMoZG9jdW1lbnRFbGVtZW50UmVjdC5sZWZ0KVxyXG4gICAgfVxyXG4gICAgdGhpcy5ib2R5SXNPdmVyZmxvd2luZyA9IGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggPCBmdWxsV2luZG93V2lkdGhcclxuICAgIHRoaXMuc2Nyb2xsYmFyV2lkdGggPSB0aGlzLm1lYXN1cmVTY3JvbGxiYXIoKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnNldFNjcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBib2R5UGFkID0gcGFyc2VJbnQoKHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JykgfHwgMCksIDEwKVxyXG4gICAgdGhpcy5vcmlnaW5hbEJvZHlQYWQgPSBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCB8fCAnJ1xyXG4gICAgaWYgKHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcpIHRoaXMuJGJvZHkuY3NzKCdwYWRkaW5nLXJpZ2h0JywgYm9keVBhZCArIHRoaXMuc2Nyb2xsYmFyV2lkdGgpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUucmVzZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcsIHRoaXMub3JpZ2luYWxCb2R5UGFkKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLm1lYXN1cmVTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7IC8vIHRoeCB3YWxzaFxyXG4gICAgdmFyIHNjcm9sbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gJ21vZGFsLXNjcm9sbGJhci1tZWFzdXJlJ1xyXG4gICAgdGhpcy4kYm9keS5hcHBlbmQoc2Nyb2xsRGl2KVxyXG4gICAgdmFyIHNjcm9sbGJhcldpZHRoID0gc2Nyb2xsRGl2Lm9mZnNldFdpZHRoIC0gc2Nyb2xsRGl2LmNsaWVudFdpZHRoXHJcbiAgICB0aGlzLiRib2R5WzBdLnJlbW92ZUNoaWxkKHNjcm9sbERpdilcclxuICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aFxyXG4gIH1cclxuXHJcblxyXG4gIC8vIE1PREFMIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbiwgX3JlbGF0ZWRUYXJnZXQpIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5tb2RhbCcpXHJcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIE1vZGFsLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5tb2RhbCcsIChkYXRhID0gbmV3IE1vZGFsKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXShfcmVsYXRlZFRhcmdldClcclxuICAgICAgZWxzZSBpZiAob3B0aW9ucy5zaG93KSBkYXRhLnNob3coX3JlbGF0ZWRUYXJnZXQpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4ubW9kYWxcclxuXHJcbiAgJC5mbi5tb2RhbCAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4ubW9kYWwuQ29uc3RydWN0b3IgPSBNb2RhbFxyXG5cclxuXHJcbiAgLy8gTU9EQUwgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLm1vZGFsLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLm1vZGFsID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIE1PREFMIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLm1vZGFsLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cIm1vZGFsXCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgdmFyIGhyZWYgICAgPSAkdGhpcy5hdHRyKCdocmVmJylcclxuICAgIHZhciAkdGFyZ2V0ID0gJCgkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpIHx8IChocmVmICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpKSkgLy8gc3RyaXAgZm9yIGllN1xyXG4gICAgdmFyIG9wdGlvbiAgPSAkdGFyZ2V0LmRhdGEoJ2JzLm1vZGFsJykgPyAndG9nZ2xlJyA6ICQuZXh0ZW5kKHsgcmVtb3RlOiAhLyMvLnRlc3QoaHJlZikgJiYgaHJlZiB9LCAkdGFyZ2V0LmRhdGEoKSwgJHRoaXMuZGF0YSgpKVxyXG5cclxuICAgIGlmICgkdGhpcy5pcygnYScpKSBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICAkdGFyZ2V0Lm9uZSgnc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uIChzaG93RXZlbnQpIHtcclxuICAgICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuIC8vIG9ubHkgcmVnaXN0ZXIgZm9jdXMgcmVzdG9yZXIgaWYgbW9kYWwgd2lsbCBhY3R1YWxseSBnZXQgc2hvd25cclxuICAgICAgJHRhcmdldC5vbmUoJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkdGhpcy5pcygnOnZpc2libGUnKSAmJiAkdGhpcy50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9uLCB0aGlzKVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0b29sdGlwLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0b29sdGlwXHJcbiAqIEluc3BpcmVkIGJ5IHRoZSBvcmlnaW5hbCBqUXVlcnkudGlwc3kgYnkgSmFzb24gRnJhbWVcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFRPT0xUSVAgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMudHlwZSAgICAgICA9IG51bGxcclxuICAgIHRoaXMub3B0aW9ucyAgICA9IG51bGxcclxuICAgIHRoaXMuZW5hYmxlZCAgICA9IG51bGxcclxuICAgIHRoaXMudGltZW91dCAgICA9IG51bGxcclxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcclxuICAgIHRoaXMuJGVsZW1lbnQgICA9IG51bGxcclxuICAgIHRoaXMuaW5TdGF0ZSAgICA9IG51bGxcclxuXHJcbiAgICB0aGlzLmluaXQoJ3Rvb2x0aXAnLCBlbGVtZW50LCBvcHRpb25zKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXHJcblxyXG4gIFRvb2x0aXAuREVGQVVMVFMgPSB7XHJcbiAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICBwbGFjZW1lbnQ6ICd0b3AnLFxyXG4gICAgc2VsZWN0b3I6IGZhbHNlLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidG9vbHRpcFwiIHJvbGU9XCJ0b29sdGlwXCI+PGRpdiBjbGFzcz1cInRvb2x0aXAtYXJyb3dcIj48L2Rpdj48ZGl2IGNsYXNzPVwidG9vbHRpcC1pbm5lclwiPjwvZGl2PjwvZGl2PicsXHJcbiAgICB0cmlnZ2VyOiAnaG92ZXIgZm9jdXMnLFxyXG4gICAgdGl0bGU6ICcnLFxyXG4gICAgZGVsYXk6IDAsXHJcbiAgICBodG1sOiBmYWxzZSxcclxuICAgIGNvbnRhaW5lcjogZmFsc2UsXHJcbiAgICB2aWV3cG9ydDoge1xyXG4gICAgICBzZWxlY3RvcjogJ2JvZHknLFxyXG4gICAgICBwYWRkaW5nOiAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKHR5cGUsIGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuZW5hYmxlZCAgID0gdHJ1ZVxyXG4gICAgdGhpcy50eXBlICAgICAgPSB0eXBlXHJcbiAgICB0aGlzLiRlbGVtZW50ICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyAgID0gdGhpcy5nZXRPcHRpb25zKG9wdGlvbnMpXHJcbiAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiAkKCQuaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMudmlld3BvcnQpID8gdGhpcy5vcHRpb25zLnZpZXdwb3J0LmNhbGwodGhpcywgdGhpcy4kZWxlbWVudCkgOiAodGhpcy5vcHRpb25zLnZpZXdwb3J0LnNlbGVjdG9yIHx8IHRoaXMub3B0aW9ucy52aWV3cG9ydCkpXHJcbiAgICB0aGlzLmluU3RhdGUgICA9IHsgY2xpY2s6IGZhbHNlLCBob3ZlcjogZmFsc2UsIGZvY3VzOiBmYWxzZSB9XHJcblxyXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0gaW5zdGFuY2VvZiBkb2N1bWVudC5jb25zdHJ1Y3RvciAmJiAhdGhpcy5vcHRpb25zLnNlbGVjdG9yKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignYHNlbGVjdG9yYCBvcHRpb24gbXVzdCBiZSBzcGVjaWZpZWQgd2hlbiBpbml0aWFsaXppbmcgJyArIHRoaXMudHlwZSArICcgb24gdGhlIHdpbmRvdy5kb2N1bWVudCBvYmplY3QhJylcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdHJpZ2dlcnMgPSB0aGlzLm9wdGlvbnMudHJpZ2dlci5zcGxpdCgnICcpXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IHRyaWdnZXJzLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICB2YXIgdHJpZ2dlciA9IHRyaWdnZXJzW2ldXHJcblxyXG4gICAgICBpZiAodHJpZ2dlciA9PSAnY2xpY2snKSB7XHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMudG9nZ2xlLCB0aGlzKSlcclxuICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyICE9ICdtYW51YWwnKSB7XHJcbiAgICAgICAgdmFyIGV2ZW50SW4gID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlZW50ZXInIDogJ2ZvY3VzaW4nXHJcbiAgICAgICAgdmFyIGV2ZW50T3V0ID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlbGVhdmUnIDogJ2ZvY3Vzb3V0J1xyXG5cclxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50SW4gICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5lbnRlciwgdGhpcykpXHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudE91dCArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMubGVhdmUsIHRoaXMpKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vcHRpb25zLnNlbGVjdG9yID9cclxuICAgICAgKHRoaXMuX29wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB7IHRyaWdnZXI6ICdtYW51YWwnLCBzZWxlY3RvcjogJycgfSkpIDpcclxuICAgICAgdGhpcy5maXhUaXRsZSgpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBUb29sdGlwLkRFRkFVTFRTXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5nZXREZWZhdWx0cygpLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucylcclxuXHJcbiAgICBpZiAob3B0aW9ucy5kZWxheSAmJiB0eXBlb2Ygb3B0aW9ucy5kZWxheSA9PSAnbnVtYmVyJykge1xyXG4gICAgICBvcHRpb25zLmRlbGF5ID0ge1xyXG4gICAgICAgIHNob3c6IG9wdGlvbnMuZGVsYXksXHJcbiAgICAgICAgaGlkZTogb3B0aW9ucy5kZWxheVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9wdGlvbnNcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlbGVnYXRlT3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBvcHRpb25zICA9IHt9XHJcbiAgICB2YXIgZGVmYXVsdHMgPSB0aGlzLmdldERlZmF1bHRzKClcclxuXHJcbiAgICB0aGlzLl9vcHRpb25zICYmICQuZWFjaCh0aGlzLl9vcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xyXG4gICAgICBpZiAoZGVmYXVsdHNba2V5XSAhPSB2YWx1ZSkgb3B0aW9uc1trZXldID0gdmFsdWVcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIG9wdGlvbnNcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmVudGVyID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cclxuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICBpZiAoIXNlbGYpIHtcclxuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxyXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XHJcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNpbicgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgfHwgc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHtcclxuICAgICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxyXG5cclxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcclxuXHJcbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpIHJldHVybiBzZWxmLnNob3coKVxyXG5cclxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHNlbGYuc2hvdygpXHJcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuc2hvdylcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmlzSW5TdGF0ZVRydWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5pblN0YXRlKSB7XHJcbiAgICAgIGlmICh0aGlzLmluU3RhdGVba2V5XSkgcmV0dXJuIHRydWVcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cclxuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICBpZiAoIXNlbGYpIHtcclxuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxyXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XHJcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNvdXQnID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VsZi5pc0luU3RhdGVUcnVlKCkpIHJldHVyblxyXG5cclxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXHJcblxyXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ291dCdcclxuXHJcbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpIHJldHVybiBzZWxmLmhpZGUoKVxyXG5cclxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdvdXQnKSBzZWxmLmhpZGUoKVxyXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93LmJzLicgKyB0aGlzLnR5cGUpXHJcblxyXG4gICAgaWYgKHRoaXMuaGFzQ29udGVudCgpICYmIHRoaXMuZW5hYmxlZCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcclxuXHJcbiAgICAgIHZhciBpbkRvbSA9ICQuY29udGFpbnModGhpcy4kZWxlbWVudFswXS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgdGhpcy4kZWxlbWVudFswXSlcclxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgIWluRG9tKSByZXR1cm5cclxuICAgICAgdmFyIHRoYXQgPSB0aGlzXHJcblxyXG4gICAgICB2YXIgJHRpcCA9IHRoaXMudGlwKClcclxuXHJcbiAgICAgIHZhciB0aXBJZCA9IHRoaXMuZ2V0VUlEKHRoaXMudHlwZSlcclxuXHJcbiAgICAgIHRoaXMuc2V0Q29udGVudCgpXHJcbiAgICAgICR0aXAuYXR0cignaWQnLCB0aXBJZClcclxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGlwSWQpXHJcblxyXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbikgJHRpcC5hZGRDbGFzcygnZmFkZScpXHJcblxyXG4gICAgICB2YXIgcGxhY2VtZW50ID0gdHlwZW9mIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgPT0gJ2Z1bmN0aW9uJyA/XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudC5jYWxsKHRoaXMsICR0aXBbMF0sIHRoaXMuJGVsZW1lbnRbMF0pIDpcclxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50XHJcblxyXG4gICAgICB2YXIgYXV0b1Rva2VuID0gL1xccz9hdXRvP1xccz8vaVxyXG4gICAgICB2YXIgYXV0b1BsYWNlID0gYXV0b1Rva2VuLnRlc3QocGxhY2VtZW50KVxyXG4gICAgICBpZiAoYXV0b1BsYWNlKSBwbGFjZW1lbnQgPSBwbGFjZW1lbnQucmVwbGFjZShhdXRvVG9rZW4sICcnKSB8fCAndG9wJ1xyXG5cclxuICAgICAgJHRpcFxyXG4gICAgICAgIC5kZXRhY2goKVxyXG4gICAgICAgIC5jc3MoeyB0b3A6IDAsIGxlZnQ6IDAsIGRpc3BsYXk6ICdibG9jaycgfSlcclxuICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxyXG4gICAgICAgIC5kYXRhKCdicy4nICsgdGhpcy50eXBlLCB0aGlzKVxyXG5cclxuICAgICAgdGhpcy5vcHRpb25zLmNvbnRhaW5lciA/ICR0aXAuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcikgOiAkdGlwLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaW5zZXJ0ZWQuYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICAgIHZhciBwb3MgICAgICAgICAgPSB0aGlzLmdldFBvc2l0aW9uKClcclxuICAgICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcclxuICAgICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgICBpZiAoYXV0b1BsYWNlKSB7XHJcbiAgICAgICAgdmFyIG9yZ1BsYWNlbWVudCA9IHBsYWNlbWVudFxyXG4gICAgICAgIHZhciB2aWV3cG9ydERpbSA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXHJcblxyXG4gICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudCA9PSAnYm90dG9tJyAmJiBwb3MuYm90dG9tICsgYWN0dWFsSGVpZ2h0ID4gdmlld3BvcnREaW0uYm90dG9tID8gJ3RvcCcgICAgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICAmJiBwb3MudG9wICAgIC0gYWN0dWFsSGVpZ2h0IDwgdmlld3BvcnREaW0udG9wICAgID8gJ2JvdHRvbScgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAncmlnaHQnICAmJiBwb3MucmlnaHQgICsgYWN0dWFsV2lkdGggID4gdmlld3BvcnREaW0ud2lkdGggID8gJ2xlZnQnICAgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICAmJiBwb3MubGVmdCAgIC0gYWN0dWFsV2lkdGggIDwgdmlld3BvcnREaW0ubGVmdCAgID8gJ3JpZ2h0JyAgOlxyXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFxyXG5cclxuICAgICAgICAkdGlwXHJcbiAgICAgICAgICAucmVtb3ZlQ2xhc3Mob3JnUGxhY2VtZW50KVxyXG4gICAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGNhbGN1bGF0ZWRPZmZzZXQgPSB0aGlzLmdldENhbGN1bGF0ZWRPZmZzZXQocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXHJcblxyXG4gICAgICB0aGlzLmFwcGx5UGxhY2VtZW50KGNhbGN1bGF0ZWRPZmZzZXQsIHBsYWNlbWVudClcclxuXHJcbiAgICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcHJldkhvdmVyU3RhdGUgPSB0aGF0LmhvdmVyU3RhdGVcclxuICAgICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ3Nob3duLmJzLicgKyB0aGF0LnR5cGUpXHJcbiAgICAgICAgdGhhdC5ob3ZlclN0YXRlID0gbnVsbFxyXG5cclxuICAgICAgICBpZiAocHJldkhvdmVyU3RhdGUgPT0gJ291dCcpIHRoYXQubGVhdmUodGhhdClcclxuICAgICAgfVxyXG5cclxuICAgICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xyXG4gICAgICAgICR0aXBcclxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxyXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICAgIGNvbXBsZXRlKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmFwcGx5UGxhY2VtZW50ID0gZnVuY3Rpb24gKG9mZnNldCwgcGxhY2VtZW50KSB7XHJcbiAgICB2YXIgJHRpcCAgID0gdGhpcy50aXAoKVxyXG4gICAgdmFyIHdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcclxuICAgIHZhciBoZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxyXG5cclxuICAgIC8vIG1hbnVhbGx5IHJlYWQgbWFyZ2lucyBiZWNhdXNlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpbmNsdWRlcyBkaWZmZXJlbmNlXHJcbiAgICB2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi10b3AnKSwgMTApXHJcbiAgICB2YXIgbWFyZ2luTGVmdCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tbGVmdCcpLCAxMClcclxuXHJcbiAgICAvLyB3ZSBtdXN0IGNoZWNrIGZvciBOYU4gZm9yIGllIDgvOVxyXG4gICAgaWYgKGlzTmFOKG1hcmdpblRvcCkpICBtYXJnaW5Ub3AgID0gMFxyXG4gICAgaWYgKGlzTmFOKG1hcmdpbkxlZnQpKSBtYXJnaW5MZWZ0ID0gMFxyXG5cclxuICAgIG9mZnNldC50b3AgICs9IG1hcmdpblRvcFxyXG4gICAgb2Zmc2V0LmxlZnQgKz0gbWFyZ2luTGVmdFxyXG5cclxuICAgIC8vICQuZm4ub2Zmc2V0IGRvZXNuJ3Qgcm91bmQgcGl4ZWwgdmFsdWVzXHJcbiAgICAvLyBzbyB3ZSB1c2Ugc2V0T2Zmc2V0IGRpcmVjdGx5IHdpdGggb3VyIG93biBmdW5jdGlvbiBCLTBcclxuICAgICQub2Zmc2V0LnNldE9mZnNldCgkdGlwWzBdLCAkLmV4dGVuZCh7XHJcbiAgICAgIHVzaW5nOiBmdW5jdGlvbiAocHJvcHMpIHtcclxuICAgICAgICAkdGlwLmNzcyh7XHJcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQocHJvcHMudG9wKSxcclxuICAgICAgICAgIGxlZnQ6IE1hdGgucm91bmQocHJvcHMubGVmdClcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9LCBvZmZzZXQpLCAwKVxyXG5cclxuICAgICR0aXAuYWRkQ2xhc3MoJ2luJylcclxuXHJcbiAgICAvLyBjaGVjayB0byBzZWUgaWYgcGxhY2luZyB0aXAgaW4gbmV3IG9mZnNldCBjYXVzZWQgdGhlIHRpcCB0byByZXNpemUgaXRzZWxmXHJcbiAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxyXG4gICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgaWYgKHBsYWNlbWVudCA9PSAndG9wJyAmJiBhY3R1YWxIZWlnaHQgIT0gaGVpZ2h0KSB7XHJcbiAgICAgIG9mZnNldC50b3AgPSBvZmZzZXQudG9wICsgaGVpZ2h0IC0gYWN0dWFsSGVpZ2h0XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGRlbHRhID0gdGhpcy5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEocGxhY2VtZW50LCBvZmZzZXQsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpXHJcblxyXG4gICAgaWYgKGRlbHRhLmxlZnQpIG9mZnNldC5sZWZ0ICs9IGRlbHRhLmxlZnRcclxuICAgIGVsc2Ugb2Zmc2V0LnRvcCArPSBkZWx0YS50b3BcclxuXHJcbiAgICB2YXIgaXNWZXJ0aWNhbCAgICAgICAgICA9IC90b3B8Ym90dG9tLy50ZXN0KHBsYWNlbWVudClcclxuICAgIHZhciBhcnJvd0RlbHRhICAgICAgICAgID0gaXNWZXJ0aWNhbCA/IGRlbHRhLmxlZnQgKiAyIC0gd2lkdGggKyBhY3R1YWxXaWR0aCA6IGRlbHRhLnRvcCAqIDIgLSBoZWlnaHQgKyBhY3R1YWxIZWlnaHRcclxuICAgIHZhciBhcnJvd09mZnNldFBvc2l0aW9uID0gaXNWZXJ0aWNhbCA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xyXG5cclxuICAgICR0aXAub2Zmc2V0KG9mZnNldClcclxuICAgIHRoaXMucmVwbGFjZUFycm93KGFycm93RGVsdGEsICR0aXBbMF1bYXJyb3dPZmZzZXRQb3NpdGlvbl0sIGlzVmVydGljYWwpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5yZXBsYWNlQXJyb3cgPSBmdW5jdGlvbiAoZGVsdGEsIGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xyXG4gICAgdGhpcy5hcnJvdygpXHJcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICdsZWZ0JyA6ICd0b3AnLCA1MCAqICgxIC0gZGVsdGEgLyBkaW1lbnNpb24pICsgJyUnKVxyXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JywgJycpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aXAgID0gdGhpcy50aXAoKVxyXG4gICAgdmFyIHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpXHJcblxyXG4gICAgJHRpcC5maW5kKCcudG9vbHRpcC1pbm5lcicpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcclxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2ZhZGUgaW4gdG9wIGJvdHRvbSBsZWZ0IHJpZ2h0JylcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdmFyICR0aXAgPSAkKHRoaXMuJHRpcClcclxuICAgIHZhciBlICAgID0gJC5FdmVudCgnaGlkZS5icy4nICsgdGhpcy50eXBlKVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xyXG4gICAgICBpZiAodGhhdC5ob3ZlclN0YXRlICE9ICdpbicpICR0aXAuZGV0YWNoKClcclxuICAgICAgaWYgKHRoYXQuJGVsZW1lbnQpIHsgLy8gVE9ETzogQ2hlY2sgd2hldGhlciBndWFyZGluZyB0aGlzIGNvZGUgd2l0aCB0aGlzIGBpZmAgaXMgcmVhbGx5IG5lY2Vzc2FyeS5cclxuICAgICAgICB0aGF0LiRlbGVtZW50XHJcbiAgICAgICAgICAucmVtb3ZlQXR0cignYXJpYS1kZXNjcmliZWRieScpXHJcbiAgICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLicgKyB0aGF0LnR5cGUpXHJcbiAgICAgIH1cclxuICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihlKVxyXG5cclxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXHJcblxyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHRpcC5oYXNDbGFzcygnZmFkZScpID9cclxuICAgICAgJHRpcFxyXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxyXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgY29tcGxldGUoKVxyXG5cclxuICAgIHRoaXMuaG92ZXJTdGF0ZSA9IG51bGxcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZml4VGl0bGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XHJcbiAgICBpZiAoJGUuYXR0cigndGl0bGUnKSB8fCB0eXBlb2YgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpICE9ICdzdHJpbmcnKSB7XHJcbiAgICAgICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLCAkZS5hdHRyKCd0aXRsZScpIHx8ICcnKS5hdHRyKCd0aXRsZScsICcnKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuaGFzQ29udGVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKClcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gKCRlbGVtZW50KSB7XHJcbiAgICAkZWxlbWVudCAgID0gJGVsZW1lbnQgfHwgdGhpcy4kZWxlbWVudFxyXG5cclxuICAgIHZhciBlbCAgICAgPSAkZWxlbWVudFswXVxyXG4gICAgdmFyIGlzQm9keSA9IGVsLnRhZ05hbWUgPT0gJ0JPRFknXHJcblxyXG4gICAgdmFyIGVsUmVjdCAgICA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgICBpZiAoZWxSZWN0LndpZHRoID09IG51bGwpIHtcclxuICAgICAgLy8gd2lkdGggYW5kIGhlaWdodCBhcmUgbWlzc2luZyBpbiBJRTgsIHNvIGNvbXB1dGUgdGhlbSBtYW51YWxseTsgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9pc3N1ZXMvMTQwOTNcclxuICAgICAgZWxSZWN0ID0gJC5leHRlbmQoe30sIGVsUmVjdCwgeyB3aWR0aDogZWxSZWN0LnJpZ2h0IC0gZWxSZWN0LmxlZnQsIGhlaWdodDogZWxSZWN0LmJvdHRvbSAtIGVsUmVjdC50b3AgfSlcclxuICAgIH1cclxuICAgIHZhciBpc1N2ZyA9IHdpbmRvdy5TVkdFbGVtZW50ICYmIGVsIGluc3RhbmNlb2Ygd2luZG93LlNWR0VsZW1lbnRcclxuICAgIC8vIEF2b2lkIHVzaW5nICQub2Zmc2V0KCkgb24gU1ZHcyBzaW5jZSBpdCBnaXZlcyBpbmNvcnJlY3QgcmVzdWx0cyBpbiBqUXVlcnkgMy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzIwMjgwXHJcbiAgICB2YXIgZWxPZmZzZXQgID0gaXNCb2R5ID8geyB0b3A6IDAsIGxlZnQ6IDAgfSA6IChpc1N2ZyA/IG51bGwgOiAkZWxlbWVudC5vZmZzZXQoKSlcclxuICAgIHZhciBzY3JvbGwgICAgPSB7IHNjcm9sbDogaXNCb2R5ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA6ICRlbGVtZW50LnNjcm9sbFRvcCgpIH1cclxuICAgIHZhciBvdXRlckRpbXMgPSBpc0JvZHkgPyB7IHdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSwgaGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KCkgfSA6IG51bGxcclxuXHJcbiAgICByZXR1cm4gJC5leHRlbmQoe30sIGVsUmVjdCwgc2Nyb2xsLCBvdXRlckRpbXMsIGVsT2Zmc2V0KVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Q2FsY3VsYXRlZE9mZnNldCA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xyXG4gICAgcmV0dXJuIHBsYWNlbWVudCA9PSAnYm90dG9tJyA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCwgICBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XHJcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICd0b3AnICAgID8geyB0b3A6IHBvcy50b3AgLSBhY3R1YWxIZWlnaHQsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIC8gMiAtIGFjdHVhbFdpZHRoIC8gMiB9IDpcclxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgLSBhY3R1YWxXaWR0aCB9IDpcclxuICAgICAgICAvKiBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAqLyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggfVxyXG5cclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YSA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xyXG4gICAgdmFyIGRlbHRhID0geyB0b3A6IDAsIGxlZnQ6IDAgfVxyXG4gICAgaWYgKCF0aGlzLiR2aWV3cG9ydCkgcmV0dXJuIGRlbHRhXHJcblxyXG4gICAgdmFyIHZpZXdwb3J0UGFkZGluZyA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiB0aGlzLm9wdGlvbnMudmlld3BvcnQucGFkZGluZyB8fCAwXHJcbiAgICB2YXIgdmlld3BvcnREaW1lbnNpb25zID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcclxuXHJcbiAgICBpZiAoL3JpZ2h0fGxlZnQvLnRlc3QocGxhY2VtZW50KSkge1xyXG4gICAgICB2YXIgdG9wRWRnZU9mZnNldCAgICA9IHBvcy50b3AgLSB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsXHJcbiAgICAgIHZhciBib3R0b21FZGdlT2Zmc2V0ID0gcG9zLnRvcCArIHZpZXdwb3J0UGFkZGluZyAtIHZpZXdwb3J0RGltZW5zaW9ucy5zY3JvbGwgKyBhY3R1YWxIZWlnaHRcclxuICAgICAgaWYgKHRvcEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMudG9wKSB7IC8vIHRvcCBvdmVyZmxvd1xyXG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgLSB0b3BFZGdlT2Zmc2V0XHJcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tRWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0KSB7IC8vIGJvdHRvbSBvdmVyZmxvd1xyXG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0IC0gYm90dG9tRWRnZU9mZnNldFxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgbGVmdEVkZ2VPZmZzZXQgID0gcG9zLmxlZnQgLSB2aWV3cG9ydFBhZGRpbmdcclxuICAgICAgdmFyIHJpZ2h0RWRnZU9mZnNldCA9IHBvcy5sZWZ0ICsgdmlld3BvcnRQYWRkaW5nICsgYWN0dWFsV2lkdGhcclxuICAgICAgaWYgKGxlZnRFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLmxlZnQpIHsgLy8gbGVmdCBvdmVyZmxvd1xyXG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCAtIGxlZnRFZGdlT2Zmc2V0XHJcbiAgICAgIH0gZWxzZSBpZiAocmlnaHRFZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnJpZ2h0KSB7IC8vIHJpZ2h0IG92ZXJmbG93XHJcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0ICsgdmlld3BvcnREaW1lbnNpb25zLndpZHRoIC0gcmlnaHRFZGdlT2Zmc2V0XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVsdGFcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFRpdGxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRpdGxlXHJcbiAgICB2YXIgJGUgPSB0aGlzLiRlbGVtZW50XHJcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcclxuXHJcbiAgICB0aXRsZSA9ICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKVxyXG4gICAgICB8fCAodHlwZW9mIG8udGl0bGUgPT0gJ2Z1bmN0aW9uJyA/IG8udGl0bGUuY2FsbCgkZVswXSkgOiAgby50aXRsZSlcclxuXHJcbiAgICByZXR1cm4gdGl0bGVcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFVJRCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcclxuICAgIGRvIHByZWZpeCArPSB+fihNYXRoLnJhbmRvbSgpICogMTAwMDAwMClcclxuICAgIHdoaWxlIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmaXgpKVxyXG4gICAgcmV0dXJuIHByZWZpeFxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUudGlwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKCF0aGlzLiR0aXApIHtcclxuICAgICAgdGhpcy4kdGlwID0gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpXHJcbiAgICAgIGlmICh0aGlzLiR0aXAubGVuZ3RoICE9IDEpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50eXBlICsgJyBgdGVtcGxhdGVgIG9wdGlvbiBtdXN0IGNvbnNpc3Qgb2YgZXhhY3RseSAxIHRvcC1sZXZlbCBlbGVtZW50IScpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLiR0aXBcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLnRvb2x0aXAtYXJyb3cnKSlcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuZW5hYmxlZCA9ICF0aGlzLmVuYWJsZWRcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgc2VsZiA9IHRoaXNcclxuICAgIGlmIChlKSB7XHJcbiAgICAgIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcclxuICAgICAgaWYgKCFzZWxmKSB7XHJcbiAgICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGUuY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcclxuICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChlKSB7XHJcbiAgICAgIHNlbGYuaW5TdGF0ZS5jbGljayA9ICFzZWxmLmluU3RhdGUuY2xpY2tcclxuICAgICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSBzZWxmLmVudGVyKHNlbGYpXHJcbiAgICAgIGVsc2Ugc2VsZi5sZWF2ZShzZWxmKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/IHNlbGYubGVhdmUoc2VsZikgOiBzZWxmLmVudGVyKHNlbGYpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRoYXQgPSB0aGlzXHJcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxyXG4gICAgdGhpcy5oaWRlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhhdC4kZWxlbWVudC5vZmYoJy4nICsgdGhhdC50eXBlKS5yZW1vdmVEYXRhKCdicy4nICsgdGhhdC50eXBlKVxyXG4gICAgICBpZiAodGhhdC4kdGlwKSB7XHJcbiAgICAgICAgdGhhdC4kdGlwLmRldGFjaCgpXHJcbiAgICAgIH1cclxuICAgICAgdGhhdC4kdGlwID0gbnVsbFxyXG4gICAgICB0aGF0LiRhcnJvdyA9IG51bGxcclxuICAgICAgdGhhdC4kdmlld3BvcnQgPSBudWxsXHJcbiAgICAgIHRoYXQuJGVsZW1lbnQgPSBudWxsXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIFRPT0xUSVAgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy50b29sdGlwJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcsIChkYXRhID0gbmV3IFRvb2x0aXAodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi50b29sdGlwXHJcblxyXG4gICQuZm4udG9vbHRpcCAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4udG9vbHRpcC5Db25zdHJ1Y3RvciA9IFRvb2x0aXBcclxuXHJcblxyXG4gIC8vIFRPT0xUSVAgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4udG9vbHRpcC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi50b29sdGlwID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHBvcG92ZXIuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3BvcG92ZXJzXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBQT1BPVkVSIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgUG9wb3ZlciA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLmluaXQoJ3BvcG92ZXInLCBlbGVtZW50LCBvcHRpb25zKVxyXG4gIH1cclxuXHJcbiAgaWYgKCEkLmZuLnRvb2x0aXApIHRocm93IG5ldyBFcnJvcignUG9wb3ZlciByZXF1aXJlcyB0b29sdGlwLmpzJylcclxuXHJcbiAgUG9wb3Zlci5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgUG9wb3Zlci5ERUZBVUxUUyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IuREVGQVVMVFMsIHtcclxuICAgIHBsYWNlbWVudDogJ3JpZ2h0JyxcclxuICAgIHRyaWdnZXI6ICdjbGljaycsXHJcbiAgICBjb250ZW50OiAnJyxcclxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInBvcG92ZXJcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJhcnJvd1wiPjwvZGl2PjxoMyBjbGFzcz1cInBvcG92ZXItdGl0bGVcIj48L2gzPjxkaXYgY2xhc3M9XCJwb3BvdmVyLWNvbnRlbnRcIj48L2Rpdj48L2Rpdj4nXHJcbiAgfSlcclxuXHJcblxyXG4gIC8vIE5PVEU6IFBPUE9WRVIgRVhURU5EUyB0b29sdGlwLmpzXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLnByb3RvdHlwZSlcclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBQb3BvdmVyXHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFBvcG92ZXIuREVGQVVMVFNcclxuICB9XHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgJHRpcCAgICA9IHRoaXMudGlwKClcclxuICAgIHZhciB0aXRsZSAgID0gdGhpcy5nZXRUaXRsZSgpXHJcbiAgICB2YXIgY29udGVudCA9IHRoaXMuZ2V0Q29udGVudCgpXHJcblxyXG4gICAgJHRpcC5maW5kKCcucG9wb3Zlci10aXRsZScpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcclxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItY29udGVudCcpLmNoaWxkcmVuKCkuZGV0YWNoKCkuZW5kKClbIC8vIHdlIHVzZSBhcHBlbmQgZm9yIGh0bWwgb2JqZWN0cyB0byBtYWludGFpbiBqcyBldmVudHNcclxuICAgICAgdGhpcy5vcHRpb25zLmh0bWwgPyAodHlwZW9mIGNvbnRlbnQgPT0gJ3N0cmluZycgPyAnaHRtbCcgOiAnYXBwZW5kJykgOiAndGV4dCdcclxuICAgIF0oY29udGVudClcclxuXHJcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIHRvcCBib3R0b20gbGVmdCByaWdodCBpbicpXHJcblxyXG4gICAgLy8gSUU4IGRvZXNuJ3QgYWNjZXB0IGhpZGluZyB2aWEgdGhlIGA6ZW1wdHlgIHBzZXVkbyBzZWxlY3Rvciwgd2UgaGF2ZSB0byBkb1xyXG4gICAgLy8gdGhpcyBtYW51YWxseSBieSBjaGVja2luZyB0aGUgY29udGVudHMuXHJcbiAgICBpZiAoISR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5odG1sKCkpICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKS5oaWRlKClcclxuICB9XHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpIHx8IHRoaXMuZ2V0Q29udGVudCgpXHJcbiAgfVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxyXG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXHJcblxyXG4gICAgcmV0dXJuICRlLmF0dHIoJ2RhdGEtY29udGVudCcpXHJcbiAgICAgIHx8ICh0eXBlb2Ygby5jb250ZW50ID09ICdmdW5jdGlvbicgP1xyXG4gICAgICAgICAgICBvLmNvbnRlbnQuY2FsbCgkZVswXSkgOlxyXG4gICAgICAgICAgICBvLmNvbnRlbnQpXHJcbiAgfVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy5hcnJvdycpKVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIFBPUE9WRVIgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5wb3BvdmVyJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicsIChkYXRhID0gbmV3IFBvcG92ZXIodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5wb3BvdmVyXHJcblxyXG4gICQuZm4ucG9wb3ZlciAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4ucG9wb3Zlci5Db25zdHJ1Y3RvciA9IFBvcG92ZXJcclxuXHJcblxyXG4gIC8vIFBPUE9WRVIgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4ucG9wb3Zlci5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5wb3BvdmVyID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IHNjcm9sbHNweS5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jc2Nyb2xsc3B5XHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBTQ1JPTExTUFkgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFNjcm9sbFNweShlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRib2R5ICAgICAgICAgID0gJChkb2N1bWVudC5ib2R5KVxyXG4gICAgdGhpcy4kc2Nyb2xsRWxlbWVudCA9ICQoZWxlbWVudCkuaXMoZG9jdW1lbnQuYm9keSkgPyAkKHdpbmRvdykgOiAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgICAgICAgID0gJC5leHRlbmQoe30sIFNjcm9sbFNweS5ERUZBVUxUUywgb3B0aW9ucylcclxuICAgIHRoaXMuc2VsZWN0b3IgICAgICAgPSAodGhpcy5vcHRpb25zLnRhcmdldCB8fCAnJykgKyAnIC5uYXYgbGkgPiBhJ1xyXG4gICAgdGhpcy5vZmZzZXRzICAgICAgICA9IFtdXHJcbiAgICB0aGlzLnRhcmdldHMgICAgICAgID0gW11cclxuICAgIHRoaXMuYWN0aXZlVGFyZ2V0ICAgPSBudWxsXHJcbiAgICB0aGlzLnNjcm9sbEhlaWdodCAgID0gMFxyXG5cclxuICAgIHRoaXMuJHNjcm9sbEVsZW1lbnQub24oJ3Njcm9sbC5icy5zY3JvbGxzcHknLCAkLnByb3h5KHRoaXMucHJvY2VzcywgdGhpcykpXHJcbiAgICB0aGlzLnJlZnJlc2goKVxyXG4gICAgdGhpcy5wcm9jZXNzKClcclxuICB9XHJcblxyXG4gIFNjcm9sbFNweS5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgU2Nyb2xsU3B5LkRFRkFVTFRTID0ge1xyXG4gICAgb2Zmc2V0OiAxMFxyXG4gIH1cclxuXHJcbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5nZXRTY3JvbGxIZWlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4kc2Nyb2xsRWxlbWVudFswXS5zY3JvbGxIZWlnaHQgfHwgTWF0aC5tYXgodGhpcy4kYm9keVswXS5zY3JvbGxIZWlnaHQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxIZWlnaHQpXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGhhdCAgICAgICAgICA9IHRoaXNcclxuICAgIHZhciBvZmZzZXRNZXRob2QgID0gJ29mZnNldCdcclxuICAgIHZhciBvZmZzZXRCYXNlICAgID0gMFxyXG5cclxuICAgIHRoaXMub2Zmc2V0cyAgICAgID0gW11cclxuICAgIHRoaXMudGFyZ2V0cyAgICAgID0gW11cclxuICAgIHRoaXMuc2Nyb2xsSGVpZ2h0ID0gdGhpcy5nZXRTY3JvbGxIZWlnaHQoKVxyXG5cclxuICAgIGlmICghJC5pc1dpbmRvdyh0aGlzLiRzY3JvbGxFbGVtZW50WzBdKSkge1xyXG4gICAgICBvZmZzZXRNZXRob2QgPSAncG9zaXRpb24nXHJcbiAgICAgIG9mZnNldEJhc2UgICA9IHRoaXMuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKClcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRib2R5XHJcbiAgICAgIC5maW5kKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgIC5tYXAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkZWwgICA9ICQodGhpcylcclxuICAgICAgICB2YXIgaHJlZiAgPSAkZWwuZGF0YSgndGFyZ2V0JykgfHwgJGVsLmF0dHIoJ2hyZWYnKVxyXG4gICAgICAgIHZhciAkaHJlZiA9IC9eIy4vLnRlc3QoaHJlZikgJiYgJChocmVmKVxyXG5cclxuICAgICAgICByZXR1cm4gKCRocmVmXHJcbiAgICAgICAgICAmJiAkaHJlZi5sZW5ndGhcclxuICAgICAgICAgICYmICRocmVmLmlzKCc6dmlzaWJsZScpXHJcbiAgICAgICAgICAmJiBbWyRocmVmW29mZnNldE1ldGhvZF0oKS50b3AgKyBvZmZzZXRCYXNlLCBocmVmXV0pIHx8IG51bGxcclxuICAgICAgfSlcclxuICAgICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGFbMF0gLSBiWzBdIH0pXHJcbiAgICAgIC5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGF0Lm9mZnNldHMucHVzaCh0aGlzWzBdKVxyXG4gICAgICAgIHRoYXQudGFyZ2V0cy5wdXNoKHRoaXNbMV0pXHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLnByb2Nlc3MgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgc2Nyb2xsVG9wICAgID0gdGhpcy4kc2Nyb2xsRWxlbWVudC5zY3JvbGxUb3AoKSArIHRoaXMub3B0aW9ucy5vZmZzZXRcclxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSB0aGlzLmdldFNjcm9sbEhlaWdodCgpXHJcbiAgICB2YXIgbWF4U2Nyb2xsICAgID0gdGhpcy5vcHRpb25zLm9mZnNldCArIHNjcm9sbEhlaWdodCAtIHRoaXMuJHNjcm9sbEVsZW1lbnQuaGVpZ2h0KClcclxuICAgIHZhciBvZmZzZXRzICAgICAgPSB0aGlzLm9mZnNldHNcclxuICAgIHZhciB0YXJnZXRzICAgICAgPSB0aGlzLnRhcmdldHNcclxuICAgIHZhciBhY3RpdmVUYXJnZXQgPSB0aGlzLmFjdGl2ZVRhcmdldFxyXG4gICAgdmFyIGlcclxuXHJcbiAgICBpZiAodGhpcy5zY3JvbGxIZWlnaHQgIT0gc2Nyb2xsSGVpZ2h0KSB7XHJcbiAgICAgIHRoaXMucmVmcmVzaCgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNjcm9sbFRvcCA+PSBtYXhTY3JvbGwpIHtcclxuICAgICAgcmV0dXJuIGFjdGl2ZVRhcmdldCAhPSAoaSA9IHRhcmdldHNbdGFyZ2V0cy5sZW5ndGggLSAxXSkgJiYgdGhpcy5hY3RpdmF0ZShpKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhY3RpdmVUYXJnZXQgJiYgc2Nyb2xsVG9wIDwgb2Zmc2V0c1swXSkge1xyXG4gICAgICB0aGlzLmFjdGl2ZVRhcmdldCA9IG51bGxcclxuICAgICAgcmV0dXJuIHRoaXMuY2xlYXIoKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IG9mZnNldHMubGVuZ3RoOyBpLS07KSB7XHJcbiAgICAgIGFjdGl2ZVRhcmdldCAhPSB0YXJnZXRzW2ldXHJcbiAgICAgICAgJiYgc2Nyb2xsVG9wID49IG9mZnNldHNbaV1cclxuICAgICAgICAmJiAob2Zmc2V0c1tpICsgMV0gPT09IHVuZGVmaW5lZCB8fCBzY3JvbGxUb3AgPCBvZmZzZXRzW2kgKyAxXSlcclxuICAgICAgICAmJiB0aGlzLmFjdGl2YXRlKHRhcmdldHNbaV0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgdGhpcy5hY3RpdmVUYXJnZXQgPSB0YXJnZXRcclxuXHJcbiAgICB0aGlzLmNsZWFyKClcclxuXHJcbiAgICB2YXIgc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yICtcclxuICAgICAgJ1tkYXRhLXRhcmdldD1cIicgKyB0YXJnZXQgKyAnXCJdLCcgK1xyXG4gICAgICB0aGlzLnNlbGVjdG9yICsgJ1tocmVmPVwiJyArIHRhcmdldCArICdcIl0nXHJcblxyXG4gICAgdmFyIGFjdGl2ZSA9ICQoc2VsZWN0b3IpXHJcbiAgICAgIC5wYXJlbnRzKCdsaScpXHJcbiAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuXHJcbiAgICBpZiAoYWN0aXZlLnBhcmVudCgnLmRyb3Bkb3duLW1lbnUnKS5sZW5ndGgpIHtcclxuICAgICAgYWN0aXZlID0gYWN0aXZlXHJcbiAgICAgICAgLmNsb3Nlc3QoJ2xpLmRyb3Bkb3duJylcclxuICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICB9XHJcblxyXG4gICAgYWN0aXZlLnRyaWdnZXIoJ2FjdGl2YXRlLmJzLnNjcm9sbHNweScpXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJCh0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAucGFyZW50c1VudGlsKHRoaXMub3B0aW9ucy50YXJnZXQsICcuYWN0aXZlJylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIFNDUk9MTFNQWSBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuc2Nyb2xsc3B5JylcclxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5zY3JvbGxzcHknLCAoZGF0YSA9IG5ldyBTY3JvbGxTcHkodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5zY3JvbGxzcHlcclxuXHJcbiAgJC5mbi5zY3JvbGxzcHkgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLnNjcm9sbHNweS5Db25zdHJ1Y3RvciA9IFNjcm9sbFNweVxyXG5cclxuXHJcbiAgLy8gU0NST0xMU1BZIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uc2Nyb2xsc3B5Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLnNjcm9sbHNweSA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBTQ1JPTExTUFkgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJCh3aW5kb3cpLm9uKCdsb2FkLmJzLnNjcm9sbHNweS5kYXRhLWFwaScsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ1tkYXRhLXNweT1cInNjcm9sbFwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHNweSA9ICQodGhpcylcclxuICAgICAgUGx1Z2luLmNhbGwoJHNweSwgJHNweS5kYXRhKCkpXHJcbiAgICB9KVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0YWIuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3RhYnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIFRBQiBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIFRhYiA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAvLyBqc2NzOmRpc2FibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcclxuICAgIHRoaXMuZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgIC8vIGpzY3M6ZW5hYmxlIHJlcXVpcmVEb2xsYXJCZWZvcmVqUXVlcnlBc3NpZ25tZW50XHJcbiAgfVxyXG5cclxuICBUYWIuVkVSU0lPTiA9ICczLjMuNydcclxuXHJcbiAgVGFiLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcclxuXHJcbiAgVGFiLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aGlzICAgID0gdGhpcy5lbGVtZW50XHJcbiAgICB2YXIgJHVsICAgICAgPSAkdGhpcy5jbG9zZXN0KCd1bDpub3QoLmRyb3Bkb3duLW1lbnUpJylcclxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmRhdGEoJ3RhcmdldCcpXHJcblxyXG4gICAgaWYgKCFzZWxlY3Rvcikge1xyXG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxyXG4gICAgICBzZWxlY3RvciA9IHNlbGVjdG9yICYmIHNlbGVjdG9yLnJlcGxhY2UoLy4qKD89I1teXFxzXSokKS8sICcnKSAvLyBzdHJpcCBmb3IgaWU3XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCR0aGlzLnBhcmVudCgnbGknKS5oYXNDbGFzcygnYWN0aXZlJykpIHJldHVyblxyXG5cclxuICAgIHZhciAkcHJldmlvdXMgPSAkdWwuZmluZCgnLmFjdGl2ZTpsYXN0IGEnKVxyXG4gICAgdmFyIGhpZGVFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMudGFiJywge1xyXG4gICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxyXG4gICAgfSlcclxuICAgIHZhciBzaG93RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLnRhYicsIHtcclxuICAgICAgcmVsYXRlZFRhcmdldDogJHByZXZpb3VzWzBdXHJcbiAgICB9KVxyXG5cclxuICAgICRwcmV2aW91cy50cmlnZ2VyKGhpZGVFdmVudClcclxuICAgICR0aGlzLnRyaWdnZXIoc2hvd0V2ZW50KVxyXG5cclxuICAgIGlmIChzaG93RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgaGlkZUV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgJHRhcmdldCA9ICQoc2VsZWN0b3IpXHJcblxyXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGhpcy5jbG9zZXN0KCdsaScpLCAkdWwpXHJcbiAgICB0aGlzLmFjdGl2YXRlKCR0YXJnZXQsICR0YXJnZXQucGFyZW50KCksIGZ1bmN0aW9uICgpIHtcclxuICAgICAgJHByZXZpb3VzLnRyaWdnZXIoe1xyXG4gICAgICAgIHR5cGU6ICdoaWRkZW4uYnMudGFiJyxcclxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkdGhpc1swXVxyXG4gICAgICB9KVxyXG4gICAgICAkdGhpcy50cmlnZ2VyKHtcclxuICAgICAgICB0eXBlOiAnc2hvd24uYnMudGFiJyxcclxuICAgICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBUYWIucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGNvbnRhaW5lciwgY2FsbGJhY2spIHtcclxuICAgIHZhciAkYWN0aXZlICAgID0gY29udGFpbmVyLmZpbmQoJz4gLmFjdGl2ZScpXHJcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGNhbGxiYWNrXHJcbiAgICAgICYmICQuc3VwcG9ydC50cmFuc2l0aW9uXHJcbiAgICAgICYmICgkYWN0aXZlLmxlbmd0aCAmJiAkYWN0aXZlLmhhc0NsYXNzKCdmYWRlJykgfHwgISFjb250YWluZXIuZmluZCgnPiAuZmFkZScpLmxlbmd0aClcclxuXHJcbiAgICBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAkYWN0aXZlXHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgIC5maW5kKCc+IC5kcm9wZG93bi1tZW51ID4gLmFjdGl2ZScpXHJcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgLmVuZCgpXHJcbiAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXHJcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIGZhbHNlKVxyXG5cclxuICAgICAgZWxlbWVudFxyXG4gICAgICAgIC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcclxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuXHJcbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XHJcbiAgICAgICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aCAvLyByZWZsb3cgZm9yIHRyYW5zaXRpb25cclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpbicpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDbGFzcygnZmFkZScpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChlbGVtZW50LnBhcmVudCgnLmRyb3Bkb3duLW1lbnUnKS5sZW5ndGgpIHtcclxuICAgICAgICBlbGVtZW50XHJcbiAgICAgICAgICAuY2xvc2VzdCgnbGkuZHJvcGRvd24nKVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgICAuZW5kKClcclxuICAgICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxyXG4gICAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcclxuICAgIH1cclxuXHJcbiAgICAkYWN0aXZlLmxlbmd0aCAmJiB0cmFuc2l0aW9uID9cclxuICAgICAgJGFjdGl2ZVxyXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIG5leHQpXHJcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgIG5leHQoKVxyXG5cclxuICAgICRhY3RpdmUucmVtb3ZlQ2xhc3MoJ2luJylcclxuICB9XHJcblxyXG5cclxuICAvLyBUQUIgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgID0gJHRoaXMuZGF0YSgnYnMudGFiJylcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudGFiJywgKGRhdGEgPSBuZXcgVGFiKHRoaXMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4udGFiXHJcblxyXG4gICQuZm4udGFiICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcclxuXHJcblxyXG4gIC8vIFRBQiBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLnRhYi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi50YWIgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gVEFCIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09XHJcblxyXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBQbHVnaW4uY2FsbCgkKHRoaXMpLCAnc2hvdycpXHJcbiAgfVxyXG5cclxuICAkKGRvY3VtZW50KVxyXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJywgY2xpY2tIYW5kbGVyKVxyXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwicGlsbFwiXScsIGNsaWNrSGFuZGxlcilcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGFmZml4LmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNhZmZpeFxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQUZGSVggQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIEFmZml4ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBZmZpeC5ERUZBVUxUUywgb3B0aW9ucylcclxuXHJcbiAgICB0aGlzLiR0YXJnZXQgPSAkKHRoaXMub3B0aW9ucy50YXJnZXQpXHJcbiAgICAgIC5vbignc2Nyb2xsLmJzLmFmZml4LmRhdGEtYXBpJywgJC5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb24sIHRoaXMpKVxyXG4gICAgICAub24oJ2NsaWNrLmJzLmFmZml4LmRhdGEtYXBpJywgICQucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uV2l0aEV2ZW50TG9vcCwgdGhpcykpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudCAgICAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLmFmZml4ZWQgICAgICA9IG51bGxcclxuICAgIHRoaXMudW5waW4gICAgICAgID0gbnVsbFxyXG4gICAgdGhpcy5waW5uZWRPZmZzZXQgPSBudWxsXHJcblxyXG4gICAgdGhpcy5jaGVja1Bvc2l0aW9uKClcclxuICB9XHJcblxyXG4gIEFmZml4LlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBBZmZpeC5SRVNFVCAgICA9ICdhZmZpeCBhZmZpeC10b3AgYWZmaXgtYm90dG9tJ1xyXG5cclxuICBBZmZpeC5ERUZBVUxUUyA9IHtcclxuICAgIG9mZnNldDogMCxcclxuICAgIHRhcmdldDogd2luZG93XHJcbiAgfVxyXG5cclxuICBBZmZpeC5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbiAoc2Nyb2xsSGVpZ2h0LCBoZWlnaHQsIG9mZnNldFRvcCwgb2Zmc2V0Qm90dG9tKSB7XHJcbiAgICB2YXIgc2Nyb2xsVG9wICAgID0gdGhpcy4kdGFyZ2V0LnNjcm9sbFRvcCgpXHJcbiAgICB2YXIgcG9zaXRpb24gICAgID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKVxyXG4gICAgdmFyIHRhcmdldEhlaWdodCA9IHRoaXMuJHRhcmdldC5oZWlnaHQoKVxyXG5cclxuICAgIGlmIChvZmZzZXRUb3AgIT0gbnVsbCAmJiB0aGlzLmFmZml4ZWQgPT0gJ3RvcCcpIHJldHVybiBzY3JvbGxUb3AgPCBvZmZzZXRUb3AgPyAndG9wJyA6IGZhbHNlXHJcblxyXG4gICAgaWYgKHRoaXMuYWZmaXhlZCA9PSAnYm90dG9tJykge1xyXG4gICAgICBpZiAob2Zmc2V0VG9wICE9IG51bGwpIHJldHVybiAoc2Nyb2xsVG9wICsgdGhpcy51bnBpbiA8PSBwb3NpdGlvbi50b3ApID8gZmFsc2UgOiAnYm90dG9tJ1xyXG4gICAgICByZXR1cm4gKHNjcm9sbFRvcCArIHRhcmdldEhlaWdodCA8PSBzY3JvbGxIZWlnaHQgLSBvZmZzZXRCb3R0b20pID8gZmFsc2UgOiAnYm90dG9tJ1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBpbml0aWFsaXppbmcgICA9IHRoaXMuYWZmaXhlZCA9PSBudWxsXHJcbiAgICB2YXIgY29sbGlkZXJUb3AgICAgPSBpbml0aWFsaXppbmcgPyBzY3JvbGxUb3AgOiBwb3NpdGlvbi50b3BcclxuICAgIHZhciBjb2xsaWRlckhlaWdodCA9IGluaXRpYWxpemluZyA/IHRhcmdldEhlaWdodCA6IGhlaWdodFxyXG5cclxuICAgIGlmIChvZmZzZXRUb3AgIT0gbnVsbCAmJiBzY3JvbGxUb3AgPD0gb2Zmc2V0VG9wKSByZXR1cm4gJ3RvcCdcclxuICAgIGlmIChvZmZzZXRCb3R0b20gIT0gbnVsbCAmJiAoY29sbGlkZXJUb3AgKyBjb2xsaWRlckhlaWdodCA+PSBzY3JvbGxIZWlnaHQgLSBvZmZzZXRCb3R0b20pKSByZXR1cm4gJ2JvdHRvbSdcclxuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIEFmZml4LnByb3RvdHlwZS5nZXRQaW5uZWRPZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5waW5uZWRPZmZzZXQpIHJldHVybiB0aGlzLnBpbm5lZE9mZnNldFxyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhBZmZpeC5SRVNFVCkuYWRkQ2xhc3MoJ2FmZml4JylcclxuICAgIHZhciBzY3JvbGxUb3AgPSB0aGlzLiR0YXJnZXQuc2Nyb2xsVG9wKClcclxuICAgIHZhciBwb3NpdGlvbiAgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpXHJcbiAgICByZXR1cm4gKHRoaXMucGlubmVkT2Zmc2V0ID0gcG9zaXRpb24udG9wIC0gc2Nyb2xsVG9wKVxyXG4gIH1cclxuXHJcbiAgQWZmaXgucHJvdG90eXBlLmNoZWNrUG9zaXRpb25XaXRoRXZlbnRMb29wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgc2V0VGltZW91dCgkLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbiwgdGhpcyksIDEpXHJcbiAgfVxyXG5cclxuICBBZmZpeC5wcm90b3R5cGUuY2hlY2tQb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy4kZWxlbWVudC5pcygnOnZpc2libGUnKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIGhlaWdodCAgICAgICA9IHRoaXMuJGVsZW1lbnQuaGVpZ2h0KClcclxuICAgIHZhciBvZmZzZXQgICAgICAgPSB0aGlzLm9wdGlvbnMub2Zmc2V0XHJcbiAgICB2YXIgb2Zmc2V0VG9wICAgID0gb2Zmc2V0LnRvcFxyXG4gICAgdmFyIG9mZnNldEJvdHRvbSA9IG9mZnNldC5ib3R0b21cclxuICAgIHZhciBzY3JvbGxIZWlnaHQgPSBNYXRoLm1heCgkKGRvY3VtZW50KS5oZWlnaHQoKSwgJChkb2N1bWVudC5ib2R5KS5oZWlnaHQoKSlcclxuXHJcbiAgICBpZiAodHlwZW9mIG9mZnNldCAhPSAnb2JqZWN0JykgICAgICAgICBvZmZzZXRCb3R0b20gPSBvZmZzZXRUb3AgPSBvZmZzZXRcclxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0VG9wID09ICdmdW5jdGlvbicpICAgIG9mZnNldFRvcCAgICA9IG9mZnNldC50b3AodGhpcy4kZWxlbWVudClcclxuICAgIGlmICh0eXBlb2Ygb2Zmc2V0Qm90dG9tID09ICdmdW5jdGlvbicpIG9mZnNldEJvdHRvbSA9IG9mZnNldC5ib3R0b20odGhpcy4kZWxlbWVudClcclxuXHJcbiAgICB2YXIgYWZmaXggPSB0aGlzLmdldFN0YXRlKHNjcm9sbEhlaWdodCwgaGVpZ2h0LCBvZmZzZXRUb3AsIG9mZnNldEJvdHRvbSlcclxuXHJcbiAgICBpZiAodGhpcy5hZmZpeGVkICE9IGFmZml4KSB7XHJcbiAgICAgIGlmICh0aGlzLnVucGluICE9IG51bGwpIHRoaXMuJGVsZW1lbnQuY3NzKCd0b3AnLCAnJylcclxuXHJcbiAgICAgIHZhciBhZmZpeFR5cGUgPSAnYWZmaXgnICsgKGFmZml4ID8gJy0nICsgYWZmaXggOiAnJylcclxuICAgICAgdmFyIGUgICAgICAgICA9ICQuRXZlbnQoYWZmaXhUeXBlICsgJy5icy5hZmZpeCcpXHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcclxuXHJcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAgIHRoaXMuYWZmaXhlZCA9IGFmZml4XHJcbiAgICAgIHRoaXMudW5waW4gPSBhZmZpeCA9PSAnYm90dG9tJyA/IHRoaXMuZ2V0UGlubmVkT2Zmc2V0KCkgOiBudWxsXHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKEFmZml4LlJFU0VUKVxyXG4gICAgICAgIC5hZGRDbGFzcyhhZmZpeFR5cGUpXHJcbiAgICAgICAgLnRyaWdnZXIoYWZmaXhUeXBlLnJlcGxhY2UoJ2FmZml4JywgJ2FmZml4ZWQnKSArICcuYnMuYWZmaXgnKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhZmZpeCA9PSAnYm90dG9tJykge1xyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZnNldCh7XHJcbiAgICAgICAgdG9wOiBzY3JvbGxIZWlnaHQgLSBoZWlnaHQgLSBvZmZzZXRCb3R0b21cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAvLyBBRkZJWCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5hZmZpeCcpXHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuYWZmaXgnLCAoZGF0YSA9IG5ldyBBZmZpeCh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmFmZml4XHJcblxyXG4gICQuZm4uYWZmaXggICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmFmZml4LkNvbnN0cnVjdG9yID0gQWZmaXhcclxuXHJcblxyXG4gIC8vIEFGRklYIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5hZmZpeC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5hZmZpeCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBBRkZJWCBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICQoJ1tkYXRhLXNweT1cImFmZml4XCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkc3B5ID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSA9ICRzcHkuZGF0YSgpXHJcblxyXG4gICAgICBkYXRhLm9mZnNldCA9IGRhdGEub2Zmc2V0IHx8IHt9XHJcblxyXG4gICAgICBpZiAoZGF0YS5vZmZzZXRCb3R0b20gIT0gbnVsbCkgZGF0YS5vZmZzZXQuYm90dG9tID0gZGF0YS5vZmZzZXRCb3R0b21cclxuICAgICAgaWYgKGRhdGEub2Zmc2V0VG9wICAgICE9IG51bGwpIGRhdGEub2Zmc2V0LnRvcCAgICA9IGRhdGEub2Zmc2V0VG9wXHJcblxyXG4gICAgICBQbHVnaW4uY2FsbCgkc3B5LCBkYXRhKVxyXG4gICAgfSlcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG4iLCIvKiFcclxuICogSmFzbnkgQm9vdHN0cmFwIHYzLjEuMyAoaHR0cDovL2phc255LmdpdGh1Yi5pby9ib290c3RyYXApXHJcbiAqIENvcHlyaWdodCAyMDEyLTIwMTQgQXJub2xkIERhbmllbHNcclxuICogTGljZW5zZWQgdW5kZXIgQXBhY2hlLTIuMCAoaHR0cHM6Ly9naXRodWIuY29tL2phc255L2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgalF1ZXJ5ID09PSAndW5kZWZpbmVkJykgeyB0aHJvdyBuZXcgRXJyb3IoJ0phc255IEJvb3RzdHJhcFxcJ3MgSmF2YVNjcmlwdCByZXF1aXJlcyBqUXVlcnknKSB9XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0cmFuc2l0aW9uLmpzIHYzLjEuM1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0cmFuc2l0aW9uc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNCBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQ1NTIFRSQU5TSVRJT04gU1VQUE9SVCAoU2hvdXRvdXQ6IGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS8pXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxyXG5cclxuICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XHJcbiAgICAgIFdlYmtpdFRyYW5zaXRpb24gOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAgIE1velRyYW5zaXRpb24gICAgOiAndHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgIE9UcmFuc2l0aW9uICAgICAgOiAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxyXG4gICAgICB0cmFuc2l0aW9uICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcclxuICAgICAgaWYgKGVsLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4geyBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXSB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2UgLy8gZXhwbGljaXQgZm9yIGllOCAoICAuXy4pXHJcbiAgfVxyXG5cclxuICBpZiAoJC5zdXBwb3J0LnRyYW5zaXRpb24gIT09IHVuZGVmaW5lZCkgcmV0dXJuICAvLyBQcmV2ZW50IGNvbmZsaWN0IHdpdGggVHdpdHRlciBCb290c3RyYXBcclxuXHJcbiAgLy8gaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vY3NzLXRyYW5zaXRpb25zXHJcbiAgJC5mbi5lbXVsYXRlVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xyXG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlLCAkZWwgPSB0aGlzXHJcbiAgICAkKHRoaXMpLm9uZSgkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsIGZ1bmN0aW9uICgpIHsgY2FsbGVkID0gdHJ1ZSB9KVxyXG4gICAgdmFyIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkgeyBpZiAoIWNhbGxlZCkgJCgkZWwpLnRyaWdnZXIoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kKSB9XHJcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCBkdXJhdGlvbilcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAkKGZ1bmN0aW9uICgpIHtcclxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uID0gdHJhbnNpdGlvbkVuZCgpXHJcbiAgfSlcclxuXHJcbn0od2luZG93LmpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBvZmZjYW52YXMuanMgdjMuMS4zXHJcbiAqIGh0dHA6Ly9qYXNueS5naXRodWIuaW8vYm9vdHN0cmFwL2phdmFzY3JpcHQvI29mZmNhbnZhc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTMtMjAxNCBBcm5vbGQgRGFuaWVsc1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpXHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAvLyBPRkZDQU5WQVMgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIE9mZkNhbnZhcyA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zICA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLnN0YXRlICAgID0gbnVsbFxyXG4gICAgdGhpcy5wbGFjZW1lbnQgPSBudWxsXHJcbiAgICBcclxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVjYWxjKSB7XHJcbiAgICAgIHRoaXMuY2FsY0Nsb25lKClcclxuICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCAkLnByb3h5KHRoaXMucmVjYWxjLCB0aGlzKSlcclxuICAgIH1cclxuICAgIFxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvaGlkZSlcclxuICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJC5wcm94eSh0aGlzLmF1dG9oaWRlLCB0aGlzKSlcclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnRvZ2dsZSkgdGhpcy50b2dnbGUoKVxyXG4gICAgXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLmRpc2FibGVzY3JvbGxpbmcpIHtcclxuICAgICAgICB0aGlzLm9wdGlvbnMuZGlzYWJsZVNjcm9sbGluZyA9IHRoaXMub3B0aW9ucy5kaXNhYmxlc2Nyb2xsaW5nXHJcbiAgICAgICAgZGVsZXRlIHRoaXMub3B0aW9ucy5kaXNhYmxlc2Nyb2xsaW5nXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMuREVGQVVMVFMgPSB7XHJcbiAgICB0b2dnbGU6IHRydWUsXHJcbiAgICBwbGFjZW1lbnQ6ICdhdXRvJyxcclxuICAgIGF1dG9oaWRlOiB0cnVlLFxyXG4gICAgcmVjYWxjOiB0cnVlLFxyXG4gICAgZGlzYWJsZVNjcm9sbGluZzogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5vZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBzd2l0Y2ggKHRoaXMucGxhY2VtZW50KSB7XHJcbiAgICAgIGNhc2UgJ2xlZnQnOlxyXG4gICAgICBjYXNlICdyaWdodCc6ICByZXR1cm4gdGhpcy4kZWxlbWVudC5vdXRlcldpZHRoKClcclxuICAgICAgY2FzZSAndG9wJzpcclxuICAgICAgY2FzZSAnYm90dG9tJzogcmV0dXJuIHRoaXMuJGVsZW1lbnQub3V0ZXJIZWlnaHQoKVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBPZmZDYW52YXMucHJvdG90eXBlLmNhbGNQbGFjZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnBsYWNlbWVudCAhPT0gJ2F1dG8nKSB7XHJcbiAgICAgICAgdGhpcy5wbGFjZW1lbnQgPSB0aGlzLm9wdGlvbnMucGxhY2VtZW50XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICghdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmNzcygndmlzaWJsaXR5JywgJ2hpZGRlbiAhaW1wb3J0YW50JykuYWRkQ2xhc3MoJ2luJylcclxuICAgIH0gXHJcbiAgICBcclxuICAgIHZhciBob3Jpem9udGFsID0gJCh3aW5kb3cpLndpZHRoKCkgLyB0aGlzLiRlbGVtZW50LndpZHRoKClcclxuICAgIHZhciB2ZXJ0aWNhbCA9ICQod2luZG93KS5oZWlnaHQoKSAvIHRoaXMuJGVsZW1lbnQuaGVpZ2h0KClcclxuICAgICAgICBcclxuICAgIHZhciBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFxyXG4gICAgZnVuY3Rpb24gYWIoYSwgYikge1xyXG4gICAgICBpZiAoZWxlbWVudC5jc3MoYikgPT09ICdhdXRvJykgcmV0dXJuIGFcclxuICAgICAgaWYgKGVsZW1lbnQuY3NzKGEpID09PSAnYXV0bycpIHJldHVybiBiXHJcbiAgICAgIFxyXG4gICAgICB2YXIgc2l6ZV9hID0gcGFyc2VJbnQoZWxlbWVudC5jc3MoYSksIDEwKVxyXG4gICAgICB2YXIgc2l6ZV9iID0gcGFyc2VJbnQoZWxlbWVudC5jc3MoYiksIDEwKVxyXG4gIFxyXG4gICAgICByZXR1cm4gc2l6ZV9hID4gc2l6ZV9iID8gYiA6IGFcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5wbGFjZW1lbnQgPSBob3Jpem9udGFsID49IHZlcnRpY2FsID8gYWIoJ2xlZnQnLCAncmlnaHQnKSA6IGFiKCd0b3AnLCAnYm90dG9tJylcclxuICAgICAgXHJcbiAgICBpZiAodGhpcy4kZWxlbWVudC5jc3MoJ3Zpc2liaWxpdHknKSA9PT0gJ2hpZGRlbiAhaW1wb3J0YW50Jykge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpbicpLmNzcygndmlzaWJsaXR5JywgJycpXHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUub3Bwb3NpdGUgPSBmdW5jdGlvbiAocGxhY2VtZW50KSB7XHJcbiAgICBzd2l0Y2ggKHBsYWNlbWVudCkge1xyXG4gICAgICBjYXNlICd0b3AnOiAgICByZXR1cm4gJ2JvdHRvbSdcclxuICAgICAgY2FzZSAnbGVmdCc6ICAgcmV0dXJuICdyaWdodCdcclxuICAgICAgY2FzZSAnYm90dG9tJzogcmV0dXJuICd0b3AnXHJcbiAgICAgIGNhc2UgJ3JpZ2h0JzogIHJldHVybiAnbGVmdCdcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5nZXRDYW52YXNFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gUmV0dXJuIGEgc2V0IGNvbnRhaW5pbmcgdGhlIGNhbnZhcyBwbHVzIGFsbCBmaXhlZCBlbGVtZW50c1xyXG4gICAgdmFyIGNhbnZhcyA9IHRoaXMub3B0aW9ucy5jYW52YXMgPyAkKHRoaXMub3B0aW9ucy5jYW52YXMpIDogdGhpcy4kZWxlbWVudFxyXG4gICAgXHJcbiAgICB2YXIgZml4ZWRfZWxlbWVudHMgPSBjYW52YXMuZmluZCgnKicpLmZpbHRlcihmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuICQodGhpcykuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnXHJcbiAgICB9KS5ub3QodGhpcy5vcHRpb25zLmV4Y2x1ZGUpXHJcbiAgICBcclxuICAgIHJldHVybiBjYW52YXMuYWRkKGZpeGVkX2VsZW1lbnRzKVxyXG4gIH1cclxuICBcclxuICBPZmZDYW52YXMucHJvdG90eXBlLnNsaWRlID0gZnVuY3Rpb24gKGVsZW1lbnRzLCBvZmZzZXQsIGNhbGxiYWNrKSB7XHJcbiAgICAvLyBVc2UgalF1ZXJ5IGFuaW1hdGlvbiBpZiBDU1MgdHJhbnNpdGlvbnMgYXJlbid0IHN1cHBvcnRlZFxyXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikge1xyXG4gICAgICB2YXIgYW5pbSA9IHt9XHJcbiAgICAgIGFuaW1bdGhpcy5wbGFjZW1lbnRdID0gXCIrPVwiICsgb2Zmc2V0XHJcbiAgICAgIHJldHVybiBlbGVtZW50cy5hbmltYXRlKGFuaW0sIDM1MCwgY2FsbGJhY2spXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBsYWNlbWVudCA9IHRoaXMucGxhY2VtZW50XHJcbiAgICB2YXIgb3Bwb3NpdGUgPSB0aGlzLm9wcG9zaXRlKHBsYWNlbWVudClcclxuICAgIFxyXG4gICAgZWxlbWVudHMuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCQodGhpcykuY3NzKHBsYWNlbWVudCkgIT09ICdhdXRvJylcclxuICAgICAgICAkKHRoaXMpLmNzcyhwbGFjZW1lbnQsIChwYXJzZUludCgkKHRoaXMpLmNzcyhwbGFjZW1lbnQpLCAxMCkgfHwgMCkgKyBvZmZzZXQpXHJcbiAgICAgIFxyXG4gICAgICBpZiAoJCh0aGlzKS5jc3Mob3Bwb3NpdGUpICE9PSAnYXV0bycpXHJcbiAgICAgICAgJCh0aGlzKS5jc3Mob3Bwb3NpdGUsIChwYXJzZUludCgkKHRoaXMpLmNzcyhvcHBvc2l0ZSksIDEwKSB8fCAwKSAtIG9mZnNldClcclxuICAgIH0pXHJcbiAgICBcclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLm9uZSgkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQsIGNhbGxiYWNrKVxyXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoMzUwKVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5kaXNhYmxlU2Nyb2xsaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgYm9keVdpZHRoID0gJCgnYm9keScpLndpZHRoKClcclxuICAgIHZhciBwcm9wID0gJ3BhZGRpbmctJyArIHRoaXMub3Bwb3NpdGUodGhpcy5wbGFjZW1lbnQpXHJcblxyXG4gICAgaWYgKCQoJ2JvZHknKS5kYXRhKCdvZmZjYW52YXMtc3R5bGUnKSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICQoJ2JvZHknKS5kYXRhKCdvZmZjYW52YXMtc3R5bGUnLCAkKCdib2R5JykuYXR0cignc3R5bGUnKSB8fCAnJylcclxuICAgIH1cclxuICAgICAgXHJcbiAgICAkKCdib2R5JykuY3NzKCdvdmVyZmxvdycsICdoaWRkZW4nKVxyXG5cclxuICAgIGlmICgkKCdib2R5Jykud2lkdGgoKSA+IGJvZHlXaWR0aCkge1xyXG4gICAgICB2YXIgcGFkZGluZyA9IHBhcnNlSW50KCQoJ2JvZHknKS5jc3MocHJvcCksIDEwKSArICQoJ2JvZHknKS53aWR0aCgpIC0gYm9keVdpZHRoXHJcbiAgICAgIFxyXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJ2JvZHknKS5jc3MocHJvcCwgcGFkZGluZylcclxuICAgICAgfSwgMSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnN0YXRlKSByZXR1cm5cclxuICAgIFxyXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdzaG93LmJzLm9mZmNhbnZhcycpXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcclxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB0aGlzLnN0YXRlID0gJ3NsaWRlLWluJ1xyXG4gICAgdGhpcy5jYWxjUGxhY2VtZW50KCk7XHJcbiAgICBcclxuICAgIHZhciBlbGVtZW50cyA9IHRoaXMuZ2V0Q2FudmFzRWxlbWVudHMoKVxyXG4gICAgdmFyIHBsYWNlbWVudCA9IHRoaXMucGxhY2VtZW50XHJcbiAgICB2YXIgb3Bwb3NpdGUgPSB0aGlzLm9wcG9zaXRlKHBsYWNlbWVudClcclxuICAgIHZhciBvZmZzZXQgPSB0aGlzLm9mZnNldCgpXHJcblxyXG4gICAgaWYgKGVsZW1lbnRzLmluZGV4KHRoaXMuJGVsZW1lbnQpICE9PSAtMSkge1xyXG4gICAgICAkKHRoaXMuJGVsZW1lbnQpLmRhdGEoJ29mZmNhbnZhcy1zdHlsZScsICQodGhpcy4kZWxlbWVudCkuYXR0cignc3R5bGUnKSB8fCAnJylcclxuICAgICAgdGhpcy4kZWxlbWVudC5jc3MocGxhY2VtZW50LCAtMSAqIG9mZnNldClcclxuICAgICAgdGhpcy4kZWxlbWVudC5jc3MocGxhY2VtZW50KTsgLy8gV29ya2Fyb3VuZDogTmVlZCB0byBnZXQgdGhlIENTUyBwcm9wZXJ0eSBmb3IgaXQgdG8gYmUgYXBwbGllZCBiZWZvcmUgdGhlIG5leHQgbGluZSBvZiBjb2RlXHJcbiAgICB9XHJcblxyXG4gICAgZWxlbWVudHMuYWRkQ2xhc3MoJ2NhbnZhcy1zbGlkaW5nJykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCQodGhpcykuZGF0YSgnb2ZmY2FudmFzLXN0eWxlJykgPT09IHVuZGVmaW5lZCkgJCh0aGlzKS5kYXRhKCdvZmZjYW52YXMtc3R5bGUnLCAkKHRoaXMpLmF0dHIoJ3N0eWxlJykgfHwgJycpXHJcbiAgICAgIGlmICgkKHRoaXMpLmNzcygncG9zaXRpb24nKSA9PT0gJ3N0YXRpYycpICQodGhpcykuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpXHJcbiAgICAgIGlmICgoJCh0aGlzKS5jc3MocGxhY2VtZW50KSA9PT0gJ2F1dG8nIHx8ICQodGhpcykuY3NzKHBsYWNlbWVudCkgPT09ICcwcHgnKSAmJlxyXG4gICAgICAgICAgKCQodGhpcykuY3NzKG9wcG9zaXRlKSA9PT0gJ2F1dG8nIHx8ICQodGhpcykuY3NzKG9wcG9zaXRlKSA9PT0gJzBweCcpKSB7XHJcbiAgICAgICAgJCh0aGlzKS5jc3MocGxhY2VtZW50LCAwKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLmRpc2FibGVTY3JvbGxpbmcpIHRoaXMuZGlzYWJsZVNjcm9sbGluZygpXHJcbiAgICBcclxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHRoaXMuc3RhdGUgIT0gJ3NsaWRlLWluJykgcmV0dXJuXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0YXRlID0gJ3NsaWQnXHJcblxyXG4gICAgICBlbGVtZW50cy5yZW1vdmVDbGFzcygnY2FudmFzLXNsaWRpbmcnKS5hZGRDbGFzcygnY2FudmFzLXNsaWQnKVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3Nob3duLmJzLm9mZmNhbnZhcycpXHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dCgkLnByb3h5KGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpbicpXHJcbiAgICAgIHRoaXMuc2xpZGUoZWxlbWVudHMsIG9mZnNldCwgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXHJcbiAgICB9LCB0aGlzKSwgMSlcclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChmYXN0KSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZSAhPT0gJ3NsaWQnKSByZXR1cm5cclxuXHJcbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMub2ZmY2FudmFzJylcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcihzdGFydEV2ZW50KVxyXG4gICAgaWYgKHN0YXJ0RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHRoaXMuc3RhdGUgPSAnc2xpZGUtb3V0J1xyXG5cclxuICAgIHZhciBlbGVtZW50cyA9ICQoJy5jYW52YXMtc2xpZCcpXHJcbiAgICB2YXIgcGxhY2VtZW50ID0gdGhpcy5wbGFjZW1lbnRcclxuICAgIHZhciBvZmZzZXQgPSAtMSAqIHRoaXMub2Zmc2V0KClcclxuXHJcbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXRlICE9ICdzbGlkZS1vdXQnKSByZXR1cm5cclxuICAgICAgXHJcbiAgICAgIHRoaXMuc3RhdGUgPSBudWxsXHJcbiAgICAgIHRoaXMucGxhY2VtZW50ID0gbnVsbFxyXG4gICAgICBcclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaW4nKVxyXG4gICAgICBcclxuICAgICAgZWxlbWVudHMucmVtb3ZlQ2xhc3MoJ2NhbnZhcy1zbGlkaW5nJylcclxuICAgICAgZWxlbWVudHMuYWRkKHRoaXMuJGVsZW1lbnQpLmFkZCgnYm9keScpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCh0aGlzKS5hdHRyKCdzdHlsZScsICQodGhpcykuZGF0YSgnb2ZmY2FudmFzLXN0eWxlJykpLnJlbW92ZURhdGEoJ29mZmNhbnZhcy1zdHlsZScpXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2hpZGRlbi5icy5vZmZjYW52YXMnKVxyXG4gICAgfVxyXG5cclxuICAgIGVsZW1lbnRzLnJlbW92ZUNsYXNzKCdjYW52YXMtc2xpZCcpLmFkZENsYXNzKCdjYW52YXMtc2xpZGluZycpXHJcbiAgICBcclxuICAgIHNldFRpbWVvdXQoJC5wcm94eShmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5zbGlkZShlbGVtZW50cywgb2Zmc2V0LCAkLnByb3h5KGNvbXBsZXRlLCB0aGlzKSlcclxuICAgIH0sIHRoaXMpLCAxKVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZSA9PT0gJ3NsaWRlLWluJyB8fCB0aGlzLnN0YXRlID09PSAnc2xpZGUtb3V0JykgcmV0dXJuXHJcbiAgICB0aGlzW3RoaXMuc3RhdGUgPT09ICdzbGlkJyA/ICdoaWRlJyA6ICdzaG93J10oKVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5jYWxjQ2xvbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuJGNhbGNDbG9uZSA9IHRoaXMuJGVsZW1lbnQuY2xvbmUoKVxyXG4gICAgICAuaHRtbCgnJylcclxuICAgICAgLmFkZENsYXNzKCdvZmZjYW52YXMtY2xvbmUnKS5yZW1vdmVDbGFzcygnaW4nKVxyXG4gICAgICAuYXBwZW5kVG8oJCgnYm9keScpKVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5yZWNhbGMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy4kY2FsY0Nsb25lLmNzcygnZGlzcGxheScpID09PSAnbm9uZScgfHwgKHRoaXMuc3RhdGUgIT09ICdzbGlkJyAmJiB0aGlzLnN0YXRlICE9PSAnc2xpZGUtaW4nKSkgcmV0dXJuXHJcbiAgICBcclxuICAgIHRoaXMuc3RhdGUgPSBudWxsXHJcbiAgICB0aGlzLnBsYWNlbWVudCA9IG51bGxcclxuICAgIHZhciBlbGVtZW50cyA9IHRoaXMuZ2V0Q2FudmFzRWxlbWVudHMoKVxyXG4gICAgXHJcbiAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpbicpXHJcbiAgICBcclxuICAgIGVsZW1lbnRzLnJlbW92ZUNsYXNzKCdjYW52YXMtc2xpZCcpXHJcbiAgICBlbGVtZW50cy5hZGQodGhpcy4kZWxlbWVudCkuYWRkKCdib2R5JykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgJCh0aGlzKS5hdHRyKCdzdHlsZScsICQodGhpcykuZGF0YSgnb2ZmY2FudmFzLXN0eWxlJykpLnJlbW92ZURhdGEoJ29mZmNhbnZhcy1zdHlsZScpXHJcbiAgICB9KVxyXG4gIH1cclxuICBcclxuICBPZmZDYW52YXMucHJvdG90eXBlLmF1dG9oaWRlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICgkKGUudGFyZ2V0KS5jbG9zZXN0KHRoaXMuJGVsZW1lbnQpLmxlbmd0aCA9PT0gMCkgdGhpcy5oaWRlKClcclxuICB9XHJcblxyXG4gIC8vIE9GRkNBTlZBUyBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLm9mZmNhbnZhc1xyXG5cclxuICAkLmZuLm9mZmNhbnZhcyA9IGZ1bmN0aW9uIChvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5vZmZjYW52YXMnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuREVGQVVMVFMsICR0aGlzLmRhdGEoKSwgdHlwZW9mIG9wdGlvbiA9PT0gJ29iamVjdCcgJiYgb3B0aW9uKVxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5vZmZjYW52YXMnLCAoZGF0YSA9IG5ldyBPZmZDYW52YXModGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJC5mbi5vZmZjYW52YXMuQ29uc3RydWN0b3IgPSBPZmZDYW52YXNcclxuXHJcblxyXG4gIC8vIE9GRkNBTlZBUyBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4ub2ZmY2FudmFzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLm9mZmNhbnZhcyA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBPRkZDQU5WQVMgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMub2ZmY2FudmFzLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1vZmZjYW52YXNdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKSwgaHJlZlxyXG4gICAgdmFyIHRhcmdldCAgPSAkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpXHJcbiAgICAgICAgfHwgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgfHwgKGhyZWYgPSAkdGhpcy5hdHRyKCdocmVmJykpICYmIGhyZWYucmVwbGFjZSgvLiooPz0jW15cXHNdKyQpLywgJycpIC8vc3RyaXAgZm9yIGllN1xyXG4gICAgdmFyICRjYW52YXMgPSAkKHRhcmdldClcclxuICAgIHZhciBkYXRhICAgID0gJGNhbnZhcy5kYXRhKCdicy5vZmZjYW52YXMnKVxyXG4gICAgdmFyIG9wdGlvbiAgPSBkYXRhID8gJ3RvZ2dsZScgOiAkdGhpcy5kYXRhKClcclxuXHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcblxyXG4gICAgaWYgKGRhdGEpIGRhdGEudG9nZ2xlKClcclxuICAgICAgZWxzZSAkY2FudmFzLm9mZmNhbnZhcyhvcHRpb24pXHJcbiAgfSlcclxuXHJcbn0od2luZG93LmpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiByb3dsaW5rLmpzIHYzLjEuM1xyXG4gKiBodHRwOi8vamFzbnkuZ2l0aHViLmlvL2Jvb3RzdHJhcC9qYXZhc2NyaXB0LyNyb3dsaW5rXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDE0IEFybm9sZCBEYW5pZWxzXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB2YXIgUm93bGluayA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJvd2xpbmsuREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICBcclxuICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLmJzLnJvd2xpbmsnLCAndGQ6bm90KC5yb3dsaW5rLXNraXApJywgJC5wcm94eSh0aGlzLmNsaWNrLCB0aGlzKSlcclxuICB9XHJcblxyXG4gIFJvd2xpbmsuREVGQVVMVFMgPSB7XHJcbiAgICB0YXJnZXQ6IFwiYVwiXHJcbiAgfVxyXG5cclxuICBSb3dsaW5rLnByb3RvdHlwZS5jbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciB0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKS5maW5kKHRoaXMub3B0aW9ucy50YXJnZXQpWzBdXHJcbiAgICBpZiAoJChlLnRhcmdldClbMF0gPT09IHRhcmdldCkgcmV0dXJuXHJcbiAgICBcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIFxyXG4gICAgaWYgKHRhcmdldC5jbGljaykge1xyXG4gICAgICB0YXJnZXQuY2xpY2soKVxyXG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCkge1xyXG4gICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJNb3VzZUV2ZW50c1wiKTsgXHJcbiAgICAgIGV2dC5pbml0TW91c2VFdmVudChcImNsaWNrXCIsIHRydWUsIHRydWUsIHdpbmRvdywgMCwgMCwgMCwgMCwgMCwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAsIG51bGwpOyBcclxuICAgICAgdGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXZ0KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFxyXG4gIC8vIFJPV0xJTksgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4ucm93bGlua1xyXG5cclxuICAkLmZuLnJvd2xpbmsgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgPSAkdGhpcy5kYXRhKCdicy5yb3dsaW5rJylcclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5yb3dsaW5rJywgKGRhdGEgPSBuZXcgUm93bGluayh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJC5mbi5yb3dsaW5rLkNvbnN0cnVjdG9yID0gUm93bGlua1xyXG5cclxuXHJcbiAgLy8gUk9XTElOSyBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4ucm93bGluay5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5yb3dsaW5rID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIFJPV0xJTksgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLnJvd2xpbmsuZGF0YS1hcGknLCAnW2RhdGEtbGluaz1cInJvd1wiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCgnLnJvd2xpbmstc2tpcCcpLmxlbmd0aCAhPT0gMCkgcmV0dXJuXHJcbiAgICBcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgIGlmICgkdGhpcy5kYXRhKCdicy5yb3dsaW5rJykpIHJldHVyblxyXG4gICAgJHRoaXMucm93bGluaygkdGhpcy5kYXRhKCkpXHJcbiAgICAkKGUudGFyZ2V0KS50cmlnZ2VyKCdjbGljay5icy5yb3dsaW5rJylcclxuICB9KVxyXG4gIFxyXG59KHdpbmRvdy5qUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBpbnB1dG1hc2suanMgdjMuMS4wXHJcbiAqIGh0dHA6Ly9qYXNueS5naXRodWIuaW8vYm9vdHN0cmFwL2phdmFzY3JpcHQvI2lucHV0bWFza1xyXG4gKiBcclxuICogQmFzZWQgb24gTWFza2VkIElucHV0IHBsdWdpbiBieSBKb3NoIEJ1c2ggKGRpZ2l0YWxidXNoLmNvbSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTItMjAxNCBBcm5vbGQgRGFuaWVsc1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpXHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcbitmdW5jdGlvbiAoJCkgeyBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgdmFyIGlzSXBob25lID0gKHdpbmRvdy5vcmllbnRhdGlvbiAhPT0gdW5kZWZpbmVkKVxyXG4gIHZhciBpc0FuZHJvaWQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImFuZHJvaWRcIikgPiAtMVxyXG4gIHZhciBpc0lFID0gd2luZG93Lm5hdmlnYXRvci5hcHBOYW1lID09ICdNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXInXHJcblxyXG4gIC8vIElOUFVUTUFTSyBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgSW5wdXRtYXNrID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIGlmIChpc0FuZHJvaWQpIHJldHVybiAvLyBObyBzdXBwb3J0IGJlY2F1c2UgY2FyZXQgcG9zaXRpb25pbmcgZG9lc24ndCB3b3JrIG9uIEFuZHJvaWRcclxuICAgIFxyXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBJbnB1dG1hc2suREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLm1hc2sgPSBTdHJpbmcodGhpcy5vcHRpb25zLm1hc2spXHJcbiAgICBcclxuICAgIHRoaXMuaW5pdCgpXHJcbiAgICB0aGlzLmxpc3RlbigpXHJcbiAgICAgICAgXHJcbiAgICB0aGlzLmNoZWNrVmFsKCkgLy9QZXJmb3JtIGluaXRpYWwgY2hlY2sgZm9yIGV4aXN0aW5nIHZhbHVlc1xyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLkRFRkFVTFRTID0ge1xyXG4gICAgbWFzazogXCJcIixcclxuICAgIHBsYWNlaG9sZGVyOiBcIl9cIixcclxuICAgIGRlZmluaXRpb25zOiB7XHJcbiAgICAgICc5JzogXCJbMC05XVwiLFxyXG4gICAgICAnYSc6IFwiW0EtWmEtel1cIixcclxuICAgICAgJ3cnOiBcIltBLVphLXowLTldXCIsXHJcbiAgICAgICcqJzogXCIuXCJcclxuICAgIH1cclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRlZnMgPSB0aGlzLm9wdGlvbnMuZGVmaW5pdGlvbnNcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoXHJcblxyXG4gICAgdGhpcy50ZXN0cyA9IFtdIFxyXG4gICAgdGhpcy5wYXJ0aWFsUG9zaXRpb24gPSB0aGlzLm1hc2subGVuZ3RoXHJcbiAgICB0aGlzLmZpcnN0Tm9uTWFza1BvcyA9IG51bGxcclxuXHJcbiAgICAkLmVhY2godGhpcy5tYXNrLnNwbGl0KFwiXCIpLCAkLnByb3h5KGZ1bmN0aW9uKGksIGMpIHtcclxuICAgICAgaWYgKGMgPT0gJz8nKSB7XHJcbiAgICAgICAgbGVuLS1cclxuICAgICAgICB0aGlzLnBhcnRpYWxQb3NpdGlvbiA9IGlcclxuICAgICAgfSBlbHNlIGlmIChkZWZzW2NdKSB7XHJcbiAgICAgICAgdGhpcy50ZXN0cy5wdXNoKG5ldyBSZWdFeHAoZGVmc1tjXSkpXHJcbiAgICAgICAgaWYgKHRoaXMuZmlyc3ROb25NYXNrUG9zID09PSBudWxsKVxyXG4gICAgICAgICAgdGhpcy5maXJzdE5vbk1hc2tQb3MgPSAgdGhpcy50ZXN0cy5sZW5ndGggLSAxXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy50ZXN0cy5wdXNoKG51bGwpXHJcbiAgICAgIH1cclxuICAgIH0sIHRoaXMpKVxyXG5cclxuICAgIHRoaXMuYnVmZmVyID0gJC5tYXAodGhpcy5tYXNrLnNwbGl0KFwiXCIpLCAkLnByb3h5KGZ1bmN0aW9uKGMsIGkpIHtcclxuICAgICAgaWYgKGMgIT0gJz8nKSByZXR1cm4gZGVmc1tjXSA/IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlciA6IGNcclxuICAgIH0sIHRoaXMpKVxyXG5cclxuICAgIHRoaXMuZm9jdXNUZXh0ID0gdGhpcy4kZWxlbWVudC52YWwoKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQuZGF0YShcInJhd01hc2tGblwiLCAkLnByb3h5KGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4gJC5tYXAodGhpcy5idWZmZXIsIGZ1bmN0aW9uKGMsIGkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50ZXN0c1tpXSAmJiBjICE9IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlciA/IGMgOiBudWxsXHJcbiAgICAgIH0pLmpvaW4oJycpXHJcbiAgICB9LCB0aGlzKSlcclxuICB9XHJcbiAgICBcclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmxpc3RlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuYXR0cihcInJlYWRvbmx5XCIpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgcGFzdGVFdmVudE5hbWUgPSAoaXNJRSA/ICdwYXN0ZScgOiAnaW5wdXQnKSArIFwiLm1hc2tcIlxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLm9uKFwidW5tYXNrLmJzLmlucHV0bWFza1wiLCAkLnByb3h5KHRoaXMudW5tYXNrLCB0aGlzKSlcclxuXHJcbiAgICAgIC5vbihcImZvY3VzLmJzLmlucHV0bWFza1wiLCAkLnByb3h5KHRoaXMuZm9jdXNFdmVudCwgdGhpcykpXHJcbiAgICAgIC5vbihcImJsdXIuYnMuaW5wdXRtYXNrXCIsICQucHJveHkodGhpcy5ibHVyRXZlbnQsIHRoaXMpKVxyXG5cclxuICAgICAgLm9uKFwia2V5ZG93bi5icy5pbnB1dG1hc2tcIiwgJC5wcm94eSh0aGlzLmtleWRvd25FdmVudCwgdGhpcykpXHJcbiAgICAgIC5vbihcImtleXByZXNzLmJzLmlucHV0bWFza1wiLCAkLnByb3h5KHRoaXMua2V5cHJlc3NFdmVudCwgdGhpcykpXHJcblxyXG4gICAgICAub24ocGFzdGVFdmVudE5hbWUsICQucHJveHkodGhpcy5wYXN0ZUV2ZW50LCB0aGlzKSlcclxuICB9XHJcblxyXG4gIC8vSGVscGVyIEZ1bmN0aW9uIGZvciBDYXJldCBwb3NpdGlvbmluZ1xyXG4gIElucHV0bWFzay5wcm90b3R5cGUuY2FyZXQgPSBmdW5jdGlvbihiZWdpbiwgZW5kKSB7XHJcbiAgICBpZiAodGhpcy4kZWxlbWVudC5sZW5ndGggPT09IDApIHJldHVyblxyXG4gICAgaWYgKHR5cGVvZiBiZWdpbiA9PSAnbnVtYmVyJykge1xyXG4gICAgICBlbmQgPSAodHlwZW9mIGVuZCA9PSAnbnVtYmVyJykgPyBlbmQgOiBiZWdpblxyXG4gICAgICByZXR1cm4gdGhpcy4kZWxlbWVudC5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNldFNlbGVjdGlvblJhbmdlKSB7XHJcbiAgICAgICAgICB0aGlzLnNldFNlbGVjdGlvblJhbmdlKGJlZ2luLCBlbmQpXHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNyZWF0ZVRleHRSYW5nZSkge1xyXG4gICAgICAgICAgdmFyIHJhbmdlID0gdGhpcy5jcmVhdGVUZXh0UmFuZ2UoKVxyXG4gICAgICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSlcclxuICAgICAgICAgIHJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIGVuZClcclxuICAgICAgICAgIHJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgYmVnaW4pXHJcbiAgICAgICAgICByYW5nZS5zZWxlY3QoKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLiRlbGVtZW50WzBdLnNldFNlbGVjdGlvblJhbmdlKSB7XHJcbiAgICAgICAgYmVnaW4gPSB0aGlzLiRlbGVtZW50WzBdLnNlbGVjdGlvblN0YXJ0XHJcbiAgICAgICAgZW5kID0gdGhpcy4kZWxlbWVudFswXS5zZWxlY3Rpb25FbmRcclxuICAgICAgfSBlbHNlIGlmIChkb2N1bWVudC5zZWxlY3Rpb24gJiYgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKSB7XHJcbiAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKClcclxuICAgICAgICBiZWdpbiA9IDAgLSByYW5nZS5kdXBsaWNhdGUoKS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC0xMDAwMDApXHJcbiAgICAgICAgZW5kID0gYmVnaW4gKyByYW5nZS50ZXh0Lmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgYmVnaW46IGJlZ2luLCBcclxuICAgICAgICBlbmQ6IGVuZFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuc2Vla05leHQgPSBmdW5jdGlvbihwb3MpIHtcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoXHJcbiAgICB3aGlsZSAoKytwb3MgPD0gbGVuICYmICF0aGlzLnRlc3RzW3Bvc10pO1xyXG5cclxuICAgIHJldHVybiBwb3NcclxuICB9XHJcbiAgXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5zZWVrUHJldiA9IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgd2hpbGUgKC0tcG9zID49IDAgJiYgIXRoaXMudGVzdHNbcG9zXSk7XHJcblxyXG4gICAgcmV0dXJuIHBvc1xyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5zaGlmdEwgPSBmdW5jdGlvbihiZWdpbixlbmQpIHtcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoXHJcblxyXG4gICAgaWYgKGJlZ2luIDwgMCkgcmV0dXJuXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IGJlZ2luLCBqID0gdGhpcy5zZWVrTmV4dChlbmQpOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMudGVzdHNbaV0pIHtcclxuICAgICAgICBpZiAoaiA8IGxlbiAmJiB0aGlzLnRlc3RzW2ldLnRlc3QodGhpcy5idWZmZXJbal0pKSB7XHJcbiAgICAgICAgICB0aGlzLmJ1ZmZlcltpXSA9IHRoaXMuYnVmZmVyW2pdXHJcbiAgICAgICAgICB0aGlzLmJ1ZmZlcltqXSA9IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlclxyXG4gICAgICAgIH0gZWxzZVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICBqID0gdGhpcy5zZWVrTmV4dChqKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLndyaXRlQnVmZmVyKClcclxuICAgIHRoaXMuY2FyZXQoTWF0aC5tYXgodGhpcy5maXJzdE5vbk1hc2tQb3MsIGJlZ2luKSlcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuc2hpZnRSID0gZnVuY3Rpb24ocG9zKSB7XHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aFxyXG5cclxuICAgIGZvciAodmFyIGkgPSBwb3MsIGMgPSB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXI7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICBpZiAodGhpcy50ZXN0c1tpXSkge1xyXG4gICAgICAgIHZhciBqID0gdGhpcy5zZWVrTmV4dChpKVxyXG4gICAgICAgIHZhciB0ID0gdGhpcy5idWZmZXJbaV1cclxuICAgICAgICB0aGlzLmJ1ZmZlcltpXSA9IGNcclxuICAgICAgICBpZiAoaiA8IGxlbiAmJiB0aGlzLnRlc3RzW2pdLnRlc3QodCkpXHJcbiAgICAgICAgICBjID0gdFxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLnVubWFzayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAudW5iaW5kKFwiLm1hc2tcIilcclxuICAgICAgLnJlbW92ZURhdGEoXCJpbnB1dG1hc2tcIilcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuZm9jdXNFdmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5mb2N1c1RleHQgPSB0aGlzLiRlbGVtZW50LnZhbCgpXHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aCBcclxuICAgIHZhciBwb3MgPSB0aGlzLmNoZWNrVmFsKClcclxuICAgIHRoaXMud3JpdGVCdWZmZXIoKVxyXG5cclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgdmFyIG1vdmVDYXJldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAocG9zID09IGxlbilcclxuICAgICAgICB0aGF0LmNhcmV0KDAsIHBvcylcclxuICAgICAgZWxzZVxyXG4gICAgICAgIHRoYXQuY2FyZXQocG9zKVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVDYXJldCgpXHJcbiAgICBzZXRUaW1lb3V0KG1vdmVDYXJldCwgNTApXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmJsdXJFdmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jaGVja1ZhbCgpXHJcbiAgICBpZiAodGhpcy4kZWxlbWVudC52YWwoKSAhPT0gdGhpcy5mb2N1c1RleHQpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2hhbmdlJylcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUua2V5ZG93bkV2ZW50ID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdmFyIGsgPSBlLndoaWNoXHJcblxyXG4gICAgLy9iYWNrc3BhY2UsIGRlbGV0ZSwgYW5kIGVzY2FwZSBnZXQgc3BlY2lhbCB0cmVhdG1lbnRcclxuICAgIGlmIChrID09IDggfHwgayA9PSA0NiB8fCAoaXNJcGhvbmUgJiYgayA9PSAxMjcpKSB7XHJcbiAgICAgIHZhciBwb3MgPSB0aGlzLmNhcmV0KCksXHJcbiAgICAgIGJlZ2luID0gcG9zLmJlZ2luLFxyXG4gICAgICBlbmQgPSBwb3MuZW5kXHJcblxyXG4gICAgICBpZiAoZW5kIC0gYmVnaW4gPT09IDApIHtcclxuICAgICAgICBiZWdpbiA9IGsgIT0gNDYgPyB0aGlzLnNlZWtQcmV2KGJlZ2luKSA6IChlbmQgPSB0aGlzLnNlZWtOZXh0KGJlZ2luIC0gMSkpXHJcbiAgICAgICAgZW5kID0gayA9PSA0NiA/IHRoaXMuc2Vla05leHQoZW5kKSA6IGVuZFxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuY2xlYXJCdWZmZXIoYmVnaW4sIGVuZClcclxuICAgICAgdGhpcy5zaGlmdEwoYmVnaW4sIGVuZCAtIDEpXHJcblxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIH0gZWxzZSBpZiAoayA9PSAyNykgey8vZXNjYXBlXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudmFsKHRoaXMuZm9jdXNUZXh0KVxyXG4gICAgICB0aGlzLmNhcmV0KDAsIHRoaXMuY2hlY2tWYWwoKSlcclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmtleXByZXNzRXZlbnQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aFxyXG5cclxuICAgIHZhciBrID0gZS53aGljaCxcclxuICAgIHBvcyA9IHRoaXMuY2FyZXQoKVxyXG5cclxuICAgIGlmIChlLmN0cmxLZXkgfHwgZS5hbHRLZXkgfHwgZS5tZXRhS2V5IHx8IGsgPCAzMikgIHsvL0lnbm9yZVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSBlbHNlIGlmIChrKSB7XHJcbiAgICAgIGlmIChwb3MuZW5kIC0gcG9zLmJlZ2luICE9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhckJ1ZmZlcihwb3MuYmVnaW4sIHBvcy5lbmQpXHJcbiAgICAgICAgdGhpcy5zaGlmdEwocG9zLmJlZ2luLCBwb3MuZW5kIC0gMSlcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHAgPSB0aGlzLnNlZWtOZXh0KHBvcy5iZWdpbiAtIDEpXHJcbiAgICAgIGlmIChwIDwgbGVuKSB7XHJcbiAgICAgICAgdmFyIGMgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGspXHJcbiAgICAgICAgaWYgKHRoaXMudGVzdHNbcF0udGVzdChjKSkge1xyXG4gICAgICAgICAgdGhpcy5zaGlmdFIocClcclxuICAgICAgICAgIHRoaXMuYnVmZmVyW3BdID0gY1xyXG4gICAgICAgICAgdGhpcy53cml0ZUJ1ZmZlcigpXHJcbiAgICAgICAgICB2YXIgbmV4dCA9IHRoaXMuc2Vla05leHQocClcclxuICAgICAgICAgIHRoaXMuY2FyZXQobmV4dClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLnBhc3RlRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoYXQuY2FyZXQodGhhdC5jaGVja1ZhbCh0cnVlKSlcclxuICAgIH0sIDApXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmNsZWFyQnVmZmVyID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGhcclxuXHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQgJiYgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGlmICh0aGlzLnRlc3RzW2ldKVxyXG4gICAgICAgIHRoaXMuYnVmZmVyW2ldID0gdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLndyaXRlQnVmZmVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy4kZWxlbWVudC52YWwodGhpcy5idWZmZXIuam9pbignJykpLnZhbCgpXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmNoZWNrVmFsID0gZnVuY3Rpb24oYWxsb3cpIHtcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoXHJcbiAgICAvL3RyeSB0byBwbGFjZSBjaGFyYWN0ZXJzIHdoZXJlIHRoZXkgYmVsb25nXHJcbiAgICB2YXIgdGVzdCA9IHRoaXMuJGVsZW1lbnQudmFsKClcclxuICAgIHZhciBsYXN0TWF0Y2ggPSAtMVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwLCBwb3MgPSAwOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMudGVzdHNbaV0pIHtcclxuICAgICAgICB0aGlzLmJ1ZmZlcltpXSA9IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlclxyXG4gICAgICAgIHdoaWxlIChwb3MrKyA8IHRlc3QubGVuZ3RoKSB7XHJcbiAgICAgICAgICB2YXIgYyA9IHRlc3QuY2hhckF0KHBvcyAtIDEpXHJcbiAgICAgICAgICBpZiAodGhpcy50ZXN0c1tpXS50ZXN0KGMpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW2ldID0gY1xyXG4gICAgICAgICAgICBsYXN0TWF0Y2ggPSBpXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwb3MgPiB0ZXN0Lmxlbmd0aClcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5idWZmZXJbaV0gPT0gdGVzdC5jaGFyQXQocG9zKSAmJiBpICE9IHRoaXMucGFydGlhbFBvc2l0aW9uKSB7XHJcbiAgICAgICAgcG9zKytcclxuICAgICAgICBsYXN0TWF0Y2ggPSBpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghYWxsb3cgJiYgbGFzdE1hdGNoICsgMSA8IHRoaXMucGFydGlhbFBvc2l0aW9uKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudmFsKFwiXCIpXHJcbiAgICAgIHRoaXMuY2xlYXJCdWZmZXIoMCwgbGVuKVxyXG4gICAgfSBlbHNlIGlmIChhbGxvdyB8fCBsYXN0TWF0Y2ggKyAxID49IHRoaXMucGFydGlhbFBvc2l0aW9uKSB7XHJcbiAgICAgIHRoaXMud3JpdGVCdWZmZXIoKVxyXG4gICAgICBpZiAoIWFsbG93KSB0aGlzLiRlbGVtZW50LnZhbCh0aGlzLiRlbGVtZW50LnZhbCgpLnN1YnN0cmluZygwLCBsYXN0TWF0Y2ggKyAxKSlcclxuICAgIH1cclxuICAgIHJldHVybiAodGhpcy5wYXJ0aWFsUG9zaXRpb24gPyBpIDogdGhpcy5maXJzdE5vbk1hc2tQb3MpXHJcbiAgfVxyXG5cclxuICBcclxuICAvLyBJTlBVVE1BU0sgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uaW5wdXRtYXNrXHJcbiAgXHJcbiAgJC5mbi5pbnB1dG1hc2sgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgPSAkdGhpcy5kYXRhKCdicy5pbnB1dG1hc2snKVxyXG4gICAgICBcclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5pbnB1dG1hc2snLCAoZGF0YSA9IG5ldyBJbnB1dG1hc2sodGhpcywgb3B0aW9ucykpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQuZm4uaW5wdXRtYXNrLkNvbnN0cnVjdG9yID0gSW5wdXRtYXNrXHJcblxyXG5cclxuICAvLyBJTlBVVE1BU0sgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmlucHV0bWFzay5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5pbnB1dG1hc2sgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gSU5QVVRNQVNLIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdmb2N1cy5icy5pbnB1dG1hc2suZGF0YS1hcGknLCAnW2RhdGEtbWFza10nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgaWYgKCR0aGlzLmRhdGEoJ2JzLmlucHV0bWFzaycpKSByZXR1cm5cclxuICAgICR0aGlzLmlucHV0bWFzaygkdGhpcy5kYXRhKCkpXHJcbiAgfSlcclxuXHJcbn0od2luZG93LmpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGZpbGVpbnB1dC5qcyB2My4xLjNcclxuICogaHR0cDovL2phc255LmdpdGh1Yi5jb20vYm9vdHN0cmFwL2phdmFzY3JpcHQvI2ZpbGVpbnB1dFxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDE0IEFybm9sZCBEYW5pZWxzXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIilcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxyXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuK2Z1bmN0aW9uICgkKSB7IFwidXNlIHN0cmljdFwiO1xyXG5cclxuICB2YXIgaXNJRSA9IHdpbmRvdy5uYXZpZ2F0b3IuYXBwTmFtZSA9PSAnTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyJ1xyXG5cclxuICAvLyBGSUxFVVBMT0FEIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBGaWxlaW5wdXQgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgIFxyXG4gICAgdGhpcy4kaW5wdXQgPSB0aGlzLiRlbGVtZW50LmZpbmQoJzpmaWxlJylcclxuICAgIGlmICh0aGlzLiRpbnB1dC5sZW5ndGggPT09IDApIHJldHVyblxyXG5cclxuICAgIHRoaXMubmFtZSA9IHRoaXMuJGlucHV0LmF0dHIoJ25hbWUnKSB8fCBvcHRpb25zLm5hbWVcclxuXHJcbiAgICB0aGlzLiRoaWRkZW4gPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2lucHV0W3R5cGU9aGlkZGVuXVtuYW1lPVwiJyArIHRoaXMubmFtZSArICdcIl0nKVxyXG4gICAgaWYgKHRoaXMuJGhpZGRlbi5sZW5ndGggPT09IDApIHtcclxuICAgICAgdGhpcy4kaGlkZGVuID0gJCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIj4nKS5pbnNlcnRCZWZvcmUodGhpcy4kaW5wdXQpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kcHJldmlldyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmZpbGVpbnB1dC1wcmV2aWV3JylcclxuICAgIHZhciBoZWlnaHQgPSB0aGlzLiRwcmV2aWV3LmNzcygnaGVpZ2h0JylcclxuICAgIGlmICh0aGlzLiRwcmV2aWV3LmNzcygnZGlzcGxheScpICE9PSAnaW5saW5lJyAmJiBoZWlnaHQgIT09ICcwcHgnICYmIGhlaWdodCAhPT0gJ25vbmUnKSB7XHJcbiAgICAgIHRoaXMuJHByZXZpZXcuY3NzKCdsaW5lLWhlaWdodCcsIGhlaWdodClcclxuICAgIH1cclxuICAgICAgICBcclxuICAgIHRoaXMub3JpZ2luYWwgPSB7XHJcbiAgICAgIGV4aXN0czogdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmlsZWlucHV0LWV4aXN0cycpLFxyXG4gICAgICBwcmV2aWV3OiB0aGlzLiRwcmV2aWV3Lmh0bWwoKSxcclxuICAgICAgaGlkZGVuVmFsOiB0aGlzLiRoaWRkZW4udmFsKClcclxuICAgIH1cclxuICAgIFxyXG4gICAgdGhpcy5saXN0ZW4oKVxyXG4gIH1cclxuICBcclxuICBGaWxlaW5wdXQucHJvdG90eXBlLmxpc3RlbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy4kaW5wdXQub24oJ2NoYW5nZS5icy5maWxlaW5wdXQnLCAkLnByb3h5KHRoaXMuY2hhbmdlLCB0aGlzKSlcclxuICAgICQodGhpcy4kaW5wdXRbMF0uZm9ybSkub24oJ3Jlc2V0LmJzLmZpbGVpbnB1dCcsICQucHJveHkodGhpcy5yZXNldCwgdGhpcykpXHJcbiAgICBcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtdHJpZ2dlcj1cImZpbGVpbnB1dFwiXScpLm9uKCdjbGljay5icy5maWxlaW5wdXQnLCAkLnByb3h5KHRoaXMudHJpZ2dlciwgdGhpcykpXHJcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWRpc21pc3M9XCJmaWxlaW5wdXRcIl0nKS5vbignY2xpY2suYnMuZmlsZWlucHV0JywgJC5wcm94eSh0aGlzLmNsZWFyLCB0aGlzKSlcclxuICB9LFxyXG5cclxuICBGaWxlaW5wdXQucHJvdG90eXBlLmNoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBmaWxlcyA9IGUudGFyZ2V0LmZpbGVzID09PSB1bmRlZmluZWQgPyAoZS50YXJnZXQgJiYgZS50YXJnZXQudmFsdWUgPyBbeyBuYW1lOiBlLnRhcmdldC52YWx1ZS5yZXBsYWNlKC9eLitcXFxcLywgJycpfV0gOiBbXSkgOiBlLnRhcmdldC5maWxlc1xyXG4gICAgXHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcblxyXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aGlzLmNsZWFyKClcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kaGlkZGVuLnZhbCgnJylcclxuICAgIHRoaXMuJGhpZGRlbi5hdHRyKCduYW1lJywgJycpXHJcbiAgICB0aGlzLiRpbnB1dC5hdHRyKCduYW1lJywgdGhpcy5uYW1lKVxyXG5cclxuICAgIHZhciBmaWxlID0gZmlsZXNbMF1cclxuXHJcbiAgICBpZiAodGhpcy4kcHJldmlldy5sZW5ndGggPiAwICYmICh0eXBlb2YgZmlsZS50eXBlICE9PSBcInVuZGVmaW5lZFwiID8gZmlsZS50eXBlLm1hdGNoKC9eaW1hZ2VcXC8oZ2lmfHBuZ3xqcGVnKSQvKSA6IGZpbGUubmFtZS5tYXRjaCgvXFwuKGdpZnxwbmd8anBlP2cpJC9pKSkgJiYgdHlwZW9mIEZpbGVSZWFkZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcclxuICAgICAgdmFyIHByZXZpZXcgPSB0aGlzLiRwcmV2aWV3XHJcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy4kZWxlbWVudFxyXG5cclxuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKHJlKSB7XHJcbiAgICAgICAgdmFyICRpbWcgPSAkKCc8aW1nPicpXHJcbiAgICAgICAgJGltZ1swXS5zcmMgPSByZS50YXJnZXQucmVzdWx0XHJcbiAgICAgICAgZmlsZXNbMF0ucmVzdWx0ID0gcmUudGFyZ2V0LnJlc3VsdFxyXG4gICAgICAgIFxyXG4gICAgICAgIGVsZW1lbnQuZmluZCgnLmZpbGVpbnB1dC1maWxlbmFtZScpLnRleHQoZmlsZS5uYW1lKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGlmIHBhcmVudCBoYXMgbWF4LWhlaWdodCwgdXNpbmcgYChtYXgtKWhlaWdodDogMTAwJWAgb24gY2hpbGQgZG9lc24ndCB0YWtlIHBhZGRpbmcgYW5kIGJvcmRlciBpbnRvIGFjY291bnRcclxuICAgICAgICBpZiAocHJldmlldy5jc3MoJ21heC1oZWlnaHQnKSAhPSAnbm9uZScpICRpbWcuY3NzKCdtYXgtaGVpZ2h0JywgcGFyc2VJbnQocHJldmlldy5jc3MoJ21heC1oZWlnaHQnKSwgMTApIC0gcGFyc2VJbnQocHJldmlldy5jc3MoJ3BhZGRpbmctdG9wJyksIDEwKSAtIHBhcnNlSW50KHByZXZpZXcuY3NzKCdwYWRkaW5nLWJvdHRvbScpLCAxMCkgIC0gcGFyc2VJbnQocHJldmlldy5jc3MoJ2JvcmRlci10b3AnKSwgMTApIC0gcGFyc2VJbnQocHJldmlldy5jc3MoJ2JvcmRlci1ib3R0b20nKSwgMTApKVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByZXZpZXcuaHRtbCgkaW1nKVxyXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2ZpbGVpbnB1dC1leGlzdHMnKS5yZW1vdmVDbGFzcygnZmlsZWlucHV0LW5ldycpXHJcblxyXG4gICAgICAgIGVsZW1lbnQudHJpZ2dlcignY2hhbmdlLmJzLmZpbGVpbnB1dCcsIGZpbGVzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcuZmlsZWlucHV0LWZpbGVuYW1lJykudGV4dChmaWxlLm5hbWUpXHJcbiAgICAgIHRoaXMuJHByZXZpZXcudGV4dChmaWxlLm5hbWUpXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdmaWxlaW5wdXQtZXhpc3RzJykucmVtb3ZlQ2xhc3MoJ2ZpbGVpbnB1dC1uZXcnKVxyXG4gICAgICBcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjaGFuZ2UuYnMuZmlsZWlucHV0JylcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBGaWxlaW5wdXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oZSkge1xyXG4gICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgXHJcbiAgICB0aGlzLiRoaWRkZW4udmFsKCcnKVxyXG4gICAgdGhpcy4kaGlkZGVuLmF0dHIoJ25hbWUnLCB0aGlzLm5hbWUpXHJcbiAgICB0aGlzLiRpbnB1dC5hdHRyKCduYW1lJywgJycpXHJcblxyXG4gICAgLy9pZTgrIGRvZXNuJ3Qgc3VwcG9ydCBjaGFuZ2luZyB0aGUgdmFsdWUgb2YgaW5wdXQgd2l0aCB0eXBlPWZpbGUgc28gY2xvbmUgaW5zdGVhZFxyXG4gICAgaWYgKGlzSUUpIHsgXHJcbiAgICAgIHZhciBpbnB1dENsb25lID0gdGhpcy4kaW5wdXQuY2xvbmUodHJ1ZSk7XHJcbiAgICAgIHRoaXMuJGlucHV0LmFmdGVyKGlucHV0Q2xvbmUpO1xyXG4gICAgICB0aGlzLiRpbnB1dC5yZW1vdmUoKTtcclxuICAgICAgdGhpcy4kaW5wdXQgPSBpbnB1dENsb25lO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy4kaW5wdXQudmFsKCcnKVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJHByZXZpZXcuaHRtbCgnJylcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnLmZpbGVpbnB1dC1maWxlbmFtZScpLnRleHQoJycpXHJcbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdmaWxlaW5wdXQtbmV3JykucmVtb3ZlQ2xhc3MoJ2ZpbGVpbnB1dC1leGlzdHMnKVxyXG4gICAgXHJcbiAgICBpZiAoZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuJGlucHV0LnRyaWdnZXIoJ2NoYW5nZScpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xlYXIuYnMuZmlsZWlucHV0JylcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBGaWxlaW5wdXQucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmNsZWFyKClcclxuXHJcbiAgICB0aGlzLiRoaWRkZW4udmFsKHRoaXMub3JpZ2luYWwuaGlkZGVuVmFsKVxyXG4gICAgdGhpcy4kcHJldmlldy5odG1sKHRoaXMub3JpZ2luYWwucHJldmlldylcclxuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnLmZpbGVpbnB1dC1maWxlbmFtZScpLnRleHQoJycpXHJcblxyXG4gICAgaWYgKHRoaXMub3JpZ2luYWwuZXhpc3RzKSB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdmaWxlaW5wdXQtZXhpc3RzJykucmVtb3ZlQ2xhc3MoJ2ZpbGVpbnB1dC1uZXcnKVxyXG4gICAgIGVsc2UgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnZmlsZWlucHV0LW5ldycpLnJlbW92ZUNsYXNzKCdmaWxlaW5wdXQtZXhpc3RzJylcclxuICAgIFxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdyZXNldC5icy5maWxlaW5wdXQnKVxyXG4gIH0sXHJcblxyXG4gIEZpbGVpbnB1dC5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHRoaXMuJGlucHV0LnRyaWdnZXIoJ2NsaWNrJylcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gIH1cclxuXHJcbiAgXHJcbiAgLy8gRklMRVVQTE9BRCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5maWxlaW5wdXRcclxuICBcclxuICAkLmZuLmZpbGVpbnB1dCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcclxuICAgICAgICAgIGRhdGEgPSAkdGhpcy5kYXRhKCdicy5maWxlaW5wdXQnKVxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmZpbGVpbnB1dCcsIChkYXRhID0gbmV3IEZpbGVpbnB1dCh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25zXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJC5mbi5maWxlaW5wdXQuQ29uc3RydWN0b3IgPSBGaWxlaW5wdXRcclxuXHJcblxyXG4gIC8vIEZJTEVJTlBVVCBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uZmlsZWlucHV0Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmZpbGVpbnB1dCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBGSUxFVVBMT0FEIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5maWxlaW5wdXQuZGF0YS1hcGknLCAnW2RhdGEtcHJvdmlkZXM9XCJmaWxlaW5wdXRcIl0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgaWYgKCR0aGlzLmRhdGEoJ2JzLmZpbGVpbnB1dCcpKSByZXR1cm5cclxuICAgICR0aGlzLmZpbGVpbnB1dCgkdGhpcy5kYXRhKCkpXHJcbiAgICAgIFxyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1kaXNtaXNzPVwiZmlsZWlucHV0XCJdLFtkYXRhLXRyaWdnZXI9XCJmaWxlaW5wdXRcIl0nKTtcclxuICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICR0YXJnZXQudHJpZ2dlcignY2xpY2suYnMuZmlsZWlucHV0JylcclxuICAgIH1cclxuICB9KVxyXG5cclxufSh3aW5kb3cualF1ZXJ5KTtcclxuIiwiLy8hIG1vbWVudC5qc1xuLy8hIHZlcnNpb24gOiAyLjE3LjFcbi8vISBhdXRob3JzIDogVGltIFdvb2QsIElza3JlbiBDaGVybmV2LCBNb21lbnQuanMgY29udHJpYnV0b3JzXG4vLyEgbGljZW5zZSA6IE1JVFxuLy8hIG1vbWVudGpzLmNvbVxuIWZ1bmN0aW9uKGEsYil7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9YigpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoYik6YS5tb21lbnQ9YigpfSh0aGlzLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gYSgpe3JldHVybiBvZC5hcHBseShudWxsLGFyZ3VtZW50cyl9XG4vLyBUaGlzIGlzIGRvbmUgdG8gcmVnaXN0ZXIgdGhlIG1ldGhvZCBjYWxsZWQgd2l0aCBtb21lbnQoKVxuLy8gd2l0aG91dCBjcmVhdGluZyBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG5mdW5jdGlvbiBiKGEpe29kPWF9ZnVuY3Rpb24gYyhhKXtyZXR1cm4gYSBpbnN0YW5jZW9mIEFycmF5fHxcIltvYmplY3QgQXJyYXldXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSl9ZnVuY3Rpb24gZChhKXtcbi8vIElFOCB3aWxsIHRyZWF0IHVuZGVmaW5lZCBhbmQgbnVsbCBhcyBvYmplY3QgaWYgaXQgd2Fzbid0IGZvclxuLy8gaW5wdXQgIT0gbnVsbFxucmV0dXJuIG51bGwhPWEmJlwiW29iamVjdCBPYmplY3RdXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSl9ZnVuY3Rpb24gZShhKXt2YXIgYjtmb3IoYiBpbiBhKVxuLy8gZXZlbiBpZiBpdHMgbm90IG93biBwcm9wZXJ0eSBJJ2Qgc3RpbGwgY2FsbCBpdCBub24tZW1wdHlcbnJldHVybiExO3JldHVybiEwfWZ1bmN0aW9uIGYoYSl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIGF8fFwiW29iamVjdCBOdW1iZXJdXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSl9ZnVuY3Rpb24gZyhhKXtyZXR1cm4gYSBpbnN0YW5jZW9mIERhdGV8fFwiW29iamVjdCBEYXRlXVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpfWZ1bmN0aW9uIGgoYSxiKXt2YXIgYyxkPVtdO2ZvcihjPTA7YzxhLmxlbmd0aDsrK2MpZC5wdXNoKGIoYVtjXSxjKSk7cmV0dXJuIGR9ZnVuY3Rpb24gaShhLGIpe3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYSxiKX1mdW5jdGlvbiBqKGEsYil7Zm9yKHZhciBjIGluIGIpaShiLGMpJiYoYVtjXT1iW2NdKTtyZXR1cm4gaShiLFwidG9TdHJpbmdcIikmJihhLnRvU3RyaW5nPWIudG9TdHJpbmcpLGkoYixcInZhbHVlT2ZcIikmJihhLnZhbHVlT2Y9Yi52YWx1ZU9mKSxhfWZ1bmN0aW9uIGsoYSxiLGMsZCl7cmV0dXJuIHJiKGEsYixjLGQsITApLnV0YygpfWZ1bmN0aW9uIGwoKXtcbi8vIFdlIG5lZWQgdG8gZGVlcCBjbG9uZSB0aGlzIG9iamVjdC5cbnJldHVybntlbXB0eTohMSx1bnVzZWRUb2tlbnM6W10sdW51c2VkSW5wdXQ6W10sb3ZlcmZsb3c6LTIsY2hhcnNMZWZ0T3ZlcjowLG51bGxJbnB1dDohMSxpbnZhbGlkTW9udGg6bnVsbCxpbnZhbGlkRm9ybWF0OiExLHVzZXJJbnZhbGlkYXRlZDohMSxpc286ITEscGFyc2VkRGF0ZVBhcnRzOltdLG1lcmlkaWVtOm51bGx9fWZ1bmN0aW9uIG0oYSl7cmV0dXJuIG51bGw9PWEuX3BmJiYoYS5fcGY9bCgpKSxhLl9wZn1mdW5jdGlvbiBuKGEpe2lmKG51bGw9PWEuX2lzVmFsaWQpe3ZhciBiPW0oYSksYz1xZC5jYWxsKGIucGFyc2VkRGF0ZVBhcnRzLGZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT1hfSksZD0haXNOYU4oYS5fZC5nZXRUaW1lKCkpJiZiLm92ZXJmbG93PDAmJiFiLmVtcHR5JiYhYi5pbnZhbGlkTW9udGgmJiFiLmludmFsaWRXZWVrZGF5JiYhYi5udWxsSW5wdXQmJiFiLmludmFsaWRGb3JtYXQmJiFiLnVzZXJJbnZhbGlkYXRlZCYmKCFiLm1lcmlkaWVtfHxiLm1lcmlkaWVtJiZjKTtpZihhLl9zdHJpY3QmJihkPWQmJjA9PT1iLmNoYXJzTGVmdE92ZXImJjA9PT1iLnVudXNlZFRva2Vucy5sZW5ndGgmJnZvaWQgMD09PWIuYmlnSG91ciksbnVsbCE9T2JqZWN0LmlzRnJvemVuJiZPYmplY3QuaXNGcm96ZW4oYSkpcmV0dXJuIGQ7YS5faXNWYWxpZD1kfXJldHVybiBhLl9pc1ZhbGlkfWZ1bmN0aW9uIG8oYSl7dmFyIGI9ayhOYU4pO3JldHVybiBudWxsIT1hP2oobShiKSxhKTptKGIpLnVzZXJJbnZhbGlkYXRlZD0hMCxifWZ1bmN0aW9uIHAoYSl7cmV0dXJuIHZvaWQgMD09PWF9ZnVuY3Rpb24gcShhLGIpe3ZhciBjLGQsZTtpZihwKGIuX2lzQU1vbWVudE9iamVjdCl8fChhLl9pc0FNb21lbnRPYmplY3Q9Yi5faXNBTW9tZW50T2JqZWN0KSxwKGIuX2kpfHwoYS5faT1iLl9pKSxwKGIuX2YpfHwoYS5fZj1iLl9mKSxwKGIuX2wpfHwoYS5fbD1iLl9sKSxwKGIuX3N0cmljdCl8fChhLl9zdHJpY3Q9Yi5fc3RyaWN0KSxwKGIuX3R6bSl8fChhLl90em09Yi5fdHptKSxwKGIuX2lzVVRDKXx8KGEuX2lzVVRDPWIuX2lzVVRDKSxwKGIuX29mZnNldCl8fChhLl9vZmZzZXQ9Yi5fb2Zmc2V0KSxwKGIuX3BmKXx8KGEuX3BmPW0oYikpLHAoYi5fbG9jYWxlKXx8KGEuX2xvY2FsZT1iLl9sb2NhbGUpLHJkLmxlbmd0aD4wKWZvcihjIGluIHJkKWQ9cmRbY10sZT1iW2RdLHAoZSl8fChhW2RdPWUpO3JldHVybiBhfVxuLy8gTW9tZW50IHByb3RvdHlwZSBvYmplY3RcbmZ1bmN0aW9uIHIoYil7cSh0aGlzLGIpLHRoaXMuX2Q9bmV3IERhdGUobnVsbCE9Yi5fZD9iLl9kLmdldFRpbWUoKTpOYU4pLHRoaXMuaXNWYWxpZCgpfHwodGhpcy5fZD1uZXcgRGF0ZShOYU4pKSxcbi8vIFByZXZlbnQgaW5maW5pdGUgbG9vcCBpbiBjYXNlIHVwZGF0ZU9mZnNldCBjcmVhdGVzIG5ldyBtb21lbnRcbi8vIG9iamVjdHMuXG5zZD09PSExJiYoc2Q9ITAsYS51cGRhdGVPZmZzZXQodGhpcyksc2Q9ITEpfWZ1bmN0aW9uIHMoYSl7cmV0dXJuIGEgaW5zdGFuY2VvZiByfHxudWxsIT1hJiZudWxsIT1hLl9pc0FNb21lbnRPYmplY3R9ZnVuY3Rpb24gdChhKXtyZXR1cm4gYTwwP01hdGguY2VpbChhKXx8MDpNYXRoLmZsb29yKGEpfWZ1bmN0aW9uIHUoYSl7dmFyIGI9K2EsYz0wO3JldHVybiAwIT09YiYmaXNGaW5pdGUoYikmJihjPXQoYikpLGN9XG4vLyBjb21wYXJlIHR3byBhcnJheXMsIHJldHVybiB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzXG5mdW5jdGlvbiB2KGEsYixjKXt2YXIgZCxlPU1hdGgubWluKGEubGVuZ3RoLGIubGVuZ3RoKSxmPU1hdGguYWJzKGEubGVuZ3RoLWIubGVuZ3RoKSxnPTA7Zm9yKGQ9MDtkPGU7ZCsrKShjJiZhW2RdIT09YltkXXx8IWMmJnUoYVtkXSkhPT11KGJbZF0pKSYmZysrO3JldHVybiBnK2Z9ZnVuY3Rpb24gdyhiKXthLnN1cHByZXNzRGVwcmVjYXRpb25XYXJuaW5ncz09PSExJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgY29uc29sZSYmY29uc29sZS53YXJuJiZjb25zb2xlLndhcm4oXCJEZXByZWNhdGlvbiB3YXJuaW5nOiBcIitiKX1mdW5jdGlvbiB4KGIsYyl7dmFyIGQ9ITA7cmV0dXJuIGooZnVuY3Rpb24oKXtpZihudWxsIT1hLmRlcHJlY2F0aW9uSGFuZGxlciYmYS5kZXByZWNhdGlvbkhhbmRsZXIobnVsbCxiKSxkKXtmb3IodmFyIGUsZj1bXSxnPTA7Zzxhcmd1bWVudHMubGVuZ3RoO2crKyl7aWYoZT1cIlwiLFwib2JqZWN0XCI9PXR5cGVvZiBhcmd1bWVudHNbZ10pe2UrPVwiXFxuW1wiK2crXCJdIFwiO2Zvcih2YXIgaCBpbiBhcmd1bWVudHNbMF0pZSs9aCtcIjogXCIrYXJndW1lbnRzWzBdW2hdK1wiLCBcIjtlPWUuc2xpY2UoMCwtMil9ZWxzZSBlPWFyZ3VtZW50c1tnXTtmLnB1c2goZSl9dyhiK1wiXFxuQXJndW1lbnRzOiBcIitBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmKS5qb2luKFwiXCIpK1wiXFxuXCIrKG5ldyBFcnJvcikuc3RhY2spLGQ9ITF9cmV0dXJuIGMuYXBwbHkodGhpcyxhcmd1bWVudHMpfSxjKX1mdW5jdGlvbiB5KGIsYyl7bnVsbCE9YS5kZXByZWNhdGlvbkhhbmRsZXImJmEuZGVwcmVjYXRpb25IYW5kbGVyKGIsYyksdGRbYl18fCh3KGMpLHRkW2JdPSEwKX1mdW5jdGlvbiB6KGEpe3JldHVybiBhIGluc3RhbmNlb2YgRnVuY3Rpb258fFwiW29iamVjdCBGdW5jdGlvbl1cIj09PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKX1mdW5jdGlvbiBBKGEpe3ZhciBiLGM7Zm9yKGMgaW4gYSliPWFbY10seihiKT90aGlzW2NdPWI6dGhpc1tcIl9cIitjXT1iO3RoaXMuX2NvbmZpZz1hLFxuLy8gTGVuaWVudCBvcmRpbmFsIHBhcnNpbmcgYWNjZXB0cyBqdXN0IGEgbnVtYmVyIGluIGFkZGl0aW9uIHRvXG4vLyBudW1iZXIgKyAocG9zc2libHkpIHN0dWZmIGNvbWluZyBmcm9tIF9vcmRpbmFsUGFyc2VMZW5pZW50LlxudGhpcy5fb3JkaW5hbFBhcnNlTGVuaWVudD1uZXcgUmVnRXhwKHRoaXMuX29yZGluYWxQYXJzZS5zb3VyY2UrXCJ8XCIrL1xcZHsxLDJ9Ly5zb3VyY2UpfWZ1bmN0aW9uIEIoYSxiKXt2YXIgYyxlPWooe30sYSk7Zm9yKGMgaW4gYilpKGIsYykmJihkKGFbY10pJiZkKGJbY10pPyhlW2NdPXt9LGooZVtjXSxhW2NdKSxqKGVbY10sYltjXSkpOm51bGwhPWJbY10/ZVtjXT1iW2NdOmRlbGV0ZSBlW2NdKTtmb3IoYyBpbiBhKWkoYSxjKSYmIWkoYixjKSYmZChhW2NdKSYmKFxuLy8gbWFrZSBzdXJlIGNoYW5nZXMgdG8gcHJvcGVydGllcyBkb24ndCBtb2RpZnkgcGFyZW50IGNvbmZpZ1xuZVtjXT1qKHt9LGVbY10pKTtyZXR1cm4gZX1mdW5jdGlvbiBDKGEpe251bGwhPWEmJnRoaXMuc2V0KGEpfWZ1bmN0aW9uIEQoYSxiLGMpe3ZhciBkPXRoaXMuX2NhbGVuZGFyW2FdfHx0aGlzLl9jYWxlbmRhci5zYW1lRWxzZTtyZXR1cm4geihkKT9kLmNhbGwoYixjKTpkfWZ1bmN0aW9uIEUoYSl7dmFyIGI9dGhpcy5fbG9uZ0RhdGVGb3JtYXRbYV0sYz10aGlzLl9sb25nRGF0ZUZvcm1hdFthLnRvVXBwZXJDYXNlKCldO3JldHVybiBifHwhYz9iOih0aGlzLl9sb25nRGF0ZUZvcm1hdFthXT1jLnJlcGxhY2UoL01NTU18TU18RER8ZGRkZC9nLGZ1bmN0aW9uKGEpe3JldHVybiBhLnNsaWNlKDEpfSksdGhpcy5fbG9uZ0RhdGVGb3JtYXRbYV0pfWZ1bmN0aW9uIEYoKXtyZXR1cm4gdGhpcy5faW52YWxpZERhdGV9ZnVuY3Rpb24gRyhhKXtyZXR1cm4gdGhpcy5fb3JkaW5hbC5yZXBsYWNlKFwiJWRcIixhKX1mdW5jdGlvbiBIKGEsYixjLGQpe3ZhciBlPXRoaXMuX3JlbGF0aXZlVGltZVtjXTtyZXR1cm4geihlKT9lKGEsYixjLGQpOmUucmVwbGFjZSgvJWQvaSxhKX1mdW5jdGlvbiBJKGEsYil7dmFyIGM9dGhpcy5fcmVsYXRpdmVUaW1lW2E+MD9cImZ1dHVyZVwiOlwicGFzdFwiXTtyZXR1cm4geihjKT9jKGIpOmMucmVwbGFjZSgvJXMvaSxiKX1mdW5jdGlvbiBKKGEsYil7dmFyIGM9YS50b0xvd2VyQ2FzZSgpO0RkW2NdPURkW2MrXCJzXCJdPURkW2JdPWF9ZnVuY3Rpb24gSyhhKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYT9EZFthXXx8RGRbYS50b0xvd2VyQ2FzZSgpXTp2b2lkIDB9ZnVuY3Rpb24gTChhKXt2YXIgYixjLGQ9e307Zm9yKGMgaW4gYSlpKGEsYykmJihiPUsoYyksYiYmKGRbYl09YVtjXSkpO3JldHVybiBkfWZ1bmN0aW9uIE0oYSxiKXtFZFthXT1ifWZ1bmN0aW9uIE4oYSl7dmFyIGI9W107Zm9yKHZhciBjIGluIGEpYi5wdXNoKHt1bml0OmMscHJpb3JpdHk6RWRbY119KTtyZXR1cm4gYi5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGEucHJpb3JpdHktYi5wcmlvcml0eX0pLGJ9ZnVuY3Rpb24gTyhiLGMpe3JldHVybiBmdW5jdGlvbihkKXtyZXR1cm4gbnVsbCE9ZD8oUSh0aGlzLGIsZCksYS51cGRhdGVPZmZzZXQodGhpcyxjKSx0aGlzKTpQKHRoaXMsYil9fWZ1bmN0aW9uIFAoYSxiKXtyZXR1cm4gYS5pc1ZhbGlkKCk/YS5fZFtcImdldFwiKyhhLl9pc1VUQz9cIlVUQ1wiOlwiXCIpK2JdKCk6TmFOfWZ1bmN0aW9uIFEoYSxiLGMpe2EuaXNWYWxpZCgpJiZhLl9kW1wic2V0XCIrKGEuX2lzVVRDP1wiVVRDXCI6XCJcIikrYl0oYyl9XG4vLyBNT01FTlRTXG5mdW5jdGlvbiBSKGEpe3JldHVybiBhPUsoYSkseih0aGlzW2FdKT90aGlzW2FdKCk6dGhpc31mdW5jdGlvbiBTKGEsYil7aWYoXCJvYmplY3RcIj09dHlwZW9mIGEpe2E9TChhKTtmb3IodmFyIGM9TihhKSxkPTA7ZDxjLmxlbmd0aDtkKyspdGhpc1tjW2RdLnVuaXRdKGFbY1tkXS51bml0XSl9ZWxzZSBpZihhPUsoYSkseih0aGlzW2FdKSlyZXR1cm4gdGhpc1thXShiKTtyZXR1cm4gdGhpc31mdW5jdGlvbiBUKGEsYixjKXt2YXIgZD1cIlwiK01hdGguYWJzKGEpLGU9Yi1kLmxlbmd0aCxmPWE+PTA7cmV0dXJuKGY/Yz9cIitcIjpcIlwiOlwiLVwiKStNYXRoLnBvdygxMCxNYXRoLm1heCgwLGUpKS50b1N0cmluZygpLnN1YnN0cigxKStkfVxuLy8gdG9rZW46ICAgICdNJ1xuLy8gcGFkZGVkOiAgIFsnTU0nLCAyXVxuLy8gb3JkaW5hbDogICdNbydcbi8vIGNhbGxiYWNrOiBmdW5jdGlvbiAoKSB7IHRoaXMubW9udGgoKSArIDEgfVxuZnVuY3Rpb24gVShhLGIsYyxkKXt2YXIgZT1kO1wic3RyaW5nXCI9PXR5cGVvZiBkJiYoZT1mdW5jdGlvbigpe3JldHVybiB0aGlzW2RdKCl9KSxhJiYoSWRbYV09ZSksYiYmKElkW2JbMF1dPWZ1bmN0aW9uKCl7cmV0dXJuIFQoZS5hcHBseSh0aGlzLGFyZ3VtZW50cyksYlsxXSxiWzJdKX0pLGMmJihJZFtjXT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS5vcmRpbmFsKGUuYXBwbHkodGhpcyxhcmd1bWVudHMpLGEpfSl9ZnVuY3Rpb24gVihhKXtyZXR1cm4gYS5tYXRjaCgvXFxbW1xcc1xcU10vKT9hLnJlcGxhY2UoL15cXFt8XFxdJC9nLFwiXCIpOmEucmVwbGFjZSgvXFxcXC9nLFwiXCIpfWZ1bmN0aW9uIFcoYSl7dmFyIGIsYyxkPWEubWF0Y2goRmQpO2ZvcihiPTAsYz1kLmxlbmd0aDtiPGM7YisrKUlkW2RbYl1dP2RbYl09SWRbZFtiXV06ZFtiXT1WKGRbYl0pO3JldHVybiBmdW5jdGlvbihiKXt2YXIgZSxmPVwiXCI7Zm9yKGU9MDtlPGM7ZSsrKWYrPWRbZV1pbnN0YW5jZW9mIEZ1bmN0aW9uP2RbZV0uY2FsbChiLGEpOmRbZV07cmV0dXJuIGZ9fVxuLy8gZm9ybWF0IGRhdGUgdXNpbmcgbmF0aXZlIGRhdGUgb2JqZWN0XG5mdW5jdGlvbiBYKGEsYil7cmV0dXJuIGEuaXNWYWxpZCgpPyhiPVkoYixhLmxvY2FsZURhdGEoKSksSGRbYl09SGRbYl18fFcoYiksSGRbYl0oYSkpOmEubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCl9ZnVuY3Rpb24gWShhLGIpe2Z1bmN0aW9uIGMoYSl7cmV0dXJuIGIubG9uZ0RhdGVGb3JtYXQoYSl8fGF9dmFyIGQ9NTtmb3IoR2QubGFzdEluZGV4PTA7ZD49MCYmR2QudGVzdChhKTspYT1hLnJlcGxhY2UoR2QsYyksR2QubGFzdEluZGV4PTAsZC09MTtyZXR1cm4gYX1mdW5jdGlvbiBaKGEsYixjKXskZFthXT16KGIpP2I6ZnVuY3Rpb24oYSxkKXtyZXR1cm4gYSYmYz9jOmJ9fWZ1bmN0aW9uICQoYSxiKXtyZXR1cm4gaSgkZCxhKT8kZFthXShiLl9zdHJpY3QsYi5fbG9jYWxlKTpuZXcgUmVnRXhwKF8oYSkpfVxuLy8gQ29kZSBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzU2MTQ5My9pcy10aGVyZS1hLXJlZ2V4cC1lc2NhcGUtZnVuY3Rpb24taW4tamF2YXNjcmlwdFxuZnVuY3Rpb24gXyhhKXtyZXR1cm4gYWEoYS5yZXBsYWNlKFwiXFxcXFwiLFwiXCIpLnJlcGxhY2UoL1xcXFwoXFxbKXxcXFxcKFxcXSl8XFxbKFteXFxdXFxbXSopXFxdfFxcXFwoLikvZyxmdW5jdGlvbihhLGIsYyxkLGUpe3JldHVybiBifHxjfHxkfHxlfSkpfWZ1bmN0aW9uIGFhKGEpe3JldHVybiBhLnJlcGxhY2UoL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZyxcIlxcXFwkJlwiKX1mdW5jdGlvbiBiYShhLGIpe3ZhciBjLGQ9Yjtmb3IoXCJzdHJpbmdcIj09dHlwZW9mIGEmJihhPVthXSksZihiKSYmKGQ9ZnVuY3Rpb24oYSxjKXtjW2JdPXUoYSl9KSxjPTA7YzxhLmxlbmd0aDtjKyspX2RbYVtjXV09ZH1mdW5jdGlvbiBjYShhLGIpe2JhKGEsZnVuY3Rpb24oYSxjLGQsZSl7ZC5fdz1kLl93fHx7fSxiKGEsZC5fdyxkLGUpfSl9ZnVuY3Rpb24gZGEoYSxiLGMpe251bGwhPWImJmkoX2QsYSkmJl9kW2FdKGIsYy5fYSxjLGEpfWZ1bmN0aW9uIGVhKGEsYil7cmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKGEsYisxLDApKS5nZXRVVENEYXRlKCl9ZnVuY3Rpb24gZmEoYSxiKXtyZXR1cm4gYT9jKHRoaXMuX21vbnRocyk/dGhpcy5fbW9udGhzW2EubW9udGgoKV06dGhpcy5fbW9udGhzWyh0aGlzLl9tb250aHMuaXNGb3JtYXR8fGtlKS50ZXN0KGIpP1wiZm9ybWF0XCI6XCJzdGFuZGFsb25lXCJdW2EubW9udGgoKV06dGhpcy5fbW9udGhzfWZ1bmN0aW9uIGdhKGEsYil7cmV0dXJuIGE/Yyh0aGlzLl9tb250aHNTaG9ydCk/dGhpcy5fbW9udGhzU2hvcnRbYS5tb250aCgpXTp0aGlzLl9tb250aHNTaG9ydFtrZS50ZXN0KGIpP1wiZm9ybWF0XCI6XCJzdGFuZGFsb25lXCJdW2EubW9udGgoKV06dGhpcy5fbW9udGhzU2hvcnR9ZnVuY3Rpb24gaGEoYSxiLGMpe3ZhciBkLGUsZixnPWEudG9Mb2NhbGVMb3dlckNhc2UoKTtpZighdGhpcy5fbW9udGhzUGFyc2UpZm9yKFxuLy8gdGhpcyBpcyBub3QgdXNlZFxudGhpcy5fbW9udGhzUGFyc2U9W10sdGhpcy5fbG9uZ01vbnRoc1BhcnNlPVtdLHRoaXMuX3Nob3J0TW9udGhzUGFyc2U9W10sZD0wO2Q8MTI7KytkKWY9ayhbMmUzLGRdKSx0aGlzLl9zaG9ydE1vbnRoc1BhcnNlW2RdPXRoaXMubW9udGhzU2hvcnQoZixcIlwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpLHRoaXMuX2xvbmdNb250aHNQYXJzZVtkXT10aGlzLm1vbnRocyhmLFwiXCIpLnRvTG9jYWxlTG93ZXJDYXNlKCk7cmV0dXJuIGM/XCJNTU1cIj09PWI/KGU9amUuY2FsbCh0aGlzLl9zaG9ydE1vbnRoc1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpOihlPWplLmNhbGwodGhpcy5fbG9uZ01vbnRoc1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpOlwiTU1NXCI9PT1iPyhlPWplLmNhbGwodGhpcy5fc2hvcnRNb250aHNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX2xvbmdNb250aHNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKSk6KGU9amUuY2FsbCh0aGlzLl9sb25nTW9udGhzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl9zaG9ydE1vbnRoc1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpKX1mdW5jdGlvbiBpYShhLGIsYyl7dmFyIGQsZSxmO2lmKHRoaXMuX21vbnRoc1BhcnNlRXhhY3QpcmV0dXJuIGhhLmNhbGwodGhpcyxhLGIsYyk7XG4vLyBUT0RPOiBhZGQgc29ydGluZ1xuLy8gU29ydGluZyBtYWtlcyBzdXJlIGlmIG9uZSBtb250aCAob3IgYWJicikgaXMgYSBwcmVmaXggb2YgYW5vdGhlclxuLy8gc2VlIHNvcnRpbmcgaW4gY29tcHV0ZU1vbnRoc1BhcnNlXG5mb3IodGhpcy5fbW9udGhzUGFyc2V8fCh0aGlzLl9tb250aHNQYXJzZT1bXSx0aGlzLl9sb25nTW9udGhzUGFyc2U9W10sdGhpcy5fc2hvcnRNb250aHNQYXJzZT1bXSksZD0wO2Q8MTI7ZCsrKXtcbi8vIHRlc3QgdGhlIHJlZ2V4XG5pZihcbi8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuZT1rKFsyZTMsZF0pLGMmJiF0aGlzLl9sb25nTW9udGhzUGFyc2VbZF0mJih0aGlzLl9sb25nTW9udGhzUGFyc2VbZF09bmV3IFJlZ0V4cChcIl5cIit0aGlzLm1vbnRocyhlLFwiXCIpLnJlcGxhY2UoXCIuXCIsXCJcIikrXCIkXCIsXCJpXCIpLHRoaXMuX3Nob3J0TW9udGhzUGFyc2VbZF09bmV3IFJlZ0V4cChcIl5cIit0aGlzLm1vbnRoc1Nob3J0KGUsXCJcIikucmVwbGFjZShcIi5cIixcIlwiKStcIiRcIixcImlcIikpLGN8fHRoaXMuX21vbnRoc1BhcnNlW2RdfHwoZj1cIl5cIit0aGlzLm1vbnRocyhlLFwiXCIpK1wifF5cIit0aGlzLm1vbnRoc1Nob3J0KGUsXCJcIiksdGhpcy5fbW9udGhzUGFyc2VbZF09bmV3IFJlZ0V4cChmLnJlcGxhY2UoXCIuXCIsXCJcIiksXCJpXCIpKSxjJiZcIk1NTU1cIj09PWImJnRoaXMuX2xvbmdNb250aHNQYXJzZVtkXS50ZXN0KGEpKXJldHVybiBkO2lmKGMmJlwiTU1NXCI9PT1iJiZ0aGlzLl9zaG9ydE1vbnRoc1BhcnNlW2RdLnRlc3QoYSkpcmV0dXJuIGQ7aWYoIWMmJnRoaXMuX21vbnRoc1BhcnNlW2RdLnRlc3QoYSkpcmV0dXJuIGR9fVxuLy8gTU9NRU5UU1xuZnVuY3Rpb24gamEoYSxiKXt2YXIgYztpZighYS5pc1ZhbGlkKCkpXG4vLyBObyBvcFxucmV0dXJuIGE7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGIpaWYoL15cXGQrJC8udGVzdChiKSliPXUoYik7ZWxzZVxuLy8gVE9ETzogQW5vdGhlciBzaWxlbnQgZmFpbHVyZT9cbmlmKGI9YS5sb2NhbGVEYXRhKCkubW9udGhzUGFyc2UoYiksIWYoYikpcmV0dXJuIGE7cmV0dXJuIGM9TWF0aC5taW4oYS5kYXRlKCksZWEoYS55ZWFyKCksYikpLGEuX2RbXCJzZXRcIisoYS5faXNVVEM/XCJVVENcIjpcIlwiKStcIk1vbnRoXCJdKGIsYyksYX1mdW5jdGlvbiBrYShiKXtyZXR1cm4gbnVsbCE9Yj8oamEodGhpcyxiKSxhLnVwZGF0ZU9mZnNldCh0aGlzLCEwKSx0aGlzKTpQKHRoaXMsXCJNb250aFwiKX1mdW5jdGlvbiBsYSgpe3JldHVybiBlYSh0aGlzLnllYXIoKSx0aGlzLm1vbnRoKCkpfWZ1bmN0aW9uIG1hKGEpe3JldHVybiB0aGlzLl9tb250aHNQYXJzZUV4YWN0PyhpKHRoaXMsXCJfbW9udGhzUmVnZXhcIil8fG9hLmNhbGwodGhpcyksYT90aGlzLl9tb250aHNTaG9ydFN0cmljdFJlZ2V4OnRoaXMuX21vbnRoc1Nob3J0UmVnZXgpOihpKHRoaXMsXCJfbW9udGhzU2hvcnRSZWdleFwiKXx8KHRoaXMuX21vbnRoc1Nob3J0UmVnZXg9bmUpLHRoaXMuX21vbnRoc1Nob3J0U3RyaWN0UmVnZXgmJmE/dGhpcy5fbW9udGhzU2hvcnRTdHJpY3RSZWdleDp0aGlzLl9tb250aHNTaG9ydFJlZ2V4KX1mdW5jdGlvbiBuYShhKXtyZXR1cm4gdGhpcy5fbW9udGhzUGFyc2VFeGFjdD8oaSh0aGlzLFwiX21vbnRoc1JlZ2V4XCIpfHxvYS5jYWxsKHRoaXMpLGE/dGhpcy5fbW9udGhzU3RyaWN0UmVnZXg6dGhpcy5fbW9udGhzUmVnZXgpOihpKHRoaXMsXCJfbW9udGhzUmVnZXhcIil8fCh0aGlzLl9tb250aHNSZWdleD1vZSksdGhpcy5fbW9udGhzU3RyaWN0UmVnZXgmJmE/dGhpcy5fbW9udGhzU3RyaWN0UmVnZXg6dGhpcy5fbW9udGhzUmVnZXgpfWZ1bmN0aW9uIG9hKCl7ZnVuY3Rpb24gYShhLGIpe3JldHVybiBiLmxlbmd0aC1hLmxlbmd0aH12YXIgYixjLGQ9W10sZT1bXSxmPVtdO2ZvcihiPTA7YjwxMjtiKyspXG4vLyBtYWtlIHRoZSByZWdleCBpZiB3ZSBkb24ndCBoYXZlIGl0IGFscmVhZHlcbmM9ayhbMmUzLGJdKSxkLnB1c2godGhpcy5tb250aHNTaG9ydChjLFwiXCIpKSxlLnB1c2godGhpcy5tb250aHMoYyxcIlwiKSksZi5wdXNoKHRoaXMubW9udGhzKGMsXCJcIikpLGYucHVzaCh0aGlzLm1vbnRoc1Nob3J0KGMsXCJcIikpO2Zvcihcbi8vIFNvcnRpbmcgbWFrZXMgc3VyZSBpZiBvbmUgbW9udGggKG9yIGFiYnIpIGlzIGEgcHJlZml4IG9mIGFub3RoZXIgaXRcbi8vIHdpbGwgbWF0Y2ggdGhlIGxvbmdlciBwaWVjZS5cbmQuc29ydChhKSxlLnNvcnQoYSksZi5zb3J0KGEpLGI9MDtiPDEyO2IrKylkW2JdPWFhKGRbYl0pLGVbYl09YWEoZVtiXSk7Zm9yKGI9MDtiPDI0O2IrKylmW2JdPWFhKGZbYl0pO3RoaXMuX21vbnRoc1JlZ2V4PW5ldyBSZWdFeHAoXCJeKFwiK2Yuam9pbihcInxcIikrXCIpXCIsXCJpXCIpLHRoaXMuX21vbnRoc1Nob3J0UmVnZXg9dGhpcy5fbW9udGhzUmVnZXgsdGhpcy5fbW9udGhzU3RyaWN0UmVnZXg9bmV3IFJlZ0V4cChcIl4oXCIrZS5qb2luKFwifFwiKStcIilcIixcImlcIiksdGhpcy5fbW9udGhzU2hvcnRTdHJpY3RSZWdleD1uZXcgUmVnRXhwKFwiXihcIitkLmpvaW4oXCJ8XCIpK1wiKVwiLFwiaVwiKX1cbi8vIEhFTFBFUlNcbmZ1bmN0aW9uIHBhKGEpe3JldHVybiBxYShhKT8zNjY6MzY1fWZ1bmN0aW9uIHFhKGEpe3JldHVybiBhJTQ9PT0wJiZhJTEwMCE9PTB8fGElNDAwPT09MH1mdW5jdGlvbiByYSgpe3JldHVybiBxYSh0aGlzLnllYXIoKSl9ZnVuY3Rpb24gc2EoYSxiLGMsZCxlLGYsZyl7XG4vL2Nhbid0IGp1c3QgYXBwbHkoKSB0byBjcmVhdGUgYSBkYXRlOlxuLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE4MTM0OC9pbnN0YW50aWF0aW5nLWEtamF2YXNjcmlwdC1vYmplY3QtYnktY2FsbGluZy1wcm90b3R5cGUtY29uc3RydWN0b3ItYXBwbHlcbnZhciBoPW5ldyBEYXRlKGEsYixjLGQsZSxmLGcpO1xuLy90aGUgZGF0ZSBjb25zdHJ1Y3RvciByZW1hcHMgeWVhcnMgMC05OSB0byAxOTAwLTE5OTlcbnJldHVybiBhPDEwMCYmYT49MCYmaXNGaW5pdGUoaC5nZXRGdWxsWWVhcigpKSYmaC5zZXRGdWxsWWVhcihhKSxofWZ1bmN0aW9uIHRhKGEpe3ZhciBiPW5ldyBEYXRlKERhdGUuVVRDLmFwcGx5KG51bGwsYXJndW1lbnRzKSk7XG4vL3RoZSBEYXRlLlVUQyBmdW5jdGlvbiByZW1hcHMgeWVhcnMgMC05OSB0byAxOTAwLTE5OTlcbnJldHVybiBhPDEwMCYmYT49MCYmaXNGaW5pdGUoYi5nZXRVVENGdWxsWWVhcigpKSYmYi5zZXRVVENGdWxsWWVhcihhKSxifVxuLy8gc3RhcnQtb2YtZmlyc3Qtd2VlayAtIHN0YXJ0LW9mLXllYXJcbmZ1bmN0aW9uIHVhKGEsYixjKXt2YXIvLyBmaXJzdC13ZWVrIGRheSAtLSB3aGljaCBqYW51YXJ5IGlzIGFsd2F5cyBpbiB0aGUgZmlyc3Qgd2VlayAoNCBmb3IgaXNvLCAxIGZvciBvdGhlcilcbmQ9NytiLWMsXG4vLyBmaXJzdC13ZWVrIGRheSBsb2NhbCB3ZWVrZGF5IC0tIHdoaWNoIGxvY2FsIHdlZWtkYXkgaXMgZndkXG5lPSg3K3RhKGEsMCxkKS5nZXRVVENEYXkoKS1iKSU3O3JldHVybi1lK2QtMX1cbi8vaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlI0NhbGN1bGF0aW5nX2FfZGF0ZV9naXZlbl90aGVfeWVhci4yQ193ZWVrX251bWJlcl9hbmRfd2Vla2RheVxuZnVuY3Rpb24gdmEoYSxiLGMsZCxlKXt2YXIgZixnLGg9KDcrYy1kKSU3LGk9dWEoYSxkLGUpLGo9MSs3KihiLTEpK2graTtyZXR1cm4gajw9MD8oZj1hLTEsZz1wYShmKStqKTpqPnBhKGEpPyhmPWErMSxnPWotcGEoYSkpOihmPWEsZz1qKSx7eWVhcjpmLGRheU9mWWVhcjpnfX1mdW5jdGlvbiB3YShhLGIsYyl7dmFyIGQsZSxmPXVhKGEueWVhcigpLGIsYyksZz1NYXRoLmZsb29yKChhLmRheU9mWWVhcigpLWYtMSkvNykrMTtyZXR1cm4gZzwxPyhlPWEueWVhcigpLTEsZD1nK3hhKGUsYixjKSk6Zz54YShhLnllYXIoKSxiLGMpPyhkPWcteGEoYS55ZWFyKCksYixjKSxlPWEueWVhcigpKzEpOihlPWEueWVhcigpLGQ9Zykse3dlZWs6ZCx5ZWFyOmV9fWZ1bmN0aW9uIHhhKGEsYixjKXt2YXIgZD11YShhLGIsYyksZT11YShhKzEsYixjKTtyZXR1cm4ocGEoYSktZCtlKS83fVxuLy8gSEVMUEVSU1xuLy8gTE9DQUxFU1xuZnVuY3Rpb24geWEoYSl7cmV0dXJuIHdhKGEsdGhpcy5fd2Vlay5kb3csdGhpcy5fd2Vlay5kb3kpLndlZWt9ZnVuY3Rpb24gemEoKXtyZXR1cm4gdGhpcy5fd2Vlay5kb3d9ZnVuY3Rpb24gQWEoKXtyZXR1cm4gdGhpcy5fd2Vlay5kb3l9XG4vLyBNT01FTlRTXG5mdW5jdGlvbiBCYShhKXt2YXIgYj10aGlzLmxvY2FsZURhdGEoKS53ZWVrKHRoaXMpO3JldHVybiBudWxsPT1hP2I6dGhpcy5hZGQoNyooYS1iKSxcImRcIil9ZnVuY3Rpb24gQ2EoYSl7dmFyIGI9d2EodGhpcywxLDQpLndlZWs7cmV0dXJuIG51bGw9PWE/Yjp0aGlzLmFkZCg3KihhLWIpLFwiZFwiKX1cbi8vIEhFTFBFUlNcbmZ1bmN0aW9uIERhKGEsYil7cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGE/YTppc05hTihhKT8oYT1iLndlZWtkYXlzUGFyc2UoYSksXCJudW1iZXJcIj09dHlwZW9mIGE/YTpudWxsKTpwYXJzZUludChhLDEwKX1mdW5jdGlvbiBFYShhLGIpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBhP2Iud2Vla2RheXNQYXJzZShhKSU3fHw3OmlzTmFOKGEpP251bGw6YX1mdW5jdGlvbiBGYShhLGIpe3JldHVybiBhP2ModGhpcy5fd2Vla2RheXMpP3RoaXMuX3dlZWtkYXlzW2EuZGF5KCldOnRoaXMuX3dlZWtkYXlzW3RoaXMuX3dlZWtkYXlzLmlzRm9ybWF0LnRlc3QoYik/XCJmb3JtYXRcIjpcInN0YW5kYWxvbmVcIl1bYS5kYXkoKV06dGhpcy5fd2Vla2RheXN9ZnVuY3Rpb24gR2EoYSl7cmV0dXJuIGE/dGhpcy5fd2Vla2RheXNTaG9ydFthLmRheSgpXTp0aGlzLl93ZWVrZGF5c1Nob3J0fWZ1bmN0aW9uIEhhKGEpe3JldHVybiBhP3RoaXMuX3dlZWtkYXlzTWluW2EuZGF5KCldOnRoaXMuX3dlZWtkYXlzTWlufWZ1bmN0aW9uIElhKGEsYixjKXt2YXIgZCxlLGYsZz1hLnRvTG9jYWxlTG93ZXJDYXNlKCk7aWYoIXRoaXMuX3dlZWtkYXlzUGFyc2UpZm9yKHRoaXMuX3dlZWtkYXlzUGFyc2U9W10sdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlPVtdLHRoaXMuX21pbldlZWtkYXlzUGFyc2U9W10sZD0wO2Q8NzsrK2QpZj1rKFsyZTMsMV0pLmRheShkKSx0aGlzLl9taW5XZWVrZGF5c1BhcnNlW2RdPXRoaXMud2Vla2RheXNNaW4oZixcIlwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpLHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZVtkXT10aGlzLndlZWtkYXlzU2hvcnQoZixcIlwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpLHRoaXMuX3dlZWtkYXlzUGFyc2VbZF09dGhpcy53ZWVrZGF5cyhmLFwiXCIpLnRvTG9jYWxlTG93ZXJDYXNlKCk7cmV0dXJuIGM/XCJkZGRkXCI9PT1iPyhlPWplLmNhbGwodGhpcy5fd2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKTpcImRkZFwiPT09Yj8oZT1qZS5jYWxsKHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKTooZT1qZS5jYWxsKHRoaXMuX21pbldlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCk6XCJkZGRkXCI9PT1iPyhlPWplLmNhbGwodGhpcy5fd2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX21pbldlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCkpKTpcImRkZFwiPT09Yj8oZT1qZS5jYWxsKHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX3dlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl9taW5XZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpKSk6KGU9amUuY2FsbCh0aGlzLl9taW5XZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fd2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKSkpfWZ1bmN0aW9uIEphKGEsYixjKXt2YXIgZCxlLGY7aWYodGhpcy5fd2Vla2RheXNQYXJzZUV4YWN0KXJldHVybiBJYS5jYWxsKHRoaXMsYSxiLGMpO2Zvcih0aGlzLl93ZWVrZGF5c1BhcnNlfHwodGhpcy5fd2Vla2RheXNQYXJzZT1bXSx0aGlzLl9taW5XZWVrZGF5c1BhcnNlPVtdLHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZT1bXSx0aGlzLl9mdWxsV2Vla2RheXNQYXJzZT1bXSksZD0wO2Q8NztkKyspe1xuLy8gdGVzdCB0aGUgcmVnZXhcbmlmKFxuLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG5lPWsoWzJlMywxXSkuZGF5KGQpLGMmJiF0aGlzLl9mdWxsV2Vla2RheXNQYXJzZVtkXSYmKHRoaXMuX2Z1bGxXZWVrZGF5c1BhcnNlW2RdPW5ldyBSZWdFeHAoXCJeXCIrdGhpcy53ZWVrZGF5cyhlLFwiXCIpLnJlcGxhY2UoXCIuXCIsXCIuP1wiKStcIiRcIixcImlcIiksdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlW2RdPW5ldyBSZWdFeHAoXCJeXCIrdGhpcy53ZWVrZGF5c1Nob3J0KGUsXCJcIikucmVwbGFjZShcIi5cIixcIi4/XCIpK1wiJFwiLFwiaVwiKSx0aGlzLl9taW5XZWVrZGF5c1BhcnNlW2RdPW5ldyBSZWdFeHAoXCJeXCIrdGhpcy53ZWVrZGF5c01pbihlLFwiXCIpLnJlcGxhY2UoXCIuXCIsXCIuP1wiKStcIiRcIixcImlcIikpLHRoaXMuX3dlZWtkYXlzUGFyc2VbZF18fChmPVwiXlwiK3RoaXMud2Vla2RheXMoZSxcIlwiKStcInxeXCIrdGhpcy53ZWVrZGF5c1Nob3J0KGUsXCJcIikrXCJ8XlwiK3RoaXMud2Vla2RheXNNaW4oZSxcIlwiKSx0aGlzLl93ZWVrZGF5c1BhcnNlW2RdPW5ldyBSZWdFeHAoZi5yZXBsYWNlKFwiLlwiLFwiXCIpLFwiaVwiKSksYyYmXCJkZGRkXCI9PT1iJiZ0aGlzLl9mdWxsV2Vla2RheXNQYXJzZVtkXS50ZXN0KGEpKXJldHVybiBkO2lmKGMmJlwiZGRkXCI9PT1iJiZ0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2VbZF0udGVzdChhKSlyZXR1cm4gZDtpZihjJiZcImRkXCI9PT1iJiZ0aGlzLl9taW5XZWVrZGF5c1BhcnNlW2RdLnRlc3QoYSkpcmV0dXJuIGQ7aWYoIWMmJnRoaXMuX3dlZWtkYXlzUGFyc2VbZF0udGVzdChhKSlyZXR1cm4gZH19XG4vLyBNT01FTlRTXG5mdW5jdGlvbiBLYShhKXtpZighdGhpcy5pc1ZhbGlkKCkpcmV0dXJuIG51bGwhPWE/dGhpczpOYU47dmFyIGI9dGhpcy5faXNVVEM/dGhpcy5fZC5nZXRVVENEYXkoKTp0aGlzLl9kLmdldERheSgpO3JldHVybiBudWxsIT1hPyhhPURhKGEsdGhpcy5sb2NhbGVEYXRhKCkpLHRoaXMuYWRkKGEtYixcImRcIikpOmJ9ZnVuY3Rpb24gTGEoYSl7aWYoIXRoaXMuaXNWYWxpZCgpKXJldHVybiBudWxsIT1hP3RoaXM6TmFOO3ZhciBiPSh0aGlzLmRheSgpKzctdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWsuZG93KSU3O3JldHVybiBudWxsPT1hP2I6dGhpcy5hZGQoYS1iLFwiZFwiKX1mdW5jdGlvbiBNYShhKXtpZighdGhpcy5pc1ZhbGlkKCkpcmV0dXJuIG51bGwhPWE/dGhpczpOYU47XG4vLyBiZWhhdmVzIHRoZSBzYW1lIGFzIG1vbWVudCNkYXkgZXhjZXB0XG4vLyBhcyBhIGdldHRlciwgcmV0dXJucyA3IGluc3RlYWQgb2YgMCAoMS03IHJhbmdlIGluc3RlYWQgb2YgMC02KVxuLy8gYXMgYSBzZXR0ZXIsIHN1bmRheSBzaG91bGQgYmVsb25nIHRvIHRoZSBwcmV2aW91cyB3ZWVrLlxuaWYobnVsbCE9YSl7dmFyIGI9RWEoYSx0aGlzLmxvY2FsZURhdGEoKSk7cmV0dXJuIHRoaXMuZGF5KHRoaXMuZGF5KCklNz9iOmItNyl9cmV0dXJuIHRoaXMuZGF5KCl8fDd9ZnVuY3Rpb24gTmEoYSl7cmV0dXJuIHRoaXMuX3dlZWtkYXlzUGFyc2VFeGFjdD8oaSh0aGlzLFwiX3dlZWtkYXlzUmVnZXhcIil8fFFhLmNhbGwodGhpcyksYT90aGlzLl93ZWVrZGF5c1N0cmljdFJlZ2V4OnRoaXMuX3dlZWtkYXlzUmVnZXgpOihpKHRoaXMsXCJfd2Vla2RheXNSZWdleFwiKXx8KHRoaXMuX3dlZWtkYXlzUmVnZXg9dWUpLHRoaXMuX3dlZWtkYXlzU3RyaWN0UmVnZXgmJmE/dGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleDp0aGlzLl93ZWVrZGF5c1JlZ2V4KX1mdW5jdGlvbiBPYShhKXtyZXR1cm4gdGhpcy5fd2Vla2RheXNQYXJzZUV4YWN0PyhpKHRoaXMsXCJfd2Vla2RheXNSZWdleFwiKXx8UWEuY2FsbCh0aGlzKSxhP3RoaXMuX3dlZWtkYXlzU2hvcnRTdHJpY3RSZWdleDp0aGlzLl93ZWVrZGF5c1Nob3J0UmVnZXgpOihpKHRoaXMsXCJfd2Vla2RheXNTaG9ydFJlZ2V4XCIpfHwodGhpcy5fd2Vla2RheXNTaG9ydFJlZ2V4PXZlKSx0aGlzLl93ZWVrZGF5c1Nob3J0U3RyaWN0UmVnZXgmJmE/dGhpcy5fd2Vla2RheXNTaG9ydFN0cmljdFJlZ2V4OnRoaXMuX3dlZWtkYXlzU2hvcnRSZWdleCl9ZnVuY3Rpb24gUGEoYSl7cmV0dXJuIHRoaXMuX3dlZWtkYXlzUGFyc2VFeGFjdD8oaSh0aGlzLFwiX3dlZWtkYXlzUmVnZXhcIil8fFFhLmNhbGwodGhpcyksYT90aGlzLl93ZWVrZGF5c01pblN0cmljdFJlZ2V4OnRoaXMuX3dlZWtkYXlzTWluUmVnZXgpOihpKHRoaXMsXCJfd2Vla2RheXNNaW5SZWdleFwiKXx8KHRoaXMuX3dlZWtkYXlzTWluUmVnZXg9d2UpLHRoaXMuX3dlZWtkYXlzTWluU3RyaWN0UmVnZXgmJmE/dGhpcy5fd2Vla2RheXNNaW5TdHJpY3RSZWdleDp0aGlzLl93ZWVrZGF5c01pblJlZ2V4KX1mdW5jdGlvbiBRYSgpe2Z1bmN0aW9uIGEoYSxiKXtyZXR1cm4gYi5sZW5ndGgtYS5sZW5ndGh9dmFyIGIsYyxkLGUsZixnPVtdLGg9W10saT1bXSxqPVtdO2ZvcihiPTA7Yjw3O2IrKylcbi8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuYz1rKFsyZTMsMV0pLmRheShiKSxkPXRoaXMud2Vla2RheXNNaW4oYyxcIlwiKSxlPXRoaXMud2Vla2RheXNTaG9ydChjLFwiXCIpLGY9dGhpcy53ZWVrZGF5cyhjLFwiXCIpLGcucHVzaChkKSxoLnB1c2goZSksaS5wdXNoKGYpLGoucHVzaChkKSxqLnB1c2goZSksai5wdXNoKGYpO2Zvcihcbi8vIFNvcnRpbmcgbWFrZXMgc3VyZSBpZiBvbmUgd2Vla2RheSAob3IgYWJicikgaXMgYSBwcmVmaXggb2YgYW5vdGhlciBpdFxuLy8gd2lsbCBtYXRjaCB0aGUgbG9uZ2VyIHBpZWNlLlxuZy5zb3J0KGEpLGguc29ydChhKSxpLnNvcnQoYSksai5zb3J0KGEpLGI9MDtiPDc7YisrKWhbYl09YWEoaFtiXSksaVtiXT1hYShpW2JdKSxqW2JdPWFhKGpbYl0pO3RoaXMuX3dlZWtkYXlzUmVnZXg9bmV3IFJlZ0V4cChcIl4oXCIrai5qb2luKFwifFwiKStcIilcIixcImlcIiksdGhpcy5fd2Vla2RheXNTaG9ydFJlZ2V4PXRoaXMuX3dlZWtkYXlzUmVnZXgsdGhpcy5fd2Vla2RheXNNaW5SZWdleD10aGlzLl93ZWVrZGF5c1JlZ2V4LHRoaXMuX3dlZWtkYXlzU3RyaWN0UmVnZXg9bmV3IFJlZ0V4cChcIl4oXCIraS5qb2luKFwifFwiKStcIilcIixcImlcIiksdGhpcy5fd2Vla2RheXNTaG9ydFN0cmljdFJlZ2V4PW5ldyBSZWdFeHAoXCJeKFwiK2guam9pbihcInxcIikrXCIpXCIsXCJpXCIpLHRoaXMuX3dlZWtkYXlzTWluU3RyaWN0UmVnZXg9bmV3IFJlZ0V4cChcIl4oXCIrZy5qb2luKFwifFwiKStcIilcIixcImlcIil9XG4vLyBGT1JNQVRUSU5HXG5mdW5jdGlvbiBSYSgpe3JldHVybiB0aGlzLmhvdXJzKCklMTJ8fDEyfWZ1bmN0aW9uIFNhKCl7cmV0dXJuIHRoaXMuaG91cnMoKXx8MjR9ZnVuY3Rpb24gVGEoYSxiKXtVKGEsMCwwLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm1lcmlkaWVtKHRoaXMuaG91cnMoKSx0aGlzLm1pbnV0ZXMoKSxiKX0pfVxuLy8gUEFSU0lOR1xuZnVuY3Rpb24gVWEoYSxiKXtyZXR1cm4gYi5fbWVyaWRpZW1QYXJzZX1cbi8vIExPQ0FMRVNcbmZ1bmN0aW9uIFZhKGEpe1xuLy8gSUU4IFF1aXJrcyBNb2RlICYgSUU3IFN0YW5kYXJkcyBNb2RlIGRvIG5vdCBhbGxvdyBhY2Nlc3Npbmcgc3RyaW5ncyBsaWtlIGFycmF5c1xuLy8gVXNpbmcgY2hhckF0IHNob3VsZCBiZSBtb3JlIGNvbXBhdGlibGUuXG5yZXR1cm5cInBcIj09PShhK1wiXCIpLnRvTG93ZXJDYXNlKCkuY2hhckF0KDApfWZ1bmN0aW9uIFdhKGEsYixjKXtyZXR1cm4gYT4xMT9jP1wicG1cIjpcIlBNXCI6Yz9cImFtXCI6XCJBTVwifWZ1bmN0aW9uIFhhKGEpe3JldHVybiBhP2EudG9Mb3dlckNhc2UoKS5yZXBsYWNlKFwiX1wiLFwiLVwiKTphfVxuLy8gcGljayB0aGUgbG9jYWxlIGZyb20gdGhlIGFycmF5XG4vLyB0cnkgWydlbi1hdScsICdlbi1nYiddIGFzICdlbi1hdScsICdlbi1nYicsICdlbicsIGFzIGluIG1vdmUgdGhyb3VnaCB0aGUgbGlzdCB0cnlpbmcgZWFjaFxuLy8gc3Vic3RyaW5nIGZyb20gbW9zdCBzcGVjaWZpYyB0byBsZWFzdCwgYnV0IG1vdmUgdG8gdGhlIG5leHQgYXJyYXkgaXRlbSBpZiBpdCdzIGEgbW9yZSBzcGVjaWZpYyB2YXJpYW50IHRoYW4gdGhlIGN1cnJlbnQgcm9vdFxuZnVuY3Rpb24gWWEoYSl7Zm9yKHZhciBiLGMsZCxlLGY9MDtmPGEubGVuZ3RoOyl7Zm9yKGU9WGEoYVtmXSkuc3BsaXQoXCItXCIpLGI9ZS5sZW5ndGgsYz1YYShhW2YrMV0pLGM9Yz9jLnNwbGl0KFwiLVwiKTpudWxsO2I+MDspe2lmKGQ9WmEoZS5zbGljZSgwLGIpLmpvaW4oXCItXCIpKSlyZXR1cm4gZDtpZihjJiZjLmxlbmd0aD49YiYmdihlLGMsITApPj1iLTEpXG4vL3RoZSBuZXh0IGFycmF5IGl0ZW0gaXMgYmV0dGVyIHRoYW4gYSBzaGFsbG93ZXIgc3Vic3RyaW5nIG9mIHRoaXMgb25lXG5icmVhaztiLS19ZisrfXJldHVybiBudWxsfWZ1bmN0aW9uIFphKGEpe3ZhciBiPW51bGw7XG4vLyBUT0RPOiBGaW5kIGEgYmV0dGVyIHdheSB0byByZWdpc3RlciBhbmQgbG9hZCBhbGwgdGhlIGxvY2FsZXMgaW4gTm9kZVxuaWYoIUJlW2FdJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUmJm1vZHVsZS5leHBvcnRzKXRyeXtiPXhlLl9hYmJyLHJlcXVpcmUoXCIuL2xvY2FsZS9cIithKSxcbi8vIGJlY2F1c2UgZGVmaW5lTG9jYWxlIGN1cnJlbnRseSBhbHNvIHNldHMgdGhlIGdsb2JhbCBsb2NhbGUsIHdlXG4vLyB3YW50IHRvIHVuZG8gdGhhdCBmb3IgbGF6eSBsb2FkZWQgbG9jYWxlc1xuJGEoYil9Y2F0Y2goYSl7fXJldHVybiBCZVthXX1cbi8vIFRoaXMgZnVuY3Rpb24gd2lsbCBsb2FkIGxvY2FsZSBhbmQgdGhlbiBzZXQgdGhlIGdsb2JhbCBsb2NhbGUuICBJZlxuLy8gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWQgaW4sIGl0IHdpbGwgc2ltcGx5IHJldHVybiB0aGUgY3VycmVudCBnbG9iYWxcbi8vIGxvY2FsZSBrZXkuXG5mdW5jdGlvbiAkYShhLGIpe3ZhciBjO1xuLy8gbW9tZW50LmR1cmF0aW9uLl9sb2NhbGUgPSBtb21lbnQuX2xvY2FsZSA9IGRhdGE7XG5yZXR1cm4gYSYmKGM9cChiKT9iYihhKTpfYShhLGIpLGMmJih4ZT1jKSkseGUuX2FiYnJ9ZnVuY3Rpb24gX2EoYSxiKXtpZihudWxsIT09Yil7dmFyIGM9QWU7aWYoYi5hYmJyPWEsbnVsbCE9QmVbYV0peShcImRlZmluZUxvY2FsZU92ZXJyaWRlXCIsXCJ1c2UgbW9tZW50LnVwZGF0ZUxvY2FsZShsb2NhbGVOYW1lLCBjb25maWcpIHRvIGNoYW5nZSBhbiBleGlzdGluZyBsb2NhbGUuIG1vbWVudC5kZWZpbmVMb2NhbGUobG9jYWxlTmFtZSwgY29uZmlnKSBzaG91bGQgb25seSBiZSB1c2VkIGZvciBjcmVhdGluZyBhIG5ldyBsb2NhbGUgU2VlIGh0dHA6Ly9tb21lbnRqcy5jb20vZ3VpZGVzLyMvd2FybmluZ3MvZGVmaW5lLWxvY2FsZS8gZm9yIG1vcmUgaW5mby5cIiksYz1CZVthXS5fY29uZmlnO2Vsc2UgaWYobnVsbCE9Yi5wYXJlbnRMb2NhbGUpe2lmKG51bGw9PUJlW2IucGFyZW50TG9jYWxlXSlyZXR1cm4gQ2VbYi5wYXJlbnRMb2NhbGVdfHwoQ2VbYi5wYXJlbnRMb2NhbGVdPVtdKSxDZVtiLnBhcmVudExvY2FsZV0ucHVzaCh7bmFtZTphLGNvbmZpZzpifSksbnVsbDtjPUJlW2IucGFyZW50TG9jYWxlXS5fY29uZmlnfVxuLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm93OiBhbHNvIHNldCB0aGUgbG9jYWxlXG4vLyBtYWtlIHN1cmUgd2Ugc2V0IHRoZSBsb2NhbGUgQUZURVIgYWxsIGNoaWxkIGxvY2FsZXMgaGF2ZSBiZWVuXG4vLyBjcmVhdGVkLCBzbyB3ZSB3b24ndCBlbmQgdXAgd2l0aCB0aGUgY2hpbGQgbG9jYWxlIHNldC5cbnJldHVybiBCZVthXT1uZXcgQyhCKGMsYikpLENlW2FdJiZDZVthXS5mb3JFYWNoKGZ1bmN0aW9uKGEpe19hKGEubmFtZSxhLmNvbmZpZyl9KSwkYShhKSxCZVthXX1cbi8vIHVzZWZ1bCBmb3IgdGVzdGluZ1xucmV0dXJuIGRlbGV0ZSBCZVthXSxudWxsfWZ1bmN0aW9uIGFiKGEsYil7aWYobnVsbCE9Yil7dmFyIGMsZD1BZTtcbi8vIE1FUkdFXG5udWxsIT1CZVthXSYmKGQ9QmVbYV0uX2NvbmZpZyksYj1CKGQsYiksYz1uZXcgQyhiKSxjLnBhcmVudExvY2FsZT1CZVthXSxCZVthXT1jLFxuLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm93OiBhbHNvIHNldCB0aGUgbG9jYWxlXG4kYShhKX1lbHNlXG4vLyBwYXNzIG51bGwgZm9yIGNvbmZpZyB0byB1bnVwZGF0ZSwgdXNlZnVsIGZvciB0ZXN0c1xubnVsbCE9QmVbYV0mJihudWxsIT1CZVthXS5wYXJlbnRMb2NhbGU/QmVbYV09QmVbYV0ucGFyZW50TG9jYWxlOm51bGwhPUJlW2FdJiZkZWxldGUgQmVbYV0pO3JldHVybiBCZVthXX1cbi8vIHJldHVybnMgbG9jYWxlIGRhdGFcbmZ1bmN0aW9uIGJiKGEpe3ZhciBiO2lmKGEmJmEuX2xvY2FsZSYmYS5fbG9jYWxlLl9hYmJyJiYoYT1hLl9sb2NhbGUuX2FiYnIpLCFhKXJldHVybiB4ZTtpZighYyhhKSl7aWYoXG4vL3Nob3J0LWNpcmN1aXQgZXZlcnl0aGluZyBlbHNlXG5iPVphKGEpKXJldHVybiBiO2E9W2FdfXJldHVybiBZYShhKX1mdW5jdGlvbiBjYigpe3JldHVybiB3ZChCZSl9ZnVuY3Rpb24gZGIoYSl7dmFyIGIsYz1hLl9hO3JldHVybiBjJiZtKGEpLm92ZXJmbG93PT09LTImJihiPWNbYmVdPDB8fGNbYmVdPjExP2JlOmNbY2VdPDF8fGNbY2VdPmVhKGNbYWVdLGNbYmVdKT9jZTpjW2RlXTwwfHxjW2RlXT4yNHx8MjQ9PT1jW2RlXSYmKDAhPT1jW2VlXXx8MCE9PWNbZmVdfHwwIT09Y1tnZV0pP2RlOmNbZWVdPDB8fGNbZWVdPjU5P2VlOmNbZmVdPDB8fGNbZmVdPjU5P2ZlOmNbZ2VdPDB8fGNbZ2VdPjk5OT9nZTotMSxtKGEpLl9vdmVyZmxvd0RheU9mWWVhciYmKGI8YWV8fGI+Y2UpJiYoYj1jZSksbShhKS5fb3ZlcmZsb3dXZWVrcyYmYj09PS0xJiYoYj1oZSksbShhKS5fb3ZlcmZsb3dXZWVrZGF5JiZiPT09LTEmJihiPWllKSxtKGEpLm92ZXJmbG93PWIpLGF9XG4vLyBkYXRlIGZyb20gaXNvIGZvcm1hdFxuZnVuY3Rpb24gZWIoYSl7dmFyIGIsYyxkLGUsZixnLGg9YS5faSxpPURlLmV4ZWMoaCl8fEVlLmV4ZWMoaCk7aWYoaSl7Zm9yKG0oYSkuaXNvPSEwLGI9MCxjPUdlLmxlbmd0aDtiPGM7YisrKWlmKEdlW2JdWzFdLmV4ZWMoaVsxXSkpe2U9R2VbYl1bMF0sZD1HZVtiXVsyXSE9PSExO2JyZWFrfWlmKG51bGw9PWUpcmV0dXJuIHZvaWQoYS5faXNWYWxpZD0hMSk7aWYoaVszXSl7Zm9yKGI9MCxjPUhlLmxlbmd0aDtiPGM7YisrKWlmKEhlW2JdWzFdLmV4ZWMoaVszXSkpe1xuLy8gbWF0Y2hbMl0gc2hvdWxkIGJlICdUJyBvciBzcGFjZVxuZj0oaVsyXXx8XCIgXCIpK0hlW2JdWzBdO2JyZWFrfWlmKG51bGw9PWYpcmV0dXJuIHZvaWQoYS5faXNWYWxpZD0hMSl9aWYoIWQmJm51bGwhPWYpcmV0dXJuIHZvaWQoYS5faXNWYWxpZD0hMSk7aWYoaVs0XSl7aWYoIUZlLmV4ZWMoaVs0XSkpcmV0dXJuIHZvaWQoYS5faXNWYWxpZD0hMSk7Zz1cIlpcIn1hLl9mPWUrKGZ8fFwiXCIpKyhnfHxcIlwiKSxrYihhKX1lbHNlIGEuX2lzVmFsaWQ9ITF9XG4vLyBkYXRlIGZyb20gaXNvIGZvcm1hdCBvciBmYWxsYmFja1xuZnVuY3Rpb24gZmIoYil7dmFyIGM9SWUuZXhlYyhiLl9pKTtyZXR1cm4gbnVsbCE9PWM/dm9pZChiLl9kPW5ldyBEYXRlKCtjWzFdKSk6KGViKGIpLHZvaWQoYi5faXNWYWxpZD09PSExJiYoZGVsZXRlIGIuX2lzVmFsaWQsYS5jcmVhdGVGcm9tSW5wdXRGYWxsYmFjayhiKSkpKX1cbi8vIFBpY2sgdGhlIGZpcnN0IGRlZmluZWQgb2YgdHdvIG9yIHRocmVlIGFyZ3VtZW50cy5cbmZ1bmN0aW9uIGdiKGEsYixjKXtyZXR1cm4gbnVsbCE9YT9hOm51bGwhPWI/YjpjfWZ1bmN0aW9uIGhiKGIpe1xuLy8gaG9va3MgaXMgYWN0dWFsbHkgdGhlIGV4cG9ydGVkIG1vbWVudCBvYmplY3RcbnZhciBjPW5ldyBEYXRlKGEubm93KCkpO3JldHVybiBiLl91c2VVVEM/W2MuZ2V0VVRDRnVsbFllYXIoKSxjLmdldFVUQ01vbnRoKCksYy5nZXRVVENEYXRlKCldOltjLmdldEZ1bGxZZWFyKCksYy5nZXRNb250aCgpLGMuZ2V0RGF0ZSgpXX1cbi8vIGNvbnZlcnQgYW4gYXJyYXkgdG8gYSBkYXRlLlxuLy8gdGhlIGFycmF5IHNob3VsZCBtaXJyb3IgdGhlIHBhcmFtZXRlcnMgYmVsb3dcbi8vIG5vdGU6IGFsbCB2YWx1ZXMgcGFzdCB0aGUgeWVhciBhcmUgb3B0aW9uYWwgYW5kIHdpbGwgZGVmYXVsdCB0byB0aGUgbG93ZXN0IHBvc3NpYmxlIHZhbHVlLlxuLy8gW3llYXIsIG1vbnRoLCBkYXkgLCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmRdXG5mdW5jdGlvbiBpYihhKXt2YXIgYixjLGQsZSxmPVtdO2lmKCFhLl9kKXtcbi8vIERlZmF1bHQgdG8gY3VycmVudCBkYXRlLlxuLy8gKiBpZiBubyB5ZWFyLCBtb250aCwgZGF5IG9mIG1vbnRoIGFyZSBnaXZlbiwgZGVmYXVsdCB0byB0b2RheVxuLy8gKiBpZiBkYXkgb2YgbW9udGggaXMgZ2l2ZW4sIGRlZmF1bHQgbW9udGggYW5kIHllYXJcbi8vICogaWYgbW9udGggaXMgZ2l2ZW4sIGRlZmF1bHQgb25seSB5ZWFyXG4vLyAqIGlmIHllYXIgaXMgZ2l2ZW4sIGRvbid0IGRlZmF1bHQgYW55dGhpbmdcbmZvcihkPWhiKGEpLFxuLy9jb21wdXRlIGRheSBvZiB0aGUgeWVhciBmcm9tIHdlZWtzIGFuZCB3ZWVrZGF5c1xuYS5fdyYmbnVsbD09YS5fYVtjZV0mJm51bGw9PWEuX2FbYmVdJiZqYihhKSxcbi8vaWYgdGhlIGRheSBvZiB0aGUgeWVhciBpcyBzZXQsIGZpZ3VyZSBvdXQgd2hhdCBpdCBpc1xuYS5fZGF5T2ZZZWFyJiYoZT1nYihhLl9hW2FlXSxkW2FlXSksYS5fZGF5T2ZZZWFyPnBhKGUpJiYobShhKS5fb3ZlcmZsb3dEYXlPZlllYXI9ITApLGM9dGEoZSwwLGEuX2RheU9mWWVhciksYS5fYVtiZV09Yy5nZXRVVENNb250aCgpLGEuX2FbY2VdPWMuZ2V0VVRDRGF0ZSgpKSxiPTA7YjwzJiZudWxsPT1hLl9hW2JdOysrYilhLl9hW2JdPWZbYl09ZFtiXTtcbi8vIFplcm8gb3V0IHdoYXRldmVyIHdhcyBub3QgZGVmYXVsdGVkLCBpbmNsdWRpbmcgdGltZVxuZm9yKDtiPDc7YisrKWEuX2FbYl09ZltiXT1udWxsPT1hLl9hW2JdPzI9PT1iPzE6MDphLl9hW2JdO1xuLy8gQ2hlY2sgZm9yIDI0OjAwOjAwLjAwMFxuMjQ9PT1hLl9hW2RlXSYmMD09PWEuX2FbZWVdJiYwPT09YS5fYVtmZV0mJjA9PT1hLl9hW2dlXSYmKGEuX25leHREYXk9ITAsYS5fYVtkZV09MCksYS5fZD0oYS5fdXNlVVRDP3RhOnNhKS5hcHBseShudWxsLGYpLFxuLy8gQXBwbHkgdGltZXpvbmUgb2Zmc2V0IGZyb20gaW5wdXQuIFRoZSBhY3R1YWwgdXRjT2Zmc2V0IGNhbiBiZSBjaGFuZ2VkXG4vLyB3aXRoIHBhcnNlWm9uZS5cbm51bGwhPWEuX3R6bSYmYS5fZC5zZXRVVENNaW51dGVzKGEuX2QuZ2V0VVRDTWludXRlcygpLWEuX3R6bSksYS5fbmV4dERheSYmKGEuX2FbZGVdPTI0KX19ZnVuY3Rpb24gamIoYSl7dmFyIGIsYyxkLGUsZixnLGgsaTtpZihiPWEuX3csbnVsbCE9Yi5HR3x8bnVsbCE9Yi5XfHxudWxsIT1iLkUpZj0xLGc9NCxcbi8vIFRPRE86IFdlIG5lZWQgdG8gdGFrZSB0aGUgY3VycmVudCBpc29XZWVrWWVhciwgYnV0IHRoYXQgZGVwZW5kcyBvblxuLy8gaG93IHdlIGludGVycHJldCBub3cgKGxvY2FsLCB1dGMsIGZpeGVkIG9mZnNldCkuIFNvIGNyZWF0ZVxuLy8gYSBub3cgdmVyc2lvbiBvZiBjdXJyZW50IGNvbmZpZyAodGFrZSBsb2NhbC91dGMvb2Zmc2V0IGZsYWdzLCBhbmRcbi8vIGNyZWF0ZSBub3cpLlxuYz1nYihiLkdHLGEuX2FbYWVdLHdhKHNiKCksMSw0KS55ZWFyKSxkPWdiKGIuVywxKSxlPWdiKGIuRSwxKSwoZTwxfHxlPjcpJiYoaT0hMCk7ZWxzZXtmPWEuX2xvY2FsZS5fd2Vlay5kb3csZz1hLl9sb2NhbGUuX3dlZWsuZG95O3ZhciBqPXdhKHNiKCksZixnKTtjPWdiKGIuZ2csYS5fYVthZV0sai55ZWFyKSxcbi8vIERlZmF1bHQgdG8gY3VycmVudCB3ZWVrLlxuZD1nYihiLncsai53ZWVrKSxudWxsIT1iLmQ/KFxuLy8gd2Vla2RheSAtLSBsb3cgZGF5IG51bWJlcnMgYXJlIGNvbnNpZGVyZWQgbmV4dCB3ZWVrXG5lPWIuZCwoZTwwfHxlPjYpJiYoaT0hMCkpOm51bGwhPWIuZT8oXG4vLyBsb2NhbCB3ZWVrZGF5IC0tIGNvdW50aW5nIHN0YXJ0cyBmcm9tIGJlZ2luaW5nIG9mIHdlZWtcbmU9Yi5lK2YsKGIuZTwwfHxiLmU+NikmJihpPSEwKSk6XG4vLyBkZWZhdWx0IHRvIGJlZ2luaW5nIG9mIHdlZWtcbmU9Zn1kPDF8fGQ+eGEoYyxmLGcpP20oYSkuX292ZXJmbG93V2Vla3M9ITA6bnVsbCE9aT9tKGEpLl9vdmVyZmxvd1dlZWtkYXk9ITA6KGg9dmEoYyxkLGUsZixnKSxhLl9hW2FlXT1oLnllYXIsYS5fZGF5T2ZZZWFyPWguZGF5T2ZZZWFyKX1cbi8vIGRhdGUgZnJvbSBzdHJpbmcgYW5kIGZvcm1hdCBzdHJpbmdcbmZ1bmN0aW9uIGtiKGIpe1xuLy8gVE9ETzogTW92ZSB0aGlzIHRvIGFub3RoZXIgcGFydCBvZiB0aGUgY3JlYXRpb24gZmxvdyB0byBwcmV2ZW50IGNpcmN1bGFyIGRlcHNcbmlmKGIuX2Y9PT1hLklTT184NjAxKXJldHVybiB2b2lkIGViKGIpO2IuX2E9W10sbShiKS5lbXB0eT0hMDtcbi8vIFRoaXMgYXJyYXkgaXMgdXNlZCB0byBtYWtlIGEgRGF0ZSwgZWl0aGVyIHdpdGggYG5ldyBEYXRlYCBvciBgRGF0ZS5VVENgXG52YXIgYyxkLGUsZixnLGg9XCJcIitiLl9pLGk9aC5sZW5ndGgsaj0wO2ZvcihlPVkoYi5fZixiLl9sb2NhbGUpLm1hdGNoKEZkKXx8W10sYz0wO2M8ZS5sZW5ndGg7YysrKWY9ZVtjXSxkPShoLm1hdGNoKCQoZixiKSl8fFtdKVswXSxcbi8vIGNvbnNvbGUubG9nKCd0b2tlbicsIHRva2VuLCAncGFyc2VkSW5wdXQnLCBwYXJzZWRJbnB1dCxcbi8vICAgICAgICAgJ3JlZ2V4JywgZ2V0UGFyc2VSZWdleEZvclRva2VuKHRva2VuLCBjb25maWcpKTtcbmQmJihnPWguc3Vic3RyKDAsaC5pbmRleE9mKGQpKSxnLmxlbmd0aD4wJiZtKGIpLnVudXNlZElucHV0LnB1c2goZyksaD1oLnNsaWNlKGguaW5kZXhPZihkKStkLmxlbmd0aCksais9ZC5sZW5ndGgpLFxuLy8gZG9uJ3QgcGFyc2UgaWYgaXQncyBub3QgYSBrbm93biB0b2tlblxuSWRbZl0/KGQ/bShiKS5lbXB0eT0hMTptKGIpLnVudXNlZFRva2Vucy5wdXNoKGYpLGRhKGYsZCxiKSk6Yi5fc3RyaWN0JiYhZCYmbShiKS51bnVzZWRUb2tlbnMucHVzaChmKTtcbi8vIGFkZCByZW1haW5pbmcgdW5wYXJzZWQgaW5wdXQgbGVuZ3RoIHRvIHRoZSBzdHJpbmdcbm0oYikuY2hhcnNMZWZ0T3Zlcj1pLWosaC5sZW5ndGg+MCYmbShiKS51bnVzZWRJbnB1dC5wdXNoKGgpLFxuLy8gY2xlYXIgXzEyaCBmbGFnIGlmIGhvdXIgaXMgPD0gMTJcbmIuX2FbZGVdPD0xMiYmbShiKS5iaWdIb3VyPT09ITAmJmIuX2FbZGVdPjAmJihtKGIpLmJpZ0hvdXI9dm9pZCAwKSxtKGIpLnBhcnNlZERhdGVQYXJ0cz1iLl9hLnNsaWNlKDApLG0oYikubWVyaWRpZW09Yi5fbWVyaWRpZW0sXG4vLyBoYW5kbGUgbWVyaWRpZW1cbmIuX2FbZGVdPWxiKGIuX2xvY2FsZSxiLl9hW2RlXSxiLl9tZXJpZGllbSksaWIoYiksZGIoYil9ZnVuY3Rpb24gbGIoYSxiLGMpe3ZhciBkO1xuLy8gRmFsbGJhY2tcbnJldHVybiBudWxsPT1jP2I6bnVsbCE9YS5tZXJpZGllbUhvdXI/YS5tZXJpZGllbUhvdXIoYixjKTpudWxsIT1hLmlzUE0/KGQ9YS5pc1BNKGMpLGQmJmI8MTImJihiKz0xMiksZHx8MTIhPT1ifHwoYj0wKSxiKTpifVxuLy8gZGF0ZSBmcm9tIHN0cmluZyBhbmQgYXJyYXkgb2YgZm9ybWF0IHN0cmluZ3NcbmZ1bmN0aW9uIG1iKGEpe3ZhciBiLGMsZCxlLGY7aWYoMD09PWEuX2YubGVuZ3RoKXJldHVybiBtKGEpLmludmFsaWRGb3JtYXQ9ITAsdm9pZChhLl9kPW5ldyBEYXRlKE5hTikpO2ZvcihlPTA7ZTxhLl9mLmxlbmd0aDtlKyspZj0wLGI9cSh7fSxhKSxudWxsIT1hLl91c2VVVEMmJihiLl91c2VVVEM9YS5fdXNlVVRDKSxiLl9mPWEuX2ZbZV0sa2IoYiksbihiKSYmKFxuLy8gaWYgdGhlcmUgaXMgYW55IGlucHV0IHRoYXQgd2FzIG5vdCBwYXJzZWQgYWRkIGEgcGVuYWx0eSBmb3IgdGhhdCBmb3JtYXRcbmYrPW0oYikuY2hhcnNMZWZ0T3Zlcixcbi8vb3IgdG9rZW5zXG5mKz0xMCptKGIpLnVudXNlZFRva2Vucy5sZW5ndGgsbShiKS5zY29yZT1mLChudWxsPT1kfHxmPGQpJiYoZD1mLGM9YikpO2ooYSxjfHxiKX1mdW5jdGlvbiBuYihhKXtpZighYS5fZCl7dmFyIGI9TChhLl9pKTthLl9hPWgoW2IueWVhcixiLm1vbnRoLGIuZGF5fHxiLmRhdGUsYi5ob3VyLGIubWludXRlLGIuc2Vjb25kLGIubWlsbGlzZWNvbmRdLGZ1bmN0aW9uKGEpe3JldHVybiBhJiZwYXJzZUludChhLDEwKX0pLGliKGEpfX1mdW5jdGlvbiBvYihhKXt2YXIgYj1uZXcgcihkYihwYihhKSkpO1xuLy8gQWRkaW5nIGlzIHNtYXJ0IGVub3VnaCBhcm91bmQgRFNUXG5yZXR1cm4gYi5fbmV4dERheSYmKGIuYWRkKDEsXCJkXCIpLGIuX25leHREYXk9dm9pZCAwKSxifWZ1bmN0aW9uIHBiKGEpe3ZhciBiPWEuX2ksZD1hLl9mO3JldHVybiBhLl9sb2NhbGU9YS5fbG9jYWxlfHxiYihhLl9sKSxudWxsPT09Ynx8dm9pZCAwPT09ZCYmXCJcIj09PWI/byh7bnVsbElucHV0OiEwfSk6KFwic3RyaW5nXCI9PXR5cGVvZiBiJiYoYS5faT1iPWEuX2xvY2FsZS5wcmVwYXJzZShiKSkscyhiKT9uZXcgcihkYihiKSk6KGcoYik/YS5fZD1iOmMoZCk/bWIoYSk6ZD9rYihhKTpxYihhKSxuKGEpfHwoYS5fZD1udWxsKSxhKSl9ZnVuY3Rpb24gcWIoYil7dmFyIGQ9Yi5faTt2b2lkIDA9PT1kP2IuX2Q9bmV3IERhdGUoYS5ub3coKSk6ZyhkKT9iLl9kPW5ldyBEYXRlKGQudmFsdWVPZigpKTpcInN0cmluZ1wiPT10eXBlb2YgZD9mYihiKTpjKGQpPyhiLl9hPWgoZC5zbGljZSgwKSxmdW5jdGlvbihhKXtyZXR1cm4gcGFyc2VJbnQoYSwxMCl9KSxpYihiKSk6XCJvYmplY3RcIj09dHlwZW9mIGQ/bmIoYik6ZihkKT9cbi8vIGZyb20gbWlsbGlzZWNvbmRzXG5iLl9kPW5ldyBEYXRlKGQpOmEuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2soYil9ZnVuY3Rpb24gcmIoYSxiLGYsZyxoKXt2YXIgaT17fTtcbi8vIG9iamVjdCBjb25zdHJ1Y3Rpb24gbXVzdCBiZSBkb25lIHRoaXMgd2F5LlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE0MjNcbnJldHVybiBmIT09ITAmJmYhPT0hMXx8KGc9ZixmPXZvaWQgMCksKGQoYSkmJmUoYSl8fGMoYSkmJjA9PT1hLmxlbmd0aCkmJihhPXZvaWQgMCksaS5faXNBTW9tZW50T2JqZWN0PSEwLGkuX3VzZVVUQz1pLl9pc1VUQz1oLGkuX2w9ZixpLl9pPWEsaS5fZj1iLGkuX3N0cmljdD1nLG9iKGkpfWZ1bmN0aW9uIHNiKGEsYixjLGQpe3JldHVybiByYihhLGIsYyxkLCExKX1cbi8vIFBpY2sgYSBtb21lbnQgbSBmcm9tIG1vbWVudHMgc28gdGhhdCBtW2ZuXShvdGhlcikgaXMgdHJ1ZSBmb3IgYWxsXG4vLyBvdGhlci4gVGhpcyByZWxpZXMgb24gdGhlIGZ1bmN0aW9uIGZuIHRvIGJlIHRyYW5zaXRpdmUuXG4vL1xuLy8gbW9tZW50cyBzaG91bGQgZWl0aGVyIGJlIGFuIGFycmF5IG9mIG1vbWVudCBvYmplY3RzIG9yIGFuIGFycmF5LCB3aG9zZVxuLy8gZmlyc3QgZWxlbWVudCBpcyBhbiBhcnJheSBvZiBtb21lbnQgb2JqZWN0cy5cbmZ1bmN0aW9uIHRiKGEsYil7dmFyIGQsZTtpZigxPT09Yi5sZW5ndGgmJmMoYlswXSkmJihiPWJbMF0pLCFiLmxlbmd0aClyZXR1cm4gc2IoKTtmb3IoZD1iWzBdLGU9MTtlPGIubGVuZ3RoOysrZSliW2VdLmlzVmFsaWQoKSYmIWJbZV1bYV0oZCl8fChkPWJbZV0pO3JldHVybiBkfVxuLy8gVE9ETzogVXNlIFtdLnNvcnQgaW5zdGVhZD9cbmZ1bmN0aW9uIHViKCl7dmFyIGE9W10uc2xpY2UuY2FsbChhcmd1bWVudHMsMCk7cmV0dXJuIHRiKFwiaXNCZWZvcmVcIixhKX1mdW5jdGlvbiB2Yigpe3ZhciBhPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLDApO3JldHVybiB0YihcImlzQWZ0ZXJcIixhKX1mdW5jdGlvbiB3YihhKXt2YXIgYj1MKGEpLGM9Yi55ZWFyfHwwLGQ9Yi5xdWFydGVyfHwwLGU9Yi5tb250aHx8MCxmPWIud2Vla3x8MCxnPWIuZGF5fHwwLGg9Yi5ob3VyfHwwLGk9Yi5taW51dGV8fDAsaj1iLnNlY29uZHx8MCxrPWIubWlsbGlzZWNvbmR8fDA7XG4vLyByZXByZXNlbnRhdGlvbiBmb3IgZGF0ZUFkZFJlbW92ZVxudGhpcy5fbWlsbGlzZWNvbmRzPStrKzFlMypqKy8vIDEwMDBcbjZlNCppKy8vIDEwMDAgKiA2MFxuMWUzKmgqNjAqNjAsLy91c2luZyAxMDAwICogNjAgKiA2MCBpbnN0ZWFkIG9mIDM2ZTUgdG8gYXZvaWQgZmxvYXRpbmcgcG9pbnQgcm91bmRpbmcgZXJyb3JzIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8yOTc4XG4vLyBCZWNhdXNlIG9mIGRhdGVBZGRSZW1vdmUgdHJlYXRzIDI0IGhvdXJzIGFzIGRpZmZlcmVudCBmcm9tIGFcbi8vIGRheSB3aGVuIHdvcmtpbmcgYXJvdW5kIERTVCwgd2UgbmVlZCB0byBzdG9yZSB0aGVtIHNlcGFyYXRlbHlcbnRoaXMuX2RheXM9K2crNypmLFxuLy8gSXQgaXMgaW1wb3NzaWJsZSB0cmFuc2xhdGUgbW9udGhzIGludG8gZGF5cyB3aXRob3V0IGtub3dpbmdcbi8vIHdoaWNoIG1vbnRocyB5b3UgYXJlIGFyZSB0YWxraW5nIGFib3V0LCBzbyB3ZSBoYXZlIHRvIHN0b3JlXG4vLyBpdCBzZXBhcmF0ZWx5LlxudGhpcy5fbW9udGhzPStlKzMqZCsxMipjLHRoaXMuX2RhdGE9e30sdGhpcy5fbG9jYWxlPWJiKCksdGhpcy5fYnViYmxlKCl9ZnVuY3Rpb24geGIoYSl7cmV0dXJuIGEgaW5zdGFuY2VvZiB3Yn1mdW5jdGlvbiB5YihhKXtyZXR1cm4gYTwwP01hdGgucm91bmQoLTEqYSkqLTE6TWF0aC5yb3VuZChhKX1cbi8vIEZPUk1BVFRJTkdcbmZ1bmN0aW9uIHpiKGEsYil7VShhLDAsMCxmdW5jdGlvbigpe3ZhciBhPXRoaXMudXRjT2Zmc2V0KCksYz1cIitcIjtyZXR1cm4gYTwwJiYoYT0tYSxjPVwiLVwiKSxjK1Qofn4oYS82MCksMikrYitUKH5+YSU2MCwyKX0pfWZ1bmN0aW9uIEFiKGEsYil7dmFyIGM9KGJ8fFwiXCIpLm1hdGNoKGEpO2lmKG51bGw9PT1jKXJldHVybiBudWxsO3ZhciBkPWNbYy5sZW5ndGgtMV18fFtdLGU9KGQrXCJcIikubWF0Y2goTWUpfHxbXCItXCIsMCwwXSxmPSsoNjAqZVsxXSkrdShlWzJdKTtyZXR1cm4gMD09PWY/MDpcIitcIj09PWVbMF0/ZjotZn1cbi8vIFJldHVybiBhIG1vbWVudCBmcm9tIGlucHV0LCB0aGF0IGlzIGxvY2FsL3V0Yy96b25lIGVxdWl2YWxlbnQgdG8gbW9kZWwuXG5mdW5jdGlvbiBCYihiLGMpe3ZhciBkLGU7XG4vLyBVc2UgbG93LWxldmVsIGFwaSwgYmVjYXVzZSB0aGlzIGZuIGlzIGxvdy1sZXZlbCBhcGkuXG5yZXR1cm4gYy5faXNVVEM/KGQ9Yy5jbG9uZSgpLGU9KHMoYil8fGcoYik/Yi52YWx1ZU9mKCk6c2IoYikudmFsdWVPZigpKS1kLnZhbHVlT2YoKSxkLl9kLnNldFRpbWUoZC5fZC52YWx1ZU9mKCkrZSksYS51cGRhdGVPZmZzZXQoZCwhMSksZCk6c2IoYikubG9jYWwoKX1mdW5jdGlvbiBDYihhKXtcbi8vIE9uIEZpcmVmb3guMjQgRGF0ZSNnZXRUaW1lem9uZU9mZnNldCByZXR1cm5zIGEgZmxvYXRpbmcgcG9pbnQuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9wdWxsLzE4NzFcbnJldHVybiAxNSotTWF0aC5yb3VuZChhLl9kLmdldFRpbWV6b25lT2Zmc2V0KCkvMTUpfVxuLy8gTU9NRU5UU1xuLy8ga2VlcExvY2FsVGltZSA9IHRydWUgbWVhbnMgb25seSBjaGFuZ2UgdGhlIHRpbWV6b25lLCB3aXRob3V0XG4vLyBhZmZlY3RpbmcgdGhlIGxvY2FsIGhvdXIuIFNvIDU6MzE6MjYgKzAzMDAgLS1bdXRjT2Zmc2V0KDIsIHRydWUpXS0tPlxuLy8gNTozMToyNiArMDIwMCBJdCBpcyBwb3NzaWJsZSB0aGF0IDU6MzE6MjYgZG9lc24ndCBleGlzdCB3aXRoIG9mZnNldFxuLy8gKzAyMDAsIHNvIHdlIGFkanVzdCB0aGUgdGltZSBhcyBuZWVkZWQsIHRvIGJlIHZhbGlkLlxuLy9cbi8vIEtlZXBpbmcgdGhlIHRpbWUgYWN0dWFsbHkgYWRkcy9zdWJ0cmFjdHMgKG9uZSBob3VyKVxuLy8gZnJvbSB0aGUgYWN0dWFsIHJlcHJlc2VudGVkIHRpbWUuIFRoYXQgaXMgd2h5IHdlIGNhbGwgdXBkYXRlT2Zmc2V0XG4vLyBhIHNlY29uZCB0aW1lLiBJbiBjYXNlIGl0IHdhbnRzIHVzIHRvIGNoYW5nZSB0aGUgb2Zmc2V0IGFnYWluXG4vLyBfY2hhbmdlSW5Qcm9ncmVzcyA9PSB0cnVlIGNhc2UsIHRoZW4gd2UgaGF2ZSB0byBhZGp1c3QsIGJlY2F1c2Vcbi8vIHRoZXJlIGlzIG5vIHN1Y2ggdGltZSBpbiB0aGUgZ2l2ZW4gdGltZXpvbmUuXG5mdW5jdGlvbiBEYihiLGMpe3ZhciBkLGU9dGhpcy5fb2Zmc2V0fHwwO2lmKCF0aGlzLmlzVmFsaWQoKSlyZXR1cm4gbnVsbCE9Yj90aGlzOk5hTjtpZihudWxsIT1iKXtpZihcInN0cmluZ1wiPT10eXBlb2YgYil7aWYoYj1BYihYZCxiKSxudWxsPT09YilyZXR1cm4gdGhpc31lbHNlIE1hdGguYWJzKGIpPDE2JiYoYj02MCpiKTtyZXR1cm4hdGhpcy5faXNVVEMmJmMmJihkPUNiKHRoaXMpKSx0aGlzLl9vZmZzZXQ9Yix0aGlzLl9pc1VUQz0hMCxudWxsIT1kJiZ0aGlzLmFkZChkLFwibVwiKSxlIT09YiYmKCFjfHx0aGlzLl9jaGFuZ2VJblByb2dyZXNzP1RiKHRoaXMsT2IoYi1lLFwibVwiKSwxLCExKTp0aGlzLl9jaGFuZ2VJblByb2dyZXNzfHwodGhpcy5fY2hhbmdlSW5Qcm9ncmVzcz0hMCxhLnVwZGF0ZU9mZnNldCh0aGlzLCEwKSx0aGlzLl9jaGFuZ2VJblByb2dyZXNzPW51bGwpKSx0aGlzfXJldHVybiB0aGlzLl9pc1VUQz9lOkNiKHRoaXMpfWZ1bmN0aW9uIEViKGEsYil7cmV0dXJuIG51bGwhPWE/KFwic3RyaW5nXCIhPXR5cGVvZiBhJiYoYT0tYSksdGhpcy51dGNPZmZzZXQoYSxiKSx0aGlzKTotdGhpcy51dGNPZmZzZXQoKX1mdW5jdGlvbiBGYihhKXtyZXR1cm4gdGhpcy51dGNPZmZzZXQoMCxhKX1mdW5jdGlvbiBHYihhKXtyZXR1cm4gdGhpcy5faXNVVEMmJih0aGlzLnV0Y09mZnNldCgwLGEpLHRoaXMuX2lzVVRDPSExLGEmJnRoaXMuc3VidHJhY3QoQ2IodGhpcyksXCJtXCIpKSx0aGlzfWZ1bmN0aW9uIEhiKCl7aWYobnVsbCE9dGhpcy5fdHptKXRoaXMudXRjT2Zmc2V0KHRoaXMuX3R6bSk7ZWxzZSBpZihcInN0cmluZ1wiPT10eXBlb2YgdGhpcy5faSl7dmFyIGE9QWIoV2QsdGhpcy5faSk7bnVsbCE9YT90aGlzLnV0Y09mZnNldChhKTp0aGlzLnV0Y09mZnNldCgwLCEwKX1yZXR1cm4gdGhpc31mdW5jdGlvbiBJYihhKXtyZXR1cm4hIXRoaXMuaXNWYWxpZCgpJiYoYT1hP3NiKGEpLnV0Y09mZnNldCgpOjAsKHRoaXMudXRjT2Zmc2V0KCktYSklNjA9PT0wKX1mdW5jdGlvbiBKYigpe3JldHVybiB0aGlzLnV0Y09mZnNldCgpPnRoaXMuY2xvbmUoKS5tb250aCgwKS51dGNPZmZzZXQoKXx8dGhpcy51dGNPZmZzZXQoKT50aGlzLmNsb25lKCkubW9udGgoNSkudXRjT2Zmc2V0KCl9ZnVuY3Rpb24gS2IoKXtpZighcCh0aGlzLl9pc0RTVFNoaWZ0ZWQpKXJldHVybiB0aGlzLl9pc0RTVFNoaWZ0ZWQ7dmFyIGE9e307aWYocShhLHRoaXMpLGE9cGIoYSksYS5fYSl7dmFyIGI9YS5faXNVVEM/ayhhLl9hKTpzYihhLl9hKTt0aGlzLl9pc0RTVFNoaWZ0ZWQ9dGhpcy5pc1ZhbGlkKCkmJnYoYS5fYSxiLnRvQXJyYXkoKSk+MH1lbHNlIHRoaXMuX2lzRFNUU2hpZnRlZD0hMTtyZXR1cm4gdGhpcy5faXNEU1RTaGlmdGVkfWZ1bmN0aW9uIExiKCl7cmV0dXJuISF0aGlzLmlzVmFsaWQoKSYmIXRoaXMuX2lzVVRDfWZ1bmN0aW9uIE1iKCl7cmV0dXJuISF0aGlzLmlzVmFsaWQoKSYmdGhpcy5faXNVVEN9ZnVuY3Rpb24gTmIoKXtyZXR1cm4hIXRoaXMuaXNWYWxpZCgpJiYodGhpcy5faXNVVEMmJjA9PT10aGlzLl9vZmZzZXQpfWZ1bmN0aW9uIE9iKGEsYil7dmFyIGMsZCxlLGc9YSxcbi8vIG1hdGNoaW5nIGFnYWluc3QgcmVnZXhwIGlzIGV4cGVuc2l2ZSwgZG8gaXQgb24gZGVtYW5kXG5oPW51bGw7Ly8gY2hlY2tzIGZvciBudWxsIG9yIHVuZGVmaW5lZFxucmV0dXJuIHhiKGEpP2c9e21zOmEuX21pbGxpc2Vjb25kcyxkOmEuX2RheXMsTTphLl9tb250aHN9OmYoYSk/KGc9e30sYj9nW2JdPWE6Zy5taWxsaXNlY29uZHM9YSk6KGg9TmUuZXhlYyhhKSk/KGM9XCItXCI9PT1oWzFdPy0xOjEsZz17eTowLGQ6dShoW2NlXSkqYyxoOnUoaFtkZV0pKmMsbTp1KGhbZWVdKSpjLHM6dShoW2ZlXSkqYyxtczp1KHliKDFlMypoW2dlXSkpKmN9KTooaD1PZS5leGVjKGEpKT8oYz1cIi1cIj09PWhbMV0/LTE6MSxnPXt5OlBiKGhbMl0sYyksTTpQYihoWzNdLGMpLHc6UGIoaFs0XSxjKSxkOlBiKGhbNV0sYyksaDpQYihoWzZdLGMpLG06UGIoaFs3XSxjKSxzOlBiKGhbOF0sYyl9KTpudWxsPT1nP2c9e306XCJvYmplY3RcIj09dHlwZW9mIGcmJihcImZyb21cImluIGd8fFwidG9cImluIGcpJiYoZT1SYihzYihnLmZyb20pLHNiKGcudG8pKSxnPXt9LGcubXM9ZS5taWxsaXNlY29uZHMsZy5NPWUubW9udGhzKSxkPW5ldyB3YihnKSx4YihhKSYmaShhLFwiX2xvY2FsZVwiKSYmKGQuX2xvY2FsZT1hLl9sb2NhbGUpLGR9ZnVuY3Rpb24gUGIoYSxiKXtcbi8vIFdlJ2Qgbm9ybWFsbHkgdXNlIH5+aW5wIGZvciB0aGlzLCBidXQgdW5mb3J0dW5hdGVseSBpdCBhbHNvXG4vLyBjb252ZXJ0cyBmbG9hdHMgdG8gaW50cy5cbi8vIGlucCBtYXkgYmUgdW5kZWZpbmVkLCBzbyBjYXJlZnVsIGNhbGxpbmcgcmVwbGFjZSBvbiBpdC5cbnZhciBjPWEmJnBhcnNlRmxvYXQoYS5yZXBsYWNlKFwiLFwiLFwiLlwiKSk7XG4vLyBhcHBseSBzaWduIHdoaWxlIHdlJ3JlIGF0IGl0XG5yZXR1cm4oaXNOYU4oYyk/MDpjKSpifWZ1bmN0aW9uIFFiKGEsYil7dmFyIGM9e21pbGxpc2Vjb25kczowLG1vbnRoczowfTtyZXR1cm4gYy5tb250aHM9Yi5tb250aCgpLWEubW9udGgoKSsxMiooYi55ZWFyKCktYS55ZWFyKCkpLGEuY2xvbmUoKS5hZGQoYy5tb250aHMsXCJNXCIpLmlzQWZ0ZXIoYikmJi0tYy5tb250aHMsYy5taWxsaXNlY29uZHM9K2ItK2EuY2xvbmUoKS5hZGQoYy5tb250aHMsXCJNXCIpLGN9ZnVuY3Rpb24gUmIoYSxiKXt2YXIgYztyZXR1cm4gYS5pc1ZhbGlkKCkmJmIuaXNWYWxpZCgpPyhiPUJiKGIsYSksYS5pc0JlZm9yZShiKT9jPVFiKGEsYik6KGM9UWIoYixhKSxjLm1pbGxpc2Vjb25kcz0tYy5taWxsaXNlY29uZHMsYy5tb250aHM9LWMubW9udGhzKSxjKTp7bWlsbGlzZWNvbmRzOjAsbW9udGhzOjB9fVxuLy8gVE9ETzogcmVtb3ZlICduYW1lJyBhcmcgYWZ0ZXIgZGVwcmVjYXRpb24gaXMgcmVtb3ZlZFxuZnVuY3Rpb24gU2IoYSxiKXtyZXR1cm4gZnVuY3Rpb24oYyxkKXt2YXIgZSxmO1xuLy9pbnZlcnQgdGhlIGFyZ3VtZW50cywgYnV0IGNvbXBsYWluIGFib3V0IGl0XG5yZXR1cm4gbnVsbD09PWR8fGlzTmFOKCtkKXx8KHkoYixcIm1vbWVudCgpLlwiK2IrXCIocGVyaW9kLCBudW1iZXIpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgbW9tZW50KCkuXCIrYitcIihudW1iZXIsIHBlcmlvZCkuIFNlZSBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL2FkZC1pbnZlcnRlZC1wYXJhbS8gZm9yIG1vcmUgaW5mby5cIiksZj1jLGM9ZCxkPWYpLGM9XCJzdHJpbmdcIj09dHlwZW9mIGM/K2M6YyxlPU9iKGMsZCksVGIodGhpcyxlLGEpLHRoaXN9fWZ1bmN0aW9uIFRiKGIsYyxkLGUpe3ZhciBmPWMuX21pbGxpc2Vjb25kcyxnPXliKGMuX2RheXMpLGg9eWIoYy5fbW9udGhzKTtiLmlzVmFsaWQoKSYmKGU9bnVsbD09ZXx8ZSxmJiZiLl9kLnNldFRpbWUoYi5fZC52YWx1ZU9mKCkrZipkKSxnJiZRKGIsXCJEYXRlXCIsUChiLFwiRGF0ZVwiKStnKmQpLGgmJmphKGIsUChiLFwiTW9udGhcIikraCpkKSxlJiZhLnVwZGF0ZU9mZnNldChiLGd8fGgpKX1mdW5jdGlvbiBVYihhLGIpe3ZhciBjPWEuZGlmZihiLFwiZGF5c1wiLCEwKTtyZXR1cm4gYzwtNj9cInNhbWVFbHNlXCI6YzwtMT9cImxhc3RXZWVrXCI6YzwwP1wibGFzdERheVwiOmM8MT9cInNhbWVEYXlcIjpjPDI/XCJuZXh0RGF5XCI6Yzw3P1wibmV4dFdlZWtcIjpcInNhbWVFbHNlXCJ9ZnVuY3Rpb24gVmIoYixjKXtcbi8vIFdlIHdhbnQgdG8gY29tcGFyZSB0aGUgc3RhcnQgb2YgdG9kYXksIHZzIHRoaXMuXG4vLyBHZXR0aW5nIHN0YXJ0LW9mLXRvZGF5IGRlcGVuZHMgb24gd2hldGhlciB3ZSdyZSBsb2NhbC91dGMvb2Zmc2V0IG9yIG5vdC5cbnZhciBkPWJ8fHNiKCksZT1CYihkLHRoaXMpLnN0YXJ0T2YoXCJkYXlcIiksZj1hLmNhbGVuZGFyRm9ybWF0KHRoaXMsZSl8fFwic2FtZUVsc2VcIixnPWMmJih6KGNbZl0pP2NbZl0uY2FsbCh0aGlzLGQpOmNbZl0pO3JldHVybiB0aGlzLmZvcm1hdChnfHx0aGlzLmxvY2FsZURhdGEoKS5jYWxlbmRhcihmLHRoaXMsc2IoZCkpKX1mdW5jdGlvbiBXYigpe3JldHVybiBuZXcgcih0aGlzKX1mdW5jdGlvbiBYYihhLGIpe3ZhciBjPXMoYSk/YTpzYihhKTtyZXR1cm4hKCF0aGlzLmlzVmFsaWQoKXx8IWMuaXNWYWxpZCgpKSYmKGI9SyhwKGIpP1wibWlsbGlzZWNvbmRcIjpiKSxcIm1pbGxpc2Vjb25kXCI9PT1iP3RoaXMudmFsdWVPZigpPmMudmFsdWVPZigpOmMudmFsdWVPZigpPHRoaXMuY2xvbmUoKS5zdGFydE9mKGIpLnZhbHVlT2YoKSl9ZnVuY3Rpb24gWWIoYSxiKXt2YXIgYz1zKGEpP2E6c2IoYSk7cmV0dXJuISghdGhpcy5pc1ZhbGlkKCl8fCFjLmlzVmFsaWQoKSkmJihiPUsocChiKT9cIm1pbGxpc2Vjb25kXCI6YiksXCJtaWxsaXNlY29uZFwiPT09Yj90aGlzLnZhbHVlT2YoKTxjLnZhbHVlT2YoKTp0aGlzLmNsb25lKCkuZW5kT2YoYikudmFsdWVPZigpPGMudmFsdWVPZigpKX1mdW5jdGlvbiBaYihhLGIsYyxkKXtyZXR1cm4gZD1kfHxcIigpXCIsKFwiKFwiPT09ZFswXT90aGlzLmlzQWZ0ZXIoYSxjKTohdGhpcy5pc0JlZm9yZShhLGMpKSYmKFwiKVwiPT09ZFsxXT90aGlzLmlzQmVmb3JlKGIsYyk6IXRoaXMuaXNBZnRlcihiLGMpKX1mdW5jdGlvbiAkYihhLGIpe3ZhciBjLGQ9cyhhKT9hOnNiKGEpO3JldHVybiEoIXRoaXMuaXNWYWxpZCgpfHwhZC5pc1ZhbGlkKCkpJiYoYj1LKGJ8fFwibWlsbGlzZWNvbmRcIiksXCJtaWxsaXNlY29uZFwiPT09Yj90aGlzLnZhbHVlT2YoKT09PWQudmFsdWVPZigpOihjPWQudmFsdWVPZigpLHRoaXMuY2xvbmUoKS5zdGFydE9mKGIpLnZhbHVlT2YoKTw9YyYmYzw9dGhpcy5jbG9uZSgpLmVuZE9mKGIpLnZhbHVlT2YoKSkpfWZ1bmN0aW9uIF9iKGEsYil7cmV0dXJuIHRoaXMuaXNTYW1lKGEsYil8fHRoaXMuaXNBZnRlcihhLGIpfWZ1bmN0aW9uIGFjKGEsYil7cmV0dXJuIHRoaXMuaXNTYW1lKGEsYil8fHRoaXMuaXNCZWZvcmUoYSxiKX1mdW5jdGlvbiBiYyhhLGIsYyl7dmFyIGQsZSxmLGc7Ly8gMTAwMFxuLy8gMTAwMCAqIDYwXG4vLyAxMDAwICogNjAgKiA2MFxuLy8gMTAwMCAqIDYwICogNjAgKiAyNCwgbmVnYXRlIGRzdFxuLy8gMTAwMCAqIDYwICogNjAgKiAyNCAqIDcsIG5lZ2F0ZSBkc3RcbnJldHVybiB0aGlzLmlzVmFsaWQoKT8oZD1CYihhLHRoaXMpLGQuaXNWYWxpZCgpPyhlPTZlNCooZC51dGNPZmZzZXQoKS10aGlzLnV0Y09mZnNldCgpKSxiPUsoYiksXCJ5ZWFyXCI9PT1ifHxcIm1vbnRoXCI9PT1ifHxcInF1YXJ0ZXJcIj09PWI/KGc9Y2ModGhpcyxkKSxcInF1YXJ0ZXJcIj09PWI/Zy89MzpcInllYXJcIj09PWImJihnLz0xMikpOihmPXRoaXMtZCxnPVwic2Vjb25kXCI9PT1iP2YvMWUzOlwibWludXRlXCI9PT1iP2YvNmU0OlwiaG91clwiPT09Yj9mLzM2ZTU6XCJkYXlcIj09PWI/KGYtZSkvODY0ZTU6XCJ3ZWVrXCI9PT1iPyhmLWUpLzYwNDhlNTpmKSxjP2c6dChnKSk6TmFOKTpOYU59ZnVuY3Rpb24gY2MoYSxiKXtcbi8vIGRpZmZlcmVuY2UgaW4gbW9udGhzXG52YXIgYyxkLGU9MTIqKGIueWVhcigpLWEueWVhcigpKSsoYi5tb250aCgpLWEubW9udGgoKSksXG4vLyBiIGlzIGluIChhbmNob3IgLSAxIG1vbnRoLCBhbmNob3IgKyAxIG1vbnRoKVxuZj1hLmNsb25lKCkuYWRkKGUsXCJtb250aHNcIik7XG4vL2NoZWNrIGZvciBuZWdhdGl2ZSB6ZXJvLCByZXR1cm4gemVybyBpZiBuZWdhdGl2ZSB6ZXJvXG4vLyBsaW5lYXIgYWNyb3NzIHRoZSBtb250aFxuLy8gbGluZWFyIGFjcm9zcyB0aGUgbW9udGhcbnJldHVybiBiLWY8MD8oYz1hLmNsb25lKCkuYWRkKGUtMSxcIm1vbnRoc1wiKSxkPShiLWYpLyhmLWMpKTooYz1hLmNsb25lKCkuYWRkKGUrMSxcIm1vbnRoc1wiKSxkPShiLWYpLyhjLWYpKSwtKGUrZCl8fDB9ZnVuY3Rpb24gZGMoKXtyZXR1cm4gdGhpcy5jbG9uZSgpLmxvY2FsZShcImVuXCIpLmZvcm1hdChcImRkZCBNTU0gREQgWVlZWSBISDptbTpzcyBbR01UXVpaXCIpfWZ1bmN0aW9uIGVjKCl7dmFyIGE9dGhpcy5jbG9uZSgpLnV0YygpO3JldHVybiAwPGEueWVhcigpJiZhLnllYXIoKTw9OTk5OT96KERhdGUucHJvdG90eXBlLnRvSVNPU3RyaW5nKT90aGlzLnRvRGF0ZSgpLnRvSVNPU3RyaW5nKCk6WChhLFwiWVlZWS1NTS1ERFtUXUhIOm1tOnNzLlNTU1taXVwiKTpYKGEsXCJZWVlZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl1cIil9LyoqXG4gKiBSZXR1cm4gYSBodW1hbiByZWFkYWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIG1vbWVudCB0aGF0IGNhblxuICogYWxzbyBiZSBldmFsdWF0ZWQgdG8gZ2V0IGEgbmV3IG1vbWVudCB3aGljaCBpcyB0aGUgc2FtZVxuICpcbiAqIEBsaW5rIGh0dHBzOi8vbm9kZWpzLm9yZy9kaXN0L2xhdGVzdC9kb2NzL2FwaS91dGlsLmh0bWwjdXRpbF9jdXN0b21faW5zcGVjdF9mdW5jdGlvbl9vbl9vYmplY3RzXG4gKi9cbmZ1bmN0aW9uIGZjKCl7aWYoIXRoaXMuaXNWYWxpZCgpKXJldHVyblwibW9tZW50LmludmFsaWQoLyogXCIrdGhpcy5faStcIiAqLylcIjt2YXIgYT1cIm1vbWVudFwiLGI9XCJcIjt0aGlzLmlzTG9jYWwoKXx8KGE9MD09PXRoaXMudXRjT2Zmc2V0KCk/XCJtb21lbnQudXRjXCI6XCJtb21lbnQucGFyc2Vab25lXCIsYj1cIlpcIik7dmFyIGM9XCJbXCIrYSsnKFwiXScsZD0wPHRoaXMueWVhcigpJiZ0aGlzLnllYXIoKTw9OTk5OT9cIllZWVlcIjpcIllZWVlZWVwiLGU9XCItTU0tRERbVF1ISDptbTpzcy5TU1NcIixmPWIrJ1tcIildJztyZXR1cm4gdGhpcy5mb3JtYXQoYytkK2UrZil9ZnVuY3Rpb24gZ2MoYil7Ynx8KGI9dGhpcy5pc1V0YygpP2EuZGVmYXVsdEZvcm1hdFV0YzphLmRlZmF1bHRGb3JtYXQpO3ZhciBjPVgodGhpcyxiKTtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkucG9zdGZvcm1hdChjKX1mdW5jdGlvbiBoYyhhLGIpe3JldHVybiB0aGlzLmlzVmFsaWQoKSYmKHMoYSkmJmEuaXNWYWxpZCgpfHxzYihhKS5pc1ZhbGlkKCkpP09iKHt0bzp0aGlzLGZyb206YX0pLmxvY2FsZSh0aGlzLmxvY2FsZSgpKS5odW1hbml6ZSghYik6dGhpcy5sb2NhbGVEYXRhKCkuaW52YWxpZERhdGUoKX1mdW5jdGlvbiBpYyhhKXtyZXR1cm4gdGhpcy5mcm9tKHNiKCksYSl9ZnVuY3Rpb24gamMoYSxiKXtyZXR1cm4gdGhpcy5pc1ZhbGlkKCkmJihzKGEpJiZhLmlzVmFsaWQoKXx8c2IoYSkuaXNWYWxpZCgpKT9PYih7ZnJvbTp0aGlzLHRvOmF9KS5sb2NhbGUodGhpcy5sb2NhbGUoKSkuaHVtYW5pemUoIWIpOnRoaXMubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCl9ZnVuY3Rpb24ga2MoYSl7cmV0dXJuIHRoaXMudG8oc2IoKSxhKX1cbi8vIElmIHBhc3NlZCBhIGxvY2FsZSBrZXksIGl0IHdpbGwgc2V0IHRoZSBsb2NhbGUgZm9yIHRoaXNcbi8vIGluc3RhbmNlLiAgT3RoZXJ3aXNlLCBpdCB3aWxsIHJldHVybiB0aGUgbG9jYWxlIGNvbmZpZ3VyYXRpb25cbi8vIHZhcmlhYmxlcyBmb3IgdGhpcyBpbnN0YW5jZS5cbmZ1bmN0aW9uIGxjKGEpe3ZhciBiO3JldHVybiB2b2lkIDA9PT1hP3RoaXMuX2xvY2FsZS5fYWJicjooYj1iYihhKSxudWxsIT1iJiYodGhpcy5fbG9jYWxlPWIpLHRoaXMpfWZ1bmN0aW9uIG1jKCl7cmV0dXJuIHRoaXMuX2xvY2FsZX1mdW5jdGlvbiBuYyhhKXtcbi8vIHRoZSBmb2xsb3dpbmcgc3dpdGNoIGludGVudGlvbmFsbHkgb21pdHMgYnJlYWsga2V5d29yZHNcbi8vIHRvIHV0aWxpemUgZmFsbGluZyB0aHJvdWdoIHRoZSBjYXNlcy5cbnN3aXRjaChhPUsoYSkpe2Nhc2VcInllYXJcIjp0aGlzLm1vbnRoKDApOy8qIGZhbGxzIHRocm91Z2ggKi9cbmNhc2VcInF1YXJ0ZXJcIjpjYXNlXCJtb250aFwiOnRoaXMuZGF0ZSgxKTsvKiBmYWxscyB0aHJvdWdoICovXG5jYXNlXCJ3ZWVrXCI6Y2FzZVwiaXNvV2Vla1wiOmNhc2VcImRheVwiOmNhc2VcImRhdGVcIjp0aGlzLmhvdXJzKDApOy8qIGZhbGxzIHRocm91Z2ggKi9cbmNhc2VcImhvdXJcIjp0aGlzLm1pbnV0ZXMoMCk7LyogZmFsbHMgdGhyb3VnaCAqL1xuY2FzZVwibWludXRlXCI6dGhpcy5zZWNvbmRzKDApOy8qIGZhbGxzIHRocm91Z2ggKi9cbmNhc2VcInNlY29uZFwiOnRoaXMubWlsbGlzZWNvbmRzKDApfVxuLy8gd2Vla3MgYXJlIGEgc3BlY2lhbCBjYXNlXG4vLyBxdWFydGVycyBhcmUgYWxzbyBzcGVjaWFsXG5yZXR1cm5cIndlZWtcIj09PWEmJnRoaXMud2Vla2RheSgwKSxcImlzb1dlZWtcIj09PWEmJnRoaXMuaXNvV2Vla2RheSgxKSxcInF1YXJ0ZXJcIj09PWEmJnRoaXMubW9udGgoMypNYXRoLmZsb29yKHRoaXMubW9udGgoKS8zKSksdGhpc31mdW5jdGlvbiBvYyhhKXtcbi8vICdkYXRlJyBpcyBhbiBhbGlhcyBmb3IgJ2RheScsIHNvIGl0IHNob3VsZCBiZSBjb25zaWRlcmVkIGFzIHN1Y2guXG5yZXR1cm4gYT1LKGEpLHZvaWQgMD09PWF8fFwibWlsbGlzZWNvbmRcIj09PWE/dGhpczooXCJkYXRlXCI9PT1hJiYoYT1cImRheVwiKSx0aGlzLnN0YXJ0T2YoYSkuYWRkKDEsXCJpc29XZWVrXCI9PT1hP1wid2Vla1wiOmEpLnN1YnRyYWN0KDEsXCJtc1wiKSl9ZnVuY3Rpb24gcGMoKXtyZXR1cm4gdGhpcy5fZC52YWx1ZU9mKCktNmU0Kih0aGlzLl9vZmZzZXR8fDApfWZ1bmN0aW9uIHFjKCl7cmV0dXJuIE1hdGguZmxvb3IodGhpcy52YWx1ZU9mKCkvMWUzKX1mdW5jdGlvbiByYygpe3JldHVybiBuZXcgRGF0ZSh0aGlzLnZhbHVlT2YoKSl9ZnVuY3Rpb24gc2MoKXt2YXIgYT10aGlzO3JldHVyblthLnllYXIoKSxhLm1vbnRoKCksYS5kYXRlKCksYS5ob3VyKCksYS5taW51dGUoKSxhLnNlY29uZCgpLGEubWlsbGlzZWNvbmQoKV19ZnVuY3Rpb24gdGMoKXt2YXIgYT10aGlzO3JldHVybnt5ZWFyczphLnllYXIoKSxtb250aHM6YS5tb250aCgpLGRhdGU6YS5kYXRlKCksaG91cnM6YS5ob3VycygpLG1pbnV0ZXM6YS5taW51dGVzKCksc2Vjb25kczphLnNlY29uZHMoKSxtaWxsaXNlY29uZHM6YS5taWxsaXNlY29uZHMoKX19ZnVuY3Rpb24gdWMoKXtcbi8vIG5ldyBEYXRlKE5hTikudG9KU09OKCkgPT09IG51bGxcbnJldHVybiB0aGlzLmlzVmFsaWQoKT90aGlzLnRvSVNPU3RyaW5nKCk6bnVsbH1mdW5jdGlvbiB2Yygpe3JldHVybiBuKHRoaXMpfWZ1bmN0aW9uIHdjKCl7cmV0dXJuIGooe30sbSh0aGlzKSl9ZnVuY3Rpb24geGMoKXtyZXR1cm4gbSh0aGlzKS5vdmVyZmxvd31mdW5jdGlvbiB5Yygpe3JldHVybntpbnB1dDp0aGlzLl9pLGZvcm1hdDp0aGlzLl9mLGxvY2FsZTp0aGlzLl9sb2NhbGUsaXNVVEM6dGhpcy5faXNVVEMsc3RyaWN0OnRoaXMuX3N0cmljdH19ZnVuY3Rpb24gemMoYSxiKXtVKDAsW2EsYS5sZW5ndGhdLDAsYil9XG4vLyBNT01FTlRTXG5mdW5jdGlvbiBBYyhhKXtyZXR1cm4gRWMuY2FsbCh0aGlzLGEsdGhpcy53ZWVrKCksdGhpcy53ZWVrZGF5KCksdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWsuZG93LHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRveSl9ZnVuY3Rpb24gQmMoYSl7cmV0dXJuIEVjLmNhbGwodGhpcyxhLHRoaXMuaXNvV2VlaygpLHRoaXMuaXNvV2Vla2RheSgpLDEsNCl9ZnVuY3Rpb24gQ2MoKXtyZXR1cm4geGEodGhpcy55ZWFyKCksMSw0KX1mdW5jdGlvbiBEYygpe3ZhciBhPXRoaXMubG9jYWxlRGF0YSgpLl93ZWVrO3JldHVybiB4YSh0aGlzLnllYXIoKSxhLmRvdyxhLmRveSl9ZnVuY3Rpb24gRWMoYSxiLGMsZCxlKXt2YXIgZjtyZXR1cm4gbnVsbD09YT93YSh0aGlzLGQsZSkueWVhcjooZj14YShhLGQsZSksYj5mJiYoYj1mKSxGYy5jYWxsKHRoaXMsYSxiLGMsZCxlKSl9ZnVuY3Rpb24gRmMoYSxiLGMsZCxlKXt2YXIgZj12YShhLGIsYyxkLGUpLGc9dGEoZi55ZWFyLDAsZi5kYXlPZlllYXIpO3JldHVybiB0aGlzLnllYXIoZy5nZXRVVENGdWxsWWVhcigpKSx0aGlzLm1vbnRoKGcuZ2V0VVRDTW9udGgoKSksdGhpcy5kYXRlKGcuZ2V0VVRDRGF0ZSgpKSx0aGlzfVxuLy8gTU9NRU5UU1xuZnVuY3Rpb24gR2MoYSl7cmV0dXJuIG51bGw9PWE/TWF0aC5jZWlsKCh0aGlzLm1vbnRoKCkrMSkvMyk6dGhpcy5tb250aCgzKihhLTEpK3RoaXMubW9udGgoKSUzKX1cbi8vIEhFTFBFUlNcbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIEhjKGEpe3ZhciBiPU1hdGgucm91bmQoKHRoaXMuY2xvbmUoKS5zdGFydE9mKFwiZGF5XCIpLXRoaXMuY2xvbmUoKS5zdGFydE9mKFwieWVhclwiKSkvODY0ZTUpKzE7cmV0dXJuIG51bGw9PWE/Yjp0aGlzLmFkZChhLWIsXCJkXCIpfWZ1bmN0aW9uIEljKGEsYil7YltnZV09dSgxZTMqKFwiMC5cIithKSl9XG4vLyBNT01FTlRTXG5mdW5jdGlvbiBKYygpe3JldHVybiB0aGlzLl9pc1VUQz9cIlVUQ1wiOlwiXCJ9ZnVuY3Rpb24gS2MoKXtyZXR1cm4gdGhpcy5faXNVVEM/XCJDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZVwiOlwiXCJ9ZnVuY3Rpb24gTGMoYSl7cmV0dXJuIHNiKDFlMyphKX1mdW5jdGlvbiBNYygpe3JldHVybiBzYi5hcHBseShudWxsLGFyZ3VtZW50cykucGFyc2Vab25lKCl9ZnVuY3Rpb24gTmMoYSl7cmV0dXJuIGF9ZnVuY3Rpb24gT2MoYSxiLGMsZCl7dmFyIGU9YmIoKSxmPWsoKS5zZXQoZCxiKTtyZXR1cm4gZVtjXShmLGEpfWZ1bmN0aW9uIFBjKGEsYixjKXtpZihmKGEpJiYoYj1hLGE9dm9pZCAwKSxhPWF8fFwiXCIsbnVsbCE9YilyZXR1cm4gT2MoYSxiLGMsXCJtb250aFwiKTt2YXIgZCxlPVtdO2ZvcihkPTA7ZDwxMjtkKyspZVtkXT1PYyhhLGQsYyxcIm1vbnRoXCIpO3JldHVybiBlfVxuLy8gKClcbi8vICg1KVxuLy8gKGZtdCwgNSlcbi8vIChmbXQpXG4vLyAodHJ1ZSlcbi8vICh0cnVlLCA1KVxuLy8gKHRydWUsIGZtdCwgNSlcbi8vICh0cnVlLCBmbXQpXG5mdW5jdGlvbiBRYyhhLGIsYyxkKXtcImJvb2xlYW5cIj09dHlwZW9mIGE/KGYoYikmJihjPWIsYj12b2lkIDApLGI9Ynx8XCJcIik6KGI9YSxjPWIsYT0hMSxmKGIpJiYoYz1iLGI9dm9pZCAwKSxiPWJ8fFwiXCIpO3ZhciBlPWJiKCksZz1hP2UuX3dlZWsuZG93OjA7aWYobnVsbCE9YylyZXR1cm4gT2MoYiwoYytnKSU3LGQsXCJkYXlcIik7dmFyIGgsaT1bXTtmb3IoaD0wO2g8NztoKyspaVtoXT1PYyhiLChoK2cpJTcsZCxcImRheVwiKTtyZXR1cm4gaX1mdW5jdGlvbiBSYyhhLGIpe3JldHVybiBQYyhhLGIsXCJtb250aHNcIil9ZnVuY3Rpb24gU2MoYSxiKXtyZXR1cm4gUGMoYSxiLFwibW9udGhzU2hvcnRcIil9ZnVuY3Rpb24gVGMoYSxiLGMpe3JldHVybiBRYyhhLGIsYyxcIndlZWtkYXlzXCIpfWZ1bmN0aW9uIFVjKGEsYixjKXtyZXR1cm4gUWMoYSxiLGMsXCJ3ZWVrZGF5c1Nob3J0XCIpfWZ1bmN0aW9uIFZjKGEsYixjKXtyZXR1cm4gUWMoYSxiLGMsXCJ3ZWVrZGF5c01pblwiKX1mdW5jdGlvbiBXYygpe3ZhciBhPXRoaXMuX2RhdGE7cmV0dXJuIHRoaXMuX21pbGxpc2Vjb25kcz1aZSh0aGlzLl9taWxsaXNlY29uZHMpLHRoaXMuX2RheXM9WmUodGhpcy5fZGF5cyksdGhpcy5fbW9udGhzPVplKHRoaXMuX21vbnRocyksYS5taWxsaXNlY29uZHM9WmUoYS5taWxsaXNlY29uZHMpLGEuc2Vjb25kcz1aZShhLnNlY29uZHMpLGEubWludXRlcz1aZShhLm1pbnV0ZXMpLGEuaG91cnM9WmUoYS5ob3VycyksYS5tb250aHM9WmUoYS5tb250aHMpLGEueWVhcnM9WmUoYS55ZWFycyksdGhpc31mdW5jdGlvbiBYYyhhLGIsYyxkKXt2YXIgZT1PYihiLGMpO3JldHVybiBhLl9taWxsaXNlY29uZHMrPWQqZS5fbWlsbGlzZWNvbmRzLGEuX2RheXMrPWQqZS5fZGF5cyxhLl9tb250aHMrPWQqZS5fbW9udGhzLGEuX2J1YmJsZSgpfVxuLy8gc3VwcG9ydHMgb25seSAyLjAtc3R5bGUgYWRkKDEsICdzJykgb3IgYWRkKGR1cmF0aW9uKVxuZnVuY3Rpb24gWWMoYSxiKXtyZXR1cm4gWGModGhpcyxhLGIsMSl9XG4vLyBzdXBwb3J0cyBvbmx5IDIuMC1zdHlsZSBzdWJ0cmFjdCgxLCAncycpIG9yIHN1YnRyYWN0KGR1cmF0aW9uKVxuZnVuY3Rpb24gWmMoYSxiKXtyZXR1cm4gWGModGhpcyxhLGIsLTEpfWZ1bmN0aW9uICRjKGEpe3JldHVybiBhPDA/TWF0aC5mbG9vcihhKTpNYXRoLmNlaWwoYSl9ZnVuY3Rpb24gX2MoKXt2YXIgYSxiLGMsZCxlLGY9dGhpcy5fbWlsbGlzZWNvbmRzLGc9dGhpcy5fZGF5cyxoPXRoaXMuX21vbnRocyxpPXRoaXMuX2RhdGE7XG4vLyBpZiB3ZSBoYXZlIGEgbWl4IG9mIHBvc2l0aXZlIGFuZCBuZWdhdGl2ZSB2YWx1ZXMsIGJ1YmJsZSBkb3duIGZpcnN0XG4vLyBjaGVjazogaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzIxNjZcbi8vIFRoZSBmb2xsb3dpbmcgY29kZSBidWJibGVzIHVwIHZhbHVlcywgc2VlIHRoZSB0ZXN0cyBmb3Jcbi8vIGV4YW1wbGVzIG9mIHdoYXQgdGhhdCBtZWFucy5cbi8vIGNvbnZlcnQgZGF5cyB0byBtb250aHNcbi8vIDEyIG1vbnRocyAtPiAxIHllYXJcbnJldHVybiBmPj0wJiZnPj0wJiZoPj0wfHxmPD0wJiZnPD0wJiZoPD0wfHwoZis9ODY0ZTUqJGMoYmQoaCkrZyksZz0wLGg9MCksaS5taWxsaXNlY29uZHM9ZiUxZTMsYT10KGYvMWUzKSxpLnNlY29uZHM9YSU2MCxiPXQoYS82MCksaS5taW51dGVzPWIlNjAsYz10KGIvNjApLGkuaG91cnM9YyUyNCxnKz10KGMvMjQpLGU9dChhZChnKSksaCs9ZSxnLT0kYyhiZChlKSksZD10KGgvMTIpLGglPTEyLGkuZGF5cz1nLGkubW9udGhzPWgsaS55ZWFycz1kLHRoaXN9ZnVuY3Rpb24gYWQoYSl7XG4vLyA0MDAgeWVhcnMgaGF2ZSAxNDYwOTcgZGF5cyAodGFraW5nIGludG8gYWNjb3VudCBsZWFwIHllYXIgcnVsZXMpXG4vLyA0MDAgeWVhcnMgaGF2ZSAxMiBtb250aHMgPT09IDQ4MDBcbnJldHVybiA0ODAwKmEvMTQ2MDk3fWZ1bmN0aW9uIGJkKGEpe1xuLy8gdGhlIHJldmVyc2Ugb2YgZGF5c1RvTW9udGhzXG5yZXR1cm4gMTQ2MDk3KmEvNDgwMH1mdW5jdGlvbiBjZChhKXt2YXIgYixjLGQ9dGhpcy5fbWlsbGlzZWNvbmRzO2lmKGE9SyhhKSxcIm1vbnRoXCI9PT1hfHxcInllYXJcIj09PWEpcmV0dXJuIGI9dGhpcy5fZGF5cytkLzg2NGU1LGM9dGhpcy5fbW9udGhzK2FkKGIpLFwibW9udGhcIj09PWE/YzpjLzEyO3N3aXRjaChcbi8vIGhhbmRsZSBtaWxsaXNlY29uZHMgc2VwYXJhdGVseSBiZWNhdXNlIG9mIGZsb2F0aW5nIHBvaW50IG1hdGggZXJyb3JzIChpc3N1ZSAjMTg2NylcbmI9dGhpcy5fZGF5cytNYXRoLnJvdW5kKGJkKHRoaXMuX21vbnRocykpLGEpe2Nhc2VcIndlZWtcIjpyZXR1cm4gYi83K2QvNjA0OGU1O2Nhc2VcImRheVwiOnJldHVybiBiK2QvODY0ZTU7Y2FzZVwiaG91clwiOnJldHVybiAyNCpiK2QvMzZlNTtjYXNlXCJtaW51dGVcIjpyZXR1cm4gMTQ0MCpiK2QvNmU0O2Nhc2VcInNlY29uZFwiOnJldHVybiA4NjQwMCpiK2QvMWUzO1xuLy8gTWF0aC5mbG9vciBwcmV2ZW50cyBmbG9hdGluZyBwb2ludCBtYXRoIGVycm9ycyBoZXJlXG5jYXNlXCJtaWxsaXNlY29uZFwiOnJldHVybiBNYXRoLmZsb29yKDg2NGU1KmIpK2Q7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIHVuaXQgXCIrYSl9fVxuLy8gVE9ETzogVXNlIHRoaXMuYXMoJ21zJyk/XG5mdW5jdGlvbiBkZCgpe3JldHVybiB0aGlzLl9taWxsaXNlY29uZHMrODY0ZTUqdGhpcy5fZGF5cyt0aGlzLl9tb250aHMlMTIqMjU5MmU2KzMxNTM2ZTYqdSh0aGlzLl9tb250aHMvMTIpfWZ1bmN0aW9uIGVkKGEpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiB0aGlzLmFzKGEpfX1mdW5jdGlvbiBmZChhKXtyZXR1cm4gYT1LKGEpLHRoaXNbYStcInNcIl0oKX1mdW5jdGlvbiBnZChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fZGF0YVthXX19ZnVuY3Rpb24gaGQoKXtyZXR1cm4gdCh0aGlzLmRheXMoKS83KX1cbi8vIGhlbHBlciBmdW5jdGlvbiBmb3IgbW9tZW50LmZuLmZyb20sIG1vbWVudC5mbi5mcm9tTm93LCBhbmQgbW9tZW50LmR1cmF0aW9uLmZuLmh1bWFuaXplXG5mdW5jdGlvbiBpZChhLGIsYyxkLGUpe3JldHVybiBlLnJlbGF0aXZlVGltZShifHwxLCEhYyxhLGQpfWZ1bmN0aW9uIGpkKGEsYixjKXt2YXIgZD1PYihhKS5hYnMoKSxlPW9mKGQuYXMoXCJzXCIpKSxmPW9mKGQuYXMoXCJtXCIpKSxnPW9mKGQuYXMoXCJoXCIpKSxoPW9mKGQuYXMoXCJkXCIpKSxpPW9mKGQuYXMoXCJNXCIpKSxqPW9mKGQuYXMoXCJ5XCIpKSxrPWU8cGYucyYmW1wic1wiLGVdfHxmPD0xJiZbXCJtXCJdfHxmPHBmLm0mJltcIm1tXCIsZl18fGc8PTEmJltcImhcIl18fGc8cGYuaCYmW1wiaGhcIixnXXx8aDw9MSYmW1wiZFwiXXx8aDxwZi5kJiZbXCJkZFwiLGhdfHxpPD0xJiZbXCJNXCJdfHxpPHBmLk0mJltcIk1NXCIsaV18fGo8PTEmJltcInlcIl18fFtcInl5XCIsal07cmV0dXJuIGtbMl09YixrWzNdPSthPjAsa1s0XT1jLGlkLmFwcGx5KG51bGwsayl9XG4vLyBUaGlzIGZ1bmN0aW9uIGFsbG93cyB5b3UgdG8gc2V0IHRoZSByb3VuZGluZyBmdW5jdGlvbiBmb3IgcmVsYXRpdmUgdGltZSBzdHJpbmdzXG5mdW5jdGlvbiBrZChhKXtyZXR1cm4gdm9pZCAwPT09YT9vZjpcImZ1bmN0aW9uXCI9PXR5cGVvZiBhJiYob2Y9YSwhMCl9XG4vLyBUaGlzIGZ1bmN0aW9uIGFsbG93cyB5b3UgdG8gc2V0IGEgdGhyZXNob2xkIGZvciByZWxhdGl2ZSB0aW1lIHN0cmluZ3NcbmZ1bmN0aW9uIGxkKGEsYil7cmV0dXJuIHZvaWQgMCE9PXBmW2FdJiYodm9pZCAwPT09Yj9wZlthXToocGZbYV09YiwhMCkpfWZ1bmN0aW9uIG1kKGEpe3ZhciBiPXRoaXMubG9jYWxlRGF0YSgpLGM9amQodGhpcywhYSxiKTtyZXR1cm4gYSYmKGM9Yi5wYXN0RnV0dXJlKCt0aGlzLGMpKSxiLnBvc3Rmb3JtYXQoYyl9ZnVuY3Rpb24gbmQoKXtcbi8vIGZvciBJU08gc3RyaW5ncyB3ZSBkbyBub3QgdXNlIHRoZSBub3JtYWwgYnViYmxpbmcgcnVsZXM6XG4vLyAgKiBtaWxsaXNlY29uZHMgYnViYmxlIHVwIHVudGlsIHRoZXkgYmVjb21lIGhvdXJzXG4vLyAgKiBkYXlzIGRvIG5vdCBidWJibGUgYXQgYWxsXG4vLyAgKiBtb250aHMgYnViYmxlIHVwIHVudGlsIHRoZXkgYmVjb21lIHllYXJzXG4vLyBUaGlzIGlzIGJlY2F1c2UgdGhlcmUgaXMgbm8gY29udGV4dC1mcmVlIGNvbnZlcnNpb24gYmV0d2VlbiBob3VycyBhbmQgZGF5c1xuLy8gKHRoaW5rIG9mIGNsb2NrIGNoYW5nZXMpXG4vLyBhbmQgYWxzbyBub3QgYmV0d2VlbiBkYXlzIGFuZCBtb250aHMgKDI4LTMxIGRheXMgcGVyIG1vbnRoKVxudmFyIGEsYixjLGQ9cWYodGhpcy5fbWlsbGlzZWNvbmRzKS8xZTMsZT1xZih0aGlzLl9kYXlzKSxmPXFmKHRoaXMuX21vbnRocyk7XG4vLyAzNjAwIHNlY29uZHMgLT4gNjAgbWludXRlcyAtPiAxIGhvdXJcbmE9dChkLzYwKSxiPXQoYS82MCksZCU9NjAsYSU9NjAsXG4vLyAxMiBtb250aHMgLT4gMSB5ZWFyXG5jPXQoZi8xMiksZiU9MTI7XG4vLyBpbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vZG9yZGlsbGUvbW9tZW50LWlzb2R1cmF0aW9uL2Jsb2IvbWFzdGVyL21vbWVudC5pc29kdXJhdGlvbi5qc1xudmFyIGc9YyxoPWYsaT1lLGo9YixrPWEsbD1kLG09dGhpcy5hc1NlY29uZHMoKTtyZXR1cm4gbT8obTwwP1wiLVwiOlwiXCIpK1wiUFwiKyhnP2crXCJZXCI6XCJcIikrKGg/aCtcIk1cIjpcIlwiKSsoaT9pK1wiRFwiOlwiXCIpKyhqfHxrfHxsP1wiVFwiOlwiXCIpKyhqP2orXCJIXCI6XCJcIikrKGs/aytcIk1cIjpcIlwiKSsobD9sK1wiU1wiOlwiXCIpOlwiUDBEXCJ9dmFyIG9kLHBkO3BkPUFycmF5LnByb3RvdHlwZS5zb21lP0FycmF5LnByb3RvdHlwZS5zb21lOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1PYmplY3QodGhpcyksYz1iLmxlbmd0aD4+PjAsZD0wO2Q8YztkKyspaWYoZCBpbiBiJiZhLmNhbGwodGhpcyxiW2RdLGQsYikpcmV0dXJuITA7cmV0dXJuITF9O3ZhciBxZD1wZCxyZD1hLm1vbWVudFByb3BlcnRpZXM9W10sc2Q9ITEsdGQ9e307YS5zdXBwcmVzc0RlcHJlY2F0aW9uV2FybmluZ3M9ITEsYS5kZXByZWNhdGlvbkhhbmRsZXI9bnVsbDt2YXIgdWQ7dWQ9T2JqZWN0LmtleXM/T2JqZWN0LmtleXM6ZnVuY3Rpb24oYSl7dmFyIGIsYz1bXTtmb3IoYiBpbiBhKWkoYSxiKSYmYy5wdXNoKGIpO3JldHVybiBjfTt2YXIgdmQsd2Q9dWQseGQ9e3NhbWVEYXk6XCJbVG9kYXkgYXRdIExUXCIsbmV4dERheTpcIltUb21vcnJvdyBhdF0gTFRcIixuZXh0V2VlazpcImRkZGQgW2F0XSBMVFwiLGxhc3REYXk6XCJbWWVzdGVyZGF5IGF0XSBMVFwiLGxhc3RXZWVrOlwiW0xhc3RdIGRkZGQgW2F0XSBMVFwiLHNhbWVFbHNlOlwiTFwifSx5ZD17TFRTOlwiaDptbTpzcyBBXCIsTFQ6XCJoOm1tIEFcIixMOlwiTU0vREQvWVlZWVwiLExMOlwiTU1NTSBELCBZWVlZXCIsTExMOlwiTU1NTSBELCBZWVlZIGg6bW0gQVwiLExMTEw6XCJkZGRkLCBNTU1NIEQsIFlZWVkgaDptbSBBXCJ9LHpkPVwiSW52YWxpZCBkYXRlXCIsQWQ9XCIlZFwiLEJkPS9cXGR7MSwyfS8sQ2Q9e2Z1dHVyZTpcImluICVzXCIscGFzdDpcIiVzIGFnb1wiLHM6XCJhIGZldyBzZWNvbmRzXCIsbTpcImEgbWludXRlXCIsbW06XCIlZCBtaW51dGVzXCIsaDpcImFuIGhvdXJcIixoaDpcIiVkIGhvdXJzXCIsZDpcImEgZGF5XCIsZGQ6XCIlZCBkYXlzXCIsTTpcImEgbW9udGhcIixNTTpcIiVkIG1vbnRoc1wiLHk6XCJhIHllYXJcIix5eTpcIiVkIHllYXJzXCJ9LERkPXt9LEVkPXt9LEZkPS8oXFxbW15cXFtdKlxcXSl8KFxcXFwpPyhbSGhdbW0oc3MpP3xNb3xNTT9NP00/fERvfERERG98REQ/RD9EP3xkZGQ/ZD98ZG8/fHdbb3x3XT98V1tvfFddP3xRbz98WVlZWVlZfFlZWVlZfFlZWVl8WVl8Z2coZ2dnPyk/fEdHKEdHRz8pP3xlfEV8YXxBfGhoP3xISD98a2s/fG1tP3xzcz98U3sxLDl9fHh8WHx6ej98Wlo/fC4pL2csR2Q9LyhcXFtbXlxcW10qXFxdKXwoXFxcXCk/KExUU3xMVHxMTD9MP0w/fGx7MSw0fSkvZyxIZD17fSxJZD17fSxKZD0vXFxkLyxLZD0vXFxkXFxkLyxMZD0vXFxkezN9LyxNZD0vXFxkezR9LyxOZD0vWystXT9cXGR7Nn0vLE9kPS9cXGRcXGQ/LyxQZD0vXFxkXFxkXFxkXFxkPy8sUWQ9L1xcZFxcZFxcZFxcZFxcZFxcZD8vLFJkPS9cXGR7MSwzfS8sU2Q9L1xcZHsxLDR9LyxUZD0vWystXT9cXGR7MSw2fS8sVWQ9L1xcZCsvLFZkPS9bKy1dP1xcZCsvLFdkPS9afFsrLV1cXGRcXGQ6P1xcZFxcZC9naSxYZD0vWnxbKy1dXFxkXFxkKD86Oj9cXGRcXGQpPy9naSxZZD0vWystXT9cXGQrKFxcLlxcZHsxLDN9KT8vLFpkPS9bMC05XSpbJ2EtelxcdTAwQTAtXFx1MDVGRlxcdTA3MDAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rfFtcXHUwNjAwLVxcdTA2RkZcXC9dKyhcXHMqP1tcXHUwNjAwLVxcdTA2RkZdKyl7MSwyfS9pLCRkPXt9LF9kPXt9LGFlPTAsYmU9MSxjZT0yLGRlPTMsZWU9NCxmZT01LGdlPTYsaGU9NyxpZT04O3ZkPUFycmF5LnByb3RvdHlwZS5pbmRleE9mP0FycmF5LnByb3RvdHlwZS5pbmRleE9mOmZ1bmN0aW9uKGEpe1xuLy8gSSBrbm93XG52YXIgYjtmb3IoYj0wO2I8dGhpcy5sZW5ndGg7KytiKWlmKHRoaXNbYl09PT1hKXJldHVybiBiO3JldHVybi0xfTt2YXIgamU9dmQ7XG4vLyBGT1JNQVRUSU5HXG5VKFwiTVwiLFtcIk1NXCIsMl0sXCJNb1wiLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubW9udGgoKSsxfSksVShcIk1NTVwiLDAsMCxmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubW9udGhzU2hvcnQodGhpcyxhKX0pLFUoXCJNTU1NXCIsMCwwLGZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tb250aHModGhpcyxhKX0pLFxuLy8gQUxJQVNFU1xuSihcIm1vbnRoXCIsXCJNXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJtb250aFwiLDgpLFxuLy8gUEFSU0lOR1xuWihcIk1cIixPZCksWihcIk1NXCIsT2QsS2QpLFooXCJNTU1cIixmdW5jdGlvbihhLGIpe3JldHVybiBiLm1vbnRoc1Nob3J0UmVnZXgoYSl9KSxaKFwiTU1NTVwiLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIubW9udGhzUmVnZXgoYSl9KSxiYShbXCJNXCIsXCJNTVwiXSxmdW5jdGlvbihhLGIpe2JbYmVdPXUoYSktMX0pLGJhKFtcIk1NTVwiLFwiTU1NTVwiXSxmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1jLl9sb2NhbGUubW9udGhzUGFyc2UoYSxkLGMuX3N0cmljdCk7XG4vLyBpZiB3ZSBkaWRuJ3QgZmluZCBhIG1vbnRoIG5hbWUsIG1hcmsgdGhlIGRhdGUgYXMgaW52YWxpZC5cbm51bGwhPWU/YltiZV09ZTptKGMpLmludmFsaWRNb250aD1hfSk7XG4vLyBMT0NBTEVTXG52YXIga2U9L0Rbb0RdPyhcXFtbXlxcW1xcXV0qXFxdfFxccykrTU1NTT8vLGxlPVwiSmFudWFyeV9GZWJydWFyeV9NYXJjaF9BcHJpbF9NYXlfSnVuZV9KdWx5X0F1Z3VzdF9TZXB0ZW1iZXJfT2N0b2Jlcl9Ob3ZlbWJlcl9EZWNlbWJlclwiLnNwbGl0KFwiX1wiKSxtZT1cIkphbl9GZWJfTWFyX0Fwcl9NYXlfSnVuX0p1bF9BdWdfU2VwX09jdF9Ob3ZfRGVjXCIuc3BsaXQoXCJfXCIpLG5lPVpkLG9lPVpkO1xuLy8gRk9STUFUVElOR1xuVShcIllcIiwwLDAsZnVuY3Rpb24oKXt2YXIgYT10aGlzLnllYXIoKTtyZXR1cm4gYTw9OTk5OT9cIlwiK2E6XCIrXCIrYX0pLFUoMCxbXCJZWVwiLDJdLDAsZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy55ZWFyKCklMTAwfSksVSgwLFtcIllZWVlcIiw0XSwwLFwieWVhclwiKSxVKDAsW1wiWVlZWVlcIiw1XSwwLFwieWVhclwiKSxVKDAsW1wiWVlZWVlZXCIsNiwhMF0sMCxcInllYXJcIiksXG4vLyBBTElBU0VTXG5KKFwieWVhclwiLFwieVwiKSxcbi8vIFBSSU9SSVRJRVNcbk0oXCJ5ZWFyXCIsMSksXG4vLyBQQVJTSU5HXG5aKFwiWVwiLFZkKSxaKFwiWVlcIixPZCxLZCksWihcIllZWVlcIixTZCxNZCksWihcIllZWVlZXCIsVGQsTmQpLFooXCJZWVlZWVlcIixUZCxOZCksYmEoW1wiWVlZWVlcIixcIllZWVlZWVwiXSxhZSksYmEoXCJZWVlZXCIsZnVuY3Rpb24oYixjKXtjW2FlXT0yPT09Yi5sZW5ndGg/YS5wYXJzZVR3b0RpZ2l0WWVhcihiKTp1KGIpfSksYmEoXCJZWVwiLGZ1bmN0aW9uKGIsYyl7Y1thZV09YS5wYXJzZVR3b0RpZ2l0WWVhcihiKX0pLGJhKFwiWVwiLGZ1bmN0aW9uKGEsYil7YlthZV09cGFyc2VJbnQoYSwxMCl9KSxcbi8vIEhPT0tTXG5hLnBhcnNlVHdvRGlnaXRZZWFyPWZ1bmN0aW9uKGEpe3JldHVybiB1KGEpKyh1KGEpPjY4PzE5MDA6MmUzKX07XG4vLyBNT01FTlRTXG52YXIgcGU9TyhcIkZ1bGxZZWFyXCIsITApO1xuLy8gRk9STUFUVElOR1xuVShcIndcIixbXCJ3d1wiLDJdLFwid29cIixcIndlZWtcIiksVShcIldcIixbXCJXV1wiLDJdLFwiV29cIixcImlzb1dlZWtcIiksXG4vLyBBTElBU0VTXG5KKFwid2Vla1wiLFwid1wiKSxKKFwiaXNvV2Vla1wiLFwiV1wiKSxcbi8vIFBSSU9SSVRJRVNcbk0oXCJ3ZWVrXCIsNSksTShcImlzb1dlZWtcIiw1KSxcbi8vIFBBUlNJTkdcblooXCJ3XCIsT2QpLFooXCJ3d1wiLE9kLEtkKSxaKFwiV1wiLE9kKSxaKFwiV1dcIixPZCxLZCksY2EoW1wid1wiLFwid3dcIixcIldcIixcIldXXCJdLGZ1bmN0aW9uKGEsYixjLGQpe2JbZC5zdWJzdHIoMCwxKV09dShhKX0pO3ZhciBxZT17ZG93OjAsLy8gU3VuZGF5IGlzIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsuXG5kb3k6Nn07XG4vLyBGT1JNQVRUSU5HXG5VKFwiZFwiLDAsXCJkb1wiLFwiZGF5XCIpLFUoXCJkZFwiLDAsMCxmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXNNaW4odGhpcyxhKX0pLFUoXCJkZGRcIiwwLDAsZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzU2hvcnQodGhpcyxhKX0pLFUoXCJkZGRkXCIsMCwwLGZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5cyh0aGlzLGEpfSksVShcImVcIiwwLDAsXCJ3ZWVrZGF5XCIpLFUoXCJFXCIsMCwwLFwiaXNvV2Vla2RheVwiKSxcbi8vIEFMSUFTRVNcbkooXCJkYXlcIixcImRcIiksSihcIndlZWtkYXlcIixcImVcIiksSihcImlzb1dlZWtkYXlcIixcIkVcIiksXG4vLyBQUklPUklUWVxuTShcImRheVwiLDExKSxNKFwid2Vla2RheVwiLDExKSxNKFwiaXNvV2Vla2RheVwiLDExKSxcbi8vIFBBUlNJTkdcblooXCJkXCIsT2QpLFooXCJlXCIsT2QpLFooXCJFXCIsT2QpLFooXCJkZFwiLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIud2Vla2RheXNNaW5SZWdleChhKX0pLFooXCJkZGRcIixmdW5jdGlvbihhLGIpe3JldHVybiBiLndlZWtkYXlzU2hvcnRSZWdleChhKX0pLFooXCJkZGRkXCIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi53ZWVrZGF5c1JlZ2V4KGEpfSksY2EoW1wiZGRcIixcImRkZFwiLFwiZGRkZFwiXSxmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1jLl9sb2NhbGUud2Vla2RheXNQYXJzZShhLGQsYy5fc3RyaWN0KTtcbi8vIGlmIHdlIGRpZG4ndCBnZXQgYSB3ZWVrZGF5IG5hbWUsIG1hcmsgdGhlIGRhdGUgYXMgaW52YWxpZFxubnVsbCE9ZT9iLmQ9ZTptKGMpLmludmFsaWRXZWVrZGF5PWF9KSxjYShbXCJkXCIsXCJlXCIsXCJFXCJdLGZ1bmN0aW9uKGEsYixjLGQpe2JbZF09dShhKX0pO1xuLy8gTE9DQUxFU1xudmFyIHJlPVwiU3VuZGF5X01vbmRheV9UdWVzZGF5X1dlZG5lc2RheV9UaHVyc2RheV9GcmlkYXlfU2F0dXJkYXlcIi5zcGxpdChcIl9cIiksc2U9XCJTdW5fTW9uX1R1ZV9XZWRfVGh1X0ZyaV9TYXRcIi5zcGxpdChcIl9cIiksdGU9XCJTdV9Nb19UdV9XZV9UaF9Gcl9TYVwiLnNwbGl0KFwiX1wiKSx1ZT1aZCx2ZT1aZCx3ZT1aZDtVKFwiSFwiLFtcIkhIXCIsMl0sMCxcImhvdXJcIiksVShcImhcIixbXCJoaFwiLDJdLDAsUmEpLFUoXCJrXCIsW1wia2tcIiwyXSwwLFNhKSxVKFwiaG1tXCIsMCwwLGZ1bmN0aW9uKCl7cmV0dXJuXCJcIitSYS5hcHBseSh0aGlzKStUKHRoaXMubWludXRlcygpLDIpfSksVShcImhtbXNzXCIsMCwwLGZ1bmN0aW9uKCl7cmV0dXJuXCJcIitSYS5hcHBseSh0aGlzKStUKHRoaXMubWludXRlcygpLDIpK1QodGhpcy5zZWNvbmRzKCksMil9KSxVKFwiSG1tXCIsMCwwLGZ1bmN0aW9uKCl7cmV0dXJuXCJcIit0aGlzLmhvdXJzKCkrVCh0aGlzLm1pbnV0ZXMoKSwyKX0pLFUoXCJIbW1zc1wiLDAsMCxmdW5jdGlvbigpe3JldHVyblwiXCIrdGhpcy5ob3VycygpK1QodGhpcy5taW51dGVzKCksMikrVCh0aGlzLnNlY29uZHMoKSwyKX0pLFRhKFwiYVwiLCEwKSxUYShcIkFcIiwhMSksXG4vLyBBTElBU0VTXG5KKFwiaG91clwiLFwiaFwiKSxcbi8vIFBSSU9SSVRZXG5NKFwiaG91clwiLDEzKSxaKFwiYVwiLFVhKSxaKFwiQVwiLFVhKSxaKFwiSFwiLE9kKSxaKFwiaFwiLE9kKSxaKFwiSEhcIixPZCxLZCksWihcImhoXCIsT2QsS2QpLFooXCJobW1cIixQZCksWihcImhtbXNzXCIsUWQpLFooXCJIbW1cIixQZCksWihcIkhtbXNzXCIsUWQpLGJhKFtcIkhcIixcIkhIXCJdLGRlKSxiYShbXCJhXCIsXCJBXCJdLGZ1bmN0aW9uKGEsYixjKXtjLl9pc1BtPWMuX2xvY2FsZS5pc1BNKGEpLGMuX21lcmlkaWVtPWF9KSxiYShbXCJoXCIsXCJoaFwiXSxmdW5jdGlvbihhLGIsYyl7YltkZV09dShhKSxtKGMpLmJpZ0hvdXI9ITB9KSxiYShcImhtbVwiLGZ1bmN0aW9uKGEsYixjKXt2YXIgZD1hLmxlbmd0aC0yO2JbZGVdPXUoYS5zdWJzdHIoMCxkKSksYltlZV09dShhLnN1YnN0cihkKSksbShjKS5iaWdIb3VyPSEwfSksYmEoXCJobW1zc1wiLGZ1bmN0aW9uKGEsYixjKXt2YXIgZD1hLmxlbmd0aC00LGU9YS5sZW5ndGgtMjtiW2RlXT11KGEuc3Vic3RyKDAsZCkpLGJbZWVdPXUoYS5zdWJzdHIoZCwyKSksYltmZV09dShhLnN1YnN0cihlKSksbShjKS5iaWdIb3VyPSEwfSksYmEoXCJIbW1cIixmdW5jdGlvbihhLGIsYyl7dmFyIGQ9YS5sZW5ndGgtMjtiW2RlXT11KGEuc3Vic3RyKDAsZCkpLGJbZWVdPXUoYS5zdWJzdHIoZCkpfSksYmEoXCJIbW1zc1wiLGZ1bmN0aW9uKGEsYixjKXt2YXIgZD1hLmxlbmd0aC00LGU9YS5sZW5ndGgtMjtiW2RlXT11KGEuc3Vic3RyKDAsZCkpLGJbZWVdPXUoYS5zdWJzdHIoZCwyKSksYltmZV09dShhLnN1YnN0cihlKSl9KTt2YXIgeGUseWU9L1thcF1cXC4/bT9cXC4/L2ksemU9TyhcIkhvdXJzXCIsITApLEFlPXtjYWxlbmRhcjp4ZCxsb25nRGF0ZUZvcm1hdDp5ZCxpbnZhbGlkRGF0ZTp6ZCxvcmRpbmFsOkFkLG9yZGluYWxQYXJzZTpCZCxyZWxhdGl2ZVRpbWU6Q2QsbW9udGhzOmxlLG1vbnRoc1Nob3J0Om1lLHdlZWs6cWUsd2Vla2RheXM6cmUsd2Vla2RheXNNaW46dGUsd2Vla2RheXNTaG9ydDpzZSxtZXJpZGllbVBhcnNlOnllfSxCZT17fSxDZT17fSxEZT0vXlxccyooKD86WystXVxcZHs2fXxcXGR7NH0pLSg/OlxcZFxcZC1cXGRcXGR8V1xcZFxcZC1cXGR8V1xcZFxcZHxcXGRcXGRcXGR8XFxkXFxkKSkoPzooVHwgKShcXGRcXGQoPzo6XFxkXFxkKD86OlxcZFxcZCg/OlsuLF1cXGQrKT8pPyk/KShbXFwrXFwtXVxcZFxcZCg/Ojo/XFxkXFxkKT98XFxzKlopPyk/JC8sRWU9L15cXHMqKCg/OlsrLV1cXGR7Nn18XFxkezR9KSg/OlxcZFxcZFxcZFxcZHxXXFxkXFxkXFxkfFdcXGRcXGR8XFxkXFxkXFxkfFxcZFxcZCkpKD86KFR8ICkoXFxkXFxkKD86XFxkXFxkKD86XFxkXFxkKD86Wy4sXVxcZCspPyk/KT8pKFtcXCtcXC1dXFxkXFxkKD86Oj9cXGRcXGQpP3xcXHMqWik/KT8kLyxGZT0vWnxbKy1dXFxkXFxkKD86Oj9cXGRcXGQpPy8sR2U9W1tcIllZWVlZWS1NTS1ERFwiLC9bKy1dXFxkezZ9LVxcZFxcZC1cXGRcXGQvXSxbXCJZWVlZLU1NLUREXCIsL1xcZHs0fS1cXGRcXGQtXFxkXFxkL10sW1wiR0dHRy1bV11XVy1FXCIsL1xcZHs0fS1XXFxkXFxkLVxcZC9dLFtcIkdHR0ctW1ddV1dcIiwvXFxkezR9LVdcXGRcXGQvLCExXSxbXCJZWVlZLURERFwiLC9cXGR7NH0tXFxkezN9L10sW1wiWVlZWS1NTVwiLC9cXGR7NH0tXFxkXFxkLywhMV0sW1wiWVlZWVlZTU1ERFwiLC9bKy1dXFxkezEwfS9dLFtcIllZWVlNTUREXCIsL1xcZHs4fS9dLFxuLy8gWVlZWU1NIGlzIE5PVCBhbGxvd2VkIGJ5IHRoZSBzdGFuZGFyZFxuW1wiR0dHR1tXXVdXRVwiLC9cXGR7NH1XXFxkezN9L10sW1wiR0dHR1tXXVdXXCIsL1xcZHs0fVdcXGR7Mn0vLCExXSxbXCJZWVlZREREXCIsL1xcZHs3fS9dXSxIZT1bW1wiSEg6bW06c3MuU1NTU1wiLC9cXGRcXGQ6XFxkXFxkOlxcZFxcZFxcLlxcZCsvXSxbXCJISDptbTpzcyxTU1NTXCIsL1xcZFxcZDpcXGRcXGQ6XFxkXFxkLFxcZCsvXSxbXCJISDptbTpzc1wiLC9cXGRcXGQ6XFxkXFxkOlxcZFxcZC9dLFtcIkhIOm1tXCIsL1xcZFxcZDpcXGRcXGQvXSxbXCJISG1tc3MuU1NTU1wiLC9cXGRcXGRcXGRcXGRcXGRcXGRcXC5cXGQrL10sW1wiSEhtbXNzLFNTU1NcIiwvXFxkXFxkXFxkXFxkXFxkXFxkLFxcZCsvXSxbXCJISG1tc3NcIiwvXFxkXFxkXFxkXFxkXFxkXFxkL10sW1wiSEhtbVwiLC9cXGRcXGRcXGRcXGQvXSxbXCJISFwiLC9cXGRcXGQvXV0sSWU9L15cXC8/RGF0ZVxcKChcXC0/XFxkKykvaTthLmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrPXgoXCJ2YWx1ZSBwcm92aWRlZCBpcyBub3QgaW4gYSByZWNvZ25pemVkIElTTyBmb3JtYXQuIG1vbWVudCBjb25zdHJ1Y3Rpb24gZmFsbHMgYmFjayB0byBqcyBEYXRlKCksIHdoaWNoIGlzIG5vdCByZWxpYWJsZSBhY3Jvc3MgYWxsIGJyb3dzZXJzIGFuZCB2ZXJzaW9ucy4gTm9uIElTTyBkYXRlIGZvcm1hdHMgYXJlIGRpc2NvdXJhZ2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gYW4gdXBjb21pbmcgbWFqb3IgcmVsZWFzZS4gUGxlYXNlIHJlZmVyIHRvIGh0dHA6Ly9tb21lbnRqcy5jb20vZ3VpZGVzLyMvd2FybmluZ3MvanMtZGF0ZS8gZm9yIG1vcmUgaW5mby5cIixmdW5jdGlvbihhKXthLl9kPW5ldyBEYXRlKGEuX2krKGEuX3VzZVVUQz9cIiBVVENcIjpcIlwiKSl9KSxcbi8vIGNvbnN0YW50IHRoYXQgcmVmZXJzIHRvIHRoZSBJU08gc3RhbmRhcmRcbmEuSVNPXzg2MDE9ZnVuY3Rpb24oKXt9O3ZhciBKZT14KFwibW9tZW50KCkubWluIGlzIGRlcHJlY2F0ZWQsIHVzZSBtb21lbnQubWF4IGluc3RlYWQuIGh0dHA6Ly9tb21lbnRqcy5jb20vZ3VpZGVzLyMvd2FybmluZ3MvbWluLW1heC9cIixmdW5jdGlvbigpe3ZhciBhPXNiLmFwcGx5KG51bGwsYXJndW1lbnRzKTtyZXR1cm4gdGhpcy5pc1ZhbGlkKCkmJmEuaXNWYWxpZCgpP2E8dGhpcz90aGlzOmE6bygpfSksS2U9eChcIm1vbWVudCgpLm1heCBpcyBkZXByZWNhdGVkLCB1c2UgbW9tZW50Lm1pbiBpbnN0ZWFkLiBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL21pbi1tYXgvXCIsZnVuY3Rpb24oKXt2YXIgYT1zYi5hcHBseShudWxsLGFyZ3VtZW50cyk7cmV0dXJuIHRoaXMuaXNWYWxpZCgpJiZhLmlzVmFsaWQoKT9hPnRoaXM/dGhpczphOm8oKX0pLExlPWZ1bmN0aW9uKCl7cmV0dXJuIERhdGUubm93P0RhdGUubm93KCk6K25ldyBEYXRlfTt6YihcIlpcIixcIjpcIiksemIoXCJaWlwiLFwiXCIpLFxuLy8gUEFSU0lOR1xuWihcIlpcIixYZCksWihcIlpaXCIsWGQpLGJhKFtcIlpcIixcIlpaXCJdLGZ1bmN0aW9uKGEsYixjKXtjLl91c2VVVEM9ITAsYy5fdHptPUFiKFhkLGEpfSk7XG4vLyBIRUxQRVJTXG4vLyB0aW1lem9uZSBjaHVua2VyXG4vLyAnKzEwOjAwJyA+IFsnMTAnLCAgJzAwJ11cbi8vICctMTUzMCcgID4gWyctMTUnLCAnMzAnXVxudmFyIE1lPS8oW1xcK1xcLV18XFxkXFxkKS9naTtcbi8vIEhPT0tTXG4vLyBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHdoZW5ldmVyIGEgbW9tZW50IGlzIG11dGF0ZWQuXG4vLyBJdCBpcyBpbnRlbmRlZCB0byBrZWVwIHRoZSBvZmZzZXQgaW4gc3luYyB3aXRoIHRoZSB0aW1lem9uZS5cbmEudXBkYXRlT2Zmc2V0PWZ1bmN0aW9uKCl7fTtcbi8vIEFTUC5ORVQganNvbiBkYXRlIGZvcm1hdCByZWdleFxudmFyIE5lPS9eKFxcLSk/KD86KFxcZCopWy4gXSk/KFxcZCspXFw6KFxcZCspKD86XFw6KFxcZCspKFxcLlxcZCopPyk/JC8sT2U9L14oLSk/UCg/OigtP1swLTksLl0qKVkpPyg/OigtP1swLTksLl0qKU0pPyg/OigtP1swLTksLl0qKVcpPyg/OigtP1swLTksLl0qKUQpPyg/OlQoPzooLT9bMC05LC5dKilIKT8oPzooLT9bMC05LC5dKilNKT8oPzooLT9bMC05LC5dKilTKT8pPyQvO09iLmZuPXdiLnByb3RvdHlwZTt2YXIgUGU9U2IoMSxcImFkZFwiKSxRZT1TYigtMSxcInN1YnRyYWN0XCIpO2EuZGVmYXVsdEZvcm1hdD1cIllZWVktTU0tRERUSEg6bW06c3NaXCIsYS5kZWZhdWx0Rm9ybWF0VXRjPVwiWVlZWS1NTS1ERFRISDptbTpzc1taXVwiO3ZhciBSZT14KFwibW9tZW50KCkubGFuZygpIGlzIGRlcHJlY2F0ZWQuIEluc3RlYWQsIHVzZSBtb21lbnQoKS5sb2NhbGVEYXRhKCkgdG8gZ2V0IHRoZSBsYW5ndWFnZSBjb25maWd1cmF0aW9uLiBVc2UgbW9tZW50KCkubG9jYWxlKCkgdG8gY2hhbmdlIGxhbmd1YWdlcy5cIixmdW5jdGlvbihhKXtyZXR1cm4gdm9pZCAwPT09YT90aGlzLmxvY2FsZURhdGEoKTp0aGlzLmxvY2FsZShhKX0pO1xuLy8gRk9STUFUVElOR1xuVSgwLFtcImdnXCIsMl0sMCxmdW5jdGlvbigpe3JldHVybiB0aGlzLndlZWtZZWFyKCklMTAwfSksVSgwLFtcIkdHXCIsMl0sMCxmdW5jdGlvbigpe3JldHVybiB0aGlzLmlzb1dlZWtZZWFyKCklMTAwfSksemMoXCJnZ2dnXCIsXCJ3ZWVrWWVhclwiKSx6YyhcImdnZ2dnXCIsXCJ3ZWVrWWVhclwiKSx6YyhcIkdHR0dcIixcImlzb1dlZWtZZWFyXCIpLHpjKFwiR0dHR0dcIixcImlzb1dlZWtZZWFyXCIpLFxuLy8gQUxJQVNFU1xuSihcIndlZWtZZWFyXCIsXCJnZ1wiKSxKKFwiaXNvV2Vla1llYXJcIixcIkdHXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJ3ZWVrWWVhclwiLDEpLE0oXCJpc29XZWVrWWVhclwiLDEpLFxuLy8gUEFSU0lOR1xuWihcIkdcIixWZCksWihcImdcIixWZCksWihcIkdHXCIsT2QsS2QpLFooXCJnZ1wiLE9kLEtkKSxaKFwiR0dHR1wiLFNkLE1kKSxaKFwiZ2dnZ1wiLFNkLE1kKSxaKFwiR0dHR0dcIixUZCxOZCksWihcImdnZ2dnXCIsVGQsTmQpLGNhKFtcImdnZ2dcIixcImdnZ2dnXCIsXCJHR0dHXCIsXCJHR0dHR1wiXSxmdW5jdGlvbihhLGIsYyxkKXtiW2Quc3Vic3RyKDAsMildPXUoYSl9KSxjYShbXCJnZ1wiLFwiR0dcIl0sZnVuY3Rpb24oYixjLGQsZSl7Y1tlXT1hLnBhcnNlVHdvRGlnaXRZZWFyKGIpfSksXG4vLyBGT1JNQVRUSU5HXG5VKFwiUVwiLDAsXCJRb1wiLFwicXVhcnRlclwiKSxcbi8vIEFMSUFTRVNcbkooXCJxdWFydGVyXCIsXCJRXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJxdWFydGVyXCIsNyksXG4vLyBQQVJTSU5HXG5aKFwiUVwiLEpkKSxiYShcIlFcIixmdW5jdGlvbihhLGIpe2JbYmVdPTMqKHUoYSktMSl9KSxcbi8vIEZPUk1BVFRJTkdcblUoXCJEXCIsW1wiRERcIiwyXSxcIkRvXCIsXCJkYXRlXCIpLFxuLy8gQUxJQVNFU1xuSihcImRhdGVcIixcIkRcIiksXG4vLyBQUklPUk9JVFlcbk0oXCJkYXRlXCIsOSksXG4vLyBQQVJTSU5HXG5aKFwiRFwiLE9kKSxaKFwiRERcIixPZCxLZCksWihcIkRvXCIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT9iLl9vcmRpbmFsUGFyc2U6Yi5fb3JkaW5hbFBhcnNlTGVuaWVudH0pLGJhKFtcIkRcIixcIkREXCJdLGNlKSxiYShcIkRvXCIsZnVuY3Rpb24oYSxiKXtiW2NlXT11KGEubWF0Y2goT2QpWzBdLDEwKX0pO1xuLy8gTU9NRU5UU1xudmFyIFNlPU8oXCJEYXRlXCIsITApO1xuLy8gRk9STUFUVElOR1xuVShcIkRERFwiLFtcIkRERERcIiwzXSxcIkRERG9cIixcImRheU9mWWVhclwiKSxcbi8vIEFMSUFTRVNcbkooXCJkYXlPZlllYXJcIixcIkRERFwiKSxcbi8vIFBSSU9SSVRZXG5NKFwiZGF5T2ZZZWFyXCIsNCksXG4vLyBQQVJTSU5HXG5aKFwiREREXCIsUmQpLFooXCJEREREXCIsTGQpLGJhKFtcIkRERFwiLFwiRERERFwiXSxmdW5jdGlvbihhLGIsYyl7Yy5fZGF5T2ZZZWFyPXUoYSl9KSxcbi8vIEZPUk1BVFRJTkdcblUoXCJtXCIsW1wibW1cIiwyXSwwLFwibWludXRlXCIpLFxuLy8gQUxJQVNFU1xuSihcIm1pbnV0ZVwiLFwibVwiKSxcbi8vIFBSSU9SSVRZXG5NKFwibWludXRlXCIsMTQpLFxuLy8gUEFSU0lOR1xuWihcIm1cIixPZCksWihcIm1tXCIsT2QsS2QpLGJhKFtcIm1cIixcIm1tXCJdLGVlKTtcbi8vIE1PTUVOVFNcbnZhciBUZT1PKFwiTWludXRlc1wiLCExKTtcbi8vIEZPUk1BVFRJTkdcblUoXCJzXCIsW1wic3NcIiwyXSwwLFwic2Vjb25kXCIpLFxuLy8gQUxJQVNFU1xuSihcInNlY29uZFwiLFwic1wiKSxcbi8vIFBSSU9SSVRZXG5NKFwic2Vjb25kXCIsMTUpLFxuLy8gUEFSU0lOR1xuWihcInNcIixPZCksWihcInNzXCIsT2QsS2QpLGJhKFtcInNcIixcInNzXCJdLGZlKTtcbi8vIE1PTUVOVFNcbnZhciBVZT1PKFwiU2Vjb25kc1wiLCExKTtcbi8vIEZPUk1BVFRJTkdcblUoXCJTXCIsMCwwLGZ1bmN0aW9uKCl7cmV0dXJufn4odGhpcy5taWxsaXNlY29uZCgpLzEwMCl9KSxVKDAsW1wiU1NcIiwyXSwwLGZ1bmN0aW9uKCl7cmV0dXJufn4odGhpcy5taWxsaXNlY29uZCgpLzEwKX0pLFUoMCxbXCJTU1NcIiwzXSwwLFwibWlsbGlzZWNvbmRcIiksVSgwLFtcIlNTU1NcIiw0XSwwLGZ1bmN0aW9uKCl7cmV0dXJuIDEwKnRoaXMubWlsbGlzZWNvbmQoKX0pLFUoMCxbXCJTU1NTU1wiLDVdLDAsZnVuY3Rpb24oKXtyZXR1cm4gMTAwKnRoaXMubWlsbGlzZWNvbmQoKX0pLFUoMCxbXCJTU1NTU1NcIiw2XSwwLGZ1bmN0aW9uKCl7cmV0dXJuIDFlMyp0aGlzLm1pbGxpc2Vjb25kKCl9KSxVKDAsW1wiU1NTU1NTU1wiLDddLDAsZnVuY3Rpb24oKXtyZXR1cm4gMWU0KnRoaXMubWlsbGlzZWNvbmQoKX0pLFUoMCxbXCJTU1NTU1NTU1wiLDhdLDAsZnVuY3Rpb24oKXtyZXR1cm4gMWU1KnRoaXMubWlsbGlzZWNvbmQoKX0pLFUoMCxbXCJTU1NTU1NTU1NcIiw5XSwwLGZ1bmN0aW9uKCl7cmV0dXJuIDFlNip0aGlzLm1pbGxpc2Vjb25kKCl9KSxcbi8vIEFMSUFTRVNcbkooXCJtaWxsaXNlY29uZFwiLFwibXNcIiksXG4vLyBQUklPUklUWVxuTShcIm1pbGxpc2Vjb25kXCIsMTYpLFxuLy8gUEFSU0lOR1xuWihcIlNcIixSZCxKZCksWihcIlNTXCIsUmQsS2QpLFooXCJTU1NcIixSZCxMZCk7dmFyIFZlO2ZvcihWZT1cIlNTU1NcIjtWZS5sZW5ndGg8PTk7VmUrPVwiU1wiKVooVmUsVWQpO2ZvcihWZT1cIlNcIjtWZS5sZW5ndGg8PTk7VmUrPVwiU1wiKWJhKFZlLEljKTtcbi8vIE1PTUVOVFNcbnZhciBXZT1PKFwiTWlsbGlzZWNvbmRzXCIsITEpO1xuLy8gRk9STUFUVElOR1xuVShcInpcIiwwLDAsXCJ6b25lQWJiclwiKSxVKFwienpcIiwwLDAsXCJ6b25lTmFtZVwiKTt2YXIgWGU9ci5wcm90b3R5cGU7WGUuYWRkPVBlLFhlLmNhbGVuZGFyPVZiLFhlLmNsb25lPVdiLFhlLmRpZmY9YmMsWGUuZW5kT2Y9b2MsWGUuZm9ybWF0PWdjLFhlLmZyb209aGMsWGUuZnJvbU5vdz1pYyxYZS50bz1qYyxYZS50b05vdz1rYyxYZS5nZXQ9UixYZS5pbnZhbGlkQXQ9eGMsWGUuaXNBZnRlcj1YYixYZS5pc0JlZm9yZT1ZYixYZS5pc0JldHdlZW49WmIsWGUuaXNTYW1lPSRiLFhlLmlzU2FtZU9yQWZ0ZXI9X2IsWGUuaXNTYW1lT3JCZWZvcmU9YWMsWGUuaXNWYWxpZD12YyxYZS5sYW5nPVJlLFhlLmxvY2FsZT1sYyxYZS5sb2NhbGVEYXRhPW1jLFhlLm1heD1LZSxYZS5taW49SmUsWGUucGFyc2luZ0ZsYWdzPXdjLFhlLnNldD1TLFhlLnN0YXJ0T2Y9bmMsWGUuc3VidHJhY3Q9UWUsWGUudG9BcnJheT1zYyxYZS50b09iamVjdD10YyxYZS50b0RhdGU9cmMsWGUudG9JU09TdHJpbmc9ZWMsWGUuaW5zcGVjdD1mYyxYZS50b0pTT049dWMsWGUudG9TdHJpbmc9ZGMsWGUudW5peD1xYyxYZS52YWx1ZU9mPXBjLFhlLmNyZWF0aW9uRGF0YT15Yyxcbi8vIFllYXJcblhlLnllYXI9cGUsWGUuaXNMZWFwWWVhcj1yYSxcbi8vIFdlZWsgWWVhclxuWGUud2Vla1llYXI9QWMsWGUuaXNvV2Vla1llYXI9QmMsXG4vLyBRdWFydGVyXG5YZS5xdWFydGVyPVhlLnF1YXJ0ZXJzPUdjLFxuLy8gTW9udGhcblhlLm1vbnRoPWthLFhlLmRheXNJbk1vbnRoPWxhLFxuLy8gV2Vla1xuWGUud2Vlaz1YZS53ZWVrcz1CYSxYZS5pc29XZWVrPVhlLmlzb1dlZWtzPUNhLFhlLndlZWtzSW5ZZWFyPURjLFhlLmlzb1dlZWtzSW5ZZWFyPUNjLFxuLy8gRGF5XG5YZS5kYXRlPVNlLFhlLmRheT1YZS5kYXlzPUthLFhlLndlZWtkYXk9TGEsWGUuaXNvV2Vla2RheT1NYSxYZS5kYXlPZlllYXI9SGMsXG4vLyBIb3VyXG5YZS5ob3VyPVhlLmhvdXJzPXplLFxuLy8gTWludXRlXG5YZS5taW51dGU9WGUubWludXRlcz1UZSxcbi8vIFNlY29uZFxuWGUuc2Vjb25kPVhlLnNlY29uZHM9VWUsXG4vLyBNaWxsaXNlY29uZFxuWGUubWlsbGlzZWNvbmQ9WGUubWlsbGlzZWNvbmRzPVdlLFxuLy8gT2Zmc2V0XG5YZS51dGNPZmZzZXQ9RGIsWGUudXRjPUZiLFhlLmxvY2FsPUdiLFhlLnBhcnNlWm9uZT1IYixYZS5oYXNBbGlnbmVkSG91ck9mZnNldD1JYixYZS5pc0RTVD1KYixYZS5pc0xvY2FsPUxiLFhlLmlzVXRjT2Zmc2V0PU1iLFhlLmlzVXRjPU5iLFhlLmlzVVRDPU5iLFxuLy8gVGltZXpvbmVcblhlLnpvbmVBYmJyPUpjLFhlLnpvbmVOYW1lPUtjLFxuLy8gRGVwcmVjYXRpb25zXG5YZS5kYXRlcz14KFwiZGF0ZXMgYWNjZXNzb3IgaXMgZGVwcmVjYXRlZC4gVXNlIGRhdGUgaW5zdGVhZC5cIixTZSksWGUubW9udGhzPXgoXCJtb250aHMgYWNjZXNzb3IgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbnRoIGluc3RlYWRcIixrYSksWGUueWVhcnM9eChcInllYXJzIGFjY2Vzc29yIGlzIGRlcHJlY2F0ZWQuIFVzZSB5ZWFyIGluc3RlYWRcIixwZSksWGUuem9uZT14KFwibW9tZW50KCkuem9uZSBpcyBkZXByZWNhdGVkLCB1c2UgbW9tZW50KCkudXRjT2Zmc2V0IGluc3RlYWQuIGh0dHA6Ly9tb21lbnRqcy5jb20vZ3VpZGVzLyMvd2FybmluZ3Mvem9uZS9cIixFYiksWGUuaXNEU1RTaGlmdGVkPXgoXCJpc0RTVFNoaWZ0ZWQgaXMgZGVwcmVjYXRlZC4gU2VlIGh0dHA6Ly9tb21lbnRqcy5jb20vZ3VpZGVzLyMvd2FybmluZ3MvZHN0LXNoaWZ0ZWQvIGZvciBtb3JlIGluZm9ybWF0aW9uXCIsS2IpO3ZhciBZZT1DLnByb3RvdHlwZTtZZS5jYWxlbmRhcj1ELFllLmxvbmdEYXRlRm9ybWF0PUUsWWUuaW52YWxpZERhdGU9RixZZS5vcmRpbmFsPUcsWWUucHJlcGFyc2U9TmMsWWUucG9zdGZvcm1hdD1OYyxZZS5yZWxhdGl2ZVRpbWU9SCxZZS5wYXN0RnV0dXJlPUksWWUuc2V0PUEsXG4vLyBNb250aFxuWWUubW9udGhzPWZhLFllLm1vbnRoc1Nob3J0PWdhLFllLm1vbnRoc1BhcnNlPWlhLFllLm1vbnRoc1JlZ2V4PW5hLFllLm1vbnRoc1Nob3J0UmVnZXg9bWEsXG4vLyBXZWVrXG5ZZS53ZWVrPXlhLFllLmZpcnN0RGF5T2ZZZWFyPUFhLFllLmZpcnN0RGF5T2ZXZWVrPXphLFxuLy8gRGF5IG9mIFdlZWtcblllLndlZWtkYXlzPUZhLFllLndlZWtkYXlzTWluPUhhLFllLndlZWtkYXlzU2hvcnQ9R2EsWWUud2Vla2RheXNQYXJzZT1KYSxZZS53ZWVrZGF5c1JlZ2V4PU5hLFllLndlZWtkYXlzU2hvcnRSZWdleD1PYSxZZS53ZWVrZGF5c01pblJlZ2V4PVBhLFxuLy8gSG91cnNcblllLmlzUE09VmEsWWUubWVyaWRpZW09V2EsJGEoXCJlblwiLHtvcmRpbmFsUGFyc2U6L1xcZHsxLDJ9KHRofHN0fG5kfHJkKS8sb3JkaW5hbDpmdW5jdGlvbihhKXt2YXIgYj1hJTEwLGM9MT09PXUoYSUxMDAvMTApP1widGhcIjoxPT09Yj9cInN0XCI6Mj09PWI/XCJuZFwiOjM9PT1iP1wicmRcIjpcInRoXCI7cmV0dXJuIGErY319KSxcbi8vIFNpZGUgZWZmZWN0IGltcG9ydHNcbmEubGFuZz14KFwibW9tZW50LmxhbmcgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbWVudC5sb2NhbGUgaW5zdGVhZC5cIiwkYSksYS5sYW5nRGF0YT14KFwibW9tZW50LmxhbmdEYXRhIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb21lbnQubG9jYWxlRGF0YSBpbnN0ZWFkLlwiLGJiKTt2YXIgWmU9TWF0aC5hYnMsJGU9ZWQoXCJtc1wiKSxfZT1lZChcInNcIiksYWY9ZWQoXCJtXCIpLGJmPWVkKFwiaFwiKSxjZj1lZChcImRcIiksZGY9ZWQoXCJ3XCIpLGVmPWVkKFwiTVwiKSxmZj1lZChcInlcIiksZ2Y9Z2QoXCJtaWxsaXNlY29uZHNcIiksaGY9Z2QoXCJzZWNvbmRzXCIpLGpmPWdkKFwibWludXRlc1wiKSxrZj1nZChcImhvdXJzXCIpLGxmPWdkKFwiZGF5c1wiKSxtZj1nZChcIm1vbnRoc1wiKSxuZj1nZChcInllYXJzXCIpLG9mPU1hdGgucm91bmQscGY9e3M6NDUsLy8gc2Vjb25kcyB0byBtaW51dGVcbm06NDUsLy8gbWludXRlcyB0byBob3VyXG5oOjIyLC8vIGhvdXJzIHRvIGRheVxuZDoyNiwvLyBkYXlzIHRvIG1vbnRoXG5NOjExfSxxZj1NYXRoLmFicyxyZj13Yi5wcm90b3R5cGU7XG4vLyBEZXByZWNhdGlvbnNcbi8vIFNpZGUgZWZmZWN0IGltcG9ydHNcbi8vIEZPUk1BVFRJTkdcbi8vIFBBUlNJTkdcbi8vIFNpZGUgZWZmZWN0IGltcG9ydHNcbnJldHVybiByZi5hYnM9V2MscmYuYWRkPVljLHJmLnN1YnRyYWN0PVpjLHJmLmFzPWNkLHJmLmFzTWlsbGlzZWNvbmRzPSRlLHJmLmFzU2Vjb25kcz1fZSxyZi5hc01pbnV0ZXM9YWYscmYuYXNIb3Vycz1iZixyZi5hc0RheXM9Y2YscmYuYXNXZWVrcz1kZixyZi5hc01vbnRocz1lZixyZi5hc1llYXJzPWZmLHJmLnZhbHVlT2Y9ZGQscmYuX2J1YmJsZT1fYyxyZi5nZXQ9ZmQscmYubWlsbGlzZWNvbmRzPWdmLHJmLnNlY29uZHM9aGYscmYubWludXRlcz1qZixyZi5ob3Vycz1rZixyZi5kYXlzPWxmLHJmLndlZWtzPWhkLHJmLm1vbnRocz1tZixyZi55ZWFycz1uZixyZi5odW1hbml6ZT1tZCxyZi50b0lTT1N0cmluZz1uZCxyZi50b1N0cmluZz1uZCxyZi50b0pTT049bmQscmYubG9jYWxlPWxjLHJmLmxvY2FsZURhdGE9bWMscmYudG9Jc29TdHJpbmc9eChcInRvSXNvU3RyaW5nKCkgaXMgZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSB0b0lTT1N0cmluZygpIGluc3RlYWQgKG5vdGljZSB0aGUgY2FwaXRhbHMpXCIsbmQpLHJmLmxhbmc9UmUsVShcIlhcIiwwLDAsXCJ1bml4XCIpLFUoXCJ4XCIsMCwwLFwidmFsdWVPZlwiKSxaKFwieFwiLFZkKSxaKFwiWFwiLFlkKSxiYShcIlhcIixmdW5jdGlvbihhLGIsYyl7Yy5fZD1uZXcgRGF0ZSgxZTMqcGFyc2VGbG9hdChhLDEwKSl9KSxiYShcInhcIixmdW5jdGlvbihhLGIsYyl7Yy5fZD1uZXcgRGF0ZSh1KGEpKX0pLGEudmVyc2lvbj1cIjIuMTcuMVwiLGIoc2IpLGEuZm49WGUsYS5taW49dWIsYS5tYXg9dmIsYS5ub3c9TGUsYS51dGM9ayxhLnVuaXg9TGMsYS5tb250aHM9UmMsYS5pc0RhdGU9ZyxhLmxvY2FsZT0kYSxhLmludmFsaWQ9byxhLmR1cmF0aW9uPU9iLGEuaXNNb21lbnQ9cyxhLndlZWtkYXlzPVRjLGEucGFyc2Vab25lPU1jLGEubG9jYWxlRGF0YT1iYixhLmlzRHVyYXRpb249eGIsYS5tb250aHNTaG9ydD1TYyxhLndlZWtkYXlzTWluPVZjLGEuZGVmaW5lTG9jYWxlPV9hLGEudXBkYXRlTG9jYWxlPWFiLGEubG9jYWxlcz1jYixhLndlZWtkYXlzU2hvcnQ9VWMsYS5ub3JtYWxpemVVbml0cz1LLGEucmVsYXRpdmVUaW1lUm91bmRpbmc9a2QsYS5yZWxhdGl2ZVRpbWVUaHJlc2hvbGQ9bGQsYS5jYWxlbmRhckZvcm1hdD1VYixhLnByb3RvdHlwZT1YZSxhfSk7IiwiYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmZhY3RvcnkoJ2FkZEZlZWRTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICB2YXIgbGlzdEZlZWRzID0gW107XHJcbiAgICBmdW5jdGlvbiBzYXZlRmVlZChmZWVkLCBmZWVkVXJsKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hZGRGZWVkJywge2ZlZWRMaW5rOiBmZWVkVXJsLCBmZWVkQ2F0ZWdvcnk6IGZlZWQuZmVlZENhdGVnb3J5LCBmZWVkVGl0bGU6IGZlZWQuZmVlZFRpdGxlIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXNwb25zZSBpbiBnZXRTYXZlZEZlZWQ6IFwiLCByZXMpO1xyXG4gICAgICAgICAgICAgICAgLy8gbGlzdEZlZWRzLnB1c2gocmVzLmRhdGEpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbiBub3QgZ2V0IHNhdmVkIGZlZWQnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgIH1cclxuICAgIC8vIGZ1bmN0aW9uIHNhdmVEYXRhIChmZWVkKSB7XHJcbiAgICAvLyAgICAgbGlzdEZlZWRzLnB1c2goZmVlZCk7XHJcbiAgICAvLyB9XHJcbiBcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRQYXJzZWRGZWVkKGZlZWQsIGNhdGVnb3J5KSB7XHJcbiAgICAgICAgZmVlZCA9IGZlZWQuZmVlZDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBmZWVkVGl0bGU6IGZlZWRbMF0ubWV0YS50aXRsZSxcclxuICAgICAgICAgICAgZmVlZENhdGVnb3J5OiBjYXRlZ29yeSxcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gZ2V0U2F2ZWRGZWVkcygpIHtcclxuICAgIC8vICAgICByZXR1cm4gbGlzdEZlZWRzO1xyXG4gICAgLy8gfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2F2ZUZlZWQ6IHNhdmVGZWVkLFxyXG4gICAgICAgIGdldFBhcnNlZEZlZWQ6IGdldFBhcnNlZEZlZWQsXHJcbiAgICB9XHJcbn1dKTtcclxuIiwiYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmZhY3RvcnkoJ2FydGljbGVzU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdmFyIGFsbEFydGljbGVzID0gW107XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0VGV4dChodG1sKSB7XHJcbiAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZWxlbWVudChgPGRpdj4ke2h0bWx9PC9kaXY+YCkudGV4dCgpLnJlcGxhY2UoL1xcbisvZywgJyAnKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRJbWdVcmwoaHRtbCkge1xyXG4gICAgICAgIHZhciBpbWdFbGVtID0gYW5ndWxhci5lbGVtZW50KGA8ZGl2PiR7aHRtbH08L2Rpdj5gKS5maW5kKCdpbWcnKVswXTtcclxuICAgICAgICByZXR1cm4gaW1nRWxlbSA/IGltZ0VsZW0uc3JjIDogJyc7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RGF0ZShkYXRlUmF3KSB7XHJcbiAgICAgICAgcmV0dXJuIG1vbWVudChuZXcgRGF0ZShkYXRlUmF3KSkuZm9ybWF0KCdERC1NTS1ZWVlZIEhIOm1tJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0RmVlZEZyb21GZWVkcGFyc2VyKHVybCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvZ2V0UGFyc2VkRmVlZCcsIHsgdXJsOiB1cmwgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0QWxsQXJ0aWNsZXMoYWxsRmVlZHMpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZygnZ2V0QWxsQXJ0aWNsZXMnLCBhcmd1bWVudHMpO1xyXG4gICAgICAgIGxldCBhcnRpY2xlcyA9IFtdO1xyXG4gICAgICAgIGxldCBjaGFpbiA9IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIGFsbEZlZWRzLmZvckVhY2goZnVuY3Rpb24oZmVlZCkge1xyXG4gICAgICAgICAgICBjaGFpbiA9IGNoYWluXHJcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBnZXRGZWVkRnJvbUZlZWRwYXJzZXIoZmVlZC5mZWVkTGluaykpXHJcbiAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZ2V0UGFyc2VkQXJ0aWNsZXMocmVzdWx0LmZlZWQsIGZlZWQuZmVlZENhdGVnb3J5KTtcclxuICAgICAgICAgICAgICAgICAgICBhcnRpY2xlcyA9IGFydGljbGVzLmNvbmNhdChyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFpbi50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGFydGljbGVzXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFBhcnNlZEFydGljbGVzKGFydGljbGVzLCBjYXRlZ29yeSkge1xyXG4gICAgICAgIHZhciBjaGFuZ2VkQXJ0aWNsZXMgPSBbXTtcclxuICAgICAgICBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XHJcbiAgICAgICAgICAgIGNoYW5nZWRBcnRpY2xlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBlbC50aXRsZSxcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGdldFRleHQoZWwuZGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgaW1nOiBnZXRJbWdVcmwoZWwuZGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgbGluazogZWwucGVybWFsaW5rLFxyXG4gICAgICAgICAgICAgICAgZGF0ZTogZWwucHViRGF0ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkQXJ0aWNsZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xlQXJ0aWNsZShsaW5rKSB7XHJcbiAgICAgICAgdmFyIGFydGljbGVzID0gZ2V0QWxsQXJ0aWNsZXMoKTtcclxuICAgICAgICBpZiAoIWFydGljbGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFydGljbGVzLmZpbmQoZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbS5saW5rID09IGxpbms7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRBbGxBcnRpY2xlcyhsaXN0RmVlZHMpIHtcclxuICAgICAgICBhbGxBcnRpY2xlcyA9IGxpc3RGZWVkcztcclxuICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXJ0aWNsZXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIGFsbEFydGljbGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2V0QWxsQXJ0aWNsZXM6IHNldEFsbEFydGljbGVzLFxyXG4gICAgICAgIGdldEFsbEFydGljbGVzOiBnZXRBbGxBcnRpY2xlcyxcclxuICAgICAgICBnZXRBcnRpY2xlczogZ2V0QXJ0aWNsZXMsXHJcbiAgICAgICAgZ2V0RmVlZEZyb21GZWVkcGFyc2VyOiBnZXRGZWVkRnJvbUZlZWRwYXJzZXJcclxuICAgIH1cclxufV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuZmFjdG9yeSgnZGFzaGJvYXJkU2VydmljZScsIFsnYWRkRmVlZFNlcnZpY2UnLCAnJGZpbHRlcicsICckaHR0cCcsIGZ1bmN0aW9uKGFkZEZlZWRTZXJ2aWNlLCAkZmlsdGVyLCAkaHR0cCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdmFyIHNvcnRQYXJhbTsgLy9zb3J0aW5nIG9wdGlvbiBnb3QgZnJvbSBzaWRlYmFyXHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNvcnRQYXJhbSgpIHtcclxuICAgICAgICBpZiAoIXNvcnRQYXJhbSkge1xyXG4gICAgICAgICAgICBzb3J0UGFyYW0gPSBcIkFsbFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc29ydFBhcmFtO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEFsbEZlZWRzKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvZ2V0RmVlZCcpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ2FuIG5vdCBnZXQgc2F2ZWQgZmVlZCcpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFNvcnRQYXJhbTogZ2V0U29ydFBhcmFtLFxyXG4gICAgICAgIGdldEFsbEZlZWRzOiBnZXRBbGxGZWVkcyxcclxuICAgIH1cclxufV0pO1xyXG4iLCJhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuZmFjdG9yeSgnc2lkZWJhclNlcnZpY2UnLCBbJ2Rhc2hib2FyZFNlcnZpY2UnLCBmdW5jdGlvbihkYXNoYm9hcmRTZXJ2aWNlKSB7XHJcbiAgICB2YXIgbGlzdEZlZWRzID0gW107XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIHNldExpc3RGZWVkcyAoYXJyKSB7XHJcbiAgICAgICAgbGlzdEZlZWRzID0gbGlzdEZlZWRzLmNvbmNhdChhcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldENhdGVnb3J5U2lkZWJhcihsaXN0RmVlZHMpIHtcclxuICAgICAgICB2YXIgbGlzdEZlZWRTaWRlYmFyID0gW107XHJcbiAgICAgICAgdmFyIGxpc3RXb3JrID0gW107XHJcbiAgICAgICAgdmFyIGZvdW5kRWxlbTtcclxuXHJcbiAgICAgICAgaWYgKCFsaXN0RmVlZHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsaXN0RmVlZHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdFdvcmsucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgZmVlZENhdGVnb3J5OiBlbGVtZW50LmZlZWRDYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgICAgICBpZDogaW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgZmVlZFRpdGxlOiBbe2ZlZWRUaXRsZTogZWxlbWVudC5mZWVkVGl0bGUsIGZlZWRJZDogZWxlbWVudC5faWR9XVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaXN0V29yay5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICBmb3VuZEVsZW0gPSBsaXN0RmVlZFNpZGViYXIuZmluZChmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5mZWVkQ2F0ZWdvcnkgPT0gZWxlbWVudC5mZWVkQ2F0ZWdvcnk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZvdW5kRWxlbSkge1xyXG4gICAgICAgICAgICAgICAgZm91bmRFbGVtLmZlZWRUaXRsZSA9IGZvdW5kRWxlbS5mZWVkVGl0bGUuY29uY2F0KGVsZW1lbnQuZmVlZFRpdGxlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RGZWVkU2lkZWJhci5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3RGZWVkU2lkZWJhcjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRMaXN0RmVlZHMgKCkge1xyXG4gICAgICAgIHJldHVybiBsaXN0RmVlZHM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldENhdGVnb3J5U2lkZWJhcjogZ2V0Q2F0ZWdvcnlTaWRlYmFyLFxyXG4gICAgICAgIHNldExpc3RGZWVkczogc2V0TGlzdEZlZWRzLFxyXG4gICAgICAgIGdldExpc3RGZWVkczogZ2V0TGlzdEZlZWRzXHJcbiAgICB9XHJcbn1dKVxyXG4iXX0=
