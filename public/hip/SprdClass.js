define(
    ["js/core/Application",
        "js/data/Query",
        "js/core/List",
        "js/data/Collection",
        "hip/model/Design",
        "hip/model/Product",
        "hip/command/LoginCommand",
        "hip/command/Navigate"
    ],
    function (Application, Query, List, Collection, Design, Product, LoginCommand, Navigate) {

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
                selectedConfiguration: "{productHandler.selectedConfiguration}",
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
                if(l.hostname.indexOf("hiptees") > -1) {
                    return l.protocol + "//" + l.hostname + ":" + (l.port || 80) + "/api/v1"
                }
                return l.origin + l.pathname.replace(/\/[^/]*$/, "/api/v1");;
            },

            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start: function (parameter, callback) {

                this.$.navigationHandler.set('router', this.$.router);

                var handlers = [
                    "navigationHandler", "loginHandler", "textConfigurationHandler",
                    "shapeConfigurationHandler", "imageConfigurationHandler", "applyFilterHandler",
                    "productHandler", "configurationHandler", "textFlowHandler", "basketHandler", "feedbackHandler",
                    "shareHandler"
                ];

                for (var i = 0; i < handlers.length; i++) {
                    var handler = handlers[i];
                    this.$.executor.addCommandHandler(this.get(handler));
                }

                var api = this.$.api;

                var products = api.createCollection(Collection.of(Product));

                var product = products.createItem();

                this.$.productHandler.set('product', product);

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

                var executor = this.$.executor;

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

                this.$.navigationHandler.bind('on:navigate', function (e) {
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

                this.$.productHandler.bind('on:productSave', function (e) {
                    var product = e.$.product;
                    tracking.trackEvent("PRODUCT", "savingProduct", "state", product.$.state);
                }, this);

                this.$.productHandler.bind('on:productSaved', function (e) {
                    var product = e.$.product;
                    tracking.trackEvent("PRODUCT", "productSaved", "state", product.$.state);
                }, this);

                this.$.productHandler.bind('on:productSaveFailed', function (e) {
                    var product = e.$.product;
                    tracking.trackEvent("PRODUCT", "productSaveFailed", "state", product.$.state);
                }, this);

                this.$.productHandler.bind('on:productSaveFailed', function (e) {
                    var product = e.$.product;
                    tracking.trackEvent("PRODUCT", "productSaveFailed", "state", product.$.state);
                }, this);

                this.$.productHandler.bind('on:configurationAdded', function (e) {
                    var config = e.$.configuration;
                    tracking.trackEvent("PRODUCT", "configurationAdded", "type", config.$.type);
                });

                this.$.productHandler.bind('on:configurationRemoved', function (e) {
                    var config = e.$.configuration;
                    tracking.trackEvent("PRODUCT", "configurationRemoved", "type", config.$.type);
                });

                this.$.productHandler.bind('on:imageReplaced', function () {
                    tracking.trackEvent("PRODUCT", "imageReplaced");
                });

                this.$.productHandler.bind('on:productStateChanged', function (e) {
                    tracking.trackEvent("PRODUCT", "productStateChanged", "newState", e.$.product.$.state);
                });


                this.$.basketHandler.bind('on:addToBasketSuccess', function (e) {
                    this.$.notificationManager.showNotification('default', {message: this.$.i18n.t('message.itemAdded')}, {duration: 3});
                    tracking.trackEvent("BASKET", "addToBasketSuccess", "product", e.$.product.$.id);
                }, this);

                this.$.basketHandler.bind('on:addToBasketFailed', function (e) {
                    this.$.notificationManager.showNotification('error', {message: this.$.i18.t('message.addingItemFailed')}, {duration: 3});
                    tracking.trackEvent("BASKET", "addToBasketFailed", "reason", e.$.reason);
                }, this);

                this.$.basketHandler.bind('on:removeFromBasketSuccess', function (e) {
                    tracking.trackEvent("BASKET", "removeFromBasketSuccess", "product", e.$.product);
                }, this);

                this.$.basketHandler.bind('on:removeFromBasketFailed', function (e) {
                    tracking.trackEvent("BASKET", "removeFromBasketFailed", "reason", e.$.reason);
                }, this);

                this.$.basketHandler.bind('on:checkoutSuccess', function (e) {
                    tracking.trackEvent("BASKET", "checkoutSuccess", "checkoutUrl", e.$.checkoutUrl);
                    var url = e.$.checkoutUrl;
                    window.open(url, "_system");
                }, this);

                this.$.basketHandler.bind('on:checkoutFailed', function (e) {
                    tracking.trackEvent("BASKET", "checkoutFailed", "reason", e.$.error);
                }, this);

                this.$.feedbackHandler.bind('on:feedbackSent', function () {
                    this.$.notificationManager.showNotification('default', {message: this.$.i18n.t('message.thxForFeedback')}, {duration: 3});
                }, this);

                this.$.productHandler.bind('on:productStateChanged', function () {
                    this.$.notificationManager.showNotification('default', {message: this.$.i18n.t('message.changesSuccessful')}, {duration: 3});
                }, this);

                this.$.loginHandler.bind("on:userLoggedIn", function (e) {
                    if (!appStarted) {
                        appStarted = true;
                        callback();
                    }
                    var data = e.$;
                    var userRegistered = data.session.get('user.state') == "registered";
                    var userId = data.session.get('user.id');
                    tracking.setUserId(userId);
                    tracking.trackEvent("SESSION", "loggedIn");

                    if (userRegistered) {
                        executor.storeAndExecute(new Navigate({
                            fragment: "profile"
                        }));
                    } else {
                        executor.storeAndExecute(new Navigate({
                            fragment: "register"
                        }));
                    }
                });

                this.$.loginHandler.bind('on:registrationCompleted', function () {
                    tracking.trackEvent("SESSION", "registrationCompleted");
                    executor.storeAndExecute(new Navigate({
                        fragment: "profile"
                    }));
                });

                this.$.productHandler.bind('on:productSave', this.showLoading, this);
                this.$.productHandler.bind('on:productSaved', this.hideLoading, this);

                this.$.productHandler.bind('on:addingImage', this.showLoading, this);

                this.$.productHandler.bind('on:productSaved', this.goToProfileModule, this);

                this.$.loginHandler.bind('on:loginFailed', function () {
                    if (!appStarted) {
                        appStarted = true;
                        callback();
                    }
                    tracking.trackEvent("SESSION", "loggedInFailed");
                    executor.storeAndExecute(new Navigate({
                        fragment: "login"
                    }));
                });

                this.$.loginHandler.bind('on:loggedOut', function () {
                    tracking.trackEvent("SESSION", "loggedOut");
                    tracking.setUserId(null);
                    executor.storeAndExecute(new Navigate({
                        fragment: "login"
                    }));
                });

                var hasParams = location.hash.replace(/^\#\//, "").split("&"),
                    params = {};

                for (var j = 0; j < hasParams.length; j++) {
                    var splitted = hasParams[j].split("=");
                    params[splitted[0]] = splitted[1] || "";
                }

                this.$.i18n.loadLocale(this.$.i18n.$.locale, function () {
                    self.set('started', true);

                    var api = self.$.api;

                    var products = api.createCollection(Collection.of(Product));

                    var query = new Query().eql("tags", "preset");

                    var queryCollection = products.query(query);

                    queryCollection.fetch({
                        limit: 10
                    }, function (err, productPresets) {
                        callback(err);
                        if (!err) {
                            executor.storeAndExecute(new Navigate({fragment: "editor/preset/" + productPresets.at(0).$.id}));
                        }
                    });
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

            goToProfileModule: function () {
                this.$.swipeView.goTo("profile");
                var self = this;
                setTimeout(function () {
                    self.$.notificationManager.showNotification('default', {message: self.$.i18n.t('message.productSaved')}, {duration: 3});
                }, 300);

            },

            showLoading: function () {
                this.toggleLoading(true);
            },

            hideLoading: function () {
                this.toggleLoading(false);
            },

            goTo: function (moduleName) {
                this.$.swipeView.goTo(moduleName);
            },

            goBack: function () {
                this.$.swipeView.goBack();
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