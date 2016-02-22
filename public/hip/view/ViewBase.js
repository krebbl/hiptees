define(["js/ui/View", "js/core/I18n", "hip/store/NavigationStore", "xaml!hip/data/HipDataSource", "hip/action/NavigationActions"], function (View, I18n, NavigationStore, HipDataSource, NavigationActions) {

    return View.inherit({
        inject: {
            api: HipDataSource,
            i18n: I18n,
            navigationStore: NavigationStore,
            navActions: NavigationActions
        }
    });
});