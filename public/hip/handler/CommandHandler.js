define(["js/core/Component"], function (Component) {
    return Component.inherit({
        defaults: {
            executor: null
        },
        isResponsibleForCommand: function (command) {
            throw "Needs to be implemented";
        },
        handleCommand: function (command) {
            throw "Needs to be implemented";
        },
        triggerEvent: function(eventType, attributes){
            this.$.executor && this.$.executor.triggerEvent(eventType, attributes);
        }
    })
});