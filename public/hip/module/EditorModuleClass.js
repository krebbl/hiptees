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
            appearance: "{product.appearance}",
            selectedConfiguration: "{productHandler.selectedConfiguration}",
            configurationViewer: null,
            settingsSelected: false,
            saveView: null,
            addView: null,
            zoomed: false,
            zoomVisible: "{or(productHandler.selectedConfiguration,zoomed)}",
            showTextHint: false,
            makePublic: false,
            showConfigurationInfo: "{selectedConfiguration}",
            savingProduct: false,
            _loadingMessage: ""
        },

        inject: {},

        ctor: function () {
            this.callBase();

            var self = this;
            this.bind('productHandler', 'on:configurationAdded', function (e) {
                var configuration = e.$.configuration;
                if (configuration.$.type == "text" && e.$.cloned == false) {
                    setTimeout(function () {
                        var viewer = self.$.productViewer.getViewerForConfiguration(configuration);
                        viewer._enableEditing();
                    }, 10);
                }
            });

            this.bind('productHandler', 'on:configurationPointDown', function (e) {
                if (self.$.productViewer) {
                    var viewer = self.$.productViewer.getViewerForConfiguration(e.$.configuration);
                    self.set('configurationViewer', viewer);
                }
            });

            this.bind('productHandler', 'on:configurationSelected', function (e) {
                if (e.$.configuration && self.$.productViewer) {
                    var viewer = self.$.productViewer.getViewerForConfiguration(e.$.configuration);
                    self.set('configurationViewer', viewer);
                }

            });

            this.bind('productHandler', 'on:productSave', function () {

                this.set({
                    '_loadingMessage': this.$.i18n.t('editor.savingProduct'),
                    'savingProduct': true
                });

            }, this);

            this.bind('productHandler', 'on:productSaved', function (e) {
                if (this.$.savingProduct) {
                    this.$.executor.storeAndExecute(new Navigate({
                        fragment: "profile"
                    }));
                    this.set('savingProduct', false);
                }
            }, this);

            this.bind('productHandler', 'on:productSaveFailed', function (e) {
                if (this.$.savingProduct) {
                    this.set('savingProduct', false);
                }
            }, this);


            var uploads = 0,
                uploaded = 0;
            this.bind('productHandler', 'on:uploadingDesigns', function (e) {
                var designs = e.$.designs;
                uploads = designs.length;
                uploaded = 0;
                this.set({
                    '_loadingMessage': this.$.i18n.t('editor.uploadingImages', uploaded+"", uploads+"")
                });
            }, this);

            this.bind('productHandler', 'on:designImageUploaded', function (e) {
                uploads++;
                this.set({
                    '_loadingMessage': this.$.i18n.t('editor.uploadingImages', uploaded+"", uploads+"")
                });
            }, this);
        },

        _commitSelectedConfiguration: function (configuration) {
            var showTextHint = false;
            if (!configuration) {
                this.set({
                    'settingsSelected': false,
                    'showConfigurationInfo': false
                });
            } else {
                if (configuration.$.type == "text") {
                    showTextHint = true;
                }
                this.set({
                    'showConfigurationInfo': true
                });
            }


            this.set('showTextHint', showTextHint);
        },

        appearanceClass: function () {
            return this.get('appearance.color') == "black" ? "dark-appearance" : "";
        }.onChange('appearance'),

        or: function (a, b) {
            return a || b;
        },

        prepare: function (fragment, callback) {
            var self = this;
            var match = fragment.match(/^editor\/(\w+)\/(\w+)/);

            if (match) {
                var action = match[1];
                var productId = match[2],
                    asPreset = false;

                if (action == "preset") {
                    asPreset = true;
                }

                this.$.executor.execute(new LoadProduct({
                    productId: productId,
                    lazy: true,
                    asPreset: asPreset,
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

        add: function (what, e) {
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
                    leafStyle: {}
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

            this.showView(null);
        },

        handleUpload: function (e) {
            var files = e.domEvent.target.files;
            if (files && files.length) {
                this.$.executor.storeAndExecute(new AddImageFile({
                    file: files[0]
                }));
            }
        },

        showSettings: function () {
            this.set('settingsSelected', true);
        },

        hideSettings: function () {
            this.set('settingsSelected', false);
        },

        _commitCurrentView: function (currentView, oldView) {
            if (oldView) {
                oldView.set('selected', false);
            }
            if (currentView) {
                currentView.set('selected', true);
            }
        },

        showView: function (view) {
            this.set('currentView', view);
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
                var innerContent = this.$.innerContent;
                setTimeout(function () {
                    innerContent.set('overflow', 'hidden');
                    innerContent.$el.scrollLeft = 0;
                    innerContent.$el.scrollTop = 0;
                }, 1);
                setTimeout(function () {
                    self.$.wrapper.set({
                        'left': "0",
                        'height': self.$heightBefore
                    });
                }, 2);
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
                    this.$.innerContent.set('overflow', 'scroll');
                    this.$.wrapper.set({
                        'height': zoomHeight
                    });
                    this.$.wrapper.set('marginLeft', (this.minusHalf(this.$heightBefore)) + "px");

                    var rectAfter = viewer.$el.getBoundingClientRect();
                    this.$.innerContent.$el.scrollLeft = rectAfter.left - (offsetWidth - rectAfter.width) * 0.5;
                    this.$.innerContent.$el.scrollTop = rectAfter.top - (this.$.innerContent.$el.offsetHeight - rectAfter.height) * 0.5;

                    this.set('zoomed', true);
                }

            }
        },

        saveProductFinal: function () {
            this.showView(null);
            this.$waitingForSave = true;
            this.$.executor.storeAndExecute(new SaveProduct({state: this.$.makePublic ? "public" : "private"}));
        },

        format: function (val) {
            return val != null ? val.toFixed(0) : 0;
        },

        confirmGoBack: function () {
            var self = this;

            this.$.confirmDialog.confirm(this.$.i18n.t('dialog.confirmBack'), function (err, dialog, ret) {
                if (ret) {
                    self.goBack();
                }
            });
        },
        goBack: function () {
            if (this.$.zoomed) {
                this.toggleZoom();
            }

            this.showView(null);

            this.callBase();
        },

        saveProduct: function () {
            this.showView(null);
            this.set('savingProduct', true);
            this.$.executor.storeAndExecute(new SaveProduct({state: "draft"}));
        }
    })
});