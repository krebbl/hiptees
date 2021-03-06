define(["js/ui/View", "hip/view/SwipeView", "hip/handler/NavigationHandler"], function (View, SwipeView, NavigationHandler) {
    return View.inherit({
        defaults: {
            defaultFragment: null,
            currentView: null,
            currentFragment: null,
            componentClass: "swipe-container {currentView.name}",
            startModule: null
        },

        inject: {
            navigationHandler: NavigationHandler
        },

        events: [
            "on:goTo",
            "on:goToFinished"
        ],

        $classAttributes: ["currentView"],

        ctor: function () {
            this.callBase();

            this.bind('navigationHandler', 'on:navigate', function (e) {
                this.goTo(e.$.fragment);
            }, this);
        },

        addChild: function (child) {
            this.callBase();
            if (child instanceof SwipeView) {
                this.$swipeChildren = this.$swipeChildren || [];
                this.$swipeChildren.push(child);
                child.set('container', this);
//                child.bind('on:pointerdown', this.swipe, this);
//                if (!this.$.currentView) {
//                    this.set('currentView', child);
//                    child.set('status', 'current');
//                }
            }
        },

        _bindDomEvents: function () {
            this.callBase();

            var self = this;
//            this.bindDomEvent('pointerdown', function (e) {
////                e.stopPropagation();
//                self.swipe(e);
//            }, true)
        },

        _onDomAdded: function () {
            this.callBase();

            if (this.$.defaultFragment) {
                this.goTo(this.$.defaultFragment);
            }
        },

        goTo: function (fragment) {
            var newView;
            for (var i = 0; i < this.$swipeChildren.length; i++) {
                var child = this.$swipeChildren[i];
                if (child.handlesFragment(fragment)) {
                    newView = child;
                    break;
                }
            }

            if (newView) {
                var currentIndex = this.$swipeChildren.indexOf(this.$.currentView),
                    newIndex = i,
                    isNext = currentIndex < newIndex;

                for (var j = newIndex + 1; j < currentIndex; j++) {
                    this.$swipeChildren[j].set('status', 'next');
                }

                this.trigger('on:goTo', {}, this);
                var self = this;
                //if(this.isRendered()){
                    if (!this.$.currentView) {
                        this.addClass('no-transition');
                    } else {
                        this.removeClass('no-transition');
                    }
                //}
                var oldCurrentView = this.$.currentView;
                flow()
                    .seq(function (cb) {
                        newView.set({
                            'loading': true,
                            'status': 'current'
                        });

                        if (oldCurrentView && oldCurrentView !== newView) {
                            oldCurrentView.set('status', isNext ? 'prev' : 'next');
                        }

                        self.set('currentView', newView);
                        if (isNext || fragment !== self.$.currentFragment) {
                            setTimeout(function () {
                                newView.prepare(fragment, cb);
                            }, 300);
                        } else {
                            cb();
                        }
                    })
                    .exec(function (err) {
                        if (!err) {
                            self.set('currentFragment', fragment);
                        }
                        newView.set('loading', false);

                        self.trigger('on:goToFinished', {}, self);
                    });
            }

        },
        goBack: function () {

        },

        swipe: function (e) {
            if (this.$.currentView) {
                this.$swiped = false;
                var self = this;
                var pointerEvent = e;
                if (pointerEvent.pageX < 100) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.$downLeft = pointerEvent.pageX;
                    this.$swipeMove = this.$swipeMove || function (e) {
                            self.swipeMove(e);
                            //                        self.$currentView.$el.style.
                        };
                    this.$swipeUp = this.$swipeUp || function (e) {
                            self.swipeUp(e);
                        };
                    this.dom(this.$stage.$document).bindDomEvent('pointermove', this.$swipeMove);
                    this.dom(this.$stage.$document).bindDomEvent('pointerup', this.$swipeUp, true)
                }
            }
        },
        swipeUp: function (e) {
            var currentView = this.$.currentView;
            if (currentView && this.$swiped) {
                e.stopPropagation();

                currentView.$el.removeAttribute("style");

                if (this.$swiped) {
                    var rect = currentView.$el.getBoundingClientRect();

                    if (rect.left > rect.width * 0.4) {
                        this.goBack();
                    }
                }
            }

            this.dom(this.$stage.$document).unbindDomEvent('pointermove', this.$swipeMove);
            this.dom(this.$stage.$document).unbindDomEvent('pointerup', this.$swipeUp, true);
        },

        swipeMove: function (event) {
            this.$swiped = true;
            var changedEvent = event.changedTouches ? event.changedTouches[0] : event;
            var left = this.$downLeft - changedEvent.pageX;
            var currentView = this.$.currentView;

            currentView.$el.style.left = Math.max(0, (-1 * left)) + "px";

            currentView.$el.style.transition = "none";
        }
    })
});