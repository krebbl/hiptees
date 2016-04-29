define(["hip/store/Store",
    "text/operation/InsertTextOperation",
    "text/operation/SplitParagraphOperation",
    "text/operation/DeleteOperation",
    "text/operation/ApplyStyleToElementOperation",
    "text/entity/TextRange",
    "xaml!hip/svg/TextMeasurer"
], function (Store, InsertTextOperation, SplitParagraphOperation, DeleteOperation, ApplyStyleToElementOperation, TextRange, TextMeasurer) {

    return Store.inherit({

        ns: "textFlow",

        inject: {
            textMeasurer: TextMeasurer
        },

        deleteText: function (payload) {

            var anchorOffset = payload.anchorOffset,
                focusOffset = payload.focusOffset,
                textFlow = payload.textFlow;

            if (anchorOffset > focusOffset) {
                var t = focusOffset;
                focusOffset = anchorOffset;
                anchorOffset = t;
            }

            (new DeleteOperation(TextRange.createTextRange(anchorOffset, focusOffset), textFlow)).doOperation();

            focusOffset = anchorOffset;

            this._setSelection(payload.textFlow, anchorOffset, focusOffset);
        },

        insertText: function (payload) {
            var anchorOffset = payload.anchorOffset,
                focusOffset = payload.focusOffset,
                textFlow = payload.textFlow;

            if (anchorOffset > focusOffset) {
                var t = focusOffset;
                focusOffset = anchorOffset;
                anchorOffset = t;
            }

            var splitted = payload.text.split("\n");

            (new InsertTextOperation(TextRange.createTextRange(anchorOffset, focusOffset), textFlow, splitted.join(""))).doOperation();

            anchorOffset += payload.text.length;
            focusOffset = anchorOffset;

            var index = 0;
            for (var i = 0; i < splitted.length - 1; i++) {
                var split = splitted[i];
                index += split.length;
                this.insertLine({
                    textFlow: textFlow,
                    anchorOffset: index,
                    focusOffset: index
                });
                index++;
            }

            this._setSelection(payload.textFlow, anchorOffset, focusOffset);
        },

        insertLine: function (payload) {
            var anchorOffset = payload.anchorOffset,
                focusOffset = payload.focusOffset,
                textFlow = payload.textFlow;

            if (anchorOffset > focusOffset) {
                var t = focusOffset;
                focusOffset = anchorOffset;
                anchorOffset = t;
            }

            (new SplitParagraphOperation(TextRange.createTextRange(anchorOffset, focusOffset), textFlow)).doOperation();

            anchorOffset++;
            focusOffset = anchorOffset;

            this._setSelection(payload.textFlow, anchorOffset, focusOffset);
        },

        selectText: function (payload) {
            var anchorOffset = payload.anchorOffset,
                focusOffset = payload.focusOffset,
                textFlow = payload.textFlow;

            var textLength = textFlow.textLength() - 1;
            anchorOffset = Math.min(textLength, anchorOffset);
            focusOffset = Math.min(textLength, focusOffset);

            if (!textFlow.$.selection) {
                textFlow.set('selection', TextRange.createTextRange(0, textLength));
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
        },

        changeStyle: function (payload) {
            var textFlow = payload.textFlow;

            var leafStyle = payload.leafStyle;
            if (leafStyle) {
                var range;
                if (textFlow.$.selection && textFlow.$.selection.$.anchorIndex !== textFlow.$.selection.$.activeIndex) {
                    range = textFlow.$.selection;
                } else {
                    range = TextRange.createTextRange(0, textFlow.textLength())
                }

                var commonLeafStyle = range.getCommonLeafStyle(textFlow);
                if (leafStyle.hasOwnProperty("strokeColor")) {
                    if (!commonLeafStyle.$.strokeWidth) {
                        leafStyle.strokeWidth = 1;
                    }
                }

                (new ApplyStyleToElementOperation(range, textFlow, leafStyle, null)).doOperation();


                this.trigger('on:leafStyleChanged', {
                    textFlow: textFlow,
                    leafStyle: leafStyle,
                    preview: payload.preview
                });
            }
            var paragraphStyle = payload.paragraphStyle;
            if (paragraphStyle) {
                var self = this;
                var applyStyle = function () {
                    (new ApplyStyleToElementOperation(TextRange.createTextRange(0, textFlow.textLength()), textFlow, null, paragraphStyle)).doOperation();
                    self.trigger('on:paragraphStyleChanged', {
                        textFlow: textFlow, paragraphStyle: paragraphStyle,
                        preview: payload.preview
                    });
                };

                if (paragraphStyle.fontFamily) {
                    this.set('loadingFont', true);
                    this.$.textMeasurer.loadFont(paragraphStyle.fontFamily, function (err) {
                        self.set('loadingFont', false);
                        if (!err) {
                            applyStyle();
                        }
                    });
                } else {
                    applyStyle();
                }

            }
        },

        _setSelection: function (textFlow, anchorOffset, focusOffset) {
            textFlow.set('selection', null);

            this.trigger('on:changeTextFlow', {
                textFlow: textFlow,
                anchorOffset: anchorOffset,
                focusOffset: focusOffset
            });

            this.trigger('on:selectionChanged', {
                textFlow: textFlow,
                anchorIndex: anchorOffset,
                focusOffset: focusOffset
            });
        }

    });


});