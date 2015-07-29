define(["hip/handler/CommandHandler", "hip/command/ChangeTextConfiguration", "hip/entity/TextConfiguration"], function (Handler, ChangeTextConfiguration, TextConfiguration) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof ChangeTextConfiguration;
        },
        handleCommand: function (command) {
            var configuration = command.$.configuration;
            if (configuration instanceof TextConfiguration) {
            }
        }
    })
});