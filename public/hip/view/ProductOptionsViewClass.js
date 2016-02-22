define(["hip/view/ViewBase", "hip/store/ProductStore", "hip/model/Product", "hip/action/ProductActions", "xaml!hip/dialog/ConfirmDialog"], function (ViewBase, ProductStore, Product, ProductActions, ConfirmDialog) {

    return ViewBase.inherit({
        defaults: {
            componentClass: "product-options",
            selected: false,
            product: null
        },

        inject: {
            confirmDialog: ConfirmDialog,
            productStore: ProductStore
        },

        $classAttributes: ["product"],

        _initializationComplete: function () {
            this.callBase();

            this.$.navigationStore.bind('on:navigate', function (e) {
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
            this.$.productActions.changeProductState({
                product: this.$.product,
                state: state
            });
        },

        hide: function (e) {
            e.stopPropagation();
            this.$.navActions.navigateBack();
        }


    });

});