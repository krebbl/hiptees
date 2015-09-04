define(["js/data/Model", "js/core/List", "hip/entity/Configuration", "hip/model/ProductType", "hip/entity/Appearance", "js/data/AttributeTypeResolver", "hip/entity/TextConfiguration", "hip/entity/DesignConfiguration", "hip/entity/RectangleConfiguration", "hip/entity/CircleConfiguration"], function (Model, List, Configuration, ProductType, Appearance, AttributeTypeResolver, TextConfiguration, DesignConfiguration, RectangleConfiguration, CircleConfiguration) {
    var typeResolver = new AttributeTypeResolver({
        mapping: {
            text: TextConfiguration,
            design: DesignConfiguration,
            rectangle: RectangleConfiguration,
            circle: CircleConfiguration
        }
    });

    return Model.inherit('hip.model.Product', {
        defaults: {
            name: '',
            configurations: List,
            tags: ["preset"]
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
            configurations: [typeResolver],
            tags: {
                type: Array,
                required: false
            }
        },

        parse: function () {
            var ret = this.callBase();

            if (ret.productType && ret.appearance && ret.productType.$.appearances) {
                var pa = ret.productType.$.appearances.find(function (app) {
                    return app.$.id == ret.appearance.$.id;
                });

                ret.appearance = pa;
            }

            return ret;
        },

        getIndexOfConfiguration: function (configuration) {
            if (this.$.configurations) {
                return this.$.configurations.indexOf(configuration);
            }
            return -1;
        },
        numConfigurations: function () {
            return this.$.configurations.size();
        }
    })
});