define(["hip/store/Store", "xaml!hip/data/HipDataSource", "hip/model/AddBasketItem", "hip/model/Basket", "hip/model/CombinedBasket", "hip/model/CheckoutBasket", "hip/model/RemoveBasketItem"], function (Store, HipDataSource, AddBasketItem, Basket, CombinedBasket, CheckoutBasket, RemoveBasketItem) {

    return Store.inherit({
        ns: "basket",

        defaults: {
            basket: null,
            addingToBasket: false
        },
        inject: {
            api: HipDataSource
        },

        beforeAll: function (payload) {
            var basket = this.$.basket;
            if (payload.basketId) {
                if (!basket || basket.$.id !== payload.basket.$.id) {
                    basket = this.$.api.createEntity(Basket, payload.basket.$.id);
                    this.set('basket', basket);
                }
            }
        },
        addToBasket: function (payload) {

            this.trigger('on:addingToBasket', payload);

            // TODO: implement
            if (!payload.size) {
                this.trigger('on:addToBasketFailed', {reason: "Keine Größe ausgewählt"});
                return;
            }

            var action = this.$.api.createEntity(AddBasketItem);


            if (this.$.basket) {
                action.set('basket', this.$.basket);
            }

            action.set({
                product: payload.product,
                size: payload.size,
                quantity: payload.quantity
            });

            var self = this;

            action.save({}, function (err, combinedBasket) {

                if (!err) {
                    self.set('basket', combinedBasket.$.basket);
                    self._saveBasketId(self.get('basket.id'));
                    self.trigger('on:addToBasketSuccess', {product: payload.product})
                } else {
                    self.trigger('on:addToBasketFailed', {reason: err});
                }
            });

        },

        removeFromBasket: function (payload) {

            var action = this.$.api.createEntity(RemoveBasketItem);
            var self = this;

            action.set({
                item: payload.item,
                basket: payload.basket
            });

            action.save({}, function (err, combinedBasket) {
                if (!err) {
                    self.set('basket', combinedBasket.$.basket);
                    self._saveBasketId(self.get('basket.id'));
                    self.trigger('on:removeFromBasketSuccess', {product: payload.item.$.product});
                } else {
                    self.trigger('on:removeFromBasketFailed', {reason: err});
                }
            });

        },

        changeBasketItem: function (payload) {
            var action = this.$.api.createEntity(UpdateBasketItem);
            var self = this;

            action.set({
                item: payload.item,
                basket: payload.basket
            });

            if (payload.size) {
                action.set('size', payload.size);
            }
            if (payload.quantity != null) {
                action.set('quantity', payload.quantity);
            }

            action.save({}, function (err, combinedBasket) {
                if (!err) {
                    self.set('basket', combinedBasket.$.basket);
                    self._saveBasketId(self.get('basket.id'));
                    self.trigger('on:changeBasketItemSuccess', {product: payload.item.$.product})
                } else {
                    self.trigger('on:changeBasketItemFailed', {reason: err});
                }
            });
        },

        checkout: function (payload) {
            var action = this.$.api.createEntity(CheckoutBasket);
            var self = this;

            action.set({
                basket: payload.basket
            });


            action.save({}, function (err, checkout) {
                if (!err) {
                    self.trigger('on:checkoutSuccess', {
                        checkout: checkout,
                        checkoutUrl: "https://checkout.spreadshirt.de/?basketId=" + checkout.$.id
                    });
                    console.log("checkout!")
                } else {
                    self.trigger('on:checkoutFailed', {error: err});
                    console.warn(err);
                }
            });
        },

        afterAll: function () {

        },
        _saveBasketId: function (basketId) {
            try {
                window.localStorage.setItem("basketId", basketId);
            } catch (e) {
                // TODO: handle e
            }


        },
        _loadBasketId: function () {
            try {
                return window.localStorage.getItem("basketId");
            } catch (e) {
                // TODO: handle e
            }

        },
        _clearBasketId: function () {
            try {
                window.localStorage.removeItem("basketId");
            } catch (e) {
                // TODO: handle e
            }
        },
        loadCombinedBasket: function (cb) {

            var basketId = this._loadBasketId();

            if (basketId) {
                var combinedBasket = this.$.api.createEntity(CombinedBasket, basketId);


                var self = this;
                combinedBasket.fetch({}, function (err) {
                    if (!err) {
                        self.set('basket', combinedBasket.$.basket);
                    }
                    cb && cb(err, combinedBasket);
                });
            } else {
                cb && cb(null);
            }
        }

    });

});

