define(['js/svg/SvgElement', 'js/core/List', 'xaml!hip/view/ConfigurationViewerSvg', 'xaml!hip/view/TextConfigurationViewer', 'xaml!hip/view/ImageConfigurationViewer', 'hip/model/TextConfiguration', 'hip/model/ImageConfiguration'], function (SvgElement, List, ConfigurationViewerSvg, TextConfigurationViewer, ImageConfigurationViewer, TextConfiguration, ImageConfiguration) {

    return SvgElement.inherit('sprd.view.PrintAreaViewerSvg', {

        defaults: {
            tagName: 'g',
            product: null,
            printArea: null,
            componentClass: "print-area"
        },

        $classAttributes: ["product", "printArea"],

        ctor: function () {
            this.callBase();
            this.$configurationViewers = [];
        },

        _renderPrintArea: function (printArea) {
            if (printArea) {

                // Could be done via binding, but viewMaps don't change at runtime and so just evalulating
                this.translate(this.get("printArea.offset.x"), this.get("printArea.offset.y"));


                var border = this.createComponent(SvgElement, {
                    tagName: "rect",
                    componentClass: "print-area-border",
                    fill: "white",
                    width: this.get('printArea.width'),
                    height: this.get('printArea.height')
                });


                this.$border = border;

                this.addChild(this.$border);
            }
        },
        _renderProduct: function (product) {

            if (product) {
                var self = this;
                product.$.configurations.each(function (configuration) {
                    self._addConfiguration(configuration);
                });
            }

        },
        _addConfiguration: function (configuration) {

            var Factory = null;
            if (configuration instanceof TextConfiguration) {
                Factory = TextConfigurationViewer;
            } else if (configuration instanceof ImageConfiguration) {
                Factory = ImageConfigurationViewer;
            }

            if (Factory) {
                var configurationViewer = this.createComponent(Factory, {
                    configuration: configuration,
                    printArea: this.$.printArea
                });

                this.$configurationViewers.push(configurationViewer);
                this.addChild(configurationViewer);
            }

        },

        _removeConfiguration: function (configuration) {

        },

        getViewerForConfiguration: function (configuration) {

            for (var i = 0; i < this.$configurationViewers.length; i++) {
                var configViewer = this.$configurationViewers[i];
                if (configViewer.$.configuration === configuration) {
                    return configViewer;
                }
            }
            return null;
        }

    });


});