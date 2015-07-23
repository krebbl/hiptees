define(["hip/entity/Configuration"], function (Configuration) {
    return Configuration.inherit('hip.entity.ImageConfiguration', {
        defaults: {
            design: null,
            filters: null
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