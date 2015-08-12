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
        triggerEvent: function (eventType, attributes) {
            this.$.executor && this.$.executor.triggerEvent(eventType, attributes);
        }
//        /**
//         * Creates a callback for a command
//         *
//         * @param command
//         * @param callback
//         */
//        createCallback: function (command, callback) {
//            var cb = function () {
//                if (!this.cancelled) {
//                    callback.apply(arguments)
//                }
//            };
//
//            this._callbacks = this._callbacks || [];
//
//            this._callbacks.push({
//                command: command,
//                cb: cb
//            });
//
//            return cb;
//        },
//
//        cancelCallback: function (command) {
//            if (this._callbacks) {
//
//            }
//        }
    })
});