define(['js/svg/Svg', 'xaml!hip/svg/PrintAreaViewer', "hip/action/ProductActions", "hip/store/ProductStore"], function (Svg, PrintAreaViewerSvg, ProductActions, ProductStore) {

    return Svg.inherit('', {

        defaults: {
            width: 1000,
            height: 1000,
            product: null,
            componentClass: "needsclick",
            appearance: "{product.appearance}",
            productType: "{product.productType}",
            printArea: "{productType.printArea}"
        },

        inject: {
            productActions: ProductActions,
            productStore: ProductStore
        },

        events: ['on:configurationLongTapped'],
        $classAttributes: ["product", "productType", "printAreaViewer", "printAreaContainer", "appearance", "printArea"],

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

            if (this.$.productType) {
                this.setViewBox(0, 0, this.get('productType.size.width'), this.get('productType.size.height'));
            }
        },

        _renderProductType: function (productType) {

            if (productType) {
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

        }

    });


});