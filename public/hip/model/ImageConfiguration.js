define(["hip/model/Configuration"], function (Configuration) {
    return Configuration.inherit('hip.model.ImageConfiguration', {
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