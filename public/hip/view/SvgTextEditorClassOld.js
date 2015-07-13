define(["js/ui/View"], function (View) {
    var exampleTextObject = {
        lines: ["abc", "a"],
        fontFamily: "denseregular",
        lineHeight: 1.6,
        fontSize: 50,
        // svg unit
        maxWidth: 300

    };

    var NONE_BREAKABLE_SPACE = " ";

    return View.inherit({
        defaults: {
            componentClass: "svg-text-editor",
            width: 100,
            height: 100,
            viewBox: "0 0 100 100",
            contenteditable: true,
            textObject: null
        },

        $domAttributes: ["contenteditable"],

        _renderViewBox: function (viewBox) {
            if (viewBox) {
                this.$.svg.setViewBox(viewBox);
            }
        },

        _renderTextObject: function (textObject) {

            this.$.textContainer.set({
                "font-family": textObject.fontFamily,
                "font-size": textObject.fontSize
            });

            var lines = textObject.lines,
                line,
                tspan;

            for (var i = 0; i < lines.length; i++) {
                line = lines[i];

                tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                if (!/\s$/.test(line) && i < lines.length - 1) {
                    line += NONE_BREAKABLE_SPACE;
                }
                tspan.textContent = line;
                tspan.setAttribute("y", textObject.fontSize + i * textObject.fontSize * textObject.lineHeight);
                tspan.setAttribute("x", 0);

                this.$.textContainer.$el.appendChild(tspan);
            }
//


        },

        getRealSelection: function () {
            var selection = window.getSelection();

            function getReal(node, offset) {
                var emptyLine = node.textContent === NONE_BREAKABLE_SPACE,
                    isBeginningOfLine,
                    ret = node;

                if (emptyLine && node.parentNode.nextSibling && node.parentNode.previousSibling) {
                    ret = node.parentNode.nextSibling.firstChild;
                } else {
                    isBeginningOfLine = node.textContent.charAt(offset - 1) === NONE_BREAKABLE_SPACE;

                    if (isBeginningOfLine && node.parentNode.nextSibling) {
                        ret = node.parentNode.nextSibling.firstChild;
                    }
                }
                return {
                    node: ret,
                    offset: isBeginningOfLine || emptyLine ? 0 : offset
                };
            }

            var anchor = getReal(selection.anchorNode, selection.anchorOffset),
                focus = getReal(selection.focusNode, selection.focusOffset);

            return {
                anchorNode: anchor.node,
                anchorOffset: anchor.offset,
                focusNode: focus.node,
                focusOffset: focus.offset,
                type: selection.type
            };
        },

        removeTextNode: function (node) {
            var tspan = node;
            if (tspan.tagName != "tspan") {
                tspan = tspan.parentNode;
            }
            var removeNode = tspan;

            var nextY = tspan.getAttribute("y"),
                originalY;
            while (tspan.nextSibling) {
                originalY = tspan.nextSibling.getAttribute("y");
                tspan.nextSibling.setAttribute("y", nextY);
                nextY = originalY;
                tspan = tspan.nextSibling;
            }

            this.$.textContainer.$el.removeChild(removeNode);
        },

        removeSelection: function (realSelection) {
            var reverse = true,
                anchorNode = realSelection.anchorNode,
                anchorOffset = realSelection.anchorOffset,
                focusNode = realSelection.focusNode,
                focusOffset = realSelection.focusOffset,
                node = anchorNode.parentNode,
                range;

            while (node) {
                if (node.firstChild === realSelection.focusNode) {
                    reverse = anchorOffset > focusOffset;
                    break;
                }
                node = node.nextSibling;
            }
            if (reverse) {
                node = anchorNode;
                var offset = anchorOffset;
                anchorNode = focusNode;
                anchorOffset = focusOffset;
                focusNode = node;
                focusOffset = offset;
            }
            var anchorText = anchorNode.textContent.substr(0, anchorOffset),
                focusText = focusNode.textContent.substr(focusOffset),
                newAnchorText = (anchorText + focusText) || NONE_BREAKABLE_SPACE;

            if (focusNode !== anchorNode) {
                var nodeToDelete = anchorNode.parentNode.nextSibling,
                    next;
                while (nodeToDelete && nodeToDelete !== focusNode.parentNode) {
                    next = nodeToDelete.nextSibling;
                    this.removeTextNode(nodeToDelete);

                    nodeToDelete = next;
                }

                this.removeTextNode(focusNode);
            }

            anchorNode.textContent = newAnchorText;

            var selection = window.getSelection();
            range = new Range();
            selection.removeAllRanges();
            range.setStart(anchorNode, anchorOffset);
            selection.addRange(range);
        },

        _onkeyDown: function (e) {
            var domEvent = e.domEvent;


            if ([8, 46, 13].indexOf(domEvent.which) > -1) {
                var selection = window.getSelection(),
                    realSelection = this.getRealSelection(),
                    type = selection.type,
                    anchorNode = realSelection.anchorNode,
                    anchorOffset = realSelection.anchorOffset,
                    editableSvgText = this.$.textContainer.$el,
                    range;

                if (domEvent.which == 46 || domEvent.which == 8) {

                    if (selection && selection.type == "Range") {
                        e.preventDefault();
                        this.removeSelection(realSelection);
                    } else if (selection.type == "Caret") {

                        var lengthBefore;

                        if (domEvent.which == 8) {
                            if (anchorOffset == 0) {
                                // beginning of line
                                var previousSpan = anchorNode.parentNode.previousSibling;
                                if (previousSpan) {
                                    lengthBefore = previousSpan.textContent.length - 1;
                                    previousSpan.textContent = previousSpan.textContent.replace(/\s$/, "") + anchorNode.textContent;
                                    this.removeTextNode(anchorNode);
                                    if (!previousSpan.nextSibling && previousSpan.textContent !== NONE_BREAKABLE_SPACE) {
                                        previousSpan.textContent = previousSpan.textContent.replace(/\s$/, "");
                                    }
                                    range = new Range();
                                    selection.removeAllRanges();
                                    range.setStart(previousSpan.firstChild, lengthBefore);
                                    selection.addRange(range);
                                }
                                e.preventDefault();
                            } else if (anchorNode.textContent.length == 1 && anchorOffset == 1) {
                                // last char in line
                                anchorNode.textContent = NONE_BREAKABLE_SPACE;

                                e.preventDefault();
                            }
                        } else if (domEvent.which == 46) {
                            if (anchorNode.textContent == NONE_BREAKABLE_SPACE) {
                                e.preventDefault();
                                this.removeTextNode(anchorNode);
                            } else if (anchorOffset == 0 && anchorNode.textContent.length == 1) {
                                anchorNode.textContent = NONE_BREAKABLE_SPACE;
                                e.preventDefault();
                            } else if (anchorNode.textContent.charAt(anchorOffset) === NONE_BREAKABLE_SPACE) {
                                var nextSpan = anchorNode.parentNode.nextSibling;
                                if (nextSpan) {
                                    lengthBefore = anchorNode.textContent.length - 1;
                                    anchorNode.textContent = anchorNode.textContent.replace(/\s$/, "") + nextSpan.textContent;
                                    this.removeTextNode(nextSpan);

                                    if (!anchorNode.nextSibling) {
                                        anchorNode.textContent = anchorNode.textContent.replace(/\s$/, "");
                                    }

                                    range = new Range();
                                    selection.removeAllRanges();
                                    range.setStart(anchorNode, lengthBefore);
                                    selection.addRange(range);
                                }
                                e.preventDefault();
                            }

                        }
                    }
                } else if (domEvent.which == 13) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (selection.type == "Caret") {
                        var lineText = anchorNode.textContent.substr(0, anchorOffset) || NONE_BREAKABLE_SPACE,
                            newLineText = anchorNode.textContent.substr(anchorOffset) || NONE_BREAKABLE_SPACE;

                        var newTspan = anchorNode.parentNode.cloneNode(false);

                        // if empty just fill it with line break
                        if (!anchorNode.parentNode.nextSibling) {
                            newLineText.replace(NONE_BREAKABLE_SPACE, "");
                        }
                        newTspan.textContent = newLineText;

                        var lineHeight = this.$.textObject.fontSize * this.$.textObject.lineHeight;

                        newTspan.setAttribute("y", parseInt(newTspan.getAttribute("y")) + lineHeight);

                        if (anchorNode.parentNode.nextSibling == null) {
                            editableSvgText.appendChild(newTspan);
                        } else {
                            // move next siblings to next line;
                            var nextSibling = anchorNode.parentNode.nextSibling;
                            while (nextSibling) {
                                nextSibling.setAttribute("y", parseInt(nextSibling.getAttribute("y")) + lineHeight);

                                nextSibling = nextSibling.nextSibling
                            }
                            editableSvgText.insertBefore(newTspan, anchorNode.parentNode.nextSibling);
                        }
                        if (lineText !== NONE_BREAKABLE_SPACE) {
                            lineText += NONE_BREAKABLE_SPACE;
                        }
                        anchorNode.textContent = lineText;

                        range = new Range();
                        selection.removeAllRanges();
                        range.setStart(newTspan.firstChild, 0);

                        selection.addRange(range);
                    }
                }
            }
        },

        _onblur: function () {
            var childNodes = this.$.textContainer.$el.childNodes;
            if (childNodes && childNodes.length) {
                var lastChild = childNodes[childNodes.length - 1];
                if (lastChild.textContent == "\n") {
                    this.$.textContainer.$el.removeChild(lastChild);
                }
            }
        },

        _insertLine: function () {

        },

        _onkeyPress: function (e) {
            var realSelection = this.getRealSelection(),
                anchorNode = realSelection.anchorNode,
                anchorOffset = realSelection.anchorOffset,
                range;

            if (anchorNode && anchorOffset == 0) {
                e.preventDefault();

                if (realSelection.type == "Range") {
                    this.removeSelection(realSelection);
                }

                var textContent = String.fromCharCode(e.domEvent.charCode) + anchorNode.textContent;

                if (!anchorNode.parentNode.nextSibling && !/^\s+$/.test(textContent)) {
                    textContent = textContent.replace(NONE_BREAKABLE_SPACE, "");
                }

                anchorNode.textContent = textContent;

                var sel = window.getSelection();
                range = new Range();
                sel.removeAllRanges();
                range.setStart(anchorNode, 1);
                sel.addRange(range);
                this.$insertFirstInto = null;

            }
        }
    })
});