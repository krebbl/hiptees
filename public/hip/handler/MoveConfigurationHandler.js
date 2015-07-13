define(["hip/handler/CommandHandler", "hip/command/MoveConfiguration"], function (Handler, MoveConfiguration) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof MoveConfiguration;
        },
        handleCommand: function (command) {
            var anchor = command.$.anchor;
            // todo check if its a valid anchor
            if (anchor && command.$.configuration) {
                // todo: check if it is a text configuration
                command.$.configuration.set('anchor', anchor);
                this.trigger('configurationMoved', command.$.configuration);
            }
        }
    })
});