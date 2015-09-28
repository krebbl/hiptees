define(["js/data/Model", "js/data/Collection", "hip/model/Product"], function (Model, Collection, Product) {
    var Draft = Product.inherit('hip.model.Draft');
    var PrivateProduct = Product.inherit('hip.model.PrivateProduct');
    var PublicProduct = Product.inherit('hip.model.PublicProduct');

    return Model.inherit("hip.model.User", {
        defaults: {},
        schema: {
            drafts: Collection.of(Draft),
            published: Collection.of(PublicProduct),
            "private": Collection.of(PrivateProduct)
        }
    })
});