define(["js/data/Model", "hip/model/Basket", "hip/model/CombinedBasket"], function (Model, Basket, CombinedBasket) {

    return Model.inherit('hip.model.CheckoutBasket', {
        schema: {
            basket: {
                type: Basket,
                required: false
            }
        },
        defaults: {},
        resultType: CombinedBasket
    });

});