define(["hip/handler/CommandHandler", "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText"], function (Handler, DeleteText, InsertLine, InsertText) {
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
            if (command.$.textObject) {

                var anchorOffset = command.$.anchorOffset,
                    focusOffset = command.$.focusOffset,
                    lines = command.$.textObject.$.textFlow || [],
                    insertIndex;

                if (lines.length > 0 && (command instanceof DeleteText || InsertText || InsertLine)) {

                    if (anchorOffset !== focusOffset) {
                        if (focusOffset < anchorOffset) {
                            var t = anchorOffset;
                            anchorOffset = focusOffset;
                            focusOffset = t;
                        }

                        var startLineIndex = this.getLineIndex(lines, anchorOffset),
                            endLineIndex = this.getLineIndex(lines, focusOffset);

                        var relativeStart = this.getRelativeLineOffset(lines, anchorOffset),
                            relativeEnd = this.getRelativeLineOffset(lines, focusOffset);

                        if (endLineIndex < lines.length - 1 && relativeEnd > lines[endLineIndex].length) {
                            relativeEnd = 0;
                            endLineIndex++;
                        }


                        var preText = lines[startLineIndex].substring(0, relativeStart),
                            postText = lines[endLineIndex].substring(relativeEnd);

                        lines[startLineIndex] = preText + postText;

                        if (startLineIndex !== endLineIndex) {
                            lines.splice(startLineIndex + 1, endLineIndex - startLineIndex);
                        }
                    }
                }

                if (command instanceof InsertText && command.$.text) {
                    insertIndex = this.getLineIndex(lines, anchorOffset);
                    if (insertIndex == -1) {
                        lines.push("");
                        insertIndex = 0;
                    }
                    var lineIndex = this.getRelativeLineOffset(lines, anchorOffset);
                    if (insertIndex < lines.length - 1 && lineIndex > lines[insertIndex].length) {
                        lineIndex = 0;
                        insertIndex++;
                    }
                    var textArray = lines[insertIndex].split("");
                    textArray.splice(lineIndex, 0, command.$.text);
                    lines[insertIndex] = textArray.join("");

                    anchorOffset += command.$.text.length;
                    focusOffset = anchorOffset;
                } else if (command instanceof InsertLine) {
                    insertIndex = this.getLineIndex(lines, anchorOffset);
                    if (insertIndex == -1) {
                        lines.push("");
                        insertIndex = 0;
                    }
                    var oldLineIndex = this.getRelativeLineOffset(lines, anchorOffset);

                    var oldLineText = lines[insertIndex].substring(0, oldLineIndex);
                    var newLine = lines[insertIndex].substring(oldLineIndex);

                    lines[insertIndex] = oldLineText;

                    lines.splice(insertIndex + 1, 0, newLine);

                    anchorOffset++;
                    focusOffset = anchorOffset;
                }

                console.log(command.$.textObject.$.textFlow);

                this.trigger('on:changeTextFlow', {
                    textObject: command.$.textObject,
                    anchorOffset: anchorOffset,
                    focusOffset: focusOffset
                    // TODO: add more information about change
                });

            }
        }
    })
});