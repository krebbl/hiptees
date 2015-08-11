define(["hip/entity/Configuration", "js/core/List"], function (Configuration) {
    return Configuration.inherit('hip.entity.ShapeConfiguration', {
        defaults: {
            type: "rectangle",
            fill: "#ffffff",
            fillOpacity: 1,
            stroke: "#ff0000",
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