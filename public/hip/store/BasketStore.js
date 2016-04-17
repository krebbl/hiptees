define(["hip/store/Store", "xaml!hip/data/HipDataSource", "hip/model/AddToSprdBasket", "hip/model/Basket", "hip/model/CombinedBasket", "hip/model/CheckoutBasket", "hip/model/RemoveBasketItem", "hip/data/SprdDataSource", "underscore"], function (Store, HipDataSource, AddToSprdBasket, Basket, CombinedBasket, CheckoutBasket, RemoveBasketItem, SprdDataSource, _) {

    var dotCurrencyCodes = ['USD', 'GBP'];

    return Store.inherit({
        ns: "basket",

        defaults: {
            combinedBasket: null,
            basket: "{combinedBasket.basket}",
            updatingBasket: false,
            loadingBasket: false
        },
        inject: {
            api: HipDataSource,
            sprdApi: SprdDataSource
        },

        beforeAll: function (payload) {
            var basket = this.$.basket;
            //if (payload.basketId) {
            //    if (!basket || basket.id !== payload.basketId) {
            //        basket = this.$.api.createEntity(Basket, payload.basket.$.id);
            //        this.set('basket', basket);
            //    }
            //}
        },

        addToBasket: function (payload) {
            this.set('updatingBasket', true);
            this.trigger('on:addingToBasket', payload);

            // TODO: implement
            if (!payload.size) {
                this.trigger('on:addToBasketFailed', {reason: "NO_SIZE_SELECTED"});
                return;
            }

            var action = this.$.api.createEntity(AddToSprdBasket);


            if (this.$.basket) {
                action.set('basketId', this.$.basket.id);
            }

            action.set({
                product: payload.product,
                size: payload.size,
                quantity: payload.quantity
            });

            var self = this;

            action.save({}, function (err, combinedBasket) {

                if (!err) {
                    self.set('combinedBasket', combinedBasket.$);
                    self._saveBasketId(combinedBasket.get('basket.id'));
                    self.trigger('on:addToBasketSuccess', {product: payload.product})
                } else {
                    self.trigger('on:addToBasketFailed', {reason: err});
                }

                self.set('updatingBasket', false);
            });

        },

        totalQuantity: function () {
            var basket = this.$.basket;
            if (!basket) {
                return 0;
            } else {
                var quantity = 0;
                for (var i = 0; i < basket.basketItems.length; i++) {
                    var item = basket.basketItems[i];
                    quantity += item.quantity;
                }
                return quantity;
            }
        }.onChange("basket"),

        removeBasketItem: function (payload) {

            if (payload.item) {
                var self = this;
                this.set('updatingBasket', true);
                this.$.sprdApi.removeBasketItem(this.$.basket.id, payload.item.id, function (err) {
                    if (!err) {
                        self.loadCombinedBasket(function () {
                            self.set('updatingBasket', false);
                        });
                        self.trigger('on:basketItemRemoved', {item: payload.item});
                    } else {
                        self.set('updatingBasket', false);
                    }
                });
            }

        },

        changeBasketItem: function (payload) {

            this.set('updatingBasket', true);

            var item = payload.item;

            var changedItem = _.clone(item);

            var self = this;

            if (payload.size) {
                var prop = this.getPropertyOfBasketItem("size", changedItem);
                prop.value = payload.size.id;
            }
            if (payload.quantity != null) {
                changedItem.quantity = payload.quantity;
            }

            var basketId = this.$.basket.id;

            this.$.sprdApi.updateBasketItem(basketId, changedItem, function (err) {

                if (!err) {
                    if (payload.quantity != null) {
                        self.loadCombinedBasket(function () {
                            self.set('updatingBasket', false);
                        });
                    } else {
                        self.set('updatingBasket', false);
                    }
                    self.trigger('on:basketItemChanged', {item: payload.item});
                } else {
                    self.set('updatingBasket', false);
                }

            });

        },

        cloneBasketItem: function (payload) {

            var clonedItem = _.clone(payload.item);
            delete clonedItem.id;
            delete clonedItem.href;

            clonedItem.quantity = 1;

            var self = this;

            self.set('updatingBasket', true);

            this.$.sprdApi.addBasketItem(clonedItem, this.$.basket.id, function (err) {
                if (!err) {
                    self.loadCombinedBasket(function () {
                        self.set('updatingBasket', false);
                    });
                    self.trigger('on:basketItemCloned', {item: payload.item});
                } else {
                    self.set('updatingBasket', false);
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

        getPropertyOfBasketItem: function (propertyKey, basketItem) {
            for (var i = 0; i < basketItem.element.properties.length; i++) {
                var prop = basketItem.element.properties[i];
                if (prop.key === propertyKey) {
                    return prop;
                }
            }
            return null;
        },

        getProductImage: function (basketItem) {
            var product;
            var prop = this.getPropertyOfBasketItem("product", basketItem);
            if (prop) {
                for (var i = 0; i < this.$.combinedBasket.products.products.length; i++) {
                    product = this.$.combinedBasket.products.products[i];

                    if (product.id === prop.value) {
                        return product.resources[0].href;
                    }
                }
            }

            return "";
        },

        getSize: function (basketItem) {
            var prop = this.getPropertyOfBasketItem("size", basketItem);

            return prop ? {
                id: prop.value
            } : null;

        },

        getSizes: function (basketItem) {
            var productType;
            var prop = this.getPropertyOfBasketItem("productType", basketItem);
            if (prop) {
                for (var i = 0; i < this.$.combinedBasket.productTypes.productTypes.length; i++) {
                    productType = this.$.combinedBasket.productTypes.productTypes[i];

                    if (productType.id === prop.value) {
                        break;
                    }
                }
            }

            if (productType) {
                return productType.sizes;
            }
        },

        formatPrice: function (price, type) {
            type = type || "display";
            var currency = this.$.combinedBasket.currency;


            var stringPrice = price[type].toFixed(currency.decimalCount);

            var isDotCurrency = dotCurrencyCodes.indexOf(currency.isoCode) > -1;
            if (!isDotCurrency) {
                stringPrice = stringPrice.replace(".", ",");
            }

            return currency.pattern.replace("%", stringPrice).replace("$", currency.symbol);
        },

        loadCombinedBasket: function (cb) {

            var basketId = this._loadBasketId();
            var self = this;
            if (basketId) {
                this.set('loadingBasket', true);
                this.$.sprdApi.loadCombinedBasket(basketId, function (err, combinedBasket) {
                    self.set('combinedBasket', err ? null : combinedBasket);
                    if (err) {
                        self._clearBasketId();
                    }
                    self.set('loadingBasket', false);
                    cb && cb();
                });
            }

        },
        checkout: function () {
            if (this.$.basket) {
                var link = _.find(this.$.basket.links || [], function (l) {
                    return l.type === "defaultCheckout";
                });
                if (link) {
                    window.location.href = link.href;
                }
            }
        }

    });

});

