define(["hip/entity/ShapeConfiguration", "js/core/List"], function (ShapeConfiguration) {
    return ShapeConfiguration.inherit('hip.entity.RectangleConfiguration', {
        defaults: {
            type: "circle",
            keepAspectRatio: true
        }
    })
});