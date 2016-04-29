define(['xaml!hip/svg/ConfigurationViewer', 'xaml!hip/view/SimpleTextEditor', 'text/entity/TextRange', 'hip/action/TextFlowActions'], function (ConfigurationViewerSvg, SimpleTextEditor, TextRange, TextFlowActions) {
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
            textEditor: SimpleTextEditor,
            textFlowActions: TextFlowActions
        },

        ctor: function () {
            this.callBase();

            this.bind('textEditor', 'on:cancel', function (e) {
                this.$.productActions.editTextConfiguration();
            }, this);


            this.bind('textEditor', 'on:save', function (e) {
                if (this.$.textEditor.$.textFlow === this.$.configuration.$.textFlow) {
                    this.$.productActions.setText({configuration: this.$.configuration, text: e.$.text});
                    this.$.productActions.editTextConfiguration();
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
            this.$wasSelected = this.$.selected;

            this.callBase();

            if (this.$handleUsed) {
                this.$.productActions.editTextConfiguration({
                    configuration: null
                });
            }

            if (this.$action === "resize") {
                var configuration = this.$.configuration;
                var range = new TextRange({anchorIndex: 0, activeIndex: configuration.$.textFlow.textLength()});
                var paragraphStyle = range.getCommonParagraphStyle(configuration.$.textFlow);

                this.$originalFontSize = paragraphStyle.$.fontSize;
            }
        },

        handlePointerMove: function (event) {

            if (this.$action === "resize" && this.$originalSize) {
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
                this.$lastFontSize = Math.max(20, Math.round(nFontSize));


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
                this.$.textEditor.set('selected', false);
            }
            this.$.textRenderer.set('visible', true);
            if (this.isRendered()) {
                this.removeClass("editing");
            }
            this.$editing = false;
            this._updateSnapPoints();

        },

        _enableEditing: function () {
            var rect = this.getBoundRectInPx();
            var root = this.getSvgRoot();
            var textEditor = this.$.textEditor;

            var textFlow = this.$.configuration.$.textFlow;

            textEditor.set({
                //zIndex: 1000,
                //position: "absolute",
                //overflow: "hidden",
                //svgWidth: root.$.width,
                //svgHeight: root.$.height,
                //maxWidth: this.$.maxWidth,
                //viewBox: this.getSvgRoot().$.viewBox,
                textFlow: null,
                selected: true
            }, {force: true});

            textEditor.set('textFlow', textFlow);

            if (!textEditor.isRendered()) {
                this.$stage._renderChild(textEditor, 0);
            }
            this.$editing = true;
            this.addClass("editing");

            textEditor.focus();
        },

        trans: function (scale, length) {
            return (1 - scale) * length * 0.5;
        },

        handlePointerUp: function () {
            if (this.$wasSelected && !this.$moved && !this.$resized && !this.$handleUsed && !this.$fontSizeChanged) {
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