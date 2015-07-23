define(["hip/entity/Configuration", "js/core/List"], function (Configuration, List) {
    return Configuration.inherit('hip.entity.RectangleConfiguration', {
        defaults: {
            fill: "white",
            stroke: "none",
            strokeWidth: 0

        }
    })
});