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
                if (command.$.key) {
                    var valueBefore = configuration.get(command.$.key);
                    command.set('valueBefore', valueBefore);

                    configuration.set(command.$.key, command.$.value);

                    this.trigger('on:' + command.$.key + "Changed", {value: command.$.value});
                }
            }
        }
    })
});