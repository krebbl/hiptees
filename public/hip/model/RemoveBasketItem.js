define(["js/data/Model", "hip/model/Basket", "hip/entity/BasketItem", "hip/model/CombinedBasket"], function (Model, Basket, BasketItem, CombinedBasket) {

    return Model.inherit('hip.model.RemoveBasketItem', {
        schema: {
            basket: {
                type: Basket
            },
            item: {
                type: BasketItem,
                isReference: true
            }
        },
        defaults: {},
        resultType: CombinedBasket
    });

});