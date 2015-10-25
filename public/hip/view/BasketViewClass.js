define(["hip/view/ViewBase", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/command/Navigate", "hip/handler/BasketHandler", "hip/command/RemoveFromBasket", "hip/command/ChangeBasketItem", "hip/command/CheckoutCommand"], function (View, Query, Collection, Product, Navigate, BasketHandler, RemoveFromBasket, ChangeBasketItem, CheckoutCommand) {
    return View.inherit({
        defaults: {
            selected: false,
            componentClass: "basket",
            loading: false,
            basket: "{basketHandler.basket}"
        },

        inject: {
            basketHandler: BasketHandler
        },

        _initializationComplete: function () {
            this.callBase();

            this.$.navigationHandler.bind('on:navigate', function (e) {
                this.set('selected', e.$.fragment == "basket");
            }, this);

            this.$.basketHandler.loadCombinedBasket();
        },

        closeBasket: function(){
            this.set('selected', false);
        },

        goCreate: function () {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "productTypes"
            }));
        },

        _gotoProduct: function (product) {
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
        checkout: function(){
            this.$.executor.storeAndExecute(new CheckoutCommand({}));
        }
    })
});