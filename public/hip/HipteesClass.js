define(
    ["js/core/Application",
        "js/core/List",
        "js/core/Bindable",
        "js/data/Collection",
        "hip/model/Design",
        "hip/model/Product",
        "hip/command/LoginCommand",
        "hip/command/Navigate"
    ],
    function (Application, List, Bindable, Collection, Design, Product, LoginCommand, Navigate) {

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
                if (cordova.platformId != "browser") {
                    return "https://127.0.0.1:8000/api/v1";
                }
                var l = document.location;
                return l.protocol + "//" + l.hostname + ":" + l.port + "/api/v1"
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


                // false - disables autostart
                this.callBase(parameter, false);

                var executor = this.$.executor;

                var appStarted = false;

                var self = this;

                function startLogin() {
                    if (params.access_token) {
                        self.$.executor.storeAndExecute(new LoginCommand({
                            type: "accessToken",
                            accessToken: params.access_token
                        }));
                    } else {
                        self.$.executor.storeAndExecute(new LoginCommand({
                            type: "localStorage"
                        }));
                    }
                }

                this.$.basketHandler.bind('on:addToBasketSuccess', function () {
                    this.$.notificationManager.showNotification('default', {message: "Artikel erfolgreich hinzugefügt"}, {duration: 3});
                }, this);

                this.$.basketHandler.bind('on:addToBasketFailed', function () {
                    this.$.notificationManager.showNotification('error', {message: "Artikel konnte nicht hinzugefügt werden"}, {duration: 3});
                }, this);

                this.$.feedbackHandler.bind('on:feedbackSent', function () {
                    this.$.notificationManager.showNotification('default', {message: "Danke fürs Feedback!"}, {duration: 3});
                }, this);

                this.$.productHandler.bind('on:productStateChanged', function () {
                    this.$.notificationManager.showNotification('default', {message: "Änderung erfolgreich!"}, {duration: 3});
                }, this);

                this.$.loginHandler.bind("on:userLoggedIn", function (e) {
                    if (!appStarted) {
                        appStarted = true;
                        callback();
                    }
                    var data = e.$;
                    var userRegistered = data.session.get('user.state') == "registered";
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
                    executor.storeAndExecute(new Navigate({
                        fragment: "login"
                    }));
                });

                this.$.loginHandler.bind('on:loggedOut', function () {
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
                    startLogin();
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
                routeContext.navigate(this.$lastFragment || "login");
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