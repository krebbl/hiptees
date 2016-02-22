define(["js/core/Component", "hip/action/Executor", "underscore"], function (Component, Executor, _) {


    return Component.inherit({
        defaults: {
            ns: "",
            executor: null
        },
        inject: {
            executor: Executor
        },
        actions: {},
        ctor: function () {
            this.callBase();

            var actions = this.actions;
            var self = this;
            var payload;

            function createActionFnc(ns, action, defaultPayload) {

                return function (payload) {
                    _.defaults(payload, defaultPayload);
                    self.$.executor.execute(ns, action, payload);
                }
            }

            for (var actionName in actions) {
                if (actions.hasOwnProperty(actionName)) {
                    payload = this.actions[actionName];
                    this.factory.prototype[actionName] = createActionFnc(this.ns, actionName, payload);
                }
            }
        }
    });


});