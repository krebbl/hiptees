define(["hip/module/BaseModule", "js/data/Collection", "hip/model/ProductType", "hip/command/ChangeProductType", "hip/command/Navigate"], function (BaseModule, Collection, ProductType, ChangeProductType, Navigate) {
    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
            productTypes: null
        },

        prepare: function (fragment, callback) {
            // TODO: load user data

            callback();
        },

        goCreate: function () {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "productTypes"
            }));
        }
    })
});