define(["hip/command/ConfigurationCommand"], function (ConfigurationCommand) {
    return ConfigurationCommand.inherit({
        defaults: {
            selection: {
                anchor: 0,
                focus: 0
            },
            textObject: null
        }
    })
});