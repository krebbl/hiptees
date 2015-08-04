define(["js/data/Model", "js/core/List", "hip/entity/Configuration", "hip/model/ProductType","hip/entity/Appearance"], function (Model, List, Configuration, ProductType, Appearance) {
    return Model.inherit('hip.model.Product', {
        defaults: {
            name: '',
            configurations: List
        },
        schema: {
            name: {
                typ: String,
                required: false
            },
            productType: ProductType,
            appearance: {
                type: Appearance,
                isReference: true
            },
            configurations: [Configuration]
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