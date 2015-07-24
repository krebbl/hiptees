define(['js/svg/SvgElement', 'js/core/List', "underscore", "hip/command/Executor", "hip/command/SelectConfiguration", "hip/handler/ProductHandler"], function (SvgElement, List, _, Executor, SelectConfiguration, ProductHandler) {

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
            keepAspectRatio: false,
            rotatable: false,
            verticalStretchable: true,
            horizontalStretchable: true,
            _configurationWidth: 0,
            _configurationHeight: 0,
            _boundingBox: null,
            _anchor: {
                x: 0.5,
                y: 0.5
            },
            _size: {
                width: 0,
                height: 0
            },
            _offset: {
                x: 0,
                y: 0
            },

            _maskId: ""
        },

        inject: {
            executor: Executor,
            productHandler: ProductHandler
        },

        $classAttributes: ["handleWidth", "product", "printArea", "configuration", "keepAspectRatio", "selected", "verticalStretchable", "horizontalStretchable", "rotatable"],

        ctor: function (attr) {
            attr._maskId = "mask" + (++maskId);

            this.callBase();

            var self = this;
            this.bind('productHandler', 'change:selectedConfiguration', function (e) {
                if (e.$ === self.$.configuration) {
                    self.set('selected', true);
                } else {
                    self.set('selected', false)
                }
            });
        },

        _initializationComplete: function () {
            this.callBase();

            var self = this;
            this.getSvgRoot().bind('change:width', function (e) {
                if (e.$) {
                    self.set('handleWidth', 16 * self.globalToLocalFactor().x);
                }
            });
        },

        _commitConfiguration: function (configuration) {

            if (configuration) {
                var size = configuration.$.size,
                    offset = configuration.$.offset;

                this.set({
                    _size: size,
                    _offset: offset
                })
            }
        },


        getBoundRectInPx: function () {
            return this.$._boundingBox ? this.$._boundingBox.$el.getBoundingClientRect() : null;
        },


        handlePointerDown: function (action, type, event) {
//            event.preventDefault();
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
                    self.handlePointerUp(e);
                }
            }
            if (!this.$clickDelegate) {
                this.$clickDelegate = function (e) {
                    self.handleDocumentClick(e);
                }
            }

            this.$moved = false;

            this.dom(this.$stage.$document).bindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).bindDomEvent("click", this.$clickDelegate, true);
            this.dom(this.$stage.$document).bindDomEvent("pointerup", this.$upDelegate, true);
        },

        multiplyVectors: function (a, b) {
            return a[0] * b[0] + a[1] * b[1];
        },

        vectorLength: function (v) {
            return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
        },

        handleDocumentClick: function(e){
            if (this.$moved) {
                e.stopPropagation();
            }
            this.dom(this.$stage.$document).unbindDomEvent("click", this.$clickDelegate, true);
        },

        handlePointerMove: function (event) {
            event.preventDefault();

            var change = {},
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


            this.$moved = true;

            if (this.$action == "resize") {

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

                if (this.$originalSize.width + 2 * diffX <= 20) {
                    diffX = -this.$originalSize.width + 10;
                }
                if (this.$originalSize.height + 2 * diffY <= 20) {
//                    diffY = -this.$originalSize.height + 10;
                }
//                if (-diffY * 2 + 20 >= this.$originalSize.height) {
//                    diffY = -this.$originalSize.height + 20;
//                }
                if (this.$.keepAspectRatio) {
                    if (diffY !== 0) {
                        diffX = diffY * this.$originalSize.width / this.$originalSize.height;
                    } else {
                        diffY = diffX * this.$originalSize.height / this.$originalSize.width;
                    }
                }


                size.width = this.$originalSize.width + diffX * 2;
                size.height = this.$originalSize.height + diffY * 2;
                offset.x = this.$originalOffset.x - diffX;
                offset.y = this.$originalOffset.y - diffY;

                // if the corner handle is used
//                    if (this.$resizeType.length == 2) {
//                        // project resize vector on the diagonal root vector
//                        var diffVector = [diffX, diffY],
//                            rootVector = [this.$originalSize.width, this.$originalSize.height];
//
//                        if (this.$resizeType.indexOf("l") > -1) {
//                            rootVector[0] = rootVector[0] * -1;
//                        }
//
//                        if (this.$resizeType.indexOf("t") > -1) {
//                            rootVector[1] = rootVector[1] * -1;
//                        }
//
//                        // calculate the length of the projected vector
//                        var rootLength = this.vectorLength(rootVector);
//                        var s = this.multiplyVectors(diffVector, rootVector) / rootLength,
//                            lf = s / rootLength;
//
//
//                        // multiply with the root vector
//                        diffX = rootVector[0] * lf;
//                        diffY = rootVector[1] * lf;
//
//                        var correctedDiffX,
//                            rootX;
//                        if (this.$resizeType.indexOf("r") > -1) {
//                            rootX = this.$originalOffset.x + this.$originalSize.width;
//                            snapped = this.$parent.snapToLines(rootX + diffX);
//                            if (snapped !== false) {
//                                correctedDiffX = snapped - rootX;
//                            } else {
//                                rootX = this.$originalOffset.x + this.$originalSize.width * 0.5;
//                                snapped = this.$parent.snapToLines(rootX + diffX * 0.5);
//                                if (snapped !== false) {
//                                    correctedDiffX = (snapped - rootX) * 2;
//                                }
//                            }
//                        } else if (this.$resizeType.indexOf("l") > -1) {
//                            rootX = this.$originalOffset.x;
//                            snapped = this.$parent.snapToLines(rootX + diffX);
//                            if (snapped !== false) {
//                                correctedDiffX = snapped - rootX;
//                            } else {
//                                rootX = this.$originalOffset.x + this.$originalSize.width * 0.5;
//                                snapped = this.$parent.snapToLines(rootX + diffX * 0.5);
//                                if (snapped !== false) {
//                                    correctedDiffX = (snapped - rootX) * 2;
//                                }
//                            }
//
//
//                        }
//                        if (correctedDiffX) {
//                            var dir = 1;
//                            if (this.$resizeType.indexOf("t") > -1) {
//                                dir *= -1;
//                            }
//                            if (this.$resizeType.indexOf("l") > -1) {
//                                dir *= -1;
//                            }
//                            diffY += dir * (correctedDiffX - diffX);
//                            diffX = correctedDiffX;
//                        }
//
//                    } else {
//                        // if a left, top, bottom or right handle is used, keep aspect ratio
//                        if (this.$resizeType.indexOf("l") > -1 || this.$resizeType.indexOf("r") > -1) {
//                            diffY = (this.$originalSize.height / this.$originalSize.width) * diffX * 0.5;
//
//                            if (this.$resizeType.indexOf("l") > -1) {
//                                diffY *= -1;
//                            }
//
//                            offset.y -= diffY;
//                            size.height += 2 * diffY;
//                        } else if (this.$resizeType.indexOf("b") > -1 || this.$resizeType.indexOf("t") > -1) {
//                            diffX = (this.$originalSize.width / this.$originalSize.height) * diffY * 0.5;
//
//                            if (this.$resizeType.indexOf("t") > -1) {
//                                diffX *= -1;
//                            }
//
//                            offset.x -= diffX;
//                            size.width += 2 * diffX;
//                        }
//
//                    }

//                if (this.$resizeType.indexOf("r") > -1) {
//                    snapped = this.$parent.snapToLines(this.$originalOffset.x + this.$originalSize.width + diffX);
//                    if (snapped > -1) {
//                        diffX = snapped - this.$originalOffset.x - this.$originalSize.width;
//                    } else {
//                        snapped = this.$parent.snapToLines(this.$originalOffset.x + this.$originalSize.width * 0.5 + diffX * 0.5);
//                        if (snapped > -1) {
//                            diffX = (snapped - (this.$originalOffset.x + this.$originalSize.width * 0.5)) * 2;
//                        }
//                    }
//                }

                // calculate new offset and size
//                if (this.$resizeType.indexOf("b") > -1 && this.$.verticalStretchable) {
//                    size.height = this.$originalSize.height + diffY;
//                    offset.y = this.$originalOffset.y;
//                }
//
//                if (this.$resizeType.indexOf("r") > -1 && this.$.horizontalStretchable) {
//                    size.width = this.$originalSize.width + diffX;
//                    offset.x = this.$originalOffset.x;
//                }
//
//                if (this.$resizeType.indexOf("l") > -1 && this.$.horizontalStretchable) {
//                    offset.x = this.$originalOffset.x + diffX;
//                    size.width = this.$originalSize.width - diffX;
//                }
//
//                if (this.$resizeType.indexOf("t") > -1 && this.$.verticalStretchable) {
//                    offset.y = this.$originalOffset.y + diffY;
//                    size.height = this.$originalSize.height - diffY;
//                }
//                size.width = Math.max(10, size.width);
//                size.height = Math.max(10, size.height);

                change._size = size;
            } else if (this.$action == "move") {
                if (!event.touches || event.touches.length === 1) {
                    offset.x += diffX;
                    offset.y += diffY;
                }


            }


            change._offset = offset;


            // TODO: execute position change command
            this.set(change, {force: true});
        },

        handlePointerUp: function (event) {
            this.$preventClick = false;

            if (this.$moved) {
                this.$preventClick = true;
                event.preventDefault();
                event.stopPropagation();
                this.dom(this.$stage.$document).unbindDomEvent("click", this.$clickDelegate, true);

                this.$.executor.storeAndExecute(new SelectConfiguration({
                    configuration: this.$.configuration
                }));
            }

            this.$originalSize = null;
            this.$originalOffset = null;
            this.$startLength = null;

            this.dom(this.$stage.$document).unbindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).unbindDomEvent("pointerup", this.$upDelegate, true);
        },

        _render_offset: function (offset) {
            if (offset) {
                this.translate(offset.x, offset.y);
            }
        },

        half: function (value) {
            return value * 0.5;
        },

        quarter: function (value) {
            return value * 0.25;
        },

        and: function (a, b) {
            return a && b;
        },

        _handleClick: function (e) {
            this.dom(this.$stage.$document).unbindDomEvent("click", this.$clickDelegate, true);

            this.$.executor.storeAndExecute(new SelectConfiguration({
                configuration: this.$.configuration
            }));

            e.stopPropagation();
        },
        negate: function (number) {
            return -1 * number;
        }



    });


});