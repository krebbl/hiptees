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

            productTypes.fetch({}, function (err) {

            });
        },
        selectProductType: function (productType) {
            this.$.executor.storeAndExecute(new ChangeProductType({
                productType: productType
            }));

            this.$.executor.storeAndExecute(new Navigate({
                fragment: "presets/" + productType.$.id
            }));
        }
    })
});