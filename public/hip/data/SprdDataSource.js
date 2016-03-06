define(["js/core/Component", "hip/util/SHA1", "rAppid"], function (Component, SHA1, rAppid) {


    function signature(method, url, secret, time) {
        var data = method + " " + url + " " + time + " " + secret;
        return SHA1(data);
    }

    function createQueryParameter(method, url, apiKey, secret, sessionId) {
        var time = new Date().getTime();

        return {
            mediaType: "json",
            sig: signature(method, url, secret, time),
            time: time,
            method: method,
            apiKey: apiKey,
            sessionId: sessionId
        };
    }

    return Component.inherit({
        defaults: {
            endPoint: "",
            gateway: "",
            apiKey: "",
            secret: ""
        },

        requestResource: function (resource, method, data, sessionId, callback) {

            var endpointUrl = this.$.endPoint + resource;
            var requestUrl = (this.$.gateway || this.$.endPoint) + resource;
            var options = {
                data: JSON.stringify(data),
                type: method,
                contentType: "application/json",
                queryParameter: createQueryParameter(method, endpointUrl, this.$.apiKey, this.$.secret, sessionId)
            };

            rAppid.ajax(requestUrl, options, callback)
        },

        loadCombinedBasket: function (id, callback) {
            this.requestResource("/combinedBaskets/" + id, "GET", {}, null, function (err, xhr) {
                var data = null;
                if (xhr.status === 200) {
                    data = JSON.parse(xhr.responses.text);
                } else {
                    err = err || xhr.responses.statusText;
                }
                callback && callback(err, data);
            });
        },

        removeBasketItem: function (basketId, basketItemId, callback) {
            this.requestResource("/baskets/" + basketId + "/items/" + basketItemId, "DELETE", {}, null, function (err, xhr) {
                if (xhr.status !== 200) {
                    err = err || xhr.responses.statusText;
                }

                callback && callback(err);
            });
        },

        updateBasketItem: function(basketId, basketItem, callback){
            this.requestResource("/baskets/" + basketId + "/items/" + basketItem.id, "PUT", basketItem, null, function (err, xhr) {
                if (xhr.status !== 200) {
                    err = err || xhr.responses.statusText;
                }

                callback && callback(err);
            });
        },

        addBasketItem: function (basketItem, basketId, callback) {
            this.requestResource("/baskets/" + basketId + "/items", "POST", basketItem, null, function (err, xhr) {
                if (xhr.status !== 201) {
                    err = err || xhr.responses.statusText;
                }

                callback && callback(err);
            })
        }

    });


});