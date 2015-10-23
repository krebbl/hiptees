define(["js/ui/View", "hip/command/Executor", "js/core/I18n", "hip/handler/NavigationHandler", "xaml!hip/data/HipDataSource"], function (View, Executor, I18n, NavigationHandler, HipDataSource) {

    return View.inherit({
        inject: {
            api: HipDataSource,
            i18n: I18n,
            executor: Executor,
            navigationHandler: NavigationHandler
        }
    });
});