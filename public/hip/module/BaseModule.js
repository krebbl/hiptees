define(["js/ui/View", "hip/store/ProductStore", "xaml!hip/data/HipDataSource", "hip/action/NavigationActions", "js/core/I18n", "js/core/NotificationManager", "xaml!hip/dialog/ConfirmDialog"], function (View, ProductStore, HipDataSource, NavigationActions, I18n, NotificationManager, ConfirmDialog) {
    return View.inherit({
        defaults: {
            productStore: null
        },
        inject: {
            confirmDialog: ConfirmDialog,
            productStore: ProductStore,
            navActions: NavigationActions,
            api: HipDataSource,
            i18n: I18n,
            notificationManager: NotificationManager
        },

        and: function (a, b) {
            return a && b;
        },

        goBack: function () {
            this.$.navActions.navigateBack();
        },
        goToBasket: function () {
            this.navigate("basket");
        },
        navigate: function (fragment) {
            this.$.navActions.navigate({fragment: fragment});
        }
    })
});