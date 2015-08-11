define(["js/core/Content", "js/type/Color"], function (Content, Color) {
    return Content.inherit({
        defaults: {
            selectedColor: null
        },
        events: [
            "on:colorSelect"
        ],

        _dispatch: function (color) {
            color = (color instanceof Color ? "#" + color.toHexString() : color);
            this.trigger("on:colorSelect", {color: color}, this);
        },

        minus: function (a, b) {
            return a - b;
        },

        _fixZoom: function () {
            // TODO: fix zoom on ios
        }

    })
});