define(["hip/command/ProductCommand"], function (ProductCommand) {

    return ProductCommand.inherit({
        defaults: {
            configuration: null,
            single: true
        }
    })
});