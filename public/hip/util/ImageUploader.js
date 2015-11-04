define(['js/core/Component', 'rAppid', 'flow', 'hip/util/SHA1'], function (Component, rAppid, flow, SHA1) {

    return Component.inherit({

        defaults: {
            apiKey: null,
            secret: null,
            imageServerEndpoint: "http://www.spreadshirt.net/image-server/v1",
            imageServerGateWay: "/image-server/v1",
            apiEndEndpoint: "http://www.spreadshirt.net/api/v1",
            apiGateWay: "/api/v1",
            shopId: "205909"
        },

        createUpload: function () {
            var self = this;
            return {
                onready: function () {
                },
                onprogress: function () {
                },
                start: function (file) {
                    this.file = file;
                    self._startUpload(this);
                }
            };
        },

        _startUpload: function (upload) {
            var self = this,
                file = upload.file;

            flow()
                .seq('design', function (cb) {
                    self._createDesign(file.name, cb);
                })
                .seq('uploadedImage', function (cb) {
                    self._uploadDesignFile(this.vars.design, file, cb);
                })
                .exec(function (err, results) {
                    var resources;

                    if (!err) {
                        var baseUrl = self.$.imageServerEndpoint + "/shops/" + self.$.shopId + "/designs/" + parseInt(results.design.id);
                        resources = {
                            small: baseUrl + "?width=200",
                            screen: baseUrl + "?width=400",
                            print: baseUrl + "?width=600"
                        };
                    }
                    upload.onready(err, resources);
                });
        },

        _createDesign: function (name, callback) {
            var payload = {"name": name, "description": "", "restrictions": {}, "designServiceState": null},
                url = this.$.apiEndEndpoint + "/shops/" + this.$.shopId + "/designs";

            var signature = this._createSignatureParameter(url);

            if (this.$.apiEndEndpoint.indexOf(window.location.hostname) == -1) {
                url = this.$.apiGateWay + "/shops/" + this.$.shopId + "/designs"
            }

            this.makeAjaxCall(url, {
                type: "POST",
                data: JSON.stringify(payload),
                queryParameter: {
                    method: "post",
                    mediaType: "json",
                    locale: "en_EU",
                    sig: signature.sig,
                    time: signature.time,
                    apiKey: signature.apiKey
                }
            }, function (err, xhr) {
                var design;
                if (xhr.status === 201) {
                    design = JSON.parse(xhr.responses.text);
                }
                setTimeout(function () {
                    callback && callback(err, design);
                }, 300);
            });

        },

        _uploadDesignFile: function (design, file, callback) {
            var formData = new FormData();
            formData.append('upload_field', file);
            var url = "";

            if (this.$.imageServerEndpoint.indexOf(window.location.hostname) == -1) {
                url = this.$.imageServerGateWay;
            } else {
                url = this.$.imageServerEndpoint;
            }

            url += "/designs/" + design.id;

            this.makeAjaxCall(url, {
                type: "POST",
                contentType: false,
                data: formData,
                queryParameter: {
                    method: "put",
                    apiKey: this.$.apiKey
                }

            }, function (err, xhr) {
                if (xhr.status !== 200 && xhr.status !== 201) {
                    err = "upload failed";
                }
                callback && callback(err, xhr);
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