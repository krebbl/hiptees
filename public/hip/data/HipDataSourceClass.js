define(["js/data/RestDataSource", "hip/data/QueryComposer"], function (RestDataSource, QueryComposer) {
    return RestDataSource.inherit({
        defaults: {
            mode: null,
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
            var ret = this.callBase() || {};

            if (this.$.sessionToken) {
                ret["session-token"] = this.$.sessionToken;
            }

            if (this.$.imageRenderSecret) {
                ret["image-render-secret"] = this.$.imageRenderSecret;
            }

            return ret;
        },

        getQueryParameters: function () {
            var ret = this.callBase();

            if (this.$.mode) {
                ret.mode = this.$.mode;
            }

            return ret;
        },

        _buildUriForResource: function (resource, endPoint) {
            return this.callBase(resource, this.$.endPoint);
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