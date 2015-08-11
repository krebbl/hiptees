define(["hip/command/ProductCommand"], function (ProductCommand) {

    return ProductCommand.inherit({
        defaults: {
            offset: {
                x: 0.5,
                y: 0.2
            }
        }
    })
});