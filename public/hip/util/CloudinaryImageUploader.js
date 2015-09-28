define(['js/core/Component', 'rAppid', 'flow', 'hip/util/SHA1', "underscore", "xaml!hip/data/HipDataSource", "hip/model/CloudinaryFormData"], function (Component, rAppid, flow, SHA1, _, HipDataSource, CloudinaryFormData) {

    return Component.inherit({

        defaults: {
            formDataUrl: "/api/v1/cloudinaryFormData",
            baseUrl: "https://api.cloudinary.com/v1_1/",
            cloudName: "drbxi29nk",
            name: "cloudinary",
            sessionToken: null
        },

        inject: {
            api: HipDataSource
        },

        uploadFile: function (id, file, options, callback) {
            var self = this;

            options = options || {};

            options.upload_preset = "fatxk4kd";
            options.public_id = id;
            options.folder = "images";

            flow()
                .seq('signatureOptions', function (cb) {
                    self._requestFormData(options, cb);
                })
                .seq('uploadedImage', function (cb) {
                    _.extend(options, this.vars.signatureOptions.$);
                    self._uploadFile(id, file, options, cb);
                })
                .exec(function (err) {
                    callback && callback(err);
                });
        },

        _requestFormData: function (options, callback) {
            options = options || {};
            var formData = this.$.api.createEntity(CloudinaryFormData);

            formData.set(options);
            formData.save(null, function(err, result){
                callback && callback(err, result);
            });
        },

        _uploadFile: function (id, file, options, callback) {
            var formData = new FormData();

            formData.append('file', file);
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    formData.append(key, options[key]);
                }
            }

            var url = this.$.baseUrl + "/" + this.$.cloudName + "/image/upload";

            this.makeAjaxCall(url, {
                type: "POST",
                contentType: false,
                data: formData,
                queryParameter: {}

            }, function (err, xhr) {
                callback && callback(xhr.status === 200 ? null : xhr);
            })

        },

        _createSignatureParameter: function (url, method) {
            var secret = this.$.secret;
            var time = Date.now();

            var data = method + " " + url + " " + time + " " + secret;

            return {
                sig: SHA1(data),
                time: time,
                apiKey: this.$.apiKey
            };
        },

        makeAjaxCall: function (url, options, callback) {
            if (window.cordovaHTTP) {

                return null;
            } else {
                return rAppid.ajax(url, options, callback);
            }
        }


    });

});