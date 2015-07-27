define(["hip/handler/CommandHandler",
    "text/operation/InsertTextOperation",
    "text/operation/SplitParagraphOperation",
    "text/operation/DeleteOperation",
    "text/entity/TextRange", "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText"],
    function (Handler, InsertTextOperation, SplitParagraphOperation, DeleteOperation, TextRange, DeleteText, InsertLine, InsertText) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof DeleteText || InsertLine || InsertText;
        },

        getLineIndex: function (lines, offset) {
            var length = 0;
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                length += line.length + 1;
                if (length > offset) {
                    return i;
                }
            }

            return lines.length - 1;
        },

        getRelativeLineOffset: function (lines, offset) {
            var length = 0;
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                length += line.length + 1;
                if (length > offset) {
                    return offset - (length - line.length - 1);
                }
            }

            return lines[lines.length - 1].length;
        },

        handleCommand: function (command) {
            if (command.$.textFlow) {

                var anchorOffset = command.$.anchorOffset,
                    focusOffset = command.$.focusOffset,
                    textFlow = command.$.textFlow,
                    insertIndex;

                if (textFlow && command instanceof DeleteText) {
                    (new DeleteOperation(TextRange.createTextRange(anchorOffset, focusOffset), textFlow)).doOperation();

                    focusOffset = anchorOffset;
                }

                if (command instanceof InsertText && command.$.text) {
                    (new InsertTextOperation(TextRange.createTextRange(anchorOffset, focusOffset), textFlow, command.$.text)).doOperation();

                    anchorOffset += command.$.text.length;
                    focusOffset = anchorOffset;
                } else if (command instanceof InsertLine) {
                    (new SplitParagraphOperation(TextRange.createTextRange(anchorOffset, focusOffset), textFlow)).doOperation();


                    anchorOffset++;
                    focusOffset = anchorOffset;
                }

                console.log(command.$.textFlow);

                this.trigger('on:changeTextFlow', {
                    textFlow: command.$.textFlow,
                    anchorOffset: anchorOffset,
                    focusOffset: focusOffset
                    // TODO: add more information about change
                });

            }
        }
    })
});