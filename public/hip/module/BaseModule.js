define(["js/core/Module", "hip/command/Executor", "hip/handler/ProductHandler", "xaml!hip/data/HipDataSource"], function (Module, Executor, ProductHandler, HipDataSource) {
    return Module.inherit({
        defaults: {
            productHandler: null,
            executor: null
        },
        inject: {
            executor: Executor,
            productHandler: ProductHandler,
            api: HipDataSource
        }
    })
});