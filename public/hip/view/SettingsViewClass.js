define(["js/ui/View", "js/core/I18n",
    "hip/action/ProductActions",
    "hip/store/ProductStore"], function (View, I18n, ProductActions, ProductStore) {


    return View.inherit({
        supportedConfiguration: null,
        defaults: {
            selectedConfiguration: "{productStore.selectedConfiguration}",
            configuration: null,
            minimized: false,
            selected: false,
            visible: false,
            subContentSelected: false
        },
        $classAttributes: ['configuration', 'productActions'],
        inject: {
            productActions: ProductActions,
            productStore: ProductStore,
            i18n: I18n
        },

        events: ['on:closeClicked'],

        _commitSelectedConfiguration: function (configuration) {
            if (this.supportsConfiguration(configuration)) {
                this.set('configuration', configuration, {force: true});
                this.set('visible', true);
                this.set('selected', true);
            } else {
                this.set('selected', false);
                this._selectSubContent(null);
            }
        },

        formatNumber: function (value, digits, multiply) {
            if (typeof(value) == "number") {
                multiply = multiply || 1;
                digits = isNaN(digits) ? 2 : digits;
                return (value * multiply).toFixed(digits);
            }
            return "";
        },

        toggle: function () {
            this.trigger('on:closeClicked', {}, this);
        },

        _renderMinimized: function (minimized) {
            if (minimized) {
                this.addClass('minimize');
            } else {
                this.removeClass('minimize');
            }
        },

        supportsConfiguration: function (configuration) {
            return this.supportedConfiguration && configuration instanceof this.supportedConfiguration;
        },

        minus: function (a, b) {
            return a - b;

        },
        _selectSubContent: function (subContent) {
            if (subContent) {
                this.$.placeholder.set('content', subContent);
                var header = subContent.findContent("headerInfo");
                this.$.headerInfo.set('content', header);
            } else if (this.$.headerInfo) {
                this.$.headerInfo.set('content', null);
            }
            this.set('subContentSelected', !!subContent);
        }

    })
});