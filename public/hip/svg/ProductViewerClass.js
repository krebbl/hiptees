define(['js/svg/Svg', 'xaml!hip/svg/PrintAreaViewer', "hip/action/ProductActions", "hip/store/ProductStore"], function (Svg, PrintAreaViewerSvg, ProductActions, ProductStore) {

    return Svg.inherit('', {

        defaults: {
            width: null,
            height: null,
            addedToDom: false,
            productType: "{productStore.product.productType}",
            selectedConfiguration: "{productStore.selectedConfiguration}",
            printArea: "{productType.printArea}",
            product: "{productStore.product}",
            componentClass: "needsclick",
            appearance: "{product.appearance}",
            printAreaViewer: null,
            activeViewer: "{printAreaViewer.activeViewer}"
        },

        inject: {
            productActions: ProductActions,
            productStore: ProductStore
        },

        events: ['on:configurationLongTapped'],
        $classAttributes: ["product", "productType", "printAreaViewer", "activeViewer", "printAreaContainer", "appearance", "printArea", "addedToDom", "selectedConfiguration"],

        ctor: function () {
            this.callBase();

            this.$printAreaViewer = null;

        },

        _bindDomEvents: function () {
            this.callBase();
            var self = this;

            this.bindDomEvent('click', function (e) {
                self.$.productActions.selectConfiguration();
            }, false);
        },

        _onDomAdded: function () {
            this.callBase();


            var box = this.$el.getBoundingClientRect();
            this.set({
                'width': box.height,
                'height': box.height
            });

            this._renderProductType(this.$.productType);

            this.set('addedToDom', true);
        },

        _initializeRenderer: function () {
            this.callBase();
            this._renderProductType(this.$.productType);
        },

        _renderProductType: function (productType) {

            if (productType && this.$addedToDom) {
                var width = productType.get('size.width'),
                    height = productType.get('size.height');

                this.setViewBox(0, 0, width, height);
            } else {
                // TODO: clear the stuff
            }

        },

        getViewerForConfiguration: function (configuration) {
            return this.$.printAreaViewer.getViewerForConfiguration(configuration);
        },

        getSelectedConfigurationViewer: function () {
            var selectedConfiguration = this.get('productStore.selectedConfiguration');
            if (selectedConfiguration) {
                return this.$.printAreaViewer.getViewerForConfiguration(selectedConfiguration);
            }
            return null;
        },
        notifyLongTabOnConfiguration: function (configuration) {
            if (configuration) {
                this.trigger('on:configurationLongTapped', {configuration: configuration});
            }

        },

        _configurationClass: function () {
            return this.$.selectedConfiguration ? "configuration-selected" : "";
        }.onChange("selectedConfiguration")

    });


});