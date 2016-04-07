define(["js/ui/View", "js/core/I18n",
    "hip/action/ProductActions",
    "hip/store/ProductStore"], function (View, I18n, ProductActions, ProductStore) {


    return View.inherit({
        supportedConfiguration: null,
        defaults: {
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

        ctor: function () {
            this.callBase();
            var self = this;
            this.bind('productStore', 'on:configurationSelected', function (event) {
                if (self.supportsConfiguration(event.$.configuration)) {
//                    var hadConfiguration = !!self.$.configuration;
                    self.set('configuration', event.$.configuration);
                    self.set('visible', true);
                    self.set('selected', true);
//                    self.set('minimized', self.$.minimized && hadConfiguration);
                } else {
                    self.set('configuration', null);
                    self.set('selected', false);
//                    self.set('minimized', false);
                    self._selectSubContent(null);
                }
            });
        },

        formatNumber: function (value, digits) {
            if (typeof(value) == "number") {
                digits = digits || 2;
                return value.toFixed(digits);
            }
            return "";
        },

        toggle: function () {
            this.trigger('on:closeClicked', {}, this);
        },

        layerUp: function () {
            var product = this.$.productStore.$.product;
            this.$.productActions.changeOrder({
                configuration: this.$.configuration,
                index: Math.min(product.numConfigurations() - 1, product.getIndexOfConfiguration(this.$.configuration) + 1)
            });
        },

        layerDown: function () {
            var product = this.$.productStore.$.product;
            this.$.productActions.changeOrder({
                configuration: this.$.configuration,
                index: Math.max(0, product.getIndexOfConfiguration(this.$.configuration) - 1)
            });
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