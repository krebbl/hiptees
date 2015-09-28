define(["hip/command/BasketCommand"], function (BasketCommand) {
    return BasketCommand.inherit({
        defaults: {
            basketItem: null,
            size: null,
            quantity: null
        }
    })
});