define(['xaml!hip/svg/ConfigurationViewer', 'hip/view/ImageFilterRenderer'], function (ConfigurationViewer, ImageFilterRenderer) {
    var filterId = 1,
        gradId = 1;

    var flipMatrix = [1, 0, 0, 0, -1, 0, 0, 0, 1];

    return ConfigurationViewer.inherit('sprd.svg.ConfigurationViewerClass', {

        defaults: {
            verticalStretchable: true,
            horizontalStretchable: true,
            keepAspectRatio: true,
            _filterId: null,
            _gradId: null
        },

        inject: {
            imageFilter: ImageFilterRenderer
        },

        ctor: function (attr) {
            attr._filterId = "filter" + (++filterId);
            attr._gradId = "grad" + (++gradId);
            this.callBase();

            this.bind('configuration.filter', 'change', this.updateFilter, this);
        },

        negative: function (v) {
            return v * -1;
        },

        _renderConfiguration: function (configuration) {
            if (configuration) {
                this.updateFilter();
            }
        },

        hasWebGl: function () {
            return this.$stage.$hasWebGl;
        },

        updateFilter: function () {
            var self = this,
                configuration = this.$.configuration;
            if (this.$.renderedImage && this.hasWebGl()) {
                this.$.imageFilter.filterImage(configuration.get('design.resources.SCREEN'), configuration.get('filter'), function (err, data) {
                    if (!err) {
                        self.$.renderedImage.$el.setAttribute('href', data);
                    }
                });
            }
        },

        _imageLoaded: function () {
        },

        filterUrl: function () {
            return this.get('configuration.filter') ? "url(#" + this.$._filterId + ")" : "none";
        }.onChange('configuration.filter')

    });


});