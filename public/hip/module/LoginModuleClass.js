define(["hip/module/BaseModule", "js/data/Collection", "hip/model/ProductType", "hip/command/ChangeProductType", "hip/command/Navigate"], function (BaseModule, Collection, ProductType, ChangeProductType, Navigate) {
    return BaseModule.inherit({
        defaults: {
            loading: true
        }
    })
});