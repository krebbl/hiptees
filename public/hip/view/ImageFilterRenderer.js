define(["js/core/Component", "js/core/Base", "glfx"], function (Component, Base, fx) {
    var flipMatrix = [1, 0, 0, 0, -1, 0, 0, 0, 1];

    var Worker = Base.inherit({

        ctor: function (context, stage) {
            this.callBase();
            this.context = context;
            this.$stage = stage;
        },

        start: function (imageSrc, filter, callback) {
            if (imageSrc != this.$imageSrc) {
                var image = this.$image = new Image();

                var self = this;

                if (/^http/.test(imageSrc)) {
                    image.crossOrigin = 'anonymous';
                }
                image.onload = function () {
                    try {
                        self.$canvas = self.$canvas || fx.canvas();

                    } catch (e) {
                        alert(e);
                        return;
                    }
                    // convert the image to a texture
                    self.$texture = self.$canvas.texture(image);

                    self._updateFilter(filter, callback);
                };
                this.$imageSrc = imageSrc;
                image.src = imageSrc;
            } else {
                this._updateFilter(filter, callback);
            }
        },
        _updateFilter: function (filter, callback) {
            var canvas = this.$canvas;
            if (canvas) {
                canvas.draw(this.$texture, this.$image.width, this.$image.height);

                if (this.$stage.$browser.isIOS) {
                    canvas.matrix(flipMatrix);
                }

                if (filter) {
                    canvas.saturation((filter.$.saturation < 0 ? filter.$.saturation : filter.$.saturation * 0.8));
                    canvas.brightnessContrast(filter.$.brightness / 100 * 0.5, filter.$.contrast / 100 * 0.6);
                    if (filter.$.blur > 0) {
                        canvas.triangleBlur(filter.$.blur / 2);
                    }

                    var a = filter.getTintRGB();
                    if (a) {
                        canvas.colorize(a.color.r, a.color.g, a.color.b, a.$l / 100);
                    }
                }

                canvas.update();

                try {
                    callback && callback(null, canvas.toDataURL());
                } catch (e) {
                    console.log(e);
                }

                this.context.notifyWorkerFinished(this);
            }
        }
    });

    return Component.inherit({
        defaults: {
            maxWorkers: 4
        },

        filterImage: function (imageSrc, filter, callback) {
            var worker = this.getWorker();
            if (worker && imageSrc) {
                worker.start(imageSrc, filter, callback);
            } else {
                this.$requests = this.$requests || [];
                this.$requests.push([imageSrc, filter, callback]);
            }

        },


        getWorker: function () {
            if (!this.$workerCache) {
                this.$workerCache = [];
                for (var i = 0; i < this.$.maxWorkers; i++) {
                    var worker = new Worker(this, this.$stage);
                    this.$workerCache.push(worker);
                }
            }

            return this.$workerCache.pop();
        },

        notifyWorkerFinished: function (worker) {
            this.$workerCache.push(worker);
            if (this.$requests && this.$requests.length > 0) {
                this.filterImage.apply(this, this.$requests.pop());
            }
        }

    })
});