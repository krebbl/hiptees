define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/command/Navigate", "hip/command/AddToBasket", "hip/handler/LoginHandler"], function (BaseModule, Collection, Product, Navigate, AddToBasket, LoginHandler) {
    return BaseModule.inherit({
        defaults: {
            handles: "",
            product: null,
            selectedSize: null,
            user: "{loginHandler.user}",
            sizes: [{
                "id": "1",
                "name": "S"
            }, {
                "id": "2",
                "name": "M"
            }]
        },

        inject: {
            loginHandler: LoginHandler
        },

        productName: function () {
            return this.get('product.name') || "White T-Shirt - Published";
        }.onChange('product'),

        remixAllowed: function (product) {
            return product && (product.get('remixAllowed') || product.get('creator.id') == this.get('user._id'));
        }.onChange('user'),

        prepare: function (fragment, callback) {
            var api = this.$.api;

            var match = fragment.match(/product\/(\w+)/);

            this.set('selectedSize', null);

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

        showNotification: function () {
            this.$.notificationManager.showNotification('default', {message: "Yeah"}, {duration: 3});
        },

        remixProduct: function () {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "editor/preset/" + this.$.product.$.id
            }));
        },
        addToBasket: function () {
            this.$.executor.storeAndExecute(new AddToBasket({
                size: this.$.selectedSize,
                product: this.$.product,
                quantity: 1
            }));
        },
        sizeString: function (size) {
            return "Größe: " + size;
        }

    })
});