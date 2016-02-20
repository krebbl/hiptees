define(["hip/module/BaseModule", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/command/Navigate"], function (BaseModule, Query, Collection, Product, Navigate) {
    return BaseModule.inherit({
        defaults: {
            loading: false,
            products: null
        },

        prepare: function (fragment, callback) {
            var api = this.$.api;

            var products = api.createCollection(Collection.of(Product));

            var query = new Query().eql("tags", "preset");

            var queryCollection = products.query(query);

            var self = this;

            queryCollection.fetch({
                limit: 10
            }, function (err, productPresets) {
                self.set('products', productPresets);
                callback(err);
                if (!err) {
                }
            });
        },
        selectProductPreset: function (product, event) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "editor/preset/" + product.$.id
            }));
        }
    })
});