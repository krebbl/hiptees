define(["hip/command/ProductCommand"], function (ProductCommand) {

    return ProductCommand.inherit({
        defaults: {
            text: "Text",
            paragraphStyle: null,
            leafStyle: null,
            offset: {
                x: 0.5,
                y: 0.2
            },
            size: null
        }
    })
});