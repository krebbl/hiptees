define(["js/core/Content", "js/type/Color", "hip/store/ProductStore", "js/core/I18n"], function (Content, Color, ProductStore, I18n) {
    return Content.inherit({
        defaults: {
            title: "",
            selectedColor: null,
            _innerColor: null,
            enableColor: true,
            showToggleColor: false,
            usedColors: "{productStore.usedColors}"
        },
        inject: {
            productStore: ProductStore,
            i18n: I18n
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