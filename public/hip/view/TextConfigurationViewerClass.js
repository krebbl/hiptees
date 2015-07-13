define(['xaml!hip/view/ConfigurationViewerSvg', 'xaml!hip/view/SvgTextEditor'], function (ConfigurationViewerSvg, SvgTextEditor) {
    return ConfigurationViewerSvg.inherit('sprd.view.ConfigurationViewerSvgClass', {

        defaults: {
            textRenderer: null,
            verticalStretchable: false
        },

        inject: {
            svgTextEditor: SvgTextEditor
        },

        _commitSelected: function (selected) {
            if (!selected) {
                if (this.$.svgTextEditor.$.textObject == this.$.configuration) {
                    this.$.svgTextEditor.set('visible', false);
                    this.$.textRenderer.set('visible', true);
                    this.removeClass("editing");
                }
            }
        },

        _preventDefault: function (e) {
            e.preventDefault();

        },

        _handleHeightChange: function (e) {
            if (this.$originalSize) {
                this.$originalSize = {
                    width: this.$originalSize.width,
                    height: e.$.height
                };
            }
            this.set('_size', {
                width: this.$._size.width,
                height: e.$.height
            });

            if (this.$.svgTextEditor.$.textObject == this.$.configuration) {
                this.$.svgTextEditor.set('height', this.getBoundRectInPx().height);
            }

        },

        _handleClick: function () {
            if (this.$.selected && !this.$moved) {

                var rect = this.getBoundRectInPx();
                var root = this.getSvgRoot();
                this.$.svgTextEditor.set({
                    zIndex: 1000,
                    position: "absolute",
                    left: Math.ceil(rect.left + window.scrollX),
                    top: Math.floor(rect.top + window.scrollY),
                    width: rect.width + "px",
                    height: rect.height,
                    overflow: "hidden",
                    svgWidth: root.$.width,
                    svgHeight: root.$.height,
                    maxWidth: this.get('_size.width'),
                    viewBox: this.getSvgRoot().$.viewBox,
                    textObject: this.$.configuration
                },{force: true});
                // TODO: bind on blur event to remove editing class
                if (!this.$.svgTextEditor.isRendered()) {
                    this.$stage._renderChild(this.$.svgTextEditor, 0);
                } else {
                    this.$.svgTextEditor.set('visible', true);
                }
                this.$.textRenderer.set('visible', false);
                this.$.svgTextEditor.focus();
                this.addClass("editing");
            }

            this.callBase();
        }



    });


});