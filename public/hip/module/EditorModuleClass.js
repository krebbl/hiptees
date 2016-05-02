define([
    "hip/module/BaseModule",
    "js/data/Query",
    "hip/model/ProductType",
    "hip/model/Product",
    "hip/store/BasketStore",
    "hip/action/ProductActions",
    "hip/action/BasketActions",
    "hip/entity/TextConfiguration",
    "js/data/Collection",
    "js/type/Color",
    "hip/store/TextFlowStore",
    "flow",
    "hip/util/Memento"
], function (BaseModule, Query, ProductType, Product, BasketStore, ProductActions, BasketActions, TextConfiguration, Collection, Color, TextFlowStore, flow, Memento) {

    var links = {
        DE: {
            terms: "https://www.spreadshirt.de/-C8662",
            privacy: "https://www.spreadshirt.de/-C8681"
        },
        US: {
            privacy: "https://www.spreadshirt.com/-C3259",
            terms: "https://www.spreadshirt.com/-C2377"
        }
    };

    return BaseModule.inherit({
        defaults: {
            showAddInfo: false,
            basketStore: null,
            productStore: null,
            productViewer: null,
            product: "{productStore.product}",
            appearance: "{product.appearance}",
            selectedConfiguration: "{productStore.selectedConfiguration}",
            configurationViewer: "{productViewer.activeViewer}",
            centeredConfiguration: null,
            saveView: null,
            addView: null,
            makePublic: false,
            showConfigurationInfo: false,
            presets: null,
            sizeTableSelected: false,
            navigationStore: null,
            productSelected: false,
            _zoom: 1,
            _loadingMessage: "",
            _productName: "",
            _showLoader: false,

            showSettingsMenu: false
        },

        inject: {
            productActions: ProductActions,
            basketActions: BasketActions,
            textFlowStore: TextFlowStore,
            basketStore: BasketStore,
            memento: Memento
        },

        linkTo: function (what) {
            return links[this.isNA() ? 'US' : 'DE'][what];
        },

        isNA: function () {
            return /\.com/.test(location.hostname);
        },

        ctor: function () {
            this.callBase();

            var self = this;

            var editModeTimeout = null;

            this.bind('productStore', 'on:editConfiguration', function (e) {
                this.$.navigationStore.showMenu({menu: e.$.configuration ? "settings" : ""});
                editModeTimeout && clearTimeout(editModeTimeout);
                self.set('centeredConfiguration', e.$.configuration);
            }, this);

            this.bind('productStore', 'on:configurationSelected', function(e) {
                if (this.$.showSettingsMenu) {
                    this.set("showSettingsMenu", false);
                    this.$.navigationStore.showMenu({menu: e.$.configuration ? "settings" : ""});
                }
            }, this);



            this.bind('innerContent', 'dom:add', function () {
                this._setScrollLeft();
            }, this);


            this.bind('productStore', 'on:productLoaded', function (e) {
                var p = e.$.product;
                if (p && p.$.configurations.size() === 0) {
                    this.set('showAddInfo', true);
                }
            }, this);

            this.dom(this.$stage.$window).bindDomEvent("resize", function () {
                self._setScrollLeft();
            });
        },

        _commitSelectedConfiguration: function (configuration) {
            this.set('showConfigurationInfo', !!configuration);
        },

        appearanceClass: function () {
            return this.get('appearance.color') == "black" ? "dark-appearance" : "";
        }.onChange('appearance'),

        or: function (a, b, c) {
            return a || b || c;
        },

        stopEditing: function () {
            this.$.productActions.editConfiguration();
        },

        showMenu: function (menu) {
            if (this.$.zoomed) {
                this.toggleZoom();
            }

            if (menu !== "") {
                this.set('showAddInfo', false);
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
        isTextConfiguration: function (config) {
            return config instanceof TextConfiguration;
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
                this.$oldScrollTop = this.$.innerContent.$el.scrollTop;
                this.$oldScrollLeft = this.$.innerContent.$el.scrollLeft;

                this.$downPoint = {
                    x: event.pointerEvent.pageX,
                    y: event.pointerEvent.pageY
                };

                this.$middlePoint = {
                    x: (event.domEvent.touches[0].pageX + event.domEvent.touches[1].pageX) * 0.5,
                    y: (event.domEvent.touches[0].pageY + event.domEvent.touches[1].pageY) * 0.5
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
            this.$.productActions.editTextConfiguration();

        },

        _onPointerMove: function (e) {
            var diff = this._createDiffVector(e);

            this.set('_zoom', Math.max(1, this.$originalZoom + diff[0] / window.innerWidth * this.$originalZoom));
        },

        _onPointerUp: function () {
            this.$startLength = null;

            this.$.innerContent.set('overflow', this.$._zoom > 1 ? 'scroll' : 'hidden');

            this.dom(this.$stage.$document).unbindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).unbindDomEvent("pointerup", this.$upDelegate, true);

        },

        _renderCenteredConfiguration: function (config) {
            if (config) {
                var viewer = this.$.productViewer.getViewerForConfiguration(config);
                if (viewer) {
                    var viewerRect = viewer.$el.getBoundingClientRect();

                    var bottomDistance = this.$stage.$el.offsetHeight - (viewerRect.top + viewerRect.height);
                    var bottomThreshold = 240;

                    if (bottomDistance < bottomThreshold) {
                        this.$.wrapper.set('top', (bottomDistance - bottomThreshold) + "px");
                    }
                }
            } else {
                if (this.$.innerContent.isRendered()) {
                    var scrollTop = this.$.innerContent.$el.scrollTop;
                    this.$.wrapper.set('top', "0");
                    this.$.innerContent.$el.scrollTop = scrollTop;
                }
            }
        },

        add: function (what, e) {

            this.set("showSettingsMenu", true);

            if (what == "text") {
                this.$.productActions.addText();
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

            //this.$.navActions.showMenu();
        },

        removeConfiguration: function () {
            this.$.productActions.removeConfiguration({configuration: this.get('productStore.selectedConfiguration')});
        },

        layerUp: function () {
            this.$.productActions.changeOrder({
                configuration: this.get('productStore.selectedConfiguration'),
                move: 1
            });
        },

        layerDown: function (event) {
            this.$.productActions.changeOrder({
                configuration: this.get('productStore.selectedConfiguration'),
                move: -1
            });
        },

        editTextConfiguration: function () {
            this.$.productActions.editTextConfiguration({configuration: this.get('productStore.selectedConfiguration')});
        },

        editConfiguration: function () {
            this.$.productActions.editConfiguration({configuration: this.get('productStore.selectedConfiguration')});
        },

        cloneConfiguration: function () {
            this.$.productActions.cloneConfiguration({configuration: this.get('productStore.selectedConfiguration')})
        },

        handleUpload: function (e) {
            var files = e.domEvent.target.files;
            if (files && files.length) {
                this.$.productActions.addImageFile({
                    file: files[0]
                });
                e.domEvent.target.value = "";
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
            if (this.isRendered() && this.$.innerContent.isRendered()) {
                var $innerEl = this.$.innerContent.$el;
                var offsetWidth = $innerEl.offsetWidth;
                var rect = $innerEl.getBoundingClientRect();
                var zoomHeight = rect.height * zoom;
                this.$.innerContent.set('overflow', 'hidden');

                this.$.wrapper.set({
                    'height': zoomHeight
                });

                if (this.$middlePoint) {
                    var originalPoint = (this.$middlePoint.y - rect.top) + this.$oldScrollTop;
                    var zoomedDownPoint = originalPoint * zoom / this.$originalZoom;
                    $innerEl.scrollTop = zoomedDownPoint - originalPoint + this.$oldScrollTop;

                    originalPoint = (this.$middlePoint.x) + this.$oldScrollLeft;
                    zoomedDownPoint = originalPoint * zoom / this.$originalZoom;
                    var scrollLeft = zoomedDownPoint - originalPoint + this.$oldScrollLeft;
                    // move scroll left more to middle when returning to zoom of 1
                    var threshold = 1.2;
                    if (zoom < threshold) {
                        var limit = threshold - 1;
                        var targetScrollLeft = (zoomHeight - rect.width) * 0.5;
                        var diff = targetScrollLeft - scrollLeft;
                        scrollLeft += (threshold - zoom) / limit * diff;
                    }
                    $innerEl.scrollLeft = scrollLeft;

                }
            }
        },

        _setScrollLeft: function () {
            if (this.$addedToDom && this.$.innerContent && this.$.innerContent.isRendered()) {
                var offsetWidth = this.$.innerContent.$el.offsetWidth;
                var rect = this.$.wrapper.$el.getBoundingClientRect();

                this.$.innerContent.$el.scrollLeft = (rect.width - offsetWidth) * 0.5;
            }
        },

        isModeActive: function (mode) {
            return this.PARAMETER().mode == mode;
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

        saveProduct: function () {
            this.$.navActions.showMenu();
            var mode = this.PARAMETER().mode;
            if (mode === "service") {
                this.$.productActions.createSprdProduct();
            } else if (mode === "presets") {
                this.$.productActions.saveProduct();
            }
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

        hidePanel: function () {
            var navigationStore = this.$.navigationStore;
            navigationStore && navigationStore.set("activeMenu", null);
        },

        loadingClass: function () {
            return this.get('productStore.loadingProduct') ? "loading" : "";
        }.onChange('productStore.loadingProduct'),

        zoomClass: function () {
            return this.$._zoom > 1 ? "zoomed" : "";
        }.onChange('_zoom'),
        titleForMenu: function (menu) {
            if (menu === "presets") {
                return this.$.i18n.t('editor.chooseTemplate');
            }

            return "";
        }
    })
});