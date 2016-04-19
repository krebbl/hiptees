define(['js/svg/SvgElement', 'js/core/List', "underscore", "hip/action/ProductActions", "hip/store/ProductStore"], function (SvgElement, List, _, ProductActions, ProductStore) {

    var maskId = 1;

    return SvgElement.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            tagName: 'g',
            product: null,
            printArea: null,
            configuration: null,
            selected: "{eq(productStore.selectedConfiguration, configuration)}",
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
            translateY: "{_realOffset.y}",
            _keepHeight: false
        },

        inject: {
            productActions: ProductActions,
            productStore: ProductStore
        },

        $classAttributes: ["handleWidth", "product", "printArea", "configuration", "keepAspectRatio", "selected", "verticalStretchable", "horizontalStretchable", "rotatable", "printAreaViewer"],

        ctor: function (attr) {
            attr._maskId = "mask" + (++maskId);

            this.callBase();
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
            return this.$._boundingBox && this.$._boundingBox.isRendered() ? this.$._boundingBox.$el.getBoundingClientRect() : null;
        },


        handlePointerDown: function (action, type, event, handleUsed) {
            if (!this.$stage.$browser.isIOS) {
                event.preventDefault();
            }

            if (event.domEvent.touches && event.domEvent.touches.length > 1) {
                return;
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

            this.$handleUsed = handleUsed;
            this.$moved = false;
            this.$resized = false;

            if (!this.$.selected) {
                this.$.productActions.selectConfiguration({
                    configuration: this.$.configuration
                });
            }

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
            if (this.$moved || this.$resized) {
                e.stopPropagation();
            }
            this.dom(this.$stage.$document).unbindDomEvent("click", this.$clickDelegate, true);
        },

        _createDiffVector: function (event) {

            var changedEvent = event.touches ? event.touches[0] : event,
                f = this.globalToLocalFactor(),
                diffX = (changedEvent.pageX - this.$downPoint.x) * f.x,
                diffY = (changedEvent.pageY - this.$downPoint.y) * f.y;

            //if (event.touches && event.touches.length == 2) {
            //    if (this.$.keepAspectRatio || this.$._keepHeight) {
            //        var length = this.vectorLength([
            //            event.touches[0].pageX - event.touches[1].pageX,
            //            event.touches[0].pageY - event.touches[1].pageY]);
            //        if (!this.$startLength) {
            //            this.$startLength = length;
            //        } else {
            //            diffX = (length - this.$startLength) * f.x;
            //            diffY = 0;
            //        }
            //    } else {
            //        var vector = [
            //            Math.abs(event.touches[0].pageX - event.touches[1].pageX),
            //            Math.abs(event.touches[0].pageY - event.touches[1].pageY)];
            //        if (!this.$startVector) {
            //            this.$startVector = vector;
            //        } else {
            //
            //            diffX = (vector[0] - this.$startVector[0]) * f.x;
            //            diffY = (vector[1] - this.$startVector[1]) * f.y;
            //        }
            //    }
            //}

            return [diffX, diffY];
        },

        handlePointerMove: function (event) {
            event.preventDefault();

            var change = {},
                self = this,
                size = _.clone(this.$originalSize),
                offset = _.clone(this.$originalOffset),
                diffVector = this._createDiffVector(event),
                diffX = diffVector[0],
                diffY = diffVector[1];


            var anchor = this.$._anchor;
            if (this.$action == "resize") {
                this.set('_resizing', true);

                this.$resized = true;

                if (this.$.keepAspectRatio) {
                    var rootVector = [this.$originalSize.width, this.$originalSize.height];


                    // calculate the length of the projected vector
                    var rootLength = this.vectorLength(rootVector);
                    var s = this.multiplyVectors(diffVector, rootVector) / rootLength,
                        lf = s / rootLength;

                    // multiply with the root vector
                    diffX = Math.abs(rootVector[0]) * lf;
                    diffY = Math.abs(rootVector[1]) * lf;

                    if (this.$.keepAspectRatio) {
                        if (diffY !== 0) {
                            diffX = diffY * this.$originalSize.width / this.$originalSize.height;
                        } else {
                            diffY = diffX * this.$originalSize.height / this.$originalSize.width;
                        }
                    }
                }

                var minHeight = this.$._minHeight,
                    minWidth = this.$._minWidth;
                if (this.$originalSize.width + diffX * 2 < minWidth) {
                    diffX = (minWidth - this.$originalSize.width) / 2;
                }

                if (this.$originalSize.height + diffY * 2 < minHeight) {
                    diffY = (minHeight - this.$originalSize.height) / 2;
                }

                if (this.$._keepHeight) {
                    diffY = 0;
                }

                size.width = this.$originalSize.width + diffX * 1 / Math.abs(1 - anchor.x);
                size.height = this.$originalSize.height + diffY * 1 / Math.abs(1 - anchor.y);

                var snappedWidth = Math.abs(snapToPoints([
                        [size.width * (0 - anchor.x), this.$originalOffset.x],
                        [size.width * anchor.x, this.$originalOffset.x]
                    ], 0)) * (1 / anchor.x);

                var snappedHeight = size.height;

                if (this.$.keepAspectRatio) {
                    snappedHeight = this.$originalSize.height / this.$originalSize.width * snappedWidth;
                }

                size.width = snappedWidth;
                size.height = snappedHeight;

                change._size = size;
            } else if (this.$action == "move") {
                this.set('_moving', true);
                this.$moved = true;
                if (!event.touches || event.touches.length === 1) {

                    offset.x += diffX;
                    offset.y += diffY;

                    var x = snapToPoints([
                        [offset.x, size.width * (0.5 - anchor.x)],
                        [offset.x, size.width * (0 - anchor.x)],
                        [offset.x, size.width * (1 - anchor.x)]
                    ], 0);

                    var y = snapToPoints([
                        [offset.y, size.height * (0.5 - anchor.y)],
                        [offset.y, size.height * (0 - anchor.y)],
                        [offset.y, size.height * (1 - anchor.y)]
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
            this.dom(this.$stage.$document).unbindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).unbindDomEvent("pointerup", this.$upDelegate, true);

            this.set({'_resizing': false, '_moving': false});

            this.$preventClick = !this.$.selected;

            if (this.$moved || this.$resized) {
                this.$.productActions.moveConfiguration({
                    configuration: this.$.configuration,
                    offset: this.$._offset,
                    size: this.$resized ? this.$._size : null
                });
            }
            if (!this.$.selected || !(this.$moved || this.$resized)) {

            }

            this.$originalSize = null;
            this.$originalOffset = null;
            this.$startLength = null;
            this.$startVector = null;
            this.$downPoint = null;
            this.$handleUsed = false;
            this.trigger('on:configurationPointerUp', {configuration: this.$.configuration}, this);

            var self = this;
            setTimeout(function () {
                self.$moved = self.$resized = false;
            }, 10);
        },

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

        eq: function (a, b) {
            return a === b;
        },

        mp: function (a, b) {
            return a * b;
        },

        _handleClick: function (e) {
            this.dom(this.$stage.$document).unbindDomEvent("click", this.$clickDelegate, true);

            e.stopPropagation();
        },
        negate: function (number) {
            return -1 * number;
        },

        plus: function (a, b) {
            return (a + b) || 0;
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