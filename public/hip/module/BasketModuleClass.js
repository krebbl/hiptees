define(["hip/module/BaseModule", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/command/Navigate", "hip/handler/BasketHandler", "hip/command/RemoveFromBasket", "hip/command/ChangeBasketItem"], function (BaseModule, Query, Collection, Product, Navigate, BasketHandler, RemoveFromBasket, ChangeBasketItem) {
    return BaseModule.inherit({
        defaults: {
            loading: false,
            basket: "{basketHandler.basket}"
        },

        inject: {
            basketHandler: BasketHandler
        },

        prepare: function (fragment, callback) {

            this.$.basketHandler.loadCombinedBasket(function (err) {
                callback && callback(err);
            });

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
        }
    })
});