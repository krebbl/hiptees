define(["hip/handler/CommandHandler", "hip/command/Navigate", "hip/command/NavigateBack"], function (Handler, Navigate, NavigateBack) {
    return Handler.inherit({
        defaults: {
            router: null
        },
        isResponsibleForCommand: function (command) {
            return command instanceof Navigate;
        },
        handleCommand: function (command) {
            if (command instanceof NavigateBack) {
                this.trigger('on:navigateBack', {});
            } else if (command.$.fragment) {
                this.trigger('on:navigate', {fragment: command.$.fragment});
            }
        }
    })
});