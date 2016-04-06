define(["hip/entity/ShapeConfiguration", "js/core/List"], function (ShapeConfiguration) {
    return ShapeConfiguration.inherit('hip.entity.PathConfiguration', {
        defaults: {
            type: "path",
            path: "",
            pathDimensions: {
                width: 646,
                height: 610
            }
        },
        schema: {
            path: String,
            pathDimensions: Object
        },
        _commitSize: function (size) {
            var pathDimensions = this.$.pathDimensions;
            if (size && pathDimensions) {
                size.height = pathDimensions.height / pathDimensions.width * size.width;
            }
        },
        _strokeWidth: function () {
            if (this.$.size && this.$.pathDimensions && this.$.strokeWidth) {

                return this.$.pathDimensions.width / this.$.size.width * this.$.strokeWidth;

            }
            return 0;
        }.onChange("strokeWidth")
    })
});