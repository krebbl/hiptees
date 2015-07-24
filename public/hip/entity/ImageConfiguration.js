define(["hip/entity/Configuration", "hip/entity/Filter"], function (Configuration, Filter) {
    return Configuration.inherit('hip.entity.ImageConfiguration', {
        defaults: {
            design: null,
            filter: Filter
        },

        _commitDesign: function (design) {
            if (design) {
                var aspectRatio = design.getAspectRatio();

                if (!isNaN(aspectRatio)) {
                    var s = this.$.size;
                    if (s) {
                        s = {
                            width: s.width,
                            height: s.width * aspectRatio
                        };
                        this.set('size', s);
                    }
                }
            }
        }

    })
});