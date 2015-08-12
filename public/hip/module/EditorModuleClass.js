define([
    "hip/module/BaseModule",
    "hip/command/AddText",
    "hip/command/AddImageFile",
    "hip/command/AddShape",
    "hip/command/ChangeProductType",
    "hip/command/SaveProduct",
    "hip/command/LoadProduct",
    "hip/model/ProductType",
    "js/data/Collection",
    "js/type/Color"
], function (BaseModule, AddText, AddImageFile, AddShape, ChangeProductType, SaveProduct, LoadProduct, ProductType, Collection, Color) {
    return BaseModule.inherit({
        defaults: {
            productHandler: null,
            product: "{productHandler.product}",
            selectedConfiguration: "{productHandler.selectedConfiguration}",
            settingsSelected: false,
            addViewSelected: false
        },

        inject: {

        },

        _commitProduct: function (product) {
        },

        _commitSelectedConfiguration: function (selected) {
            if (!selected) {
                this.set('settingsSelected', false);
            }
        },

        loadEditor: function (routeContext) {
            if (!this.get('product.productType')) {
                var self = this;

                var productTypes = this.$.api.createCollection(Collection.of(ProductType));

                productTypes.fetch({}, function (err, productTypes) {
                    if (!err) {
                        self.$.executor.execute(new ChangeProductType({
                            productType: productTypes.at(0)
                        }));
                    }
                    routeContext.callback(err);
                });
            }

        }.async(),

        loadProduct: function (routeContext, productId) {

            this.$.executor.execute(new LoadProduct({
                productId: productId
            }));

            routeContext.callback();

        }.async(),

        add: function (what) {
            if (what == "text") {
                this.$.executor.storeAndExecute(new AddText({
                    text: "New Text",
                    paragraphStyle: {
                        textAlign: "center",
                        lineHeight: 1.3,
                        fontSize: 30,
                        letterSpacing: 0,
                        fontFamily: "HammersmithOne"
                    },
                    leafStyle: {
                        color: "#000000"
                    }
                }));
            } else if (what == "image") {
                // Simulate click on the element.
                var evt = document.createEvent('Event');
                evt.initEvent('click', true, true);
                this.$.fileInput.$el.dispatchEvent(evt);
            } else if (what == "rectangle" || what == "circle") {
                this.$.executor.storeAndExecute(new AddShape({
                    type: what
                }));
            }

            this.set('addViewSelected', false);
        },

        handleUpload: function (e) {
            this.$.executor.storeAndExecute(new AddImageFile({
                file: e.domEvent.target.files[0]
            }));
        },

        showSettings: function () {
            this.set('settingsSelected', true);
        },

        hideSettings: function () {
            this.set('settingsSelected', false);
        },

        showAddView: function () {
            this.set('addViewSelected', true);
        },

        hideAddView: function () {
            this.set('addViewSelected', false);
        },
        minusHalf: function (n) {
            return -0.5 * n;
        },

        saveProduct: function () {
            this.$.executor.storeAndExecute(new SaveProduct());
        }
    })
});