define(["js/ui/View"], function (View) {

    // easing functions http://goo.gl/5HLl8
    Math.easeInOutQuad = function(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t + b
        }
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    // requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
    var requestAnimationFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    return View.inherit({
        defaults: {
            componentClass: "back-to-top-wrapper",
            element: null,
            maxScroll: 100,
            selected: false
        },

        _commitElement: function (element) {
            if (element) {
                element.bind('on:scroll', this._handleScroll, this)
            }
        },

        _handleScroll: function (e) {
            var domEvent = e.domEvent;
            if (e.domEvent.target.scrollTop > this.$.maxScroll && !this.$.selected) {
                this.set('selected', true);
            } else if (e.domEvent.target.scrollTop <= this.$.maxScroll && this.$.selected) {
                this.set('selected', false);
            }
        },

        goBackToTop: function () {
            var element = this.$.element,
                el = element.$el;
            if (element) {
                scrollTo(0);
            }


            function scrollTo (to) {

                // figure out if this is moz || IE because they use documentElement
                var start = el.scrollTop,
                    change = to - start,
                    currentTime = 0,
                    increment = 20,
                    duration = 500;

                var animateScroll = function() {
                    // increment the time
                    currentTime += increment;
                    // find the value with the quadratic in-out easing function

                    el.scrollTop = Math.easeInOutQuad(currentTime, start, change, duration);


                    // do the animation unless its over
                    if (currentTime < duration) {
                        requestAnimationFrame(animateScroll);
                    }
                };

                animateScroll();
            }


        }

    })
});