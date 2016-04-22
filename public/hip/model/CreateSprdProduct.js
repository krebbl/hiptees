define(["js/data/Model", "hip/model/Basket", "hip/model/Product", "hip/entity/Size", "hip/model/CombinedBasket"], function (Model, Product) {

    var SprdProduct = Model.inherit("sprd.model.Product", {});

    return Model.inherit('hip.model.CreateSprdProduct', {
        schema: {
            product: Product
        },
        defaults: {},
        resultType: SprdProduct
    });

});