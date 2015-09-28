define(["js/ui/View"], function (View) {
    return View.inherit({
        defaults: {
            width: null,
            height: null,
            src: null,
            _src: null,
            alt: "",
            scrollView: null,
            loading: true,
            componentClass: "lazy-image {loadingClass()}"
        },


        ctor: function () {
            this.callBase();

            this.bind('scrollView', 'on:scroll', function () {
                this.trigger('scrolled', {});
            }, this);
        },

        _onDomAdded: function () {
            this.callBase();
            this.trigger('scrolled', {});
        },


        isInViewport: function () {
            if (this.isRendered()) {
                var rect = this.$el.getBoundingClientRect();
                return rect.top < window.innerHeight && (rect.top + rect.height >= 0);
            }
            return false;
        }.onChange('scrollView').on('scrolled'),

        _onLoaded: function () {
            this.set('loading', false);
        },
        loadingClass: function () {
            return (this.$.loading || !this.$.src) ? "loading" : ""
        }.onChange('loading', 'src')

    })
});