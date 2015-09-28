define(["js/ui/View"], function (View) {
    return View.inherit({
        defaults: {
            componentClass: "back-to-top-wrapper",
            element: null,
            maxScroll: 100,
            selected: false,
            text: "Back To Top"
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
            if (this.$.element) {
                this.$.element.$el.scrollTop = 0;
            }
        }

    })
});