define(["hip/action/ActionDomain"], function (ActionDomain) {

    return ActionDomain.inherit({
        ns: "basket",
        actions: {
            addToBasket: {
                basket: null
            },
            removeFromBasket: {
                basket: null,
                item: null
            },
            changeBasketItem: {
                basket: null,
                item: null,
                size: null,
                quantity: null
            },
            checkout: {
                basket: null
            }
        }

    });

});