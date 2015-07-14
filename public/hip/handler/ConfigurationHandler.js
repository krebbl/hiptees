define(["hip/handler/CommandHandler", "hip/command/ConfigurationCommand", "hip/command/MoveConfiguration"], function (Handler, ConfigurationCommand, MoveConfiguration) {
    return Handler.inherit({
        isResponsibleForCommand: function (command) {
            return command instanceof ConfigurationCommand;
        },
        handleCommand: function (command) {
            if (command instanceof MoveConfiguration) {
                if (command.$.configurations && command.$.offset) {
                    for (var i = 0; i < command.$.configurations.length; i++) {
                        var configuration = command.$.configurations[i];
                        var offset = _.clone(configuration.$.offset);
                        offset.x += command.$.offset.x;
                        offset.y += command.$.offset.y;
                        configuration.set("offset", offset);
                    }
                }
            }
        }
    })
});