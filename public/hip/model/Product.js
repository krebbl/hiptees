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
            state: "draft",
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
            state: {
                type: String,
                required: true
            },
            configurations: [typeResolver],
            tags: {
                type: Array,
                required: false
            }
        },


        hrefField: false,

        parse: function () {
            var ret = this.callBase();

            if(ret.productType){
                ret.appearance = ret.productType.createEntity(Appearance, ret.appearance.$.id);
            }

            return ret;
        },

        compose: function () {
            var ret = this.callBase();

            delete ret.id;

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