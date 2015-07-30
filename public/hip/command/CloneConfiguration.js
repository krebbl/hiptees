define(["hip/command/ProductCommand"], function (ConfigurationCommand) {
    return ConfigurationCommand.inherit({
        defaults: {
            configuration: null
        }
    })
});