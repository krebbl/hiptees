define(["js/ui/View", "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText", "hip/command/Executor", 'hip/handler/TextFlowHandler', 'hip/command/text/SelectText'], function (View, DeleteText, InsertLine, InsertText, Executor, TextFlowHandler, SelectText) {
    var EMPTY_LINE_TEXT = "\n" + String.fromCharCode(173);

    return View.inherit({
        defaults: {
            componentClass: "svg-text-editor",
            maxWidth: null,
            svgWidth: 100,
            svgHeight: 100,
            width: 100,
            height: 100,
            viewBox: "0 0 100 100",
            contenteditable: true,
            textFlow: null,
            selection: "{textFlow.selection}"
        },

        inject: {
            executor: Executor,
            textFlowHandler: TextFlowHandler
        },

        $domAttributes: ["contenteditable"],

        _handleSizeChange: function (e) {
            var rect = e.target.$el.getBoundingClientRect();
            if (this.$.maxWidth == null && rect.width > 0) {
                this.set({
                    width: rect.width,
                    height: rect.height
                });

            }
            if (this.$.textFlow.$.selection) {
                this.setCursor(this.$.textFlow.$.selection.$.anchorIndex, this.$.textFlow.$.selection.$.activeIndex);
            }
        },

        _renderSelection: function (selection) {
            if (selection) {
//               this.setCursor(selection.$.anchorIndex, selection.$.activeIndex);
            }
        },

        _renderMaxWidth: function () {
            // IMPORTANT: DON'T REMOVE THIS METHOD
            // do nothing
        },

        _commitVisible: function (visible) {
            if (!visible && this.$.textFlow) {
                this.$.executor.execute(new SelectText({
                    textFlow: this.$.textFlow,
                    anchorOffset: 0,
                    focusOffset: 0
                }));
            }
        },

        _onPointerUp: function () {
            if (this.$.textFlow) {
                var self = this;
                this.$selectTimeout && clearTimeout(this.$selectTimeout);
                this.$selectTimeout = setTimeout(function () {
                    var selection = self.getAbsoluteSelection();
                    self.$.executor.execute(new SelectText({
                        textFlow: self.$.textFlow,
                        anchorOffset: selection.anchorOffset,
                        focusOffset: selection.focusOffset
                    }));
                }, 500);
            }
        },

        _onscroll: function (e) {
            this.$el.scrollTop = 0;
            this.$el.scrollLeft = 0;
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
                if (e.$.textFlow === self.$.textFlow) {
                    self.setCursor(e.$.anchorOffset);
                }
            });
        },

        getAbsoluteSelection: function () {
            var selection = window.getSelection(),
                textContainer = this.$.$textContainer.$el;

            function getAbsoluteOffset(node, offset) {
                if(!node){
                    return 0;
                }
                var length = 0;
                for (var i = 0; i < textContainer.childNodes.length; i++) {
                    var child = textContainer.childNodes[i];
                    for (var j = 0; j < child.childNodes.length; j++) {
                        var tspan = child.childNodes[j];
                        if (node === tspan.parentNode || tspan === node || tspan === node.parentNode) {
                            return length + offset;
                        }
                        length += tspan.textContent.length;
                        if (tspan.textContent == EMPTY_LINE_TEXT) {
                            length -= 2;
                        }

                    }
                    length++;
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

        setCursor: function (absoluteOffset, absoluteEnd) {
            var selection = window.getSelection(),
                textContainer = this.$.$textContainer.$el;

            function getRelativeData(absoluteOffset) {

                var child,
                    span,
                    length = 0;
                for (var i = 0; i < textContainer.childNodes.length; i++) {
                    child = textContainer.childNodes[i];
                    for (var j = 0; j < child.childNodes.length; j++) {
                        span = child.childNodes[j];
                        length += span.textContent.length;

                        if (span.textContent == EMPTY_LINE_TEXT) {
                            length -= 2;
                        }
                        if (length >= absoluteOffset) {
                            if (span.textContent == EMPTY_LINE_TEXT) {
                                length += 2;
                            }
                            return {
                                node: span,
                                offset: Math.max(0, absoluteOffset - (length - span.textContent.length))
                            };
                        }
                    }
                    length += 1;
                    if (child.hasAttribute("data-soft-line") && child.hasAttribute("data-char-break")) {
                        length--;
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
                if (absoluteEnd != null) {
                    relativeData = getRelativeData(absoluteEnd);
                    range.setEnd(relativeData.node.firstChild || relativeData.node, relativeData.offset);
                }
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
                e.preventDefault();

                if (domEvent.which == 46) {
                    if (sel.anchorOffset == sel.focusOffset) {
                        sel.focusOffset = Math.max(0, sel.focusOffset + 1);
                    }
                    this.$.executor.storeAndExecute(new DeleteText({
                        textFlow: this.$.textFlow,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    }));

                } else if (domEvent.which == 8) {
                    if (sel.anchorOffset == sel.focusOffset) {
                        sel.anchorOffset = Math.max(0, sel.focusOffset - 1);
                    }

                    this.$.executor.storeAndExecute(new DeleteText({
                        textFlow: this.$.textFlow,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    }));

                } else if (domEvent.which == 13) {

                    this.$.executor.storeAndExecute(new InsertLine({
                        textFlow: this.$.textFlow,
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

                var insertedText = textAfter.substring(0, selection.focusOffset);

                self.$.executor.storeAndExecute(new InsertText({
                    textFlow: self.$.textFlow,
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
            var domEvent = e.domEvent,
                selection, focusNode, range;
            if (37 == domEvent.which) {
                selection = window.getSelection();
                if (selection.type == "Caret" && selection.focusOffset > 1 && selection.focusNode.textContent === EMPTY_LINE_TEXT) {
                    e.preventDefault();
                    focusNode = selection.focusNode;
                    selection.removeAllRanges();
                    range = new Range();
                    range.setStart(focusNode, 0);
                    selection.addRange(range);
                }
            } else if (39 == domEvent.which) {
                selection = window.getSelection();
                focusNode = selection.focusNode;
                if (selection.type == "Caret" && selection.focusOffset > 0 && focusNode.textContent === EMPTY_LINE_TEXT) {
                    e.preventDefault();
                    selection.removeAllRanges();
                    var next = focusNode.parentNode.parentNode.nextSibling || focusNode.parentNode.parentNode;
                    range = new Range();
                    range.setStart(next.firstChild.firstChild, 0);
                    selection.addRange(range);
                }


            }
        },


        _onkeyPress: function (e) {

            if (e.domEvent.charCode > 0) {
                e.preventDefault();
                var sel = this.getAbsoluteSelection();
                this.$.executor.storeAndExecute(new InsertText({
                    textFlow: this.$.textFlow,
                    text: String.fromCharCode(e.domEvent.which),
                    anchorOffset: sel.anchorOffset,
                    focusOffset: sel.focusOffset
                }));
            }

        }
    })
});