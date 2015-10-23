define(["js/data/RestDataSource", "hip/data/QueryComposer"], function (RestDataSource, QueryComposer) {
    return RestDataSource.inherit({
        defaults: {
            determinateContextByGateway: false
        },
        extractListMetaData: function (collectionPage, payload, options, xhr) {
            return {
                count: payload.hasOwnProperty("total") ? payload.total : payload.length
            }
        },

        getQueryComposer: function () {
            return QueryComposer;
        },

        getHeaderParameters: function (method, resource) {
            if (this.$.sessionToken) {
                return {
                    "session-token": this.$.sessionToken
                }
            } else {
                return this.callBase();
            }
        },

        _buildUriForResource: function (resource, endPoint) {
            return this.callBase(resource, this.$.endPoint );
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
            return payload.results || payload;
        }
    })
})
;