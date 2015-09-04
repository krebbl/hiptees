define(["hip/command/ProductCommand"], function (ProductCommand) {

    return ProductCommand.inherit({
        defaults: {
            productId: null,
            asPreset: false,
            lazyLoadConfigurations: false
        }
    })
});