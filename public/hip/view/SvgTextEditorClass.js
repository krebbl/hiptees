define(["js/ui/View", "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText", "hip/command/Executor", 'hip/handler/TextFlowHandler'], function (View, DeleteText, InsertLine, InsertText, Executor, TextFlowHandler) {
    var EMPTY_LINE_TEXT = "\n" + String.fromCharCode(173);

    return View.inherit({
        defaults: {
            componentClass: "svg-text-editor",
            maxWidth: 10000,
            svgWidth: 100,
            svgHeight: 100,
            width: 100,
            height: 100,
            viewBox: "0 0 100 100",
            contenteditable: true,
            textObject: null,
            textAlign: "{textObject.textAlign}"
        },

        inject: {
            executor: Executor,
            textFlowHandler: TextFlowHandler
        },

        $domAttributes: ["contenteditable"],

        _renderMaxWidth: function () {

        },

        _renderViewBox: function (viewBox) {
            if (viewBox) {
                this.$.svg.setViewBox.apply(this.$.svg, viewBox.split(" "));
            }
        },

        _initializationComplete: function () {
            this.callBase();

            var self = this;
            this.bind('textFlowHandler', 'on:changeTextFlow', function (e) {
                if (e.$.textObject === self.$.textObject) {
                    self.setCursor(e.$.anchorOffset);
                }
            });
        },

        getAbsoluteSelection: function () {
            var selection = window.getSelection(),
                textContainer = this.$.$textContainer.$el;

            function getAbsoluteOffset(node, offset) {
                var length = 0;
                for (var i = 0; i < textContainer.childNodes.length; i++) {
                    var child = textContainer.childNodes[i];
                    if (child == node.parentNode) {
                        return length + offset;
                    }
                    length += child.textContent.length + 1;
                    if (child.textContent == EMPTY_LINE_TEXT) {
                        length -= 2;
                    }
                    if (child.hasAttribute("data-soft-line") && child.hasAttribute("data-char-break")) {
                        length--;
                    }
                }
                return 0;
            }

            return {
                anchorOffset: getAbsoluteOffset(selection.anchorNode, selection.anchorOffset),
                focusOffset: getAbsoluteOffset(selection.focusNode, selection.focusOffset)
            };

        },

        setCursor: function (absoluteOffset) {
            var selection = window.getSelection(),
                textContainer = this.$.$textContainer.$el;

            function getRelativeData(absoluteOffset) {

                var length = 0;
                for (var i = 0; i < textContainer.childNodes.length; i++) {
                    var child = textContainer.childNodes[i];
                    length += child.textContent.length + 1;
                    if (child.textContent == EMPTY_LINE_TEXT) {
                        length -= 2;
                    }
                    if (child.hasAttribute("data-soft-line")) {
                        length--;

                        if (!child.hasAttribute("data-char-break")) {
                            length++;
                        }
                    }
                    if (length > absoluteOffset) {
                        if (child.textContent == EMPTY_LINE_TEXT) {
                            length += 2;
                        }
                        return {
                            node: child,
                            offset: Math.max(0, absoluteOffset - (length - child.textContent.length - 1))
                        };
                    }
                }
                var lastChild = textContainer.lastChild;
                return {
                    node: lastChild,
                    offset: lastChild.textContent.length
                };
            }

            selection.removeAllRanges();
            var range = new Range();
            var relativeData = getRelativeData(absoluteOffset);
            if (relativeData) {
                range.setStart(relativeData.node.firstChild || relativeData.node, relativeData.offset);
                selection.addRange(range);
            }
        },

        _onpointerdown: function (e) {
//            e.preventDefault();

        },

        _onkeyDown: function (e) {
            var domEvent = e.domEvent;

            if ([8, 46, 13].indexOf(domEvent.which) > -1) {
                var sel = this.getAbsoluteSelection();
                console.log(sel);
                e.preventDefault();

                if (domEvent.which == 46) {
                    if (sel.anchorOffset == sel.focusOffset) {
                        sel.focusOffset = Math.max(0, sel.focusOffset + 1);
                    }

                    this.$.executor.storeAndExecute(new DeleteText({
                        textObject: this.$.textObject,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    }));

                } else if (domEvent.which == 8) {
                    if (sel.anchorOffset == sel.focusOffset) {
                        sel.focusOffset = Math.max(0, sel.focusOffset - 1);
                    }

                    this.$.executor.storeAndExecute(new DeleteText({
                        textObject: this.$.textObject,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    }));

                } else if (domEvent.which == 13) {

                    this.$.executor.storeAndExecute(new InsertLine({
                        textObject: this.$.textObject,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    }));

                }

            } else {
                var seletion = window.getSelection();
                this.$textBefore = seletion.focusNode.textContent;
            }
        },

        _oninput: function (e) {
            this.$insert && clearTimeout(this.$insert);

            e.preventDefault();
            e.stopPropagation();

            var self = this;

            this.$insert = setTimeout(function () {
                var selection = window.getSelection();
                var textAfter = selection.anchorNode.textContent;

                var i = -1;

                var textContainer = self.$.$textContainer.$el,
                    child;
                for (i = 0; i < textContainer.childNodes.length; i++) {
                    child = textContainer.childNodes[i];
                    if (child === selection.focusNode.parentNode) {
                        break;
                    }
                }

                var line = self.$.$textContainer.getOriginalLine(i);


                var absoluteSelection = self.getAbsoluteSelection();

                var diff = textAfter.length - line.text.length;
                if (selection.anchorNode.parentNode.nextSibling) {
                    diff--;
                }
                console.log(line.text.length, textAfter.length, diff);

//                var diff = Math.max(1, textAfter.length - this.$textBefore.length);
                var insertedText = textAfter.substring(0, selection.focusOffset);

//                console.log(insertedText);


                self.$.executor.storeAndExecute(new InsertText({
                    textObject: self.$.textObject,
                    text: insertedText,
                    anchorOffset: absoluteSelection.focusOffset - selection.focusOffset,
                    focusOffset: absoluteSelection.focusOffset - diff
                }));

            }, 20);
//
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

        _onkeyUp: function (e) {
            var domEvent = e.domEvent;
            if ([37].indexOf(domEvent.which) > -1) {
                var selection = window.getSelection();
                if (selection.type == "Caret" && selection.focusOffset > 1 && selection.focusNode.textContent === EMPTY_LINE_TEXT) {
                    e.preventDefault();
                    var focusNode = selection.focusNode;
                    selection.removeAllRanges();
                    var range = new Range();
                    range.setStart(focusNode, 0);
                    selection.addRange(range);
                }
            }
            if ([39].indexOf(domEvent.which) > -1) {
                var selection = window.getSelection();
                var focusNode = selection.focusNode;
                if (selection.type == "Caret" && selection.focusOffset > 0 && focusNode.textContent === EMPTY_LINE_TEXT) {
                    e.preventDefault();
                    selection.removeAllRanges();
                    var next = focusNode.parentNode.nextSibling || focusNode.parentNode;
                    var range = new Range();
                    range.setStart(next.firstChild, 0);
                    selection.addRange(range);
                }


            }
        },


        _onkeyPress: function (e) {
            e.preventDefault();
            var sel = this.getAbsoluteSelection();

            this.$.executor.storeAndExecute(new InsertText({
                textObject: this.$.textObject,
                text: String.fromCharCode(e.domEvent.which),
                anchorOffset: sel.anchorOffset,
                focusOffset: sel.focusOffset
            }));

        }
    })
});