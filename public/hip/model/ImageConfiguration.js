define(["hip/model/Configuration", "hip/view/ImageConfigurationRenderer"], function (Configuration, ImageConfigurationRenderer) {
    return Configuration.inherit('hip.model.ImageConfiguration', {
        renderFactory: ImageConfigurationRenderer,
        defaults: {
            image: null,
            filters: null
        },

        getFilter: function (type) {
            var filters = this.$.filters || [];
            for (var i = 0; i < filters.length; i++) {
                var filter = filters[i];
                if (filter.$.type == type) {
                    return filter;
                }
            }
            return null;
        }.onChange('filters')

    })
});