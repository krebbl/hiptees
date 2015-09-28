define(["js/ui/View", "hip/view/SwipeView", "hip/handler/NavigationHandler"], function (View, SwipeView, NavigationHandler) {
    return View.inherit({
        defaults: {
            defaultFragment: null,
            currentView: null,
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

            this.bind('navigationHandler', 'on:navigateBack', function () {
                this.goBack();
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

                this.trigger('on:goTo', {}, this);
                var self = this;
                if (!this.$.currentView) {
                    this.addClass('no-transition');
                } else {
                    this.removeClass('no-transition');
                }
                flow()
                    .seq(function (cb) {
                        newView.set({
                            'loading': true,
                            'status': 'current'
                        });

                        self.$viewStack = self.$viewStack || [];
                        var currentView = self.$.currentView;

                        if (currentView && currentView !== newView) {
                            currentView.set('status', isNext ? 'prev' : 'next');
                            self.$viewStack.push(currentView);
                        }

                        self.set('currentView', newView);
                        setTimeout(function () {
                            newView.prepare(fragment, cb)
                        }, 300);
                    })
                    .exec(function (err) {
                        if (!err) {

                        }
                        newView.set('loading', false);
                        //self.removeClass('loading');

                        self.trigger('on:goToFinished', {}, self);
                    });
            }

        },
        goBack: function () {
            if (this.$viewStack && this.$viewStack.length > 0) {
                var m = this.$viewStack.pop();
                this.$.currentView && this.$.currentView.set('status', 'next');
                this.set('currentView', m);
                m.set('status', 'current');
            }
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