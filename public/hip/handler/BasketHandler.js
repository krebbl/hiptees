define(["hip/handler/CommandHandler", "hip/command/BasketCommand", "hip/command/AddToBasket", "hip/command/RemoveFromBasket", "hip/command/ChangeBasketItem", "xaml!hip/data/HipDataSource", "hip/model/AddBasketItem", "hip/model/RemoveBasketItem", "hip/model/UpdateBasketItem", "hip/model/Basket", "hip/model/CombinedBasket", "hip/command/CheckoutCommand", "hip/model/CheckoutBasket"],
    function (Handler, BasketCommand, AddToBasket, RemoveFromBasket, ChangeBasketItem, HipDataSource, AddBasketItem, RemoveBasketItem, UpdateBasketItem, Basket, CombinedBasket, CheckoutCommand, CheckoutBasket) {
        return Handler.inherit({
            defaults: {
                basket: null
            },
            inject: {
                api: HipDataSource
            },
            isResponsibleForCommand: function (command) {
                return command instanceof BasketCommand;
            },
            handleCommand: function (command) {
                var basket = this.$.basket,
                    action,
                    self = this;
                if (!basket) {
                    var basketId = this._loadBasketId();
                    if (basketId) {
                        basket = this.$.api.createEntity(Basket, basketId);
                    }
                }

                if (command instanceof AddToBasket) {

                    this.trigger('on:addingToBasket', command.$);

                    // TODO: implement
                    if (!command.$.size) {
                        this.trigger('on:addToBasketFailed', {reason: "Keine Größe ausgewählt"});
                        command.$.callback && command.$.callback();
                        return;
                    }

                    action = this.$.api.createEntity(AddBasketItem);


                    if (basket) {
                        action.set('basket', basket);
                    }

                    action.set({
                        product: command.$.product,
                        size: command.$.size,
                        quantity: command.$.quantity
                    });
                    action.save({}, function (err, combinedBasket) {

                        if (!err) {
                            self.set('basket', combinedBasket.$.basket);
                            self._saveBasketId(self.get('basket.id'));
                            self.trigger('on:addToBasketSuccess', {product: command.$.product})
                        } else {
                            self.trigger('on:addToBasketFailed', {reason: err});
                        }
                        command.$.callback && command.$.callback(err);
                    });

                } else if (command instanceof RemoveFromBasket) {
                    action = this.$.api.createEntity(RemoveBasketItem);

                    action.set({
                        item: command.$.item,
                        basket: basket
                    });

                    action.save({}, function (err, combinedBasket) {
                        if (!err) {
                            self.set('basket', combinedBasket.$.basket);
                            self._saveBasketId(self.get('basket.id'));
                            self.trigger('on:removeFromBasketSuccess', {product: command.$.item.$.product});
                        } else {
                            self.trigger('on:removeFromBasketFailed', {reason: err});
                        }
                    });

                } else if (command instanceof ChangeBasketItem) {

                    action = this.$.api.createEntity(UpdateBasketItem);

                    action.set({
                        item: command.$.item,
                        basket: basket
                    });

                    if (command.$.size) {
                        action.set('size', command.$.size);
                    }
                    if (command.$.quantity != null) {
                        action.set('quantity', command.$.quantity);
                    }

                    action.save({}, function (err, combinedBasket) {
                        if (!err) {
                            self.set('basket', combinedBasket.$.basket);
                            self._saveBasketId(self.get('basket.id'));
                            self.trigger('on:removeFromBasketSuccess')
                        } else {
                            self.trigger('on:removeFromBasketFailed', {reason: err});
                        }
                    });

                } else if (command instanceof CheckoutCommand) {
                    action = this.$.api.createEntity(CheckoutBasket);

                    action.set({
                        basket: basket
                    });

                    action.save({}, function (err, checkout) {
                        if (!err) {
                            self.trigger('on:checkoutSuccess',{checkout: checkout, checkoutUrl: "https://checkout.spreadshirt.de/?basketId=" + checkout.$.id});
                            console.log("checkout!")
                        } else {
                            self.trigger('on:checkoutFailed', {error: err});
                            console.warn(err);
                        }
                    });
                }
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
        })
    });