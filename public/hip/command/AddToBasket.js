define(["hip/command/BasketCommand"], function (BasketCommand) {
    return BasketCommand.inherit({
        defaults: {
            product: null,
            size: null,
            quantity: 1
        }
    })
});