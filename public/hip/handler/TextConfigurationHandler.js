define(["hip/handler/CommandHandler", "hip/command/ChangeTextColor", "hip/command/ChangeFontFamily", "hip/command/ChangeFontSize", "hip/model/TextConfiguration", "hip/command/ChangeLineHeight","hip/command/ChangeTextAlignment"], function (Handler, ChangeTextColor, ChangeFontFamily, ChangeFontSize, TextConfiguration, ChangeLineHeight, ChangeTextAlignment) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof ChangeTextColor || ChangeTextColor || ChangeFontSize || ChangeLineHeight || ChangeTextAlignment;
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
                } else if (command instanceof ChangeLineHeight) {
                    var lineHeight = parseFloat(command.$.lineHeight);
                    // todo check if its a valid lineHeight
                    if (lineHeight && command.$.configuration) {
                        // todo: check if it is a text configuration
                        command.$.configuration.set({
                            'lineHeight': lineHeight
                        });
                        this.trigger('on:lineHeightChanged', command.$.configuration);
                    }
                } else if(command instanceof ChangeTextAlignment){
                    var alignment = command.$.alignment;
                    // todo check if its a valid alignment
                    if (alignment && command.$.configuration) {
                        // todo: check if it is a text configuration
                        command.$.configuration.set({
                            'textAlign': alignment
                        });
                        this.trigger('on:alignmentChanged', command.$.configuration);
                    }
                }
            }
        }
    })
});