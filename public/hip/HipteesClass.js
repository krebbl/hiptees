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
        "hip/command/ApplyFilter",
        "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText",
        "hip/command/AddText",
        "hip/command/AddImageFile",
        "text/entity/TextFlow",
        "text/entity/TextRange",
        "text/operation/ApplyStyleToElementOperation",
        "text/type/Style"
    ],
    function (Application, List, Bindable, Collection, Design, Product, DesignConfiguration, TextConfiguration, RectangleConfiguration, Filter, ApplyFilter, DeleteText, InsertLine, InsertText, AddText, AddImageFile, TextFlow, TextRange, ApplyStyleToElementOperation, Style) {

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
                addViewSelected: false
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

            _selectFont: function (font) {

                var command = new ChangeFontFamily({
                    fontFamily: font.name,
                    configuration: this.$.selectedConfiguration
                });
                this.$.executor.storeAndExecute(command);
            },

            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start: function (parameter, callback) {
                // setup command handlers

                this.$.navigationHandler.set('router', this.$.router);

                this.$.executor.addCommandHandler(this.$.navigationHandler);
                this.$.executor.addCommandHandler(this.$.textConfigurationHandler);
                this.$.executor.addCommandHandler(this.$.shapeConfigurationHandler);
                this.$.executor.addCommandHandler(this.$.imageConfigurationHandler);
                this.$.executor.addCommandHandler(this.$.applyFilterHandler);
                this.$.executor.addCommandHandler(this.$.productHandler);
                this.$.executor.addCommandHandler(this.$.configurationHandler);
                this.$.executor.addCommandHandler(this.$.textFlowHandler);

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

            defaultRoute: function (routeContext) {
                routeContext.navigate(this.$lastFragment || "productTypes");
            },

            statusClass: function () {
                var ret = "";

                if (this.$.selectedConfiguration) {
                    ret += "configuration-selected";
                }

                return ret;
            }.onChange('selectedConfiguration')
        });
    }
);