define(["js/core/Content", "js/type/Color"], function (Content, Color) {
    return Content.inherit({
        defaults: {
            selectedColor: null,
            _innerColor: null
        },
        events: [
            "on:colorSelect"
        ],

        _commitSelectedColor: function (color) {
            if (color) {
                this.set('_innerColor', Color.fromHexString(color));
            }
        },

        _dispatch: function (color) {
            if (color instanceof Color) {
                color = color.toString();
            } else {
                this.set('selectedColor', color, {force: true});
            }
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