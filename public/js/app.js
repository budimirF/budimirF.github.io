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
                },
                resolve: {
                    allFeed : ['dashboardService', function (dashboardService) {
                        return dashboardService.getFeed();
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
    angular.module('rssReader').controller('addController', ['$scope', '$state', 'addFeedService',  function($scope, $state, addFeedService) {
        // $scope.feed = {};
        $scope.getFeed = function () {
            addFeedService.getSrcFeed($scope.feedUrl).then(function(res) {
                var feed = addFeedService.getParsedFeed(res, $scope.feedCategory);
                addFeedService.saveData(feed).then(function (res) {
                    $state.go('dashboard.list-lg', {sort:res.data._id});
                });
            });
        }
    }]);

})();
(function() {
    'use strict';
    angular.module('rssReader').controller('articlesController', ['$scope', '$state', '$stateParams', 'dashboardService', function($scope, $state, $stateParams, dashboardService) {
        $scope.articles = dashboardService.getArticles($stateParams.sort);
        // console.log($scope.articles);
        // $scope.readArticle = function (article) {
        //     $state.go('dashboard.article', {param : article});
            
        // }; 
    }]);

})();

(function() {
    'use strict';
    angular.module('rssReader').controller('dashboardController', ['$scope', '$state', 'addFeedService', 'dashboardService', 'allFeed', function($scope, $state, addFeedService, dashboardService, allFeed) {
        $scope.articles = dashboardService.getArticles(allFeed.data);
        // console.log(!!$scope.articles.length);
        
        $scope.$watch(function () {
            return dashboardService.getSortParam();
        }, function () {
            $scope.titleFeed = dashboardService.getSortParam();
        });

        $scope.readArticle = function (link) {
            $state.go('^.article', {link:link}); 
        }

        if (!$scope.articles.length) {
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
    angular.module('rssReader').controller('sidebarController', ['$scope', '$state', '$rootScope', 'dashboardService', function($scope, $state, $rootScope, dashboardService) {
        var getListSidebar = dashboardService.getCategorySidebar;
        
        $scope.$watch(function () {
            return JSON.stringify(getListSidebar());
        }, function () {
            $scope.listFeedSidebar = getListSidebar();
        });
        
        $scope.showArticlesBySorting = function (sorting) {
            
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
    function saveData(feed) {
        return $http.post('/addFeed', {feedArticles: feed.feedArticles, feedTitle: feed.feedTitle, feedCategory: feed.feedCategory })
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

    function getSrcFeed(url) {
        return $http.post('/getParsedFeed', { url: url }).then(function(response) {
            // console.log(response.data);
            return response.data;
        });
        // return $http.jsonp('https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url)).
        // then(function(response) {
        //     return response.data;
        // });
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

    function getParsedFeed(feed, category) {
        feed = feed.feed;
        return {
            feedTitle: feed[0].meta.title,
            feedCategory: category,
            feedArticles: getParsedArticles(feed, category)
        }
    }

    // function getSavedFeeds() {
    //     return listFeeds;
    // }

    return {
        getSrcFeed: getSrcFeed,
        getParsedFeed: getParsedFeed,
        saveData: saveData,
        // getSavedFeeds: getSavedFeeds
    }
}]);

angular.module('rssReader').factory('dashboardService', ['addFeedService', '$filter', '$http', function(addFeedService, $filter, $http) {
    'use strict';
    var listFeeds = [];
    var sortParam; //sorting option got from sidebar

    function getCategorySidebar() {
        var listFeedSidebar = [];
        var listWork = [];
        var foundElem;

        if (!listFeeds.length) {
            return false;
        } else {
            listFeeds.forEach(function(element, index) {
                listWork.push({
                    feedId : element._id,
                    feedCategory: element.feedCategory,
                    id: index,
                    feedTitle: [element.feedTitle]
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

    function getArticles(allFeed) {
        var articles = [];
        if (listFeeds.length) {
            listFeeds.forEach(function(elem) {
                    articles = articles.concat(elem.feedArticles);
            });
        }
        // console.log(articles);
        return articles;
    }

    function getSingleArticle(link) {
        var articles = getArticles();
        if (!articles) {
            return false;
        }
        return articles.find(function(elem) {
            return elem.link == link;
        })
    }

    function getSortParam() {
        if (!sortParam) {
            sortParam = "All";
        }
        return sortParam;
    }

    function getFeed () {
        return $http.post('/getFeed')
            .then(function(res) {
                listFeeds = res.data;
                return res;
            },
            function(error) {
                console.log('Can not get saved feed');
            })
    }

    return {
        getArticles: getArticles,
        getCategorySidebar: getCategorySidebar,
        getSingleArticle: getSingleArticle,
        getSortParam: getSortParam,
        getFeed: getFeed
    }
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvdXRlci5qcyIsImNvbnRyb2xsZXJzL2FkZENvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9hcnRpY2xlc0NvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmRDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9uYXZDb250cm9sbGVyLmpzIiwiY29udHJvbGxlcnMvc2lkZWJhckNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy9zaW5nbGVBcnRpY2xlQ29udHJvbGxlci5qcyIsImxpYi9ib290c3RyYXAuanMiLCJsaWIvamFzbnktYm9vdHN0cmFwLmpzIiwibGliL21vbWVudC5taW4uanMiLCJzZXJ2aWNlcy9hZGRGZWVkU2VydmljZS5qcyIsInNlcnZpY2VzL2Rhc2hib2FyZFNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDejBFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaGdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdGlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicsIFsndWkucm91dGVyJ10pO1xyXG4gICAgYXBwLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsICckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGh0dHBQcm92aWRlcikge1xyXG4gICAgICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJ2hvbWUnKTtcclxuICAgICAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9ob21lJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInRlbXBsYXRlcy9ob21lLmh0bWxcIixcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdob21lQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdsb2dpbicsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9sb2dpbicsXHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcclxuICAgICAgICAgICAgICAgIC8vIGNvbnRyb2xsZXI6ICdsb2dpbkNvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXHJcbiAgICAgICAgICAgICAgICB2aWV3czoge1xyXG4gICAgICAgICAgICAgICAgICAgICcnOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2Rhc2hib2FyZC5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2Rhc2hib2FyZENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAnaGVhZEBkYXNoYm9hcmQnIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kYXNoYm9hcmRIZWFkLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnZGFzaGJvYXJkQ29udHJvbGxlcidcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICdzaWRlYmFyJyA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvc2lkZWJhci5odG1sJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ3NpZGViYXJDb250cm9sbGVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsRmVlZCA6IFsnZGFzaGJvYXJkU2VydmljZScsIGZ1bmN0aW9uIChkYXNoYm9hcmRTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXNoYm9hcmRTZXJ2aWNlLmdldEZlZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3RhdGUoJ2Rhc2hib2FyZC50YWJsZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LXRhYmxlP3NvcnQnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQubGlzdC1sZycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LWxnP3NvcnQnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQubGlzdC10aCcsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9saXN0LXRoP3NvcnQnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkTGlzdExnLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FydGljbGVzQ29udHJvbGxlcidcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnN0YXRlKCdkYXNoYm9hcmQuYXJ0aWNsZScsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJy9hcnRpY2xlP2xpbmsnLFxyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvc2luZ2xlQXJ0aWNsZS5odG1sJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdzaW5nbGVBcnRpY2xlJyxcclxuXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5zdGF0ZSgnZGFzaGJvYXJkLmFkZCcsIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYWRkJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZGQuaHRtbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2FkZENvbnRyb2xsZXInXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfV0pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignYWRkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzdGF0ZScsICdhZGRGZWVkU2VydmljZScsICBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgYWRkRmVlZFNlcnZpY2UpIHtcclxuICAgICAgICAvLyAkc2NvcGUuZmVlZCA9IHt9O1xyXG4gICAgICAgICRzY29wZS5nZXRGZWVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhZGRGZWVkU2VydmljZS5nZXRTcmNGZWVkKCRzY29wZS5mZWVkVXJsKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZlZWQgPSBhZGRGZWVkU2VydmljZS5nZXRQYXJzZWRGZWVkKHJlcywgJHNjb3BlLmZlZWRDYXRlZ29yeSk7XHJcbiAgICAgICAgICAgICAgICBhZGRGZWVkU2VydmljZS5zYXZlRGF0YShmZWVkKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2Rhc2hib2FyZC5saXN0LWxnJywge3NvcnQ6cmVzLmRhdGEuX2lkfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfV0pO1xyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignYXJ0aWNsZXNDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgJyRzdGF0ZVBhcmFtcycsICdkYXNoYm9hcmRTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgZGFzaGJvYXJkU2VydmljZSkge1xyXG4gICAgICAgICRzY29wZS5hcnRpY2xlcyA9IGRhc2hib2FyZFNlcnZpY2UuZ2V0QXJ0aWNsZXMoJHN0YXRlUGFyYW1zLnNvcnQpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCRzY29wZS5hcnRpY2xlcyk7XHJcbiAgICAgICAgLy8gJHNjb3BlLnJlYWRBcnRpY2xlID0gZnVuY3Rpb24gKGFydGljbGUpIHtcclxuICAgICAgICAvLyAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQuYXJ0aWNsZScsIHtwYXJhbSA6IGFydGljbGV9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgLy8gfTsgXHJcbiAgICB9XSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgncnNzUmVhZGVyJykuY29udHJvbGxlcignZGFzaGJvYXJkQ29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRzdGF0ZScsICdhZGRGZWVkU2VydmljZScsICdkYXNoYm9hcmRTZXJ2aWNlJywgJ2FsbEZlZWQnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgYWRkRmVlZFNlcnZpY2UsIGRhc2hib2FyZFNlcnZpY2UsIGFsbEZlZWQpIHtcclxuICAgICAgICAkc2NvcGUuYXJ0aWNsZXMgPSBkYXNoYm9hcmRTZXJ2aWNlLmdldEFydGljbGVzKGFsbEZlZWQuZGF0YSk7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coISEkc2NvcGUuYXJ0aWNsZXMubGVuZ3RoKTtcclxuICAgICAgICBcclxuICAgICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhc2hib2FyZFNlcnZpY2UuZ2V0U29ydFBhcmFtKCk7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkc2NvcGUudGl0bGVGZWVkID0gZGFzaGJvYXJkU2VydmljZS5nZXRTb3J0UGFyYW0oKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnJlYWRBcnRpY2xlID0gZnVuY3Rpb24gKGxpbmspIHtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdeLmFydGljbGUnLCB7bGluazpsaW5rfSk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEkc2NvcGUuYXJ0aWNsZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkLmFkZCcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZGFzaGJvYXJkLmxpc3QtbGcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5pc1JlYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcImRhc2hib2FyZC5hZGRcIik7XHJcbiAgICAgICAgICAgIHJldHVybiAoIXJlLnRlc3QoJHN0YXRlLmN1cnJlbnQubmFtZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLmdldEFsbEZlZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGRhc2hib2FyZFNlcnZpY2UuZ2V0RmVlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XSk7XHJcblxyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmNvbnRyb2xsZXIoJ2hvbWVDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpe1xyXG4gICAgICAgICRzY29wZS50ZXN0ID0gXCJoZWxsbyB3b3JsZCEhIVwiO1xyXG4gICAgfV0pO1xyXG5cclxufSkoKTtcclxuXHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5jb250cm9sbGVyKCduYXZDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcclxuICAgICAgJHNjb3BlLmlzRGFzYm9hcmQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIC9kYXNoYm9hcmQvLnRlc3QoJHN0YXRlLmN1cnJlbnQubmFtZSk7XHJcbiAgICAgIH1cclxuICAgIH1dKTtcclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmNvbnRyb2xsZXIoJ3NpZGViYXJDb250cm9sbGVyJywgWyckc2NvcGUnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnZGFzaGJvYXJkU2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCBkYXNoYm9hcmRTZXJ2aWNlKSB7XHJcbiAgICAgICAgdmFyIGdldExpc3RTaWRlYmFyID0gZGFzaGJvYXJkU2VydmljZS5nZXRDYXRlZ29yeVNpZGViYXI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShnZXRMaXN0U2lkZWJhcigpKTtcclxuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5saXN0RmVlZFNpZGViYXIgPSBnZXRMaXN0U2lkZWJhcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICRzY29wZS5zaG93QXJ0aWNsZXNCeVNvcnRpbmcgPSBmdW5jdGlvbiAoc29ydGluZykge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gdGl0bGVGZWVkID0gdGl0bGVGZWVkID8gdGl0bGVGZWVkIDogbnVsbDsgXHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCd0aXRsZUZlZWQgPSAnICsgdGl0bGVGZWVkKTtcclxuICAgICAgICAgICAgJHN0YXRlLmdvKCdkYXNoYm9hcmQubGlzdC1sZycsIHtzb3J0OnNvcnRpbmd9KTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUucm90YXRlQ2hldnJvbiA9IGZ1bmN0aW9uKCRldmVudCkge1xyXG4gICAgICAgICAgICB2YXIgY29sbGFwc2UgPSAkZXZlbnQuY3VycmVudFRhcmdldC5hdHRyaWJ1dGVzWydhcmlhLWV4cGFuZGVkJ10udmFsdWU7XHJcbiAgICAgICAgICAgIHZhciBjaGV2cm9uID0gYW5ndWxhci5lbGVtZW50KCRldmVudC5jdXJyZW50VGFyZ2V0KS5maW5kKCcuZ2x5cGhpY29uLWNoZXZyb24tcmlnaHQnKTtcclxuICAgICAgICAgICAgaWYgKGNvbGxhcHNlID09IFwiZmFsc2VcIikge1xyXG4gICAgICAgICAgICAgICAgY2hldnJvbi5hZGRDbGFzcygnY2hldnJvbkRvd24nKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNoZXZyb24ucmVtb3ZlQ2xhc3MoJ2NoZXZyb25Eb3duJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfV0pO1xyXG5cclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgYW5ndWxhci5tb2R1bGUoJ3Jzc1JlYWRlcicpLmNvbnRyb2xsZXIoJ3NpbmdsZUFydGljbGUnLCBbJyRzY29wZScsICckc3RhdGUnLCAnJHN0YXRlUGFyYW1zJywgJ2Rhc2hib2FyZFNlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCBkYXNoYm9hcmRTZXJ2aWNlKSB7XHJcbiAgICAgICAgaWYgKCEkc3RhdGVQYXJhbXMubGluaykge1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ14nKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUuYXJ0aWNsZSA9IGRhc2hib2FyZFNlcnZpY2UuZ2V0U2luZ2xlQXJ0aWNsZSgkc3RhdGVQYXJhbXMubGluayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgIH1dKTtcclxuXHJcbn0pKCk7XHJcbiIsIi8qIVxyXG4gKiBCb290c3RyYXAgdjMuMy43IChodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbSlcclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgalF1ZXJ5ID09PSAndW5kZWZpbmVkJykge1xyXG4gIHRocm93IG5ldyBFcnJvcignQm9vdHN0cmFwXFwncyBKYXZhU2NyaXB0IHJlcXVpcmVzIGpRdWVyeScpXHJcbn1cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICB2YXIgdmVyc2lvbiA9ICQuZm4uanF1ZXJ5LnNwbGl0KCcgJylbMF0uc3BsaXQoJy4nKVxyXG4gIGlmICgodmVyc2lvblswXSA8IDIgJiYgdmVyc2lvblsxXSA8IDkpIHx8ICh2ZXJzaW9uWzBdID09IDEgJiYgdmVyc2lvblsxXSA9PSA5ICYmIHZlcnNpb25bMl0gPCAxKSB8fCAodmVyc2lvblswXSA+IDMpKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0Jvb3RzdHJhcFxcJ3MgSmF2YVNjcmlwdCByZXF1aXJlcyBqUXVlcnkgdmVyc2lvbiAxLjkuMSBvciBoaWdoZXIsIGJ1dCBsb3dlciB0aGFuIHZlcnNpb24gNCcpXHJcbiAgfVxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiB0cmFuc2l0aW9uLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0cmFuc2l0aW9uc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQ1NTIFRSQU5TSVRJT04gU1VQUE9SVCAoU2hvdXRvdXQ6IGh0dHA6Ly93d3cubW9kZXJuaXpyLmNvbS8pXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIHRyYW5zaXRpb25FbmQoKSB7XHJcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxyXG5cclxuICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XHJcbiAgICAgIFdlYmtpdFRyYW5zaXRpb24gOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXHJcbiAgICAgIE1velRyYW5zaXRpb24gICAgOiAndHJhbnNpdGlvbmVuZCcsXHJcbiAgICAgIE9UcmFuc2l0aW9uICAgICAgOiAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxyXG4gICAgICB0cmFuc2l0aW9uICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcclxuICAgICAgaWYgKGVsLnN0eWxlW25hbWVdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICByZXR1cm4geyBlbmQ6IHRyYW5zRW5kRXZlbnROYW1lc1tuYW1lXSB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2UgLy8gZXhwbGljaXQgZm9yIGllOCAoICAuXy4pXHJcbiAgfVxyXG5cclxuICAvLyBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9jc3MtdHJhbnNpdGlvbnNcclxuICAkLmZuLmVtdWxhdGVUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24gKGR1cmF0aW9uKSB7XHJcbiAgICB2YXIgY2FsbGVkID0gZmFsc2VcclxuICAgIHZhciAkZWwgPSB0aGlzXHJcbiAgICAkKHRoaXMpLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgZnVuY3Rpb24gKCkgeyBjYWxsZWQgPSB0cnVlIH0pXHJcbiAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7IGlmICghY2FsbGVkKSAkKCRlbCkudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpIH1cclxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gICQoZnVuY3Rpb24gKCkge1xyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uRW5kKClcclxuXHJcbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm5cclxuXHJcbiAgICAkLmV2ZW50LnNwZWNpYWwuYnNUcmFuc2l0aW9uRW5kID0ge1xyXG4gICAgICBiaW5kVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxyXG4gICAgICBkZWxlZ2F0ZVR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcclxuICAgICAgaGFuZGxlOiBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICgkKGUudGFyZ2V0KS5pcyh0aGlzKSkgcmV0dXJuIGUuaGFuZGxlT2JqLmhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGFsZXJ0LmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNhbGVydHNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIEFMRVJUIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBkaXNtaXNzID0gJ1tkYXRhLWRpc21pc3M9XCJhbGVydFwiXSdcclxuICB2YXIgQWxlcnQgICA9IGZ1bmN0aW9uIChlbCkge1xyXG4gICAgJChlbCkub24oJ2NsaWNrJywgZGlzbWlzcywgdGhpcy5jbG9zZSlcclxuICB9XHJcblxyXG4gIEFsZXJ0LlZFUlNJT04gPSAnMy4zLjcnXHJcblxyXG4gIEFsZXJ0LlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcclxuXHJcbiAgQWxlcnQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyAgICA9ICQodGhpcylcclxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2RhdGEtdGFyZ2V0JylcclxuXHJcbiAgICBpZiAoIXNlbGVjdG9yKSB7XHJcbiAgICAgIHNlbGVjdG9yID0gJHRoaXMuYXR0cignaHJlZicpXHJcbiAgICAgIHNlbGVjdG9yID0gc2VsZWN0b3IgJiYgc2VsZWN0b3IucmVwbGFjZSgvLiooPz0jW15cXHNdKiQpLywgJycpIC8vIHN0cmlwIGZvciBpZTdcclxuICAgIH1cclxuXHJcbiAgICB2YXIgJHBhcmVudCA9ICQoc2VsZWN0b3IgPT09ICcjJyA/IFtdIDogc2VsZWN0b3IpXHJcblxyXG4gICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgIGlmICghJHBhcmVudC5sZW5ndGgpIHtcclxuICAgICAgJHBhcmVudCA9ICR0aGlzLmNsb3Nlc3QoJy5hbGVydCcpXHJcbiAgICB9XHJcblxyXG4gICAgJHBhcmVudC50cmlnZ2VyKGUgPSAkLkV2ZW50KCdjbG9zZS5icy5hbGVydCcpKVxyXG5cclxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAkcGFyZW50LnJlbW92ZUNsYXNzKCdpbicpXHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlRWxlbWVudCgpIHtcclxuICAgICAgLy8gZGV0YWNoIGZyb20gcGFyZW50LCBmaXJlIGV2ZW50IHRoZW4gY2xlYW4gdXAgZGF0YVxyXG4gICAgICAkcGFyZW50LmRldGFjaCgpLnRyaWdnZXIoJ2Nsb3NlZC5icy5hbGVydCcpLnJlbW92ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgJHBhcmVudC5oYXNDbGFzcygnZmFkZScpID9cclxuICAgICAgJHBhcmVudFxyXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIHJlbW92ZUVsZW1lbnQpXHJcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKEFsZXJ0LlRSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgcmVtb3ZlRWxlbWVudCgpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQUxFUlQgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy5hbGVydCcpXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmFsZXJ0JywgKGRhdGEgPSBuZXcgQWxlcnQodGhpcykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dLmNhbGwoJHRoaXMpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uYWxlcnRcclxuXHJcbiAgJC5mbi5hbGVydCAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4uYWxlcnQuQ29uc3RydWN0b3IgPSBBbGVydFxyXG5cclxuXHJcbiAgLy8gQUxFUlQgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmFsZXJ0Lm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmFsZXJ0ID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEFMRVJUIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLmFsZXJ0LmRhdGEtYXBpJywgZGlzbWlzcywgQWxlcnQucHJvdG90eXBlLmNsb3NlKVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogYnV0dG9uLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNidXR0b25zXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBCVVRUT04gUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIEJ1dHRvbiA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50ICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyAgID0gJC5leHRlbmQoe30sIEJ1dHRvbi5ERUZBVUxUUywgb3B0aW9ucylcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2VcclxuICB9XHJcblxyXG4gIEJ1dHRvbi5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgQnV0dG9uLkRFRkFVTFRTID0ge1xyXG4gICAgbG9hZGluZ1RleHQ6ICdsb2FkaW5nLi4uJ1xyXG4gIH1cclxuXHJcbiAgQnV0dG9uLnByb3RvdHlwZS5zZXRTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xyXG4gICAgdmFyIGQgICAgPSAnZGlzYWJsZWQnXHJcbiAgICB2YXIgJGVsICA9IHRoaXMuJGVsZW1lbnRcclxuICAgIHZhciB2YWwgID0gJGVsLmlzKCdpbnB1dCcpID8gJ3ZhbCcgOiAnaHRtbCdcclxuICAgIHZhciBkYXRhID0gJGVsLmRhdGEoKVxyXG5cclxuICAgIHN0YXRlICs9ICdUZXh0J1xyXG5cclxuICAgIGlmIChkYXRhLnJlc2V0VGV4dCA9PSBudWxsKSAkZWwuZGF0YSgncmVzZXRUZXh0JywgJGVsW3ZhbF0oKSlcclxuXHJcbiAgICAvLyBwdXNoIHRvIGV2ZW50IGxvb3AgdG8gYWxsb3cgZm9ybXMgdG8gc3VibWl0XHJcbiAgICBzZXRUaW1lb3V0KCQucHJveHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAkZWxbdmFsXShkYXRhW3N0YXRlXSA9PSBudWxsID8gdGhpcy5vcHRpb25zW3N0YXRlXSA6IGRhdGFbc3RhdGVdKVxyXG5cclxuICAgICAgaWYgKHN0YXRlID09ICdsb2FkaW5nVGV4dCcpIHtcclxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWVcclxuICAgICAgICAkZWwuYWRkQ2xhc3MoZCkuYXR0cihkLCBkKS5wcm9wKGQsIHRydWUpXHJcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0xvYWRpbmcpIHtcclxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlXHJcbiAgICAgICAgJGVsLnJlbW92ZUNsYXNzKGQpLnJlbW92ZUF0dHIoZCkucHJvcChkLCBmYWxzZSlcclxuICAgICAgfVxyXG4gICAgfSwgdGhpcyksIDApXHJcbiAgfVxyXG5cclxuICBCdXR0b24ucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBjaGFuZ2VkID0gdHJ1ZVxyXG4gICAgdmFyICRwYXJlbnQgPSB0aGlzLiRlbGVtZW50LmNsb3Nlc3QoJ1tkYXRhLXRvZ2dsZT1cImJ1dHRvbnNcIl0nKVxyXG5cclxuICAgIGlmICgkcGFyZW50Lmxlbmd0aCkge1xyXG4gICAgICB2YXIgJGlucHV0ID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dCcpXHJcbiAgICAgIGlmICgkaW5wdXQucHJvcCgndHlwZScpID09ICdyYWRpbycpIHtcclxuICAgICAgICBpZiAoJGlucHV0LnByb3AoJ2NoZWNrZWQnKSkgY2hhbmdlZCA9IGZhbHNlXHJcbiAgICAgICAgJHBhcmVudC5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgfSBlbHNlIGlmICgkaW5wdXQucHJvcCgndHlwZScpID09ICdjaGVja2JveCcpIHtcclxuICAgICAgICBpZiAoKCRpbnB1dC5wcm9wKCdjaGVja2VkJykpICE9PSB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdhY3RpdmUnKSkgY2hhbmdlZCA9IGZhbHNlXHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC50b2dnbGVDbGFzcygnYWN0aXZlJylcclxuICAgICAgfVxyXG4gICAgICAkaW5wdXQucHJvcCgnY2hlY2tlZCcsIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2FjdGl2ZScpKVxyXG4gICAgICBpZiAoY2hhbmdlZCkgJGlucHV0LnRyaWdnZXIoJ2NoYW5nZScpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtcHJlc3NlZCcsICF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdhY3RpdmUnKSlcclxuICAgICAgdGhpcy4kZWxlbWVudC50b2dnbGVDbGFzcygnYWN0aXZlJylcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAvLyBCVVRUT04gUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLmJ1dHRvbicpXHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuYnV0dG9uJywgKGRhdGEgPSBuZXcgQnV0dG9uKHRoaXMsIG9wdGlvbnMpKSlcclxuXHJcbiAgICAgIGlmIChvcHRpb24gPT0gJ3RvZ2dsZScpIGRhdGEudG9nZ2xlKClcclxuICAgICAgZWxzZSBpZiAob3B0aW9uKSBkYXRhLnNldFN0YXRlKG9wdGlvbilcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5idXR0b25cclxuXHJcbiAgJC5mbi5idXR0b24gICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmJ1dHRvbi5Db25zdHJ1Y3RvciA9IEJ1dHRvblxyXG5cclxuXHJcbiAgLy8gQlVUVE9OIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uYnV0dG9uLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAkLmZuLmJ1dHRvbiA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBCVVRUT04gREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudClcclxuICAgIC5vbignY2xpY2suYnMuYnV0dG9uLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZV49XCJidXR0b25cIl0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICB2YXIgJGJ0biA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5idG4nKVxyXG4gICAgICBQbHVnaW4uY2FsbCgkYnRuLCAndG9nZ2xlJylcclxuICAgICAgaWYgKCEoJChlLnRhcmdldCkuaXMoJ2lucHV0W3R5cGU9XCJyYWRpb1wiXSwgaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykpKSB7XHJcbiAgICAgICAgLy8gUHJldmVudCBkb3VibGUgY2xpY2sgb24gcmFkaW9zLCBhbmQgdGhlIGRvdWJsZSBzZWxlY3Rpb25zIChzbyBjYW5jZWxsYXRpb24pIG9uIGNoZWNrYm94ZXNcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAvLyBUaGUgdGFyZ2V0IGNvbXBvbmVudCBzdGlsbCByZWNlaXZlIHRoZSBmb2N1c1xyXG4gICAgICAgIGlmICgkYnRuLmlzKCdpbnB1dCxidXR0b24nKSkgJGJ0bi50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgICAgZWxzZSAkYnRuLmZpbmQoJ2lucHV0OnZpc2libGUsYnV0dG9uOnZpc2libGUnKS5maXJzdCgpLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC5vbignZm9jdXMuYnMuYnV0dG9uLmRhdGEtYXBpIGJsdXIuYnMuYnV0dG9uLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZV49XCJidXR0b25cIl0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCcuYnRuJykudG9nZ2xlQ2xhc3MoJ2ZvY3VzJywgL15mb2N1cyhpbik/JC8udGVzdChlLnR5cGUpKVxyXG4gICAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGNhcm91c2VsLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNjYXJvdXNlbFxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gQ0FST1VTRUwgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIENhcm91c2VsID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgICAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLiRpbmRpY2F0b3JzID0gdGhpcy4kZWxlbWVudC5maW5kKCcuY2Fyb3VzZWwtaW5kaWNhdG9ycycpXHJcbiAgICB0aGlzLm9wdGlvbnMgICAgID0gb3B0aW9uc1xyXG4gICAgdGhpcy5wYXVzZWQgICAgICA9IG51bGxcclxuICAgIHRoaXMuc2xpZGluZyAgICAgPSBudWxsXHJcbiAgICB0aGlzLmludGVydmFsICAgID0gbnVsbFxyXG4gICAgdGhpcy4kYWN0aXZlICAgICA9IG51bGxcclxuICAgIHRoaXMuJGl0ZW1zICAgICAgPSBudWxsXHJcblxyXG4gICAgdGhpcy5vcHRpb25zLmtleWJvYXJkICYmIHRoaXMuJGVsZW1lbnQub24oJ2tleWRvd24uYnMuY2Fyb3VzZWwnLCAkLnByb3h5KHRoaXMua2V5ZG93biwgdGhpcykpXHJcblxyXG4gICAgdGhpcy5vcHRpb25zLnBhdXNlID09ICdob3ZlcicgJiYgISgnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpICYmIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLm9uKCdtb3VzZWVudGVyLmJzLmNhcm91c2VsJywgJC5wcm94eSh0aGlzLnBhdXNlLCB0aGlzKSlcclxuICAgICAgLm9uKCdtb3VzZWxlYXZlLmJzLmNhcm91c2VsJywgJC5wcm94eSh0aGlzLmN5Y2xlLCB0aGlzKSlcclxuICB9XHJcblxyXG4gIENhcm91c2VsLlZFUlNJT04gID0gJzMuMy43J1xyXG5cclxuICBDYXJvdXNlbC5UUkFOU0lUSU9OX0RVUkFUSU9OID0gNjAwXHJcblxyXG4gIENhcm91c2VsLkRFRkFVTFRTID0ge1xyXG4gICAgaW50ZXJ2YWw6IDUwMDAsXHJcbiAgICBwYXVzZTogJ2hvdmVyJyxcclxuICAgIHdyYXA6IHRydWUsXHJcbiAgICBrZXlib2FyZDogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLmtleWRvd24gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKC9pbnB1dHx0ZXh0YXJlYS9pLnRlc3QoZS50YXJnZXQudGFnTmFtZSkpIHJldHVyblxyXG4gICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgIGNhc2UgMzc6IHRoaXMucHJldigpOyBicmVha1xyXG4gICAgICBjYXNlIDM5OiB0aGlzLm5leHQoKTsgYnJlYWtcclxuICAgICAgZGVmYXVsdDogcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUuY3ljbGUgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZSB8fCAodGhpcy5wYXVzZWQgPSBmYWxzZSlcclxuXHJcbiAgICB0aGlzLmludGVydmFsICYmIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbClcclxuXHJcbiAgICB0aGlzLm9wdGlvbnMuaW50ZXJ2YWxcclxuICAgICAgJiYgIXRoaXMucGF1c2VkXHJcbiAgICAgICYmICh0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoJC5wcm94eSh0aGlzLm5leHQsIHRoaXMpLCB0aGlzLm9wdGlvbnMuaW50ZXJ2YWwpKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUuZ2V0SXRlbUluZGV4ID0gZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgIHRoaXMuJGl0ZW1zID0gaXRlbS5wYXJlbnQoKS5jaGlsZHJlbignLml0ZW0nKVxyXG4gICAgcmV0dXJuIHRoaXMuJGl0ZW1zLmluZGV4KGl0ZW0gfHwgdGhpcy4kYWN0aXZlKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLmdldEl0ZW1Gb3JEaXJlY3Rpb24gPSBmdW5jdGlvbiAoZGlyZWN0aW9uLCBhY3RpdmUpIHtcclxuICAgIHZhciBhY3RpdmVJbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KGFjdGl2ZSlcclxuICAgIHZhciB3aWxsV3JhcCA9IChkaXJlY3Rpb24gPT0gJ3ByZXYnICYmIGFjdGl2ZUluZGV4ID09PSAwKVxyXG4gICAgICAgICAgICAgICAgfHwgKGRpcmVjdGlvbiA9PSAnbmV4dCcgJiYgYWN0aXZlSW5kZXggPT0gKHRoaXMuJGl0ZW1zLmxlbmd0aCAtIDEpKVxyXG4gICAgaWYgKHdpbGxXcmFwICYmICF0aGlzLm9wdGlvbnMud3JhcCkgcmV0dXJuIGFjdGl2ZVxyXG4gICAgdmFyIGRlbHRhID0gZGlyZWN0aW9uID09ICdwcmV2JyA/IC0xIDogMVxyXG4gICAgdmFyIGl0ZW1JbmRleCA9IChhY3RpdmVJbmRleCArIGRlbHRhKSAlIHRoaXMuJGl0ZW1zLmxlbmd0aFxyXG4gICAgcmV0dXJuIHRoaXMuJGl0ZW1zLmVxKGl0ZW1JbmRleClcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS50byA9IGZ1bmN0aW9uIChwb3MpIHtcclxuICAgIHZhciB0aGF0ICAgICAgICA9IHRoaXNcclxuICAgIHZhciBhY3RpdmVJbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KHRoaXMuJGFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLml0ZW0uYWN0aXZlJykpXHJcblxyXG4gICAgaWYgKHBvcyA+ICh0aGlzLiRpdGVtcy5sZW5ndGggLSAxKSB8fCBwb3MgPCAwKSByZXR1cm5cclxuXHJcbiAgICBpZiAodGhpcy5zbGlkaW5nKSAgICAgICByZXR1cm4gdGhpcy4kZWxlbWVudC5vbmUoJ3NsaWQuYnMuY2Fyb3VzZWwnLCBmdW5jdGlvbiAoKSB7IHRoYXQudG8ocG9zKSB9KSAvLyB5ZXMsIFwic2xpZFwiXHJcbiAgICBpZiAoYWN0aXZlSW5kZXggPT0gcG9zKSByZXR1cm4gdGhpcy5wYXVzZSgpLmN5Y2xlKClcclxuXHJcbiAgICByZXR1cm4gdGhpcy5zbGlkZShwb3MgPiBhY3RpdmVJbmRleCA/ICduZXh0JyA6ICdwcmV2JywgdGhpcy4kaXRlbXMuZXEocG9zKSlcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlIHx8ICh0aGlzLnBhdXNlZCA9IHRydWUpXHJcblxyXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuZmluZCgnLm5leHQsIC5wcmV2JykubGVuZ3RoICYmICQuc3VwcG9ydC50cmFuc2l0aW9uKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigkLnN1cHBvcnQudHJhbnNpdGlvbi5lbmQpXHJcbiAgICAgIHRoaXMuY3ljbGUodHJ1ZSlcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmludGVydmFsID0gY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBDYXJvdXNlbC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnNsaWRpbmcpIHJldHVyblxyXG4gICAgcmV0dXJuIHRoaXMuc2xpZGUoJ25leHQnKVxyXG4gIH1cclxuXHJcbiAgQ2Fyb3VzZWwucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zbGlkaW5nKSByZXR1cm5cclxuICAgIHJldHVybiB0aGlzLnNsaWRlKCdwcmV2JylcclxuICB9XHJcblxyXG4gIENhcm91c2VsLnByb3RvdHlwZS5zbGlkZSA9IGZ1bmN0aW9uICh0eXBlLCBuZXh0KSB7XHJcbiAgICB2YXIgJGFjdGl2ZSAgID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXRlbS5hY3RpdmUnKVxyXG4gICAgdmFyICRuZXh0ICAgICA9IG5leHQgfHwgdGhpcy5nZXRJdGVtRm9yRGlyZWN0aW9uKHR5cGUsICRhY3RpdmUpXHJcbiAgICB2YXIgaXNDeWNsaW5nID0gdGhpcy5pbnRlcnZhbFxyXG4gICAgdmFyIGRpcmVjdGlvbiA9IHR5cGUgPT0gJ25leHQnID8gJ2xlZnQnIDogJ3JpZ2h0J1xyXG4gICAgdmFyIHRoYXQgICAgICA9IHRoaXNcclxuXHJcbiAgICBpZiAoJG5leHQuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm4gKHRoaXMuc2xpZGluZyA9IGZhbHNlKVxyXG5cclxuICAgIHZhciByZWxhdGVkVGFyZ2V0ID0gJG5leHRbMF1cclxuICAgIHZhciBzbGlkZUV2ZW50ID0gJC5FdmVudCgnc2xpZGUuYnMuY2Fyb3VzZWwnLCB7XHJcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6IHJlbGF0ZWRUYXJnZXQsXHJcbiAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uXHJcbiAgICB9KVxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHNsaWRlRXZlbnQpXHJcbiAgICBpZiAoc2xpZGVFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5zbGlkaW5nID0gdHJ1ZVxyXG5cclxuICAgIGlzQ3ljbGluZyAmJiB0aGlzLnBhdXNlKClcclxuXHJcbiAgICBpZiAodGhpcy4kaW5kaWNhdG9ycy5sZW5ndGgpIHtcclxuICAgICAgdGhpcy4kaW5kaWNhdG9ycy5maW5kKCcuYWN0aXZlJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgIHZhciAkbmV4dEluZGljYXRvciA9ICQodGhpcy4kaW5kaWNhdG9ycy5jaGlsZHJlbigpW3RoaXMuZ2V0SXRlbUluZGV4KCRuZXh0KV0pXHJcbiAgICAgICRuZXh0SW5kaWNhdG9yICYmICRuZXh0SW5kaWNhdG9yLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzbGlkRXZlbnQgPSAkLkV2ZW50KCdzbGlkLmJzLmNhcm91c2VsJywgeyByZWxhdGVkVGFyZ2V0OiByZWxhdGVkVGFyZ2V0LCBkaXJlY3Rpb246IGRpcmVjdGlvbiB9KSAvLyB5ZXMsIFwic2xpZFwiXHJcbiAgICBpZiAoJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnc2xpZGUnKSkge1xyXG4gICAgICAkbmV4dC5hZGRDbGFzcyh0eXBlKVxyXG4gICAgICAkbmV4dFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcclxuICAgICAgJGFjdGl2ZS5hZGRDbGFzcyhkaXJlY3Rpb24pXHJcbiAgICAgICRuZXh0LmFkZENsYXNzKGRpcmVjdGlvbilcclxuICAgICAgJGFjdGl2ZVxyXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICRuZXh0LnJlbW92ZUNsYXNzKFt0eXBlLCBkaXJlY3Rpb25dLmpvaW4oJyAnKSkuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKFsnYWN0aXZlJywgZGlyZWN0aW9uXS5qb2luKCcgJykpXHJcbiAgICAgICAgICB0aGF0LnNsaWRpbmcgPSBmYWxzZVxyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcihzbGlkRXZlbnQpXHJcbiAgICAgICAgICB9LCAwKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKENhcm91c2VsLlRSQU5TSVRJT05fRFVSQVRJT04pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAkbmV4dC5hZGRDbGFzcygnYWN0aXZlJylcclxuICAgICAgdGhpcy5zbGlkaW5nID0gZmFsc2VcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHNsaWRFdmVudClcclxuICAgIH1cclxuXHJcbiAgICBpc0N5Y2xpbmcgJiYgdGhpcy5jeWNsZSgpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBDQVJPVVNFTCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5jYXJvdXNlbCcpXHJcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIENhcm91c2VsLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxyXG4gICAgICB2YXIgYWN0aW9uICA9IHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycgPyBvcHRpb24gOiBvcHRpb25zLnNsaWRlXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmNhcm91c2VsJywgKGRhdGEgPSBuZXcgQ2Fyb3VzZWwodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnbnVtYmVyJykgZGF0YS50byhvcHRpb24pXHJcbiAgICAgIGVsc2UgaWYgKGFjdGlvbikgZGF0YVthY3Rpb25dKClcclxuICAgICAgZWxzZSBpZiAob3B0aW9ucy5pbnRlcnZhbCkgZGF0YS5wYXVzZSgpLmN5Y2xlKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5jYXJvdXNlbFxyXG5cclxuICAkLmZuLmNhcm91c2VsICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5jYXJvdXNlbC5Db25zdHJ1Y3RvciA9IENhcm91c2VsXHJcblxyXG5cclxuICAvLyBDQVJPVVNFTCBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uY2Fyb3VzZWwubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uY2Fyb3VzZWwgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ0FST1VTRUwgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBocmVmXHJcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgIHZhciAkdGFyZ2V0ID0gJCgkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpIHx8IChocmVmID0gJHRoaXMuYXR0cignaHJlZicpKSAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSkgLy8gc3RyaXAgZm9yIGllN1xyXG4gICAgaWYgKCEkdGFyZ2V0Lmhhc0NsYXNzKCdjYXJvdXNlbCcpKSByZXR1cm5cclxuICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sICR0YXJnZXQuZGF0YSgpLCAkdGhpcy5kYXRhKCkpXHJcbiAgICB2YXIgc2xpZGVJbmRleCA9ICR0aGlzLmF0dHIoJ2RhdGEtc2xpZGUtdG8nKVxyXG4gICAgaWYgKHNsaWRlSW5kZXgpIG9wdGlvbnMuaW50ZXJ2YWwgPSBmYWxzZVxyXG5cclxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbnMpXHJcblxyXG4gICAgaWYgKHNsaWRlSW5kZXgpIHtcclxuICAgICAgJHRhcmdldC5kYXRhKCdicy5jYXJvdXNlbCcpLnRvKHNsaWRlSW5kZXgpXHJcbiAgICB9XHJcblxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgfVxyXG5cclxuICAkKGRvY3VtZW50KVxyXG4gICAgLm9uKCdjbGljay5icy5jYXJvdXNlbC5kYXRhLWFwaScsICdbZGF0YS1zbGlkZV0nLCBjbGlja0hhbmRsZXIpXHJcbiAgICAub24oJ2NsaWNrLmJzLmNhcm91c2VsLmRhdGEtYXBpJywgJ1tkYXRhLXNsaWRlLXRvXScsIGNsaWNrSGFuZGxlcilcclxuXHJcbiAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24gKCkge1xyXG4gICAgJCgnW2RhdGEtcmlkZT1cImNhcm91c2VsXCJdJykuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkY2Fyb3VzZWwgPSAkKHRoaXMpXHJcbiAgICAgIFBsdWdpbi5jYWxsKCRjYXJvdXNlbCwgJGNhcm91c2VsLmRhdGEoKSlcclxuICAgIH0pXHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBCb290c3RyYXA6IGNvbGxhcHNlLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNjb2xsYXBzZVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuLyoganNoaW50IGxhdGVkZWY6IGZhbHNlICovXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIENPTExBUFNFIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIENvbGxhcHNlID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgICAgICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyAgICAgICA9ICQuZXh0ZW5kKHt9LCBDb2xsYXBzZS5ERUZBVUxUUywgb3B0aW9ucylcclxuICAgIHRoaXMuJHRyaWdnZXIgICAgICA9ICQoJ1tkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCJdW2hyZWY9XCIjJyArIGVsZW1lbnQuaWQgKyAnXCJdLCcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl1bZGF0YS10YXJnZXQ9XCIjJyArIGVsZW1lbnQuaWQgKyAnXCJdJylcclxuICAgIHRoaXMudHJhbnNpdGlvbmluZyA9IG51bGxcclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnBhcmVudCkge1xyXG4gICAgICB0aGlzLiRwYXJlbnQgPSB0aGlzLmdldFBhcmVudCgpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyh0aGlzLiRlbGVtZW50LCB0aGlzLiR0cmlnZ2VyKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm9wdGlvbnMudG9nZ2xlKSB0aGlzLnRvZ2dsZSgpXHJcbiAgfVxyXG5cclxuICBDb2xsYXBzZS5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTiA9IDM1MFxyXG5cclxuICBDb2xsYXBzZS5ERUZBVUxUUyA9IHtcclxuICAgIHRvZ2dsZTogdHJ1ZVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UucHJvdG90eXBlLmRpbWVuc2lvbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBoYXNXaWR0aCA9IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ3dpZHRoJylcclxuICAgIHJldHVybiBoYXNXaWR0aCA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nIHx8IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHJldHVyblxyXG5cclxuICAgIHZhciBhY3RpdmVzRGF0YVxyXG4gICAgdmFyIGFjdGl2ZXMgPSB0aGlzLiRwYXJlbnQgJiYgdGhpcy4kcGFyZW50LmNoaWxkcmVuKCcucGFuZWwnKS5jaGlsZHJlbignLmluLCAuY29sbGFwc2luZycpXHJcblxyXG4gICAgaWYgKGFjdGl2ZXMgJiYgYWN0aXZlcy5sZW5ndGgpIHtcclxuICAgICAgYWN0aXZlc0RhdGEgPSBhY3RpdmVzLmRhdGEoJ2JzLmNvbGxhcHNlJylcclxuICAgICAgaWYgKGFjdGl2ZXNEYXRhICYmIGFjdGl2ZXNEYXRhLnRyYW5zaXRpb25pbmcpIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnc2hvdy5icy5jb2xsYXBzZScpXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcclxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICBpZiAoYWN0aXZlcyAmJiBhY3RpdmVzLmxlbmd0aCkge1xyXG4gICAgICBQbHVnaW4uY2FsbChhY3RpdmVzLCAnaGlkZScpXHJcbiAgICAgIGFjdGl2ZXNEYXRhIHx8IGFjdGl2ZXMuZGF0YSgnYnMuY29sbGFwc2UnLCBudWxsKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkaW1lbnNpb24gPSB0aGlzLmRpbWVuc2lvbigpXHJcblxyXG4gICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlJylcclxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylbZGltZW5zaW9uXSgwKVxyXG4gICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcblxyXG4gICAgdGhpcy4kdHJpZ2dlclxyXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2NvbGxhcHNlZCcpXHJcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSlcclxuXHJcbiAgICB0aGlzLnRyYW5zaXRpb25pbmcgPSAxXHJcblxyXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlIGluJylbZGltZW5zaW9uXSgnJylcclxuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLnRyaWdnZXIoJ3Nob3duLmJzLmNvbGxhcHNlJylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxyXG5cclxuICAgIHZhciBzY3JvbGxTaXplID0gJC5jYW1lbENhc2UoWydzY3JvbGwnLCBkaW1lbnNpb25dLmpvaW4oJy0nKSlcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxyXG4gICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoQ29sbGFwc2UuVFJBTlNJVElPTl9EVVJBVElPTilbZGltZW5zaW9uXSh0aGlzLiRlbGVtZW50WzBdW3Njcm9sbFNpemVdKVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy50cmFuc2l0aW9uaW5nIHx8ICF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpbicpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgc3RhcnRFdmVudCA9ICQuRXZlbnQoJ2hpZGUuYnMuY29sbGFwc2UnKVxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXHJcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIGRpbWVuc2lvbiA9IHRoaXMuZGltZW5zaW9uKClcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50W2RpbWVuc2lvbl0odGhpcy4kZWxlbWVudFtkaW1lbnNpb25dKCkpWzBdLm9mZnNldEhlaWdodFxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLmFkZENsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzZSBpbicpXHJcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXHJcblxyXG4gICAgdGhpcy4kdHJpZ2dlclxyXG4gICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlZCcpXHJcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXHJcblxyXG4gICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMVxyXG5cclxuICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy50cmFuc2l0aW9uaW5nID0gMFxyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdjb2xsYXBzaW5nJylcclxuICAgICAgICAuYWRkQ2xhc3MoJ2NvbGxhcHNlJylcclxuICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLmNvbGxhcHNlJylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoISQuc3VwcG9ydC50cmFuc2l0aW9uKSByZXR1cm4gY29tcGxldGUuY2FsbCh0aGlzKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgW2RpbWVuc2lvbl0oMClcclxuICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXHJcbiAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChDb2xsYXBzZS5UUkFOU0lUSU9OX0RVUkFUSU9OKVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXNbdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnaW4nKSA/ICdoaWRlJyA6ICdzaG93J10oKVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UucHJvdG90eXBlLmdldFBhcmVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAkKHRoaXMub3B0aW9ucy5wYXJlbnQpXHJcbiAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJjb2xsYXBzZVwiXVtkYXRhLXBhcmVudD1cIicgKyB0aGlzLm9wdGlvbnMucGFyZW50ICsgJ1wiXScpXHJcbiAgICAgIC5lYWNoKCQucHJveHkoZnVuY3Rpb24gKGksIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpXHJcbiAgICAgICAgdGhpcy5hZGRBcmlhQW5kQ29sbGFwc2VkQ2xhc3MoZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJGVsZW1lbnQpLCAkZWxlbWVudClcclxuICAgICAgfSwgdGhpcykpXHJcbiAgICAgIC5lbmQoKVxyXG4gIH1cclxuXHJcbiAgQ29sbGFwc2UucHJvdG90eXBlLmFkZEFyaWFBbmRDb2xsYXBzZWRDbGFzcyA9IGZ1bmN0aW9uICgkZWxlbWVudCwgJHRyaWdnZXIpIHtcclxuICAgIHZhciBpc09wZW4gPSAkZWxlbWVudC5oYXNDbGFzcygnaW4nKVxyXG5cclxuICAgICRlbGVtZW50LmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBpc09wZW4pXHJcbiAgICAkdHJpZ2dlclxyXG4gICAgICAudG9nZ2xlQ2xhc3MoJ2NvbGxhcHNlZCcsICFpc09wZW4pXHJcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgaXNPcGVuKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VGFyZ2V0RnJvbVRyaWdnZXIoJHRyaWdnZXIpIHtcclxuICAgIHZhciBocmVmXHJcbiAgICB2YXIgdGFyZ2V0ID0gJHRyaWdnZXIuYXR0cignZGF0YS10YXJnZXQnKVxyXG4gICAgICB8fCAoaHJlZiA9ICR0cmlnZ2VyLmF0dHIoJ2hyZWYnKSkgJiYgaHJlZi5yZXBsYWNlKC8uKig/PSNbXlxcc10rJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xyXG5cclxuICAgIHJldHVybiAkKHRhcmdldClcclxuICB9XHJcblxyXG5cclxuICAvLyBDT0xMQVBTRSBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy5jb2xsYXBzZScpXHJcbiAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe30sIENvbGxhcHNlLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uKVxyXG5cclxuICAgICAgaWYgKCFkYXRhICYmIG9wdGlvbnMudG9nZ2xlICYmIC9zaG93fGhpZGUvLnRlc3Qob3B0aW9uKSkgb3B0aW9ucy50b2dnbGUgPSBmYWxzZVxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmNvbGxhcHNlJywgKGRhdGEgPSBuZXcgQ29sbGFwc2UodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5jb2xsYXBzZVxyXG5cclxuICAkLmZuLmNvbGxhcHNlICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5jb2xsYXBzZS5Db25zdHJ1Y3RvciA9IENvbGxhcHNlXHJcblxyXG5cclxuICAvLyBDT0xMQVBTRSBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uY29sbGFwc2Uubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uY29sbGFwc2UgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ09MTEFQU0UgREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suYnMuY29sbGFwc2UuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIl0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcblxyXG4gICAgaWYgKCEkdGhpcy5hdHRyKCdkYXRhLXRhcmdldCcpKSBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICB2YXIgJHRhcmdldCA9IGdldFRhcmdldEZyb21UcmlnZ2VyKCR0aGlzKVxyXG4gICAgdmFyIGRhdGEgICAgPSAkdGFyZ2V0LmRhdGEoJ2JzLmNvbGxhcHNlJylcclxuICAgIHZhciBvcHRpb24gID0gZGF0YSA/ICd0b2dnbGUnIDogJHRoaXMuZGF0YSgpXHJcblxyXG4gICAgUGx1Z2luLmNhbGwoJHRhcmdldCwgb3B0aW9uKVxyXG4gIH0pXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBkcm9wZG93bi5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jZHJvcGRvd25zXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBEUk9QRE9XTiBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgYmFja2Ryb3AgPSAnLmRyb3Bkb3duLWJhY2tkcm9wJ1xyXG4gIHZhciB0b2dnbGUgICA9ICdbZGF0YS10b2dnbGU9XCJkcm9wZG93blwiXSdcclxuICB2YXIgRHJvcGRvd24gPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgJChlbGVtZW50KS5vbignY2xpY2suYnMuZHJvcGRvd24nLCB0aGlzLnRvZ2dsZSlcclxuICB9XHJcblxyXG4gIERyb3Bkb3duLlZFUlNJT04gPSAnMy4zLjcnXHJcblxyXG4gIGZ1bmN0aW9uIGdldFBhcmVudCgkdGhpcykge1xyXG4gICAgdmFyIHNlbGVjdG9yID0gJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKVxyXG5cclxuICAgIGlmICghc2VsZWN0b3IpIHtcclxuICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcclxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiAvI1tBLVphLXpdLy50ZXN0KHNlbGVjdG9yKSAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xyXG4gICAgfVxyXG5cclxuICAgIHZhciAkcGFyZW50ID0gc2VsZWN0b3IgJiYgJChzZWxlY3RvcilcclxuXHJcbiAgICByZXR1cm4gJHBhcmVudCAmJiAkcGFyZW50Lmxlbmd0aCA/ICRwYXJlbnQgOiAkdGhpcy5wYXJlbnQoKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2xlYXJNZW51cyhlKSB7XHJcbiAgICBpZiAoZSAmJiBlLndoaWNoID09PSAzKSByZXR1cm5cclxuICAgICQoYmFja2Ryb3ApLnJlbW92ZSgpXHJcbiAgICAkKHRvZ2dsZSkuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgICAgICAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgJHBhcmVudCAgICAgICA9IGdldFBhcmVudCgkdGhpcylcclxuICAgICAgdmFyIHJlbGF0ZWRUYXJnZXQgPSB7IHJlbGF0ZWRUYXJnZXQ6IHRoaXMgfVxyXG5cclxuICAgICAgaWYgKCEkcGFyZW50Lmhhc0NsYXNzKCdvcGVuJykpIHJldHVyblxyXG5cclxuICAgICAgaWYgKGUgJiYgZS50eXBlID09ICdjbGljaycgJiYgL2lucHV0fHRleHRhcmVhL2kudGVzdChlLnRhcmdldC50YWdOYW1lKSAmJiAkLmNvbnRhaW5zKCRwYXJlbnRbMF0sIGUudGFyZ2V0KSkgcmV0dXJuXHJcblxyXG4gICAgICAkcGFyZW50LnRyaWdnZXIoZSA9ICQuRXZlbnQoJ2hpZGUuYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KSlcclxuXHJcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICAgICR0aGlzLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKVxyXG4gICAgICAkcGFyZW50LnJlbW92ZUNsYXNzKCdvcGVuJykudHJpZ2dlcigkLkV2ZW50KCdoaWRkZW4uYnMuZHJvcGRvd24nLCByZWxhdGVkVGFyZ2V0KSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBEcm9wZG93bi5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuXHJcbiAgICBpZiAoJHRoaXMuaXMoJy5kaXNhYmxlZCwgOmRpc2FibGVkJykpIHJldHVyblxyXG5cclxuICAgIHZhciAkcGFyZW50ICA9IGdldFBhcmVudCgkdGhpcylcclxuICAgIHZhciBpc0FjdGl2ZSA9ICRwYXJlbnQuaGFzQ2xhc3MoJ29wZW4nKVxyXG5cclxuICAgIGNsZWFyTWVudXMoKVxyXG5cclxuICAgIGlmICghaXNBY3RpdmUpIHtcclxuICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAhJHBhcmVudC5jbG9zZXN0KCcubmF2YmFyLW5hdicpLmxlbmd0aCkge1xyXG4gICAgICAgIC8vIGlmIG1vYmlsZSB3ZSB1c2UgYSBiYWNrZHJvcCBiZWNhdXNlIGNsaWNrIGV2ZW50cyBkb24ndCBkZWxlZ2F0ZVxyXG4gICAgICAgICQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpXHJcbiAgICAgICAgICAuYWRkQ2xhc3MoJ2Ryb3Bkb3duLWJhY2tkcm9wJylcclxuICAgICAgICAgIC5pbnNlcnRBZnRlcigkKHRoaXMpKVxyXG4gICAgICAgICAgLm9uKCdjbGljaycsIGNsZWFyTWVudXMpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciByZWxhdGVkVGFyZ2V0ID0geyByZWxhdGVkVGFyZ2V0OiB0aGlzIH1cclxuICAgICAgJHBhcmVudC50cmlnZ2VyKGUgPSAkLkV2ZW50KCdzaG93LmJzLmRyb3Bkb3duJywgcmVsYXRlZFRhcmdldCkpXHJcblxyXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgICAkdGhpc1xyXG4gICAgICAgIC50cmlnZ2VyKCdmb2N1cycpXHJcbiAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpXHJcblxyXG4gICAgICAkcGFyZW50XHJcbiAgICAgICAgLnRvZ2dsZUNsYXNzKCdvcGVuJylcclxuICAgICAgICAudHJpZ2dlcigkLkV2ZW50KCdzaG93bi5icy5kcm9wZG93bicsIHJlbGF0ZWRUYXJnZXQpKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgRHJvcGRvd24ucHJvdG90eXBlLmtleWRvd24gPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCEvKDM4fDQwfDI3fDMyKS8udGVzdChlLndoaWNoKSB8fCAvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcblxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcblxyXG4gICAgaWYgKCR0aGlzLmlzKCcuZGlzYWJsZWQsIDpkaXNhYmxlZCcpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgJHBhcmVudCAgPSBnZXRQYXJlbnQoJHRoaXMpXHJcbiAgICB2YXIgaXNBY3RpdmUgPSAkcGFyZW50Lmhhc0NsYXNzKCdvcGVuJylcclxuXHJcbiAgICBpZiAoIWlzQWN0aXZlICYmIGUud2hpY2ggIT0gMjcgfHwgaXNBY3RpdmUgJiYgZS53aGljaCA9PSAyNykge1xyXG4gICAgICBpZiAoZS53aGljaCA9PSAyNykgJHBhcmVudC5maW5kKHRvZ2dsZSkudHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICByZXR1cm4gJHRoaXMudHJpZ2dlcignY2xpY2snKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkZXNjID0gJyBsaTpub3QoLmRpc2FibGVkKTp2aXNpYmxlIGEnXHJcbiAgICB2YXIgJGl0ZW1zID0gJHBhcmVudC5maW5kKCcuZHJvcGRvd24tbWVudScgKyBkZXNjKVxyXG5cclxuICAgIGlmICghJGl0ZW1zLmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gICAgdmFyIGluZGV4ID0gJGl0ZW1zLmluZGV4KGUudGFyZ2V0KVxyXG5cclxuICAgIGlmIChlLndoaWNoID09IDM4ICYmIGluZGV4ID4gMCkgICAgICAgICAgICAgICAgIGluZGV4LS0gICAgICAgICAvLyB1cFxyXG4gICAgaWYgKGUud2hpY2ggPT0gNDAgJiYgaW5kZXggPCAkaXRlbXMubGVuZ3RoIC0gMSkgaW5kZXgrKyAgICAgICAgIC8vIGRvd25cclxuICAgIGlmICghfmluZGV4KSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMFxyXG5cclxuICAgICRpdGVtcy5lcShpbmRleCkudHJpZ2dlcignZm9jdXMnKVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIERST1BET1dOIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgID0gJHRoaXMuZGF0YSgnYnMuZHJvcGRvd24nKVxyXG5cclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5kcm9wZG93bicsIChkYXRhID0gbmV3IERyb3Bkb3duKHRoaXMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXS5jYWxsKCR0aGlzKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmRyb3Bkb3duXHJcblxyXG4gICQuZm4uZHJvcGRvd24gICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLmRyb3Bkb3duLkNvbnN0cnVjdG9yID0gRHJvcGRvd25cclxuXHJcblxyXG4gIC8vIERST1BET1dOIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5kcm9wZG93bi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5kcm9wZG93biA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBBUFBMWSBUTyBTVEFOREFSRCBEUk9QRE9XTiBFTEVNRU5UU1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpXHJcbiAgICAub24oJ2NsaWNrLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgY2xlYXJNZW51cylcclxuICAgIC5vbignY2xpY2suYnMuZHJvcGRvd24uZGF0YS1hcGknLCAnLmRyb3Bkb3duIGZvcm0nLCBmdW5jdGlvbiAoZSkgeyBlLnN0b3BQcm9wYWdhdGlvbigpIH0pXHJcbiAgICAub24oJ2NsaWNrLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgdG9nZ2xlLCBEcm9wZG93bi5wcm90b3R5cGUudG9nZ2xlKVxyXG4gICAgLm9uKCdrZXlkb3duLmJzLmRyb3Bkb3duLmRhdGEtYXBpJywgdG9nZ2xlLCBEcm9wZG93bi5wcm90b3R5cGUua2V5ZG93bilcclxuICAgIC5vbigna2V5ZG93bi5icy5kcm9wZG93bi5kYXRhLWFwaScsICcuZHJvcGRvd24tbWVudScsIERyb3Bkb3duLnByb3RvdHlwZS5rZXlkb3duKVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogbW9kYWwuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI21vZGFsc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gTU9EQUwgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIE1vZGFsID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMub3B0aW9ucyAgICAgICAgICAgICA9IG9wdGlvbnNcclxuICAgIHRoaXMuJGJvZHkgICAgICAgICAgICAgICA9ICQoZG9jdW1lbnQuYm9keSlcclxuICAgIHRoaXMuJGVsZW1lbnQgICAgICAgICAgICA9ICQoZWxlbWVudClcclxuICAgIHRoaXMuJGRpYWxvZyAgICAgICAgICAgICA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLm1vZGFsLWRpYWxvZycpXHJcbiAgICB0aGlzLiRiYWNrZHJvcCAgICAgICAgICAgPSBudWxsXHJcbiAgICB0aGlzLmlzU2hvd24gICAgICAgICAgICAgPSBudWxsXHJcbiAgICB0aGlzLm9yaWdpbmFsQm9keVBhZCAgICAgPSBudWxsXHJcbiAgICB0aGlzLnNjcm9sbGJhcldpZHRoICAgICAgPSAwXHJcbiAgICB0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2sgPSBmYWxzZVxyXG5cclxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVtb3RlKSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgICAuZmluZCgnLm1vZGFsLWNvbnRlbnQnKVxyXG4gICAgICAgIC5sb2FkKHRoaXMub3B0aW9ucy5yZW1vdGUsICQucHJveHkoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdsb2FkZWQuYnMubW9kYWwnKVxyXG4gICAgICAgIH0sIHRoaXMpKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgTW9kYWwuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04gPSAzMDBcclxuICBNb2RhbC5CQUNLRFJPUF9UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXHJcblxyXG4gIE1vZGFsLkRFRkFVTFRTID0ge1xyXG4gICAgYmFja2Ryb3A6IHRydWUsXHJcbiAgICBrZXlib2FyZDogdHJ1ZSxcclxuICAgIHNob3c6IHRydWVcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoX3JlbGF0ZWRUYXJnZXQpIHtcclxuICAgIHJldHVybiB0aGlzLmlzU2hvd24gPyB0aGlzLmhpZGUoKSA6IHRoaXMuc2hvdyhfcmVsYXRlZFRhcmdldClcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKF9yZWxhdGVkVGFyZ2V0KSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXNcclxuICAgIHZhciBlICAgID0gJC5FdmVudCgnc2hvdy5icy5tb2RhbCcsIHsgcmVsYXRlZFRhcmdldDogX3JlbGF0ZWRUYXJnZXQgfSlcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcclxuXHJcbiAgICBpZiAodGhpcy5pc1Nob3duIHx8IGUuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxyXG5cclxuICAgIHRoaXMuaXNTaG93biA9IHRydWVcclxuXHJcbiAgICB0aGlzLmNoZWNrU2Nyb2xsYmFyKClcclxuICAgIHRoaXMuc2V0U2Nyb2xsYmFyKClcclxuICAgIHRoaXMuJGJvZHkuYWRkQ2xhc3MoJ21vZGFsLW9wZW4nKVxyXG5cclxuICAgIHRoaXMuZXNjYXBlKClcclxuICAgIHRoaXMucmVzaXplKClcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJywgJ1tkYXRhLWRpc21pc3M9XCJtb2RhbFwiXScsICQucHJveHkodGhpcy5oaWRlLCB0aGlzKSlcclxuXHJcbiAgICB0aGlzLiRkaWFsb2cub24oJ21vdXNlZG93bi5kaXNtaXNzLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGF0LiRlbGVtZW50Lm9uZSgnbW91c2V1cC5kaXNtaXNzLmJzLm1vZGFsJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXModGhhdC4kZWxlbWVudCkpIHRoYXQuaWdub3JlQmFja2Ryb3BDbGljayA9IHRydWVcclxuICAgICAgfSlcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5iYWNrZHJvcChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciB0cmFuc2l0aW9uID0gJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgdGhhdC4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpXHJcblxyXG4gICAgICBpZiAoIXRoYXQuJGVsZW1lbnQucGFyZW50KCkubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhhdC4kZWxlbWVudC5hcHBlbmRUbyh0aGF0LiRib2R5KSAvLyBkb24ndCBtb3ZlIG1vZGFscyBkb20gcG9zaXRpb25cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhhdC4kZWxlbWVudFxyXG4gICAgICAgIC5zaG93KClcclxuICAgICAgICAuc2Nyb2xsVG9wKDApXHJcblxyXG4gICAgICB0aGF0LmFkanVzdERpYWxvZygpXHJcblxyXG4gICAgICBpZiAodHJhbnNpdGlvbikge1xyXG4gICAgICAgIHRoYXQuJGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gZm9yY2UgcmVmbG93XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoYXQuJGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcclxuXHJcbiAgICAgIHRoYXQuZW5mb3JjZUZvY3VzKClcclxuXHJcbiAgICAgIHZhciBlID0gJC5FdmVudCgnc2hvd24uYnMubW9kYWwnLCB7IHJlbGF0ZWRUYXJnZXQ6IF9yZWxhdGVkVGFyZ2V0IH0pXHJcblxyXG4gICAgICB0cmFuc2l0aW9uID9cclxuICAgICAgICB0aGF0LiRkaWFsb2cgLy8gd2FpdCBmb3IgbW9kYWwgdG8gc2xpZGUgaW5cclxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdmb2N1cycpLnRyaWdnZXIoZSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoTW9kYWwuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKS50cmlnZ2VyKGUpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKGUpIGUucHJldmVudERlZmF1bHQoKVxyXG5cclxuICAgIGUgPSAkLkV2ZW50KCdoaWRlLmJzLm1vZGFsJylcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcclxuXHJcbiAgICBpZiAoIXRoaXMuaXNTaG93biB8fCBlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB0aGlzLmlzU2hvd24gPSBmYWxzZVxyXG5cclxuICAgIHRoaXMuZXNjYXBlKClcclxuICAgIHRoaXMucmVzaXplKClcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLnJlbW92ZUNsYXNzKCdpbicpXHJcbiAgICAgIC5vZmYoJ2NsaWNrLmRpc21pc3MuYnMubW9kYWwnKVxyXG4gICAgICAub2ZmKCdtb3VzZXVwLmRpc21pc3MuYnMubW9kYWwnKVxyXG5cclxuICAgIHRoaXMuJGRpYWxvZy5vZmYoJ21vdXNlZG93bi5kaXNtaXNzLmJzLm1vZGFsJylcclxuXHJcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdmYWRlJykgP1xyXG4gICAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgICAgLm9uZSgnYnNUcmFuc2l0aW9uRW5kJywgJC5wcm94eSh0aGlzLmhpZGVNb2RhbCwgdGhpcykpXHJcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgdGhpcy5oaWRlTW9kYWwoKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmVuZm9yY2VGb2N1cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQoZG9jdW1lbnQpXHJcbiAgICAgIC5vZmYoJ2ZvY3VzaW4uYnMubW9kYWwnKSAvLyBndWFyZCBhZ2FpbnN0IGluZmluaXRlIGZvY3VzIGxvb3BcclxuICAgICAgLm9uKCdmb2N1c2luLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmIChkb2N1bWVudCAhPT0gZS50YXJnZXQgJiZcclxuICAgICAgICAgICAgdGhpcy4kZWxlbWVudFswXSAhPT0gZS50YXJnZXQgJiZcclxuICAgICAgICAgICAgIXRoaXMuJGVsZW1lbnQuaGFzKGUudGFyZ2V0KS5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICAgIH1cclxuICAgICAgfSwgdGhpcykpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuZXNjYXBlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuaXNTaG93biAmJiB0aGlzLm9wdGlvbnMua2V5Ym9hcmQpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5vbigna2V5ZG93bi5kaXNtaXNzLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUud2hpY2ggPT0gMjcgJiYgdGhpcy5oaWRlKClcclxuICAgICAgfSwgdGhpcykpXHJcbiAgICB9IGVsc2UgaWYgKCF0aGlzLmlzU2hvd24pIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ2tleWRvd24uZGlzbWlzcy5icy5tb2RhbCcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuaXNTaG93bikge1xyXG4gICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5icy5tb2RhbCcsICQucHJveHkodGhpcy5oYW5kbGVVcGRhdGUsIHRoaXMpKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJCh3aW5kb3cpLm9mZigncmVzaXplLmJzLm1vZGFsJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5oaWRlTW9kYWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXNcclxuICAgIHRoaXMuJGVsZW1lbnQuaGlkZSgpXHJcbiAgICB0aGlzLmJhY2tkcm9wKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhhdC4kYm9keS5yZW1vdmVDbGFzcygnbW9kYWwtb3BlbicpXHJcbiAgICAgIHRoYXQucmVzZXRBZGp1c3RtZW50cygpXHJcbiAgICAgIHRoYXQucmVzZXRTY3JvbGxiYXIoKVxyXG4gICAgICB0aGF0LiRlbGVtZW50LnRyaWdnZXIoJ2hpZGRlbi5icy5tb2RhbCcpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnJlbW92ZUJhY2tkcm9wID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy4kYmFja2Ryb3AgJiYgdGhpcy4kYmFja2Ryb3AucmVtb3ZlKClcclxuICAgIHRoaXMuJGJhY2tkcm9wID0gbnVsbFxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLmJhY2tkcm9wID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXNcclxuICAgIHZhciBhbmltYXRlID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZmFkZScpID8gJ2ZhZGUnIDogJydcclxuXHJcbiAgICBpZiAodGhpcy5pc1Nob3duICYmIHRoaXMub3B0aW9ucy5iYWNrZHJvcCkge1xyXG4gICAgICB2YXIgZG9BbmltYXRlID0gJC5zdXBwb3J0LnRyYW5zaXRpb24gJiYgYW5pbWF0ZVxyXG5cclxuICAgICAgdGhpcy4kYmFja2Ryb3AgPSAkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpKVxyXG4gICAgICAgIC5hZGRDbGFzcygnbW9kYWwtYmFja2Ryb3AgJyArIGFuaW1hdGUpXHJcbiAgICAgICAgLmFwcGVuZFRvKHRoaXMuJGJvZHkpXHJcblxyXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5kaXNtaXNzLmJzLm1vZGFsJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmlnbm9yZUJhY2tkcm9wQ2xpY2spIHtcclxuICAgICAgICAgIHRoaXMuaWdub3JlQmFja2Ryb3BDbGljayA9IGZhbHNlXHJcbiAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUudGFyZ2V0ICE9PSBlLmN1cnJlbnRUYXJnZXQpIHJldHVyblxyXG4gICAgICAgIHRoaXMub3B0aW9ucy5iYWNrZHJvcCA9PSAnc3RhdGljJ1xyXG4gICAgICAgICAgPyB0aGlzLiRlbGVtZW50WzBdLmZvY3VzKClcclxuICAgICAgICAgIDogdGhpcy5oaWRlKClcclxuICAgICAgfSwgdGhpcykpXHJcblxyXG4gICAgICBpZiAoZG9BbmltYXRlKSB0aGlzLiRiYWNrZHJvcFswXS5vZmZzZXRXaWR0aCAvLyBmb3JjZSByZWZsb3dcclxuXHJcbiAgICAgIHRoaXMuJGJhY2tkcm9wLmFkZENsYXNzKCdpbicpXHJcblxyXG4gICAgICBpZiAoIWNhbGxiYWNrKSByZXR1cm5cclxuXHJcbiAgICAgIGRvQW5pbWF0ZSA/XHJcbiAgICAgICAgdGhpcy4kYmFja2Ryb3BcclxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNhbGxiYWNrKVxyXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgICBjYWxsYmFjaygpXHJcblxyXG4gICAgfSBlbHNlIGlmICghdGhpcy5pc1Nob3duICYmIHRoaXMuJGJhY2tkcm9wKSB7XHJcbiAgICAgIHRoaXMuJGJhY2tkcm9wLnJlbW92ZUNsYXNzKCdpbicpXHJcblxyXG4gICAgICB2YXIgY2FsbGJhY2tSZW1vdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhhdC5yZW1vdmVCYWNrZHJvcCgpXHJcbiAgICAgICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soKVxyXG4gICAgICB9XHJcbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZhZGUnKSA/XHJcbiAgICAgICAgdGhpcy4kYmFja2Ryb3BcclxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNhbGxiYWNrUmVtb3ZlKVxyXG4gICAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKE1vZGFsLkJBQ0tEUk9QX1RSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgICBjYWxsYmFja1JlbW92ZSgpXHJcblxyXG4gICAgfSBlbHNlIGlmIChjYWxsYmFjaykge1xyXG4gICAgICBjYWxsYmFjaygpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyB0aGVzZSBmb2xsb3dpbmcgbWV0aG9kcyBhcmUgdXNlZCB0byBoYW5kbGUgb3ZlcmZsb3dpbmcgbW9kYWxzXHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5oYW5kbGVVcGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmFkanVzdERpYWxvZygpXHJcbiAgfVxyXG5cclxuICBNb2RhbC5wcm90b3R5cGUuYWRqdXN0RGlhbG9nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG1vZGFsSXNPdmVyZmxvd2luZyA9IHRoaXMuJGVsZW1lbnRbMF0uc2Nyb2xsSGVpZ2h0ID4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtcclxuICAgICAgcGFkZGluZ0xlZnQ6ICAhdGhpcy5ib2R5SXNPdmVyZmxvd2luZyAmJiBtb2RhbElzT3ZlcmZsb3dpbmcgPyB0aGlzLnNjcm9sbGJhcldpZHRoIDogJycsXHJcbiAgICAgIHBhZGRpbmdSaWdodDogdGhpcy5ib2R5SXNPdmVyZmxvd2luZyAmJiAhbW9kYWxJc092ZXJmbG93aW5nID8gdGhpcy5zY3JvbGxiYXJXaWR0aCA6ICcnXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnJlc2V0QWRqdXN0bWVudHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7XHJcbiAgICAgIHBhZGRpbmdMZWZ0OiAnJyxcclxuICAgICAgcGFkZGluZ1JpZ2h0OiAnJ1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5jaGVja1Njcm9sbGJhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBmdWxsV2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgaWYgKCFmdWxsV2luZG93V2lkdGgpIHsgLy8gd29ya2Fyb3VuZCBmb3IgbWlzc2luZyB3aW5kb3cuaW5uZXJXaWR0aCBpbiBJRThcclxuICAgICAgdmFyIGRvY3VtZW50RWxlbWVudFJlY3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgICAgZnVsbFdpbmRvd1dpZHRoID0gZG9jdW1lbnRFbGVtZW50UmVjdC5yaWdodCAtIE1hdGguYWJzKGRvY3VtZW50RWxlbWVudFJlY3QubGVmdClcclxuICAgIH1cclxuICAgIHRoaXMuYm9keUlzT3ZlcmZsb3dpbmcgPSBkb2N1bWVudC5ib2R5LmNsaWVudFdpZHRoIDwgZnVsbFdpbmRvd1dpZHRoXHJcbiAgICB0aGlzLnNjcm9sbGJhcldpZHRoID0gdGhpcy5tZWFzdXJlU2Nyb2xsYmFyKClcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5zZXRTY3JvbGxiYXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgYm9keVBhZCA9IHBhcnNlSW50KCh0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcpIHx8IDApLCAxMClcclxuICAgIHRoaXMub3JpZ2luYWxCb2R5UGFkID0gZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQgfHwgJydcclxuICAgIGlmICh0aGlzLmJvZHlJc092ZXJmbG93aW5nKSB0aGlzLiRib2R5LmNzcygncGFkZGluZy1yaWdodCcsIGJvZHlQYWQgKyB0aGlzLnNjcm9sbGJhcldpZHRoKVxyXG4gIH1cclxuXHJcbiAgTW9kYWwucHJvdG90eXBlLnJlc2V0U2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy4kYm9keS5jc3MoJ3BhZGRpbmctcmlnaHQnLCB0aGlzLm9yaWdpbmFsQm9keVBhZClcclxuICB9XHJcblxyXG4gIE1vZGFsLnByb3RvdHlwZS5tZWFzdXJlU2Nyb2xsYmFyID0gZnVuY3Rpb24gKCkgeyAvLyB0aHggd2Fsc2hcclxuICAgIHZhciBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgc2Nyb2xsRGl2LmNsYXNzTmFtZSA9ICdtb2RhbC1zY3JvbGxiYXItbWVhc3VyZSdcclxuICAgIHRoaXMuJGJvZHkuYXBwZW5kKHNjcm9sbERpdilcclxuICAgIHZhciBzY3JvbGxiYXJXaWR0aCA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aFxyXG4gICAgdGhpcy4kYm9keVswXS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpXHJcbiAgICByZXR1cm4gc2Nyb2xsYmFyV2lkdGhcclxuICB9XHJcblxyXG5cclxuICAvLyBNT0RBTCBQTFVHSU4gREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24sIF9yZWxhdGVkVGFyZ2V0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMubW9kYWwnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBNb2RhbC5ERUZBVUxUUywgJHRoaXMuZGF0YSgpLCB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbilcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMubW9kYWwnLCAoZGF0YSA9IG5ldyBNb2RhbCh0aGlzLCBvcHRpb25zKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oX3JlbGF0ZWRUYXJnZXQpXHJcbiAgICAgIGVsc2UgaWYgKG9wdGlvbnMuc2hvdykgZGF0YS5zaG93KF9yZWxhdGVkVGFyZ2V0KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLm1vZGFsXHJcblxyXG4gICQuZm4ubW9kYWwgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLm1vZGFsLkNvbnN0cnVjdG9yID0gTW9kYWxcclxuXHJcblxyXG4gIC8vIE1PREFMIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5tb2RhbC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5tb2RhbCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBNT0RBTCBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5tb2RhbC5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9XCJtb2RhbFwiXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcylcclxuICAgIHZhciBocmVmICAgID0gJHRoaXMuYXR0cignaHJlZicpXHJcbiAgICB2YXIgJHRhcmdldCA9ICQoJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKSB8fCAoaHJlZiAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSkpIC8vIHN0cmlwIGZvciBpZTdcclxuICAgIHZhciBvcHRpb24gID0gJHRhcmdldC5kYXRhKCdicy5tb2RhbCcpID8gJ3RvZ2dsZScgOiAkLmV4dGVuZCh7IHJlbW90ZTogIS8jLy50ZXN0KGhyZWYpICYmIGhyZWYgfSwgJHRhcmdldC5kYXRhKCksICR0aGlzLmRhdGEoKSlcclxuXHJcbiAgICBpZiAoJHRoaXMuaXMoJ2EnKSkgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgJHRhcmdldC5vbmUoJ3Nob3cuYnMubW9kYWwnLCBmdW5jdGlvbiAoc2hvd0V2ZW50KSB7XHJcbiAgICAgIGlmIChzaG93RXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVybiAvLyBvbmx5IHJlZ2lzdGVyIGZvY3VzIHJlc3RvcmVyIGlmIG1vZGFsIHdpbGwgYWN0dWFsbHkgZ2V0IHNob3duXHJcbiAgICAgICR0YXJnZXQub25lKCdoaWRkZW4uYnMubW9kYWwnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJHRoaXMuaXMoJzp2aXNpYmxlJykgJiYgJHRoaXMudHJpZ2dlcignZm9jdXMnKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICAgIFBsdWdpbi5jYWxsKCR0YXJnZXQsIG9wdGlvbiwgdGhpcylcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogdG9vbHRpcC5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdG9vbHRpcFxyXG4gKiBJbnNwaXJlZCBieSB0aGUgb3JpZ2luYWwgalF1ZXJ5LnRpcHN5IGJ5IEphc29uIEZyYW1lXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBUT09MVElQIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgVG9vbHRpcCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLnR5cGUgICAgICAgPSBudWxsXHJcbiAgICB0aGlzLm9wdGlvbnMgICAgPSBudWxsXHJcbiAgICB0aGlzLmVuYWJsZWQgICAgPSBudWxsXHJcbiAgICB0aGlzLnRpbWVvdXQgICAgPSBudWxsXHJcbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXHJcbiAgICB0aGlzLiRlbGVtZW50ICAgPSBudWxsXHJcbiAgICB0aGlzLmluU3RhdGUgICAgPSBudWxsXHJcblxyXG4gICAgdGhpcy5pbml0KCd0b29sdGlwJywgZWxlbWVudCwgb3B0aW9ucylcclxuICB9XHJcblxyXG4gIFRvb2x0aXAuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxyXG5cclxuICBUb29sdGlwLkRFRkFVTFRTID0ge1xyXG4gICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgcGxhY2VtZW50OiAndG9wJyxcclxuICAgIHNlbGVjdG9yOiBmYWxzZSxcclxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRvb2x0aXBcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLFxyXG4gICAgdHJpZ2dlcjogJ2hvdmVyIGZvY3VzJyxcclxuICAgIHRpdGxlOiAnJyxcclxuICAgIGRlbGF5OiAwLFxyXG4gICAgaHRtbDogZmFsc2UsXHJcbiAgICBjb250YWluZXI6IGZhbHNlLFxyXG4gICAgdmlld3BvcnQ6IHtcclxuICAgICAgc2VsZWN0b3I6ICdib2R5JyxcclxuICAgICAgcGFkZGluZzogMFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICh0eXBlLCBlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLmVuYWJsZWQgICA9IHRydWVcclxuICAgIHRoaXMudHlwZSAgICAgID0gdHlwZVxyXG4gICAgdGhpcy4kZWxlbWVudCAgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgICA9IHRoaXMuZ2V0T3B0aW9ucyhvcHRpb25zKVxyXG4gICAgdGhpcy4kdmlld3BvcnQgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgJCgkLmlzRnVuY3Rpb24odGhpcy5vcHRpb25zLnZpZXdwb3J0KSA/IHRoaXMub3B0aW9ucy52aWV3cG9ydC5jYWxsKHRoaXMsIHRoaXMuJGVsZW1lbnQpIDogKHRoaXMub3B0aW9ucy52aWV3cG9ydC5zZWxlY3RvciB8fCB0aGlzLm9wdGlvbnMudmlld3BvcnQpKVxyXG4gICAgdGhpcy5pblN0YXRlICAgPSB7IGNsaWNrOiBmYWxzZSwgaG92ZXI6IGZhbHNlLCBmb2N1czogZmFsc2UgfVxyXG5cclxuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdIGluc3RhbmNlb2YgZG9jdW1lbnQuY29uc3RydWN0b3IgJiYgIXRoaXMub3B0aW9ucy5zZWxlY3Rvcikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzZWxlY3RvcmAgb3B0aW9uIG11c3QgYmUgc3BlY2lmaWVkIHdoZW4gaW5pdGlhbGl6aW5nICcgKyB0aGlzLnR5cGUgKyAnIG9uIHRoZSB3aW5kb3cuZG9jdW1lbnQgb2JqZWN0IScpXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRyaWdnZXJzID0gdGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoJyAnKVxyXG5cclxuICAgIGZvciAodmFyIGkgPSB0cmlnZ2Vycy5sZW5ndGg7IGktLTspIHtcclxuICAgICAgdmFyIHRyaWdnZXIgPSB0cmlnZ2Vyc1tpXVxyXG5cclxuICAgICAgaWYgKHRyaWdnZXIgPT0gJ2NsaWNrJykge1xyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLnRvZ2dsZSwgdGhpcykpXHJcbiAgICAgIH0gZWxzZSBpZiAodHJpZ2dlciAhPSAnbWFudWFsJykge1xyXG4gICAgICAgIHZhciBldmVudEluICA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWVudGVyJyA6ICdmb2N1c2luJ1xyXG4gICAgICAgIHZhciBldmVudE91dCA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWxlYXZlJyA6ICdmb2N1c291dCdcclxuXHJcbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudEluICArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMuZW50ZXIsIHRoaXMpKVxyXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRPdXQgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmxlYXZlLCB0aGlzKSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMub3B0aW9ucy5zZWxlY3RvciA/XHJcbiAgICAgICh0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgeyB0cmlnZ2VyOiAnbWFudWFsJywgc2VsZWN0b3I6ICcnIH0pKSA6XHJcbiAgICAgIHRoaXMuZml4VGl0bGUoKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gVG9vbHRpcC5ERUZBVUxUU1xyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0T3B0aW9ucyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdHMoKSwgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpXHJcblxyXG4gICAgaWYgKG9wdGlvbnMuZGVsYXkgJiYgdHlwZW9mIG9wdGlvbnMuZGVsYXkgPT0gJ251bWJlcicpIHtcclxuICAgICAgb3B0aW9ucy5kZWxheSA9IHtcclxuICAgICAgICBzaG93OiBvcHRpb25zLmRlbGF5LFxyXG4gICAgICAgIGhpZGU6IG9wdGlvbnMuZGVsYXlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvcHRpb25zXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWxlZ2F0ZU9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgb3B0aW9ucyAgPSB7fVxyXG4gICAgdmFyIGRlZmF1bHRzID0gdGhpcy5nZXREZWZhdWx0cygpXHJcblxyXG4gICAgdGhpcy5fb3B0aW9ucyAmJiAkLmVhY2godGhpcy5fb3B0aW9ucywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcclxuICAgICAgaWYgKGRlZmF1bHRzW2tleV0gIT0gdmFsdWUpIG9wdGlvbnNba2V5XSA9IHZhbHVlXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBvcHRpb25zXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5lbnRlciA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XHJcbiAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXHJcblxyXG4gICAgaWYgKCFzZWxmKSB7XHJcbiAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcclxuICAgICAgJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcclxuICAgIH1cclxuXHJcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xyXG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3VzaW4nID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gdHJ1ZVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWxmLnRpcCgpLmhhc0NsYXNzKCdpbicpIHx8IHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSB7XHJcbiAgICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJUaW1lb3V0KHNlbGYudGltZW91dClcclxuXHJcbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXHJcblxyXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5zaG93KSByZXR1cm4gc2VsZi5zaG93KClcclxuXHJcbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSBzZWxmLnNob3coKVxyXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5pc0luU3RhdGVUcnVlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuaW5TdGF0ZSkge1xyXG4gICAgICBpZiAodGhpcy5pblN0YXRlW2tleV0pIHJldHVybiB0cnVlXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uIChvYmopIHtcclxuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XHJcbiAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXHJcblxyXG4gICAgaWYgKCFzZWxmKSB7XHJcbiAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcclxuICAgICAgJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcclxuICAgIH1cclxuXHJcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xyXG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3Vzb3V0JyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSByZXR1cm5cclxuXHJcbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxyXG5cclxuICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdvdXQnXHJcblxyXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5oaWRlKSByZXR1cm4gc2VsZi5oaWRlKClcclxuXHJcbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnb3V0Jykgc2VsZi5oaWRlKClcclxuICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5oaWRlKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBlID0gJC5FdmVudCgnc2hvdy5icy4nICsgdGhpcy50eXBlKVxyXG5cclxuICAgIGlmICh0aGlzLmhhc0NvbnRlbnQoKSAmJiB0aGlzLmVuYWJsZWQpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXHJcblxyXG4gICAgICB2YXIgaW5Eb20gPSAkLmNvbnRhaW5zKHRoaXMuJGVsZW1lbnRbMF0ub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHRoaXMuJGVsZW1lbnRbMF0pXHJcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8ICFpbkRvbSkgcmV0dXJuXHJcbiAgICAgIHZhciB0aGF0ID0gdGhpc1xyXG5cclxuICAgICAgdmFyICR0aXAgPSB0aGlzLnRpcCgpXHJcblxyXG4gICAgICB2YXIgdGlwSWQgPSB0aGlzLmdldFVJRCh0aGlzLnR5cGUpXHJcblxyXG4gICAgICB0aGlzLnNldENvbnRlbnQoKVxyXG4gICAgICAkdGlwLmF0dHIoJ2lkJywgdGlwSWQpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1kZXNjcmliZWRieScsIHRpcElkKVxyXG5cclxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5hbmltYXRpb24pICR0aXAuYWRkQ2xhc3MoJ2ZhZGUnKVxyXG5cclxuICAgICAgdmFyIHBsYWNlbWVudCA9IHR5cGVvZiB0aGlzLm9wdGlvbnMucGxhY2VtZW50ID09ICdmdW5jdGlvbicgP1xyXG4gICAgICAgIHRoaXMub3B0aW9ucy5wbGFjZW1lbnQuY2FsbCh0aGlzLCAkdGlwWzBdLCB0aGlzLiRlbGVtZW50WzBdKSA6XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudFxyXG5cclxuICAgICAgdmFyIGF1dG9Ub2tlbiA9IC9cXHM/YXV0bz9cXHM/L2lcclxuICAgICAgdmFyIGF1dG9QbGFjZSA9IGF1dG9Ub2tlbi50ZXN0KHBsYWNlbWVudClcclxuICAgICAgaWYgKGF1dG9QbGFjZSkgcGxhY2VtZW50ID0gcGxhY2VtZW50LnJlcGxhY2UoYXV0b1Rva2VuLCAnJykgfHwgJ3RvcCdcclxuXHJcbiAgICAgICR0aXBcclxuICAgICAgICAuZGV0YWNoKClcclxuICAgICAgICAuY3NzKHsgdG9wOiAwLCBsZWZ0OiAwLCBkaXNwbGF5OiAnYmxvY2snIH0pXHJcbiAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcclxuICAgICAgICAuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgdGhpcylcclxuXHJcbiAgICAgIHRoaXMub3B0aW9ucy5jb250YWluZXIgPyAkdGlwLmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpIDogJHRpcC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2luc2VydGVkLmJzLicgKyB0aGlzLnR5cGUpXHJcblxyXG4gICAgICB2YXIgcG9zICAgICAgICAgID0gdGhpcy5nZXRQb3NpdGlvbigpXHJcbiAgICAgIHZhciBhY3R1YWxXaWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXHJcbiAgICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxyXG5cclxuICAgICAgaWYgKGF1dG9QbGFjZSkge1xyXG4gICAgICAgIHZhciBvcmdQbGFjZW1lbnQgPSBwbGFjZW1lbnRcclxuICAgICAgICB2YXIgdmlld3BvcnREaW0gPSB0aGlzLmdldFBvc2l0aW9uKHRoaXMuJHZpZXdwb3J0KVxyXG5cclxuICAgICAgICBwbGFjZW1lbnQgPSBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgJiYgcG9zLmJvdHRvbSArIGFjdHVhbEhlaWdodCA+IHZpZXdwb3J0RGltLmJvdHRvbSA/ICd0b3AnICAgIDpcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgJiYgcG9zLnRvcCAgICAtIGFjdHVhbEhlaWdodCA8IHZpZXdwb3J0RGltLnRvcCAgICA/ICdib3R0b20nIDpcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAgJiYgcG9zLnJpZ2h0ICArIGFjdHVhbFdpZHRoICA+IHZpZXdwb3J0RGltLndpZHRoICA/ICdsZWZ0JyAgIDpcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgJiYgcG9zLmxlZnQgICAtIGFjdHVhbFdpZHRoICA8IHZpZXdwb3J0RGltLmxlZnQgICA/ICdyaWdodCcgIDpcclxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRcclxuXHJcbiAgICAgICAgJHRpcFxyXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKG9yZ1BsYWNlbWVudClcclxuICAgICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBjYWxjdWxhdGVkT2Zmc2V0ID0gdGhpcy5nZXRDYWxjdWxhdGVkT2Zmc2V0KHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxyXG5cclxuICAgICAgdGhpcy5hcHBseVBsYWNlbWVudChjYWxjdWxhdGVkT2Zmc2V0LCBwbGFjZW1lbnQpXHJcblxyXG4gICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHByZXZIb3ZlclN0YXRlID0gdGhhdC5ob3ZlclN0YXRlXHJcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdzaG93bi5icy4nICsgdGhhdC50eXBlKVxyXG4gICAgICAgIHRoYXQuaG92ZXJTdGF0ZSA9IG51bGxcclxuXHJcbiAgICAgICAgaWYgKHByZXZIb3ZlclN0YXRlID09ICdvdXQnKSB0aGF0LmxlYXZlKHRoYXQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJHRpcC5oYXNDbGFzcygnZmFkZScpID9cclxuICAgICAgICAkdGlwXHJcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcclxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcclxuICAgICAgICBjb21wbGV0ZSgpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5hcHBseVBsYWNlbWVudCA9IGZ1bmN0aW9uIChvZmZzZXQsIHBsYWNlbWVudCkge1xyXG4gICAgdmFyICR0aXAgICA9IHRoaXMudGlwKClcclxuICAgIHZhciB3aWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXHJcbiAgICB2YXIgaGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICAvLyBtYW51YWxseSByZWFkIG1hcmdpbnMgYmVjYXVzZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgaW5jbHVkZXMgZGlmZmVyZW5jZVxyXG4gICAgdmFyIG1hcmdpblRvcCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tdG9wJyksIDEwKVxyXG4gICAgdmFyIG1hcmdpbkxlZnQgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLWxlZnQnKSwgMTApXHJcblxyXG4gICAgLy8gd2UgbXVzdCBjaGVjayBmb3IgTmFOIGZvciBpZSA4LzlcclxuICAgIGlmIChpc05hTihtYXJnaW5Ub3ApKSAgbWFyZ2luVG9wICA9IDBcclxuICAgIGlmIChpc05hTihtYXJnaW5MZWZ0KSkgbWFyZ2luTGVmdCA9IDBcclxuXHJcbiAgICBvZmZzZXQudG9wICArPSBtYXJnaW5Ub3BcclxuICAgIG9mZnNldC5sZWZ0ICs9IG1hcmdpbkxlZnRcclxuXHJcbiAgICAvLyAkLmZuLm9mZnNldCBkb2Vzbid0IHJvdW5kIHBpeGVsIHZhbHVlc1xyXG4gICAgLy8gc28gd2UgdXNlIHNldE9mZnNldCBkaXJlY3RseSB3aXRoIG91ciBvd24gZnVuY3Rpb24gQi0wXHJcbiAgICAkLm9mZnNldC5zZXRPZmZzZXQoJHRpcFswXSwgJC5leHRlbmQoe1xyXG4gICAgICB1c2luZzogZnVuY3Rpb24gKHByb3BzKSB7XHJcbiAgICAgICAgJHRpcC5jc3Moe1xyXG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKHByb3BzLnRvcCksXHJcbiAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKHByb3BzLmxlZnQpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfSwgb2Zmc2V0KSwgMClcclxuXHJcbiAgICAkdGlwLmFkZENsYXNzKCdpbicpXHJcblxyXG4gICAgLy8gY2hlY2sgdG8gc2VlIGlmIHBsYWNpbmcgdGlwIGluIG5ldyBvZmZzZXQgY2F1c2VkIHRoZSB0aXAgdG8gcmVzaXplIGl0c2VsZlxyXG4gICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcclxuICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxyXG5cclxuICAgIGlmIChwbGFjZW1lbnQgPT0gJ3RvcCcgJiYgYWN0dWFsSGVpZ2h0ICE9IGhlaWdodCkge1xyXG4gICAgICBvZmZzZXQudG9wID0gb2Zmc2V0LnRvcCArIGhlaWdodCAtIGFjdHVhbEhlaWdodFxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkZWx0YSA9IHRoaXMuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhKHBsYWNlbWVudCwgb2Zmc2V0LCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxyXG5cclxuICAgIGlmIChkZWx0YS5sZWZ0KSBvZmZzZXQubGVmdCArPSBkZWx0YS5sZWZ0XHJcbiAgICBlbHNlIG9mZnNldC50b3AgKz0gZGVsdGEudG9wXHJcblxyXG4gICAgdmFyIGlzVmVydGljYWwgICAgICAgICAgPSAvdG9wfGJvdHRvbS8udGVzdChwbGFjZW1lbnQpXHJcbiAgICB2YXIgYXJyb3dEZWx0YSAgICAgICAgICA9IGlzVmVydGljYWwgPyBkZWx0YS5sZWZ0ICogMiAtIHdpZHRoICsgYWN0dWFsV2lkdGggOiBkZWx0YS50b3AgKiAyIC0gaGVpZ2h0ICsgYWN0dWFsSGVpZ2h0XHJcbiAgICB2YXIgYXJyb3dPZmZzZXRQb3NpdGlvbiA9IGlzVmVydGljYWwgPyAnb2Zmc2V0V2lkdGgnIDogJ29mZnNldEhlaWdodCdcclxuXHJcbiAgICAkdGlwLm9mZnNldChvZmZzZXQpXHJcbiAgICB0aGlzLnJlcGxhY2VBcnJvdyhhcnJvd0RlbHRhLCAkdGlwWzBdW2Fycm93T2Zmc2V0UG9zaXRpb25dLCBpc1ZlcnRpY2FsKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUucmVwbGFjZUFycm93ID0gZnVuY3Rpb24gKGRlbHRhLCBkaW1lbnNpb24sIGlzVmVydGljYWwpIHtcclxuICAgIHRoaXMuYXJyb3coKVxyXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAnbGVmdCcgOiAndG9wJywgNTAgKiAoMSAtIGRlbHRhIC8gZGltZW5zaW9uKSArICclJylcclxuICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ3RvcCcgOiAnbGVmdCcsICcnKVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuc2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkdGlwICA9IHRoaXMudGlwKClcclxuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKVxyXG5cclxuICAgICR0aXAuZmluZCgnLnRvb2x0aXAtaW5uZXInKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXHJcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIGluIHRvcCBib3R0b20gbGVmdCByaWdodCcpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXNcclxuICAgIHZhciAkdGlwID0gJCh0aGlzLiR0aXApXHJcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ2hpZGUuYnMuJyArIHRoaXMudHlwZSlcclxuXHJcbiAgICBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcclxuICAgICAgaWYgKHRoYXQuaG92ZXJTdGF0ZSAhPSAnaW4nKSAkdGlwLmRldGFjaCgpXHJcbiAgICAgIGlmICh0aGF0LiRlbGVtZW50KSB7IC8vIFRPRE86IENoZWNrIHdoZXRoZXIgZ3VhcmRpbmcgdGhpcyBjb2RlIHdpdGggdGhpcyBgaWZgIGlzIHJlYWxseSBuZWNlc3NhcnkuXHJcbiAgICAgICAgdGhhdC4kZWxlbWVudFxyXG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKVxyXG4gICAgICAgICAgLnRyaWdnZXIoJ2hpZGRlbi5icy4nICsgdGhhdC50eXBlKVxyXG4gICAgICB9XHJcbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcclxuXHJcbiAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnaW4nKVxyXG5cclxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmICR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XHJcbiAgICAgICR0aXBcclxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcclxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XHJcbiAgICAgIGNvbXBsZXRlKClcclxuXHJcbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmZpeFRpdGxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxyXG4gICAgaWYgKCRlLmF0dHIoJ3RpdGxlJykgfHwgdHlwZW9mICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnKSAhPSAnc3RyaW5nJykge1xyXG4gICAgICAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJywgJGUuYXR0cigndGl0bGUnKSB8fCAnJykuYXR0cigndGl0bGUnLCAnJylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRUaXRsZSgpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICgkZWxlbWVudCkge1xyXG4gICAgJGVsZW1lbnQgICA9ICRlbGVtZW50IHx8IHRoaXMuJGVsZW1lbnRcclxuXHJcbiAgICB2YXIgZWwgICAgID0gJGVsZW1lbnRbMF1cclxuICAgIHZhciBpc0JvZHkgPSBlbC50YWdOYW1lID09ICdCT0RZJ1xyXG5cclxuICAgIHZhciBlbFJlY3QgICAgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgaWYgKGVsUmVjdC53aWR0aCA9PSBudWxsKSB7XHJcbiAgICAgIC8vIHdpZHRoIGFuZCBoZWlnaHQgYXJlIG1pc3NpbmcgaW4gSUU4LCBzbyBjb21wdXRlIHRoZW0gbWFudWFsbHk7IHNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzE0MDkzXHJcbiAgICAgIGVsUmVjdCA9ICQuZXh0ZW5kKHt9LCBlbFJlY3QsIHsgd2lkdGg6IGVsUmVjdC5yaWdodCAtIGVsUmVjdC5sZWZ0LCBoZWlnaHQ6IGVsUmVjdC5ib3R0b20gLSBlbFJlY3QudG9wIH0pXHJcbiAgICB9XHJcbiAgICB2YXIgaXNTdmcgPSB3aW5kb3cuU1ZHRWxlbWVudCAmJiBlbCBpbnN0YW5jZW9mIHdpbmRvdy5TVkdFbGVtZW50XHJcbiAgICAvLyBBdm9pZCB1c2luZyAkLm9mZnNldCgpIG9uIFNWR3Mgc2luY2UgaXQgZ2l2ZXMgaW5jb3JyZWN0IHJlc3VsdHMgaW4galF1ZXJ5IDMuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8yMDI4MFxyXG4gICAgdmFyIGVsT2Zmc2V0ICA9IGlzQm9keSA/IHsgdG9wOiAwLCBsZWZ0OiAwIH0gOiAoaXNTdmcgPyBudWxsIDogJGVsZW1lbnQub2Zmc2V0KCkpXHJcbiAgICB2YXIgc2Nyb2xsICAgID0geyBzY3JvbGw6IGlzQm9keSA/IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgOiAkZWxlbWVudC5zY3JvbGxUb3AoKSB9XHJcbiAgICB2YXIgb3V0ZXJEaW1zID0gaXNCb2R5ID8geyB3aWR0aDogJCh3aW5kb3cpLndpZHRoKCksIGhlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpIH0gOiBudWxsXHJcblxyXG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBlbFJlY3QsIHNjcm9sbCwgb3V0ZXJEaW1zLCBlbE9mZnNldClcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldENhbGN1bGF0ZWRPZmZzZXQgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcclxuICAgIHJldHVybiBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQsICAgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxyXG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICA/IHsgdG9wOiBwb3MudG9wIC0gYWN0dWFsSGVpZ2h0LCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XHJcbiAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgID8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0IC0gYWN0dWFsV2lkdGggfSA6XHJcbiAgICAgICAgLyogcGxhY2VtZW50ID09ICdyaWdodCcgKi8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIH1cclxuXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcclxuICAgIHZhciBkZWx0YSA9IHsgdG9wOiAwLCBsZWZ0OiAwIH1cclxuICAgIGlmICghdGhpcy4kdmlld3BvcnQpIHJldHVybiBkZWx0YVxyXG5cclxuICAgIHZhciB2aWV3cG9ydFBhZGRpbmcgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgdGhpcy5vcHRpb25zLnZpZXdwb3J0LnBhZGRpbmcgfHwgMFxyXG4gICAgdmFyIHZpZXdwb3J0RGltZW5zaW9ucyA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXHJcblxyXG4gICAgaWYgKC9yaWdodHxsZWZ0Ly50ZXN0KHBsYWNlbWVudCkpIHtcclxuICAgICAgdmFyIHRvcEVkZ2VPZmZzZXQgICAgPSBwb3MudG9wIC0gdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbFxyXG4gICAgICB2YXIgYm90dG9tRWRnZU9mZnNldCA9IHBvcy50b3AgKyB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsICsgYWN0dWFsSGVpZ2h0XHJcbiAgICAgIGlmICh0b3BFZGdlT2Zmc2V0IDwgdmlld3BvcnREaW1lbnNpb25zLnRvcCkgeyAvLyB0b3Agb3ZlcmZsb3dcclxuICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wIC0gdG9wRWRnZU9mZnNldFxyXG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbUVkZ2VPZmZzZXQgPiB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCkgeyAvLyBib3R0b20gb3ZlcmZsb3dcclxuICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCAtIGJvdHRvbUVkZ2VPZmZzZXRcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIGxlZnRFZGdlT2Zmc2V0ICA9IHBvcy5sZWZ0IC0gdmlld3BvcnRQYWRkaW5nXHJcbiAgICAgIHZhciByaWdodEVkZ2VPZmZzZXQgPSBwb3MubGVmdCArIHZpZXdwb3J0UGFkZGluZyArIGFjdHVhbFdpZHRoXHJcbiAgICAgIGlmIChsZWZ0RWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0KSB7IC8vIGxlZnQgb3ZlcmZsb3dcclxuICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgLSBsZWZ0RWRnZU9mZnNldFxyXG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0RWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy5yaWdodCkgeyAvLyByaWdodCBvdmVyZmxvd1xyXG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCArIHZpZXdwb3J0RGltZW5zaW9ucy53aWR0aCAtIHJpZ2h0RWRnZU9mZnNldFxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRlbHRhXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRUaXRsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0aXRsZVxyXG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxyXG4gICAgdmFyIG8gID0gdGhpcy5vcHRpb25zXHJcblxyXG4gICAgdGl0bGUgPSAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJylcclxuICAgICAgfHwgKHR5cGVvZiBvLnRpdGxlID09ICdmdW5jdGlvbicgPyBvLnRpdGxlLmNhbGwoJGVbMF0pIDogIG8udGl0bGUpXHJcblxyXG4gICAgcmV0dXJuIHRpdGxlXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRVSUQgPSBmdW5jdGlvbiAocHJlZml4KSB7XHJcbiAgICBkbyBwcmVmaXggKz0gfn4oTWF0aC5yYW5kb20oKSAqIDEwMDAwMDApXHJcbiAgICB3aGlsZSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZml4KSlcclxuICAgIHJldHVybiBwcmVmaXhcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLnRpcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICghdGhpcy4kdGlwKSB7XHJcbiAgICAgIHRoaXMuJHRpcCA9ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKVxyXG4gICAgICBpZiAodGhpcy4kdGlwLmxlbmd0aCAhPSAxKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHRoaXMudHlwZSArICcgYHRlbXBsYXRlYCBvcHRpb24gbXVzdCBjb25zaXN0IG9mIGV4YWN0bHkgMSB0b3AtbGV2ZWwgZWxlbWVudCEnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy4kdGlwXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5hcnJvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy50b29sdGlwLWFycm93JykpXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5lbmFibGVkID0gZmFsc2VcclxuICB9XHJcblxyXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZUVuYWJsZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmVuYWJsZWQgPSAhdGhpcy5lbmFibGVkXHJcbiAgfVxyXG5cclxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzXHJcbiAgICBpZiAoZSkge1xyXG4gICAgICBzZWxmID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXHJcbiAgICAgIGlmICghc2VsZikge1xyXG4gICAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihlLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXHJcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoZSkge1xyXG4gICAgICBzZWxmLmluU3RhdGUuY2xpY2sgPSAhc2VsZi5pblN0YXRlLmNsaWNrXHJcbiAgICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgc2VsZi5lbnRlcihzZWxmKVxyXG4gICAgICBlbHNlIHNlbGYubGVhdmUoc2VsZilcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgPyBzZWxmLmxlYXZlKHNlbGYpIDogc2VsZi5lbnRlcihzZWxmKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgVG9vbHRpcC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0aGF0ID0gdGhpc1xyXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcclxuICAgIHRoaXMuaGlkZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoYXQuJGVsZW1lbnQub2ZmKCcuJyArIHRoYXQudHlwZSkucmVtb3ZlRGF0YSgnYnMuJyArIHRoYXQudHlwZSlcclxuICAgICAgaWYgKHRoYXQuJHRpcCkge1xyXG4gICAgICAgIHRoYXQuJHRpcC5kZXRhY2goKVxyXG4gICAgICB9XHJcbiAgICAgIHRoYXQuJHRpcCA9IG51bGxcclxuICAgICAgdGhhdC4kYXJyb3cgPSBudWxsXHJcbiAgICAgIHRoYXQuJHZpZXdwb3J0ID0gbnVsbFxyXG4gICAgICB0aGF0LiRlbGVtZW50ID0gbnVsbFxyXG4gICAgfSlcclxuICB9XHJcblxyXG5cclxuICAvLyBUT09MVElQIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcpXHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cclxuXHJcbiAgICAgIGlmICghZGF0YSAmJiAvZGVzdHJveXxoaWRlLy50ZXN0KG9wdGlvbikpIHJldHVyblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnLCAoZGF0YSA9IG5ldyBUb29sdGlwKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4udG9vbHRpcFxyXG5cclxuICAkLmZuLnRvb2x0aXAgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLnRvb2x0aXAuQ29uc3RydWN0b3IgPSBUb29sdGlwXHJcblxyXG5cclxuICAvLyBUT09MVElQIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLnRvb2x0aXAubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4udG9vbHRpcCA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBwb3BvdmVyLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyNwb3BvdmVyc1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gUE9QT1ZFUiBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIFBvcG92ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5pbml0KCdwb3BvdmVyJywgZWxlbWVudCwgb3B0aW9ucylcclxuICB9XHJcblxyXG4gIGlmICghJC5mbi50b29sdGlwKSB0aHJvdyBuZXcgRXJyb3IoJ1BvcG92ZXIgcmVxdWlyZXMgdG9vbHRpcC5qcycpXHJcblxyXG4gIFBvcG92ZXIuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIFBvcG92ZXIuREVGQVVMVFMgPSAkLmV4dGVuZCh7fSwgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yLkRFRkFVTFRTLCB7XHJcbiAgICBwbGFjZW1lbnQ6ICdyaWdodCcsXHJcbiAgICB0cmlnZ2VyOiAnY2xpY2snLFxyXG4gICAgY29udGVudDogJycsXHJcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJwb3BvdmVyXCIgcm9sZT1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwiYXJyb3dcIj48L2Rpdj48aDMgY2xhc3M9XCJwb3BvdmVyLXRpdGxlXCI+PC9oMz48ZGl2IGNsYXNzPVwicG9wb3Zlci1jb250ZW50XCI+PC9kaXY+PC9kaXY+J1xyXG4gIH0pXHJcblxyXG5cclxuICAvLyBOT1RFOiBQT1BPVkVSIEVYVEVORFMgdG9vbHRpcC5qc1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlID0gJC5leHRlbmQoe30sICQuZm4udG9vbHRpcC5Db25zdHJ1Y3Rvci5wcm90b3R5cGUpXHJcblxyXG4gIFBvcG92ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9wb3ZlclxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5nZXREZWZhdWx0cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBQb3BvdmVyLkRFRkFVTFRTXHJcbiAgfVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICR0aXAgICAgPSB0aGlzLnRpcCgpXHJcbiAgICB2YXIgdGl0bGUgICA9IHRoaXMuZ2V0VGl0bGUoKVxyXG4gICAgdmFyIGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKVxyXG5cclxuICAgICR0aXAuZmluZCgnLnBvcG92ZXItdGl0bGUnKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXHJcbiAgICAkdGlwLmZpbmQoJy5wb3BvdmVyLWNvbnRlbnQnKS5jaGlsZHJlbigpLmRldGFjaCgpLmVuZCgpWyAvLyB3ZSB1c2UgYXBwZW5kIGZvciBodG1sIG9iamVjdHMgdG8gbWFpbnRhaW4ganMgZXZlbnRzXHJcbiAgICAgIHRoaXMub3B0aW9ucy5odG1sID8gKHR5cGVvZiBjb250ZW50ID09ICdzdHJpbmcnID8gJ2h0bWwnIDogJ2FwcGVuZCcpIDogJ3RleHQnXHJcbiAgICBdKGNvbnRlbnQpXHJcblxyXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSB0b3AgYm90dG9tIGxlZnQgcmlnaHQgaW4nKVxyXG5cclxuICAgIC8vIElFOCBkb2Vzbid0IGFjY2VwdCBoaWRpbmcgdmlhIHRoZSBgOmVtcHR5YCBwc2V1ZG8gc2VsZWN0b3IsIHdlIGhhdmUgdG8gZG9cclxuICAgIC8vIHRoaXMgbWFudWFsbHkgYnkgY2hlY2tpbmcgdGhlIGNvbnRlbnRzLlxyXG4gICAgaWYgKCEkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaHRtbCgpKSAkdGlwLmZpbmQoJy5wb3BvdmVyLXRpdGxlJykuaGlkZSgpXHJcbiAgfVxyXG5cclxuICBQb3BvdmVyLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKSB8fCB0aGlzLmdldENvbnRlbnQoKVxyXG4gIH1cclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUuZ2V0Q29udGVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcclxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xyXG5cclxuICAgIHJldHVybiAkZS5hdHRyKCdkYXRhLWNvbnRlbnQnKVxyXG4gICAgICB8fCAodHlwZW9mIG8uY29udGVudCA9PSAnZnVuY3Rpb24nID9cclxuICAgICAgICAgICAgby5jb250ZW50LmNhbGwoJGVbMF0pIDpcclxuICAgICAgICAgICAgby5jb250ZW50KVxyXG4gIH1cclxuXHJcbiAgUG9wb3Zlci5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gKHRoaXMuJGFycm93ID0gdGhpcy4kYXJyb3cgfHwgdGhpcy50aXAoKS5maW5kKCcuYXJyb3cnKSlcclxuICB9XHJcblxyXG5cclxuICAvLyBQT1BPVkVSIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMucG9wb3ZlcicpXHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cclxuXHJcbiAgICAgIGlmICghZGF0YSAmJiAvZGVzdHJveXxoaWRlLy50ZXN0KG9wdGlvbikpIHJldHVyblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnBvcG92ZXInLCAoZGF0YSA9IG5ldyBQb3BvdmVyKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4ucG9wb3ZlclxyXG5cclxuICAkLmZuLnBvcG92ZXIgICAgICAgICAgICAgPSBQbHVnaW5cclxuICAkLmZuLnBvcG92ZXIuQ29uc3RydWN0b3IgPSBQb3BvdmVyXHJcblxyXG5cclxuICAvLyBQT1BPVkVSIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLnBvcG92ZXIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4ucG9wb3ZlciA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBzY3JvbGxzcHkuanMgdjMuMy43XHJcbiAqIGh0dHA6Ly9nZXRib290c3RyYXAuY29tL2phdmFzY3JpcHQvI3Njcm9sbHNweVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xyXG5cclxuXHJcbitmdW5jdGlvbiAoJCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgLy8gU0NST0xMU1BZIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBTY3JvbGxTcHkoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kYm9keSAgICAgICAgICA9ICQoZG9jdW1lbnQuYm9keSlcclxuICAgIHRoaXMuJHNjcm9sbEVsZW1lbnQgPSAkKGVsZW1lbnQpLmlzKGRvY3VtZW50LmJvZHkpID8gJCh3aW5kb3cpIDogJChlbGVtZW50KVxyXG4gICAgdGhpcy5vcHRpb25zICAgICAgICA9ICQuZXh0ZW5kKHt9LCBTY3JvbGxTcHkuREVGQVVMVFMsIG9wdGlvbnMpXHJcbiAgICB0aGlzLnNlbGVjdG9yICAgICAgID0gKHRoaXMub3B0aW9ucy50YXJnZXQgfHwgJycpICsgJyAubmF2IGxpID4gYSdcclxuICAgIHRoaXMub2Zmc2V0cyAgICAgICAgPSBbXVxyXG4gICAgdGhpcy50YXJnZXRzICAgICAgICA9IFtdXHJcbiAgICB0aGlzLmFjdGl2ZVRhcmdldCAgID0gbnVsbFxyXG4gICAgdGhpcy5zY3JvbGxIZWlnaHQgICA9IDBcclxuXHJcbiAgICB0aGlzLiRzY3JvbGxFbGVtZW50Lm9uKCdzY3JvbGwuYnMuc2Nyb2xsc3B5JywgJC5wcm94eSh0aGlzLnByb2Nlc3MsIHRoaXMpKVxyXG4gICAgdGhpcy5yZWZyZXNoKClcclxuICAgIHRoaXMucHJvY2VzcygpXHJcbiAgfVxyXG5cclxuICBTY3JvbGxTcHkuVkVSU0lPTiAgPSAnMy4zLjcnXHJcblxyXG4gIFNjcm9sbFNweS5ERUZBVUxUUyA9IHtcclxuICAgIG9mZnNldDogMTBcclxuICB9XHJcblxyXG4gIFNjcm9sbFNweS5wcm90b3R5cGUuZ2V0U2Nyb2xsSGVpZ2h0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuJHNjcm9sbEVsZW1lbnRbMF0uc2Nyb2xsSGVpZ2h0IHx8IE1hdGgubWF4KHRoaXMuJGJvZHlbMF0uc2Nyb2xsSGVpZ2h0LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KVxyXG4gIH1cclxuXHJcbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHRoYXQgICAgICAgICAgPSB0aGlzXHJcbiAgICB2YXIgb2Zmc2V0TWV0aG9kICA9ICdvZmZzZXQnXHJcbiAgICB2YXIgb2Zmc2V0QmFzZSAgICA9IDBcclxuXHJcbiAgICB0aGlzLm9mZnNldHMgICAgICA9IFtdXHJcbiAgICB0aGlzLnRhcmdldHMgICAgICA9IFtdXHJcbiAgICB0aGlzLnNjcm9sbEhlaWdodCA9IHRoaXMuZ2V0U2Nyb2xsSGVpZ2h0KClcclxuXHJcbiAgICBpZiAoISQuaXNXaW5kb3codGhpcy4kc2Nyb2xsRWxlbWVudFswXSkpIHtcclxuICAgICAgb2Zmc2V0TWV0aG9kID0gJ3Bvc2l0aW9uJ1xyXG4gICAgICBvZmZzZXRCYXNlICAgPSB0aGlzLiRzY3JvbGxFbGVtZW50LnNjcm9sbFRvcCgpXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy4kYm9keVxyXG4gICAgICAuZmluZCh0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAubWFwKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGVsICAgPSAkKHRoaXMpXHJcbiAgICAgICAgdmFyIGhyZWYgID0gJGVsLmRhdGEoJ3RhcmdldCcpIHx8ICRlbC5hdHRyKCdocmVmJylcclxuICAgICAgICB2YXIgJGhyZWYgPSAvXiMuLy50ZXN0KGhyZWYpICYmICQoaHJlZilcclxuXHJcbiAgICAgICAgcmV0dXJuICgkaHJlZlxyXG4gICAgICAgICAgJiYgJGhyZWYubGVuZ3RoXHJcbiAgICAgICAgICAmJiAkaHJlZi5pcygnOnZpc2libGUnKVxyXG4gICAgICAgICAgJiYgW1skaHJlZltvZmZzZXRNZXRob2RdKCkudG9wICsgb2Zmc2V0QmFzZSwgaHJlZl1dKSB8fCBudWxsXHJcbiAgICAgIH0pXHJcbiAgICAgIC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhWzBdIC0gYlswXSB9KVxyXG4gICAgICAuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhhdC5vZmZzZXRzLnB1c2godGhpc1swXSlcclxuICAgICAgICB0aGF0LnRhcmdldHMucHVzaCh0aGlzWzFdKVxyXG4gICAgICB9KVxyXG4gIH1cclxuXHJcbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5wcm9jZXNzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHNjcm9sbFRvcCAgICA9IHRoaXMuJHNjcm9sbEVsZW1lbnQuc2Nyb2xsVG9wKCkgKyB0aGlzLm9wdGlvbnMub2Zmc2V0XHJcbiAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gdGhpcy5nZXRTY3JvbGxIZWlnaHQoKVxyXG4gICAgdmFyIG1heFNjcm9sbCAgICA9IHRoaXMub3B0aW9ucy5vZmZzZXQgKyBzY3JvbGxIZWlnaHQgLSB0aGlzLiRzY3JvbGxFbGVtZW50LmhlaWdodCgpXHJcbiAgICB2YXIgb2Zmc2V0cyAgICAgID0gdGhpcy5vZmZzZXRzXHJcbiAgICB2YXIgdGFyZ2V0cyAgICAgID0gdGhpcy50YXJnZXRzXHJcbiAgICB2YXIgYWN0aXZlVGFyZ2V0ID0gdGhpcy5hY3RpdmVUYXJnZXRcclxuICAgIHZhciBpXHJcblxyXG4gICAgaWYgKHRoaXMuc2Nyb2xsSGVpZ2h0ICE9IHNjcm9sbEhlaWdodCkge1xyXG4gICAgICB0aGlzLnJlZnJlc2goKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzY3JvbGxUb3AgPj0gbWF4U2Nyb2xsKSB7XHJcbiAgICAgIHJldHVybiBhY3RpdmVUYXJnZXQgIT0gKGkgPSB0YXJnZXRzW3RhcmdldHMubGVuZ3RoIC0gMV0pICYmIHRoaXMuYWN0aXZhdGUoaSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWN0aXZlVGFyZ2V0ICYmIHNjcm9sbFRvcCA8IG9mZnNldHNbMF0pIHtcclxuICAgICAgdGhpcy5hY3RpdmVUYXJnZXQgPSBudWxsXHJcbiAgICAgIHJldHVybiB0aGlzLmNsZWFyKClcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSBvZmZzZXRzLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICBhY3RpdmVUYXJnZXQgIT0gdGFyZ2V0c1tpXVxyXG4gICAgICAgICYmIHNjcm9sbFRvcCA+PSBvZmZzZXRzW2ldXHJcbiAgICAgICAgJiYgKG9mZnNldHNbaSArIDFdID09PSB1bmRlZmluZWQgfHwgc2Nyb2xsVG9wIDwgb2Zmc2V0c1tpICsgMV0pXHJcbiAgICAgICAgJiYgdGhpcy5hY3RpdmF0ZSh0YXJnZXRzW2ldKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgIHRoaXMuYWN0aXZlVGFyZ2V0ID0gdGFyZ2V0XHJcblxyXG4gICAgdGhpcy5jbGVhcigpXHJcblxyXG4gICAgdmFyIHNlbGVjdG9yID0gdGhpcy5zZWxlY3RvciArXHJcbiAgICAgICdbZGF0YS10YXJnZXQ9XCInICsgdGFyZ2V0ICsgJ1wiXSwnICtcclxuICAgICAgdGhpcy5zZWxlY3RvciArICdbaHJlZj1cIicgKyB0YXJnZXQgKyAnXCJdJ1xyXG5cclxuICAgIHZhciBhY3RpdmUgPSAkKHNlbGVjdG9yKVxyXG4gICAgICAucGFyZW50cygnbGknKVxyXG4gICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcblxyXG4gICAgaWYgKGFjdGl2ZS5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykubGVuZ3RoKSB7XHJcbiAgICAgIGFjdGl2ZSA9IGFjdGl2ZVxyXG4gICAgICAgIC5jbG9zZXN0KCdsaS5kcm9wZG93bicpXHJcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgfVxyXG5cclxuICAgIGFjdGl2ZS50cmlnZ2VyKCdhY3RpdmF0ZS5icy5zY3JvbGxzcHknKVxyXG4gIH1cclxuXHJcbiAgU2Nyb2xsU3B5LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQodGhpcy5zZWxlY3RvcilcclxuICAgICAgLnBhcmVudHNVbnRpbCh0aGlzLm9wdGlvbnMudGFyZ2V0LCAnLmFjdGl2ZScpXHJcbiAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICB9XHJcblxyXG5cclxuICAvLyBTQ1JPTExTUFkgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxyXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnNjcm9sbHNweScpXHJcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuc2Nyb2xsc3B5JywgKGRhdGEgPSBuZXcgU2Nyb2xsU3B5KHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uc2Nyb2xsc3B5XHJcblxyXG4gICQuZm4uc2Nyb2xsc3B5ICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5zY3JvbGxzcHkuQ29uc3RydWN0b3IgPSBTY3JvbGxTcHlcclxuXHJcblxyXG4gIC8vIFNDUk9MTFNQWSBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLnNjcm9sbHNweS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5zY3JvbGxzcHkgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gU0NST0xMU1BZIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQod2luZG93KS5vbignbG9hZC5icy5zY3JvbGxzcHkuZGF0YS1hcGknLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdbZGF0YS1zcHk9XCJzY3JvbGxcIl0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICRzcHkgPSAkKHRoaXMpXHJcbiAgICAgIFBsdWdpbi5jYWxsKCRzcHksICRzcHkuZGF0YSgpKVxyXG4gICAgfSlcclxuICB9KVxyXG5cclxufShqUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogdGFiLmpzIHYzLjMuN1xyXG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0YWJzXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cclxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG5cclxuK2Z1bmN0aW9uICgkKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAvLyBUQUIgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBUYWIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgLy8ganNjczpkaXNhYmxlIHJlcXVpcmVEb2xsYXJCZWZvcmVqUXVlcnlBc3NpZ25tZW50XHJcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpXHJcbiAgICAvLyBqc2NzOmVuYWJsZSByZXF1aXJlRG9sbGFyQmVmb3JlalF1ZXJ5QXNzaWdubWVudFxyXG4gIH1cclxuXHJcbiAgVGFiLlZFUlNJT04gPSAnMy4zLjcnXHJcblxyXG4gIFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXHJcblxyXG4gIFRhYi5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciAkdGhpcyAgICA9IHRoaXMuZWxlbWVudFxyXG4gICAgdmFyICR1bCAgICAgID0gJHRoaXMuY2xvc2VzdCgndWw6bm90KC5kcm9wZG93bi1tZW51KScpXHJcbiAgICB2YXIgc2VsZWN0b3IgPSAkdGhpcy5kYXRhKCd0YXJnZXQnKVxyXG5cclxuICAgIGlmICghc2VsZWN0b3IpIHtcclxuICAgICAgc2VsZWN0b3IgPSAkdGhpcy5hdHRyKCdocmVmJylcclxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgkdGhpcy5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm5cclxuXHJcbiAgICB2YXIgJHByZXZpb3VzID0gJHVsLmZpbmQoJy5hY3RpdmU6bGFzdCBhJylcclxuICAgIHZhciBoaWRlRXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLnRhYicsIHtcclxuICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cclxuICAgIH0pXHJcbiAgICB2YXIgc2hvd0V2ZW50ID0gJC5FdmVudCgnc2hvdy5icy50YWInLCB7XHJcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxyXG4gICAgfSlcclxuXHJcbiAgICAkcHJldmlvdXMudHJpZ2dlcihoaWRlRXZlbnQpXHJcbiAgICAkdGhpcy50cmlnZ2VyKHNob3dFdmVudClcclxuXHJcbiAgICBpZiAoc2hvd0V2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8IGhpZGVFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyICR0YXJnZXQgPSAkKHNlbGVjdG9yKVxyXG5cclxuICAgIHRoaXMuYWN0aXZhdGUoJHRoaXMuY2xvc2VzdCgnbGknKSwgJHVsKVxyXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGFyZ2V0LCAkdGFyZ2V0LnBhcmVudCgpLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICRwcmV2aW91cy50cmlnZ2VyKHtcclxuICAgICAgICB0eXBlOiAnaGlkZGVuLmJzLnRhYicsXHJcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cclxuICAgICAgfSlcclxuICAgICAgJHRoaXMudHJpZ2dlcih7XHJcbiAgICAgICAgdHlwZTogJ3Nob3duLmJzLnRhYicsXHJcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHByZXZpb3VzWzBdXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgVGFiLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250YWluZXIsIGNhbGxiYWNrKSB7XHJcbiAgICB2YXIgJGFjdGl2ZSAgICA9IGNvbnRhaW5lci5maW5kKCc+IC5hY3RpdmUnKVxyXG4gICAgdmFyIHRyYW5zaXRpb24gPSBjYWxsYmFja1xyXG4gICAgICAmJiAkLnN1cHBvcnQudHJhbnNpdGlvblxyXG4gICAgICAmJiAoJGFjdGl2ZS5sZW5ndGggJiYgJGFjdGl2ZS5oYXNDbGFzcygnZmFkZScpIHx8ICEhY29udGFpbmVyLmZpbmQoJz4gLmZhZGUnKS5sZW5ndGgpXHJcblxyXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcclxuICAgICAgJGFjdGl2ZVxyXG4gICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcclxuICAgICAgICAuZmluZCgnPiAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUnKVxyXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgIC5lbmQoKVxyXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxyXG4gICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCBmYWxzZSlcclxuXHJcbiAgICAgIGVsZW1lbnRcclxuICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgICAgICAgLmZpbmQoJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScpXHJcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXHJcblxyXG4gICAgICBpZiAodHJhbnNpdGlvbikge1xyXG4gICAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gcmVmbG93IGZvciB0cmFuc2l0aW9uXHJcbiAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaW4nKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZhZGUnKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZWxlbWVudC5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykubGVuZ3RoKSB7XHJcbiAgICAgICAgZWxlbWVudFxyXG4gICAgICAgICAgLmNsb3Nlc3QoJ2xpLmRyb3Bkb3duJylcclxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gICAgICAgICAgLmVuZCgpXHJcbiAgICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcclxuICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXHJcbiAgICB9XHJcblxyXG4gICAgJGFjdGl2ZS5sZW5ndGggJiYgdHJhbnNpdGlvbiA/XHJcbiAgICAgICRhY3RpdmVcclxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBuZXh0KVxyXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUYWIuVFJBTlNJVElPTl9EVVJBVElPTikgOlxyXG4gICAgICBuZXh0KClcclxuXHJcbiAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdpbicpXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gVEFCIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICA9ICR0aGlzLmRhdGEoJ2JzLnRhYicpXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRhYicsIChkYXRhID0gbmV3IFRhYih0aGlzKSkpXHJcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLnRhYlxyXG5cclxuICAkLmZuLnRhYiAgICAgICAgICAgICA9IFBsdWdpblxyXG4gICQuZm4udGFiLkNvbnN0cnVjdG9yID0gVGFiXHJcblxyXG5cclxuICAvLyBUQUIgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi50YWIubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4udGFiID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIFRBQiBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PVxyXG5cclxuICB2YXIgY2xpY2tIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgUGx1Z2luLmNhbGwoJCh0aGlzKSwgJ3Nob3cnKVxyXG4gIH1cclxuXHJcbiAgJChkb2N1bWVudClcclxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInRhYlwiXScsIGNsaWNrSGFuZGxlcilcclxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInBpbGxcIl0nLCBjbGlja0hhbmRsZXIpXHJcblxyXG59KGpRdWVyeSk7XHJcblxyXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBhZmZpeC5qcyB2My4zLjdcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jYWZmaXhcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIEFGRklYIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBBZmZpeCA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWZmaXguREVGQVVMVFMsIG9wdGlvbnMpXHJcblxyXG4gICAgdGhpcy4kdGFyZ2V0ID0gJCh0aGlzLm9wdGlvbnMudGFyZ2V0KVxyXG4gICAgICAub24oJ3Njcm9sbC5icy5hZmZpeC5kYXRhLWFwaScsICQucHJveHkodGhpcy5jaGVja1Bvc2l0aW9uLCB0aGlzKSlcclxuICAgICAgLm9uKCdjbGljay5icy5hZmZpeC5kYXRhLWFwaScsICAkLnByb3h5KHRoaXMuY2hlY2tQb3NpdGlvbldpdGhFdmVudExvb3AsIHRoaXMpKVxyXG5cclxuICAgIHRoaXMuJGVsZW1lbnQgICAgID0gJChlbGVtZW50KVxyXG4gICAgdGhpcy5hZmZpeGVkICAgICAgPSBudWxsXHJcbiAgICB0aGlzLnVucGluICAgICAgICA9IG51bGxcclxuICAgIHRoaXMucGlubmVkT2Zmc2V0ID0gbnVsbFxyXG5cclxuICAgIHRoaXMuY2hlY2tQb3NpdGlvbigpXHJcbiAgfVxyXG5cclxuICBBZmZpeC5WRVJTSU9OICA9ICczLjMuNydcclxuXHJcbiAgQWZmaXguUkVTRVQgICAgPSAnYWZmaXggYWZmaXgtdG9wIGFmZml4LWJvdHRvbSdcclxuXHJcbiAgQWZmaXguREVGQVVMVFMgPSB7XHJcbiAgICBvZmZzZXQ6IDAsXHJcbiAgICB0YXJnZXQ6IHdpbmRvd1xyXG4gIH1cclxuXHJcbiAgQWZmaXgucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24gKHNjcm9sbEhlaWdodCwgaGVpZ2h0LCBvZmZzZXRUb3AsIG9mZnNldEJvdHRvbSkge1xyXG4gICAgdmFyIHNjcm9sbFRvcCAgICA9IHRoaXMuJHRhcmdldC5zY3JvbGxUb3AoKVxyXG4gICAgdmFyIHBvc2l0aW9uICAgICA9IHRoaXMuJGVsZW1lbnQub2Zmc2V0KClcclxuICAgIHZhciB0YXJnZXRIZWlnaHQgPSB0aGlzLiR0YXJnZXQuaGVpZ2h0KClcclxuXHJcbiAgICBpZiAob2Zmc2V0VG9wICE9IG51bGwgJiYgdGhpcy5hZmZpeGVkID09ICd0b3AnKSByZXR1cm4gc2Nyb2xsVG9wIDwgb2Zmc2V0VG9wID8gJ3RvcCcgOiBmYWxzZVxyXG5cclxuICAgIGlmICh0aGlzLmFmZml4ZWQgPT0gJ2JvdHRvbScpIHtcclxuICAgICAgaWYgKG9mZnNldFRvcCAhPSBudWxsKSByZXR1cm4gKHNjcm9sbFRvcCArIHRoaXMudW5waW4gPD0gcG9zaXRpb24udG9wKSA/IGZhbHNlIDogJ2JvdHRvbSdcclxuICAgICAgcmV0dXJuIChzY3JvbGxUb3AgKyB0YXJnZXRIZWlnaHQgPD0gc2Nyb2xsSGVpZ2h0IC0gb2Zmc2V0Qm90dG9tKSA/IGZhbHNlIDogJ2JvdHRvbSdcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaW5pdGlhbGl6aW5nICAgPSB0aGlzLmFmZml4ZWQgPT0gbnVsbFxyXG4gICAgdmFyIGNvbGxpZGVyVG9wICAgID0gaW5pdGlhbGl6aW5nID8gc2Nyb2xsVG9wIDogcG9zaXRpb24udG9wXHJcbiAgICB2YXIgY29sbGlkZXJIZWlnaHQgPSBpbml0aWFsaXppbmcgPyB0YXJnZXRIZWlnaHQgOiBoZWlnaHRcclxuXHJcbiAgICBpZiAob2Zmc2V0VG9wICE9IG51bGwgJiYgc2Nyb2xsVG9wIDw9IG9mZnNldFRvcCkgcmV0dXJuICd0b3AnXHJcbiAgICBpZiAob2Zmc2V0Qm90dG9tICE9IG51bGwgJiYgKGNvbGxpZGVyVG9wICsgY29sbGlkZXJIZWlnaHQgPj0gc2Nyb2xsSGVpZ2h0IC0gb2Zmc2V0Qm90dG9tKSkgcmV0dXJuICdib3R0b20nXHJcblxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG5cclxuICBBZmZpeC5wcm90b3R5cGUuZ2V0UGlubmVkT2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMucGlubmVkT2Zmc2V0KSByZXR1cm4gdGhpcy5waW5uZWRPZmZzZXRcclxuICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoQWZmaXguUkVTRVQpLmFkZENsYXNzKCdhZmZpeCcpXHJcbiAgICB2YXIgc2Nyb2xsVG9wID0gdGhpcy4kdGFyZ2V0LnNjcm9sbFRvcCgpXHJcbiAgICB2YXIgcG9zaXRpb24gID0gdGhpcy4kZWxlbWVudC5vZmZzZXQoKVxyXG4gICAgcmV0dXJuICh0aGlzLnBpbm5lZE9mZnNldCA9IHBvc2l0aW9uLnRvcCAtIHNjcm9sbFRvcClcclxuICB9XHJcblxyXG4gIEFmZml4LnByb3RvdHlwZS5jaGVja1Bvc2l0aW9uV2l0aEV2ZW50TG9vcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHNldFRpbWVvdXQoJC5wcm94eSh0aGlzLmNoZWNrUG9zaXRpb24sIHRoaXMpLCAxKVxyXG4gIH1cclxuXHJcbiAgQWZmaXgucHJvdG90eXBlLmNoZWNrUG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaXMoJzp2aXNpYmxlJykpIHJldHVyblxyXG5cclxuICAgIHZhciBoZWlnaHQgICAgICAgPSB0aGlzLiRlbGVtZW50LmhlaWdodCgpXHJcbiAgICB2YXIgb2Zmc2V0ICAgICAgID0gdGhpcy5vcHRpb25zLm9mZnNldFxyXG4gICAgdmFyIG9mZnNldFRvcCAgICA9IG9mZnNldC50b3BcclxuICAgIHZhciBvZmZzZXRCb3R0b20gPSBvZmZzZXQuYm90dG9tXHJcbiAgICB2YXIgc2Nyb2xsSGVpZ2h0ID0gTWF0aC5tYXgoJChkb2N1bWVudCkuaGVpZ2h0KCksICQoZG9jdW1lbnQuYm9keSkuaGVpZ2h0KCkpXHJcblxyXG4gICAgaWYgKHR5cGVvZiBvZmZzZXQgIT0gJ29iamVjdCcpICAgICAgICAgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0VG9wID0gb2Zmc2V0XHJcbiAgICBpZiAodHlwZW9mIG9mZnNldFRvcCA9PSAnZnVuY3Rpb24nKSAgICBvZmZzZXRUb3AgICAgPSBvZmZzZXQudG9wKHRoaXMuJGVsZW1lbnQpXHJcbiAgICBpZiAodHlwZW9mIG9mZnNldEJvdHRvbSA9PSAnZnVuY3Rpb24nKSBvZmZzZXRCb3R0b20gPSBvZmZzZXQuYm90dG9tKHRoaXMuJGVsZW1lbnQpXHJcblxyXG4gICAgdmFyIGFmZml4ID0gdGhpcy5nZXRTdGF0ZShzY3JvbGxIZWlnaHQsIGhlaWdodCwgb2Zmc2V0VG9wLCBvZmZzZXRCb3R0b20pXHJcblxyXG4gICAgaWYgKHRoaXMuYWZmaXhlZCAhPSBhZmZpeCkge1xyXG4gICAgICBpZiAodGhpcy51bnBpbiAhPSBudWxsKSB0aGlzLiRlbGVtZW50LmNzcygndG9wJywgJycpXHJcblxyXG4gICAgICB2YXIgYWZmaXhUeXBlID0gJ2FmZml4JyArIChhZmZpeCA/ICctJyArIGFmZml4IDogJycpXHJcbiAgICAgIHZhciBlICAgICAgICAgPSAkLkV2ZW50KGFmZml4VHlwZSArICcuYnMuYWZmaXgnKVxyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXHJcblxyXG4gICAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgICB0aGlzLmFmZml4ZWQgPSBhZmZpeFxyXG4gICAgICB0aGlzLnVucGluID0gYWZmaXggPT0gJ2JvdHRvbScgPyB0aGlzLmdldFBpbm5lZE9mZnNldCgpIDogbnVsbFxyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudFxyXG4gICAgICAgIC5yZW1vdmVDbGFzcyhBZmZpeC5SRVNFVClcclxuICAgICAgICAuYWRkQ2xhc3MoYWZmaXhUeXBlKVxyXG4gICAgICAgIC50cmlnZ2VyKGFmZml4VHlwZS5yZXBsYWNlKCdhZmZpeCcsICdhZmZpeGVkJykgKyAnLmJzLmFmZml4JylcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWZmaXggPT0gJ2JvdHRvbScpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5vZmZzZXQoe1xyXG4gICAgICAgIHRvcDogc2Nyb2xsSGVpZ2h0IC0gaGVpZ2h0IC0gb2Zmc2V0Qm90dG9tXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQUZGSVggUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMuYWZmaXgnKVxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb24gPT0gJ29iamVjdCcgJiYgb3B0aW9uXHJcblxyXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLmFmZml4JywgKGRhdGEgPSBuZXcgQWZmaXgodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5hZmZpeFxyXG5cclxuICAkLmZuLmFmZml4ICAgICAgICAgICAgID0gUGx1Z2luXHJcbiAgJC5mbi5hZmZpeC5Db25zdHJ1Y3RvciA9IEFmZml4XHJcblxyXG5cclxuICAvLyBBRkZJWCBOTyBDT05GTElDVFxyXG4gIC8vID09PT09PT09PT09PT09PT09XHJcblxyXG4gICQuZm4uYWZmaXgubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uYWZmaXggPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQUZGSVggREFUQS1BUElcclxuICAvLyA9PT09PT09PT09PT09PVxyXG5cclxuICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAkKCdbZGF0YS1zcHk9XCJhZmZpeFwiXScpLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHNweSA9ICQodGhpcylcclxuICAgICAgdmFyIGRhdGEgPSAkc3B5LmRhdGEoKVxyXG5cclxuICAgICAgZGF0YS5vZmZzZXQgPSBkYXRhLm9mZnNldCB8fCB7fVxyXG5cclxuICAgICAgaWYgKGRhdGEub2Zmc2V0Qm90dG9tICE9IG51bGwpIGRhdGEub2Zmc2V0LmJvdHRvbSA9IGRhdGEub2Zmc2V0Qm90dG9tXHJcbiAgICAgIGlmIChkYXRhLm9mZnNldFRvcCAgICAhPSBudWxsKSBkYXRhLm9mZnNldC50b3AgICAgPSBkYXRhLm9mZnNldFRvcFxyXG5cclxuICAgICAgUGx1Z2luLmNhbGwoJHNweSwgZGF0YSlcclxuICAgIH0pXHJcbiAgfSlcclxuXHJcbn0oalF1ZXJ5KTtcclxuIiwiLyohXHJcbiAqIEphc255IEJvb3RzdHJhcCB2My4xLjMgKGh0dHA6Ly9qYXNueS5naXRodWIuaW8vYm9vdHN0cmFwKVxyXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDE0IEFybm9sZCBEYW5pZWxzXHJcbiAqIExpY2Vuc2VkIHVuZGVyIEFwYWNoZS0yLjAgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNueS9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcclxuICovXHJcblxyXG5pZiAodHlwZW9mIGpRdWVyeSA9PT0gJ3VuZGVmaW5lZCcpIHsgdGhyb3cgbmV3IEVycm9yKCdKYXNueSBCb290c3RyYXBcXCdzIEphdmFTY3JpcHQgcmVxdWlyZXMgalF1ZXJ5JykgfVxyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogdHJhbnNpdGlvbi5qcyB2My4xLjNcclxuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdHJhbnNpdGlvbnNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDExLTIwMTQgVHdpdHRlciwgSW5jLlxyXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcblxyXG4rZnVuY3Rpb24gKCQpIHtcclxuICAndXNlIHN0cmljdCc7XHJcblxyXG4gIC8vIENTUyBUUkFOU0lUSU9OIFNVUFBPUlQgKFNob3V0b3V0OiBodHRwOi8vd3d3Lm1vZGVybml6ci5jb20vKVxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBmdW5jdGlvbiB0cmFuc2l0aW9uRW5kKCkge1xyXG4gICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYm9vdHN0cmFwJylcclxuXHJcbiAgICB2YXIgdHJhbnNFbmRFdmVudE5hbWVzID0ge1xyXG4gICAgICBXZWJraXRUcmFuc2l0aW9uIDogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxyXG4gICAgICBNb3pUcmFuc2l0aW9uICAgIDogJ3RyYW5zaXRpb25lbmQnLFxyXG4gICAgICBPVHJhbnNpdGlvbiAgICAgIDogJ29UcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kJyxcclxuICAgICAgdHJhbnNpdGlvbiAgICAgICA6ICd0cmFuc2l0aW9uZW5kJ1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIG5hbWUgaW4gdHJhbnNFbmRFdmVudE5hbWVzKSB7XHJcbiAgICAgIGlmIChlbC5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgZW5kOiB0cmFuc0VuZEV2ZW50TmFtZXNbbmFtZV0gfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlIC8vIGV4cGxpY2l0IGZvciBpZTggKCAgLl8uKVxyXG4gIH1cclxuXHJcbiAgaWYgKCQuc3VwcG9ydC50cmFuc2l0aW9uICE9PSB1bmRlZmluZWQpIHJldHVybiAgLy8gUHJldmVudCBjb25mbGljdCB3aXRoIFR3aXR0ZXIgQm9vdHN0cmFwXHJcblxyXG4gIC8vIGh0dHA6Ly9ibG9nLmFsZXhtYWNjYXcuY29tL2Nzcy10cmFuc2l0aW9uc1xyXG4gICQuZm4uZW11bGF0ZVRyYW5zaXRpb25FbmQgPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcclxuICAgIHZhciBjYWxsZWQgPSBmYWxzZSwgJGVsID0gdGhpc1xyXG4gICAgJCh0aGlzKS5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBmdW5jdGlvbiAoKSB7IGNhbGxlZCA9IHRydWUgfSlcclxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgaWYgKCFjYWxsZWQpICQoJGVsKS50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkgfVxyXG4gICAgc2V0VGltZW91dChjYWxsYmFjaywgZHVyYXRpb24pXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgJChmdW5jdGlvbiAoKSB7XHJcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25FbmQoKVxyXG4gIH0pXHJcblxyXG59KHdpbmRvdy5qUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogb2ZmY2FudmFzLmpzIHYzLjEuM1xyXG4gKiBodHRwOi8vamFzbnkuZ2l0aHViLmlvL2Jvb3RzdHJhcC9qYXZhc2NyaXB0LyNvZmZjYW52YXNcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQgQXJub2xkIERhbmllbHNcclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKVxyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcbitmdW5jdGlvbiAoJCkgeyBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgLy8gT0ZGQ0FOVkFTIFBVQkxJQyBDTEFTUyBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBPZmZDYW52YXMgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgdGhpcy5zdGF0ZSAgICA9IG51bGxcclxuICAgIHRoaXMucGxhY2VtZW50ID0gbnVsbFxyXG4gICAgXHJcbiAgICBpZiAodGhpcy5vcHRpb25zLnJlY2FsYykge1xyXG4gICAgICB0aGlzLmNhbGNDbG9uZSgpXHJcbiAgICAgICQod2luZG93KS5vbigncmVzaXplJywgJC5wcm94eSh0aGlzLnJlY2FsYywgdGhpcykpXHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlmICh0aGlzLm9wdGlvbnMuYXV0b2hpZGUpXHJcbiAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICQucHJveHkodGhpcy5hdXRvaGlkZSwgdGhpcykpXHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy50b2dnbGUpIHRoaXMudG9nZ2xlKClcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kaXNhYmxlc2Nyb2xsaW5nKSB7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zLmRpc2FibGVTY3JvbGxpbmcgPSB0aGlzLm9wdGlvbnMuZGlzYWJsZXNjcm9sbGluZ1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnMuZGlzYWJsZXNjcm9sbGluZ1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgT2ZmQ2FudmFzLkRFRkFVTFRTID0ge1xyXG4gICAgdG9nZ2xlOiB0cnVlLFxyXG4gICAgcGxhY2VtZW50OiAnYXV0bycsXHJcbiAgICBhdXRvaGlkZTogdHJ1ZSxcclxuICAgIHJlY2FsYzogdHJ1ZSxcclxuICAgIGRpc2FibGVTY3JvbGxpbmc6IHRydWVcclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgc3dpdGNoICh0aGlzLnBsYWNlbWVudCkge1xyXG4gICAgICBjYXNlICdsZWZ0JzpcclxuICAgICAgY2FzZSAncmlnaHQnOiAgcmV0dXJuIHRoaXMuJGVsZW1lbnQub3V0ZXJXaWR0aCgpXHJcbiAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgIGNhc2UgJ2JvdHRvbSc6IHJldHVybiB0aGlzLiRlbGVtZW50Lm91dGVySGVpZ2h0KClcclxuICAgIH1cclxuICB9XHJcbiAgXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5jYWxjUGxhY2VtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wbGFjZW1lbnQgIT09ICdhdXRvJykge1xyXG4gICAgICAgIHRoaXMucGxhY2VtZW50ID0gdGhpcy5vcHRpb25zLnBsYWNlbWVudFxyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAoIXRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2luJykpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5jc3MoJ3Zpc2libGl0eScsICdoaWRkZW4gIWltcG9ydGFudCcpLmFkZENsYXNzKCdpbicpXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICB2YXIgaG9yaXpvbnRhbCA9ICQod2luZG93KS53aWR0aCgpIC8gdGhpcy4kZWxlbWVudC53aWR0aCgpXHJcbiAgICB2YXIgdmVydGljYWwgPSAkKHdpbmRvdykuaGVpZ2h0KCkgLyB0aGlzLiRlbGVtZW50LmhlaWdodCgpXHJcbiAgICAgICAgXHJcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRcclxuICAgIGZ1bmN0aW9uIGFiKGEsIGIpIHtcclxuICAgICAgaWYgKGVsZW1lbnQuY3NzKGIpID09PSAnYXV0bycpIHJldHVybiBhXHJcbiAgICAgIGlmIChlbGVtZW50LmNzcyhhKSA9PT0gJ2F1dG8nKSByZXR1cm4gYlxyXG4gICAgICBcclxuICAgICAgdmFyIHNpemVfYSA9IHBhcnNlSW50KGVsZW1lbnQuY3NzKGEpLCAxMClcclxuICAgICAgdmFyIHNpemVfYiA9IHBhcnNlSW50KGVsZW1lbnQuY3NzKGIpLCAxMClcclxuICBcclxuICAgICAgcmV0dXJuIHNpemVfYSA+IHNpemVfYiA/IGIgOiBhXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMucGxhY2VtZW50ID0gaG9yaXpvbnRhbCA+PSB2ZXJ0aWNhbCA/IGFiKCdsZWZ0JywgJ3JpZ2h0JykgOiBhYigndG9wJywgJ2JvdHRvbScpXHJcbiAgICAgIFxyXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuY3NzKCd2aXNpYmlsaXR5JykgPT09ICdoaWRkZW4gIWltcG9ydGFudCcpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaW4nKS5jc3MoJ3Zpc2libGl0eScsICcnKVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBPZmZDYW52YXMucHJvdG90eXBlLm9wcG9zaXRlID0gZnVuY3Rpb24gKHBsYWNlbWVudCkge1xyXG4gICAgc3dpdGNoIChwbGFjZW1lbnQpIHtcclxuICAgICAgY2FzZSAndG9wJzogICAgcmV0dXJuICdib3R0b20nXHJcbiAgICAgIGNhc2UgJ2xlZnQnOiAgIHJldHVybiAncmlnaHQnXHJcbiAgICAgIGNhc2UgJ2JvdHRvbSc6IHJldHVybiAndG9wJ1xyXG4gICAgICBjYXNlICdyaWdodCc6ICByZXR1cm4gJ2xlZnQnXHJcbiAgICB9XHJcbiAgfVxyXG4gIFxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuZ2V0Q2FudmFzRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIFJldHVybiBhIHNldCBjb250YWluaW5nIHRoZSBjYW52YXMgcGx1cyBhbGwgZml4ZWQgZWxlbWVudHNcclxuICAgIHZhciBjYW52YXMgPSB0aGlzLm9wdGlvbnMuY2FudmFzID8gJCh0aGlzLm9wdGlvbnMuY2FudmFzKSA6IHRoaXMuJGVsZW1lbnRcclxuICAgIFxyXG4gICAgdmFyIGZpeGVkX2VsZW1lbnRzID0gY2FudmFzLmZpbmQoJyonKS5maWx0ZXIoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHJldHVybiAkKHRoaXMpLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJ1xyXG4gICAgfSkubm90KHRoaXMub3B0aW9ucy5leGNsdWRlKVxyXG4gICAgXHJcbiAgICByZXR1cm4gY2FudmFzLmFkZChmaXhlZF9lbGVtZW50cylcclxuICB9XHJcbiAgXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5zbGlkZSA9IGZ1bmN0aW9uIChlbGVtZW50cywgb2Zmc2V0LCBjYWxsYmFjaykge1xyXG4gICAgLy8gVXNlIGpRdWVyeSBhbmltYXRpb24gaWYgQ1NTIHRyYW5zaXRpb25zIGFyZW4ndCBzdXBwb3J0ZWRcclxuICAgIGlmICghJC5zdXBwb3J0LnRyYW5zaXRpb24pIHtcclxuICAgICAgdmFyIGFuaW0gPSB7fVxyXG4gICAgICBhbmltW3RoaXMucGxhY2VtZW50XSA9IFwiKz1cIiArIG9mZnNldFxyXG4gICAgICByZXR1cm4gZWxlbWVudHMuYW5pbWF0ZShhbmltLCAzNTAsIGNhbGxiYWNrKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBwbGFjZW1lbnQgPSB0aGlzLnBsYWNlbWVudFxyXG4gICAgdmFyIG9wcG9zaXRlID0gdGhpcy5vcHBvc2l0ZShwbGFjZW1lbnQpXHJcbiAgICBcclxuICAgIGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkKHRoaXMpLmNzcyhwbGFjZW1lbnQpICE9PSAnYXV0bycpXHJcbiAgICAgICAgJCh0aGlzKS5jc3MocGxhY2VtZW50LCAocGFyc2VJbnQoJCh0aGlzKS5jc3MocGxhY2VtZW50KSwgMTApIHx8IDApICsgb2Zmc2V0KVxyXG4gICAgICBcclxuICAgICAgaWYgKCQodGhpcykuY3NzKG9wcG9zaXRlKSAhPT0gJ2F1dG8nKVxyXG4gICAgICAgICQodGhpcykuY3NzKG9wcG9zaXRlLCAocGFyc2VJbnQoJCh0aGlzKS5jc3Mob3Bwb3NpdGUpLCAxMCkgfHwgMCkgLSBvZmZzZXQpXHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5vbmUoJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBjYWxsYmFjaylcclxuICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKDM1MClcclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuZGlzYWJsZVNjcm9sbGluZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGJvZHlXaWR0aCA9ICQoJ2JvZHknKS53aWR0aCgpXHJcbiAgICB2YXIgcHJvcCA9ICdwYWRkaW5nLScgKyB0aGlzLm9wcG9zaXRlKHRoaXMucGxhY2VtZW50KVxyXG5cclxuICAgIGlmICgkKCdib2R5JykuZGF0YSgnb2ZmY2FudmFzLXN0eWxlJykgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAkKCdib2R5JykuZGF0YSgnb2ZmY2FudmFzLXN0eWxlJywgJCgnYm9keScpLmF0dHIoJ3N0eWxlJykgfHwgJycpXHJcbiAgICB9XHJcbiAgICAgIFxyXG4gICAgJCgnYm9keScpLmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJylcclxuXHJcbiAgICBpZiAoJCgnYm9keScpLndpZHRoKCkgPiBib2R5V2lkdGgpIHtcclxuICAgICAgdmFyIHBhZGRpbmcgPSBwYXJzZUludCgkKCdib2R5JykuY3NzKHByb3ApLCAxMCkgKyAkKCdib2R5Jykud2lkdGgoKSAtIGJvZHlXaWR0aFxyXG4gICAgICBcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAkKCdib2R5JykuY3NzKHByb3AsIHBhZGRpbmcpXHJcbiAgICAgIH0sIDEpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5zdGF0ZSkgcmV0dXJuXHJcbiAgICBcclxuICAgIHZhciBzdGFydEV2ZW50ID0gJC5FdmVudCgnc2hvdy5icy5vZmZjYW52YXMnKVxyXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKHN0YXJ0RXZlbnQpXHJcbiAgICBpZiAoc3RhcnRFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXHJcblxyXG4gICAgdGhpcy5zdGF0ZSA9ICdzbGlkZS1pbidcclxuICAgIHRoaXMuY2FsY1BsYWNlbWVudCgpO1xyXG4gICAgXHJcbiAgICB2YXIgZWxlbWVudHMgPSB0aGlzLmdldENhbnZhc0VsZW1lbnRzKClcclxuICAgIHZhciBwbGFjZW1lbnQgPSB0aGlzLnBsYWNlbWVudFxyXG4gICAgdmFyIG9wcG9zaXRlID0gdGhpcy5vcHBvc2l0ZShwbGFjZW1lbnQpXHJcbiAgICB2YXIgb2Zmc2V0ID0gdGhpcy5vZmZzZXQoKVxyXG5cclxuICAgIGlmIChlbGVtZW50cy5pbmRleCh0aGlzLiRlbGVtZW50KSAhPT0gLTEpIHtcclxuICAgICAgJCh0aGlzLiRlbGVtZW50KS5kYXRhKCdvZmZjYW52YXMtc3R5bGUnLCAkKHRoaXMuJGVsZW1lbnQpLmF0dHIoJ3N0eWxlJykgfHwgJycpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHBsYWNlbWVudCwgLTEgKiBvZmZzZXQpXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHBsYWNlbWVudCk7IC8vIFdvcmthcm91bmQ6IE5lZWQgdG8gZ2V0IHRoZSBDU1MgcHJvcGVydHkgZm9yIGl0IHRvIGJlIGFwcGxpZWQgYmVmb3JlIHRoZSBuZXh0IGxpbmUgb2YgY29kZVxyXG4gICAgfVxyXG5cclxuICAgIGVsZW1lbnRzLmFkZENsYXNzKCdjYW52YXMtc2xpZGluZycpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkKHRoaXMpLmRhdGEoJ29mZmNhbnZhcy1zdHlsZScpID09PSB1bmRlZmluZWQpICQodGhpcykuZGF0YSgnb2ZmY2FudmFzLXN0eWxlJywgJCh0aGlzKS5hdHRyKCdzdHlsZScpIHx8ICcnKVxyXG4gICAgICBpZiAoJCh0aGlzKS5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSAkKHRoaXMpLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKVxyXG4gICAgICBpZiAoKCQodGhpcykuY3NzKHBsYWNlbWVudCkgPT09ICdhdXRvJyB8fCAkKHRoaXMpLmNzcyhwbGFjZW1lbnQpID09PSAnMHB4JykgJiZcclxuICAgICAgICAgICgkKHRoaXMpLmNzcyhvcHBvc2l0ZSkgPT09ICdhdXRvJyB8fCAkKHRoaXMpLmNzcyhvcHBvc2l0ZSkgPT09ICcwcHgnKSkge1xyXG4gICAgICAgICQodGhpcykuY3NzKHBsYWNlbWVudCwgMClcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgaWYgKHRoaXMub3B0aW9ucy5kaXNhYmxlU2Nyb2xsaW5nKSB0aGlzLmRpc2FibGVTY3JvbGxpbmcoKVxyXG4gICAgXHJcbiAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGlmICh0aGlzLnN0YXRlICE9ICdzbGlkZS1pbicpIHJldHVyblxyXG4gICAgICBcclxuICAgICAgdGhpcy5zdGF0ZSA9ICdzbGlkJ1xyXG5cclxuICAgICAgZWxlbWVudHMucmVtb3ZlQ2xhc3MoJ2NhbnZhcy1zbGlkaW5nJykuYWRkQ2xhc3MoJ2NhbnZhcy1zbGlkJylcclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93bi5icy5vZmZjYW52YXMnKVxyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoJC5wcm94eShmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnaW4nKVxyXG4gICAgICB0aGlzLnNsaWRlKGVsZW1lbnRzLCBvZmZzZXQsICQucHJveHkoY29tcGxldGUsIHRoaXMpKVxyXG4gICAgfSwgdGhpcyksIDEpXHJcbiAgfVxyXG5cclxuICBPZmZDYW52YXMucHJvdG90eXBlLmhpZGUgPSBmdW5jdGlvbiAoZmFzdCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUgIT09ICdzbGlkJykgcmV0dXJuXHJcblxyXG4gICAgdmFyIHN0YXJ0RXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLm9mZmNhbnZhcycpXHJcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoc3RhcnRFdmVudClcclxuICAgIGlmIChzdGFydEV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cclxuXHJcbiAgICB0aGlzLnN0YXRlID0gJ3NsaWRlLW91dCdcclxuXHJcbiAgICB2YXIgZWxlbWVudHMgPSAkKCcuY2FudmFzLXNsaWQnKVxyXG4gICAgdmFyIHBsYWNlbWVudCA9IHRoaXMucGxhY2VtZW50XHJcbiAgICB2YXIgb2Zmc2V0ID0gLTEgKiB0aGlzLm9mZnNldCgpXHJcblxyXG4gICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICBpZiAodGhpcy5zdGF0ZSAhPSAnc2xpZGUtb3V0JykgcmV0dXJuXHJcbiAgICAgIFxyXG4gICAgICB0aGlzLnN0YXRlID0gbnVsbFxyXG4gICAgICB0aGlzLnBsYWNlbWVudCA9IG51bGxcclxuICAgICAgXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2luJylcclxuICAgICAgXHJcbiAgICAgIGVsZW1lbnRzLnJlbW92ZUNsYXNzKCdjYW52YXMtc2xpZGluZycpXHJcbiAgICAgIGVsZW1lbnRzLmFkZCh0aGlzLiRlbGVtZW50KS5hZGQoJ2JvZHknKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAkKHRoaXMpLmRhdGEoJ29mZmNhbnZhcy1zdHlsZScpKS5yZW1vdmVEYXRhKCdvZmZjYW52YXMtc3R5bGUnKVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRkZW4uYnMub2ZmY2FudmFzJylcclxuICAgIH1cclxuXHJcbiAgICBlbGVtZW50cy5yZW1vdmVDbGFzcygnY2FudmFzLXNsaWQnKS5hZGRDbGFzcygnY2FudmFzLXNsaWRpbmcnKVxyXG4gICAgXHJcbiAgICBzZXRUaW1lb3V0KCQucHJveHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuc2xpZGUoZWxlbWVudHMsIG9mZnNldCwgJC5wcm94eShjb21wbGV0ZSwgdGhpcykpXHJcbiAgICB9LCB0aGlzKSwgMSlcclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUudG9nZ2xlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuc3RhdGUgPT09ICdzbGlkZS1pbicgfHwgdGhpcy5zdGF0ZSA9PT0gJ3NsaWRlLW91dCcpIHJldHVyblxyXG4gICAgdGhpc1t0aGlzLnN0YXRlID09PSAnc2xpZCcgPyAnaGlkZScgOiAnc2hvdyddKClcclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUuY2FsY0Nsb25lID0gZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLiRjYWxjQ2xvbmUgPSB0aGlzLiRlbGVtZW50LmNsb25lKClcclxuICAgICAgLmh0bWwoJycpXHJcbiAgICAgIC5hZGRDbGFzcygnb2ZmY2FudmFzLWNsb25lJykucmVtb3ZlQ2xhc3MoJ2luJylcclxuICAgICAgLmFwcGVuZFRvKCQoJ2JvZHknKSlcclxuICB9XHJcblxyXG4gIE9mZkNhbnZhcy5wcm90b3R5cGUucmVjYWxjID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuJGNhbGNDbG9uZS5jc3MoJ2Rpc3BsYXknKSA9PT0gJ25vbmUnIHx8ICh0aGlzLnN0YXRlICE9PSAnc2xpZCcgJiYgdGhpcy5zdGF0ZSAhPT0gJ3NsaWRlLWluJykpIHJldHVyblxyXG4gICAgXHJcbiAgICB0aGlzLnN0YXRlID0gbnVsbFxyXG4gICAgdGhpcy5wbGFjZW1lbnQgPSBudWxsXHJcbiAgICB2YXIgZWxlbWVudHMgPSB0aGlzLmdldENhbnZhc0VsZW1lbnRzKClcclxuICAgIFxyXG4gICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcygnaW4nKVxyXG4gICAgXHJcbiAgICBlbGVtZW50cy5yZW1vdmVDbGFzcygnY2FudmFzLXNsaWQnKVxyXG4gICAgZWxlbWVudHMuYWRkKHRoaXMuJGVsZW1lbnQpLmFkZCgnYm9keScpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAkKHRoaXMpLmRhdGEoJ29mZmNhbnZhcy1zdHlsZScpKS5yZW1vdmVEYXRhKCdvZmZjYW52YXMtc3R5bGUnKVxyXG4gICAgfSlcclxuICB9XHJcbiAgXHJcbiAgT2ZmQ2FudmFzLnByb3RvdHlwZS5hdXRvaGlkZSA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoJChlLnRhcmdldCkuY2xvc2VzdCh0aGlzLiRlbGVtZW50KS5sZW5ndGggPT09IDApIHRoaXMuaGlkZSgpXHJcbiAgfVxyXG5cclxuICAvLyBPRkZDQU5WQVMgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgb2xkID0gJC5mbi5vZmZjYW52YXNcclxuXHJcbiAgJC5mbi5vZmZjYW52YXMgPSBmdW5jdGlvbiAob3B0aW9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhICAgID0gJHRoaXMuZGF0YSgnYnMub2ZmY2FudmFzJylcclxuICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgT2ZmQ2FudmFzLkRFRkFVTFRTLCAkdGhpcy5kYXRhKCksIHR5cGVvZiBvcHRpb24gPT09ICdvYmplY3QnICYmIG9wdGlvbilcclxuXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMub2ZmY2FudmFzJywgKGRhdGEgPSBuZXcgT2ZmQ2FudmFzKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQuZm4ub2ZmY2FudmFzLkNvbnN0cnVjdG9yID0gT2ZmQ2FudmFzXHJcblxyXG5cclxuICAvLyBPRkZDQU5WQVMgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLm9mZmNhbnZhcy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5vZmZjYW52YXMgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gT0ZGQ0FOVkFTIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrLmJzLm9mZmNhbnZhcy5kYXRhLWFwaScsICdbZGF0YS10b2dnbGU9b2ZmY2FudmFzXScsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRoaXMgICA9ICQodGhpcyksIGhyZWZcclxuICAgIHZhciB0YXJnZXQgID0gJHRoaXMuYXR0cignZGF0YS10YXJnZXQnKVxyXG4gICAgICAgIHx8IGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIHx8IChocmVmID0gJHRoaXMuYXR0cignaHJlZicpKSAmJiBocmVmLnJlcGxhY2UoLy4qKD89I1teXFxzXSskKS8sICcnKSAvL3N0cmlwIGZvciBpZTdcclxuICAgIHZhciAkY2FudmFzID0gJCh0YXJnZXQpXHJcbiAgICB2YXIgZGF0YSAgICA9ICRjYW52YXMuZGF0YSgnYnMub2ZmY2FudmFzJylcclxuICAgIHZhciBvcHRpb24gID0gZGF0YSA/ICd0b2dnbGUnIDogJHRoaXMuZGF0YSgpXHJcblxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cclxuICAgIGlmIChkYXRhKSBkYXRhLnRvZ2dsZSgpXHJcbiAgICAgIGVsc2UgJGNhbnZhcy5vZmZjYW52YXMob3B0aW9uKVxyXG4gIH0pXHJcblxyXG59KHdpbmRvdy5qUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogcm93bGluay5qcyB2My4xLjNcclxuICogaHR0cDovL2phc255LmdpdGh1Yi5pby9ib290c3RyYXAvamF2YXNjcmlwdC8jcm93bGlua1xyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTItMjAxNCBBcm5vbGQgRGFuaWVsc1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcbitmdW5jdGlvbiAoJCkgeyBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgdmFyIFJvd2xpbmsgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xyXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZWxlbWVudClcclxuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSb3dsaW5rLkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgXHJcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay5icy5yb3dsaW5rJywgJ3RkOm5vdCgucm93bGluay1za2lwKScsICQucHJveHkodGhpcy5jbGljaywgdGhpcykpXHJcbiAgfVxyXG5cclxuICBSb3dsaW5rLkRFRkFVTFRTID0ge1xyXG4gICAgdGFyZ2V0OiBcImFcIlxyXG4gIH1cclxuXHJcbiAgUm93bGluay5wcm90b3R5cGUuY2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgICB2YXIgdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJykuZmluZCh0aGlzLm9wdGlvbnMudGFyZ2V0KVswXVxyXG4gICAgaWYgKCQoZS50YXJnZXQpWzBdID09PSB0YXJnZXQpIHJldHVyblxyXG4gICAgXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBcclxuICAgIGlmICh0YXJnZXQuY2xpY2spIHtcclxuICAgICAgdGFyZ2V0LmNsaWNrKClcclxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcclxuICAgICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiTW91c2VFdmVudHNcIik7IFxyXG4gICAgICBldnQuaW5pdE1vdXNlRXZlbnQoXCJjbGlja1wiLCB0cnVlLCB0cnVlLCB3aW5kb3csIDAsIDAsIDAsIDAsIDAsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLCBudWxsKTsgXHJcbiAgICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2dCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBcclxuICAvLyBST1dMSU5LIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLnJvd2xpbmtcclxuXHJcbiAgJC5mbi5yb3dsaW5rID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhID0gJHRoaXMuZGF0YSgnYnMucm93bGluaycpXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMucm93bGluaycsIChkYXRhID0gbmV3IFJvd2xpbmsodGhpcywgb3B0aW9ucykpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQuZm4ucm93bGluay5Db25zdHJ1Y3RvciA9IFJvd2xpbmtcclxuXHJcblxyXG4gIC8vIFJPV0xJTksgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLnJvd2xpbmsubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4ucm93bGluayA9IG9sZFxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG5cclxuICAvLyBST1dMSU5LIERBVEEtQVBJXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09XHJcblxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljay5icy5yb3dsaW5rLmRhdGEtYXBpJywgJ1tkYXRhLWxpbms9XCJyb3dcIl0nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKCQoZS50YXJnZXQpLmNsb3Nlc3QoJy5yb3dsaW5rLXNraXAnKS5sZW5ndGggIT09IDApIHJldHVyblxyXG4gICAgXHJcbiAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICBpZiAoJHRoaXMuZGF0YSgnYnMucm93bGluaycpKSByZXR1cm5cclxuICAgICR0aGlzLnJvd2xpbmsoJHRoaXMuZGF0YSgpKVxyXG4gICAgJChlLnRhcmdldCkudHJpZ2dlcignY2xpY2suYnMucm93bGluaycpXHJcbiAgfSlcclxuICBcclxufSh3aW5kb3cualF1ZXJ5KTtcclxuXHJcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIEJvb3RzdHJhcDogaW5wdXRtYXNrLmpzIHYzLjEuMFxyXG4gKiBodHRwOi8vamFzbnkuZ2l0aHViLmlvL2Jvb3RzdHJhcC9qYXZhc2NyaXB0LyNpbnB1dG1hc2tcclxuICogXHJcbiAqIEJhc2VkIG9uIE1hc2tlZCBJbnB1dCBwbHVnaW4gYnkgSm9zaCBCdXNoIChkaWdpdGFsYnVzaC5jb20pXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIENvcHlyaWdodCAyMDEyLTIwMTQgQXJub2xkIERhbmllbHNcclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKVxyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXHJcblxyXG4rZnVuY3Rpb24gKCQpIHsgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gIHZhciBpc0lwaG9uZSA9ICh3aW5kb3cub3JpZW50YXRpb24gIT09IHVuZGVmaW5lZClcclxuICB2YXIgaXNBbmRyb2lkID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJhbmRyb2lkXCIpID4gLTFcclxuICB2YXIgaXNJRSA9IHdpbmRvdy5uYXZpZ2F0b3IuYXBwTmFtZSA9PSAnTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyJ1xyXG5cclxuICAvLyBJTlBVVE1BU0sgUFVCTElDIENMQVNTIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIElucHV0bWFzayA9IGZ1bmN0aW9uIChlbGVtZW50LCBvcHRpb25zKSB7XHJcbiAgICBpZiAoaXNBbmRyb2lkKSByZXR1cm4gLy8gTm8gc3VwcG9ydCBiZWNhdXNlIGNhcmV0IHBvc2l0aW9uaW5nIGRvZXNuJ3Qgd29yayBvbiBBbmRyb2lkXHJcbiAgICBcclxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXHJcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgSW5wdXRtYXNrLkRFRkFVTFRTLCBvcHRpb25zKVxyXG4gICAgdGhpcy5tYXNrID0gU3RyaW5nKHRoaXMub3B0aW9ucy5tYXNrKVxyXG4gICAgXHJcbiAgICB0aGlzLmluaXQoKVxyXG4gICAgdGhpcy5saXN0ZW4oKVxyXG4gICAgICAgIFxyXG4gICAgdGhpcy5jaGVja1ZhbCgpIC8vUGVyZm9ybSBpbml0aWFsIGNoZWNrIGZvciBleGlzdGluZyB2YWx1ZXNcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5ERUZBVUxUUyA9IHtcclxuICAgIG1hc2s6IFwiXCIsXHJcbiAgICBwbGFjZWhvbGRlcjogXCJfXCIsXHJcbiAgICBkZWZpbml0aW9uczoge1xyXG4gICAgICAnOSc6IFwiWzAtOV1cIixcclxuICAgICAgJ2EnOiBcIltBLVphLXpdXCIsXHJcbiAgICAgICd3JzogXCJbQS1aYS16MC05XVwiLFxyXG4gICAgICAnKic6IFwiLlwiXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBkZWZzID0gdGhpcy5vcHRpb25zLmRlZmluaXRpb25zXHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aFxyXG5cclxuICAgIHRoaXMudGVzdHMgPSBbXSBcclxuICAgIHRoaXMucGFydGlhbFBvc2l0aW9uID0gdGhpcy5tYXNrLmxlbmd0aFxyXG4gICAgdGhpcy5maXJzdE5vbk1hc2tQb3MgPSBudWxsXHJcblxyXG4gICAgJC5lYWNoKHRoaXMubWFzay5zcGxpdChcIlwiKSwgJC5wcm94eShmdW5jdGlvbihpLCBjKSB7XHJcbiAgICAgIGlmIChjID09ICc/Jykge1xyXG4gICAgICAgIGxlbi0tXHJcbiAgICAgICAgdGhpcy5wYXJ0aWFsUG9zaXRpb24gPSBpXHJcbiAgICAgIH0gZWxzZSBpZiAoZGVmc1tjXSkge1xyXG4gICAgICAgIHRoaXMudGVzdHMucHVzaChuZXcgUmVnRXhwKGRlZnNbY10pKVxyXG4gICAgICAgIGlmICh0aGlzLmZpcnN0Tm9uTWFza1BvcyA9PT0gbnVsbClcclxuICAgICAgICAgIHRoaXMuZmlyc3ROb25NYXNrUG9zID0gIHRoaXMudGVzdHMubGVuZ3RoIC0gMVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudGVzdHMucHVzaChudWxsKVxyXG4gICAgICB9XHJcbiAgICB9LCB0aGlzKSlcclxuXHJcbiAgICB0aGlzLmJ1ZmZlciA9ICQubWFwKHRoaXMubWFzay5zcGxpdChcIlwiKSwgJC5wcm94eShmdW5jdGlvbihjLCBpKSB7XHJcbiAgICAgIGlmIChjICE9ICc/JykgcmV0dXJuIGRlZnNbY10gPyB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIgOiBjXHJcbiAgICB9LCB0aGlzKSlcclxuXHJcbiAgICB0aGlzLmZvY3VzVGV4dCA9IHRoaXMuJGVsZW1lbnQudmFsKClcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50LmRhdGEoXCJyYXdNYXNrRm5cIiwgJC5wcm94eShmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuICQubWFwKHRoaXMuYnVmZmVyLCBmdW5jdGlvbihjLCBpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdHNbaV0gJiYgYyAhPSB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXIgPyBjIDogbnVsbFxyXG4gICAgICB9KS5qb2luKCcnKVxyXG4gICAgfSwgdGhpcykpXHJcbiAgfVxyXG4gICAgXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICh0aGlzLiRlbGVtZW50LmF0dHIoXCJyZWFkb25seVwiKSkgcmV0dXJuXHJcblxyXG4gICAgdmFyIHBhc3RlRXZlbnROYW1lID0gKGlzSUUgPyAncGFzdGUnIDogJ2lucHV0JykgKyBcIi5tYXNrXCJcclxuXHJcbiAgICB0aGlzLiRlbGVtZW50XHJcbiAgICAgIC5vbihcInVubWFzay5icy5pbnB1dG1hc2tcIiwgJC5wcm94eSh0aGlzLnVubWFzaywgdGhpcykpXHJcblxyXG4gICAgICAub24oXCJmb2N1cy5icy5pbnB1dG1hc2tcIiwgJC5wcm94eSh0aGlzLmZvY3VzRXZlbnQsIHRoaXMpKVxyXG4gICAgICAub24oXCJibHVyLmJzLmlucHV0bWFza1wiLCAkLnByb3h5KHRoaXMuYmx1ckV2ZW50LCB0aGlzKSlcclxuXHJcbiAgICAgIC5vbihcImtleWRvd24uYnMuaW5wdXRtYXNrXCIsICQucHJveHkodGhpcy5rZXlkb3duRXZlbnQsIHRoaXMpKVxyXG4gICAgICAub24oXCJrZXlwcmVzcy5icy5pbnB1dG1hc2tcIiwgJC5wcm94eSh0aGlzLmtleXByZXNzRXZlbnQsIHRoaXMpKVxyXG5cclxuICAgICAgLm9uKHBhc3RlRXZlbnROYW1lLCAkLnByb3h5KHRoaXMucGFzdGVFdmVudCwgdGhpcykpXHJcbiAgfVxyXG5cclxuICAvL0hlbHBlciBGdW5jdGlvbiBmb3IgQ2FyZXQgcG9zaXRpb25pbmdcclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmNhcmV0ID0gZnVuY3Rpb24oYmVnaW4sIGVuZCkge1xyXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQubGVuZ3RoID09PSAwKSByZXR1cm5cclxuICAgIGlmICh0eXBlb2YgYmVnaW4gPT0gJ251bWJlcicpIHtcclxuICAgICAgZW5kID0gKHR5cGVvZiBlbmQgPT0gJ251bWJlcicpID8gZW5kIDogYmVnaW5cclxuICAgICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgICAgICAgdGhpcy5zZXRTZWxlY3Rpb25SYW5nZShiZWdpbiwgZW5kKVxyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jcmVhdGVUZXh0UmFuZ2UpIHtcclxuICAgICAgICAgIHZhciByYW5nZSA9IHRoaXMuY3JlYXRlVGV4dFJhbmdlKClcclxuICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpXHJcbiAgICAgICAgICByYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBlbmQpXHJcbiAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIGJlZ2luKVxyXG4gICAgICAgICAgcmFuZ2Uuc2VsZWN0KClcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy4kZWxlbWVudFswXS5zZXRTZWxlY3Rpb25SYW5nZSkge1xyXG4gICAgICAgIGJlZ2luID0gdGhpcy4kZWxlbWVudFswXS5zZWxlY3Rpb25TdGFydFxyXG4gICAgICAgIGVuZCA9IHRoaXMuJGVsZW1lbnRbMF0uc2VsZWN0aW9uRW5kXHJcbiAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uICYmIGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSkge1xyXG4gICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpXHJcbiAgICAgICAgYmVnaW4gPSAwIC0gcmFuZ2UuZHVwbGljYXRlKCkubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtMTAwMDAwKVxyXG4gICAgICAgIGVuZCA9IGJlZ2luICsgcmFuZ2UudGV4dC5sZW5ndGhcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGJlZ2luOiBiZWdpbiwgXHJcbiAgICAgICAgZW5kOiBlbmRcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBcclxuICBJbnB1dG1hc2sucHJvdG90eXBlLnNlZWtOZXh0ID0gZnVuY3Rpb24ocG9zKSB7XHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aFxyXG4gICAgd2hpbGUgKCsrcG9zIDw9IGxlbiAmJiAhdGhpcy50ZXN0c1twb3NdKTtcclxuXHJcbiAgICByZXR1cm4gcG9zXHJcbiAgfVxyXG4gIFxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuc2Vla1ByZXYgPSBmdW5jdGlvbihwb3MpIHtcclxuICAgIHdoaWxlICgtLXBvcyA+PSAwICYmICF0aGlzLnRlc3RzW3Bvc10pO1xyXG5cclxuICAgIHJldHVybiBwb3NcclxuICB9XHJcblxyXG4gIElucHV0bWFzay5wcm90b3R5cGUuc2hpZnRMID0gZnVuY3Rpb24oYmVnaW4sZW5kKSB7XHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aFxyXG5cclxuICAgIGlmIChiZWdpbiA8IDApIHJldHVyblxyXG5cclxuICAgIGZvciAodmFyIGkgPSBiZWdpbiwgaiA9IHRoaXMuc2Vla05leHQoZW5kKTsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGlmICh0aGlzLnRlc3RzW2ldKSB7XHJcbiAgICAgICAgaWYgKGogPCBsZW4gJiYgdGhpcy50ZXN0c1tpXS50ZXN0KHRoaXMuYnVmZmVyW2pdKSkge1xyXG4gICAgICAgICAgdGhpcy5idWZmZXJbaV0gPSB0aGlzLmJ1ZmZlcltqXVxyXG4gICAgICAgICAgdGhpcy5idWZmZXJbal0gPSB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXJcclxuICAgICAgICB9IGVsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgaiA9IHRoaXMuc2Vla05leHQoailcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy53cml0ZUJ1ZmZlcigpXHJcbiAgICB0aGlzLmNhcmV0KE1hdGgubWF4KHRoaXMuZmlyc3ROb25NYXNrUG9zLCBiZWdpbikpXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLnNoaWZ0UiA9IGZ1bmN0aW9uKHBvcykge1xyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGhcclxuXHJcbiAgICBmb3IgKHZhciBpID0gcG9zLCBjID0gdGhpcy5vcHRpb25zLnBsYWNlaG9sZGVyOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMudGVzdHNbaV0pIHtcclxuICAgICAgICB2YXIgaiA9IHRoaXMuc2Vla05leHQoaSlcclxuICAgICAgICB2YXIgdCA9IHRoaXMuYnVmZmVyW2ldXHJcbiAgICAgICAgdGhpcy5idWZmZXJbaV0gPSBjXHJcbiAgICAgICAgaWYgKGogPCBsZW4gJiYgdGhpcy50ZXN0c1tqXS50ZXN0KHQpKVxyXG4gICAgICAgICAgYyA9IHRcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS51bm1hc2sgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuJGVsZW1lbnRcclxuICAgICAgLnVuYmluZChcIi5tYXNrXCIpXHJcbiAgICAgIC5yZW1vdmVEYXRhKFwiaW5wdXRtYXNrXCIpXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmZvY3VzRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuZm9jdXNUZXh0ID0gdGhpcy4kZWxlbWVudC52YWwoKVxyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGggXHJcbiAgICB2YXIgcG9zID0gdGhpcy5jaGVja1ZhbCgpXHJcbiAgICB0aGlzLndyaXRlQnVmZmVyKClcclxuXHJcbiAgICB2YXIgdGhhdCA9IHRoaXNcclxuICAgIHZhciBtb3ZlQ2FyZXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKHBvcyA9PSBsZW4pXHJcbiAgICAgICAgdGhhdC5jYXJldCgwLCBwb3MpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0aGF0LmNhcmV0KHBvcylcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlQ2FyZXQoKVxyXG4gICAgc2V0VGltZW91dChtb3ZlQ2FyZXQsIDUwKVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5ibHVyRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuY2hlY2tWYWwoKVxyXG4gICAgaWYgKHRoaXMuJGVsZW1lbnQudmFsKCkgIT09IHRoaXMuZm9jdXNUZXh0KVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZScpXHJcbiAgfVxyXG5cclxuICBJbnB1dG1hc2sucHJvdG90eXBlLmtleWRvd25FdmVudCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIHZhciBrID0gZS53aGljaFxyXG5cclxuICAgIC8vYmFja3NwYWNlLCBkZWxldGUsIGFuZCBlc2NhcGUgZ2V0IHNwZWNpYWwgdHJlYXRtZW50XHJcbiAgICBpZiAoayA9PSA4IHx8IGsgPT0gNDYgfHwgKGlzSXBob25lICYmIGsgPT0gMTI3KSkge1xyXG4gICAgICB2YXIgcG9zID0gdGhpcy5jYXJldCgpLFxyXG4gICAgICBiZWdpbiA9IHBvcy5iZWdpbixcclxuICAgICAgZW5kID0gcG9zLmVuZFxyXG5cclxuICAgICAgaWYgKGVuZCAtIGJlZ2luID09PSAwKSB7XHJcbiAgICAgICAgYmVnaW4gPSBrICE9IDQ2ID8gdGhpcy5zZWVrUHJldihiZWdpbikgOiAoZW5kID0gdGhpcy5zZWVrTmV4dChiZWdpbiAtIDEpKVxyXG4gICAgICAgIGVuZCA9IGsgPT0gNDYgPyB0aGlzLnNlZWtOZXh0KGVuZCkgOiBlbmRcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmNsZWFyQnVmZmVyKGJlZ2luLCBlbmQpXHJcbiAgICAgIHRoaXMuc2hpZnRMKGJlZ2luLCBlbmQgLSAxKVxyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9IGVsc2UgaWYgKGsgPT0gMjcpIHsvL2VzY2FwZVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnZhbCh0aGlzLmZvY3VzVGV4dClcclxuICAgICAgdGhpcy5jYXJldCgwLCB0aGlzLmNoZWNrVmFsKCkpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5rZXlwcmVzc0V2ZW50ID0gZnVuY3Rpb24oZSkge1xyXG4gICAgdmFyIGxlbiA9IHRoaXMubWFzay5sZW5ndGhcclxuXHJcbiAgICB2YXIgayA9IGUud2hpY2gsXHJcbiAgICBwb3MgPSB0aGlzLmNhcmV0KClcclxuXHJcbiAgICBpZiAoZS5jdHJsS2V5IHx8IGUuYWx0S2V5IHx8IGUubWV0YUtleSB8fCBrIDwgMzIpICB7Ly9JZ25vcmVcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0gZWxzZSBpZiAoaykge1xyXG4gICAgICBpZiAocG9zLmVuZCAtIHBvcy5iZWdpbiAhPT0gMCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXJCdWZmZXIocG9zLmJlZ2luLCBwb3MuZW5kKVxyXG4gICAgICAgIHRoaXMuc2hpZnRMKHBvcy5iZWdpbiwgcG9zLmVuZCAtIDEpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBwID0gdGhpcy5zZWVrTmV4dChwb3MuYmVnaW4gLSAxKVxyXG4gICAgICBpZiAocCA8IGxlbikge1xyXG4gICAgICAgIHZhciBjID0gU3RyaW5nLmZyb21DaGFyQ29kZShrKVxyXG4gICAgICAgIGlmICh0aGlzLnRlc3RzW3BdLnRlc3QoYykpIHtcclxuICAgICAgICAgIHRoaXMuc2hpZnRSKHApXHJcbiAgICAgICAgICB0aGlzLmJ1ZmZlcltwXSA9IGNcclxuICAgICAgICAgIHRoaXMud3JpdGVCdWZmZXIoKVxyXG4gICAgICAgICAgdmFyIG5leHQgPSB0aGlzLnNlZWtOZXh0KHApXHJcbiAgICAgICAgICB0aGlzLmNhcmV0KG5leHQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5wYXN0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdGhhdCA9IHRoaXNcclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICB0aGF0LmNhcmV0KHRoYXQuY2hlY2tWYWwodHJ1ZSkpXHJcbiAgICB9LCAwKVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5jbGVhckJ1ZmZlciA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcclxuICAgIHZhciBsZW4gPSB0aGlzLm1hc2subGVuZ3RoXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kICYmIGkgPCBsZW47IGkrKykge1xyXG4gICAgICBpZiAodGhpcy50ZXN0c1tpXSlcclxuICAgICAgICB0aGlzLmJ1ZmZlcltpXSA9IHRoaXMub3B0aW9ucy5wbGFjZWhvbGRlclxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS53cml0ZUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQudmFsKHRoaXMuYnVmZmVyLmpvaW4oJycpKS52YWwoKVxyXG4gIH1cclxuXHJcbiAgSW5wdXRtYXNrLnByb3RvdHlwZS5jaGVja1ZhbCA9IGZ1bmN0aW9uKGFsbG93KSB7XHJcbiAgICB2YXIgbGVuID0gdGhpcy5tYXNrLmxlbmd0aFxyXG4gICAgLy90cnkgdG8gcGxhY2UgY2hhcmFjdGVycyB3aGVyZSB0aGV5IGJlbG9uZ1xyXG4gICAgdmFyIHRlc3QgPSB0aGlzLiRlbGVtZW50LnZhbCgpXHJcbiAgICB2YXIgbGFzdE1hdGNoID0gLTFcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMCwgcG9zID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIGlmICh0aGlzLnRlc3RzW2ldKSB7XHJcbiAgICAgICAgdGhpcy5idWZmZXJbaV0gPSB0aGlzLm9wdGlvbnMucGxhY2Vob2xkZXJcclxuICAgICAgICB3aGlsZSAocG9zKysgPCB0ZXN0Lmxlbmd0aCkge1xyXG4gICAgICAgICAgdmFyIGMgPSB0ZXN0LmNoYXJBdChwb3MgLSAxKVxyXG4gICAgICAgICAgaWYgKHRoaXMudGVzdHNbaV0udGVzdChjKSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcltpXSA9IGNcclxuICAgICAgICAgICAgbGFzdE1hdGNoID0gaVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocG9zID4gdGVzdC5sZW5ndGgpXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuYnVmZmVyW2ldID09IHRlc3QuY2hhckF0KHBvcykgJiYgaSAhPSB0aGlzLnBhcnRpYWxQb3NpdGlvbikge1xyXG4gICAgICAgIHBvcysrXHJcbiAgICAgICAgbGFzdE1hdGNoID0gaVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIWFsbG93ICYmIGxhc3RNYXRjaCArIDEgPCB0aGlzLnBhcnRpYWxQb3NpdGlvbikge1xyXG4gICAgICB0aGlzLiRlbGVtZW50LnZhbChcIlwiKVxyXG4gICAgICB0aGlzLmNsZWFyQnVmZmVyKDAsIGxlbilcclxuICAgIH0gZWxzZSBpZiAoYWxsb3cgfHwgbGFzdE1hdGNoICsgMSA+PSB0aGlzLnBhcnRpYWxQb3NpdGlvbikge1xyXG4gICAgICB0aGlzLndyaXRlQnVmZmVyKClcclxuICAgICAgaWYgKCFhbGxvdykgdGhpcy4kZWxlbWVudC52YWwodGhpcy4kZWxlbWVudC52YWwoKS5zdWJzdHJpbmcoMCwgbGFzdE1hdGNoICsgMSkpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKHRoaXMucGFydGlhbFBvc2l0aW9uID8gaSA6IHRoaXMuZmlyc3ROb25NYXNrUG9zKVxyXG4gIH1cclxuXHJcbiAgXHJcbiAgLy8gSU5QVVRNQVNLIFBMVUdJTiBERUZJTklUSU9OXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHZhciBvbGQgPSAkLmZuLmlucHV0bWFza1xyXG4gIFxyXG4gICQuZm4uaW5wdXRtYXNrID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXHJcbiAgICAgIHZhciBkYXRhID0gJHRoaXMuZGF0YSgnYnMuaW5wdXRtYXNrJylcclxuICAgICAgXHJcbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMuaW5wdXRtYXNrJywgKGRhdGEgPSBuZXcgSW5wdXRtYXNrKHRoaXMsIG9wdGlvbnMpKSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAkLmZuLmlucHV0bWFzay5Db25zdHJ1Y3RvciA9IElucHV0bWFza1xyXG5cclxuXHJcbiAgLy8gSU5QVVRNQVNLIE5PIENPTkZMSUNUXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgJC5mbi5pbnB1dG1hc2subm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICQuZm4uaW5wdXRtYXNrID0gb2xkXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIElOUFVUTUFTSyBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignZm9jdXMuYnMuaW5wdXRtYXNrLmRhdGEtYXBpJywgJ1tkYXRhLW1hc2tdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgIGlmICgkdGhpcy5kYXRhKCdicy5pbnB1dG1hc2snKSkgcmV0dXJuXHJcbiAgICAkdGhpcy5pbnB1dG1hc2soJHRoaXMuZGF0YSgpKVxyXG4gIH0pXHJcblxyXG59KHdpbmRvdy5qUXVlcnkpO1xyXG5cclxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQm9vdHN0cmFwOiBmaWxlaW5wdXQuanMgdjMuMS4zXHJcbiAqIGh0dHA6Ly9qYXNueS5naXRodWIuY29tL2Jvb3RzdHJhcC9qYXZhc2NyaXB0LyNmaWxlaW5wdXRcclxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogQ29weXJpZ2h0IDIwMTItMjAxNCBBcm5vbGQgRGFuaWVsc1xyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpXHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cclxuXHJcbitmdW5jdGlvbiAoJCkgeyBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgdmFyIGlzSUUgPSB3aW5kb3cubmF2aWdhdG9yLmFwcE5hbWUgPT0gJ01pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlcidcclxuXHJcbiAgLy8gRklMRVVQTE9BRCBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICB2YXIgRmlsZWlucHV0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpXHJcbiAgICBcclxuICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZWxlbWVudC5maW5kKCc6ZmlsZScpXHJcbiAgICBpZiAodGhpcy4kaW5wdXQubGVuZ3RoID09PSAwKSByZXR1cm5cclxuXHJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLiRpbnB1dC5hdHRyKCduYW1lJykgfHwgb3B0aW9ucy5uYW1lXHJcblxyXG4gICAgdGhpcy4kaGlkZGVuID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPWhpZGRlbl1bbmFtZT1cIicgKyB0aGlzLm5hbWUgKyAnXCJdJylcclxuICAgIGlmICh0aGlzLiRoaWRkZW4ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHRoaXMuJGhpZGRlbiA9ICQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCI+JykuaW5zZXJ0QmVmb3JlKHRoaXMuJGlucHV0KVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJHByZXZpZXcgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5maWxlaW5wdXQtcHJldmlldycpXHJcbiAgICB2YXIgaGVpZ2h0ID0gdGhpcy4kcHJldmlldy5jc3MoJ2hlaWdodCcpXHJcbiAgICBpZiAodGhpcy4kcHJldmlldy5jc3MoJ2Rpc3BsYXknKSAhPT0gJ2lubGluZScgJiYgaGVpZ2h0ICE9PSAnMHB4JyAmJiBoZWlnaHQgIT09ICdub25lJykge1xyXG4gICAgICB0aGlzLiRwcmV2aWV3LmNzcygnbGluZS1oZWlnaHQnLCBoZWlnaHQpXHJcbiAgICB9XHJcbiAgICAgICAgXHJcbiAgICB0aGlzLm9yaWdpbmFsID0ge1xyXG4gICAgICBleGlzdHM6IHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2ZpbGVpbnB1dC1leGlzdHMnKSxcclxuICAgICAgcHJldmlldzogdGhpcy4kcHJldmlldy5odG1sKCksXHJcbiAgICAgIGhpZGRlblZhbDogdGhpcy4kaGlkZGVuLnZhbCgpXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMubGlzdGVuKClcclxuICB9XHJcbiAgXHJcbiAgRmlsZWlucHV0LnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMuJGlucHV0Lm9uKCdjaGFuZ2UuYnMuZmlsZWlucHV0JywgJC5wcm94eSh0aGlzLmNoYW5nZSwgdGhpcykpXHJcbiAgICAkKHRoaXMuJGlucHV0WzBdLmZvcm0pLm9uKCdyZXNldC5icy5maWxlaW5wdXQnLCAkLnByb3h5KHRoaXMucmVzZXQsIHRoaXMpKVxyXG4gICAgXHJcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXRyaWdnZXI9XCJmaWxlaW5wdXRcIl0nKS5vbignY2xpY2suYnMuZmlsZWlucHV0JywgJC5wcm94eSh0aGlzLnRyaWdnZXIsIHRoaXMpKVxyXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1kaXNtaXNzPVwiZmlsZWlucHV0XCJdJykub24oJ2NsaWNrLmJzLmZpbGVpbnB1dCcsICQucHJveHkodGhpcy5jbGVhciwgdGhpcykpXHJcbiAgfSxcclxuXHJcbiAgRmlsZWlucHV0LnByb3RvdHlwZS5jaGFuZ2UgPSBmdW5jdGlvbihlKSB7XHJcbiAgICB2YXIgZmlsZXMgPSBlLnRhcmdldC5maWxlcyA9PT0gdW5kZWZpbmVkID8gKGUudGFyZ2V0ICYmIGUudGFyZ2V0LnZhbHVlID8gW3sgbmFtZTogZS50YXJnZXQudmFsdWUucmVwbGFjZSgvXi4rXFxcXC8sICcnKX1dIDogW10pIDogZS50YXJnZXQuZmlsZXNcclxuICAgIFxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cclxuICAgIGlmIChmaWxlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgdGhpcy5jbGVhcigpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuJGhpZGRlbi52YWwoJycpXHJcbiAgICB0aGlzLiRoaWRkZW4uYXR0cignbmFtZScsICcnKVxyXG4gICAgdGhpcy4kaW5wdXQuYXR0cignbmFtZScsIHRoaXMubmFtZSlcclxuXHJcbiAgICB2YXIgZmlsZSA9IGZpbGVzWzBdXHJcblxyXG4gICAgaWYgKHRoaXMuJHByZXZpZXcubGVuZ3RoID4gMCAmJiAodHlwZW9mIGZpbGUudHlwZSAhPT0gXCJ1bmRlZmluZWRcIiA/IGZpbGUudHlwZS5tYXRjaCgvXmltYWdlXFwvKGdpZnxwbmd8anBlZykkLykgOiBmaWxlLm5hbWUubWF0Y2goL1xcLihnaWZ8cG5nfGpwZT9nKSQvaSkpICYmIHR5cGVvZiBGaWxlUmVhZGVyICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXHJcbiAgICAgIHZhciBwcmV2aWV3ID0gdGhpcy4kcHJldmlld1xyXG4gICAgICB2YXIgZWxlbWVudCA9IHRoaXMuJGVsZW1lbnRcclxuXHJcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihyZSkge1xyXG4gICAgICAgIHZhciAkaW1nID0gJCgnPGltZz4nKVxyXG4gICAgICAgICRpbWdbMF0uc3JjID0gcmUudGFyZ2V0LnJlc3VsdFxyXG4gICAgICAgIGZpbGVzWzBdLnJlc3VsdCA9IHJlLnRhcmdldC5yZXN1bHRcclxuICAgICAgICBcclxuICAgICAgICBlbGVtZW50LmZpbmQoJy5maWxlaW5wdXQtZmlsZW5hbWUnKS50ZXh0KGZpbGUubmFtZSlcclxuICAgICAgICBcclxuICAgICAgICAvLyBpZiBwYXJlbnQgaGFzIG1heC1oZWlnaHQsIHVzaW5nIGAobWF4LSloZWlnaHQ6IDEwMCVgIG9uIGNoaWxkIGRvZXNuJ3QgdGFrZSBwYWRkaW5nIGFuZCBib3JkZXIgaW50byBhY2NvdW50XHJcbiAgICAgICAgaWYgKHByZXZpZXcuY3NzKCdtYXgtaGVpZ2h0JykgIT0gJ25vbmUnKSAkaW1nLmNzcygnbWF4LWhlaWdodCcsIHBhcnNlSW50KHByZXZpZXcuY3NzKCdtYXgtaGVpZ2h0JyksIDEwKSAtIHBhcnNlSW50KHByZXZpZXcuY3NzKCdwYWRkaW5nLXRvcCcpLCAxMCkgLSBwYXJzZUludChwcmV2aWV3LmNzcygncGFkZGluZy1ib3R0b20nKSwgMTApICAtIHBhcnNlSW50KHByZXZpZXcuY3NzKCdib3JkZXItdG9wJyksIDEwKSAtIHBhcnNlSW50KHByZXZpZXcuY3NzKCdib3JkZXItYm90dG9tJyksIDEwKSlcclxuICAgICAgICBcclxuICAgICAgICBwcmV2aWV3Lmh0bWwoJGltZylcclxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdmaWxlaW5wdXQtZXhpc3RzJykucmVtb3ZlQ2xhc3MoJ2ZpbGVpbnB1dC1uZXcnKVxyXG5cclxuICAgICAgICBlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZS5icy5maWxlaW5wdXQnLCBmaWxlcylcclxuICAgICAgfVxyXG5cclxuICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnLmZpbGVpbnB1dC1maWxlbmFtZScpLnRleHQoZmlsZS5uYW1lKVxyXG4gICAgICB0aGlzLiRwcmV2aWV3LnRleHQoZmlsZS5uYW1lKVxyXG4gICAgICBcclxuICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnZmlsZWlucHV0LWV4aXN0cycpLnJlbW92ZUNsYXNzKCdmaWxlaW5wdXQtbmV3JylcclxuICAgICAgXHJcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2hhbmdlLmJzLmZpbGVpbnB1dCcpXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgRmlsZWlucHV0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgIGlmIChlKSBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIFxyXG4gICAgdGhpcy4kaGlkZGVuLnZhbCgnJylcclxuICAgIHRoaXMuJGhpZGRlbi5hdHRyKCduYW1lJywgdGhpcy5uYW1lKVxyXG4gICAgdGhpcy4kaW5wdXQuYXR0cignbmFtZScsICcnKVxyXG5cclxuICAgIC8vaWU4KyBkb2Vzbid0IHN1cHBvcnQgY2hhbmdpbmcgdGhlIHZhbHVlIG9mIGlucHV0IHdpdGggdHlwZT1maWxlIHNvIGNsb25lIGluc3RlYWRcclxuICAgIGlmIChpc0lFKSB7IFxyXG4gICAgICB2YXIgaW5wdXRDbG9uZSA9IHRoaXMuJGlucHV0LmNsb25lKHRydWUpO1xyXG4gICAgICB0aGlzLiRpbnB1dC5hZnRlcihpbnB1dENsb25lKTtcclxuICAgICAgdGhpcy4kaW5wdXQucmVtb3ZlKCk7XHJcbiAgICAgIHRoaXMuJGlucHV0ID0gaW5wdXRDbG9uZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuJGlucHV0LnZhbCgnJylcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLiRwcmV2aWV3Lmh0bWwoJycpXHJcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5maWxlaW5wdXQtZmlsZW5hbWUnKS50ZXh0KCcnKVxyXG4gICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnZmlsZWlucHV0LW5ldycpLnJlbW92ZUNsYXNzKCdmaWxlaW5wdXQtZXhpc3RzJylcclxuICAgIFxyXG4gICAgaWYgKGUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB0aGlzLiRpbnB1dC50cmlnZ2VyKCdjaGFuZ2UnKVxyXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NsZWFyLmJzLmZpbGVpbnB1dCcpXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgRmlsZWlucHV0LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jbGVhcigpXHJcblxyXG4gICAgdGhpcy4kaGlkZGVuLnZhbCh0aGlzLm9yaWdpbmFsLmhpZGRlblZhbClcclxuICAgIHRoaXMuJHByZXZpZXcuaHRtbCh0aGlzLm9yaWdpbmFsLnByZXZpZXcpXHJcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJy5maWxlaW5wdXQtZmlsZW5hbWUnKS50ZXh0KCcnKVxyXG5cclxuICAgIGlmICh0aGlzLm9yaWdpbmFsLmV4aXN0cykgdGhpcy4kZWxlbWVudC5hZGRDbGFzcygnZmlsZWlucHV0LWV4aXN0cycpLnJlbW92ZUNsYXNzKCdmaWxlaW5wdXQtbmV3JylcclxuICAgICBlbHNlIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2ZpbGVpbnB1dC1uZXcnKS5yZW1vdmVDbGFzcygnZmlsZWlucHV0LWV4aXN0cycpXHJcbiAgICBcclxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncmVzZXQuYnMuZmlsZWlucHV0JylcclxuICB9LFxyXG5cclxuICBGaWxlaW5wdXQucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbihlKSB7XHJcbiAgICB0aGlzLiRpbnB1dC50cmlnZ2VyKCdjbGljaycpXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICB9XHJcblxyXG4gIFxyXG4gIC8vIEZJTEVVUExPQUQgUExVR0lOIERFRklOSVRJT05cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgdmFyIG9sZCA9ICQuZm4uZmlsZWlucHV0XHJcbiAgXHJcbiAgJC5mbi5maWxlaW5wdXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICBkYXRhID0gJHRoaXMuZGF0YSgnYnMuZmlsZWlucHV0JylcclxuICAgICAgaWYgKCFkYXRhKSAkdGhpcy5kYXRhKCdicy5maWxlaW5wdXQnLCAoZGF0YSA9IG5ldyBGaWxlaW5wdXQodGhpcywgb3B0aW9ucykpKVxyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uc10oKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gICQuZm4uZmlsZWlucHV0LkNvbnN0cnVjdG9yID0gRmlsZWlucHV0XHJcblxyXG5cclxuICAvLyBGSUxFSU5QVVQgTk8gQ09ORkxJQ1RcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkLmZuLmZpbGVpbnB1dC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgJC5mbi5maWxlaW5wdXQgPSBvbGRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gRklMRVVQTE9BRCBEQVRBLUFQSVxyXG4gIC8vID09PT09PT09PT09PT09PT09PVxyXG5cclxuICAkKGRvY3VtZW50KS5vbignY2xpY2suZmlsZWlucHV0LmRhdGEtYXBpJywgJ1tkYXRhLXByb3ZpZGVzPVwiZmlsZWlucHV0XCJdJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGhpcyA9ICQodGhpcylcclxuICAgIGlmICgkdGhpcy5kYXRhKCdicy5maWxlaW5wdXQnKSkgcmV0dXJuXHJcbiAgICAkdGhpcy5maWxlaW5wdXQoJHRoaXMuZGF0YSgpKVxyXG4gICAgICBcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtZGlzbWlzcz1cImZpbGVpbnB1dFwiXSxbZGF0YS10cmlnZ2VyPVwiZmlsZWlucHV0XCJdJyk7XHJcbiAgICBpZiAoJHRhcmdldC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAkdGFyZ2V0LnRyaWdnZXIoJ2NsaWNrLmJzLmZpbGVpbnB1dCcpXHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbn0od2luZG93LmpRdWVyeSk7XHJcbiIsIi8vISBtb21lbnQuanNcbi8vISB2ZXJzaW9uIDogMi4xNy4xXG4vLyEgYXV0aG9ycyA6IFRpbSBXb29kLCBJc2tyZW4gQ2hlcm5ldiwgTW9tZW50LmpzIGNvbnRyaWJ1dG9yc1xuLy8hIGxpY2Vuc2UgOiBNSVRcbi8vISBtb21lbnRqcy5jb21cbiFmdW5jdGlvbihhLGIpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPWIoKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGIpOmEubW9tZW50PWIoKX0odGhpcyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGEoKXtyZXR1cm4gb2QuYXBwbHkobnVsbCxhcmd1bWVudHMpfVxuLy8gVGhpcyBpcyBkb25lIHRvIHJlZ2lzdGVyIHRoZSBtZXRob2QgY2FsbGVkIHdpdGggbW9tZW50KClcbi8vIHdpdGhvdXQgY3JlYXRpbmcgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuZnVuY3Rpb24gYihhKXtvZD1hfWZ1bmN0aW9uIGMoYSl7cmV0dXJuIGEgaW5zdGFuY2VvZiBBcnJheXx8XCJbb2JqZWN0IEFycmF5XVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpfWZ1bmN0aW9uIGQoYSl7XG4vLyBJRTggd2lsbCB0cmVhdCB1bmRlZmluZWQgYW5kIG51bGwgYXMgb2JqZWN0IGlmIGl0IHdhc24ndCBmb3Jcbi8vIGlucHV0ICE9IG51bGxcbnJldHVybiBudWxsIT1hJiZcIltvYmplY3QgT2JqZWN0XVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpfWZ1bmN0aW9uIGUoYSl7dmFyIGI7Zm9yKGIgaW4gYSlcbi8vIGV2ZW4gaWYgaXRzIG5vdCBvd24gcHJvcGVydHkgSSdkIHN0aWxsIGNhbGwgaXQgbm9uLWVtcHR5XG5yZXR1cm4hMTtyZXR1cm4hMH1mdW5jdGlvbiBmKGEpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiBhfHxcIltvYmplY3QgTnVtYmVyXVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpfWZ1bmN0aW9uIGcoYSl7cmV0dXJuIGEgaW5zdGFuY2VvZiBEYXRlfHxcIltvYmplY3QgRGF0ZV1cIj09PU9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKX1mdW5jdGlvbiBoKGEsYil7dmFyIGMsZD1bXTtmb3IoYz0wO2M8YS5sZW5ndGg7KytjKWQucHVzaChiKGFbY10sYykpO3JldHVybiBkfWZ1bmN0aW9uIGkoYSxiKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGEsYil9ZnVuY3Rpb24gaihhLGIpe2Zvcih2YXIgYyBpbiBiKWkoYixjKSYmKGFbY109YltjXSk7cmV0dXJuIGkoYixcInRvU3RyaW5nXCIpJiYoYS50b1N0cmluZz1iLnRvU3RyaW5nKSxpKGIsXCJ2YWx1ZU9mXCIpJiYoYS52YWx1ZU9mPWIudmFsdWVPZiksYX1mdW5jdGlvbiBrKGEsYixjLGQpe3JldHVybiByYihhLGIsYyxkLCEwKS51dGMoKX1mdW5jdGlvbiBsKCl7XG4vLyBXZSBuZWVkIHRvIGRlZXAgY2xvbmUgdGhpcyBvYmplY3QuXG5yZXR1cm57ZW1wdHk6ITEsdW51c2VkVG9rZW5zOltdLHVudXNlZElucHV0OltdLG92ZXJmbG93Oi0yLGNoYXJzTGVmdE92ZXI6MCxudWxsSW5wdXQ6ITEsaW52YWxpZE1vbnRoOm51bGwsaW52YWxpZEZvcm1hdDohMSx1c2VySW52YWxpZGF0ZWQ6ITEsaXNvOiExLHBhcnNlZERhdGVQYXJ0czpbXSxtZXJpZGllbTpudWxsfX1mdW5jdGlvbiBtKGEpe3JldHVybiBudWxsPT1hLl9wZiYmKGEuX3BmPWwoKSksYS5fcGZ9ZnVuY3Rpb24gbihhKXtpZihudWxsPT1hLl9pc1ZhbGlkKXt2YXIgYj1tKGEpLGM9cWQuY2FsbChiLnBhcnNlZERhdGVQYXJ0cyxmdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9YX0pLGQ9IWlzTmFOKGEuX2QuZ2V0VGltZSgpKSYmYi5vdmVyZmxvdzwwJiYhYi5lbXB0eSYmIWIuaW52YWxpZE1vbnRoJiYhYi5pbnZhbGlkV2Vla2RheSYmIWIubnVsbElucHV0JiYhYi5pbnZhbGlkRm9ybWF0JiYhYi51c2VySW52YWxpZGF0ZWQmJighYi5tZXJpZGllbXx8Yi5tZXJpZGllbSYmYyk7aWYoYS5fc3RyaWN0JiYoZD1kJiYwPT09Yi5jaGFyc0xlZnRPdmVyJiYwPT09Yi51bnVzZWRUb2tlbnMubGVuZ3RoJiZ2b2lkIDA9PT1iLmJpZ0hvdXIpLG51bGwhPU9iamVjdC5pc0Zyb3plbiYmT2JqZWN0LmlzRnJvemVuKGEpKXJldHVybiBkO2EuX2lzVmFsaWQ9ZH1yZXR1cm4gYS5faXNWYWxpZH1mdW5jdGlvbiBvKGEpe3ZhciBiPWsoTmFOKTtyZXR1cm4gbnVsbCE9YT9qKG0oYiksYSk6bShiKS51c2VySW52YWxpZGF0ZWQ9ITAsYn1mdW5jdGlvbiBwKGEpe3JldHVybiB2b2lkIDA9PT1hfWZ1bmN0aW9uIHEoYSxiKXt2YXIgYyxkLGU7aWYocChiLl9pc0FNb21lbnRPYmplY3QpfHwoYS5faXNBTW9tZW50T2JqZWN0PWIuX2lzQU1vbWVudE9iamVjdCkscChiLl9pKXx8KGEuX2k9Yi5faSkscChiLl9mKXx8KGEuX2Y9Yi5fZikscChiLl9sKXx8KGEuX2w9Yi5fbCkscChiLl9zdHJpY3QpfHwoYS5fc3RyaWN0PWIuX3N0cmljdCkscChiLl90em0pfHwoYS5fdHptPWIuX3R6bSkscChiLl9pc1VUQyl8fChhLl9pc1VUQz1iLl9pc1VUQykscChiLl9vZmZzZXQpfHwoYS5fb2Zmc2V0PWIuX29mZnNldCkscChiLl9wZil8fChhLl9wZj1tKGIpKSxwKGIuX2xvY2FsZSl8fChhLl9sb2NhbGU9Yi5fbG9jYWxlKSxyZC5sZW5ndGg+MClmb3IoYyBpbiByZClkPXJkW2NdLGU9YltkXSxwKGUpfHwoYVtkXT1lKTtyZXR1cm4gYX1cbi8vIE1vbWVudCBwcm90b3R5cGUgb2JqZWN0XG5mdW5jdGlvbiByKGIpe3EodGhpcyxiKSx0aGlzLl9kPW5ldyBEYXRlKG51bGwhPWIuX2Q/Yi5fZC5nZXRUaW1lKCk6TmFOKSx0aGlzLmlzVmFsaWQoKXx8KHRoaXMuX2Q9bmV3IERhdGUoTmFOKSksXG4vLyBQcmV2ZW50IGluZmluaXRlIGxvb3AgaW4gY2FzZSB1cGRhdGVPZmZzZXQgY3JlYXRlcyBuZXcgbW9tZW50XG4vLyBvYmplY3RzLlxuc2Q9PT0hMSYmKHNkPSEwLGEudXBkYXRlT2Zmc2V0KHRoaXMpLHNkPSExKX1mdW5jdGlvbiBzKGEpe3JldHVybiBhIGluc3RhbmNlb2Ygcnx8bnVsbCE9YSYmbnVsbCE9YS5faXNBTW9tZW50T2JqZWN0fWZ1bmN0aW9uIHQoYSl7cmV0dXJuIGE8MD9NYXRoLmNlaWwoYSl8fDA6TWF0aC5mbG9vcihhKX1mdW5jdGlvbiB1KGEpe3ZhciBiPSthLGM9MDtyZXR1cm4gMCE9PWImJmlzRmluaXRlKGIpJiYoYz10KGIpKSxjfVxuLy8gY29tcGFyZSB0d28gYXJyYXlzLCByZXR1cm4gdGhlIG51bWJlciBvZiBkaWZmZXJlbmNlc1xuZnVuY3Rpb24gdihhLGIsYyl7dmFyIGQsZT1NYXRoLm1pbihhLmxlbmd0aCxiLmxlbmd0aCksZj1NYXRoLmFicyhhLmxlbmd0aC1iLmxlbmd0aCksZz0wO2ZvcihkPTA7ZDxlO2QrKykoYyYmYVtkXSE9PWJbZF18fCFjJiZ1KGFbZF0pIT09dShiW2RdKSkmJmcrKztyZXR1cm4gZytmfWZ1bmN0aW9uIHcoYil7YS5zdXBwcmVzc0RlcHJlY2F0aW9uV2FybmluZ3M9PT0hMSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGNvbnNvbGUmJmNvbnNvbGUud2FybiYmY29uc29sZS53YXJuKFwiRGVwcmVjYXRpb24gd2FybmluZzogXCIrYil9ZnVuY3Rpb24geChiLGMpe3ZhciBkPSEwO3JldHVybiBqKGZ1bmN0aW9uKCl7aWYobnVsbCE9YS5kZXByZWNhdGlvbkhhbmRsZXImJmEuZGVwcmVjYXRpb25IYW5kbGVyKG51bGwsYiksZCl7Zm9yKHZhciBlLGY9W10sZz0wO2c8YXJndW1lbnRzLmxlbmd0aDtnKyspe2lmKGU9XCJcIixcIm9iamVjdFwiPT10eXBlb2YgYXJndW1lbnRzW2ddKXtlKz1cIlxcbltcIitnK1wiXSBcIjtmb3IodmFyIGggaW4gYXJndW1lbnRzWzBdKWUrPWgrXCI6IFwiK2FyZ3VtZW50c1swXVtoXStcIiwgXCI7ZT1lLnNsaWNlKDAsLTIpfWVsc2UgZT1hcmd1bWVudHNbZ107Zi5wdXNoKGUpfXcoYitcIlxcbkFyZ3VtZW50czogXCIrQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZikuam9pbihcIlwiKStcIlxcblwiKyhuZXcgRXJyb3IpLnN0YWNrKSxkPSExfXJldHVybiBjLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sYyl9ZnVuY3Rpb24geShiLGMpe251bGwhPWEuZGVwcmVjYXRpb25IYW5kbGVyJiZhLmRlcHJlY2F0aW9uSGFuZGxlcihiLGMpLHRkW2JdfHwodyhjKSx0ZFtiXT0hMCl9ZnVuY3Rpb24geihhKXtyZXR1cm4gYSBpbnN0YW5jZW9mIEZ1bmN0aW9ufHxcIltvYmplY3QgRnVuY3Rpb25dXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSl9ZnVuY3Rpb24gQShhKXt2YXIgYixjO2ZvcihjIGluIGEpYj1hW2NdLHooYik/dGhpc1tjXT1iOnRoaXNbXCJfXCIrY109Yjt0aGlzLl9jb25maWc9YSxcbi8vIExlbmllbnQgb3JkaW5hbCBwYXJzaW5nIGFjY2VwdHMganVzdCBhIG51bWJlciBpbiBhZGRpdGlvbiB0b1xuLy8gbnVtYmVyICsgKHBvc3NpYmx5KSBzdHVmZiBjb21pbmcgZnJvbSBfb3JkaW5hbFBhcnNlTGVuaWVudC5cbnRoaXMuX29yZGluYWxQYXJzZUxlbmllbnQ9bmV3IFJlZ0V4cCh0aGlzLl9vcmRpbmFsUGFyc2Uuc291cmNlK1wifFwiKy9cXGR7MSwyfS8uc291cmNlKX1mdW5jdGlvbiBCKGEsYil7dmFyIGMsZT1qKHt9LGEpO2ZvcihjIGluIGIpaShiLGMpJiYoZChhW2NdKSYmZChiW2NdKT8oZVtjXT17fSxqKGVbY10sYVtjXSksaihlW2NdLGJbY10pKTpudWxsIT1iW2NdP2VbY109YltjXTpkZWxldGUgZVtjXSk7Zm9yKGMgaW4gYSlpKGEsYykmJiFpKGIsYykmJmQoYVtjXSkmJihcbi8vIG1ha2Ugc3VyZSBjaGFuZ2VzIHRvIHByb3BlcnRpZXMgZG9uJ3QgbW9kaWZ5IHBhcmVudCBjb25maWdcbmVbY109aih7fSxlW2NdKSk7cmV0dXJuIGV9ZnVuY3Rpb24gQyhhKXtudWxsIT1hJiZ0aGlzLnNldChhKX1mdW5jdGlvbiBEKGEsYixjKXt2YXIgZD10aGlzLl9jYWxlbmRhclthXXx8dGhpcy5fY2FsZW5kYXIuc2FtZUVsc2U7cmV0dXJuIHooZCk/ZC5jYWxsKGIsYyk6ZH1mdW5jdGlvbiBFKGEpe3ZhciBiPXRoaXMuX2xvbmdEYXRlRm9ybWF0W2FdLGM9dGhpcy5fbG9uZ0RhdGVGb3JtYXRbYS50b1VwcGVyQ2FzZSgpXTtyZXR1cm4gYnx8IWM/YjoodGhpcy5fbG9uZ0RhdGVGb3JtYXRbYV09Yy5yZXBsYWNlKC9NTU1NfE1NfEREfGRkZGQvZyxmdW5jdGlvbihhKXtyZXR1cm4gYS5zbGljZSgxKX0pLHRoaXMuX2xvbmdEYXRlRm9ybWF0W2FdKX1mdW5jdGlvbiBGKCl7cmV0dXJuIHRoaXMuX2ludmFsaWREYXRlfWZ1bmN0aW9uIEcoYSl7cmV0dXJuIHRoaXMuX29yZGluYWwucmVwbGFjZShcIiVkXCIsYSl9ZnVuY3Rpb24gSChhLGIsYyxkKXt2YXIgZT10aGlzLl9yZWxhdGl2ZVRpbWVbY107cmV0dXJuIHooZSk/ZShhLGIsYyxkKTplLnJlcGxhY2UoLyVkL2ksYSl9ZnVuY3Rpb24gSShhLGIpe3ZhciBjPXRoaXMuX3JlbGF0aXZlVGltZVthPjA/XCJmdXR1cmVcIjpcInBhc3RcIl07cmV0dXJuIHooYyk/YyhiKTpjLnJlcGxhY2UoLyVzL2ksYil9ZnVuY3Rpb24gSihhLGIpe3ZhciBjPWEudG9Mb3dlckNhc2UoKTtEZFtjXT1EZFtjK1wic1wiXT1EZFtiXT1hfWZ1bmN0aW9uIEsoYSl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGE/RGRbYV18fERkW2EudG9Mb3dlckNhc2UoKV06dm9pZCAwfWZ1bmN0aW9uIEwoYSl7dmFyIGIsYyxkPXt9O2ZvcihjIGluIGEpaShhLGMpJiYoYj1LKGMpLGImJihkW2JdPWFbY10pKTtyZXR1cm4gZH1mdW5jdGlvbiBNKGEsYil7RWRbYV09Yn1mdW5jdGlvbiBOKGEpe3ZhciBiPVtdO2Zvcih2YXIgYyBpbiBhKWIucHVzaCh7dW5pdDpjLHByaW9yaXR5OkVkW2NdfSk7cmV0dXJuIGIuc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhLnByaW9yaXR5LWIucHJpb3JpdHl9KSxifWZ1bmN0aW9uIE8oYixjKXtyZXR1cm4gZnVuY3Rpb24oZCl7cmV0dXJuIG51bGwhPWQ/KFEodGhpcyxiLGQpLGEudXBkYXRlT2Zmc2V0KHRoaXMsYyksdGhpcyk6UCh0aGlzLGIpfX1mdW5jdGlvbiBQKGEsYil7cmV0dXJuIGEuaXNWYWxpZCgpP2EuX2RbXCJnZXRcIisoYS5faXNVVEM/XCJVVENcIjpcIlwiKStiXSgpOk5hTn1mdW5jdGlvbiBRKGEsYixjKXthLmlzVmFsaWQoKSYmYS5fZFtcInNldFwiKyhhLl9pc1VUQz9cIlVUQ1wiOlwiXCIpK2JdKGMpfVxuLy8gTU9NRU5UU1xuZnVuY3Rpb24gUihhKXtyZXR1cm4gYT1LKGEpLHoodGhpc1thXSk/dGhpc1thXSgpOnRoaXN9ZnVuY3Rpb24gUyhhLGIpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBhKXthPUwoYSk7Zm9yKHZhciBjPU4oYSksZD0wO2Q8Yy5sZW5ndGg7ZCsrKXRoaXNbY1tkXS51bml0XShhW2NbZF0udW5pdF0pfWVsc2UgaWYoYT1LKGEpLHoodGhpc1thXSkpcmV0dXJuIHRoaXNbYV0oYik7cmV0dXJuIHRoaXN9ZnVuY3Rpb24gVChhLGIsYyl7dmFyIGQ9XCJcIitNYXRoLmFicyhhKSxlPWItZC5sZW5ndGgsZj1hPj0wO3JldHVybihmP2M/XCIrXCI6XCJcIjpcIi1cIikrTWF0aC5wb3coMTAsTWF0aC5tYXgoMCxlKSkudG9TdHJpbmcoKS5zdWJzdHIoMSkrZH1cbi8vIHRva2VuOiAgICAnTSdcbi8vIHBhZGRlZDogICBbJ01NJywgMl1cbi8vIG9yZGluYWw6ICAnTW8nXG4vLyBjYWxsYmFjazogZnVuY3Rpb24gKCkgeyB0aGlzLm1vbnRoKCkgKyAxIH1cbmZ1bmN0aW9uIFUoYSxiLGMsZCl7dmFyIGU9ZDtcInN0cmluZ1wiPT10eXBlb2YgZCYmKGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc1tkXSgpfSksYSYmKElkW2FdPWUpLGImJihJZFtiWzBdXT1mdW5jdGlvbigpe3JldHVybiBUKGUuYXBwbHkodGhpcyxhcmd1bWVudHMpLGJbMV0sYlsyXSl9KSxjJiYoSWRbY109ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkub3JkaW5hbChlLmFwcGx5KHRoaXMsYXJndW1lbnRzKSxhKX0pfWZ1bmN0aW9uIFYoYSl7cmV0dXJuIGEubWF0Y2goL1xcW1tcXHNcXFNdLyk/YS5yZXBsYWNlKC9eXFxbfFxcXSQvZyxcIlwiKTphLnJlcGxhY2UoL1xcXFwvZyxcIlwiKX1mdW5jdGlvbiBXKGEpe3ZhciBiLGMsZD1hLm1hdGNoKEZkKTtmb3IoYj0wLGM9ZC5sZW5ndGg7YjxjO2IrKylJZFtkW2JdXT9kW2JdPUlkW2RbYl1dOmRbYl09VihkW2JdKTtyZXR1cm4gZnVuY3Rpb24oYil7dmFyIGUsZj1cIlwiO2ZvcihlPTA7ZTxjO2UrKylmKz1kW2VdaW5zdGFuY2VvZiBGdW5jdGlvbj9kW2VdLmNhbGwoYixhKTpkW2VdO3JldHVybiBmfX1cbi8vIGZvcm1hdCBkYXRlIHVzaW5nIG5hdGl2ZSBkYXRlIG9iamVjdFxuZnVuY3Rpb24gWChhLGIpe3JldHVybiBhLmlzVmFsaWQoKT8oYj1ZKGIsYS5sb2NhbGVEYXRhKCkpLEhkW2JdPUhkW2JdfHxXKGIpLEhkW2JdKGEpKTphLmxvY2FsZURhdGEoKS5pbnZhbGlkRGF0ZSgpfWZ1bmN0aW9uIFkoYSxiKXtmdW5jdGlvbiBjKGEpe3JldHVybiBiLmxvbmdEYXRlRm9ybWF0KGEpfHxhfXZhciBkPTU7Zm9yKEdkLmxhc3RJbmRleD0wO2Q+PTAmJkdkLnRlc3QoYSk7KWE9YS5yZXBsYWNlKEdkLGMpLEdkLmxhc3RJbmRleD0wLGQtPTE7cmV0dXJuIGF9ZnVuY3Rpb24gWihhLGIsYyl7JGRbYV09eihiKT9iOmZ1bmN0aW9uKGEsZCl7cmV0dXJuIGEmJmM/YzpifX1mdW5jdGlvbiAkKGEsYil7cmV0dXJuIGkoJGQsYSk/JGRbYV0oYi5fc3RyaWN0LGIuX2xvY2FsZSk6bmV3IFJlZ0V4cChfKGEpKX1cbi8vIENvZGUgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM1NjE0OTMvaXMtdGhlcmUtYS1yZWdleHAtZXNjYXBlLWZ1bmN0aW9uLWluLWphdmFzY3JpcHRcbmZ1bmN0aW9uIF8oYSl7cmV0dXJuIGFhKGEucmVwbGFjZShcIlxcXFxcIixcIlwiKS5yZXBsYWNlKC9cXFxcKFxcWyl8XFxcXChcXF0pfFxcWyhbXlxcXVxcW10qKVxcXXxcXFxcKC4pL2csZnVuY3Rpb24oYSxiLGMsZCxlKXtyZXR1cm4gYnx8Y3x8ZHx8ZX0pKX1mdW5jdGlvbiBhYShhKXtyZXR1cm4gYS5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csXCJcXFxcJCZcIil9ZnVuY3Rpb24gYmEoYSxiKXt2YXIgYyxkPWI7Zm9yKFwic3RyaW5nXCI9PXR5cGVvZiBhJiYoYT1bYV0pLGYoYikmJihkPWZ1bmN0aW9uKGEsYyl7Y1tiXT11KGEpfSksYz0wO2M8YS5sZW5ndGg7YysrKV9kW2FbY11dPWR9ZnVuY3Rpb24gY2EoYSxiKXtiYShhLGZ1bmN0aW9uKGEsYyxkLGUpe2QuX3c9ZC5fd3x8e30sYihhLGQuX3csZCxlKX0pfWZ1bmN0aW9uIGRhKGEsYixjKXtudWxsIT1iJiZpKF9kLGEpJiZfZFthXShiLGMuX2EsYyxhKX1mdW5jdGlvbiBlYShhLGIpe3JldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhhLGIrMSwwKSkuZ2V0VVRDRGF0ZSgpfWZ1bmN0aW9uIGZhKGEsYil7cmV0dXJuIGE/Yyh0aGlzLl9tb250aHMpP3RoaXMuX21vbnRoc1thLm1vbnRoKCldOnRoaXMuX21vbnRoc1sodGhpcy5fbW9udGhzLmlzRm9ybWF0fHxrZSkudGVzdChiKT9cImZvcm1hdFwiOlwic3RhbmRhbG9uZVwiXVthLm1vbnRoKCldOnRoaXMuX21vbnRoc31mdW5jdGlvbiBnYShhLGIpe3JldHVybiBhP2ModGhpcy5fbW9udGhzU2hvcnQpP3RoaXMuX21vbnRoc1Nob3J0W2EubW9udGgoKV06dGhpcy5fbW9udGhzU2hvcnRba2UudGVzdChiKT9cImZvcm1hdFwiOlwic3RhbmRhbG9uZVwiXVthLm1vbnRoKCldOnRoaXMuX21vbnRoc1Nob3J0fWZ1bmN0aW9uIGhhKGEsYixjKXt2YXIgZCxlLGYsZz1hLnRvTG9jYWxlTG93ZXJDYXNlKCk7aWYoIXRoaXMuX21vbnRoc1BhcnNlKWZvcihcbi8vIHRoaXMgaXMgbm90IHVzZWRcbnRoaXMuX21vbnRoc1BhcnNlPVtdLHRoaXMuX2xvbmdNb250aHNQYXJzZT1bXSx0aGlzLl9zaG9ydE1vbnRoc1BhcnNlPVtdLGQ9MDtkPDEyOysrZClmPWsoWzJlMyxkXSksdGhpcy5fc2hvcnRNb250aHNQYXJzZVtkXT10aGlzLm1vbnRoc1Nob3J0KGYsXCJcIikudG9Mb2NhbGVMb3dlckNhc2UoKSx0aGlzLl9sb25nTW9udGhzUGFyc2VbZF09dGhpcy5tb250aHMoZixcIlwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpO3JldHVybiBjP1wiTU1NXCI9PT1iPyhlPWplLmNhbGwodGhpcy5fc2hvcnRNb250aHNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKTooZT1qZS5jYWxsKHRoaXMuX2xvbmdNb250aHNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKTpcIk1NTVwiPT09Yj8oZT1qZS5jYWxsKHRoaXMuX3Nob3J0TW9udGhzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl9sb25nTW9udGhzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCkpOihlPWplLmNhbGwodGhpcy5fbG9uZ01vbnRoc1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fc2hvcnRNb250aHNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKSl9ZnVuY3Rpb24gaWEoYSxiLGMpe3ZhciBkLGUsZjtpZih0aGlzLl9tb250aHNQYXJzZUV4YWN0KXJldHVybiBoYS5jYWxsKHRoaXMsYSxiLGMpO1xuLy8gVE9ETzogYWRkIHNvcnRpbmdcbi8vIFNvcnRpbmcgbWFrZXMgc3VyZSBpZiBvbmUgbW9udGggKG9yIGFiYnIpIGlzIGEgcHJlZml4IG9mIGFub3RoZXJcbi8vIHNlZSBzb3J0aW5nIGluIGNvbXB1dGVNb250aHNQYXJzZVxuZm9yKHRoaXMuX21vbnRoc1BhcnNlfHwodGhpcy5fbW9udGhzUGFyc2U9W10sdGhpcy5fbG9uZ01vbnRoc1BhcnNlPVtdLHRoaXMuX3Nob3J0TW9udGhzUGFyc2U9W10pLGQ9MDtkPDEyO2QrKyl7XG4vLyB0ZXN0IHRoZSByZWdleFxuaWYoXG4vLyBtYWtlIHRoZSByZWdleCBpZiB3ZSBkb24ndCBoYXZlIGl0IGFscmVhZHlcbmU9ayhbMmUzLGRdKSxjJiYhdGhpcy5fbG9uZ01vbnRoc1BhcnNlW2RdJiYodGhpcy5fbG9uZ01vbnRoc1BhcnNlW2RdPW5ldyBSZWdFeHAoXCJeXCIrdGhpcy5tb250aHMoZSxcIlwiKS5yZXBsYWNlKFwiLlwiLFwiXCIpK1wiJFwiLFwiaVwiKSx0aGlzLl9zaG9ydE1vbnRoc1BhcnNlW2RdPW5ldyBSZWdFeHAoXCJeXCIrdGhpcy5tb250aHNTaG9ydChlLFwiXCIpLnJlcGxhY2UoXCIuXCIsXCJcIikrXCIkXCIsXCJpXCIpKSxjfHx0aGlzLl9tb250aHNQYXJzZVtkXXx8KGY9XCJeXCIrdGhpcy5tb250aHMoZSxcIlwiKStcInxeXCIrdGhpcy5tb250aHNTaG9ydChlLFwiXCIpLHRoaXMuX21vbnRoc1BhcnNlW2RdPW5ldyBSZWdFeHAoZi5yZXBsYWNlKFwiLlwiLFwiXCIpLFwiaVwiKSksYyYmXCJNTU1NXCI9PT1iJiZ0aGlzLl9sb25nTW9udGhzUGFyc2VbZF0udGVzdChhKSlyZXR1cm4gZDtpZihjJiZcIk1NTVwiPT09YiYmdGhpcy5fc2hvcnRNb250aHNQYXJzZVtkXS50ZXN0KGEpKXJldHVybiBkO2lmKCFjJiZ0aGlzLl9tb250aHNQYXJzZVtkXS50ZXN0KGEpKXJldHVybiBkfX1cbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIGphKGEsYil7dmFyIGM7aWYoIWEuaXNWYWxpZCgpKVxuLy8gTm8gb3BcbnJldHVybiBhO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBiKWlmKC9eXFxkKyQvLnRlc3QoYikpYj11KGIpO2Vsc2Vcbi8vIFRPRE86IEFub3RoZXIgc2lsZW50IGZhaWx1cmU/XG5pZihiPWEubG9jYWxlRGF0YSgpLm1vbnRoc1BhcnNlKGIpLCFmKGIpKXJldHVybiBhO3JldHVybiBjPU1hdGgubWluKGEuZGF0ZSgpLGVhKGEueWVhcigpLGIpKSxhLl9kW1wic2V0XCIrKGEuX2lzVVRDP1wiVVRDXCI6XCJcIikrXCJNb250aFwiXShiLGMpLGF9ZnVuY3Rpb24ga2EoYil7cmV0dXJuIG51bGwhPWI/KGphKHRoaXMsYiksYS51cGRhdGVPZmZzZXQodGhpcywhMCksdGhpcyk6UCh0aGlzLFwiTW9udGhcIil9ZnVuY3Rpb24gbGEoKXtyZXR1cm4gZWEodGhpcy55ZWFyKCksdGhpcy5tb250aCgpKX1mdW5jdGlvbiBtYShhKXtyZXR1cm4gdGhpcy5fbW9udGhzUGFyc2VFeGFjdD8oaSh0aGlzLFwiX21vbnRoc1JlZ2V4XCIpfHxvYS5jYWxsKHRoaXMpLGE/dGhpcy5fbW9udGhzU2hvcnRTdHJpY3RSZWdleDp0aGlzLl9tb250aHNTaG9ydFJlZ2V4KTooaSh0aGlzLFwiX21vbnRoc1Nob3J0UmVnZXhcIil8fCh0aGlzLl9tb250aHNTaG9ydFJlZ2V4PW5lKSx0aGlzLl9tb250aHNTaG9ydFN0cmljdFJlZ2V4JiZhP3RoaXMuX21vbnRoc1Nob3J0U3RyaWN0UmVnZXg6dGhpcy5fbW9udGhzU2hvcnRSZWdleCl9ZnVuY3Rpb24gbmEoYSl7cmV0dXJuIHRoaXMuX21vbnRoc1BhcnNlRXhhY3Q/KGkodGhpcyxcIl9tb250aHNSZWdleFwiKXx8b2EuY2FsbCh0aGlzKSxhP3RoaXMuX21vbnRoc1N0cmljdFJlZ2V4OnRoaXMuX21vbnRoc1JlZ2V4KTooaSh0aGlzLFwiX21vbnRoc1JlZ2V4XCIpfHwodGhpcy5fbW9udGhzUmVnZXg9b2UpLHRoaXMuX21vbnRoc1N0cmljdFJlZ2V4JiZhP3RoaXMuX21vbnRoc1N0cmljdFJlZ2V4OnRoaXMuX21vbnRoc1JlZ2V4KX1mdW5jdGlvbiBvYSgpe2Z1bmN0aW9uIGEoYSxiKXtyZXR1cm4gYi5sZW5ndGgtYS5sZW5ndGh9dmFyIGIsYyxkPVtdLGU9W10sZj1bXTtmb3IoYj0wO2I8MTI7YisrKVxuLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG5jPWsoWzJlMyxiXSksZC5wdXNoKHRoaXMubW9udGhzU2hvcnQoYyxcIlwiKSksZS5wdXNoKHRoaXMubW9udGhzKGMsXCJcIikpLGYucHVzaCh0aGlzLm1vbnRocyhjLFwiXCIpKSxmLnB1c2godGhpcy5tb250aHNTaG9ydChjLFwiXCIpKTtmb3IoXG4vLyBTb3J0aW5nIG1ha2VzIHN1cmUgaWYgb25lIG1vbnRoIChvciBhYmJyKSBpcyBhIHByZWZpeCBvZiBhbm90aGVyIGl0XG4vLyB3aWxsIG1hdGNoIHRoZSBsb25nZXIgcGllY2UuXG5kLnNvcnQoYSksZS5zb3J0KGEpLGYuc29ydChhKSxiPTA7YjwxMjtiKyspZFtiXT1hYShkW2JdKSxlW2JdPWFhKGVbYl0pO2ZvcihiPTA7YjwyNDtiKyspZltiXT1hYShmW2JdKTt0aGlzLl9tb250aHNSZWdleD1uZXcgUmVnRXhwKFwiXihcIitmLmpvaW4oXCJ8XCIpK1wiKVwiLFwiaVwiKSx0aGlzLl9tb250aHNTaG9ydFJlZ2V4PXRoaXMuX21vbnRoc1JlZ2V4LHRoaXMuX21vbnRoc1N0cmljdFJlZ2V4PW5ldyBSZWdFeHAoXCJeKFwiK2Uuam9pbihcInxcIikrXCIpXCIsXCJpXCIpLHRoaXMuX21vbnRoc1Nob3J0U3RyaWN0UmVnZXg9bmV3IFJlZ0V4cChcIl4oXCIrZC5qb2luKFwifFwiKStcIilcIixcImlcIil9XG4vLyBIRUxQRVJTXG5mdW5jdGlvbiBwYShhKXtyZXR1cm4gcWEoYSk/MzY2OjM2NX1mdW5jdGlvbiBxYShhKXtyZXR1cm4gYSU0PT09MCYmYSUxMDAhPT0wfHxhJTQwMD09PTB9ZnVuY3Rpb24gcmEoKXtyZXR1cm4gcWEodGhpcy55ZWFyKCkpfWZ1bmN0aW9uIHNhKGEsYixjLGQsZSxmLGcpe1xuLy9jYW4ndCBqdXN0IGFwcGx5KCkgdG8gY3JlYXRlIGEgZGF0ZTpcbi8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODEzNDgvaW5zdGFudGlhdGluZy1hLWphdmFzY3JpcHQtb2JqZWN0LWJ5LWNhbGxpbmctcHJvdG90eXBlLWNvbnN0cnVjdG9yLWFwcGx5XG52YXIgaD1uZXcgRGF0ZShhLGIsYyxkLGUsZixnKTtcbi8vdGhlIGRhdGUgY29uc3RydWN0b3IgcmVtYXBzIHllYXJzIDAtOTkgdG8gMTkwMC0xOTk5XG5yZXR1cm4gYTwxMDAmJmE+PTAmJmlzRmluaXRlKGguZ2V0RnVsbFllYXIoKSkmJmguc2V0RnVsbFllYXIoYSksaH1mdW5jdGlvbiB0YShhKXt2YXIgYj1uZXcgRGF0ZShEYXRlLlVUQy5hcHBseShudWxsLGFyZ3VtZW50cykpO1xuLy90aGUgRGF0ZS5VVEMgZnVuY3Rpb24gcmVtYXBzIHllYXJzIDAtOTkgdG8gMTkwMC0xOTk5XG5yZXR1cm4gYTwxMDAmJmE+PTAmJmlzRmluaXRlKGIuZ2V0VVRDRnVsbFllYXIoKSkmJmIuc2V0VVRDRnVsbFllYXIoYSksYn1cbi8vIHN0YXJ0LW9mLWZpcnN0LXdlZWsgLSBzdGFydC1vZi15ZWFyXG5mdW5jdGlvbiB1YShhLGIsYyl7dmFyLy8gZmlyc3Qtd2VlayBkYXkgLS0gd2hpY2ggamFudWFyeSBpcyBhbHdheXMgaW4gdGhlIGZpcnN0IHdlZWsgKDQgZm9yIGlzbywgMSBmb3Igb3RoZXIpXG5kPTcrYi1jLFxuLy8gZmlyc3Qtd2VlayBkYXkgbG9jYWwgd2Vla2RheSAtLSB3aGljaCBsb2NhbCB3ZWVrZGF5IGlzIGZ3ZFxuZT0oNyt0YShhLDAsZCkuZ2V0VVRDRGF5KCktYiklNztyZXR1cm4tZStkLTF9XG4vL2h0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZSNDYWxjdWxhdGluZ19hX2RhdGVfZ2l2ZW5fdGhlX3llYXIuMkNfd2Vla19udW1iZXJfYW5kX3dlZWtkYXlcbmZ1bmN0aW9uIHZhKGEsYixjLGQsZSl7dmFyIGYsZyxoPSg3K2MtZCklNyxpPXVhKGEsZCxlKSxqPTErNyooYi0xKStoK2k7cmV0dXJuIGo8PTA/KGY9YS0xLGc9cGEoZikraik6aj5wYShhKT8oZj1hKzEsZz1qLXBhKGEpKTooZj1hLGc9aikse3llYXI6ZixkYXlPZlllYXI6Z319ZnVuY3Rpb24gd2EoYSxiLGMpe3ZhciBkLGUsZj11YShhLnllYXIoKSxiLGMpLGc9TWF0aC5mbG9vcigoYS5kYXlPZlllYXIoKS1mLTEpLzcpKzE7cmV0dXJuIGc8MT8oZT1hLnllYXIoKS0xLGQ9Zyt4YShlLGIsYykpOmc+eGEoYS55ZWFyKCksYixjKT8oZD1nLXhhKGEueWVhcigpLGIsYyksZT1hLnllYXIoKSsxKTooZT1hLnllYXIoKSxkPWcpLHt3ZWVrOmQseWVhcjplfX1mdW5jdGlvbiB4YShhLGIsYyl7dmFyIGQ9dWEoYSxiLGMpLGU9dWEoYSsxLGIsYyk7cmV0dXJuKHBhKGEpLWQrZSkvN31cbi8vIEhFTFBFUlNcbi8vIExPQ0FMRVNcbmZ1bmN0aW9uIHlhKGEpe3JldHVybiB3YShhLHRoaXMuX3dlZWsuZG93LHRoaXMuX3dlZWsuZG95KS53ZWVrfWZ1bmN0aW9uIHphKCl7cmV0dXJuIHRoaXMuX3dlZWsuZG93fWZ1bmN0aW9uIEFhKCl7cmV0dXJuIHRoaXMuX3dlZWsuZG95fVxuLy8gTU9NRU5UU1xuZnVuY3Rpb24gQmEoYSl7dmFyIGI9dGhpcy5sb2NhbGVEYXRhKCkud2Vlayh0aGlzKTtyZXR1cm4gbnVsbD09YT9iOnRoaXMuYWRkKDcqKGEtYiksXCJkXCIpfWZ1bmN0aW9uIENhKGEpe3ZhciBiPXdhKHRoaXMsMSw0KS53ZWVrO3JldHVybiBudWxsPT1hP2I6dGhpcy5hZGQoNyooYS1iKSxcImRcIil9XG4vLyBIRUxQRVJTXG5mdW5jdGlvbiBEYShhLGIpe3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBhP2E6aXNOYU4oYSk/KGE9Yi53ZWVrZGF5c1BhcnNlKGEpLFwibnVtYmVyXCI9PXR5cGVvZiBhP2E6bnVsbCk6cGFyc2VJbnQoYSwxMCl9ZnVuY3Rpb24gRWEoYSxiKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYT9iLndlZWtkYXlzUGFyc2UoYSklN3x8Nzppc05hTihhKT9udWxsOmF9ZnVuY3Rpb24gRmEoYSxiKXtyZXR1cm4gYT9jKHRoaXMuX3dlZWtkYXlzKT90aGlzLl93ZWVrZGF5c1thLmRheSgpXTp0aGlzLl93ZWVrZGF5c1t0aGlzLl93ZWVrZGF5cy5pc0Zvcm1hdC50ZXN0KGIpP1wiZm9ybWF0XCI6XCJzdGFuZGFsb25lXCJdW2EuZGF5KCldOnRoaXMuX3dlZWtkYXlzfWZ1bmN0aW9uIEdhKGEpe3JldHVybiBhP3RoaXMuX3dlZWtkYXlzU2hvcnRbYS5kYXkoKV06dGhpcy5fd2Vla2RheXNTaG9ydH1mdW5jdGlvbiBIYShhKXtyZXR1cm4gYT90aGlzLl93ZWVrZGF5c01pblthLmRheSgpXTp0aGlzLl93ZWVrZGF5c01pbn1mdW5jdGlvbiBJYShhLGIsYyl7dmFyIGQsZSxmLGc9YS50b0xvY2FsZUxvd2VyQ2FzZSgpO2lmKCF0aGlzLl93ZWVrZGF5c1BhcnNlKWZvcih0aGlzLl93ZWVrZGF5c1BhcnNlPVtdLHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZT1bXSx0aGlzLl9taW5XZWVrZGF5c1BhcnNlPVtdLGQ9MDtkPDc7KytkKWY9ayhbMmUzLDFdKS5kYXkoZCksdGhpcy5fbWluV2Vla2RheXNQYXJzZVtkXT10aGlzLndlZWtkYXlzTWluKGYsXCJcIikudG9Mb2NhbGVMb3dlckNhc2UoKSx0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2VbZF09dGhpcy53ZWVrZGF5c1Nob3J0KGYsXCJcIikudG9Mb2NhbGVMb3dlckNhc2UoKSx0aGlzLl93ZWVrZGF5c1BhcnNlW2RdPXRoaXMud2Vla2RheXMoZixcIlwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpO3JldHVybiBjP1wiZGRkZFwiPT09Yj8oZT1qZS5jYWxsKHRoaXMuX3dlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCk6XCJkZGRcIj09PWI/KGU9amUuY2FsbCh0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCk6KGU9amUuY2FsbCh0aGlzLl9taW5XZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpOlwiZGRkZFwiPT09Yj8oZT1qZS5jYWxsKHRoaXMuX3dlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl9taW5XZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOm51bGwpKSk6XCJkZGRcIj09PWI/KGU9amUuY2FsbCh0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl93ZWVrZGF5c1BhcnNlLGcpLGUhPT0tMT9lOihlPWplLmNhbGwodGhpcy5fbWluV2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTpudWxsKSkpOihlPWplLmNhbGwodGhpcy5fbWluV2Vla2RheXNQYXJzZSxnKSxlIT09LTE/ZTooZT1qZS5jYWxsKHRoaXMuX3dlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6KGU9amUuY2FsbCh0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2UsZyksZSE9PS0xP2U6bnVsbCkpKX1mdW5jdGlvbiBKYShhLGIsYyl7dmFyIGQsZSxmO2lmKHRoaXMuX3dlZWtkYXlzUGFyc2VFeGFjdClyZXR1cm4gSWEuY2FsbCh0aGlzLGEsYixjKTtmb3IodGhpcy5fd2Vla2RheXNQYXJzZXx8KHRoaXMuX3dlZWtkYXlzUGFyc2U9W10sdGhpcy5fbWluV2Vla2RheXNQYXJzZT1bXSx0aGlzLl9zaG9ydFdlZWtkYXlzUGFyc2U9W10sdGhpcy5fZnVsbFdlZWtkYXlzUGFyc2U9W10pLGQ9MDtkPDc7ZCsrKXtcbi8vIHRlc3QgdGhlIHJlZ2V4XG5pZihcbi8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuZT1rKFsyZTMsMV0pLmRheShkKSxjJiYhdGhpcy5fZnVsbFdlZWtkYXlzUGFyc2VbZF0mJih0aGlzLl9mdWxsV2Vla2RheXNQYXJzZVtkXT1uZXcgUmVnRXhwKFwiXlwiK3RoaXMud2Vla2RheXMoZSxcIlwiKS5yZXBsYWNlKFwiLlwiLFwiLj9cIikrXCIkXCIsXCJpXCIpLHRoaXMuX3Nob3J0V2Vla2RheXNQYXJzZVtkXT1uZXcgUmVnRXhwKFwiXlwiK3RoaXMud2Vla2RheXNTaG9ydChlLFwiXCIpLnJlcGxhY2UoXCIuXCIsXCIuP1wiKStcIiRcIixcImlcIiksdGhpcy5fbWluV2Vla2RheXNQYXJzZVtkXT1uZXcgUmVnRXhwKFwiXlwiK3RoaXMud2Vla2RheXNNaW4oZSxcIlwiKS5yZXBsYWNlKFwiLlwiLFwiLj9cIikrXCIkXCIsXCJpXCIpKSx0aGlzLl93ZWVrZGF5c1BhcnNlW2RdfHwoZj1cIl5cIit0aGlzLndlZWtkYXlzKGUsXCJcIikrXCJ8XlwiK3RoaXMud2Vla2RheXNTaG9ydChlLFwiXCIpK1wifF5cIit0aGlzLndlZWtkYXlzTWluKGUsXCJcIiksdGhpcy5fd2Vla2RheXNQYXJzZVtkXT1uZXcgUmVnRXhwKGYucmVwbGFjZShcIi5cIixcIlwiKSxcImlcIikpLGMmJlwiZGRkZFwiPT09YiYmdGhpcy5fZnVsbFdlZWtkYXlzUGFyc2VbZF0udGVzdChhKSlyZXR1cm4gZDtpZihjJiZcImRkZFwiPT09YiYmdGhpcy5fc2hvcnRXZWVrZGF5c1BhcnNlW2RdLnRlc3QoYSkpcmV0dXJuIGQ7aWYoYyYmXCJkZFwiPT09YiYmdGhpcy5fbWluV2Vla2RheXNQYXJzZVtkXS50ZXN0KGEpKXJldHVybiBkO2lmKCFjJiZ0aGlzLl93ZWVrZGF5c1BhcnNlW2RdLnRlc3QoYSkpcmV0dXJuIGR9fVxuLy8gTU9NRU5UU1xuZnVuY3Rpb24gS2EoYSl7aWYoIXRoaXMuaXNWYWxpZCgpKXJldHVybiBudWxsIT1hP3RoaXM6TmFOO3ZhciBiPXRoaXMuX2lzVVRDP3RoaXMuX2QuZ2V0VVRDRGF5KCk6dGhpcy5fZC5nZXREYXkoKTtyZXR1cm4gbnVsbCE9YT8oYT1EYShhLHRoaXMubG9jYWxlRGF0YSgpKSx0aGlzLmFkZChhLWIsXCJkXCIpKTpifWZ1bmN0aW9uIExhKGEpe2lmKCF0aGlzLmlzVmFsaWQoKSlyZXR1cm4gbnVsbCE9YT90aGlzOk5hTjt2YXIgYj0odGhpcy5kYXkoKSs3LXRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRvdyklNztyZXR1cm4gbnVsbD09YT9iOnRoaXMuYWRkKGEtYixcImRcIil9ZnVuY3Rpb24gTWEoYSl7aWYoIXRoaXMuaXNWYWxpZCgpKXJldHVybiBudWxsIT1hP3RoaXM6TmFOO1xuLy8gYmVoYXZlcyB0aGUgc2FtZSBhcyBtb21lbnQjZGF5IGV4Y2VwdFxuLy8gYXMgYSBnZXR0ZXIsIHJldHVybnMgNyBpbnN0ZWFkIG9mIDAgKDEtNyByYW5nZSBpbnN0ZWFkIG9mIDAtNilcbi8vIGFzIGEgc2V0dGVyLCBzdW5kYXkgc2hvdWxkIGJlbG9uZyB0byB0aGUgcHJldmlvdXMgd2Vlay5cbmlmKG51bGwhPWEpe3ZhciBiPUVhKGEsdGhpcy5sb2NhbGVEYXRhKCkpO3JldHVybiB0aGlzLmRheSh0aGlzLmRheSgpJTc/YjpiLTcpfXJldHVybiB0aGlzLmRheSgpfHw3fWZ1bmN0aW9uIE5hKGEpe3JldHVybiB0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3Q/KGkodGhpcyxcIl93ZWVrZGF5c1JlZ2V4XCIpfHxRYS5jYWxsKHRoaXMpLGE/dGhpcy5fd2Vla2RheXNTdHJpY3RSZWdleDp0aGlzLl93ZWVrZGF5c1JlZ2V4KTooaSh0aGlzLFwiX3dlZWtkYXlzUmVnZXhcIil8fCh0aGlzLl93ZWVrZGF5c1JlZ2V4PXVlKSx0aGlzLl93ZWVrZGF5c1N0cmljdFJlZ2V4JiZhP3RoaXMuX3dlZWtkYXlzU3RyaWN0UmVnZXg6dGhpcy5fd2Vla2RheXNSZWdleCl9ZnVuY3Rpb24gT2EoYSl7cmV0dXJuIHRoaXMuX3dlZWtkYXlzUGFyc2VFeGFjdD8oaSh0aGlzLFwiX3dlZWtkYXlzUmVnZXhcIil8fFFhLmNhbGwodGhpcyksYT90aGlzLl93ZWVrZGF5c1Nob3J0U3RyaWN0UmVnZXg6dGhpcy5fd2Vla2RheXNTaG9ydFJlZ2V4KTooaSh0aGlzLFwiX3dlZWtkYXlzU2hvcnRSZWdleFwiKXx8KHRoaXMuX3dlZWtkYXlzU2hvcnRSZWdleD12ZSksdGhpcy5fd2Vla2RheXNTaG9ydFN0cmljdFJlZ2V4JiZhP3RoaXMuX3dlZWtkYXlzU2hvcnRTdHJpY3RSZWdleDp0aGlzLl93ZWVrZGF5c1Nob3J0UmVnZXgpfWZ1bmN0aW9uIFBhKGEpe3JldHVybiB0aGlzLl93ZWVrZGF5c1BhcnNlRXhhY3Q/KGkodGhpcyxcIl93ZWVrZGF5c1JlZ2V4XCIpfHxRYS5jYWxsKHRoaXMpLGE/dGhpcy5fd2Vla2RheXNNaW5TdHJpY3RSZWdleDp0aGlzLl93ZWVrZGF5c01pblJlZ2V4KTooaSh0aGlzLFwiX3dlZWtkYXlzTWluUmVnZXhcIil8fCh0aGlzLl93ZWVrZGF5c01pblJlZ2V4PXdlKSx0aGlzLl93ZWVrZGF5c01pblN0cmljdFJlZ2V4JiZhP3RoaXMuX3dlZWtkYXlzTWluU3RyaWN0UmVnZXg6dGhpcy5fd2Vla2RheXNNaW5SZWdleCl9ZnVuY3Rpb24gUWEoKXtmdW5jdGlvbiBhKGEsYil7cmV0dXJuIGIubGVuZ3RoLWEubGVuZ3RofXZhciBiLGMsZCxlLGYsZz1bXSxoPVtdLGk9W10saj1bXTtmb3IoYj0wO2I8NztiKyspXG4vLyBtYWtlIHRoZSByZWdleCBpZiB3ZSBkb24ndCBoYXZlIGl0IGFscmVhZHlcbmM9ayhbMmUzLDFdKS5kYXkoYiksZD10aGlzLndlZWtkYXlzTWluKGMsXCJcIiksZT10aGlzLndlZWtkYXlzU2hvcnQoYyxcIlwiKSxmPXRoaXMud2Vla2RheXMoYyxcIlwiKSxnLnB1c2goZCksaC5wdXNoKGUpLGkucHVzaChmKSxqLnB1c2goZCksai5wdXNoKGUpLGoucHVzaChmKTtmb3IoXG4vLyBTb3J0aW5nIG1ha2VzIHN1cmUgaWYgb25lIHdlZWtkYXkgKG9yIGFiYnIpIGlzIGEgcHJlZml4IG9mIGFub3RoZXIgaXRcbi8vIHdpbGwgbWF0Y2ggdGhlIGxvbmdlciBwaWVjZS5cbmcuc29ydChhKSxoLnNvcnQoYSksaS5zb3J0KGEpLGouc29ydChhKSxiPTA7Yjw3O2IrKyloW2JdPWFhKGhbYl0pLGlbYl09YWEoaVtiXSksaltiXT1hYShqW2JdKTt0aGlzLl93ZWVrZGF5c1JlZ2V4PW5ldyBSZWdFeHAoXCJeKFwiK2ouam9pbihcInxcIikrXCIpXCIsXCJpXCIpLHRoaXMuX3dlZWtkYXlzU2hvcnRSZWdleD10aGlzLl93ZWVrZGF5c1JlZ2V4LHRoaXMuX3dlZWtkYXlzTWluUmVnZXg9dGhpcy5fd2Vla2RheXNSZWdleCx0aGlzLl93ZWVrZGF5c1N0cmljdFJlZ2V4PW5ldyBSZWdFeHAoXCJeKFwiK2kuam9pbihcInxcIikrXCIpXCIsXCJpXCIpLHRoaXMuX3dlZWtkYXlzU2hvcnRTdHJpY3RSZWdleD1uZXcgUmVnRXhwKFwiXihcIitoLmpvaW4oXCJ8XCIpK1wiKVwiLFwiaVwiKSx0aGlzLl93ZWVrZGF5c01pblN0cmljdFJlZ2V4PW5ldyBSZWdFeHAoXCJeKFwiK2cuam9pbihcInxcIikrXCIpXCIsXCJpXCIpfVxuLy8gRk9STUFUVElOR1xuZnVuY3Rpb24gUmEoKXtyZXR1cm4gdGhpcy5ob3VycygpJTEyfHwxMn1mdW5jdGlvbiBTYSgpe3JldHVybiB0aGlzLmhvdXJzKCl8fDI0fWZ1bmN0aW9uIFRhKGEsYil7VShhLDAsMCxmdW5jdGlvbigpe3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tZXJpZGllbSh0aGlzLmhvdXJzKCksdGhpcy5taW51dGVzKCksYil9KX1cbi8vIFBBUlNJTkdcbmZ1bmN0aW9uIFVhKGEsYil7cmV0dXJuIGIuX21lcmlkaWVtUGFyc2V9XG4vLyBMT0NBTEVTXG5mdW5jdGlvbiBWYShhKXtcbi8vIElFOCBRdWlya3MgTW9kZSAmIElFNyBTdGFuZGFyZHMgTW9kZSBkbyBub3QgYWxsb3cgYWNjZXNzaW5nIHN0cmluZ3MgbGlrZSBhcnJheXNcbi8vIFVzaW5nIGNoYXJBdCBzaG91bGQgYmUgbW9yZSBjb21wYXRpYmxlLlxucmV0dXJuXCJwXCI9PT0oYStcIlwiKS50b0xvd2VyQ2FzZSgpLmNoYXJBdCgwKX1mdW5jdGlvbiBXYShhLGIsYyl7cmV0dXJuIGE+MTE/Yz9cInBtXCI6XCJQTVwiOmM/XCJhbVwiOlwiQU1cIn1mdW5jdGlvbiBYYShhKXtyZXR1cm4gYT9hLnRvTG93ZXJDYXNlKCkucmVwbGFjZShcIl9cIixcIi1cIik6YX1cbi8vIHBpY2sgdGhlIGxvY2FsZSBmcm9tIHRoZSBhcnJheVxuLy8gdHJ5IFsnZW4tYXUnLCAnZW4tZ2InXSBhcyAnZW4tYXUnLCAnZW4tZ2InLCAnZW4nLCBhcyBpbiBtb3ZlIHRocm91Z2ggdGhlIGxpc3QgdHJ5aW5nIGVhY2hcbi8vIHN1YnN0cmluZyBmcm9tIG1vc3Qgc3BlY2lmaWMgdG8gbGVhc3QsIGJ1dCBtb3ZlIHRvIHRoZSBuZXh0IGFycmF5IGl0ZW0gaWYgaXQncyBhIG1vcmUgc3BlY2lmaWMgdmFyaWFudCB0aGFuIHRoZSBjdXJyZW50IHJvb3RcbmZ1bmN0aW9uIFlhKGEpe2Zvcih2YXIgYixjLGQsZSxmPTA7ZjxhLmxlbmd0aDspe2ZvcihlPVhhKGFbZl0pLnNwbGl0KFwiLVwiKSxiPWUubGVuZ3RoLGM9WGEoYVtmKzFdKSxjPWM/Yy5zcGxpdChcIi1cIik6bnVsbDtiPjA7KXtpZihkPVphKGUuc2xpY2UoMCxiKS5qb2luKFwiLVwiKSkpcmV0dXJuIGQ7aWYoYyYmYy5sZW5ndGg+PWImJnYoZSxjLCEwKT49Yi0xKVxuLy90aGUgbmV4dCBhcnJheSBpdGVtIGlzIGJldHRlciB0aGFuIGEgc2hhbGxvd2VyIHN1YnN0cmluZyBvZiB0aGlzIG9uZVxuYnJlYWs7Yi0tfWYrK31yZXR1cm4gbnVsbH1mdW5jdGlvbiBaYShhKXt2YXIgYj1udWxsO1xuLy8gVE9ETzogRmluZCBhIGJldHRlciB3YXkgdG8gcmVnaXN0ZXIgYW5kIGxvYWQgYWxsIHRoZSBsb2NhbGVzIGluIE5vZGVcbmlmKCFCZVthXSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyl0cnl7Yj14ZS5fYWJicixyZXF1aXJlKFwiLi9sb2NhbGUvXCIrYSksXG4vLyBiZWNhdXNlIGRlZmluZUxvY2FsZSBjdXJyZW50bHkgYWxzbyBzZXRzIHRoZSBnbG9iYWwgbG9jYWxlLCB3ZVxuLy8gd2FudCB0byB1bmRvIHRoYXQgZm9yIGxhenkgbG9hZGVkIGxvY2FsZXNcbiRhKGIpfWNhdGNoKGEpe31yZXR1cm4gQmVbYV19XG4vLyBUaGlzIGZ1bmN0aW9uIHdpbGwgbG9hZCBsb2NhbGUgYW5kIHRoZW4gc2V0IHRoZSBnbG9iYWwgbG9jYWxlLiAgSWZcbi8vIG5vIGFyZ3VtZW50cyBhcmUgcGFzc2VkIGluLCBpdCB3aWxsIHNpbXBseSByZXR1cm4gdGhlIGN1cnJlbnQgZ2xvYmFsXG4vLyBsb2NhbGUga2V5LlxuZnVuY3Rpb24gJGEoYSxiKXt2YXIgYztcbi8vIG1vbWVudC5kdXJhdGlvbi5fbG9jYWxlID0gbW9tZW50Ll9sb2NhbGUgPSBkYXRhO1xucmV0dXJuIGEmJihjPXAoYik/YmIoYSk6X2EoYSxiKSxjJiYoeGU9YykpLHhlLl9hYmJyfWZ1bmN0aW9uIF9hKGEsYil7aWYobnVsbCE9PWIpe3ZhciBjPUFlO2lmKGIuYWJicj1hLG51bGwhPUJlW2FdKXkoXCJkZWZpbmVMb2NhbGVPdmVycmlkZVwiLFwidXNlIG1vbWVudC51cGRhdGVMb2NhbGUobG9jYWxlTmFtZSwgY29uZmlnKSB0byBjaGFuZ2UgYW4gZXhpc3RpbmcgbG9jYWxlLiBtb21lbnQuZGVmaW5lTG9jYWxlKGxvY2FsZU5hbWUsIGNvbmZpZykgc2hvdWxkIG9ubHkgYmUgdXNlZCBmb3IgY3JlYXRpbmcgYSBuZXcgbG9jYWxlIFNlZSBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL2RlZmluZS1sb2NhbGUvIGZvciBtb3JlIGluZm8uXCIpLGM9QmVbYV0uX2NvbmZpZztlbHNlIGlmKG51bGwhPWIucGFyZW50TG9jYWxlKXtpZihudWxsPT1CZVtiLnBhcmVudExvY2FsZV0pcmV0dXJuIENlW2IucGFyZW50TG9jYWxlXXx8KENlW2IucGFyZW50TG9jYWxlXT1bXSksQ2VbYi5wYXJlbnRMb2NhbGVdLnB1c2goe25hbWU6YSxjb25maWc6Yn0pLG51bGw7Yz1CZVtiLnBhcmVudExvY2FsZV0uX2NvbmZpZ31cbi8vIGJhY2t3YXJkcyBjb21wYXQgZm9yIG5vdzogYWxzbyBzZXQgdGhlIGxvY2FsZVxuLy8gbWFrZSBzdXJlIHdlIHNldCB0aGUgbG9jYWxlIEFGVEVSIGFsbCBjaGlsZCBsb2NhbGVzIGhhdmUgYmVlblxuLy8gY3JlYXRlZCwgc28gd2Ugd29uJ3QgZW5kIHVwIHdpdGggdGhlIGNoaWxkIGxvY2FsZSBzZXQuXG5yZXR1cm4gQmVbYV09bmV3IEMoQihjLGIpKSxDZVthXSYmQ2VbYV0uZm9yRWFjaChmdW5jdGlvbihhKXtfYShhLm5hbWUsYS5jb25maWcpfSksJGEoYSksQmVbYV19XG4vLyB1c2VmdWwgZm9yIHRlc3RpbmdcbnJldHVybiBkZWxldGUgQmVbYV0sbnVsbH1mdW5jdGlvbiBhYihhLGIpe2lmKG51bGwhPWIpe3ZhciBjLGQ9QWU7XG4vLyBNRVJHRVxubnVsbCE9QmVbYV0mJihkPUJlW2FdLl9jb25maWcpLGI9QihkLGIpLGM9bmV3IEMoYiksYy5wYXJlbnRMb2NhbGU9QmVbYV0sQmVbYV09Yyxcbi8vIGJhY2t3YXJkcyBjb21wYXQgZm9yIG5vdzogYWxzbyBzZXQgdGhlIGxvY2FsZVxuJGEoYSl9ZWxzZVxuLy8gcGFzcyBudWxsIGZvciBjb25maWcgdG8gdW51cGRhdGUsIHVzZWZ1bCBmb3IgdGVzdHNcbm51bGwhPUJlW2FdJiYobnVsbCE9QmVbYV0ucGFyZW50TG9jYWxlP0JlW2FdPUJlW2FdLnBhcmVudExvY2FsZTpudWxsIT1CZVthXSYmZGVsZXRlIEJlW2FdKTtyZXR1cm4gQmVbYV19XG4vLyByZXR1cm5zIGxvY2FsZSBkYXRhXG5mdW5jdGlvbiBiYihhKXt2YXIgYjtpZihhJiZhLl9sb2NhbGUmJmEuX2xvY2FsZS5fYWJiciYmKGE9YS5fbG9jYWxlLl9hYmJyKSwhYSlyZXR1cm4geGU7aWYoIWMoYSkpe2lmKFxuLy9zaG9ydC1jaXJjdWl0IGV2ZXJ5dGhpbmcgZWxzZVxuYj1aYShhKSlyZXR1cm4gYjthPVthXX1yZXR1cm4gWWEoYSl9ZnVuY3Rpb24gY2IoKXtyZXR1cm4gd2QoQmUpfWZ1bmN0aW9uIGRiKGEpe3ZhciBiLGM9YS5fYTtyZXR1cm4gYyYmbShhKS5vdmVyZmxvdz09PS0yJiYoYj1jW2JlXTwwfHxjW2JlXT4xMT9iZTpjW2NlXTwxfHxjW2NlXT5lYShjW2FlXSxjW2JlXSk/Y2U6Y1tkZV08MHx8Y1tkZV0+MjR8fDI0PT09Y1tkZV0mJigwIT09Y1tlZV18fDAhPT1jW2ZlXXx8MCE9PWNbZ2VdKT9kZTpjW2VlXTwwfHxjW2VlXT41OT9lZTpjW2ZlXTwwfHxjW2ZlXT41OT9mZTpjW2dlXTwwfHxjW2dlXT45OTk/Z2U6LTEsbShhKS5fb3ZlcmZsb3dEYXlPZlllYXImJihiPGFlfHxiPmNlKSYmKGI9Y2UpLG0oYSkuX292ZXJmbG93V2Vla3MmJmI9PT0tMSYmKGI9aGUpLG0oYSkuX292ZXJmbG93V2Vla2RheSYmYj09PS0xJiYoYj1pZSksbShhKS5vdmVyZmxvdz1iKSxhfVxuLy8gZGF0ZSBmcm9tIGlzbyBmb3JtYXRcbmZ1bmN0aW9uIGViKGEpe3ZhciBiLGMsZCxlLGYsZyxoPWEuX2ksaT1EZS5leGVjKGgpfHxFZS5leGVjKGgpO2lmKGkpe2ZvcihtKGEpLmlzbz0hMCxiPTAsYz1HZS5sZW5ndGg7YjxjO2IrKylpZihHZVtiXVsxXS5leGVjKGlbMV0pKXtlPUdlW2JdWzBdLGQ9R2VbYl1bMl0hPT0hMTticmVha31pZihudWxsPT1lKXJldHVybiB2b2lkKGEuX2lzVmFsaWQ9ITEpO2lmKGlbM10pe2ZvcihiPTAsYz1IZS5sZW5ndGg7YjxjO2IrKylpZihIZVtiXVsxXS5leGVjKGlbM10pKXtcbi8vIG1hdGNoWzJdIHNob3VsZCBiZSAnVCcgb3Igc3BhY2VcbmY9KGlbMl18fFwiIFwiKStIZVtiXVswXTticmVha31pZihudWxsPT1mKXJldHVybiB2b2lkKGEuX2lzVmFsaWQ9ITEpfWlmKCFkJiZudWxsIT1mKXJldHVybiB2b2lkKGEuX2lzVmFsaWQ9ITEpO2lmKGlbNF0pe2lmKCFGZS5leGVjKGlbNF0pKXJldHVybiB2b2lkKGEuX2lzVmFsaWQ9ITEpO2c9XCJaXCJ9YS5fZj1lKyhmfHxcIlwiKSsoZ3x8XCJcIiksa2IoYSl9ZWxzZSBhLl9pc1ZhbGlkPSExfVxuLy8gZGF0ZSBmcm9tIGlzbyBmb3JtYXQgb3IgZmFsbGJhY2tcbmZ1bmN0aW9uIGZiKGIpe3ZhciBjPUllLmV4ZWMoYi5faSk7cmV0dXJuIG51bGwhPT1jP3ZvaWQoYi5fZD1uZXcgRGF0ZSgrY1sxXSkpOihlYihiKSx2b2lkKGIuX2lzVmFsaWQ9PT0hMSYmKGRlbGV0ZSBiLl9pc1ZhbGlkLGEuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2soYikpKSl9XG4vLyBQaWNrIHRoZSBmaXJzdCBkZWZpbmVkIG9mIHR3byBvciB0aHJlZSBhcmd1bWVudHMuXG5mdW5jdGlvbiBnYihhLGIsYyl7cmV0dXJuIG51bGwhPWE/YTpudWxsIT1iP2I6Y31mdW5jdGlvbiBoYihiKXtcbi8vIGhvb2tzIGlzIGFjdHVhbGx5IHRoZSBleHBvcnRlZCBtb21lbnQgb2JqZWN0XG52YXIgYz1uZXcgRGF0ZShhLm5vdygpKTtyZXR1cm4gYi5fdXNlVVRDP1tjLmdldFVUQ0Z1bGxZZWFyKCksYy5nZXRVVENNb250aCgpLGMuZ2V0VVRDRGF0ZSgpXTpbYy5nZXRGdWxsWWVhcigpLGMuZ2V0TW9udGgoKSxjLmdldERhdGUoKV19XG4vLyBjb252ZXJ0IGFuIGFycmF5IHRvIGEgZGF0ZS5cbi8vIHRoZSBhcnJheSBzaG91bGQgbWlycm9yIHRoZSBwYXJhbWV0ZXJzIGJlbG93XG4vLyBub3RlOiBhbGwgdmFsdWVzIHBhc3QgdGhlIHllYXIgYXJlIG9wdGlvbmFsIGFuZCB3aWxsIGRlZmF1bHQgdG8gdGhlIGxvd2VzdCBwb3NzaWJsZSB2YWx1ZS5cbi8vIFt5ZWFyLCBtb250aCwgZGF5ICwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kXVxuZnVuY3Rpb24gaWIoYSl7dmFyIGIsYyxkLGUsZj1bXTtpZighYS5fZCl7XG4vLyBEZWZhdWx0IHRvIGN1cnJlbnQgZGF0ZS5cbi8vICogaWYgbm8geWVhciwgbW9udGgsIGRheSBvZiBtb250aCBhcmUgZ2l2ZW4sIGRlZmF1bHQgdG8gdG9kYXlcbi8vICogaWYgZGF5IG9mIG1vbnRoIGlzIGdpdmVuLCBkZWZhdWx0IG1vbnRoIGFuZCB5ZWFyXG4vLyAqIGlmIG1vbnRoIGlzIGdpdmVuLCBkZWZhdWx0IG9ubHkgeWVhclxuLy8gKiBpZiB5ZWFyIGlzIGdpdmVuLCBkb24ndCBkZWZhdWx0IGFueXRoaW5nXG5mb3IoZD1oYihhKSxcbi8vY29tcHV0ZSBkYXkgb2YgdGhlIHllYXIgZnJvbSB3ZWVrcyBhbmQgd2Vla2RheXNcbmEuX3cmJm51bGw9PWEuX2FbY2VdJiZudWxsPT1hLl9hW2JlXSYmamIoYSksXG4vL2lmIHRoZSBkYXkgb2YgdGhlIHllYXIgaXMgc2V0LCBmaWd1cmUgb3V0IHdoYXQgaXQgaXNcbmEuX2RheU9mWWVhciYmKGU9Z2IoYS5fYVthZV0sZFthZV0pLGEuX2RheU9mWWVhcj5wYShlKSYmKG0oYSkuX292ZXJmbG93RGF5T2ZZZWFyPSEwKSxjPXRhKGUsMCxhLl9kYXlPZlllYXIpLGEuX2FbYmVdPWMuZ2V0VVRDTW9udGgoKSxhLl9hW2NlXT1jLmdldFVUQ0RhdGUoKSksYj0wO2I8MyYmbnVsbD09YS5fYVtiXTsrK2IpYS5fYVtiXT1mW2JdPWRbYl07XG4vLyBaZXJvIG91dCB3aGF0ZXZlciB3YXMgbm90IGRlZmF1bHRlZCwgaW5jbHVkaW5nIHRpbWVcbmZvcig7Yjw3O2IrKylhLl9hW2JdPWZbYl09bnVsbD09YS5fYVtiXT8yPT09Yj8xOjA6YS5fYVtiXTtcbi8vIENoZWNrIGZvciAyNDowMDowMC4wMDBcbjI0PT09YS5fYVtkZV0mJjA9PT1hLl9hW2VlXSYmMD09PWEuX2FbZmVdJiYwPT09YS5fYVtnZV0mJihhLl9uZXh0RGF5PSEwLGEuX2FbZGVdPTApLGEuX2Q9KGEuX3VzZVVUQz90YTpzYSkuYXBwbHkobnVsbCxmKSxcbi8vIEFwcGx5IHRpbWV6b25lIG9mZnNldCBmcm9tIGlucHV0LiBUaGUgYWN0dWFsIHV0Y09mZnNldCBjYW4gYmUgY2hhbmdlZFxuLy8gd2l0aCBwYXJzZVpvbmUuXG5udWxsIT1hLl90em0mJmEuX2Quc2V0VVRDTWludXRlcyhhLl9kLmdldFVUQ01pbnV0ZXMoKS1hLl90em0pLGEuX25leHREYXkmJihhLl9hW2RlXT0yNCl9fWZ1bmN0aW9uIGpiKGEpe3ZhciBiLGMsZCxlLGYsZyxoLGk7aWYoYj1hLl93LG51bGwhPWIuR0d8fG51bGwhPWIuV3x8bnVsbCE9Yi5FKWY9MSxnPTQsXG4vLyBUT0RPOiBXZSBuZWVkIHRvIHRha2UgdGhlIGN1cnJlbnQgaXNvV2Vla1llYXIsIGJ1dCB0aGF0IGRlcGVuZHMgb25cbi8vIGhvdyB3ZSBpbnRlcnByZXQgbm93IChsb2NhbCwgdXRjLCBmaXhlZCBvZmZzZXQpLiBTbyBjcmVhdGVcbi8vIGEgbm93IHZlcnNpb24gb2YgY3VycmVudCBjb25maWcgKHRha2UgbG9jYWwvdXRjL29mZnNldCBmbGFncywgYW5kXG4vLyBjcmVhdGUgbm93KS5cbmM9Z2IoYi5HRyxhLl9hW2FlXSx3YShzYigpLDEsNCkueWVhciksZD1nYihiLlcsMSksZT1nYihiLkUsMSksKGU8MXx8ZT43KSYmKGk9ITApO2Vsc2V7Zj1hLl9sb2NhbGUuX3dlZWsuZG93LGc9YS5fbG9jYWxlLl93ZWVrLmRveTt2YXIgaj13YShzYigpLGYsZyk7Yz1nYihiLmdnLGEuX2FbYWVdLGoueWVhciksXG4vLyBEZWZhdWx0IHRvIGN1cnJlbnQgd2Vlay5cbmQ9Z2IoYi53LGoud2VlayksbnVsbCE9Yi5kPyhcbi8vIHdlZWtkYXkgLS0gbG93IGRheSBudW1iZXJzIGFyZSBjb25zaWRlcmVkIG5leHQgd2Vla1xuZT1iLmQsKGU8MHx8ZT42KSYmKGk9ITApKTpudWxsIT1iLmU/KFxuLy8gbG9jYWwgd2Vla2RheSAtLSBjb3VudGluZyBzdGFydHMgZnJvbSBiZWdpbmluZyBvZiB3ZWVrXG5lPWIuZStmLChiLmU8MHx8Yi5lPjYpJiYoaT0hMCkpOlxuLy8gZGVmYXVsdCB0byBiZWdpbmluZyBvZiB3ZWVrXG5lPWZ9ZDwxfHxkPnhhKGMsZixnKT9tKGEpLl9vdmVyZmxvd1dlZWtzPSEwOm51bGwhPWk/bShhKS5fb3ZlcmZsb3dXZWVrZGF5PSEwOihoPXZhKGMsZCxlLGYsZyksYS5fYVthZV09aC55ZWFyLGEuX2RheU9mWWVhcj1oLmRheU9mWWVhcil9XG4vLyBkYXRlIGZyb20gc3RyaW5nIGFuZCBmb3JtYXQgc3RyaW5nXG5mdW5jdGlvbiBrYihiKXtcbi8vIFRPRE86IE1vdmUgdGhpcyB0byBhbm90aGVyIHBhcnQgb2YgdGhlIGNyZWF0aW9uIGZsb3cgdG8gcHJldmVudCBjaXJjdWxhciBkZXBzXG5pZihiLl9mPT09YS5JU09fODYwMSlyZXR1cm4gdm9pZCBlYihiKTtiLl9hPVtdLG0oYikuZW1wdHk9ITA7XG4vLyBUaGlzIGFycmF5IGlzIHVzZWQgdG8gbWFrZSBhIERhdGUsIGVpdGhlciB3aXRoIGBuZXcgRGF0ZWAgb3IgYERhdGUuVVRDYFxudmFyIGMsZCxlLGYsZyxoPVwiXCIrYi5faSxpPWgubGVuZ3RoLGo9MDtmb3IoZT1ZKGIuX2YsYi5fbG9jYWxlKS5tYXRjaChGZCl8fFtdLGM9MDtjPGUubGVuZ3RoO2MrKylmPWVbY10sZD0oaC5tYXRjaCgkKGYsYikpfHxbXSlbMF0sXG4vLyBjb25zb2xlLmxvZygndG9rZW4nLCB0b2tlbiwgJ3BhcnNlZElucHV0JywgcGFyc2VkSW5wdXQsXG4vLyAgICAgICAgICdyZWdleCcsIGdldFBhcnNlUmVnZXhGb3JUb2tlbih0b2tlbiwgY29uZmlnKSk7XG5kJiYoZz1oLnN1YnN0cigwLGguaW5kZXhPZihkKSksZy5sZW5ndGg+MCYmbShiKS51bnVzZWRJbnB1dC5wdXNoKGcpLGg9aC5zbGljZShoLmluZGV4T2YoZCkrZC5sZW5ndGgpLGorPWQubGVuZ3RoKSxcbi8vIGRvbid0IHBhcnNlIGlmIGl0J3Mgbm90IGEga25vd24gdG9rZW5cbklkW2ZdPyhkP20oYikuZW1wdHk9ITE6bShiKS51bnVzZWRUb2tlbnMucHVzaChmKSxkYShmLGQsYikpOmIuX3N0cmljdCYmIWQmJm0oYikudW51c2VkVG9rZW5zLnB1c2goZik7XG4vLyBhZGQgcmVtYWluaW5nIHVucGFyc2VkIGlucHV0IGxlbmd0aCB0byB0aGUgc3RyaW5nXG5tKGIpLmNoYXJzTGVmdE92ZXI9aS1qLGgubGVuZ3RoPjAmJm0oYikudW51c2VkSW5wdXQucHVzaChoKSxcbi8vIGNsZWFyIF8xMmggZmxhZyBpZiBob3VyIGlzIDw9IDEyXG5iLl9hW2RlXTw9MTImJm0oYikuYmlnSG91cj09PSEwJiZiLl9hW2RlXT4wJiYobShiKS5iaWdIb3VyPXZvaWQgMCksbShiKS5wYXJzZWREYXRlUGFydHM9Yi5fYS5zbGljZSgwKSxtKGIpLm1lcmlkaWVtPWIuX21lcmlkaWVtLFxuLy8gaGFuZGxlIG1lcmlkaWVtXG5iLl9hW2RlXT1sYihiLl9sb2NhbGUsYi5fYVtkZV0sYi5fbWVyaWRpZW0pLGliKGIpLGRiKGIpfWZ1bmN0aW9uIGxiKGEsYixjKXt2YXIgZDtcbi8vIEZhbGxiYWNrXG5yZXR1cm4gbnVsbD09Yz9iOm51bGwhPWEubWVyaWRpZW1Ib3VyP2EubWVyaWRpZW1Ib3VyKGIsYyk6bnVsbCE9YS5pc1BNPyhkPWEuaXNQTShjKSxkJiZiPDEyJiYoYis9MTIpLGR8fDEyIT09Ynx8KGI9MCksYik6Yn1cbi8vIGRhdGUgZnJvbSBzdHJpbmcgYW5kIGFycmF5IG9mIGZvcm1hdCBzdHJpbmdzXG5mdW5jdGlvbiBtYihhKXt2YXIgYixjLGQsZSxmO2lmKDA9PT1hLl9mLmxlbmd0aClyZXR1cm4gbShhKS5pbnZhbGlkRm9ybWF0PSEwLHZvaWQoYS5fZD1uZXcgRGF0ZShOYU4pKTtmb3IoZT0wO2U8YS5fZi5sZW5ndGg7ZSsrKWY9MCxiPXEoe30sYSksbnVsbCE9YS5fdXNlVVRDJiYoYi5fdXNlVVRDPWEuX3VzZVVUQyksYi5fZj1hLl9mW2VdLGtiKGIpLG4oYikmJihcbi8vIGlmIHRoZXJlIGlzIGFueSBpbnB1dCB0aGF0IHdhcyBub3QgcGFyc2VkIGFkZCBhIHBlbmFsdHkgZm9yIHRoYXQgZm9ybWF0XG5mKz1tKGIpLmNoYXJzTGVmdE92ZXIsXG4vL29yIHRva2Vuc1xuZis9MTAqbShiKS51bnVzZWRUb2tlbnMubGVuZ3RoLG0oYikuc2NvcmU9ZiwobnVsbD09ZHx8ZjxkKSYmKGQ9ZixjPWIpKTtqKGEsY3x8Yil9ZnVuY3Rpb24gbmIoYSl7aWYoIWEuX2Qpe3ZhciBiPUwoYS5faSk7YS5fYT1oKFtiLnllYXIsYi5tb250aCxiLmRheXx8Yi5kYXRlLGIuaG91cixiLm1pbnV0ZSxiLnNlY29uZCxiLm1pbGxpc2Vjb25kXSxmdW5jdGlvbihhKXtyZXR1cm4gYSYmcGFyc2VJbnQoYSwxMCl9KSxpYihhKX19ZnVuY3Rpb24gb2IoYSl7dmFyIGI9bmV3IHIoZGIocGIoYSkpKTtcbi8vIEFkZGluZyBpcyBzbWFydCBlbm91Z2ggYXJvdW5kIERTVFxucmV0dXJuIGIuX25leHREYXkmJihiLmFkZCgxLFwiZFwiKSxiLl9uZXh0RGF5PXZvaWQgMCksYn1mdW5jdGlvbiBwYihhKXt2YXIgYj1hLl9pLGQ9YS5fZjtyZXR1cm4gYS5fbG9jYWxlPWEuX2xvY2FsZXx8YmIoYS5fbCksbnVsbD09PWJ8fHZvaWQgMD09PWQmJlwiXCI9PT1iP28oe251bGxJbnB1dDohMH0pOihcInN0cmluZ1wiPT10eXBlb2YgYiYmKGEuX2k9Yj1hLl9sb2NhbGUucHJlcGFyc2UoYikpLHMoYik/bmV3IHIoZGIoYikpOihnKGIpP2EuX2Q9YjpjKGQpP21iKGEpOmQ/a2IoYSk6cWIoYSksbihhKXx8KGEuX2Q9bnVsbCksYSkpfWZ1bmN0aW9uIHFiKGIpe3ZhciBkPWIuX2k7dm9pZCAwPT09ZD9iLl9kPW5ldyBEYXRlKGEubm93KCkpOmcoZCk/Yi5fZD1uZXcgRGF0ZShkLnZhbHVlT2YoKSk6XCJzdHJpbmdcIj09dHlwZW9mIGQ/ZmIoYik6YyhkKT8oYi5fYT1oKGQuc2xpY2UoMCksZnVuY3Rpb24oYSl7cmV0dXJuIHBhcnNlSW50KGEsMTApfSksaWIoYikpOlwib2JqZWN0XCI9PXR5cGVvZiBkP25iKGIpOmYoZCk/XG4vLyBmcm9tIG1pbGxpc2Vjb25kc1xuYi5fZD1uZXcgRGF0ZShkKTphLmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrKGIpfWZ1bmN0aW9uIHJiKGEsYixmLGcsaCl7dmFyIGk9e307XG4vLyBvYmplY3QgY29uc3RydWN0aW9uIG11c3QgYmUgZG9uZSB0aGlzIHdheS5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8xNDIzXG5yZXR1cm4gZiE9PSEwJiZmIT09ITF8fChnPWYsZj12b2lkIDApLChkKGEpJiZlKGEpfHxjKGEpJiYwPT09YS5sZW5ndGgpJiYoYT12b2lkIDApLGkuX2lzQU1vbWVudE9iamVjdD0hMCxpLl91c2VVVEM9aS5faXNVVEM9aCxpLl9sPWYsaS5faT1hLGkuX2Y9YixpLl9zdHJpY3Q9ZyxvYihpKX1mdW5jdGlvbiBzYihhLGIsYyxkKXtyZXR1cm4gcmIoYSxiLGMsZCwhMSl9XG4vLyBQaWNrIGEgbW9tZW50IG0gZnJvbSBtb21lbnRzIHNvIHRoYXQgbVtmbl0ob3RoZXIpIGlzIHRydWUgZm9yIGFsbFxuLy8gb3RoZXIuIFRoaXMgcmVsaWVzIG9uIHRoZSBmdW5jdGlvbiBmbiB0byBiZSB0cmFuc2l0aXZlLlxuLy9cbi8vIG1vbWVudHMgc2hvdWxkIGVpdGhlciBiZSBhbiBhcnJheSBvZiBtb21lbnQgb2JqZWN0cyBvciBhbiBhcnJheSwgd2hvc2Vcbi8vIGZpcnN0IGVsZW1lbnQgaXMgYW4gYXJyYXkgb2YgbW9tZW50IG9iamVjdHMuXG5mdW5jdGlvbiB0YihhLGIpe3ZhciBkLGU7aWYoMT09PWIubGVuZ3RoJiZjKGJbMF0pJiYoYj1iWzBdKSwhYi5sZW5ndGgpcmV0dXJuIHNiKCk7Zm9yKGQ9YlswXSxlPTE7ZTxiLmxlbmd0aDsrK2UpYltlXS5pc1ZhbGlkKCkmJiFiW2VdW2FdKGQpfHwoZD1iW2VdKTtyZXR1cm4gZH1cbi8vIFRPRE86IFVzZSBbXS5zb3J0IGluc3RlYWQ/XG5mdW5jdGlvbiB1Yigpe3ZhciBhPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLDApO3JldHVybiB0YihcImlzQmVmb3JlXCIsYSl9ZnVuY3Rpb24gdmIoKXt2YXIgYT1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cywwKTtyZXR1cm4gdGIoXCJpc0FmdGVyXCIsYSl9ZnVuY3Rpb24gd2IoYSl7dmFyIGI9TChhKSxjPWIueWVhcnx8MCxkPWIucXVhcnRlcnx8MCxlPWIubW9udGh8fDAsZj1iLndlZWt8fDAsZz1iLmRheXx8MCxoPWIuaG91cnx8MCxpPWIubWludXRlfHwwLGo9Yi5zZWNvbmR8fDAsaz1iLm1pbGxpc2Vjb25kfHwwO1xuLy8gcmVwcmVzZW50YXRpb24gZm9yIGRhdGVBZGRSZW1vdmVcbnRoaXMuX21pbGxpc2Vjb25kcz0raysxZTMqaisvLyAxMDAwXG42ZTQqaSsvLyAxMDAwICogNjBcbjFlMypoKjYwKjYwLC8vdXNpbmcgMTAwMCAqIDYwICogNjAgaW5zdGVhZCBvZiAzNmU1IHRvIGF2b2lkIGZsb2F0aW5nIHBvaW50IHJvdW5kaW5nIGVycm9ycyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMjk3OFxuLy8gQmVjYXVzZSBvZiBkYXRlQWRkUmVtb3ZlIHRyZWF0cyAyNCBob3VycyBhcyBkaWZmZXJlbnQgZnJvbSBhXG4vLyBkYXkgd2hlbiB3b3JraW5nIGFyb3VuZCBEU1QsIHdlIG5lZWQgdG8gc3RvcmUgdGhlbSBzZXBhcmF0ZWx5XG50aGlzLl9kYXlzPStnKzcqZixcbi8vIEl0IGlzIGltcG9zc2libGUgdHJhbnNsYXRlIG1vbnRocyBpbnRvIGRheXMgd2l0aG91dCBrbm93aW5nXG4vLyB3aGljaCBtb250aHMgeW91IGFyZSBhcmUgdGFsa2luZyBhYm91dCwgc28gd2UgaGF2ZSB0byBzdG9yZVxuLy8gaXQgc2VwYXJhdGVseS5cbnRoaXMuX21vbnRocz0rZSszKmQrMTIqYyx0aGlzLl9kYXRhPXt9LHRoaXMuX2xvY2FsZT1iYigpLHRoaXMuX2J1YmJsZSgpfWZ1bmN0aW9uIHhiKGEpe3JldHVybiBhIGluc3RhbmNlb2Ygd2J9ZnVuY3Rpb24geWIoYSl7cmV0dXJuIGE8MD9NYXRoLnJvdW5kKC0xKmEpKi0xOk1hdGgucm91bmQoYSl9XG4vLyBGT1JNQVRUSU5HXG5mdW5jdGlvbiB6YihhLGIpe1UoYSwwLDAsZnVuY3Rpb24oKXt2YXIgYT10aGlzLnV0Y09mZnNldCgpLGM9XCIrXCI7cmV0dXJuIGE8MCYmKGE9LWEsYz1cIi1cIiksYytUKH5+KGEvNjApLDIpK2IrVCh+fmElNjAsMil9KX1mdW5jdGlvbiBBYihhLGIpe3ZhciBjPShifHxcIlwiKS5tYXRjaChhKTtpZihudWxsPT09YylyZXR1cm4gbnVsbDt2YXIgZD1jW2MubGVuZ3RoLTFdfHxbXSxlPShkK1wiXCIpLm1hdGNoKE1lKXx8W1wiLVwiLDAsMF0sZj0rKDYwKmVbMV0pK3UoZVsyXSk7cmV0dXJuIDA9PT1mPzA6XCIrXCI9PT1lWzBdP2Y6LWZ9XG4vLyBSZXR1cm4gYSBtb21lbnQgZnJvbSBpbnB1dCwgdGhhdCBpcyBsb2NhbC91dGMvem9uZSBlcXVpdmFsZW50IHRvIG1vZGVsLlxuZnVuY3Rpb24gQmIoYixjKXt2YXIgZCxlO1xuLy8gVXNlIGxvdy1sZXZlbCBhcGksIGJlY2F1c2UgdGhpcyBmbiBpcyBsb3ctbGV2ZWwgYXBpLlxucmV0dXJuIGMuX2lzVVRDPyhkPWMuY2xvbmUoKSxlPShzKGIpfHxnKGIpP2IudmFsdWVPZigpOnNiKGIpLnZhbHVlT2YoKSktZC52YWx1ZU9mKCksZC5fZC5zZXRUaW1lKGQuX2QudmFsdWVPZigpK2UpLGEudXBkYXRlT2Zmc2V0KGQsITEpLGQpOnNiKGIpLmxvY2FsKCl9ZnVuY3Rpb24gQ2IoYSl7XG4vLyBPbiBGaXJlZm94LjI0IERhdGUjZ2V0VGltZXpvbmVPZmZzZXQgcmV0dXJucyBhIGZsb2F0aW5nIHBvaW50LlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvcHVsbC8xODcxXG5yZXR1cm4gMTUqLU1hdGgucm91bmQoYS5fZC5nZXRUaW1lem9uZU9mZnNldCgpLzE1KX1cbi8vIE1PTUVOVFNcbi8vIGtlZXBMb2NhbFRpbWUgPSB0cnVlIG1lYW5zIG9ubHkgY2hhbmdlIHRoZSB0aW1lem9uZSwgd2l0aG91dFxuLy8gYWZmZWN0aW5nIHRoZSBsb2NhbCBob3VyLiBTbyA1OjMxOjI2ICswMzAwIC0tW3V0Y09mZnNldCgyLCB0cnVlKV0tLT5cbi8vIDU6MzE6MjYgKzAyMDAgSXQgaXMgcG9zc2libGUgdGhhdCA1OjMxOjI2IGRvZXNuJ3QgZXhpc3Qgd2l0aCBvZmZzZXRcbi8vICswMjAwLCBzbyB3ZSBhZGp1c3QgdGhlIHRpbWUgYXMgbmVlZGVkLCB0byBiZSB2YWxpZC5cbi8vXG4vLyBLZWVwaW5nIHRoZSB0aW1lIGFjdHVhbGx5IGFkZHMvc3VidHJhY3RzIChvbmUgaG91cilcbi8vIGZyb20gdGhlIGFjdHVhbCByZXByZXNlbnRlZCB0aW1lLiBUaGF0IGlzIHdoeSB3ZSBjYWxsIHVwZGF0ZU9mZnNldFxuLy8gYSBzZWNvbmQgdGltZS4gSW4gY2FzZSBpdCB3YW50cyB1cyB0byBjaGFuZ2UgdGhlIG9mZnNldCBhZ2FpblxuLy8gX2NoYW5nZUluUHJvZ3Jlc3MgPT0gdHJ1ZSBjYXNlLCB0aGVuIHdlIGhhdmUgdG8gYWRqdXN0LCBiZWNhdXNlXG4vLyB0aGVyZSBpcyBubyBzdWNoIHRpbWUgaW4gdGhlIGdpdmVuIHRpbWV6b25lLlxuZnVuY3Rpb24gRGIoYixjKXt2YXIgZCxlPXRoaXMuX29mZnNldHx8MDtpZighdGhpcy5pc1ZhbGlkKCkpcmV0dXJuIG51bGwhPWI/dGhpczpOYU47aWYobnVsbCE9Yil7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGIpe2lmKGI9QWIoWGQsYiksbnVsbD09PWIpcmV0dXJuIHRoaXN9ZWxzZSBNYXRoLmFicyhiKTwxNiYmKGI9NjAqYik7cmV0dXJuIXRoaXMuX2lzVVRDJiZjJiYoZD1DYih0aGlzKSksdGhpcy5fb2Zmc2V0PWIsdGhpcy5faXNVVEM9ITAsbnVsbCE9ZCYmdGhpcy5hZGQoZCxcIm1cIiksZSE9PWImJighY3x8dGhpcy5fY2hhbmdlSW5Qcm9ncmVzcz9UYih0aGlzLE9iKGItZSxcIm1cIiksMSwhMSk6dGhpcy5fY2hhbmdlSW5Qcm9ncmVzc3x8KHRoaXMuX2NoYW5nZUluUHJvZ3Jlc3M9ITAsYS51cGRhdGVPZmZzZXQodGhpcywhMCksdGhpcy5fY2hhbmdlSW5Qcm9ncmVzcz1udWxsKSksdGhpc31yZXR1cm4gdGhpcy5faXNVVEM/ZTpDYih0aGlzKX1mdW5jdGlvbiBFYihhLGIpe3JldHVybiBudWxsIT1hPyhcInN0cmluZ1wiIT10eXBlb2YgYSYmKGE9LWEpLHRoaXMudXRjT2Zmc2V0KGEsYiksdGhpcyk6LXRoaXMudXRjT2Zmc2V0KCl9ZnVuY3Rpb24gRmIoYSl7cmV0dXJuIHRoaXMudXRjT2Zmc2V0KDAsYSl9ZnVuY3Rpb24gR2IoYSl7cmV0dXJuIHRoaXMuX2lzVVRDJiYodGhpcy51dGNPZmZzZXQoMCxhKSx0aGlzLl9pc1VUQz0hMSxhJiZ0aGlzLnN1YnRyYWN0KENiKHRoaXMpLFwibVwiKSksdGhpc31mdW5jdGlvbiBIYigpe2lmKG51bGwhPXRoaXMuX3R6bSl0aGlzLnV0Y09mZnNldCh0aGlzLl90em0pO2Vsc2UgaWYoXCJzdHJpbmdcIj09dHlwZW9mIHRoaXMuX2kpe3ZhciBhPUFiKFdkLHRoaXMuX2kpO251bGwhPWE/dGhpcy51dGNPZmZzZXQoYSk6dGhpcy51dGNPZmZzZXQoMCwhMCl9cmV0dXJuIHRoaXN9ZnVuY3Rpb24gSWIoYSl7cmV0dXJuISF0aGlzLmlzVmFsaWQoKSYmKGE9YT9zYihhKS51dGNPZmZzZXQoKTowLCh0aGlzLnV0Y09mZnNldCgpLWEpJTYwPT09MCl9ZnVuY3Rpb24gSmIoKXtyZXR1cm4gdGhpcy51dGNPZmZzZXQoKT50aGlzLmNsb25lKCkubW9udGgoMCkudXRjT2Zmc2V0KCl8fHRoaXMudXRjT2Zmc2V0KCk+dGhpcy5jbG9uZSgpLm1vbnRoKDUpLnV0Y09mZnNldCgpfWZ1bmN0aW9uIEtiKCl7aWYoIXAodGhpcy5faXNEU1RTaGlmdGVkKSlyZXR1cm4gdGhpcy5faXNEU1RTaGlmdGVkO3ZhciBhPXt9O2lmKHEoYSx0aGlzKSxhPXBiKGEpLGEuX2Epe3ZhciBiPWEuX2lzVVRDP2soYS5fYSk6c2IoYS5fYSk7dGhpcy5faXNEU1RTaGlmdGVkPXRoaXMuaXNWYWxpZCgpJiZ2KGEuX2EsYi50b0FycmF5KCkpPjB9ZWxzZSB0aGlzLl9pc0RTVFNoaWZ0ZWQ9ITE7cmV0dXJuIHRoaXMuX2lzRFNUU2hpZnRlZH1mdW5jdGlvbiBMYigpe3JldHVybiEhdGhpcy5pc1ZhbGlkKCkmJiF0aGlzLl9pc1VUQ31mdW5jdGlvbiBNYigpe3JldHVybiEhdGhpcy5pc1ZhbGlkKCkmJnRoaXMuX2lzVVRDfWZ1bmN0aW9uIE5iKCl7cmV0dXJuISF0aGlzLmlzVmFsaWQoKSYmKHRoaXMuX2lzVVRDJiYwPT09dGhpcy5fb2Zmc2V0KX1mdW5jdGlvbiBPYihhLGIpe3ZhciBjLGQsZSxnPWEsXG4vLyBtYXRjaGluZyBhZ2FpbnN0IHJlZ2V4cCBpcyBleHBlbnNpdmUsIGRvIGl0IG9uIGRlbWFuZFxuaD1udWxsOy8vIGNoZWNrcyBmb3IgbnVsbCBvciB1bmRlZmluZWRcbnJldHVybiB4YihhKT9nPXttczphLl9taWxsaXNlY29uZHMsZDphLl9kYXlzLE06YS5fbW9udGhzfTpmKGEpPyhnPXt9LGI/Z1tiXT1hOmcubWlsbGlzZWNvbmRzPWEpOihoPU5lLmV4ZWMoYSkpPyhjPVwiLVwiPT09aFsxXT8tMToxLGc9e3k6MCxkOnUoaFtjZV0pKmMsaDp1KGhbZGVdKSpjLG06dShoW2VlXSkqYyxzOnUoaFtmZV0pKmMsbXM6dSh5YigxZTMqaFtnZV0pKSpjfSk6KGg9T2UuZXhlYyhhKSk/KGM9XCItXCI9PT1oWzFdPy0xOjEsZz17eTpQYihoWzJdLGMpLE06UGIoaFszXSxjKSx3OlBiKGhbNF0sYyksZDpQYihoWzVdLGMpLGg6UGIoaFs2XSxjKSxtOlBiKGhbN10sYyksczpQYihoWzhdLGMpfSk6bnVsbD09Zz9nPXt9Olwib2JqZWN0XCI9PXR5cGVvZiBnJiYoXCJmcm9tXCJpbiBnfHxcInRvXCJpbiBnKSYmKGU9UmIoc2IoZy5mcm9tKSxzYihnLnRvKSksZz17fSxnLm1zPWUubWlsbGlzZWNvbmRzLGcuTT1lLm1vbnRocyksZD1uZXcgd2IoZykseGIoYSkmJmkoYSxcIl9sb2NhbGVcIikmJihkLl9sb2NhbGU9YS5fbG9jYWxlKSxkfWZ1bmN0aW9uIFBiKGEsYil7XG4vLyBXZSdkIG5vcm1hbGx5IHVzZSB+fmlucCBmb3IgdGhpcywgYnV0IHVuZm9ydHVuYXRlbHkgaXQgYWxzb1xuLy8gY29udmVydHMgZmxvYXRzIHRvIGludHMuXG4vLyBpbnAgbWF5IGJlIHVuZGVmaW5lZCwgc28gY2FyZWZ1bCBjYWxsaW5nIHJlcGxhY2Ugb24gaXQuXG52YXIgYz1hJiZwYXJzZUZsb2F0KGEucmVwbGFjZShcIixcIixcIi5cIikpO1xuLy8gYXBwbHkgc2lnbiB3aGlsZSB3ZSdyZSBhdCBpdFxucmV0dXJuKGlzTmFOKGMpPzA6YykqYn1mdW5jdGlvbiBRYihhLGIpe3ZhciBjPXttaWxsaXNlY29uZHM6MCxtb250aHM6MH07cmV0dXJuIGMubW9udGhzPWIubW9udGgoKS1hLm1vbnRoKCkrMTIqKGIueWVhcigpLWEueWVhcigpKSxhLmNsb25lKCkuYWRkKGMubW9udGhzLFwiTVwiKS5pc0FmdGVyKGIpJiYtLWMubW9udGhzLGMubWlsbGlzZWNvbmRzPStiLSthLmNsb25lKCkuYWRkKGMubW9udGhzLFwiTVwiKSxjfWZ1bmN0aW9uIFJiKGEsYil7dmFyIGM7cmV0dXJuIGEuaXNWYWxpZCgpJiZiLmlzVmFsaWQoKT8oYj1CYihiLGEpLGEuaXNCZWZvcmUoYik/Yz1RYihhLGIpOihjPVFiKGIsYSksYy5taWxsaXNlY29uZHM9LWMubWlsbGlzZWNvbmRzLGMubW9udGhzPS1jLm1vbnRocyksYyk6e21pbGxpc2Vjb25kczowLG1vbnRoczowfX1cbi8vIFRPRE86IHJlbW92ZSAnbmFtZScgYXJnIGFmdGVyIGRlcHJlY2F0aW9uIGlzIHJlbW92ZWRcbmZ1bmN0aW9uIFNiKGEsYil7cmV0dXJuIGZ1bmN0aW9uKGMsZCl7dmFyIGUsZjtcbi8vaW52ZXJ0IHRoZSBhcmd1bWVudHMsIGJ1dCBjb21wbGFpbiBhYm91dCBpdFxucmV0dXJuIG51bGw9PT1kfHxpc05hTigrZCl8fCh5KGIsXCJtb21lbnQoKS5cIitiK1wiKHBlcmlvZCwgbnVtYmVyKSBpcyBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIG1vbWVudCgpLlwiK2IrXCIobnVtYmVyLCBwZXJpb2QpLiBTZWUgaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9hZGQtaW52ZXJ0ZWQtcGFyYW0vIGZvciBtb3JlIGluZm8uXCIpLGY9YyxjPWQsZD1mKSxjPVwic3RyaW5nXCI9PXR5cGVvZiBjPytjOmMsZT1PYihjLGQpLFRiKHRoaXMsZSxhKSx0aGlzfX1mdW5jdGlvbiBUYihiLGMsZCxlKXt2YXIgZj1jLl9taWxsaXNlY29uZHMsZz15YihjLl9kYXlzKSxoPXliKGMuX21vbnRocyk7Yi5pc1ZhbGlkKCkmJihlPW51bGw9PWV8fGUsZiYmYi5fZC5zZXRUaW1lKGIuX2QudmFsdWVPZigpK2YqZCksZyYmUShiLFwiRGF0ZVwiLFAoYixcIkRhdGVcIikrZypkKSxoJiZqYShiLFAoYixcIk1vbnRoXCIpK2gqZCksZSYmYS51cGRhdGVPZmZzZXQoYixnfHxoKSl9ZnVuY3Rpb24gVWIoYSxiKXt2YXIgYz1hLmRpZmYoYixcImRheXNcIiwhMCk7cmV0dXJuIGM8LTY/XCJzYW1lRWxzZVwiOmM8LTE/XCJsYXN0V2Vla1wiOmM8MD9cImxhc3REYXlcIjpjPDE/XCJzYW1lRGF5XCI6YzwyP1wibmV4dERheVwiOmM8Nz9cIm5leHRXZWVrXCI6XCJzYW1lRWxzZVwifWZ1bmN0aW9uIFZiKGIsYyl7XG4vLyBXZSB3YW50IHRvIGNvbXBhcmUgdGhlIHN0YXJ0IG9mIHRvZGF5LCB2cyB0aGlzLlxuLy8gR2V0dGluZyBzdGFydC1vZi10b2RheSBkZXBlbmRzIG9uIHdoZXRoZXIgd2UncmUgbG9jYWwvdXRjL29mZnNldCBvciBub3QuXG52YXIgZD1ifHxzYigpLGU9QmIoZCx0aGlzKS5zdGFydE9mKFwiZGF5XCIpLGY9YS5jYWxlbmRhckZvcm1hdCh0aGlzLGUpfHxcInNhbWVFbHNlXCIsZz1jJiYoeihjW2ZdKT9jW2ZdLmNhbGwodGhpcyxkKTpjW2ZdKTtyZXR1cm4gdGhpcy5mb3JtYXQoZ3x8dGhpcy5sb2NhbGVEYXRhKCkuY2FsZW5kYXIoZix0aGlzLHNiKGQpKSl9ZnVuY3Rpb24gV2IoKXtyZXR1cm4gbmV3IHIodGhpcyl9ZnVuY3Rpb24gWGIoYSxiKXt2YXIgYz1zKGEpP2E6c2IoYSk7cmV0dXJuISghdGhpcy5pc1ZhbGlkKCl8fCFjLmlzVmFsaWQoKSkmJihiPUsocChiKT9cIm1pbGxpc2Vjb25kXCI6YiksXCJtaWxsaXNlY29uZFwiPT09Yj90aGlzLnZhbHVlT2YoKT5jLnZhbHVlT2YoKTpjLnZhbHVlT2YoKTx0aGlzLmNsb25lKCkuc3RhcnRPZihiKS52YWx1ZU9mKCkpfWZ1bmN0aW9uIFliKGEsYil7dmFyIGM9cyhhKT9hOnNiKGEpO3JldHVybiEoIXRoaXMuaXNWYWxpZCgpfHwhYy5pc1ZhbGlkKCkpJiYoYj1LKHAoYik/XCJtaWxsaXNlY29uZFwiOmIpLFwibWlsbGlzZWNvbmRcIj09PWI/dGhpcy52YWx1ZU9mKCk8Yy52YWx1ZU9mKCk6dGhpcy5jbG9uZSgpLmVuZE9mKGIpLnZhbHVlT2YoKTxjLnZhbHVlT2YoKSl9ZnVuY3Rpb24gWmIoYSxiLGMsZCl7cmV0dXJuIGQ9ZHx8XCIoKVwiLChcIihcIj09PWRbMF0/dGhpcy5pc0FmdGVyKGEsYyk6IXRoaXMuaXNCZWZvcmUoYSxjKSkmJihcIilcIj09PWRbMV0/dGhpcy5pc0JlZm9yZShiLGMpOiF0aGlzLmlzQWZ0ZXIoYixjKSl9ZnVuY3Rpb24gJGIoYSxiKXt2YXIgYyxkPXMoYSk/YTpzYihhKTtyZXR1cm4hKCF0aGlzLmlzVmFsaWQoKXx8IWQuaXNWYWxpZCgpKSYmKGI9SyhifHxcIm1pbGxpc2Vjb25kXCIpLFwibWlsbGlzZWNvbmRcIj09PWI/dGhpcy52YWx1ZU9mKCk9PT1kLnZhbHVlT2YoKTooYz1kLnZhbHVlT2YoKSx0aGlzLmNsb25lKCkuc3RhcnRPZihiKS52YWx1ZU9mKCk8PWMmJmM8PXRoaXMuY2xvbmUoKS5lbmRPZihiKS52YWx1ZU9mKCkpKX1mdW5jdGlvbiBfYihhLGIpe3JldHVybiB0aGlzLmlzU2FtZShhLGIpfHx0aGlzLmlzQWZ0ZXIoYSxiKX1mdW5jdGlvbiBhYyhhLGIpe3JldHVybiB0aGlzLmlzU2FtZShhLGIpfHx0aGlzLmlzQmVmb3JlKGEsYil9ZnVuY3Rpb24gYmMoYSxiLGMpe3ZhciBkLGUsZixnOy8vIDEwMDBcbi8vIDEwMDAgKiA2MFxuLy8gMTAwMCAqIDYwICogNjBcbi8vIDEwMDAgKiA2MCAqIDYwICogMjQsIG5lZ2F0ZSBkc3Rcbi8vIDEwMDAgKiA2MCAqIDYwICogMjQgKiA3LCBuZWdhdGUgZHN0XG5yZXR1cm4gdGhpcy5pc1ZhbGlkKCk/KGQ9QmIoYSx0aGlzKSxkLmlzVmFsaWQoKT8oZT02ZTQqKGQudXRjT2Zmc2V0KCktdGhpcy51dGNPZmZzZXQoKSksYj1LKGIpLFwieWVhclwiPT09Ynx8XCJtb250aFwiPT09Ynx8XCJxdWFydGVyXCI9PT1iPyhnPWNjKHRoaXMsZCksXCJxdWFydGVyXCI9PT1iP2cvPTM6XCJ5ZWFyXCI9PT1iJiYoZy89MTIpKTooZj10aGlzLWQsZz1cInNlY29uZFwiPT09Yj9mLzFlMzpcIm1pbnV0ZVwiPT09Yj9mLzZlNDpcImhvdXJcIj09PWI/Zi8zNmU1OlwiZGF5XCI9PT1iPyhmLWUpLzg2NGU1Olwid2Vla1wiPT09Yj8oZi1lKS82MDQ4ZTU6ZiksYz9nOnQoZykpOk5hTik6TmFOfWZ1bmN0aW9uIGNjKGEsYil7XG4vLyBkaWZmZXJlbmNlIGluIG1vbnRoc1xudmFyIGMsZCxlPTEyKihiLnllYXIoKS1hLnllYXIoKSkrKGIubW9udGgoKS1hLm1vbnRoKCkpLFxuLy8gYiBpcyBpbiAoYW5jaG9yIC0gMSBtb250aCwgYW5jaG9yICsgMSBtb250aClcbmY9YS5jbG9uZSgpLmFkZChlLFwibW9udGhzXCIpO1xuLy9jaGVjayBmb3IgbmVnYXRpdmUgemVybywgcmV0dXJuIHplcm8gaWYgbmVnYXRpdmUgemVyb1xuLy8gbGluZWFyIGFjcm9zcyB0aGUgbW9udGhcbi8vIGxpbmVhciBhY3Jvc3MgdGhlIG1vbnRoXG5yZXR1cm4gYi1mPDA/KGM9YS5jbG9uZSgpLmFkZChlLTEsXCJtb250aHNcIiksZD0oYi1mKS8oZi1jKSk6KGM9YS5jbG9uZSgpLmFkZChlKzEsXCJtb250aHNcIiksZD0oYi1mKS8oYy1mKSksLShlK2QpfHwwfWZ1bmN0aW9uIGRjKCl7cmV0dXJuIHRoaXMuY2xvbmUoKS5sb2NhbGUoXCJlblwiKS5mb3JtYXQoXCJkZGQgTU1NIEREIFlZWVkgSEg6bW06c3MgW0dNVF1aWlwiKX1mdW5jdGlvbiBlYygpe3ZhciBhPXRoaXMuY2xvbmUoKS51dGMoKTtyZXR1cm4gMDxhLnllYXIoKSYmYS55ZWFyKCk8PTk5OTk/eihEYXRlLnByb3RvdHlwZS50b0lTT1N0cmluZyk/dGhpcy50b0RhdGUoKS50b0lTT1N0cmluZygpOlgoYSxcIllZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl1cIik6WChhLFwiWVlZWVlZLU1NLUREW1RdSEg6bW06c3MuU1NTW1pdXCIpfS8qKlxuICogUmV0dXJuIGEgaHVtYW4gcmVhZGFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBtb21lbnQgdGhhdCBjYW5cbiAqIGFsc28gYmUgZXZhbHVhdGVkIHRvIGdldCBhIG5ldyBtb21lbnQgd2hpY2ggaXMgdGhlIHNhbWVcbiAqXG4gKiBAbGluayBodHRwczovL25vZGVqcy5vcmcvZGlzdC9sYXRlc3QvZG9jcy9hcGkvdXRpbC5odG1sI3V0aWxfY3VzdG9tX2luc3BlY3RfZnVuY3Rpb25fb25fb2JqZWN0c1xuICovXG5mdW5jdGlvbiBmYygpe2lmKCF0aGlzLmlzVmFsaWQoKSlyZXR1cm5cIm1vbWVudC5pbnZhbGlkKC8qIFwiK3RoaXMuX2krXCIgKi8pXCI7dmFyIGE9XCJtb21lbnRcIixiPVwiXCI7dGhpcy5pc0xvY2FsKCl8fChhPTA9PT10aGlzLnV0Y09mZnNldCgpP1wibW9tZW50LnV0Y1wiOlwibW9tZW50LnBhcnNlWm9uZVwiLGI9XCJaXCIpO3ZhciBjPVwiW1wiK2ErJyhcIl0nLGQ9MDx0aGlzLnllYXIoKSYmdGhpcy55ZWFyKCk8PTk5OTk/XCJZWVlZXCI6XCJZWVlZWVlcIixlPVwiLU1NLUREW1RdSEg6bW06c3MuU1NTXCIsZj1iKydbXCIpXSc7cmV0dXJuIHRoaXMuZm9ybWF0KGMrZCtlK2YpfWZ1bmN0aW9uIGdjKGIpe2J8fChiPXRoaXMuaXNVdGMoKT9hLmRlZmF1bHRGb3JtYXRVdGM6YS5kZWZhdWx0Rm9ybWF0KTt2YXIgYz1YKHRoaXMsYik7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLnBvc3Rmb3JtYXQoYyl9ZnVuY3Rpb24gaGMoYSxiKXtyZXR1cm4gdGhpcy5pc1ZhbGlkKCkmJihzKGEpJiZhLmlzVmFsaWQoKXx8c2IoYSkuaXNWYWxpZCgpKT9PYih7dG86dGhpcyxmcm9tOmF9KS5sb2NhbGUodGhpcy5sb2NhbGUoKSkuaHVtYW5pemUoIWIpOnRoaXMubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCl9ZnVuY3Rpb24gaWMoYSl7cmV0dXJuIHRoaXMuZnJvbShzYigpLGEpfWZ1bmN0aW9uIGpjKGEsYil7cmV0dXJuIHRoaXMuaXNWYWxpZCgpJiYocyhhKSYmYS5pc1ZhbGlkKCl8fHNiKGEpLmlzVmFsaWQoKSk/T2Ioe2Zyb206dGhpcyx0bzphfSkubG9jYWxlKHRoaXMubG9jYWxlKCkpLmh1bWFuaXplKCFiKTp0aGlzLmxvY2FsZURhdGEoKS5pbnZhbGlkRGF0ZSgpfWZ1bmN0aW9uIGtjKGEpe3JldHVybiB0aGlzLnRvKHNiKCksYSl9XG4vLyBJZiBwYXNzZWQgYSBsb2NhbGUga2V5LCBpdCB3aWxsIHNldCB0aGUgbG9jYWxlIGZvciB0aGlzXG4vLyBpbnN0YW5jZS4gIE90aGVyd2lzZSwgaXQgd2lsbCByZXR1cm4gdGhlIGxvY2FsZSBjb25maWd1cmF0aW9uXG4vLyB2YXJpYWJsZXMgZm9yIHRoaXMgaW5zdGFuY2UuXG5mdW5jdGlvbiBsYyhhKXt2YXIgYjtyZXR1cm4gdm9pZCAwPT09YT90aGlzLl9sb2NhbGUuX2FiYnI6KGI9YmIoYSksbnVsbCE9YiYmKHRoaXMuX2xvY2FsZT1iKSx0aGlzKX1mdW5jdGlvbiBtYygpe3JldHVybiB0aGlzLl9sb2NhbGV9ZnVuY3Rpb24gbmMoYSl7XG4vLyB0aGUgZm9sbG93aW5nIHN3aXRjaCBpbnRlbnRpb25hbGx5IG9taXRzIGJyZWFrIGtleXdvcmRzXG4vLyB0byB1dGlsaXplIGZhbGxpbmcgdGhyb3VnaCB0aGUgY2FzZXMuXG5zd2l0Y2goYT1LKGEpKXtjYXNlXCJ5ZWFyXCI6dGhpcy5tb250aCgwKTsvKiBmYWxscyB0aHJvdWdoICovXG5jYXNlXCJxdWFydGVyXCI6Y2FzZVwibW9udGhcIjp0aGlzLmRhdGUoMSk7LyogZmFsbHMgdGhyb3VnaCAqL1xuY2FzZVwid2Vla1wiOmNhc2VcImlzb1dlZWtcIjpjYXNlXCJkYXlcIjpjYXNlXCJkYXRlXCI6dGhpcy5ob3VycygwKTsvKiBmYWxscyB0aHJvdWdoICovXG5jYXNlXCJob3VyXCI6dGhpcy5taW51dGVzKDApOy8qIGZhbGxzIHRocm91Z2ggKi9cbmNhc2VcIm1pbnV0ZVwiOnRoaXMuc2Vjb25kcygwKTsvKiBmYWxscyB0aHJvdWdoICovXG5jYXNlXCJzZWNvbmRcIjp0aGlzLm1pbGxpc2Vjb25kcygwKX1cbi8vIHdlZWtzIGFyZSBhIHNwZWNpYWwgY2FzZVxuLy8gcXVhcnRlcnMgYXJlIGFsc28gc3BlY2lhbFxucmV0dXJuXCJ3ZWVrXCI9PT1hJiZ0aGlzLndlZWtkYXkoMCksXCJpc29XZWVrXCI9PT1hJiZ0aGlzLmlzb1dlZWtkYXkoMSksXCJxdWFydGVyXCI9PT1hJiZ0aGlzLm1vbnRoKDMqTWF0aC5mbG9vcih0aGlzLm1vbnRoKCkvMykpLHRoaXN9ZnVuY3Rpb24gb2MoYSl7XG4vLyAnZGF0ZScgaXMgYW4gYWxpYXMgZm9yICdkYXknLCBzbyBpdCBzaG91bGQgYmUgY29uc2lkZXJlZCBhcyBzdWNoLlxucmV0dXJuIGE9SyhhKSx2b2lkIDA9PT1hfHxcIm1pbGxpc2Vjb25kXCI9PT1hP3RoaXM6KFwiZGF0ZVwiPT09YSYmKGE9XCJkYXlcIiksdGhpcy5zdGFydE9mKGEpLmFkZCgxLFwiaXNvV2Vla1wiPT09YT9cIndlZWtcIjphKS5zdWJ0cmFjdCgxLFwibXNcIikpfWZ1bmN0aW9uIHBjKCl7cmV0dXJuIHRoaXMuX2QudmFsdWVPZigpLTZlNCoodGhpcy5fb2Zmc2V0fHwwKX1mdW5jdGlvbiBxYygpe3JldHVybiBNYXRoLmZsb29yKHRoaXMudmFsdWVPZigpLzFlMyl9ZnVuY3Rpb24gcmMoKXtyZXR1cm4gbmV3IERhdGUodGhpcy52YWx1ZU9mKCkpfWZ1bmN0aW9uIHNjKCl7dmFyIGE9dGhpcztyZXR1cm5bYS55ZWFyKCksYS5tb250aCgpLGEuZGF0ZSgpLGEuaG91cigpLGEubWludXRlKCksYS5zZWNvbmQoKSxhLm1pbGxpc2Vjb25kKCldfWZ1bmN0aW9uIHRjKCl7dmFyIGE9dGhpcztyZXR1cm57eWVhcnM6YS55ZWFyKCksbW9udGhzOmEubW9udGgoKSxkYXRlOmEuZGF0ZSgpLGhvdXJzOmEuaG91cnMoKSxtaW51dGVzOmEubWludXRlcygpLHNlY29uZHM6YS5zZWNvbmRzKCksbWlsbGlzZWNvbmRzOmEubWlsbGlzZWNvbmRzKCl9fWZ1bmN0aW9uIHVjKCl7XG4vLyBuZXcgRGF0ZShOYU4pLnRvSlNPTigpID09PSBudWxsXG5yZXR1cm4gdGhpcy5pc1ZhbGlkKCk/dGhpcy50b0lTT1N0cmluZygpOm51bGx9ZnVuY3Rpb24gdmMoKXtyZXR1cm4gbih0aGlzKX1mdW5jdGlvbiB3Yygpe3JldHVybiBqKHt9LG0odGhpcykpfWZ1bmN0aW9uIHhjKCl7cmV0dXJuIG0odGhpcykub3ZlcmZsb3d9ZnVuY3Rpb24geWMoKXtyZXR1cm57aW5wdXQ6dGhpcy5faSxmb3JtYXQ6dGhpcy5fZixsb2NhbGU6dGhpcy5fbG9jYWxlLGlzVVRDOnRoaXMuX2lzVVRDLHN0cmljdDp0aGlzLl9zdHJpY3R9fWZ1bmN0aW9uIHpjKGEsYil7VSgwLFthLGEubGVuZ3RoXSwwLGIpfVxuLy8gTU9NRU5UU1xuZnVuY3Rpb24gQWMoYSl7cmV0dXJuIEVjLmNhbGwodGhpcyxhLHRoaXMud2VlaygpLHRoaXMud2Vla2RheSgpLHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRvdyx0aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3kpfWZ1bmN0aW9uIEJjKGEpe3JldHVybiBFYy5jYWxsKHRoaXMsYSx0aGlzLmlzb1dlZWsoKSx0aGlzLmlzb1dlZWtkYXkoKSwxLDQpfWZ1bmN0aW9uIENjKCl7cmV0dXJuIHhhKHRoaXMueWVhcigpLDEsNCl9ZnVuY3Rpb24gRGMoKXt2YXIgYT10aGlzLmxvY2FsZURhdGEoKS5fd2VlaztyZXR1cm4geGEodGhpcy55ZWFyKCksYS5kb3csYS5kb3kpfWZ1bmN0aW9uIEVjKGEsYixjLGQsZSl7dmFyIGY7cmV0dXJuIG51bGw9PWE/d2EodGhpcyxkLGUpLnllYXI6KGY9eGEoYSxkLGUpLGI+ZiYmKGI9ZiksRmMuY2FsbCh0aGlzLGEsYixjLGQsZSkpfWZ1bmN0aW9uIEZjKGEsYixjLGQsZSl7dmFyIGY9dmEoYSxiLGMsZCxlKSxnPXRhKGYueWVhciwwLGYuZGF5T2ZZZWFyKTtyZXR1cm4gdGhpcy55ZWFyKGcuZ2V0VVRDRnVsbFllYXIoKSksdGhpcy5tb250aChnLmdldFVUQ01vbnRoKCkpLHRoaXMuZGF0ZShnLmdldFVUQ0RhdGUoKSksdGhpc31cbi8vIE1PTUVOVFNcbmZ1bmN0aW9uIEdjKGEpe3JldHVybiBudWxsPT1hP01hdGguY2VpbCgodGhpcy5tb250aCgpKzEpLzMpOnRoaXMubW9udGgoMyooYS0xKSt0aGlzLm1vbnRoKCklMyl9XG4vLyBIRUxQRVJTXG4vLyBNT01FTlRTXG5mdW5jdGlvbiBIYyhhKXt2YXIgYj1NYXRoLnJvdW5kKCh0aGlzLmNsb25lKCkuc3RhcnRPZihcImRheVwiKS10aGlzLmNsb25lKCkuc3RhcnRPZihcInllYXJcIikpLzg2NGU1KSsxO3JldHVybiBudWxsPT1hP2I6dGhpcy5hZGQoYS1iLFwiZFwiKX1mdW5jdGlvbiBJYyhhLGIpe2JbZ2VdPXUoMWUzKihcIjAuXCIrYSkpfVxuLy8gTU9NRU5UU1xuZnVuY3Rpb24gSmMoKXtyZXR1cm4gdGhpcy5faXNVVEM/XCJVVENcIjpcIlwifWZ1bmN0aW9uIEtjKCl7cmV0dXJuIHRoaXMuX2lzVVRDP1wiQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWVcIjpcIlwifWZ1bmN0aW9uIExjKGEpe3JldHVybiBzYigxZTMqYSl9ZnVuY3Rpb24gTWMoKXtyZXR1cm4gc2IuYXBwbHkobnVsbCxhcmd1bWVudHMpLnBhcnNlWm9uZSgpfWZ1bmN0aW9uIE5jKGEpe3JldHVybiBhfWZ1bmN0aW9uIE9jKGEsYixjLGQpe3ZhciBlPWJiKCksZj1rKCkuc2V0KGQsYik7cmV0dXJuIGVbY10oZixhKX1mdW5jdGlvbiBQYyhhLGIsYyl7aWYoZihhKSYmKGI9YSxhPXZvaWQgMCksYT1hfHxcIlwiLG51bGwhPWIpcmV0dXJuIE9jKGEsYixjLFwibW9udGhcIik7dmFyIGQsZT1bXTtmb3IoZD0wO2Q8MTI7ZCsrKWVbZF09T2MoYSxkLGMsXCJtb250aFwiKTtyZXR1cm4gZX1cbi8vICgpXG4vLyAoNSlcbi8vIChmbXQsIDUpXG4vLyAoZm10KVxuLy8gKHRydWUpXG4vLyAodHJ1ZSwgNSlcbi8vICh0cnVlLCBmbXQsIDUpXG4vLyAodHJ1ZSwgZm10KVxuZnVuY3Rpb24gUWMoYSxiLGMsZCl7XCJib29sZWFuXCI9PXR5cGVvZiBhPyhmKGIpJiYoYz1iLGI9dm9pZCAwKSxiPWJ8fFwiXCIpOihiPWEsYz1iLGE9ITEsZihiKSYmKGM9YixiPXZvaWQgMCksYj1ifHxcIlwiKTt2YXIgZT1iYigpLGc9YT9lLl93ZWVrLmRvdzowO2lmKG51bGwhPWMpcmV0dXJuIE9jKGIsKGMrZyklNyxkLFwiZGF5XCIpO3ZhciBoLGk9W107Zm9yKGg9MDtoPDc7aCsrKWlbaF09T2MoYiwoaCtnKSU3LGQsXCJkYXlcIik7cmV0dXJuIGl9ZnVuY3Rpb24gUmMoYSxiKXtyZXR1cm4gUGMoYSxiLFwibW9udGhzXCIpfWZ1bmN0aW9uIFNjKGEsYil7cmV0dXJuIFBjKGEsYixcIm1vbnRoc1Nob3J0XCIpfWZ1bmN0aW9uIFRjKGEsYixjKXtyZXR1cm4gUWMoYSxiLGMsXCJ3ZWVrZGF5c1wiKX1mdW5jdGlvbiBVYyhhLGIsYyl7cmV0dXJuIFFjKGEsYixjLFwid2Vla2RheXNTaG9ydFwiKX1mdW5jdGlvbiBWYyhhLGIsYyl7cmV0dXJuIFFjKGEsYixjLFwid2Vla2RheXNNaW5cIil9ZnVuY3Rpb24gV2MoKXt2YXIgYT10aGlzLl9kYXRhO3JldHVybiB0aGlzLl9taWxsaXNlY29uZHM9WmUodGhpcy5fbWlsbGlzZWNvbmRzKSx0aGlzLl9kYXlzPVplKHRoaXMuX2RheXMpLHRoaXMuX21vbnRocz1aZSh0aGlzLl9tb250aHMpLGEubWlsbGlzZWNvbmRzPVplKGEubWlsbGlzZWNvbmRzKSxhLnNlY29uZHM9WmUoYS5zZWNvbmRzKSxhLm1pbnV0ZXM9WmUoYS5taW51dGVzKSxhLmhvdXJzPVplKGEuaG91cnMpLGEubW9udGhzPVplKGEubW9udGhzKSxhLnllYXJzPVplKGEueWVhcnMpLHRoaXN9ZnVuY3Rpb24gWGMoYSxiLGMsZCl7dmFyIGU9T2IoYixjKTtyZXR1cm4gYS5fbWlsbGlzZWNvbmRzKz1kKmUuX21pbGxpc2Vjb25kcyxhLl9kYXlzKz1kKmUuX2RheXMsYS5fbW9udGhzKz1kKmUuX21vbnRocyxhLl9idWJibGUoKX1cbi8vIHN1cHBvcnRzIG9ubHkgMi4wLXN0eWxlIGFkZCgxLCAncycpIG9yIGFkZChkdXJhdGlvbilcbmZ1bmN0aW9uIFljKGEsYil7cmV0dXJuIFhjKHRoaXMsYSxiLDEpfVxuLy8gc3VwcG9ydHMgb25seSAyLjAtc3R5bGUgc3VidHJhY3QoMSwgJ3MnKSBvciBzdWJ0cmFjdChkdXJhdGlvbilcbmZ1bmN0aW9uIFpjKGEsYil7cmV0dXJuIFhjKHRoaXMsYSxiLC0xKX1mdW5jdGlvbiAkYyhhKXtyZXR1cm4gYTwwP01hdGguZmxvb3IoYSk6TWF0aC5jZWlsKGEpfWZ1bmN0aW9uIF9jKCl7dmFyIGEsYixjLGQsZSxmPXRoaXMuX21pbGxpc2Vjb25kcyxnPXRoaXMuX2RheXMsaD10aGlzLl9tb250aHMsaT10aGlzLl9kYXRhO1xuLy8gaWYgd2UgaGF2ZSBhIG1peCBvZiBwb3NpdGl2ZSBhbmQgbmVnYXRpdmUgdmFsdWVzLCBidWJibGUgZG93biBmaXJzdFxuLy8gY2hlY2s6IGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8yMTY2XG4vLyBUaGUgZm9sbG93aW5nIGNvZGUgYnViYmxlcyB1cCB2YWx1ZXMsIHNlZSB0aGUgdGVzdHMgZm9yXG4vLyBleGFtcGxlcyBvZiB3aGF0IHRoYXQgbWVhbnMuXG4vLyBjb252ZXJ0IGRheXMgdG8gbW9udGhzXG4vLyAxMiBtb250aHMgLT4gMSB5ZWFyXG5yZXR1cm4gZj49MCYmZz49MCYmaD49MHx8Zjw9MCYmZzw9MCYmaDw9MHx8KGYrPTg2NGU1KiRjKGJkKGgpK2cpLGc9MCxoPTApLGkubWlsbGlzZWNvbmRzPWYlMWUzLGE9dChmLzFlMyksaS5zZWNvbmRzPWElNjAsYj10KGEvNjApLGkubWludXRlcz1iJTYwLGM9dChiLzYwKSxpLmhvdXJzPWMlMjQsZys9dChjLzI0KSxlPXQoYWQoZykpLGgrPWUsZy09JGMoYmQoZSkpLGQ9dChoLzEyKSxoJT0xMixpLmRheXM9ZyxpLm1vbnRocz1oLGkueWVhcnM9ZCx0aGlzfWZ1bmN0aW9uIGFkKGEpe1xuLy8gNDAwIHllYXJzIGhhdmUgMTQ2MDk3IGRheXMgKHRha2luZyBpbnRvIGFjY291bnQgbGVhcCB5ZWFyIHJ1bGVzKVxuLy8gNDAwIHllYXJzIGhhdmUgMTIgbW9udGhzID09PSA0ODAwXG5yZXR1cm4gNDgwMCphLzE0NjA5N31mdW5jdGlvbiBiZChhKXtcbi8vIHRoZSByZXZlcnNlIG9mIGRheXNUb01vbnRoc1xucmV0dXJuIDE0NjA5NyphLzQ4MDB9ZnVuY3Rpb24gY2QoYSl7dmFyIGIsYyxkPXRoaXMuX21pbGxpc2Vjb25kcztpZihhPUsoYSksXCJtb250aFwiPT09YXx8XCJ5ZWFyXCI9PT1hKXJldHVybiBiPXRoaXMuX2RheXMrZC84NjRlNSxjPXRoaXMuX21vbnRocythZChiKSxcIm1vbnRoXCI9PT1hP2M6Yy8xMjtzd2l0Y2goXG4vLyBoYW5kbGUgbWlsbGlzZWNvbmRzIHNlcGFyYXRlbHkgYmVjYXVzZSBvZiBmbG9hdGluZyBwb2ludCBtYXRoIGVycm9ycyAoaXNzdWUgIzE4NjcpXG5iPXRoaXMuX2RheXMrTWF0aC5yb3VuZChiZCh0aGlzLl9tb250aHMpKSxhKXtjYXNlXCJ3ZWVrXCI6cmV0dXJuIGIvNytkLzYwNDhlNTtjYXNlXCJkYXlcIjpyZXR1cm4gYitkLzg2NGU1O2Nhc2VcImhvdXJcIjpyZXR1cm4gMjQqYitkLzM2ZTU7Y2FzZVwibWludXRlXCI6cmV0dXJuIDE0NDAqYitkLzZlNDtjYXNlXCJzZWNvbmRcIjpyZXR1cm4gODY0MDAqYitkLzFlMztcbi8vIE1hdGguZmxvb3IgcHJldmVudHMgZmxvYXRpbmcgcG9pbnQgbWF0aCBlcnJvcnMgaGVyZVxuY2FzZVwibWlsbGlzZWNvbmRcIjpyZXR1cm4gTWF0aC5mbG9vcig4NjRlNSpiKStkO2RlZmF1bHQ6dGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biB1bml0IFwiK2EpfX1cbi8vIFRPRE86IFVzZSB0aGlzLmFzKCdtcycpP1xuZnVuY3Rpb24gZGQoKXtyZXR1cm4gdGhpcy5fbWlsbGlzZWNvbmRzKzg2NGU1KnRoaXMuX2RheXMrdGhpcy5fbW9udGhzJTEyKjI1OTJlNiszMTUzNmU2KnUodGhpcy5fbW9udGhzLzEyKX1mdW5jdGlvbiBlZChhKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hcyhhKX19ZnVuY3Rpb24gZmQoYSl7cmV0dXJuIGE9SyhhKSx0aGlzW2ErXCJzXCJdKCl9ZnVuY3Rpb24gZ2QoYSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2RhdGFbYV19fWZ1bmN0aW9uIGhkKCl7cmV0dXJuIHQodGhpcy5kYXlzKCkvNyl9XG4vLyBoZWxwZXIgZnVuY3Rpb24gZm9yIG1vbWVudC5mbi5mcm9tLCBtb21lbnQuZm4uZnJvbU5vdywgYW5kIG1vbWVudC5kdXJhdGlvbi5mbi5odW1hbml6ZVxuZnVuY3Rpb24gaWQoYSxiLGMsZCxlKXtyZXR1cm4gZS5yZWxhdGl2ZVRpbWUoYnx8MSwhIWMsYSxkKX1mdW5jdGlvbiBqZChhLGIsYyl7dmFyIGQ9T2IoYSkuYWJzKCksZT1vZihkLmFzKFwic1wiKSksZj1vZihkLmFzKFwibVwiKSksZz1vZihkLmFzKFwiaFwiKSksaD1vZihkLmFzKFwiZFwiKSksaT1vZihkLmFzKFwiTVwiKSksaj1vZihkLmFzKFwieVwiKSksaz1lPHBmLnMmJltcInNcIixlXXx8Zjw9MSYmW1wibVwiXXx8ZjxwZi5tJiZbXCJtbVwiLGZdfHxnPD0xJiZbXCJoXCJdfHxnPHBmLmgmJltcImhoXCIsZ118fGg8PTEmJltcImRcIl18fGg8cGYuZCYmW1wiZGRcIixoXXx8aTw9MSYmW1wiTVwiXXx8aTxwZi5NJiZbXCJNTVwiLGldfHxqPD0xJiZbXCJ5XCJdfHxbXCJ5eVwiLGpdO3JldHVybiBrWzJdPWIsa1szXT0rYT4wLGtbNF09YyxpZC5hcHBseShudWxsLGspfVxuLy8gVGhpcyBmdW5jdGlvbiBhbGxvd3MgeW91IHRvIHNldCB0aGUgcm91bmRpbmcgZnVuY3Rpb24gZm9yIHJlbGF0aXZlIHRpbWUgc3RyaW5nc1xuZnVuY3Rpb24ga2QoYSl7cmV0dXJuIHZvaWQgMD09PWE/b2Y6XCJmdW5jdGlvblwiPT10eXBlb2YgYSYmKG9mPWEsITApfVxuLy8gVGhpcyBmdW5jdGlvbiBhbGxvd3MgeW91IHRvIHNldCBhIHRocmVzaG9sZCBmb3IgcmVsYXRpdmUgdGltZSBzdHJpbmdzXG5mdW5jdGlvbiBsZChhLGIpe3JldHVybiB2b2lkIDAhPT1wZlthXSYmKHZvaWQgMD09PWI/cGZbYV06KHBmW2FdPWIsITApKX1mdW5jdGlvbiBtZChhKXt2YXIgYj10aGlzLmxvY2FsZURhdGEoKSxjPWpkKHRoaXMsIWEsYik7cmV0dXJuIGEmJihjPWIucGFzdEZ1dHVyZSgrdGhpcyxjKSksYi5wb3N0Zm9ybWF0KGMpfWZ1bmN0aW9uIG5kKCl7XG4vLyBmb3IgSVNPIHN0cmluZ3Mgd2UgZG8gbm90IHVzZSB0aGUgbm9ybWFsIGJ1YmJsaW5nIHJ1bGVzOlxuLy8gICogbWlsbGlzZWNvbmRzIGJ1YmJsZSB1cCB1bnRpbCB0aGV5IGJlY29tZSBob3Vyc1xuLy8gICogZGF5cyBkbyBub3QgYnViYmxlIGF0IGFsbFxuLy8gICogbW9udGhzIGJ1YmJsZSB1cCB1bnRpbCB0aGV5IGJlY29tZSB5ZWFyc1xuLy8gVGhpcyBpcyBiZWNhdXNlIHRoZXJlIGlzIG5vIGNvbnRleHQtZnJlZSBjb252ZXJzaW9uIGJldHdlZW4gaG91cnMgYW5kIGRheXNcbi8vICh0aGluayBvZiBjbG9jayBjaGFuZ2VzKVxuLy8gYW5kIGFsc28gbm90IGJldHdlZW4gZGF5cyBhbmQgbW9udGhzICgyOC0zMSBkYXlzIHBlciBtb250aClcbnZhciBhLGIsYyxkPXFmKHRoaXMuX21pbGxpc2Vjb25kcykvMWUzLGU9cWYodGhpcy5fZGF5cyksZj1xZih0aGlzLl9tb250aHMpO1xuLy8gMzYwMCBzZWNvbmRzIC0+IDYwIG1pbnV0ZXMgLT4gMSBob3VyXG5hPXQoZC82MCksYj10KGEvNjApLGQlPTYwLGElPTYwLFxuLy8gMTIgbW9udGhzIC0+IDEgeWVhclxuYz10KGYvMTIpLGYlPTEyO1xuLy8gaW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL2RvcmRpbGxlL21vbWVudC1pc29kdXJhdGlvbi9ibG9iL21hc3Rlci9tb21lbnQuaXNvZHVyYXRpb24uanNcbnZhciBnPWMsaD1mLGk9ZSxqPWIsaz1hLGw9ZCxtPXRoaXMuYXNTZWNvbmRzKCk7cmV0dXJuIG0/KG08MD9cIi1cIjpcIlwiKStcIlBcIisoZz9nK1wiWVwiOlwiXCIpKyhoP2grXCJNXCI6XCJcIikrKGk/aStcIkRcIjpcIlwiKSsoanx8a3x8bD9cIlRcIjpcIlwiKSsoaj9qK1wiSFwiOlwiXCIpKyhrP2srXCJNXCI6XCJcIikrKGw/bCtcIlNcIjpcIlwiKTpcIlAwRFwifXZhciBvZCxwZDtwZD1BcnJheS5wcm90b3R5cGUuc29tZT9BcnJheS5wcm90b3R5cGUuc29tZTpmdW5jdGlvbihhKXtmb3IodmFyIGI9T2JqZWN0KHRoaXMpLGM9Yi5sZW5ndGg+Pj4wLGQ9MDtkPGM7ZCsrKWlmKGQgaW4gYiYmYS5jYWxsKHRoaXMsYltkXSxkLGIpKXJldHVybiEwO3JldHVybiExfTt2YXIgcWQ9cGQscmQ9YS5tb21lbnRQcm9wZXJ0aWVzPVtdLHNkPSExLHRkPXt9O2Euc3VwcHJlc3NEZXByZWNhdGlvbldhcm5pbmdzPSExLGEuZGVwcmVjYXRpb25IYW5kbGVyPW51bGw7dmFyIHVkO3VkPU9iamVjdC5rZXlzP09iamVjdC5rZXlzOmZ1bmN0aW9uKGEpe3ZhciBiLGM9W107Zm9yKGIgaW4gYSlpKGEsYikmJmMucHVzaChiKTtyZXR1cm4gY307dmFyIHZkLHdkPXVkLHhkPXtzYW1lRGF5OlwiW1RvZGF5IGF0XSBMVFwiLG5leHREYXk6XCJbVG9tb3Jyb3cgYXRdIExUXCIsbmV4dFdlZWs6XCJkZGRkIFthdF0gTFRcIixsYXN0RGF5OlwiW1llc3RlcmRheSBhdF0gTFRcIixsYXN0V2VlazpcIltMYXN0XSBkZGRkIFthdF0gTFRcIixzYW1lRWxzZTpcIkxcIn0seWQ9e0xUUzpcImg6bW06c3MgQVwiLExUOlwiaDptbSBBXCIsTDpcIk1NL0REL1lZWVlcIixMTDpcIk1NTU0gRCwgWVlZWVwiLExMTDpcIk1NTU0gRCwgWVlZWSBoOm1tIEFcIixMTExMOlwiZGRkZCwgTU1NTSBELCBZWVlZIGg6bW0gQVwifSx6ZD1cIkludmFsaWQgZGF0ZVwiLEFkPVwiJWRcIixCZD0vXFxkezEsMn0vLENkPXtmdXR1cmU6XCJpbiAlc1wiLHBhc3Q6XCIlcyBhZ29cIixzOlwiYSBmZXcgc2Vjb25kc1wiLG06XCJhIG1pbnV0ZVwiLG1tOlwiJWQgbWludXRlc1wiLGg6XCJhbiBob3VyXCIsaGg6XCIlZCBob3Vyc1wiLGQ6XCJhIGRheVwiLGRkOlwiJWQgZGF5c1wiLE06XCJhIG1vbnRoXCIsTU06XCIlZCBtb250aHNcIix5OlwiYSB5ZWFyXCIseXk6XCIlZCB5ZWFyc1wifSxEZD17fSxFZD17fSxGZD0vKFxcW1teXFxbXSpcXF0pfChcXFxcKT8oW0hoXW1tKHNzKT98TW98TU0/TT9NP3xEb3xERERvfEREP0Q/RD98ZGRkP2Q/fGRvP3x3W298d10/fFdbb3xXXT98UW8/fFlZWVlZWXxZWVlZWXxZWVlZfFlZfGdnKGdnZz8pP3xHRyhHR0c/KT98ZXxFfGF8QXxoaD98SEg/fGtrP3xtbT98c3M/fFN7MSw5fXx4fFh8eno/fFpaP3wuKS9nLEdkPS8oXFxbW15cXFtdKlxcXSl8KFxcXFwpPyhMVFN8TFR8TEw/TD9MP3xsezEsNH0pL2csSGQ9e30sSWQ9e30sSmQ9L1xcZC8sS2Q9L1xcZFxcZC8sTGQ9L1xcZHszfS8sTWQ9L1xcZHs0fS8sTmQ9L1srLV0/XFxkezZ9LyxPZD0vXFxkXFxkPy8sUGQ9L1xcZFxcZFxcZFxcZD8vLFFkPS9cXGRcXGRcXGRcXGRcXGRcXGQ/LyxSZD0vXFxkezEsM30vLFNkPS9cXGR7MSw0fS8sVGQ9L1srLV0/XFxkezEsNn0vLFVkPS9cXGQrLyxWZD0vWystXT9cXGQrLyxXZD0vWnxbKy1dXFxkXFxkOj9cXGRcXGQvZ2ksWGQ9L1p8WystXVxcZFxcZCg/Ojo/XFxkXFxkKT8vZ2ksWWQ9L1srLV0/XFxkKyhcXC5cXGR7MSwzfSk/LyxaZD0vWzAtOV0qWydhLXpcXHUwMEEwLVxcdTA1RkZcXHUwNzAwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdK3xbXFx1MDYwMC1cXHUwNkZGXFwvXSsoXFxzKj9bXFx1MDYwMC1cXHUwNkZGXSspezEsMn0vaSwkZD17fSxfZD17fSxhZT0wLGJlPTEsY2U9MixkZT0zLGVlPTQsZmU9NSxnZT02LGhlPTcsaWU9ODt2ZD1BcnJheS5wcm90b3R5cGUuaW5kZXhPZj9BcnJheS5wcm90b3R5cGUuaW5kZXhPZjpmdW5jdGlvbihhKXtcbi8vIEkga25vd1xudmFyIGI7Zm9yKGI9MDtiPHRoaXMubGVuZ3RoOysrYilpZih0aGlzW2JdPT09YSlyZXR1cm4gYjtyZXR1cm4tMX07dmFyIGplPXZkO1xuLy8gRk9STUFUVElOR1xuVShcIk1cIixbXCJNTVwiLDJdLFwiTW9cIixmdW5jdGlvbigpe3JldHVybiB0aGlzLm1vbnRoKCkrMX0pLFUoXCJNTU1cIiwwLDAsZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm1vbnRoc1Nob3J0KHRoaXMsYSl9KSxVKFwiTU1NTVwiLDAsMCxmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubW9udGhzKHRoaXMsYSl9KSxcbi8vIEFMSUFTRVNcbkooXCJtb250aFwiLFwiTVwiKSxcbi8vIFBSSU9SSVRZXG5NKFwibW9udGhcIiw4KSxcbi8vIFBBUlNJTkdcblooXCJNXCIsT2QpLFooXCJNTVwiLE9kLEtkKSxaKFwiTU1NXCIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi5tb250aHNTaG9ydFJlZ2V4KGEpfSksWihcIk1NTU1cIixmdW5jdGlvbihhLGIpe3JldHVybiBiLm1vbnRoc1JlZ2V4KGEpfSksYmEoW1wiTVwiLFwiTU1cIl0sZnVuY3Rpb24oYSxiKXtiW2JlXT11KGEpLTF9KSxiYShbXCJNTU1cIixcIk1NTU1cIl0sZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9Yy5fbG9jYWxlLm1vbnRoc1BhcnNlKGEsZCxjLl9zdHJpY3QpO1xuLy8gaWYgd2UgZGlkbid0IGZpbmQgYSBtb250aCBuYW1lLCBtYXJrIHRoZSBkYXRlIGFzIGludmFsaWQuXG5udWxsIT1lP2JbYmVdPWU6bShjKS5pbnZhbGlkTW9udGg9YX0pO1xuLy8gTE9DQUxFU1xudmFyIGtlPS9EW29EXT8oXFxbW15cXFtcXF1dKlxcXXxcXHMpK01NTU0/LyxsZT1cIkphbnVhcnlfRmVicnVhcnlfTWFyY2hfQXByaWxfTWF5X0p1bmVfSnVseV9BdWd1c3RfU2VwdGVtYmVyX09jdG9iZXJfTm92ZW1iZXJfRGVjZW1iZXJcIi5zcGxpdChcIl9cIiksbWU9XCJKYW5fRmViX01hcl9BcHJfTWF5X0p1bl9KdWxfQXVnX1NlcF9PY3RfTm92X0RlY1wiLnNwbGl0KFwiX1wiKSxuZT1aZCxvZT1aZDtcbi8vIEZPUk1BVFRJTkdcblUoXCJZXCIsMCwwLGZ1bmN0aW9uKCl7dmFyIGE9dGhpcy55ZWFyKCk7cmV0dXJuIGE8PTk5OTk/XCJcIithOlwiK1wiK2F9KSxVKDAsW1wiWVlcIiwyXSwwLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMueWVhcigpJTEwMH0pLFUoMCxbXCJZWVlZXCIsNF0sMCxcInllYXJcIiksVSgwLFtcIllZWVlZXCIsNV0sMCxcInllYXJcIiksVSgwLFtcIllZWVlZWVwiLDYsITBdLDAsXCJ5ZWFyXCIpLFxuLy8gQUxJQVNFU1xuSihcInllYXJcIixcInlcIiksXG4vLyBQUklPUklUSUVTXG5NKFwieWVhclwiLDEpLFxuLy8gUEFSU0lOR1xuWihcIllcIixWZCksWihcIllZXCIsT2QsS2QpLFooXCJZWVlZXCIsU2QsTWQpLFooXCJZWVlZWVwiLFRkLE5kKSxaKFwiWVlZWVlZXCIsVGQsTmQpLGJhKFtcIllZWVlZXCIsXCJZWVlZWVlcIl0sYWUpLGJhKFwiWVlZWVwiLGZ1bmN0aW9uKGIsYyl7Y1thZV09Mj09PWIubGVuZ3RoP2EucGFyc2VUd29EaWdpdFllYXIoYik6dShiKX0pLGJhKFwiWVlcIixmdW5jdGlvbihiLGMpe2NbYWVdPWEucGFyc2VUd29EaWdpdFllYXIoYil9KSxiYShcIllcIixmdW5jdGlvbihhLGIpe2JbYWVdPXBhcnNlSW50KGEsMTApfSksXG4vLyBIT09LU1xuYS5wYXJzZVR3b0RpZ2l0WWVhcj1mdW5jdGlvbihhKXtyZXR1cm4gdShhKSsodShhKT42OD8xOTAwOjJlMyl9O1xuLy8gTU9NRU5UU1xudmFyIHBlPU8oXCJGdWxsWWVhclwiLCEwKTtcbi8vIEZPUk1BVFRJTkdcblUoXCJ3XCIsW1wid3dcIiwyXSxcIndvXCIsXCJ3ZWVrXCIpLFUoXCJXXCIsW1wiV1dcIiwyXSxcIldvXCIsXCJpc29XZWVrXCIpLFxuLy8gQUxJQVNFU1xuSihcIndlZWtcIixcIndcIiksSihcImlzb1dlZWtcIixcIldcIiksXG4vLyBQUklPUklUSUVTXG5NKFwid2Vla1wiLDUpLE0oXCJpc29XZWVrXCIsNSksXG4vLyBQQVJTSU5HXG5aKFwid1wiLE9kKSxaKFwid3dcIixPZCxLZCksWihcIldcIixPZCksWihcIldXXCIsT2QsS2QpLGNhKFtcIndcIixcInd3XCIsXCJXXCIsXCJXV1wiXSxmdW5jdGlvbihhLGIsYyxkKXtiW2Quc3Vic3RyKDAsMSldPXUoYSl9KTt2YXIgcWU9e2RvdzowLC8vIFN1bmRheSBpcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxuZG95OjZ9O1xuLy8gRk9STUFUVElOR1xuVShcImRcIiwwLFwiZG9cIixcImRheVwiKSxVKFwiZGRcIiwwLDAsZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzTWluKHRoaXMsYSl9KSxVKFwiZGRkXCIsMCwwLGZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5c1Nob3J0KHRoaXMsYSl9KSxVKFwiZGRkZFwiLDAsMCxmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXModGhpcyxhKX0pLFUoXCJlXCIsMCwwLFwid2Vla2RheVwiKSxVKFwiRVwiLDAsMCxcImlzb1dlZWtkYXlcIiksXG4vLyBBTElBU0VTXG5KKFwiZGF5XCIsXCJkXCIpLEooXCJ3ZWVrZGF5XCIsXCJlXCIpLEooXCJpc29XZWVrZGF5XCIsXCJFXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJkYXlcIiwxMSksTShcIndlZWtkYXlcIiwxMSksTShcImlzb1dlZWtkYXlcIiwxMSksXG4vLyBQQVJTSU5HXG5aKFwiZFwiLE9kKSxaKFwiZVwiLE9kKSxaKFwiRVwiLE9kKSxaKFwiZGRcIixmdW5jdGlvbihhLGIpe3JldHVybiBiLndlZWtkYXlzTWluUmVnZXgoYSl9KSxaKFwiZGRkXCIsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYi53ZWVrZGF5c1Nob3J0UmVnZXgoYSl9KSxaKFwiZGRkZFwiLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIud2Vla2RheXNSZWdleChhKX0pLGNhKFtcImRkXCIsXCJkZGRcIixcImRkZGRcIl0sZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9Yy5fbG9jYWxlLndlZWtkYXlzUGFyc2UoYSxkLGMuX3N0cmljdCk7XG4vLyBpZiB3ZSBkaWRuJ3QgZ2V0IGEgd2Vla2RheSBuYW1lLCBtYXJrIHRoZSBkYXRlIGFzIGludmFsaWRcbm51bGwhPWU/Yi5kPWU6bShjKS5pbnZhbGlkV2Vla2RheT1hfSksY2EoW1wiZFwiLFwiZVwiLFwiRVwiXSxmdW5jdGlvbihhLGIsYyxkKXtiW2RdPXUoYSl9KTtcbi8vIExPQ0FMRVNcbnZhciByZT1cIlN1bmRheV9Nb25kYXlfVHVlc2RheV9XZWRuZXNkYXlfVGh1cnNkYXlfRnJpZGF5X1NhdHVyZGF5XCIuc3BsaXQoXCJfXCIpLHNlPVwiU3VuX01vbl9UdWVfV2VkX1RodV9GcmlfU2F0XCIuc3BsaXQoXCJfXCIpLHRlPVwiU3VfTW9fVHVfV2VfVGhfRnJfU2FcIi5zcGxpdChcIl9cIiksdWU9WmQsdmU9WmQsd2U9WmQ7VShcIkhcIixbXCJISFwiLDJdLDAsXCJob3VyXCIpLFUoXCJoXCIsW1wiaGhcIiwyXSwwLFJhKSxVKFwia1wiLFtcImtrXCIsMl0sMCxTYSksVShcImhtbVwiLDAsMCxmdW5jdGlvbigpe3JldHVyblwiXCIrUmEuYXBwbHkodGhpcykrVCh0aGlzLm1pbnV0ZXMoKSwyKX0pLFUoXCJobW1zc1wiLDAsMCxmdW5jdGlvbigpe3JldHVyblwiXCIrUmEuYXBwbHkodGhpcykrVCh0aGlzLm1pbnV0ZXMoKSwyKStUKHRoaXMuc2Vjb25kcygpLDIpfSksVShcIkhtbVwiLDAsMCxmdW5jdGlvbigpe3JldHVyblwiXCIrdGhpcy5ob3VycygpK1QodGhpcy5taW51dGVzKCksMil9KSxVKFwiSG1tc3NcIiwwLDAsZnVuY3Rpb24oKXtyZXR1cm5cIlwiK3RoaXMuaG91cnMoKStUKHRoaXMubWludXRlcygpLDIpK1QodGhpcy5zZWNvbmRzKCksMil9KSxUYShcImFcIiwhMCksVGEoXCJBXCIsITEpLFxuLy8gQUxJQVNFU1xuSihcImhvdXJcIixcImhcIiksXG4vLyBQUklPUklUWVxuTShcImhvdXJcIiwxMyksWihcImFcIixVYSksWihcIkFcIixVYSksWihcIkhcIixPZCksWihcImhcIixPZCksWihcIkhIXCIsT2QsS2QpLFooXCJoaFwiLE9kLEtkKSxaKFwiaG1tXCIsUGQpLFooXCJobW1zc1wiLFFkKSxaKFwiSG1tXCIsUGQpLFooXCJIbW1zc1wiLFFkKSxiYShbXCJIXCIsXCJISFwiXSxkZSksYmEoW1wiYVwiLFwiQVwiXSxmdW5jdGlvbihhLGIsYyl7Yy5faXNQbT1jLl9sb2NhbGUuaXNQTShhKSxjLl9tZXJpZGllbT1hfSksYmEoW1wiaFwiLFwiaGhcIl0sZnVuY3Rpb24oYSxiLGMpe2JbZGVdPXUoYSksbShjKS5iaWdIb3VyPSEwfSksYmEoXCJobW1cIixmdW5jdGlvbihhLGIsYyl7dmFyIGQ9YS5sZW5ndGgtMjtiW2RlXT11KGEuc3Vic3RyKDAsZCkpLGJbZWVdPXUoYS5zdWJzdHIoZCkpLG0oYykuYmlnSG91cj0hMH0pLGJhKFwiaG1tc3NcIixmdW5jdGlvbihhLGIsYyl7dmFyIGQ9YS5sZW5ndGgtNCxlPWEubGVuZ3RoLTI7YltkZV09dShhLnN1YnN0cigwLGQpKSxiW2VlXT11KGEuc3Vic3RyKGQsMikpLGJbZmVdPXUoYS5zdWJzdHIoZSkpLG0oYykuYmlnSG91cj0hMH0pLGJhKFwiSG1tXCIsZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWEubGVuZ3RoLTI7YltkZV09dShhLnN1YnN0cigwLGQpKSxiW2VlXT11KGEuc3Vic3RyKGQpKX0pLGJhKFwiSG1tc3NcIixmdW5jdGlvbihhLGIsYyl7dmFyIGQ9YS5sZW5ndGgtNCxlPWEubGVuZ3RoLTI7YltkZV09dShhLnN1YnN0cigwLGQpKSxiW2VlXT11KGEuc3Vic3RyKGQsMikpLGJbZmVdPXUoYS5zdWJzdHIoZSkpfSk7dmFyIHhlLHllPS9bYXBdXFwuP20/XFwuPy9pLHplPU8oXCJIb3Vyc1wiLCEwKSxBZT17Y2FsZW5kYXI6eGQsbG9uZ0RhdGVGb3JtYXQ6eWQsaW52YWxpZERhdGU6emQsb3JkaW5hbDpBZCxvcmRpbmFsUGFyc2U6QmQscmVsYXRpdmVUaW1lOkNkLG1vbnRoczpsZSxtb250aHNTaG9ydDptZSx3ZWVrOnFlLHdlZWtkYXlzOnJlLHdlZWtkYXlzTWluOnRlLHdlZWtkYXlzU2hvcnQ6c2UsbWVyaWRpZW1QYXJzZTp5ZX0sQmU9e30sQ2U9e30sRGU9L15cXHMqKCg/OlsrLV1cXGR7Nn18XFxkezR9KS0oPzpcXGRcXGQtXFxkXFxkfFdcXGRcXGQtXFxkfFdcXGRcXGR8XFxkXFxkXFxkfFxcZFxcZCkpKD86KFR8ICkoXFxkXFxkKD86OlxcZFxcZCg/OjpcXGRcXGQoPzpbLixdXFxkKyk/KT8pPykoW1xcK1xcLV1cXGRcXGQoPzo6P1xcZFxcZCk/fFxccypaKT8pPyQvLEVlPS9eXFxzKigoPzpbKy1dXFxkezZ9fFxcZHs0fSkoPzpcXGRcXGRcXGRcXGR8V1xcZFxcZFxcZHxXXFxkXFxkfFxcZFxcZFxcZHxcXGRcXGQpKSg/OihUfCApKFxcZFxcZCg/OlxcZFxcZCg/OlxcZFxcZCg/OlsuLF1cXGQrKT8pPyk/KShbXFwrXFwtXVxcZFxcZCg/Ojo/XFxkXFxkKT98XFxzKlopPyk/JC8sRmU9L1p8WystXVxcZFxcZCg/Ojo/XFxkXFxkKT8vLEdlPVtbXCJZWVlZWVktTU0tRERcIiwvWystXVxcZHs2fS1cXGRcXGQtXFxkXFxkL10sW1wiWVlZWS1NTS1ERFwiLC9cXGR7NH0tXFxkXFxkLVxcZFxcZC9dLFtcIkdHR0ctW1ddV1ctRVwiLC9cXGR7NH0tV1xcZFxcZC1cXGQvXSxbXCJHR0dHLVtXXVdXXCIsL1xcZHs0fS1XXFxkXFxkLywhMV0sW1wiWVlZWS1ERERcIiwvXFxkezR9LVxcZHszfS9dLFtcIllZWVktTU1cIiwvXFxkezR9LVxcZFxcZC8sITFdLFtcIllZWVlZWU1NRERcIiwvWystXVxcZHsxMH0vXSxbXCJZWVlZTU1ERFwiLC9cXGR7OH0vXSxcbi8vIFlZWVlNTSBpcyBOT1QgYWxsb3dlZCBieSB0aGUgc3RhbmRhcmRcbltcIkdHR0dbV11XV0VcIiwvXFxkezR9V1xcZHszfS9dLFtcIkdHR0dbV11XV1wiLC9cXGR7NH1XXFxkezJ9LywhMV0sW1wiWVlZWURERFwiLC9cXGR7N30vXV0sSGU9W1tcIkhIOm1tOnNzLlNTU1NcIiwvXFxkXFxkOlxcZFxcZDpcXGRcXGRcXC5cXGQrL10sW1wiSEg6bW06c3MsU1NTU1wiLC9cXGRcXGQ6XFxkXFxkOlxcZFxcZCxcXGQrL10sW1wiSEg6bW06c3NcIiwvXFxkXFxkOlxcZFxcZDpcXGRcXGQvXSxbXCJISDptbVwiLC9cXGRcXGQ6XFxkXFxkL10sW1wiSEhtbXNzLlNTU1NcIiwvXFxkXFxkXFxkXFxkXFxkXFxkXFwuXFxkKy9dLFtcIkhIbW1zcyxTU1NTXCIsL1xcZFxcZFxcZFxcZFxcZFxcZCxcXGQrL10sW1wiSEhtbXNzXCIsL1xcZFxcZFxcZFxcZFxcZFxcZC9dLFtcIkhIbW1cIiwvXFxkXFxkXFxkXFxkL10sW1wiSEhcIiwvXFxkXFxkL11dLEllPS9eXFwvP0RhdGVcXCgoXFwtP1xcZCspL2k7YS5jcmVhdGVGcm9tSW5wdXRGYWxsYmFjaz14KFwidmFsdWUgcHJvdmlkZWQgaXMgbm90IGluIGEgcmVjb2duaXplZCBJU08gZm9ybWF0LiBtb21lbnQgY29uc3RydWN0aW9uIGZhbGxzIGJhY2sgdG8ganMgRGF0ZSgpLCB3aGljaCBpcyBub3QgcmVsaWFibGUgYWNyb3NzIGFsbCBicm93c2VycyBhbmQgdmVyc2lvbnMuIE5vbiBJU08gZGF0ZSBmb3JtYXRzIGFyZSBkaXNjb3VyYWdlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGFuIHVwY29taW5nIG1ham9yIHJlbGVhc2UuIFBsZWFzZSByZWZlciB0byBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL2pzLWRhdGUvIGZvciBtb3JlIGluZm8uXCIsZnVuY3Rpb24oYSl7YS5fZD1uZXcgRGF0ZShhLl9pKyhhLl91c2VVVEM/XCIgVVRDXCI6XCJcIikpfSksXG4vLyBjb25zdGFudCB0aGF0IHJlZmVycyB0byB0aGUgSVNPIHN0YW5kYXJkXG5hLklTT184NjAxPWZ1bmN0aW9uKCl7fTt2YXIgSmU9eChcIm1vbWVudCgpLm1pbiBpcyBkZXByZWNhdGVkLCB1c2UgbW9tZW50Lm1heCBpbnN0ZWFkLiBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL21pbi1tYXgvXCIsZnVuY3Rpb24oKXt2YXIgYT1zYi5hcHBseShudWxsLGFyZ3VtZW50cyk7cmV0dXJuIHRoaXMuaXNWYWxpZCgpJiZhLmlzVmFsaWQoKT9hPHRoaXM/dGhpczphOm8oKX0pLEtlPXgoXCJtb21lbnQoKS5tYXggaXMgZGVwcmVjYXRlZCwgdXNlIG1vbWVudC5taW4gaW5zdGVhZC4gaHR0cDovL21vbWVudGpzLmNvbS9ndWlkZXMvIy93YXJuaW5ncy9taW4tbWF4L1wiLGZ1bmN0aW9uKCl7dmFyIGE9c2IuYXBwbHkobnVsbCxhcmd1bWVudHMpO3JldHVybiB0aGlzLmlzVmFsaWQoKSYmYS5pc1ZhbGlkKCk/YT50aGlzP3RoaXM6YTpvKCl9KSxMZT1mdW5jdGlvbigpe3JldHVybiBEYXRlLm5vdz9EYXRlLm5vdygpOituZXcgRGF0ZX07emIoXCJaXCIsXCI6XCIpLHpiKFwiWlpcIixcIlwiKSxcbi8vIFBBUlNJTkdcblooXCJaXCIsWGQpLFooXCJaWlwiLFhkKSxiYShbXCJaXCIsXCJaWlwiXSxmdW5jdGlvbihhLGIsYyl7Yy5fdXNlVVRDPSEwLGMuX3R6bT1BYihYZCxhKX0pO1xuLy8gSEVMUEVSU1xuLy8gdGltZXpvbmUgY2h1bmtlclxuLy8gJysxMDowMCcgPiBbJzEwJywgICcwMCddXG4vLyAnLTE1MzAnICA+IFsnLTE1JywgJzMwJ11cbnZhciBNZT0vKFtcXCtcXC1dfFxcZFxcZCkvZ2k7XG4vLyBIT09LU1xuLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB3aGVuZXZlciBhIG1vbWVudCBpcyBtdXRhdGVkLlxuLy8gSXQgaXMgaW50ZW5kZWQgdG8ga2VlcCB0aGUgb2Zmc2V0IGluIHN5bmMgd2l0aCB0aGUgdGltZXpvbmUuXG5hLnVwZGF0ZU9mZnNldD1mdW5jdGlvbigpe307XG4vLyBBU1AuTkVUIGpzb24gZGF0ZSBmb3JtYXQgcmVnZXhcbnZhciBOZT0vXihcXC0pPyg/OihcXGQqKVsuIF0pPyhcXGQrKVxcOihcXGQrKSg/OlxcOihcXGQrKShcXC5cXGQqKT8pPyQvLE9lPS9eKC0pP1AoPzooLT9bMC05LC5dKilZKT8oPzooLT9bMC05LC5dKilNKT8oPzooLT9bMC05LC5dKilXKT8oPzooLT9bMC05LC5dKilEKT8oPzpUKD86KC0/WzAtOSwuXSopSCk/KD86KC0/WzAtOSwuXSopTSk/KD86KC0/WzAtOSwuXSopUyk/KT8kLztPYi5mbj13Yi5wcm90b3R5cGU7dmFyIFBlPVNiKDEsXCJhZGRcIiksUWU9U2IoLTEsXCJzdWJ0cmFjdFwiKTthLmRlZmF1bHRGb3JtYXQ9XCJZWVlZLU1NLUREVEhIOm1tOnNzWlwiLGEuZGVmYXVsdEZvcm1hdFV0Yz1cIllZWVktTU0tRERUSEg6bW06c3NbWl1cIjt2YXIgUmU9eChcIm1vbWVudCgpLmxhbmcoKSBpcyBkZXByZWNhdGVkLiBJbnN0ZWFkLCB1c2UgbW9tZW50KCkubG9jYWxlRGF0YSgpIHRvIGdldCB0aGUgbGFuZ3VhZ2UgY29uZmlndXJhdGlvbi4gVXNlIG1vbWVudCgpLmxvY2FsZSgpIHRvIGNoYW5nZSBsYW5ndWFnZXMuXCIsZnVuY3Rpb24oYSl7cmV0dXJuIHZvaWQgMD09PWE/dGhpcy5sb2NhbGVEYXRhKCk6dGhpcy5sb2NhbGUoYSl9KTtcbi8vIEZPUk1BVFRJTkdcblUoMCxbXCJnZ1wiLDJdLDAsZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy53ZWVrWWVhcigpJTEwMH0pLFUoMCxbXCJHR1wiLDJdLDAsZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pc29XZWVrWWVhcigpJTEwMH0pLHpjKFwiZ2dnZ1wiLFwid2Vla1llYXJcIiksemMoXCJnZ2dnZ1wiLFwid2Vla1llYXJcIiksemMoXCJHR0dHXCIsXCJpc29XZWVrWWVhclwiKSx6YyhcIkdHR0dHXCIsXCJpc29XZWVrWWVhclwiKSxcbi8vIEFMSUFTRVNcbkooXCJ3ZWVrWWVhclwiLFwiZ2dcIiksSihcImlzb1dlZWtZZWFyXCIsXCJHR1wiKSxcbi8vIFBSSU9SSVRZXG5NKFwid2Vla1llYXJcIiwxKSxNKFwiaXNvV2Vla1llYXJcIiwxKSxcbi8vIFBBUlNJTkdcblooXCJHXCIsVmQpLFooXCJnXCIsVmQpLFooXCJHR1wiLE9kLEtkKSxaKFwiZ2dcIixPZCxLZCksWihcIkdHR0dcIixTZCxNZCksWihcImdnZ2dcIixTZCxNZCksWihcIkdHR0dHXCIsVGQsTmQpLFooXCJnZ2dnZ1wiLFRkLE5kKSxjYShbXCJnZ2dnXCIsXCJnZ2dnZ1wiLFwiR0dHR1wiLFwiR0dHR0dcIl0sZnVuY3Rpb24oYSxiLGMsZCl7YltkLnN1YnN0cigwLDIpXT11KGEpfSksY2EoW1wiZ2dcIixcIkdHXCJdLGZ1bmN0aW9uKGIsYyxkLGUpe2NbZV09YS5wYXJzZVR3b0RpZ2l0WWVhcihiKX0pLFxuLy8gRk9STUFUVElOR1xuVShcIlFcIiwwLFwiUW9cIixcInF1YXJ0ZXJcIiksXG4vLyBBTElBU0VTXG5KKFwicXVhcnRlclwiLFwiUVwiKSxcbi8vIFBSSU9SSVRZXG5NKFwicXVhcnRlclwiLDcpLFxuLy8gUEFSU0lOR1xuWihcIlFcIixKZCksYmEoXCJRXCIsZnVuY3Rpb24oYSxiKXtiW2JlXT0zKih1KGEpLTEpfSksXG4vLyBGT1JNQVRUSU5HXG5VKFwiRFwiLFtcIkREXCIsMl0sXCJEb1wiLFwiZGF0ZVwiKSxcbi8vIEFMSUFTRVNcbkooXCJkYXRlXCIsXCJEXCIpLFxuLy8gUFJJT1JPSVRZXG5NKFwiZGF0ZVwiLDkpLFxuLy8gUEFSU0lOR1xuWihcIkRcIixPZCksWihcIkREXCIsT2QsS2QpLFooXCJEb1wiLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE/Yi5fb3JkaW5hbFBhcnNlOmIuX29yZGluYWxQYXJzZUxlbmllbnR9KSxiYShbXCJEXCIsXCJERFwiXSxjZSksYmEoXCJEb1wiLGZ1bmN0aW9uKGEsYil7YltjZV09dShhLm1hdGNoKE9kKVswXSwxMCl9KTtcbi8vIE1PTUVOVFNcbnZhciBTZT1PKFwiRGF0ZVwiLCEwKTtcbi8vIEZPUk1BVFRJTkdcblUoXCJERERcIixbXCJEREREXCIsM10sXCJERERvXCIsXCJkYXlPZlllYXJcIiksXG4vLyBBTElBU0VTXG5KKFwiZGF5T2ZZZWFyXCIsXCJERERcIiksXG4vLyBQUklPUklUWVxuTShcImRheU9mWWVhclwiLDQpLFxuLy8gUEFSU0lOR1xuWihcIkRERFwiLFJkKSxaKFwiRERERFwiLExkKSxiYShbXCJERERcIixcIkRERERcIl0sZnVuY3Rpb24oYSxiLGMpe2MuX2RheU9mWWVhcj11KGEpfSksXG4vLyBGT1JNQVRUSU5HXG5VKFwibVwiLFtcIm1tXCIsMl0sMCxcIm1pbnV0ZVwiKSxcbi8vIEFMSUFTRVNcbkooXCJtaW51dGVcIixcIm1cIiksXG4vLyBQUklPUklUWVxuTShcIm1pbnV0ZVwiLDE0KSxcbi8vIFBBUlNJTkdcblooXCJtXCIsT2QpLFooXCJtbVwiLE9kLEtkKSxiYShbXCJtXCIsXCJtbVwiXSxlZSk7XG4vLyBNT01FTlRTXG52YXIgVGU9TyhcIk1pbnV0ZXNcIiwhMSk7XG4vLyBGT1JNQVRUSU5HXG5VKFwic1wiLFtcInNzXCIsMl0sMCxcInNlY29uZFwiKSxcbi8vIEFMSUFTRVNcbkooXCJzZWNvbmRcIixcInNcIiksXG4vLyBQUklPUklUWVxuTShcInNlY29uZFwiLDE1KSxcbi8vIFBBUlNJTkdcblooXCJzXCIsT2QpLFooXCJzc1wiLE9kLEtkKSxiYShbXCJzXCIsXCJzc1wiXSxmZSk7XG4vLyBNT01FTlRTXG52YXIgVWU9TyhcIlNlY29uZHNcIiwhMSk7XG4vLyBGT1JNQVRUSU5HXG5VKFwiU1wiLDAsMCxmdW5jdGlvbigpe3JldHVybn5+KHRoaXMubWlsbGlzZWNvbmQoKS8xMDApfSksVSgwLFtcIlNTXCIsMl0sMCxmdW5jdGlvbigpe3JldHVybn5+KHRoaXMubWlsbGlzZWNvbmQoKS8xMCl9KSxVKDAsW1wiU1NTXCIsM10sMCxcIm1pbGxpc2Vjb25kXCIpLFUoMCxbXCJTU1NTXCIsNF0sMCxmdW5jdGlvbigpe3JldHVybiAxMCp0aGlzLm1pbGxpc2Vjb25kKCl9KSxVKDAsW1wiU1NTU1NcIiw1XSwwLGZ1bmN0aW9uKCl7cmV0dXJuIDEwMCp0aGlzLm1pbGxpc2Vjb25kKCl9KSxVKDAsW1wiU1NTU1NTXCIsNl0sMCxmdW5jdGlvbigpe3JldHVybiAxZTMqdGhpcy5taWxsaXNlY29uZCgpfSksVSgwLFtcIlNTU1NTU1NcIiw3XSwwLGZ1bmN0aW9uKCl7cmV0dXJuIDFlNCp0aGlzLm1pbGxpc2Vjb25kKCl9KSxVKDAsW1wiU1NTU1NTU1NcIiw4XSwwLGZ1bmN0aW9uKCl7cmV0dXJuIDFlNSp0aGlzLm1pbGxpc2Vjb25kKCl9KSxVKDAsW1wiU1NTU1NTU1NTXCIsOV0sMCxmdW5jdGlvbigpe3JldHVybiAxZTYqdGhpcy5taWxsaXNlY29uZCgpfSksXG4vLyBBTElBU0VTXG5KKFwibWlsbGlzZWNvbmRcIixcIm1zXCIpLFxuLy8gUFJJT1JJVFlcbk0oXCJtaWxsaXNlY29uZFwiLDE2KSxcbi8vIFBBUlNJTkdcblooXCJTXCIsUmQsSmQpLFooXCJTU1wiLFJkLEtkKSxaKFwiU1NTXCIsUmQsTGQpO3ZhciBWZTtmb3IoVmU9XCJTU1NTXCI7VmUubGVuZ3RoPD05O1ZlKz1cIlNcIilaKFZlLFVkKTtmb3IoVmU9XCJTXCI7VmUubGVuZ3RoPD05O1ZlKz1cIlNcIiliYShWZSxJYyk7XG4vLyBNT01FTlRTXG52YXIgV2U9TyhcIk1pbGxpc2Vjb25kc1wiLCExKTtcbi8vIEZPUk1BVFRJTkdcblUoXCJ6XCIsMCwwLFwiem9uZUFiYnJcIiksVShcInp6XCIsMCwwLFwiem9uZU5hbWVcIik7dmFyIFhlPXIucHJvdG90eXBlO1hlLmFkZD1QZSxYZS5jYWxlbmRhcj1WYixYZS5jbG9uZT1XYixYZS5kaWZmPWJjLFhlLmVuZE9mPW9jLFhlLmZvcm1hdD1nYyxYZS5mcm9tPWhjLFhlLmZyb21Ob3c9aWMsWGUudG89amMsWGUudG9Ob3c9a2MsWGUuZ2V0PVIsWGUuaW52YWxpZEF0PXhjLFhlLmlzQWZ0ZXI9WGIsWGUuaXNCZWZvcmU9WWIsWGUuaXNCZXR3ZWVuPVpiLFhlLmlzU2FtZT0kYixYZS5pc1NhbWVPckFmdGVyPV9iLFhlLmlzU2FtZU9yQmVmb3JlPWFjLFhlLmlzVmFsaWQ9dmMsWGUubGFuZz1SZSxYZS5sb2NhbGU9bGMsWGUubG9jYWxlRGF0YT1tYyxYZS5tYXg9S2UsWGUubWluPUplLFhlLnBhcnNpbmdGbGFncz13YyxYZS5zZXQ9UyxYZS5zdGFydE9mPW5jLFhlLnN1YnRyYWN0PVFlLFhlLnRvQXJyYXk9c2MsWGUudG9PYmplY3Q9dGMsWGUudG9EYXRlPXJjLFhlLnRvSVNPU3RyaW5nPWVjLFhlLmluc3BlY3Q9ZmMsWGUudG9KU09OPXVjLFhlLnRvU3RyaW5nPWRjLFhlLnVuaXg9cWMsWGUudmFsdWVPZj1wYyxYZS5jcmVhdGlvbkRhdGE9eWMsXG4vLyBZZWFyXG5YZS55ZWFyPXBlLFhlLmlzTGVhcFllYXI9cmEsXG4vLyBXZWVrIFllYXJcblhlLndlZWtZZWFyPUFjLFhlLmlzb1dlZWtZZWFyPUJjLFxuLy8gUXVhcnRlclxuWGUucXVhcnRlcj1YZS5xdWFydGVycz1HYyxcbi8vIE1vbnRoXG5YZS5tb250aD1rYSxYZS5kYXlzSW5Nb250aD1sYSxcbi8vIFdlZWtcblhlLndlZWs9WGUud2Vla3M9QmEsWGUuaXNvV2Vlaz1YZS5pc29XZWVrcz1DYSxYZS53ZWVrc0luWWVhcj1EYyxYZS5pc29XZWVrc0luWWVhcj1DYyxcbi8vIERheVxuWGUuZGF0ZT1TZSxYZS5kYXk9WGUuZGF5cz1LYSxYZS53ZWVrZGF5PUxhLFhlLmlzb1dlZWtkYXk9TWEsWGUuZGF5T2ZZZWFyPUhjLFxuLy8gSG91clxuWGUuaG91cj1YZS5ob3Vycz16ZSxcbi8vIE1pbnV0ZVxuWGUubWludXRlPVhlLm1pbnV0ZXM9VGUsXG4vLyBTZWNvbmRcblhlLnNlY29uZD1YZS5zZWNvbmRzPVVlLFxuLy8gTWlsbGlzZWNvbmRcblhlLm1pbGxpc2Vjb25kPVhlLm1pbGxpc2Vjb25kcz1XZSxcbi8vIE9mZnNldFxuWGUudXRjT2Zmc2V0PURiLFhlLnV0Yz1GYixYZS5sb2NhbD1HYixYZS5wYXJzZVpvbmU9SGIsWGUuaGFzQWxpZ25lZEhvdXJPZmZzZXQ9SWIsWGUuaXNEU1Q9SmIsWGUuaXNMb2NhbD1MYixYZS5pc1V0Y09mZnNldD1NYixYZS5pc1V0Yz1OYixYZS5pc1VUQz1OYixcbi8vIFRpbWV6b25lXG5YZS56b25lQWJicj1KYyxYZS56b25lTmFtZT1LYyxcbi8vIERlcHJlY2F0aW9uc1xuWGUuZGF0ZXM9eChcImRhdGVzIGFjY2Vzc29yIGlzIGRlcHJlY2F0ZWQuIFVzZSBkYXRlIGluc3RlYWQuXCIsU2UpLFhlLm1vbnRocz14KFwibW9udGhzIGFjY2Vzc29yIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb250aCBpbnN0ZWFkXCIsa2EpLFhlLnllYXJzPXgoXCJ5ZWFycyBhY2Nlc3NvciBpcyBkZXByZWNhdGVkLiBVc2UgeWVhciBpbnN0ZWFkXCIscGUpLFhlLnpvbmU9eChcIm1vbWVudCgpLnpvbmUgaXMgZGVwcmVjYXRlZCwgdXNlIG1vbWVudCgpLnV0Y09mZnNldCBpbnN0ZWFkLiBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL3pvbmUvXCIsRWIpLFhlLmlzRFNUU2hpZnRlZD14KFwiaXNEU1RTaGlmdGVkIGlzIGRlcHJlY2F0ZWQuIFNlZSBodHRwOi8vbW9tZW50anMuY29tL2d1aWRlcy8jL3dhcm5pbmdzL2RzdC1zaGlmdGVkLyBmb3IgbW9yZSBpbmZvcm1hdGlvblwiLEtiKTt2YXIgWWU9Qy5wcm90b3R5cGU7WWUuY2FsZW5kYXI9RCxZZS5sb25nRGF0ZUZvcm1hdD1FLFllLmludmFsaWREYXRlPUYsWWUub3JkaW5hbD1HLFllLnByZXBhcnNlPU5jLFllLnBvc3Rmb3JtYXQ9TmMsWWUucmVsYXRpdmVUaW1lPUgsWWUucGFzdEZ1dHVyZT1JLFllLnNldD1BLFxuLy8gTW9udGhcblllLm1vbnRocz1mYSxZZS5tb250aHNTaG9ydD1nYSxZZS5tb250aHNQYXJzZT1pYSxZZS5tb250aHNSZWdleD1uYSxZZS5tb250aHNTaG9ydFJlZ2V4PW1hLFxuLy8gV2Vla1xuWWUud2Vlaz15YSxZZS5maXJzdERheU9mWWVhcj1BYSxZZS5maXJzdERheU9mV2Vlaz16YSxcbi8vIERheSBvZiBXZWVrXG5ZZS53ZWVrZGF5cz1GYSxZZS53ZWVrZGF5c01pbj1IYSxZZS53ZWVrZGF5c1Nob3J0PUdhLFllLndlZWtkYXlzUGFyc2U9SmEsWWUud2Vla2RheXNSZWdleD1OYSxZZS53ZWVrZGF5c1Nob3J0UmVnZXg9T2EsWWUud2Vla2RheXNNaW5SZWdleD1QYSxcbi8vIEhvdXJzXG5ZZS5pc1BNPVZhLFllLm1lcmlkaWVtPVdhLCRhKFwiZW5cIix7b3JkaW5hbFBhcnNlOi9cXGR7MSwyfSh0aHxzdHxuZHxyZCkvLG9yZGluYWw6ZnVuY3Rpb24oYSl7dmFyIGI9YSUxMCxjPTE9PT11KGElMTAwLzEwKT9cInRoXCI6MT09PWI/XCJzdFwiOjI9PT1iP1wibmRcIjozPT09Yj9cInJkXCI6XCJ0aFwiO3JldHVybiBhK2N9fSksXG4vLyBTaWRlIGVmZmVjdCBpbXBvcnRzXG5hLmxhbmc9eChcIm1vbWVudC5sYW5nIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb21lbnQubG9jYWxlIGluc3RlYWQuXCIsJGEpLGEubGFuZ0RhdGE9eChcIm1vbWVudC5sYW5nRGF0YSBpcyBkZXByZWNhdGVkLiBVc2UgbW9tZW50LmxvY2FsZURhdGEgaW5zdGVhZC5cIixiYik7dmFyIFplPU1hdGguYWJzLCRlPWVkKFwibXNcIiksX2U9ZWQoXCJzXCIpLGFmPWVkKFwibVwiKSxiZj1lZChcImhcIiksY2Y9ZWQoXCJkXCIpLGRmPWVkKFwid1wiKSxlZj1lZChcIk1cIiksZmY9ZWQoXCJ5XCIpLGdmPWdkKFwibWlsbGlzZWNvbmRzXCIpLGhmPWdkKFwic2Vjb25kc1wiKSxqZj1nZChcIm1pbnV0ZXNcIiksa2Y9Z2QoXCJob3Vyc1wiKSxsZj1nZChcImRheXNcIiksbWY9Z2QoXCJtb250aHNcIiksbmY9Z2QoXCJ5ZWFyc1wiKSxvZj1NYXRoLnJvdW5kLHBmPXtzOjQ1LC8vIHNlY29uZHMgdG8gbWludXRlXG5tOjQ1LC8vIG1pbnV0ZXMgdG8gaG91clxuaDoyMiwvLyBob3VycyB0byBkYXlcbmQ6MjYsLy8gZGF5cyB0byBtb250aFxuTToxMX0scWY9TWF0aC5hYnMscmY9d2IucHJvdG90eXBlO1xuLy8gRGVwcmVjYXRpb25zXG4vLyBTaWRlIGVmZmVjdCBpbXBvcnRzXG4vLyBGT1JNQVRUSU5HXG4vLyBQQVJTSU5HXG4vLyBTaWRlIGVmZmVjdCBpbXBvcnRzXG5yZXR1cm4gcmYuYWJzPVdjLHJmLmFkZD1ZYyxyZi5zdWJ0cmFjdD1aYyxyZi5hcz1jZCxyZi5hc01pbGxpc2Vjb25kcz0kZSxyZi5hc1NlY29uZHM9X2UscmYuYXNNaW51dGVzPWFmLHJmLmFzSG91cnM9YmYscmYuYXNEYXlzPWNmLHJmLmFzV2Vla3M9ZGYscmYuYXNNb250aHM9ZWYscmYuYXNZZWFycz1mZixyZi52YWx1ZU9mPWRkLHJmLl9idWJibGU9X2MscmYuZ2V0PWZkLHJmLm1pbGxpc2Vjb25kcz1nZixyZi5zZWNvbmRzPWhmLHJmLm1pbnV0ZXM9amYscmYuaG91cnM9a2YscmYuZGF5cz1sZixyZi53ZWVrcz1oZCxyZi5tb250aHM9bWYscmYueWVhcnM9bmYscmYuaHVtYW5pemU9bWQscmYudG9JU09TdHJpbmc9bmQscmYudG9TdHJpbmc9bmQscmYudG9KU09OPW5kLHJmLmxvY2FsZT1sYyxyZi5sb2NhbGVEYXRhPW1jLHJmLnRvSXNvU3RyaW5nPXgoXCJ0b0lzb1N0cmluZygpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgdG9JU09TdHJpbmcoKSBpbnN0ZWFkIChub3RpY2UgdGhlIGNhcGl0YWxzKVwiLG5kKSxyZi5sYW5nPVJlLFUoXCJYXCIsMCwwLFwidW5peFwiKSxVKFwieFwiLDAsMCxcInZhbHVlT2ZcIiksWihcInhcIixWZCksWihcIlhcIixZZCksYmEoXCJYXCIsZnVuY3Rpb24oYSxiLGMpe2MuX2Q9bmV3IERhdGUoMWUzKnBhcnNlRmxvYXQoYSwxMCkpfSksYmEoXCJ4XCIsZnVuY3Rpb24oYSxiLGMpe2MuX2Q9bmV3IERhdGUodShhKSl9KSxhLnZlcnNpb249XCIyLjE3LjFcIixiKHNiKSxhLmZuPVhlLGEubWluPXViLGEubWF4PXZiLGEubm93PUxlLGEudXRjPWssYS51bml4PUxjLGEubW9udGhzPVJjLGEuaXNEYXRlPWcsYS5sb2NhbGU9JGEsYS5pbnZhbGlkPW8sYS5kdXJhdGlvbj1PYixhLmlzTW9tZW50PXMsYS53ZWVrZGF5cz1UYyxhLnBhcnNlWm9uZT1NYyxhLmxvY2FsZURhdGE9YmIsYS5pc0R1cmF0aW9uPXhiLGEubW9udGhzU2hvcnQ9U2MsYS53ZWVrZGF5c01pbj1WYyxhLmRlZmluZUxvY2FsZT1fYSxhLnVwZGF0ZUxvY2FsZT1hYixhLmxvY2FsZXM9Y2IsYS53ZWVrZGF5c1Nob3J0PVVjLGEubm9ybWFsaXplVW5pdHM9SyxhLnJlbGF0aXZlVGltZVJvdW5kaW5nPWtkLGEucmVsYXRpdmVUaW1lVGhyZXNob2xkPWxkLGEuY2FsZW5kYXJGb3JtYXQ9VWIsYS5wcm90b3R5cGU9WGUsYX0pOyIsImFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5mYWN0b3J5KCdhZGRGZWVkU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgdmFyIGxpc3RGZWVkcyA9IFtdO1xyXG4gICAgZnVuY3Rpb24gc2F2ZURhdGEoZmVlZCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYWRkRmVlZCcsIHtmZWVkQXJ0aWNsZXM6IGZlZWQuZmVlZEFydGljbGVzLCBmZWVkVGl0bGU6IGZlZWQuZmVlZFRpdGxlLCBmZWVkQ2F0ZWdvcnk6IGZlZWQuZmVlZENhdGVnb3J5IH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXNwb25zZSBpbiBnZXRTYXZlZEZlZWQ6IFwiLCByZXMpO1xyXG4gICAgICAgICAgICAgICAgLy8gbGlzdEZlZWRzLnB1c2gocmVzLmRhdGEpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NhbiBub3QgZ2V0IHNhdmVkIGZlZWQnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgIH1cclxuICAgIC8vIGZ1bmN0aW9uIHNhdmVEYXRhIChmZWVkKSB7XHJcbiAgICAvLyAgICAgbGlzdEZlZWRzLnB1c2goZmVlZCk7XHJcbiAgICAvLyB9XHJcbiAgICBmdW5jdGlvbiBnZXRUZXh0KGh0bWwpIHtcclxuICAgICAgICByZXR1cm4gYW5ndWxhci5lbGVtZW50KGA8ZGl2PiR7aHRtbH08L2Rpdj5gKS50ZXh0KCkucmVwbGFjZSgvXFxuKy9nLCAnICcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEltZ1VybChodG1sKSB7XHJcbiAgICAgICAgdmFyIGltZ0VsZW0gPSBhbmd1bGFyLmVsZW1lbnQoYDxkaXY+JHtodG1sfTwvZGl2PmApLmZpbmQoJ2ltZycpWzBdO1xyXG4gICAgICAgIHJldHVybiBpbWdFbGVtID8gaW1nRWxlbS5zcmMgOiAnJztcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXREYXRlKGRhdGVSYXcpIHtcclxuICAgICAgICByZXR1cm4gbW9tZW50KG5ldyBEYXRlKGRhdGVSYXcpKS5mb3JtYXQoJ0RELU1NLVlZWVkgSEg6bW0nKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTcmNGZWVkKHVybCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvZ2V0UGFyc2VkRmVlZCcsIHsgdXJsOiB1cmwgfSkudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gcmV0dXJuICRodHRwLmpzb25wKCdodHRwczovL2FqYXguZ29vZ2xlYXBpcy5jb20vYWpheC9zZXJ2aWNlcy9mZWVkL2xvYWQ/dj0xLjAmbnVtPTUwJmNhbGxiYWNrPUpTT05fQ0FMTEJBQ0smcT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHVybCkpLlxyXG4gICAgICAgIC8vIHRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAvLyAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgLy8gfSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFBhcnNlZEFydGljbGVzKGFydGljbGVzLCBjYXRlZ29yeSkge1xyXG4gICAgICAgIHZhciBjaGFuZ2VkQXJ0aWNsZXMgPSBbXTtcclxuICAgICAgICBhcnRpY2xlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XHJcbiAgICAgICAgICAgIGNoYW5nZWRBcnRpY2xlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBlbC50aXRsZSxcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGdldFRleHQoZWwuZGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgaW1nOiBnZXRJbWdVcmwoZWwuZGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgbGluazogZWwucGVybWFsaW5rLFxyXG4gICAgICAgICAgICAgICAgZGF0ZTogZWwucHViRGF0ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBjaGFuZ2VkQXJ0aWNsZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0UGFyc2VkRmVlZChmZWVkLCBjYXRlZ29yeSkge1xyXG4gICAgICAgIGZlZWQgPSBmZWVkLmZlZWQ7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZmVlZFRpdGxlOiBmZWVkWzBdLm1ldGEudGl0bGUsXHJcbiAgICAgICAgICAgIGZlZWRDYXRlZ29yeTogY2F0ZWdvcnksXHJcbiAgICAgICAgICAgIGZlZWRBcnRpY2xlczogZ2V0UGFyc2VkQXJ0aWNsZXMoZmVlZCwgY2F0ZWdvcnkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZ1bmN0aW9uIGdldFNhdmVkRmVlZHMoKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuIGxpc3RGZWVkcztcclxuICAgIC8vIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFNyY0ZlZWQ6IGdldFNyY0ZlZWQsXHJcbiAgICAgICAgZ2V0UGFyc2VkRmVlZDogZ2V0UGFyc2VkRmVlZCxcclxuICAgICAgICBzYXZlRGF0YTogc2F2ZURhdGEsXHJcbiAgICAgICAgLy8gZ2V0U2F2ZWRGZWVkczogZ2V0U2F2ZWRGZWVkc1xyXG4gICAgfVxyXG59XSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdyc3NSZWFkZXInKS5mYWN0b3J5KCdkYXNoYm9hcmRTZXJ2aWNlJywgWydhZGRGZWVkU2VydmljZScsICckZmlsdGVyJywgJyRodHRwJywgZnVuY3Rpb24oYWRkRmVlZFNlcnZpY2UsICRmaWx0ZXIsICRodHRwKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICB2YXIgbGlzdEZlZWRzID0gW107XHJcbiAgICB2YXIgc29ydFBhcmFtOyAvL3NvcnRpbmcgb3B0aW9uIGdvdCBmcm9tIHNpZGViYXJcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDYXRlZ29yeVNpZGViYXIoKSB7XHJcbiAgICAgICAgdmFyIGxpc3RGZWVkU2lkZWJhciA9IFtdO1xyXG4gICAgICAgIHZhciBsaXN0V29yayA9IFtdO1xyXG4gICAgICAgIHZhciBmb3VuZEVsZW07XHJcblxyXG4gICAgICAgIGlmICghbGlzdEZlZWRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGlzdEZlZWRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RXb3JrLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGZlZWRJZCA6IGVsZW1lbnQuX2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIGZlZWRDYXRlZ29yeTogZWxlbWVudC5mZWVkQ2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgIGZlZWRUaXRsZTogW2VsZW1lbnQuZmVlZFRpdGxlXVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsaXN0V29yay5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICBmb3VuZEVsZW0gPSBsaXN0RmVlZFNpZGViYXIuZmluZChmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5mZWVkQ2F0ZWdvcnkgPT0gZWxlbWVudC5mZWVkQ2F0ZWdvcnk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZvdW5kRWxlbSkge1xyXG4gICAgICAgICAgICAgICAgZm91bmRFbGVtLmZlZWRUaXRsZSA9IGZvdW5kRWxlbS5mZWVkVGl0bGUuY29uY2F0KGVsZW1lbnQuZmVlZFRpdGxlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxpc3RGZWVkU2lkZWJhci5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGxpc3RGZWVkU2lkZWJhcjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRBcnRpY2xlcyhhbGxGZWVkKSB7XHJcbiAgICAgICAgdmFyIGFydGljbGVzID0gW107XHJcbiAgICAgICAgaWYgKGxpc3RGZWVkcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgbGlzdEZlZWRzLmZvckVhY2goZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFydGljbGVzID0gYXJ0aWNsZXMuY29uY2F0KGVsZW0uZmVlZEFydGljbGVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGFydGljbGVzKTtcclxuICAgICAgICByZXR1cm4gYXJ0aWNsZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0U2luZ2xlQXJ0aWNsZShsaW5rKSB7XHJcbiAgICAgICAgdmFyIGFydGljbGVzID0gZ2V0QXJ0aWNsZXMoKTtcclxuICAgICAgICBpZiAoIWFydGljbGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFydGljbGVzLmZpbmQoZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbS5saW5rID09IGxpbms7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTb3J0UGFyYW0oKSB7XHJcbiAgICAgICAgaWYgKCFzb3J0UGFyYW0pIHtcclxuICAgICAgICAgICAgc29ydFBhcmFtID0gXCJBbGxcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNvcnRQYXJhbTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRGZWVkICgpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2dldEZlZWQnKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RGZWVkcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcztcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYW4gbm90IGdldCBzYXZlZCBmZWVkJyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRBcnRpY2xlczogZ2V0QXJ0aWNsZXMsXHJcbiAgICAgICAgZ2V0Q2F0ZWdvcnlTaWRlYmFyOiBnZXRDYXRlZ29yeVNpZGViYXIsXHJcbiAgICAgICAgZ2V0U2luZ2xlQXJ0aWNsZTogZ2V0U2luZ2xlQXJ0aWNsZSxcclxuICAgICAgICBnZXRTb3J0UGFyYW06IGdldFNvcnRQYXJhbSxcclxuICAgICAgICBnZXRGZWVkOiBnZXRGZWVkXHJcbiAgICB9XHJcbn1dKTtcclxuIl19
