define(['xaml!hip/svg/ConfigurationViewer', 'xaml!hip/svg/TextEditor', 'text/entity/TextRange', 'hip/action/TextFlowActions'], function (ConfigurationViewerSvg, SvgTextEditor, TextRange, TextFlowActions) {
    return ConfigurationViewerSvg.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            _keepHeight: true,
            _textScale: 1.2,
            textRenderer: null,
            verticalStretchable: false,
            componentClass: "text-configuration-viewer needsclick",
            maxWidth: "{configuration.size.width}",
            activeTextConfiguration: "{productStore.activeTextConfiguration}"
        },

        $classAttributes: ["textRenderer", "activeTextConfiguration"],

        inject: {
            svgTextEditor: SvgTextEditor,
            textFlowActions: TextFlowActions
        },

        ctor: function () {
            this.callBase();

            this.bind('svgTextEditor', 'on:blur', function (e) {
                if (this.$.configuration.$.textFlow === this.$.svgTextEditor.$.textFlow) {
                    this.$.productActions.editTextConfiguration({
                        configuration: null
                    });
                }
            }, this);

        },

        _preventDefault: function (e) {
            e.preventDefault();

        },
        // important: DON'T REMOVE THIS!
        _renderMaxWidth: function () {
            // do nothing
        },

        handlePointerDown: function () {
            this.callBase();

            if (this.$handleUsed) {
                this.$.productActions.editTextConfiguration({
                    configuration: null
                });
            }

            if (this.$action === "resize" || (event.touches && event.touches.length > 1)) {
                var configuration = this.$.configuration;
                var range = new TextRange({anchorIndex: 0, activeIndex: configuration.$.textFlow.textLength()});
                var paragraphStyle = range.getCommonParagraphStyle(configuration.$.textFlow);

                this.$originalFontSize = paragraphStyle.$.fontSize;
            }
        },

        handlePointerMove: function (event) {

            if (this.$action === "resize") {
                event.preventDefault();
                this.set('_resizing', true);
                this.$resized = false;
                this.$fontSizeChanged = true;

                var rootVector = [this.$originalSize.width, this.$originalSize.height],
                    scaleVector = this._createDiffVector(event);


                // calculate the length of the projected vector
                var rootLength = this.vectorLength(rootVector);
                var s = this.multiplyVectors(scaleVector, rootVector) / rootLength,
                    lf = s / rootLength;


                // multiply with the root vector
                var diffY = Math.abs(rootVector[0]) * lf * this.$originalSize.height / this.$originalSize.width;

                var newHeight = this.$originalSize.height + diffY * 2;
                var nFontSize = this.$originalFontSize * (newHeight / this.$originalSize.height);
                this.$lastFontSize = Math.round(nFontSize);
                this.$.textFlowActions.changeStyle({
                    textFlow: this.$.configuration.$.textFlow,
                    preview: true,
                    paragraphStyle: {
                        fontSize: this.$lastFontSize
                    }
                });
            } else {
                this.callBase();
            }

        },

        handleDocumentClick: function (e) {
            if (this.$editing == true || this.$fontSizeChanged) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.callBase();
        },

        _handleSizeChange: function (e) {
            var size = {};

            size.height = e.$.height;
            if (this.$.maxWidth == null) {
                size.width = e.$.width;
            } else {
                size.width = this.$._size.width;
            }

            this.set({
                _size: size
            });

            var svgTextEditor = this.$.svgTextEditor;
            var configuration = this.$.configuration;
            if (svgTextEditor.$.textFlow === configuration.$.textFlow) {
                svgTextEditor.set(this.getEditorPosition());
            }
        },
        _commitActiveTextConfiguration: function (configuration) {
            if (configuration === this.$.configuration) {
                this._enableEditing();
            } else {
                this._disableEditing();
            }
        },

        _disableEditing: function () {
            if (!this.$.activeTextConfiguration) {
                this.$.svgTextEditor.set('visible', false);
            }
            this.$.textRenderer.set('visible', true);
            if (this.isRendered()) {
                this.removeClass("editing");
            }
            this.$editing = false;
            this._updateSnapPoints();

        },

        getEditorPosition: function () {
            var rect = this.getBoundRectInPx();
            return {
                left: Math.ceil(rect.left + window.scrollX),
                top: Math.floor(rect.top + window.scrollY),
                width: Math.ceil(rect.width + 20) + "px",
                height: Math.ceil(rect.height) + "px"
            }
        },

        _enableEditing: function () {
            var rect = this.getBoundRectInPx();
            var root = this.getSvgRoot();
            var svgTextEditor = this.$.svgTextEditor;

            var textFlow = this.$.configuration.$.textFlow;

            svgTextEditor.set({
                zIndex: 1000,
                position: "absolute",
                overflow: "hidden",
                svgWidth: root.$.width,
                svgHeight: root.$.height,
                maxWidth: this.$.maxWidth,
                viewBox: this.getSvgRoot().$.viewBox,
                textFlow: null,
                visible: true
            }, {force: true});

            svgTextEditor.set(this.getEditorPosition());
            svgTextEditor.set('textFlow', textFlow);

            if (!svgTextEditor.isRendered()) {
                this.$stage._renderChild(svgTextEditor, 0);
            }
            this.$.textRenderer.set('visible', false);
            this.$editing = true;
            this.addClass("editing");

            svgTextEditor.focus();
        },

        trans: function (scale, length) {
            return (1 - scale) * length * 0.5;
        },

        handlePointerUp: function () {
            if (this.$.selected && !this.$moved && !this.$resized && !this.$handleUsed && !this.$fontSizeChanged) {
                this.$.productActions.editTextConfiguration({
                    configuration: this.$.configuration
                });
            }

            if (this.$fontSizeChanged) {
                this.$.textFlowActions.changeStyle({
                    textFlow: this.$.configuration.$.textFlow,
                    paragraphStyle: {
                        fontSize: this.$lastFontSize
                    }
                });
            }

            this.callBase();

            var self = this;
            setTimeout(function () {
                self.$fontSizeChanged = false;
            }, 10);
        }


    });


})
;