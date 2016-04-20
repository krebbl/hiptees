define(["hip/entity/Configuration", "js/type/Color"], function (Configuration, Color) {
    return Configuration.inherit('hip.entity.ShapeConfiguration', {
        defaults: {
            type: "shape",
            fill: "#000000",
            fillOpacity: 1,
            strokeOpacity: 1,
            stroke: "#000000",
            strokeWidth: 0
        },
        schema: {
            type: String,
            fill: String,
            stroke: String,
            strokeWidth: Number,
            fillOpacity: Number,
            strokeOpacity: Number
        },
        _strokeWidth: function () {
            return this.$.strokeWidth;
        }.onChange("strokeWidth")
    })
});