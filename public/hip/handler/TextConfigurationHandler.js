define(["hip/handler/CommandHandler", "hip/command/ChangeTextColor", "hip/command/ChangeFontFamily", "hip/command/ChangeFontSize", "hip/model/TextConfiguration"], function (Handler, ChangeTextColor, ChangeFontFamily, ChangeFontSize, TextConfiguration) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof ChangeTextColor || ChangeTextColor || ChangeFontSize;
        },
        handleCommand: function (command) {
            if(command.$.configuration instanceof TextConfiguration){
                if (command instanceof ChangeFontFamily) {
                    var fontFamily = command.$.fontFamily;
                    // todo check if its a valid fontFamily
                    if (fontFamily) {
                        // todo: check if it is a text configuration
                        command.$.configuration.set('fontFamily', fontFamily);
                        this.trigger('on:fontFamilyChanged', command.$.configuration);
                    }
                } else if (command instanceof ChangeTextColor) {
                    var color = command.$.color;
                    // todo check if its a valid color
                    if (color) {
                        // todo: check if it is a text configuration
                        command.$.configuration.set('color', color);
                        this.trigger('on:textColorChanged', command.$.configuration);
                    }
                } else if (command instanceof ChangeFontSize) {
                    var fontSize = parseFloat(command.$.fontSize);
                    // todo check if its a valid fontSize
                    if (fontSize && command.$.configuration) {
                        // todo: check if it is a text configuration
                        command.$.configuration.set({
                            'fontSize': fontSize
                        });
                        this.trigger('on:fontSizeChanged', command.$.configuration);
                    }
                }
            }
        }
    })
});