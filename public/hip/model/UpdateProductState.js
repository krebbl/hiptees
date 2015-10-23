define(["js/data/Model", "hip/model/Product"], function (Model, Product) {

    return Model.inherit('hip.model.UpdateProductState', {
        schema: {
            product: {
                type: Product
            },
            state: String
        },
        defaults: {},
        resultType: Product
    });

});