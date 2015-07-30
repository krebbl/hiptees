define(["hip/handler/CommandHandler", "hip/command/ConfigurationCommand", "hip/command/MoveConfiguration"], function (Handler, ConfigurationCommand, MoveConfiguration) {
    return Handler.inherit({
        isResponsibleForCommand: function (command) {
            return command instanceof ConfigurationCommand;
        },
        handleCommand: function (command) {
            if (command instanceof MoveConfiguration) {
                if (command.$.configuration) {
                    var configuration = command.$.configuration;
                    var change = {};
                    if (command.$.size) {
                        change.size = command.$.size;
                    }
                    if (command.$.offset) {
                        change.offset = command.$.offset;
                    }
                    configuration.set(change);

                    this.trigger('on:configurationMoved', {configuration: configuration});
                }
            }
        }
    })
});