define(["js/data/Model", "js/core/List", "hip/entity/Configuration", "hip/model/ProductType", "hip/entity/Appearance", "js/data/AttributeTypeResolver", "hip/entity/TextConfiguration", "hip/entity/DesignConfiguration"], function (Model, List, Configuration, ProductType, Appearance, AttributeTypeResolver, TextConfiguration, DesignConfiguration) {
    var typeResolver = new AttributeTypeResolver({
        mapping: {
            text: TextConfiguration,
            design: DesignConfiguration
        }
    });

    return Model.inherit('hip.model.Product', {
        defaults: {
            name: '',
            configurations: List
        },
        schema: {
            name: {
                type: String,
                required: false
            },
            productType: ProductType,
            appearance: {
                type: Appearance,
                isReference: true
            },
            configurations: [typeResolver]
        },
        getIndexOfConfiguration: function (configuration) {
            if (this.$.configurations) {
                return this.$.configurations.indexOf(configuration);
            }
            return -1;
        },
        numConfigurations: function () {
            return this.$.configurations.$.size();
        }
    })
});