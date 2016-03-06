define(["hip/action/ActionDomain"], function (ActionDomain) {

    return ActionDomain.inherit({
        ns: "basket",
        actions: {
            addToBasket: {},
            removeBasketItem: {
                item: null
            },
            changeBasketItem: {
                item: null,
                size: null,
                quantity: null
            },
            cloneBasketItem: {
                item: null
            },
            checkout: {}
        }

    });

});