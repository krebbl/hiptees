define(["hip/command/ProductCommand"], function (ProductCommand) {

    return ProductCommand.inherit({
        defaults: {
            /**
             * An HTML file
             */
            file: null,

            offset: {
                x: 0.5,
                y: 0.2
            },
            size: null
        }
    })
});