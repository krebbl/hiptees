define(["js/ui/View", "hip/command/Executor", "js/core/I18n",
    "hip/command/RemoveConfiguration",
    "hip/command/CloneConfiguration",
    "hip/command/ChangeOrder",
    "hip/handler/ProductHandler"], function (View, Executor, I18n, RemoveConfiguration, CloneConfiguration, ChangeOrder, ProductHandler) {


    return View.inherit({
        supportedConfiguration: null,
        defaults: {
            configuration: null,
            minimized: false,
            selected: false,
            visible: false,
            subContentSelected: false
        },
        $classAttributes: ['configuration', 'executor'],
        inject: {
            executor: Executor,
            productHandler: ProductHandler,
            i18n: I18n
        },

        events: ['on:closeClicked'],

        ctor: function () {
            this.callBase();
            var self = this;
            this.bind('productHandler', 'on:configurationSelected', function (event) {
                if (self.supportsConfiguration(event.$.configuration)) {
//                    var hadConfiguration = !!self.$.configuration;
                    self.set('configuration', event.$.configuration);
                    self.set('visible', true);
                    self.set('selected', true);
//                    self.set('minimized', self.$.minimized && hadConfiguration);
                } else {
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

        cloneConfiguration: function () {
            this.$.executor.storeAndExecute(new CloneConfiguration({
                configuration: this.$.configuration
            }));
        },

        removeConfiguration: function () {
            this.$.executor.storeAndExecute(new RemoveConfiguration({
                configuration: this.$.configuration
            }));
        },

        layerUp: function () {
            var product = this.$.productHandler.$.product;
            this.$.executor.storeAndExecute(new ChangeOrder({
                configuration: this.$.configuration,
                index: Math.min(product.numConfigurations() - 1, product.getIndexOfConfiguration(this.$.configuration) + 1)
            }));
        },

        layerDown: function () {
            var product = this.$.productHandler.$.product;
            this.$.executor.storeAndExecute(new ChangeOrder({
                configuration: this.$.configuration,
                index: Math.max(0, product.getIndexOfConfiguration(this.$.configuration) - 1)
            }));
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