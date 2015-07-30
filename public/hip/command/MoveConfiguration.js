define(["hip/command/ConfigurationCommand"], function (ConfigurationCommand) {
    return ConfigurationCommand.inherit({
        defaults: {
            configuration: null,
            offset: null,
            size: null
        }
    })
});