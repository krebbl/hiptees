define(["js/data/Model", "hip/entity/PrintArea", "hip/entity/Appearance", "hip/entity/Size"], function (Model, PrintArea, Appearance, Size) {
    return Model.inherit('hip.model.ProductType', {
        defaults: {},
        schema: {
            size: Size,
            sizes: [Size],
            printArea: PrintArea,
            appearances: [Appearance],
            resources: {
                type: Object,
                generated: true
            }
        }
    })
});