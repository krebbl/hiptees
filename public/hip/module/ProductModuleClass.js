define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/command/Navigate"], function (BaseModule, Collection, Product, Navigate) {
    return BaseModule.inherit({
        defaults: {
            handles: "",
            product: null
        },

        productName: function () {
            return this.get('product.name') || "White T-Shirt - Published" ;
        }.onChange('product'),

        prepare: function (fragment, callback) {
            var api = this.$.api;

            var match = fragment.match(/product\/(\w+)/);

            if (match) {
                var product = api.createCollection(Collection.of(Product)).createItem(match[1]);
                var self = this;

                product.fetch({}, function (err, product) {
                    if (!err) {
                        self.set('product', product);
                    }
                    callback && callback(err);
                });
            } else {
                callback && callback();
            }
        },

        remixProduct: function () {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "editor/preset/" + this.$.product.$.id
            }));
        }

    })
});