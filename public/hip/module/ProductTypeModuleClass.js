define(["hip/module/BaseModule", "js/data/Collection", "hip/model/ProductType", "hip/command/ChangeProductType", "hip/command/Navigate"], function (BaseModule, Collection, ProductType, ChangeProductType, Navigate) {
    return BaseModule.inherit({
        defaults: {
            loading: true,
            productTypes: null
        },

        loadProductTypes: function (routeContext) {
            routeContext.callback(null);

            var api = this.$.api;

            var productTypes = api.createCollection(Collection.of(ProductType));

            this.set('productTypes', productTypes);

            // TODO: show loading
            productTypes.fetch({}, function (err) {

            });
        },
        selectProductType: function (productTypeId, appearanceId) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "presets/" + productTypeId + "/appearance/" + appearanceId
            }));
        },
        resourceUrl: function (productType, appearanceId) {
            return productType.$.resources.BASE + productType.$.id +
                "-" + appearanceId + ".jpg"
        }
    })
});