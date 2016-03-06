define(["js/data/Model", "hip/model/Basket", "hip/model/Product", "hip/entity/Size", "hip/model/CombinedBasket"], function (Model, Basket, Product, Size, CombinedBasket) {

    var CombinedSprdBasket = Model.inherit("sprd.model.CombinedBasket",{});

    return Model.inherit('hip.model.AddToSprdBasket', {
        schema: {
            basketId: String,
            product: Product,
            size: {
                type: Size,
                isReference: true
            },
            quantity: Number
        },
        defaults: {},
        resultType: CombinedSprdBasket
    });

});