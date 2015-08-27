define([
    "hip/module/BaseModule",
    "hip/command/AddText",
    "hip/command/AddImageFile",
    "hip/command/AddShape",
    "hip/command/ChangeProductType",
    "hip/command/SaveProduct",
    "hip/command/LoadProduct",
    "hip/command/Navigate",
    "hip/model/ProductType",
    "js/data/Collection",
    "js/type/Color"
], function (BaseModule, AddText, AddImageFile, AddShape, ChangeProductType, SaveProduct, LoadProduct, Navigate, ProductType, Collection, Color) {
    return BaseModule.inherit({
        defaults: {
            productHandler: null,
            product: "{productHandler.product}",
            selectedConfiguration: "{productHandler.selectedConfiguration}",
            settingsSelected: false,
            addViewSelected: false,
            zoomed: false,
            zoomVisible: "{or(productHandler.selectedConfiguration,zoomed)}"
        },

        inject: {

        },

        _commitSelectedConfiguration: function (selected) {
            if (!selected) {
                this.set('settingsSelected', false);
            }
        },

        or: function (a, b) {
            return a || b;
        },

        prepare: function (fragment, callback) {
            var self = this;
            var match = fragment.match(/^editor\/(\w+)/);

            if (match) {
                var productId = match[1];

                this.$.executor.execute(new LoadProduct({
                    productId: productId,
                    lazy: true,
                    callback: callback
                }));
            } else {
                var productTypes = this.$.api.createCollection(Collection.of(ProductType));

                productTypes.fetch({}, function (err, productTypes) {
                    if (!err) {
                        self.$.executor.execute(new ChangeProductType({
                            productType: productTypes.at(0)
                        }));
                    }
                    callback(err);
                });
            }

        },

        loadProduct: function (routeContext, productId) {


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

        toggleZoom: function () {
            if (!this.$heightBefore) {
                this.$heightBefore = this.$.wrapper.$.height;
            }

            var self = this;

            if (this.$.zoomed) {
                this.$.wrapper.set({
                    'left': "0",
                    'height': this.$heightBefore
                });
                this.$.innerContent.set('overflow', 'hidden');
                setTimeout(function () {
                    self.$.wrapper.set({
                        'left': "50%"
                    });
                }, 10);
                this.set('zoomed', false);
            } else {
                var viewer = this.$.productViewer.getSelectedConfigurationViewer();
                if (viewer) {
                    var offsetWidth = this.$.innerContent.$el.offsetWidth;
                    var rect = viewer.$el.getBoundingClientRect();
                    var zoomHeight = Math.min(2000, (0.95 * offsetWidth) / rect.width * this.$.innerContent.$.height);
                    this.$.wrapper.set({
                        'height': zoomHeight
                    });
                    this.$.wrapper.set('marginLeft', (this.minusHalf(this.$heightBefore)) + "px");
                    this.$.innerContent.set('overflow', 'scroll');

                    var rectAfter = viewer.$el.getBoundingClientRect();
                    this.$.innerContent.$el.scrollLeft = rectAfter.left - (offsetWidth - rectAfter.width) * 0.5;
                    this.$.innerContent.$el.scrollTop = rectAfter.top - (this.$.innerContent.$el.offsetHeight - rectAfter.height) * 0.5;

                    this.set('zoomed', true);
                }

            }
        },

        goBack: function(){
            if(this.$.zoomed){
                this.toggleZoom();
            }

            this.callBase();
        },

        saveProduct: function () {
            this.$.executor.storeAndExecute(new SaveProduct());
        }
    })
});