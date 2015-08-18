define(['xaml!hip/svg/ConfigurationViewer', 'xaml!hip/svg/TextEditor'], function (ConfigurationViewerSvg, SvgTextEditor) {
    return ConfigurationViewerSvg.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            textRenderer: null,
            verticalStretchable: false,
            componentClass: "text-configuration-viewer needsclick",
            maxWidth: "{configuration.size.width}"
        },

        $classAttributes: ["textRenderer"],

        inject: {
            svgTextEditor: SvgTextEditor
        },

        ctor: function () {
            this.callBase();

            if (this.$stage.$browser.isIOS) {
                this.bind('svgTextEditor', 'on:blur', this._disableEditing, this);
            }
        },

        _commitSelected: function (selected) {
            if (!selected) {
                this._disableEditing();
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

        _disableEditing: function () {
            if (this.$.svgTextEditor.$.textFlow == this.$.configuration.$.textFlow) {
                this.$.svgTextEditor.set('visible', false);
                this.$.textRenderer.set('visible', true);
                this.removeClass("editing");

                this._updateSnapPoints();
            }
        },


        handlePointerUp: function () {
            if (this.$.selected && !this.$moved && !this.$resized) {

                var rect = this.getBoundRectInPx();
                var root = this.getSvgRoot();

                this.$.svgTextEditor.set({
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
                    textFlow: this.$.configuration.$.textFlow
                }, {force: true});
                // TODO: bind on blur event to remove editing class
                if (!this.$.svgTextEditor.isRendered()) {
                    this.$stage._renderChild(this.$.svgTextEditor, 0);
                } else {
                    this.$.svgTextEditor.set({
                        visible: true,
                        width: rect.width + "px"
                    });
                }
                this.$.textRenderer.set('visible', false);
                this.$.svgTextEditor.focus();
                this.addClass("editing");
            }

            this.callBase();
        }



    });


});