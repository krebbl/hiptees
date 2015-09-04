define(["hip/module/BaseModule", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/command/Navigate"], function (BaseModule, Query, Collection, Product, Navigate) {
    return BaseModule.inherit({
        defaults: {
            loading: false,
            products: null
        },

        prepare: function (fragment, callback) {
            var match = fragment.match(/^presets\/(\w+)\/appearance\/(\w+)/);

            if (match) {
                var productTypeId = match[1],
                    appearanceId = match[2];
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
                    callback && callback(err);
                });
            } else {
                callback && callback();
            }


        },
        selectProductPreset: function (product, event) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "editor/preset/" + product.$.id
            }));
        }
    })
});