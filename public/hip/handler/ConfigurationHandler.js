define(["hip/handler/CommandHandler", "hip/command/ConfigurationCommand"], function (Handler, ConfigurationCommand) {
    return Handler.inherit({
        isResponsibleForCommand: function (command) {
            return command instanceof ConfigurationCommand;
        },
        handleCommand: function (command) {
            // TODO: implement
        }
    })
});