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
                settingsSelected: false,
                addViewSelected: false,
                loaderVisible: false
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

            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start: function (parameter, callback) {
                // setup command handlers

                this.$.navigationHandler.set('router', this.$.router);

                var handlers = ["navigationHandler", "loginHandler", "textConfigurationHandler",
                    "shapeConfigurationHandler", "imageConfigurationHandler", "applyFilterHandler",
                    "productHandler", "configurationHandler", "textFlowHandler"];

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

                this.$.loginHandler.bind("on:userLoggedIn", function () {
                    if (!appStarted) {
                        appStarted = true;
                        callback();
                    }
                    executor.storeAndExecute(new Navigate({
                        fragment: "profile"
                    }));
                });

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

                if (params.access_token) {
                    this.$.executor.storeAndExecute(new LoginCommand({
                        type: "accessToken",
                        accessToken: params.access_token
                    }));
                } else {
                    this.$.executor.storeAndExecute(new LoginCommand({
                        type: "localStorage"
                    }));
                }

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