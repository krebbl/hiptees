define(["js/core/Component"], function (Component) {
    return Component.inherit({
        defaults: {
            imageEndpoint: "",
            cloudinaryEndpoint: ""
        },

        productImage: function (product) {
            return this.$.imageEndpoint + "/products/"
        },

        productType: function (productType, appearance) {

        }
    })
});