define(["hip/command/Command"], function (Command) {

    return Command.inherit({
        defaults: {
            configuration: null,
            saveState: false
        }
    })
});