define(["hip/module/BaseModule", "js/data/Query", "js/data/Collection", "hip/model/Product"], function (BaseModule, Query, Collection, Product) {
    return BaseModule.inherit({
        defaults: {
            loading: false,
            products: null
        },

        loadPresets: function (routeContext, productTypeId) {

            var api = this.$.api;

            var products = api.createCollection(Collection.of(Product));

            var query = new Query().in("tags", ["preset"]).eql('productType.id', productTypeId);

            var queryCollection = products.query(query),
                self = this;

            queryCollection.fetch({
                limit: 10
            }, function (err, productPresets) {
                if (!err) {
                    self.set('products', productPresets);
                }
            })

        },
        selectProductPreset: function (product) {

        }
    })
});