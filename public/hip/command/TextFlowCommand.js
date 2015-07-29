define(["hip/command/Command"], function (Command) {

    return Command.inherit({
        defaults: {
            textFlow: null,
            anchorOffset: null,
            focusOffset: null
        }
    })
});