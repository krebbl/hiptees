define(["js/core/Component"], function (Component) {


    return Component.inherit({
        defaults: {
            eventBus: null
        },
        ctor: function () {
            this.callBase();
            this.$history = [];
            this.$failed = [];
            this.$handler = [];
        },
        addCommandHandler: function (handler) {
            handler.set('executor', this);
            this.$handler.push(handler);
        },

        storeAndExecute: function (command) {
            this.$history.push(command);

            var handler;
            for (var i = 0; i < this.$handler.length; i++) {
                handler = this.$handler[i];
                if (handler.isResponsibleForCommand(command)) {
//                    try {
                        handler.handleCommand(command);
//                    } catch (e) {
//                        this.$failed.push({
//                            index: this.$history.indexOf(command),
//                            command: command,
//                            e: e
//                        });
//                        throw e;
//                    }
                }
            }
        },
        triggerEvent: function (eventType, attributes) {
            this.$.eventBus && this.$.eventBus.trigger(eventType, attributes);
        }
    })
})
;