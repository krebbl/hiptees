define(["js/ui/View", "hip/command/Executor", "js/core/I18n"], function (View, Executor, I18n) {


    return View.inherit({
        defaults: {
            configuration: null
        },
        $classAttributes: ['configuration','executor'],
        inject: {
            executor: Executor
        }
    })
});