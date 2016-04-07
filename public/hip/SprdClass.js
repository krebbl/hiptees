define(
    ["js/core/Application",
        "js/data/Query",
        "js/core/List",
        "js/data/Collection",
        "hip/model/Design",
        "hip/model/Product",
        "fastclick"
    ],
    function (Application, Query, List, Collection, Design, Product, Fastclick) {

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
                if (typeof(cordova) !== "undefined" && cordova.platformId != "browser") {
                    return "https://127.0.0.1:8000/api/v1";
                }
                var l = document.location;
                if (l.hostname.indexOf("hiptees") > -1) {
                    return l.protocol + "//" + l.hostname + ":" + (l.port || 80) + "/api/v1"
                }
                return l.origin + l.pathname.replace(/\/[^/]*$/, "/api/v1");
                ;
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

                var product = products.createItem();
                var executor = this.$.executor;
                var memento = this.$.memento;

                var productStore = this.$.productStore;
                productStore.set('product', product);
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

                function startLogin() {

                    //if (params.access_token) {
                    //    self.$.executor.storeAndExecute(new LoginCommand({
                    //        type: "accessToken",
                    //        accessToken: params.access_token
                    //    }));
                    //} else {
                    //    self.$.executor.storeAndExecute(new LoginCommand({
                    //        type: "localStorage"
                    //    }));
                    //}
                }

                this.$.navigationStore.bind('on:navigate', function (e) {
                    tracking.trackView(e.$.fragment);
                }, this);

                /**
                 * Events
                 * * Category Editor
                 * * Actions: Added Configuration, Removed Configuration
                 * * Label: ??
                 * * Value: ??
                 *
                 *
                 *
                 * * Category Product
                 * * Actions: Publish, Unpublish, Delete, Share
                 *
                 *
                 * * Sessions
                 * * Actions: Logged In, Logged Out, Registered
                 *
                 *
                 *
                 */

                var mementoCallback = function (e) {
                    if (!e.$.preview) {
                        memento.saveState(productStore.getMementoState());
                    }
                };

                var listenToTextChanges = false;
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
                    tracking.trackEvent("PRODUCT", "productSaveFailed", "state");
                }, this);

                productStore.bind('on:configurationAdded', function (e) {
                    mementoCallback(e);

                    var config = e.$.configuration;
                    tracking.trackEvent("PRODUCT", "configurationAdded", "type", config.$.type);
                });

                productStore.bind('on:configurationRemoved', function (e) {
                    memento.saveState(productStore.getMementoState());

                    var config = e.$.configuration;
                    tracking.trackEvent("PRODUCT", "configurationRemoved", "type", config.$.type);
                });

                productStore.bind('on:imageReplaced', function (e) {
                    mementoCallback(e);

                    tracking.trackEvent("PRODUCT", "imageReplaced");
                });

                productStore.bind('on:filterChanged', mementoCallback);

                productStore.bind('on:productStateChanged', function (e) {
                    tracking.trackEvent("PRODUCT", "productStateChanged", "newState", e.$.product.$.state);
                });

                productStore.bind('on:configurationMoved', mementoCallback);

                productStore.bind('on:configurationChanged', mementoCallback);

                this.$.textFlowStore.bind('on:leafStyleChanged', mementoCallback);

                this.$.textFlowStore.bind('on:paragraphStyleChanged', mementoCallback);

                productStore.bind('on:productLoaded', function () {
                    memento.clear();
                    memento.saveState(productStore.getMementoState());
                });


                this.$.basketStore.bind('on:addToBasketSuccess', function (e) {
                    this.$.notificationManager.showNotification('default', {message: this.$.i18n.t('message.itemAdded')}, {duration: 3});
                    tracking.trackEvent("BASKET", "addToBasketSuccess", "product", e.$.product.$.id);
                }, this);

                this.$.basketStore.bind('on:addToBasketFailed', function (e) {
                    this.$.notificationManager.showNotification('error', {message: this.$.i18n.t('message.addingItemFailed')}, {duration: 3});
                    tracking.trackEvent("BASKET", "addToBasketFailed", "reason", e.$.reason);
                }, this);

                this.$.basketStore.bind('on:removeFromBasketSuccess', function (e) {
                    tracking.trackEvent("BASKET", "removeFromBasketSuccess", "product", e.$.product);
                }, this);

                this.$.basketStore.bind('on:removeFromBasketFailed', function (e) {
                    tracking.trackEvent("BASKET", "removeFromBasketFailed", "reason", e.$.reason);
                }, this);

                this.$.basketStore.bind('on:checkoutSuccess', function (e) {
                    tracking.trackEvent("BASKET", "checkoutSuccess", "checkoutUrl", e.$.checkoutUrl);
                    var url = e.$.checkoutUrl;
                    window.open(url, "_system");
                }, this);

                this.$.basketStore.bind('on:checkoutFailed', function (e) {
                    tracking.trackEvent("BASKET", "checkoutFailed", "reason", e.$.error);
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

                var hasParams = location.hash.replace(/^\#\//, "").split("&"),
                    params = {};

                for (var j = 0; j < hasParams.length; j++) {
                    var splitted = hasParams[j].split("=");
                    params[splitted[0]] = splitted[1] || "";
                }

                this.$.i18n.loadLocale(this.$.i18n.$.locale, function () {
                    self.set('started', true);

                    callback();
                    //self.$.navigationActions.navigate({fragment: "presetsView"});
                });
            },

            _getEnvironment: function () {
                var hostname = location.hostname;

                if (/^([^.]+\.)?hiptees/i.test(hostname)) {
                    return null;
                }

                if ((/vm1[0-9]{2}\.v/).test(hostname)) {
                    return "test";
                }

                return "dev";
            },

            showLoading: function () {
                this.toggleLoading(true);
            },

            hideLoading: function () {
                this.toggleLoading(false);
            },

            defaultRoute: function (routeContext) {
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