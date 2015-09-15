define(["hip/handler/CommandHandler", "hip/command/EditTextConfiguration", "hip/entity/TextConfiguration", "text/entity/TextRange"], function (Handler, EditTextConfiguration, TextConfiguration, TextRange) {
    return Handler.inherit({
        defaults: {},
        isResponsibleForCommand: function (command) {
            return command instanceof EditTextConfiguration;
        },
        handleCommand: function (command) {
            var configuration = command.$.configuration;
            if (configuration instanceof TextConfiguration) {
                if (command.$.start) {
                    var textFlow = configuration.$.textFlow;
                    var totalLength = textFlow.textLength() - 1;
                    if (!textFlow.$.selection) {
                        textFlow.set('selection', TextRange.createTextRange(totalLength, totalLength));
                    } else {
                        textFlow.$.selection.set({
                            anchorIndex: totalLength,
                            activeIndex: totalLength
                        });
                    }

                    this.trigger('on:textEditingStarted', {configuration: configuration}, this);
                } else {
                    this.trigger('on:textEditingStopped', {configuration: configuration}, this);
                }
            }
        }
    })
});