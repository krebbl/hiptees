define(["hip/command/ConfigurationCommand"], function (ConfigurationCommand) {
    return ConfigurationCommand.inherit({
        defaults: {
            start: null,
            configuration: null
        }
    })
});