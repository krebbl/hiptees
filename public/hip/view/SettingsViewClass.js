define(["js/ui/View", "hip/command/Executor", "js/core/I18n", "hip/command/RemoveConfiguration"], function (View, Executor, I18n, RemoveConfiguration) {


    return View.inherit({
        defaults: {
            configuration: null
        },
        $classAttributes: ['configuration','executor'],
        inject: {
            executor: Executor
        },
        _deleteConfiguration: function(){
            this.$.executor.storeAndExecute(new RemoveConfiguration({
                configuration: this.$.configuration
            }));
        }
    })
});