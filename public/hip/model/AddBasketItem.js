define(["js/data/Model", "hip/model/Basket", "hip/model/Product", "hip/entity/Size", "hip/model/CombinedBasket"], function (Model, Basket, Product, Size, CombinedBasket) {

    return Model.inherit('hip.model.AddBasketItem', {
        schema: {
            basket: {
                type: Basket,
                required: false
            },
            product: Product,
            size: {
                type: Size,
                isReference: true
            },
            quantity: Number
        },
        defaults: {},
        resultType: CombinedBasket
    });

});