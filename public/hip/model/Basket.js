define(["js/data/Model", "hip/entity/BasketItem", "hip/model/Product"], function (Model, BasketItem, Product) {


    return Model.inherit('hip.model.Basket', {
        schema: {
            items: [BasketItem]
        },
        defaults: {}
    });
});