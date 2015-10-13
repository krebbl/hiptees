define(["js/data/Model", "hip/model/Basket", "hip/entity/BasketItem", "hip/entity/Size", "hip/model/CombinedBasket"], function (Model, Basket, BasketItem, Size, CombinedBasket) {

    return Model.inherit('hip.model.UpdateBasketItem', {
        schema: {
            basket: {
                type: Basket
            },
            item: {
                type: BasketItem,
                isReference: true
            },
            size: {
                type: Size,
                required: false,
                isReference: true
            },
            quantity: {
                type: Number,
                required: false
            }
        },
        defaults: {},
        resultType: CombinedBasket
    });

});