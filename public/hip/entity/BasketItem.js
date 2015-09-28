define(["js/data/Entity", "hip/model/Product", "hip/entity/Size"], function (Entity, Product, Size) {

    return Entity.inherit({
        schema: {
            product: Product,
            quantity: Number,
            size: Size
        },
        defaults: {}
    })
});