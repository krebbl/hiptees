define(['xaml!hip/svg/ConfigurationViewer'], function (ConfigurationViewer) {
    var filterId = 1;

    var flipMatrix = [1, 0, 0, 0, -1, 0, 0, 0, 1];

    return ConfigurationViewer.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            verticalStretchable: true,
            horizontalStretchable: true,
            keepAspectRatio: true,
            _filterId: null
        },

        ctor: function (attr) {
            attr._filterId = "filter" + (++filterId);
            this.callBase();

            this.bind('configuration.filter', 'change', this.updateFilter, this);
        },

        negative: function (v) {
            return v * -1;
        },

        _renderConfiguration: function (configuration) {
            if (configuration) {
                var image = this.$image = new Image();

                var self = this;
//                document.body.appendChild(image);
                image.onload = function () {
                    if (!self.$canvas) {
                        try {
                            var canvas = self.$canvas = fx.canvas();
                        } catch (e) {
                            alert(e);
                            return;
                        }

                        // convert the image to a texture
                        self.$texture = canvas.texture(image);

                        self.updateFilter();

                    }
                };


                image.src = configuration.get('design.image.url');

            }
        },

        updateFilter: function () {
            var canvas = this.$canvas;
            if (canvas) {
                canvas.draw(this.$texture, this.$image.width, this.$image.height);

                if (this.$stage.$browser.isIOS) {
                    canvas.matrix(flipMatrix);
                }

                var filter = this.get('configuration.filter');
                if (filter) {
                    canvas.saturation((filter.$.saturation < 0 ? filter.$.saturation : filter.$.saturation * 0.8));
                    canvas.brightnessContrast(filter.$.brightness / 100 * 0.5, filter.$.contrast / 100 * 0.6);
                    if (filter.$.blur > 0) {
                        canvas.blur(filter.$.blur / 2);
                    } else {

                    }

                    var a = filter.getTintRGB();
                    if(a){
                        canvas.colorize(a.color.r, a.color.g, a.color.b, a.$l / 100);
                    }
                }

                canvas.update();

                this.$.renderedImage.$el.setAttribute('href', canvas.toDataURL());
            }


        },

        _imageLoaded: function () {
        },

        filterUrl: function () {
            return this.get('configuration.filter') ? "url(#" + this.$._filterId + ")" : "none";
        }.onChange('configuration.filter')

    });


});