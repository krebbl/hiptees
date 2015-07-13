define(['js/svg/SvgElement', 'js/core/List', "underscore", "hip/command/Executor", "hip/command/SelectConfiguration", "hip/handler/ProductHandler"], function (SvgElement, List, _, Executor, SelectConfiguration, ProductHandler) {

    var maskId = 1;

    return SvgElement.inherit('sprd.view.ConfigurationViewerSvgClass', {

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

            _maskId: ++maskId
        },

        inject: {
            executor: Executor,
            productHandler: ProductHandler
        },

        $classAttributes: ["handleWidth", "product", "printArea", "configuration", "keepAspectRatio", "selected", "verticalStretchable", "horizontalStretchable", "rotatable"],

        ctor: function () {

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

        _commitConfiguration: function (configuration) {

            if (configuration) {
                var size = configuration.$.size,
                    offset = {x: 0, y: 0};

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

            this.$moved = false;

            this.dom(this.$stage.$document).bindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).bindDomEvent("pointerup", this.$upDelegate, true);
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

            this.$moved = true;

            if (this.$action == "resize") {
                if (this.$.keepAspectRatio) {
                    var aspectRatio = this.$originalSize.height / this.$originalSize.width;
                    diffY = aspectRatio * diffX;
                }

                if (this.$resizeType.indexOf("b") > -1 && this.$.verticalStretchable) {
                    size.height = this.$originalSize.height + diffY;
                    offset.y = this.$originalOffset.y;
                }

                if (this.$resizeType.indexOf("r") > -1 && this.$.horizontalStretchable) {
                    size.width = this.$originalSize.width + diffX * 2;
                    offset.x = this.$originalOffset.x - diffX;
                }

                if (this.$resizeType.indexOf("l") > -1 && this.$.horizontalStretchable) {
                    offset.x = this.$originalOffset.x + diffX;
                    size.width = this.$originalSize.width - diffX * 2;
                }

                if (this.$resizeType.indexOf("t") > -1 && this.$.verticalStretchable) {
                    offset.y = this.$originalOffset.y + diffY;
                    size.height = this.$originalSize.height - diffY;
                }

            } else if (this.$action == "move") {
                offset.x += diffX;
                offset.y += diffY;
            }

            size.width = Math.max(10, size.width);
            size.height = Math.max(10, size.height);

            change._size = size;
            change._offset = offset;


            // TODO: execute position change command
            this.set(change, {force: true});
        },

        _render_offset: function (offset) {
            if (offset) {
                this.translate(offset.x, offset.y);
            }
        },

        half: function (value) {
            return value * 0.5;
        },

        and: function (a, b) {
            return a && b;
        },

        handlePointerUp: function (event) {
            if (this.$moved) {
                event.preventDefault();
//                event.stopPropagation();
                // TODO: create command
            }
            this.$originalSize = null;
            this.$originalOffset = null;

            this.dom(this.$stage.$document).unbindDomEvent("pointermove", this.$moveDelegate, false);
            this.dom(this.$stage.$document).unbindDomEvent("pointerup", this.$upDelegate, true);
        },
        _handleClick: function (e) {
//            this.$renderer.handleClick(e);
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