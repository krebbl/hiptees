define([
    "hip/module/BaseModule",
    "js/data/Query",
    "hip/model/ProductType",
    "hip/model/Product",
    "hip/store/BasketStore",
    "hip/action/ProductActions",
    "hip/action/BasketActions",
    "js/data/Collection",
    "js/type/Color",
    "hip/store/TextFlowStore",
    "flow"
], function (BaseModule, Query, ProductType, Product, BasketStore, ProductActions, BasketActions, Collection, Color, TextFlowStore, flow) {
    return BaseModule.inherit({
        defaults: {
            basketStore: null,
            productStore: null,
            product: "{productStore.product}",
            appearance: "{product.appearance}",
            selectedConfiguration: "{productStore.selectedConfiguration}",
            configurationViewer: null,
            saveView: null,
            addView: null,
            zoomed: false,
            zoomedConfiguration: "{productStore.zoomedConfiguration}",
            zoomVisible: "{or(productStore.selectedConfiguration,productStore.zoomedConfiguration)}",
            makePublic: false,
            showConfigurationInfo: "{selectedConfiguration}",
            savingProduct: false,
            presets: null,
            sizeTableSelected: false,
            navigationStore: null,
            productSelected: false,
            _loadingMessage: "",
            _productName: ""
        },

        inject: {
            productActions: ProductActions,
            basketActions: BasketActions,
            textFlowStore: TextFlowStore,
            basketStore: BasketStore
        },

        ctor: function () {
            this.callBase();

            var self = this;
            this.bind('productStore', 'on:configurationAdded', function (e) {
                var configuration = e.$.configuration;
                if (configuration.$.type == "text" && e.$.cloned == false) {
                    setTimeout(function () {
                        var viewer = self.$.productViewer.getViewerForConfiguration(configuration);
                        viewer._enableEditing();
                    }, 10);
                }
            });

            this.bind('navigationStore', 'on:navigate', this.onNavigate, this);

            this.bind('productStore', 'on:configurationPointDown', function (e) {
                if (self.$.productViewer) {
                    var viewer = self.$.productViewer.getViewerForConfiguration(e.$.configuration);
                    self.set('configurationViewer', viewer);
                }
            });

            this.bind('productStore', 'on:configurationSelected', function (e) {
                if (e.$.configuration && self.$.productViewer) {
                    var viewer = self.$.productViewer.getViewerForConfiguration(e.$.configuration);
                    self.set('configurationViewer', viewer);
                }

            });

            this.bind('productStore', 'on:productSave', function () {

                this.set({
                    '_loadingMessage': this.$.i18n.t('editor.addingProduct'),
                    'savingProduct': true
                });

            }, this);

            this.bind('productStore', 'on:productSaveFailed', function (e) {
                if (this.$.savingProduct) {
                    this.set('savingProduct', false);
                }
            }, this);


            var uploads = 0,
                uploaded = 0;
            this.bind('productStore', 'on:uploadingDesigns', function (e) {
                var designs = e.$.designs;
                uploads = designs.length;
                uploaded = 0;
                this.set({
                    '_loadingMessage': this.$.i18n.t('editor.uploadingImages', uploaded + "", uploads + "")
                });
            }, this);

            this.bind('productStore', 'on:designImageUploaded', function (e) {
                uploaded++;
                if (uploaded === uploads) {
                    this.set({
                        '_loadingMessage': this.$.i18n.t('editor.addingProduct'),
                        'savingProduct': true
                    });
                } else {
                    this.set({
                        '_loadingMessage': this.$.i18n.t('editor.uploadingImages', uploaded + "", uploads + "")
                    });
                }

            }, this);
        },

        _commitSelectedConfiguration: function (configuration) {
            if (!configuration) {
                this.set({
                    'showConfigurationInfo': false
                });
            } else {
                this.set({
                    'showConfigurationInfo': true
                });
            }
        },

        appearanceClass: function () {
            return this.get('appearance.color') == "black" ? "dark-appearance" : "";
        }.onChange('appearance'),

        or: function (a, b) {
            return a || b;
        },

        onNavigate: function (event) {
            var fragment = event.$.fragment;
            if (!fragment) {
                return;
            }
            var match = fragment.match(/^editor\/(\w+)\/(\w+)/);
            if (match) {
                var action = match[1];
                var productId = match[2],
                    asPreset = false;

                if (action == "preset") {
                    asPreset = true;
                }

                this.set({
                    'productSelected': true
                });
                this.$.productActions.loadProduct({
                    productId: productId,
                    lazy: true,
                    asPreset: asPreset
                });
            }
        },

        title: function (fragment) {
            if (/presetsView/.test(fragment)) {
                return this.$.i18n.t('editor.chooseTemplate');
            } else {
                return this.$.i18n.t('editor.createYourOwn');
            }
        },

        add: function (what, e) {
            if (what == "text") {
                this.$.productActions.addText({
                    text: "New Text",
                    paragraphStyle: {
                        textAlign: "center",
                        lineHeight: 1.3,
                        fontSize: 30,
                        letterSpacing: 0,
                        fontFamily: "HammersmithOne"
                    },
                    leafStyle: {}
                });
            } else if (what == "image") {
                // Simulate click on the element.
                var evt = document.createEvent('Event');
                evt.initEvent('click', true, true);
                this.$.fileInput.$el.dispatchEvent(evt);
            } else if (what == "rectangle" || what == "circle" || what == "heart" || what == "star") {
                this.$.productActions.addShape({
                    type: what
                });
            }

            this.showView(null);
        },

        handleUpload: function (e) {
            var files = e.domEvent.target.files;
            if (files && files.length) {
                this.$.productActions.addImageFile({
                    file: files[0]
                });
            }
        },

        showSettings: function () {
            this.$.productActions.toggleEditConfiguration({edit: true});
        },

        hideSettings: function () {
            this.$.productActions.toggleEditConfiguration({edit: false});
        },

        toggleSettings: function () {
            this.$.productActions.toggleEditConfiguration({edit: !this.get('productStore.editing')});
        },

        _commitCurrentView: function (currentView, oldView) {
            if (oldView) {
                oldView.set('selected', false);
            }
            if (currentView) {
                currentView.set('selected', true);
            }
        },

        mmToMm: function (value) {
            if (value == null) {
                return 0;
            }

            return (value / 10).toFixed(2);
        },

        toggleSizeTable: function () {
            this.set('sizeTableSelected', !this.$.sizeTableSelected);
        },

        showView: function (viewName) {
            this.navigate(viewName);
        },


        minusHalf: function (n) {
            return -0.5 * n;
        },

        _commitZoomedConfiguration: function (configuration) {
            if (this.isRendered()) {
                var self = this;
                if (configuration) {
                    var viewer = this.$.productViewer.getViewerForConfiguration(configuration);
                    if (viewer) {
                        var offsetWidth = this.$.innerContent.$el.offsetWidth;
                        var rect = viewer.$el.getBoundingClientRect();
                        var zoomHeight = Math.min(2000, (0.8 * offsetWidth) / rect.width * this.$.innerContent.$.height);
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
                } else {
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
                        self.set('zoomed', false);
                    }, 10);
                }
            }
        },

        toggleZoom: function () {
            if (!this.$heightBefore) {
                this.$heightBefore = this.$.wrapper.$.height;
            }

            var configuration;
            if (this.$.productStore.$.zoomedConfiguration) {
                configuration = null
            } else {
                configuration = this.$.selectedConfiguration;
            }

            this.$.productActions.zoomConfiguration({configuration: configuration});


        },

        viewerPosition: function (viewer) {
            if (viewer) {
                var rect = viewer.$el.getBoundingClientRect();
                var moduleRect = this.$el.getBoundingClientRect();
                return {
                    x: rect.left + Math.round(rect.width * 0.5),
                    y: Math.min(rect.top + rect.height + 20, moduleRect.bottom - 90) + window.scrollY
                }
            }
            return {
                x: 0,
                y: 0
            }

        }.onChange("zoomed", "configurationViewer._realOffset", "configurationViewer._size"),

        isEditButtonVisible: function () {
            return this.$.showConfigurationInfo && !(this.get("configurationViewer._moving") || this.get("configurationViewer._resizing"));
        }.onChange("showConfigurationInfo", "configurationViewer._moving", "configurationViewer._resizing"),

        addToBasket: function () {
            var self = this;
            flow()
                .seq("product", function (cb) {
                    self.$.productActions.saveProduct({state: "final", callback: cb});

                })
                .seq(function (cb) {
                    self.$.basketActions.addToBasket({
                        size: self.$.productStore.$.selectedSize,
                        quantity: 1,
                        product: this.vars.product,
                        callback: cb
                    });
                })
                .exec(function (err) {
                    console.log(err);
                })
        },

        selectSize: function (item) {
            this.$.productActions.selectSize({size: item});
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

        getProductText: function (p) {
            return this.$.productStore.getProductText(p);
        },

        and: function (a, b) {
            return a && b;
        },

        saveProduct: function () {
            this.showView(null);
            this.set('savingProduct', true);
            this.$.productActions.saveProduct({state: "draft"});
        },

        loadingClass: function () {
            return this.get('productStore.loadingProduct') ? "loading" : "";
        }.onChange('productStore.loadingProduct'),

        zoomClass: function () {
            return this.$.zoomed ? "zoomed" : "";
        }
    })
});