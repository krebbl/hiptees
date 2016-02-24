define(['xaml!hip/svg/ConfigurationViewer', 'xaml!hip/svg/TextEditor', 'text/entity/TextRange'], function (ConfigurationViewerSvg, SvgTextEditor, TextRange) {
    return ConfigurationViewerSvg.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            textRenderer: null,
            verticalStretchable: false,
            componentClass: "text-configuration-viewer needsclick",
            maxWidth: "{configuration.size.width}",
            activeTextConfiguration: "{productStore.activeTextConfiguration}"
        },

        $classAttributes: ["textRenderer"],

        inject: {
            svgTextEditor: SvgTextEditor
        },

        ctor: function () {
            this.callBase();

            if (this.$stage.$browser.isIOS) {
                this.bind('svgTextEditor', 'on:blur', function () {
                    this.$.productActions.editTextConfiguration({
                        configuration: null
                    });
                }, this);
            }
        },

        _commitSelected: function (selected) {
            if (!selected && this.$.activeTextConfiguration === this.$.configuration) {
                this.$.productActions.editTextConfiguration({
                    configuration: null
                });
            }
        },

        _preventDefault: function (e) {
            e.preventDefault();

        },

        _renderMaxWidth: function () {
            // do nothing
        },

        handlePointerMove: function (e) {
            this.callBase();

            if (this.$resized) {
                this.set('maxWidth', this.get('_size.width'));
            }

        },

        handleDocumentClick: function (e) {
            if (this.$editing == true) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.callBase();
        },

        _handleSizeChange: function (e) {
            if (this.$originalSize) {
                this.$originalSize = {
                    width: this.$originalSize.width,
                    height: e.$.height
                };
            }

            var size = {},
                anchor = this.$._anchor;

            var width = this.get('_size.width');
            size.height = e.$.height;
            if (this.$.maxWidth == null) {
                size.width = e.$.width;

                if (e.$.textAlign == "center") {
                    anchor.x = 0.5;
                } else if (e.$.textAlign == "right") {
                    anchor.x = 1;
                }
            } else {
                size.width = this.$._size.width;
            }

            this.set({
                _anchor: anchor,
                _size: size
            });

            if (this.$.svgTextEditor.$.textFlow == this.$.configuration.$.textFlow) {
                var rect = this.getBoundRectInPx();
                this.$.svgTextEditor.set({left: rect.left + window.scrollX, width: rect.width, height: rect.height});
            }
        },

        anchor: function () {
            return {
                x: 0.5,
                y: 0
            };
        },
        _commitActiveTextConfiguration: function (configuration) {
            if (configuration === this.$.configuration) {
                this._enableEditing();
            } else {
                this._disableEditing();
            }
        },

        _disableEditing: function () {
            if (this.$.svgTextEditor.$.textFlow == this.$.configuration.$.textFlow) {
                this.$.svgTextEditor.set('visible', false);
                this.$.textRenderer.set('visible', true);
                if (this.isRendered()) {
                    this.removeClass("editing");
                }

                var textFlow = this.$.configuration.$.textFlow;

                if (textFlow.$.selection) {
                    var totalLength = textFlow.textLength() - 1;
                    textFlow.$.selection.set({
                        anchorIndex: totalLength,
                        activeIndex: totalLength
                    });
                }
                this.$editing = false;
                this._updateSnapPoints();
            }
        },

        _enableEditing: function () {
            var rect = this.getBoundRectInPx();
            var root = this.getSvgRoot();
            var svgTextEditor = this.$.svgTextEditor;

            var textFlow = this.$.configuration.$.textFlow;

            if (!textFlow.$.selection) {
                var totalLength = textFlow.textLength() - 1;
                textFlow.set('selection', TextRange.createTextRange(totalLength, totalLength));
            }

            svgTextEditor.set({
//                    visible: true,
                zIndex: 1000,
                position: "absolute",
                left: Math.ceil(rect.left + window.scrollX),
                top: Math.floor(rect.top + window.scrollY),
                width: Math.ceil(rect.width) + "px",
                height: Math.ceil(rect.height),
                overflow: "hidden",
                svgWidth: root.$.width,
                svgHeight: root.$.height,
                maxWidth: this.$.maxWidth,
                viewBox: this.getSvgRoot().$.viewBox,
                textFlow: textFlow
            }, {force: true});
            // TODO: bind on blur event to remove editing class
            if (!svgTextEditor.isRendered()) {
                this.$stage._renderChild(svgTextEditor, 0);
            } else {
                svgTextEditor.set({
                    visible: true,
                    width: rect.width + "px"
                });
            }
            this.$.textRenderer.set('visible', false);
            this.$editing = true;
            this.addClass("editing");

            svgTextEditor.focus();
        },


        handlePointerUp: function () {
            if (this.$.selected && !this.$moved && !this.$resized) {
                this.$.productActions.editTextConfiguration({
                    configuration: this.$.configuration
                });
                //this._enableEditing();
            }

            this.callBase();
        }


    });


});