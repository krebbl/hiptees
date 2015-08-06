define(["js/data/RestDataSource"], function (RestDataSource) {
    return RestDataSource.inherit({
        defaults: {

        },
        extractListMetaData: function (collectionPage, payload, options, xhr) {
            return {
                count: payload.length
            }
        },

//        _handleXHRError: function (request, cb) {
//            if (request.xhr.status === 200 && request.model.isNew()) {
//                this.handleCreationSuccess(request, request.xhr, cb);
//            } else {
//                this.callBase();
//            }
//        },

        extractIdFromLocation: function (location) {
            return location.split("/").pop();
        },


        extractListData: function (collectionPage, payload, options, xhr) {
            return payload;
        }
    })
})
;