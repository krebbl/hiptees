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
                anchor: 0,
                focus: 0,
                text: "",
                fonts: null,
                executor: null,
                selectionHandler: null,
                selectedConfiguration: "{productHandler.selectedConfiguration}",
                product: "{productHandler.product}",
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

            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start: function (parameter, callback) {
                // setup command handlers

                this.$.executor.addCommandHandler(this.$.productHandler);

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

            defaultRoute: function (routeContext, productId) {
                this.$.executor.execute(new LoadProduct({
                    productId: productId
                }));

                routeContext.callback();
            },

            statusClass: function () {
                var ret = "";

                if (this.$.selectedConfiguration) {
                    ret += "configuration-selected";
                }

                return ret;
            }.onChange('selectedConfiguration'),

            width2Height: function (width) {
                var s = this.get('product.productType.printArea.size');
                if (s) {
                    return width * s.height / s.width;
                } else {
                    return width;
                }
            }.onChange('product.productType.printArea')
        });
    }
);