define(["hip/view/SwipeView", "hip/command/Executor", "hip/handler/ProductHandler", "xaml!hip/data/HipDataSource", "hip/command/NavigateBack", "hip/command/Navigate", "js/core/I18n", "js/core/NotificationManager", "xaml!hip/dialog/ConfirmDialog"], function (View, Executor, ProductHandler, HipDataSource, NavigateBack, Navigate, I18n, NotificationManager, ConfirmDialog) {
    return View.inherit({
        defaults: {
            productHandler: null,
            executor: null
        },
        inject: {
            confirmDialog: ConfirmDialog,
            executor: Executor,
            productHandler: ProductHandler,
            api: HipDataSource,
            i18n: I18n,
            notificationManager: NotificationManager
        },

        and: function(a, b){
            return a && b;
        },

        goBack: function () {
            this.$.executor.storeAndExecute(new NavigateBack());
        },
        goToBasket: function () {
            this.navigate("basket");
        },
        navigate: function(fragment){
            this.$.executor.storeAndExecute(new Navigate({fragment: fragment}));
        }
    })
});