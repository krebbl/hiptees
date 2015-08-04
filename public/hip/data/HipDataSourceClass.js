define(["js/data/RestDataSource"], function (RestDataSource) {
    return RestDataSource.inherit({
        defaults: {

        },
        extractListMetaData: function (collectionPage, payload, options, xhr) {
            return {
                count: payload.length
            }
        },

        extractListData: function (collectionPage, payload, options, xhr) {
            return payload;
        }
    })
});