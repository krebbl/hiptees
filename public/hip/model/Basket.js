define(["js/data/Model", "hip/entity/BasketItem"], function (Model, BasketItem) {

    return Model.inherit({
        schema: {
            items: [BasketItem]
        },
        defaults: {}
    })
});