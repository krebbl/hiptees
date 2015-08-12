define(["hip/entity/Configuration", "js/type/Color"], function (Configuration, Color) {
    return Configuration.inherit('hip.entity.ShapeConfiguration', {
        defaults: {
            type: "rectangle",
            fill: "#000000",
            fillOpacity: 1,
            stroke: "#000000",
            strokeWidth: 6
        },
        schema: {
            type: String,
            fill: String,
            stroke: String,
            strokeWidth: Number
        }
    })
});