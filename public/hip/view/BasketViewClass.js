define(["hip/view/ViewBase", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/store/BasketStore", "hip/action/BasketActions"], function (View, Query, Collection, Product, BasketStore, BasketActions) {
    return View.inherit({
        defaults: {
            componentClass: "basket",
            loading: false,
            basket: "{basketStore.basket}",
            checkingOut: false
        },

        inject: {
            basketStore: BasketStore,
            basketActions: BasketActions
        },

        events: [
            "on:close"
        ],

        _initializationComplete: function () {
            this.callBase();

            var handleCheckout = function () {
                this.set({
                    'checkingOut': false,
                    'selected': false
                });
            };

            this.$.basketStore.bind('on:checkoutSuccess', handleCheckout, this);
            this.$.basketStore.bind('on:checkoutFailed', handleCheckout, this);
        },

        closeBasket: function (e) {
            e.stopPropagation();

            this.trigger('on:close');
        },

        showMenu: function(menu){
            this.$.navActions.showMenu({menu: menu});
        },

        goCreate: function (e) {
            this.closeBasket(e);
        },

        stopPropagation: function (e) {
            e.stopPropagation();
        },

        _editBasketItem: function (item, e) {
            this.closeBasket(e);
            var prop = this.$.basketStore.getPropertyOfBasketItem("product", item);
            this.$.productActions.selectPreset({
                productId: prop.value
            });
        },

        _updateSize: function (item, event) {
            this.$.basketActions.changeBasketItem({
                item: item,
                size: event.target.$.selectedItem
            });
        },
        _removeItem: function (item) {
            this.$.basketActions.removeBasketItem({
                item: item
            });
        },
        _handleQuantityChange: function (item, event) {
            var value = parseInt(event.target.$.value);

            if (!isNaN(value) && value > 0 && item.quantity !== value) {
                this.$.basketActions.changeBasketItem({
                    item: item,
                    quantity: value
                });
            } else {
                event.target.set('value', item.quantity);
            }
        },

        _handleQuantityKeyUp: function (event) {
            if (event.domEvent.which === 13) {
                event.target.blur();
            }

        },

        _cloneItem: function (item) {
            this.$.basketActions.cloneBasketItem({item: item});
        },

        and: function (a, b) {
            return a && b;
        },

        checkout: function () {
            this.set('checkingOut', true);
            this.$.basketActions.checkout();
        }
    })
});