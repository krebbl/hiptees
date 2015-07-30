define(['js/svg/SvgElement', 'js/core/List',
    "underscore",
    'xaml!hip/svg/ConfigurationViewer', 'xaml!hip/svg/TextConfigurationViewer',
    'xaml!hip/svg/ImageConfigurationViewer',
    'xaml!hip/svg/RectangleConfigurationViewer',
    'hip/entity/TextConfiguration',
    'hip/entity/ImageConfiguration',
    'hip/entity/RectangleConfiguration',
    'hip/handler/ProductHandler'], function (SvgElement, List, _, ConfigurationViewerSvg, TextConfigurationViewer, ImageConfigurationViewer, RectangleConfigurationViewer, TextConfiguration, ImageConfiguration, RectangleConfiguration, ProductHandler) {

    return SvgElement.inherit('sprd.view.PrintAreaViewerSvg', {

        defaults: {
            tagName: 'g',
            product: null,
            printArea: null,
            componentClass: "print-area"
        },

        inject: {
            productHandler: ProductHandler
        },

        $classAttributes: ["product", "printArea"],

        ctor: function () {
            this.callBase();
            this.$configurationViewers = [];

            var self = this;
            this.bind('productHandler', 'on:configurationRemoved', function (e) {
                self._removeConfiguration(e.$.configuration);
            });
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
                this.$snapLines = new Array(2);
                for (var i = 0; i < this.$snapLines.length; i++) {
                    this.$snapLines[i] = this.createComponent(SvgElement, {
                        tagName: "line",
                        componentClass: "snapline",
                        stroke: "aqua",
                        "stroke-opacity": 0
                    });

                    this.addChild(this.$snapLines[i]);

                }


//                this._updateSnappingPoints();
            }

        },
        _addConfiguration: function (configuration) {

            var Factory = null;
            if (configuration instanceof TextConfiguration) {
                Factory = TextConfigurationViewer;
            } else if (configuration instanceof ImageConfiguration) {
                Factory = ImageConfigurationViewer;
            } else if (configuration instanceof RectangleConfiguration) {
                Factory = RectangleConfigurationViewer;
            }

            if (Factory) {
                var configurationViewer = this.createComponent(Factory, {
                    configuration: configuration,
                    printArea: this.$.printArea
                });

                var self = this;
                configurationViewer.bind('on:configurationMoved', function () {
                    self.$snapLines[0].set('stroke-opacity', 0);
                    self.$snapLines[1].set('stroke-opacity', 0);
                });

                this.$configurationViewers.push(configurationViewer);
                this.addChild(configurationViewer);
            }

        },

        _removeConfiguration: function (configuration) {
            for (var i = 0; i < this.$configurationViewers.length; i++) {
                var viewer = this.$configurationViewers[i];
                if (viewer.$.configuration == configuration) {
                    this.removeChild(viewer);
                    viewer.destroy();
                    this.$configurationViewers.splice(1, 1);

                    break;
                }
            }
        },

        _prepareSnappingPointsForViewer: function (viewer) {
            var x = 0,
                y = 0,
                width = this.get('printArea.width'),
                height = this.get('printArea.height'),
                snappingPoints = [
                    [x, x + width * 0.5, x + width],
                    [y, y + height * 0.5, y + height]
                ];

            for (var i = 0; i < this.$configurationViewers.length; i++) {
                var configViewer = this.$configurationViewers[i];
                if (configViewer !== viewer) {
                    var confSnappingPoints = configViewer.getSnappingPoints();

                    snappingPoints[0] = _.uniq(snappingPoints[0].concat(confSnappingPoints[0]));
                    snappingPoints[1] = _.uniq(snappingPoints[1].concat(confSnappingPoints[1]));

                }
            }

            this.$snappingPoints = snappingPoints;
        },

        snapToLines: function (point, axis) {
            // collect snap lines
            var snappingPoints = this.$snappingPoints;

            var closestPoint = false,
                threshold = 2;

            // check if it snap to lines
            for (var j = 0; j < snappingPoints[axis].length; j++) {
                var snapPoint = snappingPoints[axis][j],
                    diff = Math.abs(point - snapPoint);

                if (diff < threshold) {
                    if ((diff < closestPoint || closestPoint === false)) {
                        closestPoint = snapPoint;
                        break;
                    }
                }
            }

            // display snap line
            if (closestPoint !== false) {
                this.$snapLines[axis].set({
                    "stroke-opacity": 1,
                    x1: axis == 1 ? -1000 : closestPoint,
                    x2: axis == 1 ? 1000 : closestPoint,
                    y1: axis == 0 ? -1000 : closestPoint,
                    y2: axis == 0 ? 1000 : closestPoint
                });
            } else {
                this.$snapLines[axis].set({
                    "stroke-opacity": 0
                });
            }

            return closestPoint;

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