define(["hip/view/SwipeView", "hip/command/Executor", "hip/handler/ProductHandler", "xaml!hip/data/HipDataSource", "hip/command/NavigateBack", "hip/command/Navigate", "js/core/I18n"], function (View, Executor, ProductHandler, HipDataSource, NavigateBack, Navigate, I18n) {
    return View.inherit({
        defaults: {
            productHandler: null,
            executor: null
        },
        inject: {
            executor: Executor,
            productHandler: ProductHandler,
            api: HipDataSource,
            i18n: I18n
        },


        goBack: function () {
            this.$.executor.storeAndExecute(new NavigateBack());
        },
        goToBasket: function () {
            this.$.executor.storeAndExecute(new Navigate({fragment: "basket"}));
        }
    })
});