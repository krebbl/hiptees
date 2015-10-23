define(["js/data/Model", "js/data/Collection", "hip/model/Product"], function (Model, Collection, Product) {

    var DraftCollection = Collection.inherit("hip.model.DraftCollection", {
        $modelFactory: Product
    });
    var PrivateCollection = Collection.inherit("hip.model.PrivateCollection", {
        $modelFactory: Product
    });
    var PublicCollection = Collection.inherit("hip.model.PublicCollection", {
        $modelFactory: Product
    });
    return Model.inherit("hip.model.User", {
        defaults: {},
        schema: {
            drafts: DraftCollection,
            published: PublicCollection,
            "private": PrivateCollection
        }
    })
});