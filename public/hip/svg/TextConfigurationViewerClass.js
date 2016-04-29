define(['xaml!hip/svg/ConfigurationViewer', 'text/entity/TextRange', 'hip/action/TextFlowActions'], function (ConfigurationViewerSvg, TextRange, TextFlowActions) {
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
            textFlowActions: TextFlowActions
        },

        ctor: function () {
            this.callBase();
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