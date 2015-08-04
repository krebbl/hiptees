define(["js/data/Model", "hip/entity/PrintArea", "hip/entity/Appearance"], function (Model, PrintArea, Appearance) {
    return Model.inherit('hip.model.ProductType',{
        defaults: {

        },
        schema: {
            size: Object,
            printArea: PrintArea,
            appearances: [Appearance],
            resources: Object
        }
    })
});