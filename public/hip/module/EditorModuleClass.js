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
    "flow",
    "hip/util/Memento"
], function (BaseModule, Query, ProductType, Product, BasketStore, ProductActions, BasketActions, Collection, Color, TextFlowStore, flow, Memento) {
    return BaseModule.inherit({
        defaults: {
            basketStore: null,
            productStore: null,
            productViewer: null,
            product: "{productStore.product}",
            appearance: "{product.appearance}",
            selectedConfiguration: "{productStore.selectedConfiguration}",
            configurationViewer: "{productViewer.activeViewer}",
            saveView: null,
            addView: null,
            makePublic: false,
            showConfigurationInfo: false,
            savingProduct: false,
            presets: null,
            sizeTableSelected: false,
            navigationStore: null,
            productSelected: false,
            _zoom: 1,
            _loadingMessage: "",
            _productName: ""
        },

        inject: {
            productActions: ProductActions,
            basketActions: BasketActions,
            textFlowStore: TextFlowStore,
            basketStore: BasketStore,
            memento: Memento
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

            this.bind('productStore', 'on:editConfiguration', function () {
                this.$.navigationStore.showMenu({menu: "settings"});
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

        _onDomAdded: function () {
            this.callBase();

            this._setScrollLeft();
        },

        _commitSelectedConfiguration: function (configuration) {
            this.set('showConfigurationInfo', !!configuration);
        },

        appearanceClass: function () {
            return this.get('appearance.color') == "black" ? "dark-appearance" : "";
        }.onChange('appearance'),

        or: function (a, b) {
            return a || b;
        },

        showMenu: function (menu) {
            if (this.$.zoomed) {
                this.toggleZoom();
            }

            this.$.navActions.showMenu({menu: menu});
        },

        title: function (fragment) {
            if (/presetsView/.test(fragment)) {
                return this.$.i18n.t('editor.chooseTemplate');
            } else {
                return this.$.i18n.t('editor.createYourOwn');
            }
        },

        undo: function () {
            this.$.productActions.undo();
        },

        redo: function () {
            this.$.productActions.redo();
        },

        vectorLength: function (v) {
            return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
        },

        _createDiffVector: function (event) {

            var changedEvent = event.touches ? event.touches[0] : event,
                f = {x: 1, y: 1},
                diffX = (changedEvent.pageX - this.$downPoint.x) * f.x,
                diffY = (changedEvent.pageY - this.$downPoint.y) * f.y;

            if (event.touches && event.touches.length == 2) {
                //if (this.$.keepAspectRatio || this.$._keepHeight) {
                var length = this.vectorLength([
                    event.touches[0].pageX - event.touches[1].pageX,
                    event.touches[0].pageY - event.touches[1].pageY]);
                if (!this.$startLength) {
                    this.$startLength = length;
                } else {
                    diffX = (length - this.$startLength) * f.x;
                    diffY = 0;
                }
                //} else {
                //var vector = [
                //    Math.abs(event.touches[0].pageX - event.touches[1].pageX),
                //    Math.abs(event.touches[0].pageY - event.touches[1].pageY)];
                //if (!this.$startVector) {
                //    this.$startVector = vector;
                //} else {
                //
                //    diffX = (vector[0] - this.$startVector[0]) * f.x;
                //    diffY = (vector[1] - this.$startVector[1]) * f.y;
                //}
                //}
            }

            return [diffX, diffY];
        },

        _onPointerDown: function (event) {
            if (event.domEvent.touches && event.domEvent.touches.length === 2) {
                this.$originalZoom = this.$._zoom;
                this.$downPoint = {
                    x: event.pointerEvent.pageX,
                    y: event.pointerEvent.pageY
                };

                var self = this;
                this.$moveDelegate = this.$moveDelegate || function (e) {
                        self._onPointerMove(e);
                    };

                this.$upDelegate = this.$upDelegate || function (e) {
                        self._onPointerUp(e);
                    };

                this.dom(this.$stage.$document).bindDomEvent("pointermove", this.$moveDelegate, false);
                this.dom(this.$stage.$document).bindDomEvent("pointerup", this.$upDelegate, true);
            }
        },

        _onPointerMove: function (e) {
            var diff = this._createDiffVector(e);

            //console.log(this.$originalZoom, diff[0]);

            this.set('_zoom', Math.max(1, this.$originalZoom + diff[0] / 320));
        },

        _onPointerUp: function () {
            this.$startLength = null;

            this.$.innerContent.set('overflow', 'scroll');

            this.dom(this.$stage.$document).unbindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).unbindDomEvent("pointerup", this.$upDelegate, true);

        },

        add: function (what, e) {
            if (what == "text") {
                this.$.productActions.addText({
                    text: "Text",
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

            this.$.navActions.showMenu();
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

        minusHalf: function (n) {
            return -0.5 * n;
        },

        zoomOut: function () {
            this.set('_zoom', 1);
        },

        _render_zoom: function (zoom) {
            if (this.isRendered()) {
                var offsetWidth = this.$.innerContent.$el.offsetWidth;
                var rect = this.$stage.$el.getBoundingClientRect();
                var zoomHeight = rect.height * zoom;
                this.$.innerContent.set('overflow', 'hidden');
                var oldMiddle = (this.$.wrapper.$.height - offsetWidth) * 0.5;
                var oldScrollLeft = this.$.innerContent.$el.scrollLeft;

                this.$.wrapper.set({
                    'height': zoomHeight
                });
                //this.$.wrapper.set('marginLeft', (this.minusHalf(this.$heightBefore)) + "px");

                this.$.innerContent.$el.scrollLeft = (zoomHeight - offsetWidth) * 0.5 + (zoom > 1 ? oldScrollLeft - oldMiddle : 0);

            }
        },

        _setScrollLeft: function () {
            var offsetWidth = this.$.innerContent.$el.offsetWidth;
            var rect = this.$.wrapper.$el.getBoundingClientRect();

            this.$.innerContent.$el.scrollLeft = (rect.width - offsetWidth) * 0.5;
        },

        isEditButtonVisible: function () {
            return this.$.showConfigurationInfo && !(this.get("configurationViewer._moving") || this.get("configurationViewer._resizing"));
        }.onChange("showConfigurationInfo", "configurationViewer._moving", "configurationViewer._resizing"),

        addToBasket: function () {
            var self = this;
            self.$.navActions.showMenu();
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

        gt: function (a, b) {
            return a > b;
        },

        getProductText: function (p) {
            return this.$.productStore.getProductText(p);
        },

        and: function (a, b) {
            return a && b;
        },

        saveProduct: function () {
            this.goBack();
            this.set('savingProduct', true);
            this.$.productActions.saveProduct({state: "draft"});
        },

        loadingClass: function () {
            return this.get('productStore.loadingProduct') ? "loading" : "";
        }.onChange('productStore.loadingProduct'),

        zoomClass: function () {
            return this.$._zoom === 1 ? "zoomed" : "";
        }.onChange('_zoom'),
        titleForMenu: function (menu) {
            if (menu === "presets") {
                return this.$.i18n.t('editor.chooseTemplate');
            } else {
                return this.$.i18n.t('editor.createYourOwn');
            }
        }
    })
});