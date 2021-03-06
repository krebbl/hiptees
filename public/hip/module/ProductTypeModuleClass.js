define(["hip/module/BaseModule", "js/data/Collection", "hip/model/ProductType", "hip/command/ChangeProductType", "hip/command/Navigate"], function (BaseModule, Collection, ProductType, ChangeProductType, Navigate) {
    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
            productTypes: null
        },

        loadProductTypes: function (routeContext) {
            routeContext.callback(null);
        },

        prepare: function (fragment, callback) {
            var api = this.$.api;

            var productTypes = api.createCollection(Collection.of(ProductType));

            this.set('productTypes', productTypes);

            // TODO: show loading
            productTypes.fetch({}, callback);
        },

        selectProductType: function (productTypeId, appearanceId) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "presets/" + productTypeId + "/appearance/" + appearanceId
            }));
        }
    })
});