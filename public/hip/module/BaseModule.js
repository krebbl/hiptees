define(["hip/view/SwipeView", "hip/command/Executor", "hip/handler/ProductHandler", "xaml!hip/data/HipDataSource", "hip/command/NavigateBack"], function (View, Executor, ProductHandler, HipDataSource, NavigateBack) {
    return View.inherit({
        defaults: {
            productHandler: null,
            executor: null
        },
        inject: {
            executor: Executor,
            productHandler: ProductHandler,
            api: HipDataSource
        },

        goBack: function () {
            this.$.executor.storeAndExecute(new NavigateBack());
        }
    })
});