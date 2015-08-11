define(["hip/handler/CommandHandler", "hip/command/ChangeShapeConfiguration", "hip/entity/ShapeConfiguration"], function (Handler, ChangeShapeConfiguration, ShapeConfiguration) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof ChangeShapeConfiguration;
        },
        handleCommand: function (command) {
            var configuration = command.$.configuration;
            if (configuration instanceof ShapeConfiguration) {
                configuration.set(command.$.change || {});
            }
        }
    })
});