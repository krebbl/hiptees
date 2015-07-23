define(["hip/command/ConfigurationCommand"], function (ConfigurationCommand) {
    return ConfigurationCommand.inherit({
        defaults: {
            configuration: null,
            filterChange: null,
            clear: false
        }
    })
});