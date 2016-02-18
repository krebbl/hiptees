define(["hip/view/ViewBase", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/command/Navigate", "hip/handler/BasketHandler", "hip/command/RemoveFromBasket", "hip/command/ChangeBasketItem", "hip/command/CheckoutCommand", "hip/command/NavigateBack"], function (View, Query, Collection, Product, Navigate, BasketHandler, RemoveFromBasket, ChangeBasketItem, CheckoutCommand, NavigateBack) {
    return View.inherit({
        defaults: {
            selected: false,
            componentClass: "basket",
            loading: false,
            basket: "{basketHandler.basket}",
            checkingOut: false
        },

        inject: {
            basketHandler: BasketHandler
        },

        _initializationComplete: function () {
            this.callBase();

            this.$.navigationHandler.bind('on:navigate', function (e) {
                this.set('selected', e.$.fragment == "basket");
            }, this);


            this.$.navigationHandler.bind('on:navigate', function (e) {
                if (e.$.fragment == "profile") {
                    this.$.basketHandler.loadCombinedBasket();
                }
            }, this);

            var handleCheckout = function () {
                this.set({
                    'checkingOut': false,
                    'selected': false
                });
            };

            this.$.basketHandler.bind('on:checkoutSuccess', handleCheckout, this);
            this.$.basketHandler.bind('on:checkoutFailed', handleCheckout, this);

            this.$.basketHandler.loadCombinedBasket();
        },

        closeBasket: function (e) {
            e.stopPropagation();
            this.$.executor.storeAndExecute(new NavigateBack({}));
        },

        goCreate: function (e) {
            this.closeBasket(e);
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "productTypes"
            }));
        },

        stopPropagation: function (e) {
            e.stopPropagation();
        },

        _gotoProduct: function (product, e) {
            this.closeBasket(e);
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "product/" + product.$.id
            }));
        },

        _updateSize: function (item, event) {
            this.$.executor.storeAndExecute(new ChangeBasketItem({
                item: item,
                size: event.target.$.selectedItem
            }));
        },
        _removeItem: function (item) {
            this.$.executor.storeAndExecute(new RemoveFromBasket({
                item: item
            }));
        },
        _handleQuantityChange: function (item, event) {
            var value = parseInt(event.target.$.value);

            if (!isNaN(value) && value > 0 && item.$.quantity !== value) {
                this.$.executor.storeAndExecute(new ChangeBasketItem({
                    item: item,
                    quantity: value
                }));
            } else {
                event.target.set('value', item.$.quantity);
            }
        },
        checkout: function () {
            this.set('checkingOut', true);
            this.$.executor.storeAndExecute(new CheckoutCommand({}));
        }
    })
});