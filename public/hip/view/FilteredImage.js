define(["js/ui/View", "hip/view/ImageFilterRenderer"], function (View, ImageFilterRenderer) {
    var imageDataCache = {};

    return View.inherit({
        defaults: {
            tagName: "img",
            src: null,
            filter: null
        },

        inject: {
            imageFilter: ImageFilterRenderer
        },

        _renderSrc: function (src) {
            if (src) {
                this.addClass('filtering');
                if (this.$.filter && this.$.imageFilter) {
                    var self = this;
                    this.$el.crossOrigin = "Anonymous";
                    setTimeout(function () {
                        var filterCode = self.$.filter.serialize();
                        var cacheId = filterCode + "_" + src;
                        if (imageDataCache[cacheId]) {
                            self.$el.src = imageDataCache[cacheId];
                            self.removeClass('filtering');
                        } else {
                            self.$.imageFilter.filterImage(self.$.src, self.$.filter, function (err, data) {
                                self.removeClass('filtering');
                                if (!err) {
                                    imageDataCache[cacheId] = data;
                                    self.$el.src = data;
                                }
                            });
                        }
                    }, 10);


                }
            }
        }
    })
});