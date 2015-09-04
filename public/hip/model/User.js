define(["js/data/Model", "js/data/Collection", "hip/model/ProductDraft", "hip/model/PublishedProduct"], function (Model, Collection, ProductDraft, PublishedProduct) {
    return Model.inherit("hip.model.User", {
        defaults: {

        },
        schema: {
            drafts: Collection.of(ProductDraft),
            published: Collection.of(PublishedProduct)
        }
    })
});