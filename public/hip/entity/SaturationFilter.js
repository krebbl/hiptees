define(["hip/entity/Filter"], function (Filter) {

    return Filter.inherit('hip.entity.SaturationFilter', {
        // TODO: add validation
        defaults: {
            type: 'saturation',
            saturation: 1.0,
            lumR: 0.3086,
            lumG: 0.6094,
            lumB: 0.820
        },
        getColorMatrix: function () {
            var s = this.$.saturation,
                sr = (1.0 - s) * this.$.lumR,
                sg = (1.0 - s) * this.$.lumG,
                sb = (1.0 - s) * this.$.lumB;

            return [
                    sr + s, sr, sr, 0, 0,
                sg, sg + s, sg, 0, 0,
                sb, sb, sb + s, 0, 0,
                0, 0, 0, 1, 0
            ];

//            var ret = [
//                    sr + s, sr , sr , 0,
//                sg, sg + s, sg, 0,
//                sb, sb, sb + s, 0,
//                0, 0, 0, 1.0
//            ];
//            console.log(ret);
//            return ret;
        }
    })

});