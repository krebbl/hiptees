define(
    ["js/core/Application",
        "js/data/Query",
        "js/core/List",
        "js/data/Collection",
        "hip/model/Design",
        "hip/model/Product",
        "fastclick",
        "flow",
        "underscore"
    ],
    function (Application, Query, List, Collection, Design, Product, Fastclick, flow, _) {

        FastClick.attach(document.body);

        return Application.inherit({
            supportEnvironments: true,
            applicationDefaultNamespace: "hip",

            defaults: {
                product: null,
                anchor: 0,
                focus: 0,
                text: "",
                fonts: null,
                executor: null,
                selectionHandler: null,
                selectedConfiguration: "{productStore.selectedConfiguration}",
                textColor: "{selectedConfiguration.color}",
                fontSize: "{selectedConfiguration.fontSize}",
                confirmDialog: null,
                settingsSelected: false,
                addViewSelected: false,
                loaderVisible: false,
                started: false,
                selectedProduct: null
            },
            /**
             *  initializes the application variables
             */
            initialize: function () {
            },

            _commitSelectedConfiguration: function (selected) {
                if (!selected) {
                    this.set('settingsSelected', false);
                }
            },

            endpoint: function () {
                var l = document.location;
                if (l.hostname.indexOf("hiptees") > -1) {
                    return l.protocol + "//" + l.hostname + ":" + (l.port || 80) + "/api/v1"
                }
                return l.origin + l.pathname.replace(/\/[^/]*$/, "/api/v1");
            },

            _initializationComplete: function () {
                this.callBase();


            },

            getCustomErrorData: function () {
                var composedProduct = this.$.productStore.getComposedProduct();
                if (composedProduct) {
                    // remove design resources
                    _.forEach(composedProduct.configurations, function (configuration) {
                        if (configuration.design && !configuration.design.id) {
                            configuration.design.resources = {};
                        }
                    });
                }
                return {
                    product: composedProduct,
                    userActions: this.$.loggerStore.$.actionsDone
                }
            },

            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start: function (parameter, callback) {

                var stores = [
                    "loggerStore",
                    "navigationStore", "productStore", "basketStore",
                    "textFlowStore", "presetStore"
                ];

                for (var i = 0; i < stores.length; i++) {
                    var store = stores[i];
                    this.$.executor.addStore(this.get(store));
                }

                var api = this.$.api;

                var products = api.createCollection(Collection.of(Product));

                var executor = this.$.executor;
                var memento = this.$.memento;

                var productStore = this.$.productStore;
                productStore.set('memento', memento);

                try {
                    var canvas = this.$stage.$document.createElement('canvas');
                    var ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    ctx.getSupportedExtensions();
                    this.$stage.$hasWebGl = true;
                } catch (e) {
                    this.$stage.$hasWebGl = false;
                }


                var tracking = this.$.trackingManager;

                window.onerror = function (message, file, line) {
                    tracking.trackException(message + "\n AT " + file + ":" + line, false);
                };

                // false - disables autostart
                this.callBase(parameter, false);


                var appStarted = false;

                var self = this;

                this.$.navigationStore.bind('on:menuChanged', function (e) {
                    tracking.trackView(e.$.menu || 'editor');
                }, this);


                var mementoCallback = function (e) {
                    if (!e.$.preview) {
                        memento.saveState(productStore.getMementoState());
                        productStore.saveProductInLocalStorage();
                    }
                };

                productStore.bind('change:activeTextConfiguration', function (e) {
                    var conf = e.$;
                    if (!conf) {

                    }
                });

                var changeTextFlowTimeout = null;
                this.$.textFlowStore.bind('on:changeTextFlow', function () {
                    changeTextFlowTimeout && clearTimeout(changeTextFlowTimeout);
                    changeTextFlowTimeout = setTimeout(function () {
                        memento.saveState(productStore.getMementoState());
                    }, 100);
                });

                productStore.bind('on:productSave', function (e) {
                    tracking.trackEvent("PRODUCT", "savingProduct");
                }, this);

                productStore.bind('on:productSaved', function (e) {
                    tracking.trackEvent("PRODUCT", "productSaved");
                }, this);

                productStore.bind('on:productSaveFailed', function (e) {
                    tracking.trackEvent("PRODUCT", "productSaveFailed");
                }, this);

                productStore.bind('on:productSaveFailed', function (e) {
                    tracking.trackEvent("PRODUCT", "productSaveFailed");
                }, this);

                productStore.bind('on:configurationCloned', function (e) {
                    tracking.trackEvent("PRODUCT", "configurationCloned");
                });

                productStore.bind('on:sizeSelected', function (e) {
                    tracking.trackEvent("PRODUCT", "sizeSelected", e.$.size.$.name);
                });

                productStore.bind('on:configurationAdded', function (e) {
                    mementoCallback(e);

                    if (!e.$.cloned) {
                        var config = e.$.configuration;
                        tracking.trackEvent("PRODUCT", "configurationAdded", config.$.type);
                    }
                });

                productStore.bind('on:configurationRemoved', function (e) {
                    mementoCallback(e);

                    var config = e.$.configuration;
                    tracking.trackEvent("PRODUCT", "configurationRemoved", config.$.type);
                });

                productStore.bind('on:imageReplaced', function (e) {
                    mementoCallback(e);

                    tracking.trackEvent("PRODUCT", "imageReplaced");
                });

                productStore.bind('on:filterChanged', mementoCallback);

                productStore.bind('on:configurationMoved', mementoCallback);

                productStore.bind('on:configurationChanged', mementoCallback);

                this.$.textFlowStore.bind('on:leafStyleChanged', mementoCallback);

                this.$.textFlowStore.bind('on:paragraphStyleChanged', mementoCallback);

                productStore.bind('on:selectPreset', function () {

                });

                productStore.bind('on:productLoaded', function () {
                    // for UNDO / REDO
                    memento.clear();
                    memento.saveState(productStore.getMementoState());

                    productStore.saveProductInLocalStorage();
                });


                var basketStore = this.$.basketStore;
                basketStore.bind('on:addToBasketSuccess', function (e) {
                    this.$.notificationManager.showNotification('default', {message: this.$.i18n.t('message.itemAdded')}, {duration: 3});
                    tracking.trackEvent("BASKET", "addToBasketSuccess", "product", e.$.product.$.id);
                }, this);

                basketStore.bind('on:addToBasketFailed', function (e) {
                    this.$.notificationManager.showNotification('error', {message: this.$.i18n.t('message.addingItemFailed')}, {duration: 3});
                    tracking.trackEvent("BASKET", "addToBasketFailed", "reason", e.$.reason);
                }, this);

                basketStore.bind('on:basketItemCloned', function (e) {
                    tracking.trackEvent("BASKET", "basketItemCloned");
                }, this);

                basketStore.bind('on:basketItemChanged', function (e) {
                    tracking.trackEvent("BASKET", "basketItemChanged");
                });

                basketStore.bind('on:basketItemRemoved', function (e) {
                    tracking.trackEvent("BASKET", "basketItemRemoved");
                });

                basketStore.bind('on:checkoutSuccess', function (e) {
                    tracking.trackEvent("BASKET", "checkoutSuccess", e.$.checkoutUrl);
                    var url = e.$.checkoutUrl;
                    window.open(url, "_system");
                }, this);

                //this.$.feedbackHandler.bind('on:feedbackSent', function () {
                //    this.$.notificationManager.showNotification('default', {message: this.$.i18n.t('message.thxForFeedback')}, {duration: 3});
                //}, this);

                productStore.bind('on:productStateChanged', function () {
                    this.$.notificationManager.showNotification('default', {message: this.$.i18n.t('message.changesSuccessful')}, {duration: 3});
                }, this);

                productStore.bind('on:productSave', this.showLoading, this);
                productStore.bind('on:productSaved', this.hideLoading, this);

                productStore.bind('on:addingImage', this.showLoading, this);

                var hasParams = location.search.replace(/^\?/, "").split("&"),
                    params = {};

                for (var j = 0; j < hasParams.length; j++) {
                    var splitted = decodeURIComponent(hasParams[j]).split("=");
                    params[splitted[0]] = splitted[1] || "";
                }

                flow()
                    .seq(function (cb) {
                        self.$.i18n.loadLocale(self.$.i18n.$.locale, cb);
                    })
                    .seq(function (cb) {
                        api.set('mode', params.mode);
                        self.$.presetStore.set('mode', params.mode);
                        productStore.init(params.product, cb);
                    })
                    .exec(function (err) {
                        self.set('started', true);
                        if (!productStore.$.product) {
                            self.$.navigationActions.showMenu({menu: "presets"});
                        }
                        callback();
                    })
            },

            showLoading: function () {
                this.toggleLoading(true);
            },

            hideLoading: function () {
                this.toggleLoading(false);
            },

            defaultRoute: function (routeContext, route) {
                //routeContext.navigate("presets", false);
            },

            statusClass: function () {
                var ret = "";

                if (this.$.selectedConfiguration) {
                    ret += "configuration-selected";
                }

                return ret;
            }.onChange('selectedConfiguration'),

            toggleLoading: function (visible) {
                this.set('loaderVisible', visible);

            }
        });
    }
);