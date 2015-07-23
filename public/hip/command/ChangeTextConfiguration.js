define(["hip/command/ConfigurationCommand"], function (ConfigurationCommand) {
    return ConfigurationCommand.inherit({
        defaults: {
            key: null,
            value: null
        }
    })
});