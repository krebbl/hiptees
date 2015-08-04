define(["hip/handler/CommandHandler", "hip/command/Navigate"], function (Handler, Navigate) {
    return Handler.inherit({
        defaults: {
            router: null
        },
        isResponsibleForCommand: function (command) {
            return command instanceof Navigate;
        },
        handleCommand: function (command) {
            if (command instanceof Navigate && this.$.router) {
                this.$.router.navigate(command.$.fragment);
            }
        }
    })
});