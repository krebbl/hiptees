define(["hip/module/BaseModule", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/command/Navigate"], function (BaseModule, Query, Collection, Product, Navigate) {
    return BaseModule.inherit({
        defaults: {
            loading: false,
            products: null
        },

        loadPresets: function (routeContext, productTypeId, appearanceId) {
            this.set('loading', true);

            var api = this.$.api;

            var products = api.createCollection(Collection.of(Product));

            var query = new Query().eql("tags", "preset").eql('productType', productTypeId).eql('appearance', appearanceId);

            var queryCollection = products.query(query),
                self = this;

            queryCollection.fetch({
                limit: 10
            }, function (err, productPresets) {
                self.set('loading', false);
                if (!err) {
                    self.set('products', productPresets);
                }
            })

        },
        selectProductPreset: function (product) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "editor/" + product.$.id
            }));
        },
        goBack: function () {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "productTypes"
            }));
        }
    })
});