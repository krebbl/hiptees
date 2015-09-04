define(['js/svg/SvgElement', 'js/core/List',
    "underscore",
    'xaml!hip/svg/ConfigurationViewer', 'xaml!hip/svg/TextConfigurationViewer',
    'xaml!hip/svg/DesignConfigurationViewer',
    'xaml!hip/svg/RectangleConfigurationViewer',
    'xaml!hip/svg/CircleConfigurationViewer',
    'hip/entity/TextConfiguration',
    'hip/entity/DesignConfiguration',
    'hip/entity/RectangleConfiguration',
    'hip/entity/CircleConfiguration',
    'hip/handler/ProductHandler'], function (SvgElement, List, _, ConfigurationViewerSvg, TextConfigurationViewer, DesignConfigurationViewer, RectangleConfigurationViewer, CircleConfigurationViewer, TextConfiguration, DesignConfiguration, RectangleConfiguration, CircleConfiguration, ProductHandler) {

    return SvgElement.inherit('sprd.view.PrintAreaViewerSvg', {

        defaults: {
            tagName: 'g',
            product: null,
            printArea: null,
            componentClass: "print-area",
            showActiveViewer: false,
            activeViewer: null,
            handleWidth: 10
        },

        inject: {
            productHandler: ProductHandler
        },

        $classAttributes: ["product", "printArea", "activeViewer", "showActiveViewer"],

        ctor: function () {
            this.callBase();
            this.$configurationViewers = [];

            var self = this;
            this.bind('productHandler', 'on:configurationRemoved', function (e) {
                self._removeConfiguration(e.$.configuration);
            });
            this.bind('productHandler', 'on:configurationAdded', function (e) {
                self._addConfiguration(e.$.configuration);
            });

            this.bind('productHandler', 'on:configurationSelected', function (e) {
                var viewer = self.getViewerForConfiguration(e.$.configuration);
                if (viewer) {
                    self.set('activeViewer', viewer);
                    self._updateHandleSize();
                }
                self.set('showActiveViewer', !!viewer);
            });

            this.bind('productHandler', 'on:configurationOrderChanged', function (e) {
                var viewer = self.getViewerForConfiguration(e.$.configuration);
                self.$.configurations.setChildIndex(viewer, e.$.index);
            });
        },
        _onDomAdded: function () {
            this.callBase();

//            if (!this.$configurationInfo) {
//                this.$configurationInfo = this.$templates.configurationInfo.createInstance();
//                var root = this.getSvgRoot(),
//                    renderParent = root.$renderParent;
//                renderParent.$el.appendChild(this.$configurationInfo.render());
//            }

            this._updateHandleSize();

        },

        _updateHandleSize: function () {
            this.set('handleWidth', 8 * this.globalToLocalFactor().x);

        },

        _initializationComplete: function () {
            this.callBase();

            var self = this;
            this.getSvgRoot().bind('change:width', this._updateHandleSize, this);

        },

        _renderProduct: function (product) {
            if (product) {
                var self = this;
                while (this.$.configurations.$children.length) {
                    this.$.configurations.removeChild(this.$.configurations.$children[0]);
                }

                product.$.configurations.each(function (configuration) {
                    self._addConfiguration(configuration);
                });
            }
        },
        _addConfiguration: function (configuration) {

            var Factory = null;
            if (configuration instanceof TextConfiguration) {
                Factory = TextConfigurationViewer;
            } else if (configuration instanceof DesignConfiguration) {
                Factory = DesignConfigurationViewer;
            } else if (configuration instanceof RectangleConfiguration) {
                Factory = RectangleConfigurationViewer;
            } else if (configuration instanceof CircleConfiguration) {
                Factory = CircleConfigurationViewer;
            }

            if (Factory) {
                var configurationViewer = this.createComponent(Factory, {
                    configuration: configuration,
                    printArea: this.$.printArea,
                    printAreaViewer: this
                });

                var self = this;
                configurationViewer.bind('on:configurationPointerUp', function () {
                    self.$.snapLines.$children[0].set('stroke-opacity', 0);
                    self.$.snapLines.$children[1].set('stroke-opacity', 0);
                });

                configurationViewer.bind('on:configurationPointerDown', function (e) {
                    self.set({
                        activeViewer: e.target,
                        showActiveViewer: false
                    });
                });

                this.$.configurations.addChild(configurationViewer);
            }

        },

        _removeConfiguration: function (configuration, destroy) {
            var viewer = this.getViewerForConfiguration(configuration);
            if (viewer) {
                this.$.configurations.removeChild(viewer);
                viewer.destroy();
            }
        },

        _prepareSnappingPointsForViewer: function (viewer) {
            var x = 0,
                y = 0,
                width = this.get('printArea.size.width'),
                height = this.get('printArea.size.height'),
                snappingPoints = [
                    [x, x + width * 0.5, x + width],
                    [y, y + height * 0.5, y + height]
                ];

            for (var i = 0; i < this.$.configurations.$children.length; i++) {
                var configViewer = this.$.configurations.$children[i];
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
                this.$.snapLines.$children[axis].set({
                    "stroke-opacity": 1,
                    x1: axis == 1 ? -1000 : closestPoint,
                    x2: axis == 1 ? 1000 : closestPoint,
                    y1: axis == 0 ? -1000 : closestPoint,
                    y2: axis == 0 ? 1000 : closestPoint
                });
            } else {
                this.$.snapLines.$children[axis].set({
                    "stroke-opacity": 0
                });
            }

            return closestPoint;

        },

        getViewerForConfiguration: function (configuration) {

            for (var i = 0; i < this.$.configurations.$children.length; i++) {
                var configViewer = this.$.configurations.$children[i];
                if (configViewer.$.configuration === configuration) {
                    return configViewer;
                }
            }
            return null;
        },

        handlePointerDown: function (t, p, e) {
            this.$.activeViewer && this.$.activeViewer.handlePointerDown(t, p, e);
        },

        or: function (a, b) {
            return a || b;
        },
        and: function (a, b, c) {
            return a && b && c;
        },

        half: function (a) {
            return a * 0.5;
        },
        quarter: function (value) {
            return value * 0.5;
        },
        handleClick: function () {
            console.log("wasdasd");
        }

    });


});