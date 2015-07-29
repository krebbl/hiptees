define(["hip/command/TextFlowCommand"], function (TextFlowCommand) {
    return TextFlowCommand.inherit({
        defaults: {
            selection: {
                anchor: 0,
                focus: 0
            },
            text: "",
            textObject: null
        }
    })
});