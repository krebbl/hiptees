define(["js/data/Model", "hip/model/Basket", "hip/model/Product", "hip/model/ProductType"], function (Model, Basket, Product, ProductType) {


    return Model.inherit('hip.model.CombinedBasket', {
        schema: {
            basket: Basket,
            products: [Product],
            productTypes: [ProductType]
        },
        defaults: {}
    });
});