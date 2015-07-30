define(["hip/handler/CommandHandler",
        "text/operation/InsertTextOperation",
        "text/operation/SplitParagraphOperation",
        "text/operation/DeleteOperation",
        "text/operation/ApplyStyleToElementOperation",
        "text/entity/TextRange",
        "hip/command/TextFlowCommand",
        "hip/command/text/DeleteText",
        "hip/command/text/InsertLine",
        "hip/command/text/InsertText",
        "hip/command/text/SelectText",
        "hip/command/text/ChangeStyle"
    ],
    function (Handler, InsertTextOperation, SplitParagraphOperation, DeleteOperation, ApplyStyleToElementOperation, TextRange, TextFlowCommand, DeleteText, InsertLine, InsertText, SelectText, ChangeStyle) {
        return Handler.inherit({
            defaults: {

            },
            isResponsibleForCommand: function (command) {
                return command instanceof TextFlowCommand;
            },

            handleCommand: function (command) {
                if (command.$.textFlow) {

                    var anchorOffset = command.$.anchorOffset,
                        focusOffset = command.$.focusOffset,
                        textFlow = command.$.textFlow;

                    if (textFlow && (command instanceof DeleteText || command instanceof InsertText || command instanceof InsertLine)) {
                        if(anchorOffset > focusOffset){
                            var t = focusOffset;
                            focusOffset = anchorOffset;
                            anchorOffset = t;
                        }
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

                        this.trigger('on:changeTextFlow', {
                            textFlow: command.$.textFlow,
                            anchorOffset: anchorOffset,
                            focusOffset: focusOffset
                        });
                    } else if (command instanceof SelectText) {
                        if (!textFlow.$.selection) {
                            textFlow.set('selection', new TextRange(0, command.$.textFlow.textLength() - 1));
                        }

                        textFlow.$.selection.set({
                            anchorIndex: anchorOffset,
                            activeIndex: focusOffset
                        });

                        this.trigger('on:selectionChanged', {
                            textFlow: textFlow,
                            anchorIndex: anchorOffset,
                            focusOffset: focusOffset
                        });
                    } else if (command instanceof ChangeStyle) {
                        var leafStyle = command.$.leafStyle;
                        if (leafStyle) {
                            var range;
                            if (textFlow.$.selection && textFlow.$.selection.$.anchorIndex !== textFlow.$.selection.$.activeIndex) {
                                range = textFlow.$.selection;
                            } else {
                                range = TextRange.createTextRange(0, textFlow.textLength())
                            }
                            (new ApplyStyleToElementOperation(range, textFlow, leafStyle, null)).doOperation();

                            this.trigger('on:leafStyleChanged', {textFlow: textFlow, leafStyle: leafStyle});
                        }
                        var paragraphStyle = command.$.paragraphStyle;
                        if (paragraphStyle) {
                            (new ApplyStyleToElementOperation(TextRange.createTextRange(0, textFlow.textLength()), textFlow, null, paragraphStyle)).doOperation();
                            this.trigger('on:paragraphStyleChanged', {textFlow: textFlow, paragraphStyle: paragraphStyle});
                        }


                    }


                }
            }
        })
    });