define(["js/core/Component", "flow", "exif"], function (Component, flow, EXIF) {
    var OrientationAngle = {
        "1": 0,
        "2": 0,
        "3": 180,
        "4": 180,
        "5": -90,
        "6": 90,
        "7": -90,
        "8": 90
    };

    var TO_RADIAN = Math.PI / 180;

    return Component.inherit({
        defaults: {
        },

        readFile: function (file, callback) {

            var self = this;

            flow()
                .seq("exif", function (cb) {
                    // read exif
                    var reader = new FileReader();

                    reader.onload = function (evt) {
                        cb(null, EXIF.readFromBinaryFile(evt.target.result));
                    };

                    reader.readAsArrayBuffer(file);
                })
                .seq("img", function (cb) {
                    // read file
                    var reader = new FileReader();
                    var image = new Image(),
                        rotatedImage = new Image();

                    var orientation = this.vars.exif.Orientation;

                    rotatedImage.onload = function () {
                        cb && cb(null, rotatedImage);
                    };

                    image.onload = function () {
                        if (orientation > 2) {
                            rotatedImage.src = self.rotateImage(image, orientation);
                        } else {
                            cb && cb(null, image);
                        }
                    };

                    reader.onload = function (evt) {
                        image.src = evt.target.result;
                    };

                    reader.readAsDataURL(file);
                })
                .exec(function (err, results) {
                    callback && callback(err, results.img);
                });


        },

        _getCanvas: function () {
            if (!this.$canvas) {
                this.$canvas = this.$stage.$document.createElement("canvas");
                this.$stage.$document.body.appendChild(this.$canvas);
            }
            return this.$canvas;
        },
        rotateImage: function (image, orientation) {
            var canvas = this._getCanvas(),
                imageWidth = image.width,
                imageHeight = image.height,
                width = imageWidth,
                height = imageHeight;

            if (orientation > 4) {
                width = imageHeight;
                height = imageWidth;
            }

            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");
            ctx.translate(imageWidth * 0.5, imageHeight * 0.5);
            var radian = OrientationAngle[orientation + ""] * TO_RADIAN;
            ctx.rotate(radian);

            ctx.drawImage(image, -0.5 * imageWidth + (imageWidth - width) * 0.5, -0.5 * imageHeight + (height - imageHeight) * 0.5, imageWidth, imageHeight);
            ctx.restore();

            return this.$canvas.toDataURL();

        },

        resizeImage: function (image, maxWidth, maxHeight) {
            var canvas = this._getCanvas();
            var width = image.width;
            var height = image.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }


            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0, width, height);
            ctx.restore();

            return this.$canvas.toDataURL();
        }
    })
});