define(["hip/view/ViewBase", "hip/handler/ProductHandler", "hip/model/Product", "hip/command/ChangeProductState", "xaml!hip/dialog/ConfirmDialog", "hip/command/NavigateBack"], function (ViewBase, ProductHandler, Product, ChangeProductState, ConfirmDialog, NavigateBack) {

    return ViewBase.inherit({
        defaults: {
            componentClass: "product-options",
            selected: false,
            product: null
        },

        inject: {
            confirmDialog: ConfirmDialog,
            productHandler: ProductHandler
        },

        $classAttributes: ["product"],

        _initializationComplete: function () {
            this.callBase();

            this.$.navigationHandler.bind('on:navigate', function (e) {
                var fragment = e.$.fragment;
                if (!fragment) {
                    this.set('selected', false);
                    return;
                }
                var match = fragment.match(/productOptions\/(.+)/);
                if (match) {
                    var productId = match[1];
                    var product = this.$.api.createEntity(Product, productId);
                    this.set('product', product);
                    var self = this;
                    setTimeout(function () {
                        self.set('selected', true);
                    }, 20);
                } else {
                    this.set('selected', false);
                }
            }, this);
        },

        confirmChangeState: function (state, event) {
            event.stopPropagation();
            var self = this;
            this.$.confirmDialog.confirm(this.$.i18n.t('dialog.confirmDelete'), function (err, dialog, ret) {
                if (ret) {
                    self.set('selected', false);
                    self.changeState(state);
                }
            });
        },

        changeState: function (state, event) {
            this.$.executor.storeAndExecute(new ChangeProductState({
                product: this.$.product,
                state: state
            }));
        },

        hide: function () {
            this.$.executor.storeAndExecute(new NavigateBack());
        }


    });

});