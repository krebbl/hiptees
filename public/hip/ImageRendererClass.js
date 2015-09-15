define(
    ["js/core/Application",
        "js/core/List",
        "js/core/Bindable",
        "js/data/Collection",
        "hip/model/Design",
        "hip/model/Product",
        "hip/entity/DesignConfiguration",
        "hip/entity/TextConfiguration",
        'hip/entity/RectangleConfiguration',
        "hip/entity/Filter",
        "hip/command/LoadProduct",
        "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText",
        "hip/command/AddText",
        "hip/command/AddImageFile",
        "text/entity/TextFlow",
        "text/entity/TextRange",
        "text/operation/ApplyStyleToElementOperation",
        "text/type/Style"
    ],
    function (Application, List, Bindable, Collection, Design, Product, DesignConfiguration, TextConfiguration, RectangleConfiguration, Filter, LoadProduct, DeleteText, InsertLine, InsertText, AddText, AddImageFile, TextFlow, TextRange, ApplyStyleToElementOperation, Style) {

        return Application.inherit({
            supportEnvironments: true,
            applicationDefaultNamespace: "hip",

            defaults: {
                executor: null,
                selectionHandler: null,
                selectedConfiguration: "{productHandler.selectedConfiguration}",
                product: "{productHandler.product}",
                isPrintout: false
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

            apiEndpoint: function () {
                return window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/api/v1";
            },

            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start: function (parameter, callback) {
                // setup command handlers

                this.$.executor.addCommandHandler(this.$.productHandler);

                this.$.injection.addInstance(this.$.svgLoader);

                // false - disables autostart
                this.callBase(parameter, false);

                console.log("rendererStarted");

                callback();
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

            renderPrintout: function (routeContext, productId) {
                this.renderProduct(routeContext, productId, true);
            },


            renderProduct: function (routeContext, productId, isPrintout) {
                this.set('isPrintout', isPrintout);

                var $document = this.$stage.$document;
                $document.title = "";

                this.$.executor.execute(new LoadProduct({
                    productId: productId,
                    noCache: true,
                    loadLazy: false,
                    callback: function (err) {
                        if (!err) {
                        }
                        setTimeout(function () {
                            console.log("rendered " + productId);
                        }, 50);
                    }
                }));
                routeContext.callback();
            },

            loadProduct: function (product, callback) {

                var self = this;

                flow()
                    .seq(function (cb) {
                        product.fetch(cb);
                    })
                    .parEach(product.$.configurations.toArray(), function (configuration, cb) {
                        self.loadConfiguration(configuration, cb);
                    })
                    .seq(function () {
                        product.$.productType.fetch(null)
                    })
                    .exec(callback);
            },

            statusClass: function () {
                var ret = "";

                if (this.$.selectedConfiguration) {
                    ret += "configuration-selected";
                }

                return ret;
            }.onChange('selectedConfiguration'),

            height2With: function (height) {
                var s = this.get('product.productType.printArea.size');
                if (s) {
                    return height * s.width / s.height;
                } else {
                    return height;
                }
            }.onChange('product.productType.printArea')
        });
    }
);