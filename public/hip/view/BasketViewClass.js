define(["hip/view/ViewBase", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/store/BasketStore", "hip/action/BasketActions"], function (View, Query, Collection, Product, BasketStore, BasketActions) {
    return View.inherit({
        defaults: {
            selected: false,
            componentClass: "basket",
            loading: false,
            basket: "{basketStore.basket}",
            checkingOut: false
        },

        inject: {
            basketStore: BasketStore,
            basketActions: BasketActions
        },

        _initializationComplete: function () {
            this.callBase();

            this.$.navigationStore.bind('on:navigate', function (e) {
                this.set('selected', e.$.fragment == "basket");
            }, this);


            this.$.navigationStore.bind('on:navigate', function (e) {
                if (e.$.fragment == "profile") {
                    this.$.basketStore.loadCombinedBasket();
                }
            }, this);

            var handleCheckout = function () {
                this.set({
                    'checkingOut': false,
                    'selected': false
                });
            };

            this.$.basketStore.bind('on:checkoutSuccess', handleCheckout, this);
            this.$.basketStore.bind('on:checkoutFailed', handleCheckout, this);

            this.$.basketStore.loadCombinedBasket();
        },

        closeBasket: function (e) {
            e.stopPropagation();

            this.$.navActions.navigateBack();
        },

        goCreate: function (e) {
            this.closeBasket(e);
        },

        stopPropagation: function (e) {
            e.stopPropagation();
        },

        _gotoProduct: function (product, e) {
            this.closeBasket(e);
            this.$.navActions.navigate({
                fragment: "product/" + product.$.id
            });
        },

        _updateSize: function (item, event) {
            this.$.basketActions.changeBasketItem({
                item: item,
                size: event.target.$.selectedItem
            });
        },
        _removeItem: function (item) {
            this.$.basketActions.removeFromBasket({
                item: item
            });
        },
        _handleQuantityChange: function (item, event) {
            var value = parseInt(event.target.$.value);

            if (!isNaN(value) && value > 0 && item.$.quantity !== value) {
                this.$.basketActions.changeBasketItem({
                    item: item,
                    quantity: value
                });
            } else {
                event.target.set('value', item.$.quantity);
            }
        },
        checkout: function () {
            this.set('checkingOut', true);
            this.$.basketActions.checkout();
        }
    })
});