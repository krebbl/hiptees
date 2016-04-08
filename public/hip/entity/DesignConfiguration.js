define(["hip/entity/Configuration", "hip/entity/Filter", "hip/model/Design"], function (Configuration, Filter, Design) {
    return Configuration.inherit('hip.entity.DesignConfiguration', {
        defaults: {
            design: null,
            type: "design",
            filter: Filter
        },

        schema: {
            filter: Filter,
            design: Design
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
        },

        compose: function(){
            var ret = this.callBase();

            if(!this.$.design.$.id) {
                ret.design = this.$context.$dataSource.composeModel(this.$.design);
            }

            return ret;
        }

    })
});