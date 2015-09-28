define(["hip/module/BaseModule", "js/data/Query", "js/data/Collection", "hip/model/Product", "hip/command/Navigate"], function (BaseModule, Query, Collection, Product, Navigate) {
    return BaseModule.inherit({
        defaults: {
            loading: false,
            basket: null
        },

        prepare: function (fragment, callback) {
            callback && callback();
        }
    })
});