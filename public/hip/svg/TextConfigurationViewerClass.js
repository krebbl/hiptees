define(['xaml!hip/svg/ConfigurationViewer', 'xaml!hip/svg/TextEditor', 'text/entity/TextRange', 'hip/action/TextFlowActions'], function (ConfigurationViewerSvg, SvgTextEditor, TextRange, TextFlowActions) {
    return ConfigurationViewerSvg.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            _keepHeight: true,
            textRenderer: null,
            verticalStretchable: false,
            componentClass: "text-configuration-viewer needsclick",
            maxWidth: "{configuration.size.width}",
            activeTextConfiguration: "{productStore.activeTextConfiguration}"
        },

        $classAttributes: ["textRenderer"],

        inject: {
            svgTextEditor: SvgTextEditor,
            textFlowActions: TextFlowActions
        },

        ctor: function () {
            this.callBase();

            if (this.$stage.$browser.isIOS) {
                this.bind('svgTextEditor', 'on:blur', function (e) {
                    if(this.$.configuration.$.textFlow === this.$.svgTextEditor.$.textFlow) {
                        this.$.productActions.editTextConfiguration({
                            configuration: null
                        });
                    }
                }, this);
            }
        },

        _preventDefault: function (e) {
            e.preventDefault();

        },

        _renderMaxWidth: function () {
            // do nothing
        },

        handlePointerDown: function () {
            this.callBase();

            if (this.$handleUsed) {
                this._disableEditing();
            }

            if (this.$action === "resize" || (event.touches && event.touches.length > 1)) {
                var configuration = this.$.configuration;
                var range = new TextRange({anchorIndex: 0, activeIndex: configuration.$.textFlow.textLength()});
                var paragraphStyle = range.getCommonParagraphStyle(configuration.$.textFlow);

                this.$originalFontSize = paragraphStyle.$.fontSize;
            }
        },

        handlePointerMove: function (event) {

            if (this.$action === "resize" || (event.touches && event.touches.length > 1)) {
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

                this.$.textFlowActions.changeStyle({
                    textFlow: this.$.configuration.$.textFlow,
                    paragraphStyle: {
                        fontSize: Math.round(nFontSize)
                    }
                });
            } else {
                this.callBase();
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

        },

        getEditorPosition: function () {
            var rect = this.getBoundRectInPx();
            return {
                left: Math.ceil(rect.left + window.scrollX),
                top: Math.floor(rect.top + window.scrollY),
                width: Math.ceil(rect.width + 20) + "px",
                height: Math.ceil(rect.height)
            }
        }

        ,

        _enableEditing: function () {
            var rect = this.getBoundRectInPx();
            var root = this.getSvgRoot();
            var svgTextEditor = this.$.svgTextEditor;

            var textFlow = this.$.configuration.$.textFlow;

            svgTextEditor.set({
//                    visible: true,
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
            } else {
                svgTextEditor.set({
                    visible: true
                });
            }
            this.$.textRenderer.set('visible', false);
            this.$editing = true;
            this.addClass("editing");

            svgTextEditor.focus();
        }
        ,


        handlePointerUp: function () {
            if (this.$.selected && !this.$moved && !this.$resized && !this.$handleUsed && !this.$fontSizeChanged) {
                this.$.productActions.editTextConfiguration({
                    configuration: this.$.configuration
                });
            }

            this.$fontSizeChanged = false;

            this.callBase();
        }


    });


})
;