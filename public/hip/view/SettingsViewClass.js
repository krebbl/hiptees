define(["js/ui/View", "hip/command/Executor", "js/core/I18n",
    "hip/command/RemoveConfiguration",
    "hip/command/CloneConfiguration",
    "hip/command/ChangeOrder",
    "hip/handler/ProductHandler"], function (View, Executor, I18n, RemoveConfiguration, CloneConfiguration, ChangeOrder, ProductHandler) {


    return View.inherit({
        supportedConfiguration: null,
        defaults: {
            configuration: null,
            minimized: false
        },
        $classAttributes: ['configuration', 'executor'],
        inject: {
            executor: Executor,
            productHandler: ProductHandler
        },

        ctor: function () {
            this.callBase();
            var self = this;
            this.bind('productHandler', 'on:configurationSelected', function (event) {
                if (self.supportsConfiguration(event.$.configuration)) {
                    self.set('configuration', event.$.configuration);
                    self.set('selected', true);
                    self.set('minimized', false);
                } else {
                    self.set('minimized', false);
                    self.set('selected', false);
                }
            });
        },

        toggle: function () {
            this.set('minimized', !this.$.minimized);
        },

        cloneConfiguration: function () {
            this.$.executor.storeAndExecute(new CloneConfiguration({
                configuration: this.$.configuration
            }));
        },

        moveBackward: function () {
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

        _deleteConfiguration: function () {
            this.$.executor.storeAndExecute(new RemoveConfiguration({
                configuration: this.$.configuration
            }));
        },
        minus: function (a, b) {
            return a - b;

        }
    })
});