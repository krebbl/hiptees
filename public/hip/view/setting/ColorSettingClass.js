define(["js/core/Content", "js/type/Color", "hip/store/ProductStore"], function (Content, Color, ProductStore) {
    return Content.inherit({
        defaults: {
            selectedColor: null,
            _innerColor: null,
            enableColor: true,
            showToggleColor: false,
            usedColors: "{productStore.usedColors}"
        },
        inject: {
            productStore: ProductStore
        },
        events: [
            'on:colorSelect',
            'on:colorToggle'
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

        _toggleFill: function () {
            this.set('enableColor', !this.$.enableColor);
            this.trigger('on:colorToggle', {enabled: this.$.enableColor});
        },

        _fixZoom: function () {
            // TODO: fix zoom on ios
        }

    })
});