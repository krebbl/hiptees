define(["js/ui/View", "js/core/I18n", "hip/store/NavigationStore", "xaml!hip/data/HipDataSource", "hip/action/NavigationActions", "hip/action/ProductActions"], function (View, I18n, NavigationStore, HipDataSource, NavigationActions, ProductActions) {

    return View.inherit({
        inject: {
            api: HipDataSource,
            i18n: I18n,
            productActions: ProductActions,
            navigationStore: NavigationStore,
            navActions: NavigationActions
        }
    });
});