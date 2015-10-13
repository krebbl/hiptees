define(['js/svg/SvgElement', 'js/core/List', "underscore", "hip/command/Executor", "hip/command/SelectConfiguration", "hip/handler/ProductHandler", "hip/command/MoveConfiguration", "hip/command/PointDownConfiguration"], function (SvgElement, List, _, Executor, SelectConfiguration, ProductHandler, MoveConfiguration, PointDownConfiguration) {

    var maskId = 1;

    return SvgElement.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            tagName: 'g',
            product: null,
            printArea: null,
            configuration: null,
            selected: false,
            handleWidth: 10,
            componentClass: "configuration-viewer",
            keepAspectRatio: "{configuration.keepAspectRatio}",
            rotatable: false,
            verticalStretchable: true,
            horizontalStretchable: true,
            _minHeight: 10,
            _minWidth: 10,
            _configurationWidth: 0,
            _configurationHeight: 0,
            _boundingBox: null,
            _anchor: "{anchor()}",
            _size: "{configuration.size}",
            _offset: "{configuration.offset}",
            _maskId: "",
            _realOffset: "{offset()}",
            _resizing: false,
            _moving: false,
            translateX: "{_realOffset.x}",
            translateY: "{_realOffset.y}"
        },

        inject: {
            executor: Executor,
            productHandler: ProductHandler
        },

        $classAttributes: ["handleWidth", "product", "printArea", "configuration", "keepAspectRatio", "selected", "verticalStretchable", "horizontalStretchable", "rotatable", "printAreaViewer"],

        ctor: function (attr) {
            attr._maskId = "mask" + (++maskId);

            this.callBase();

            var self = this;
            this.bind('productHandler', 'on:configurationSelected', function (e) {
                self.set('selected', e.$.configuration === self.$.configuration);
            });
        },

        offset: function () {
            var size = this.$._size || {width: 0, height: 0},
                offset = this.$._offset || {x: 0, y: 0},
                anchor = this.$._anchor;

            return {
                x: (offset.x - size.width * anchor.x) || 0,
                y: (offset.y - size.height * anchor.y) || 0
            };
        }.onChange("_offset", "_size", "_anchor"),

        anchor: function () {
            return {
                x: 0.5,
                y: 0.5
            };
        },

        _initializationComplete: function () {
            this.callBase();
            this._updateSnapPoints();

        },

//        _updateOffsetAndSize: function (configuration) {
//            if (configuration) {
//                var size = configuration.$.size,
//                    offset = configuration.$.offset;
//
//                this.set({
//                    _size: size,
//                    _offset: offset
//                });
//
//                this._updateSnapPoints();
//            }
//        },

        getBoundRectInPx: function () {
            return this.$._boundingBox ? this.$._boundingBox.$el.getBoundingClientRect() : null;
        },


        handlePointerDown: function (action, type, event) {
            console.log("down: " + this.get('configuration.type'));

            if (!this.$stage.$browser.isIOS) {
                event.preventDefault();
            }
//            event.stopPropagation();
            this.$currentTarget = event.target;
            this.$action = action;
            this.$resizeType = type;
            this.$downPoint = {
                x: event.pointerEvent.pageX,
                y: event.pointerEvent.pageY
            };

            this.$originalSize = this.$._size;
            this.$originalOffset = this.$._offset;

            var self = this;

            if (!this.$moveDelegate) {
                this.$moveDelegate = function (e) {
                    self.handlePointerMove(e);
                }
            }

            if (!this.$upDelegate) {
                this.$upDelegate = function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    self.handlePointerUp(e);
                }
            }
            if (!this.$clickDelegate) {
                this.$clickDelegate = function (e) {
                    self.handleDocumentClick(e);
                }
            }

            this.$.printAreaViewer._prepareSnappingPointsForViewer(this);

            this.$moved = false;
            this.$resized = false;

            this.$.executor.storeAndExecute(new PointDownConfiguration({
                configuration: this.$.configuration
            }));

            this.dom(this.$stage.$document).bindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).bindDomEvent("click", this.$clickDelegate, true);
            this.dom(this.$stage.$document).bindDomEvent("pointerup", this.$upDelegate, true);

            this.trigger('on:configurationPointerDown', {configuration: this.$.configuration}, this);
        },

        multiplyVectors: function (a, b) {
            return a[0] * b[0] + a[1] * b[1];
        },

        vectorLength: function (v) {
            return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
        },

        handleDocumentClick: function (e) {
            console.log("document click");
            if (this.$moved || this.$resized) {
                e.stopPropagation();
            }
            this.dom(this.$stage.$document).unbindDomEvent("click", this.$clickDelegate, true);
        },

        handlePointerMove: function (event) {
            event.preventDefault();

            var change = {},
                self = this,
                size = _.clone(this.$originalSize),
                offset = _.clone(this.$originalOffset),
                changedEvent = event.changedTouches ? event.changedTouches[0] : event,
                f = this.globalToLocalFactor(),
                diffX = (changedEvent.pageX - this.$downPoint.x) * f.x,
                diffY = (changedEvent.pageY - this.$downPoint.y) * f.y;

            if (event.touches && event.touches.length == 2) {
                var length = this.vectorLength([
                        event.touches[0].pageX - event.touches[1].pageX,
                        event.touches[0].pageY - event.touches[1].pageY]
                );
                if (!this.$startLength) {
                    this.$startLength = length;
                } else {

                    diffX = (length - this.$startLength) * f.x;
                    diffY = 0;

                    this.$resizeType = "r";
                    this.$action = "resize";
                }

            }


            if (this.$action == "resize") {
                this.set('_resizing', true);

                this.$resized = true;
                var snapped;

                var rootVector = [0, 0],
                    scaleVector = [diffX, diffY];

                if (this.$resizeType.indexOf("l") > -1) {
                    rootVector[0] = -this.$originalSize.width;
                }
                if (this.$resizeType.indexOf("r") > -1) {
                    rootVector[0] = this.$originalSize.width;
                }
                if (this.$resizeType.indexOf("t") > -1) {
                    rootVector[1] = -this.$originalSize.height;
                }
                if (this.$resizeType.indexOf("b") > -1) {
                    rootVector[1] = this.$originalSize.height;
                }

                // calculate the length of the projected vector
                var rootLength = this.vectorLength(rootVector);
                var s = this.multiplyVectors(scaleVector, rootVector) / rootLength,
                    lf = s / rootLength;


                // multiply with the root vector
                diffX = Math.abs(rootVector[0]) * lf;
                diffY = Math.abs(rootVector[1]) * lf;


                var minHeight = this.$._minHeight,
                    minWidth = this.$._minWidth;
                if (this.$originalSize.width + diffX * 2 < minWidth) {
                    diffX = (minWidth - this.$originalSize.width) / 2;
                }

                if (this.$originalSize.height + diffY * 2 < minHeight) {
                    diffY = (minHeight - this.$originalSize.height) / 2;
                }

                if (this.$.keepAspectRatio) {
                    if (diffY !== 0) {
                        diffX = diffY * this.$originalSize.width / this.$originalSize.height;
                    } else {
                        diffY = diffX * this.$originalSize.height / this.$originalSize.width;
                    }
                }

                size.width = this.$originalSize.width + diffX * 2;
                size.height = this.$originalSize.height + diffY * 2;
//                offset.x = this.$originalOffset.x - diffX;
//                offset.y = this.$originalOffset.y - diffY;

                change._size = size;
            } else if (this.$action == "move") {
                this.set('_moving', true);
                this.$moved = true;
                if (!event.touches || event.touches.length === 1) {

                    offset.x += diffX;
                    offset.y += diffY;

                    var x = snapToPoints([
                        [offset.x, size.width * (0.5 - this.$._anchor.x)],
                        [offset.x, size.width * (0 - this.$._anchor.x)],
                        [offset.x, size.width * (1 - this.$._anchor.x)]
                    ], 0);

                    var y = snapToPoints([
                        [offset.y, size.height * (0.5 - this.$._anchor.y)],
                        [offset.y, size.height * (0 - this.$._anchor.y)],
                        [offset.y, size.height * (1 - this.$._anchor.y)]
                    ], 1);

                    offset.x = x;
                    offset.y = y;
                }


            }

            function snapToPoints(points, a) {
                var ret = points[0][0],
                    snapped = false;
                for (var i = 0; i < points.length; i++) {
                    var p = points[i];
                    snapped = snapToPoint(p[0], p[1], a);
                    if (snapped !== false) {
                        ret = snapped;
                        break;
                    }
                }
                return ret;
            }

            function snapToPoint(p, diff, a) {
                var snapped = self.$.printAreaViewer.snapToLines(p + diff, a);
                if (snapped !== false) {
                    snapped -= diff;
                }
                return snapped;
            }

            change._offset = offset;

            this.set(change, {force: true});
        },

        handlePointerUp: function (event) {
            console.log("up:" + this.get('configuration.type'));
            this.dom(this.$stage.$document).unbindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).unbindDomEvent("pointerup", this.$upDelegate, true);

            this.set({'_resizing': false, '_moving': false});

            this.$preventClick = !this.$.selected;

            if (this.$moved || this.$resized) {
                this.$.executor.storeAndExecute(new MoveConfiguration({
                    configuration: this.$.configuration,
                    offset: this.$._offset,
                    size: this.$resized ? this.$._size : null
                }));
            }

            this.$.executor.storeAndExecute(new SelectConfiguration({
                configuration: this.$.configuration
            }));

            this.$originalSize = null;
            this.$originalOffset = null;
            this.$startLength = null;
            this.trigger('on:configurationPointerUp', {configuration: this.$.configuration}, this);

            var self = this;
            setTimeout(function () {
                self.$moved = self.$resized = false;
            }, 10);
        },

        cornerHandleVisible: function () {
            var size = this.$._size;
            if (size) {
                return Math.min(size.width, size.height) > this.$.handleWidth;
            }
            return true;
        }.onChange('_size', 'handleWidth'),

        half: function (value) {
            return value * 0.5;
        },

        quarter: function (value) {
            return value * 0.5;
        },

        and: function (a, b, c) {
            return a && b && c;
        },

        gt: function (a, b) {
            return a > b;
        },

        _handleClick: function (e) {
            this.dom(this.$stage.$document).unbindDomEvent("click", this.$clickDelegate, true);

            e.stopPropagation();
        },
        negate: function (number) {
            return -1 * number;
        },

        _commitChangedAttributes: function ($) {
            this.callBase();

            this._updateSnapPoints();
        },

        _updateSnapPoints: function () {
            var x = this.get('_realOffset.x'),
                y = this.get('_realOffset.y'),
                width = this.get('_size.width'),
                height = this.get('_size.height');

            this.$snappingPoints = [
                [x, x + width * 0.5, x + width],
                [y, y + height * 0.5, y + height]
            ];
        },

        getSnappingPoints: function () {
            return this.$snappingPoints;
        }

    });


});