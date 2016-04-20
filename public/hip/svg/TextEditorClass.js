define(["js/ui/View", "hip/action/TextFlowActions", 'hip/store/TextFlowStore'], function (View, TextFlowActions, TextFlowStore) {
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
            contenteditable: "plaintext-only",
            textFlow: null,
            selection: null
        },

        inject: {
            textActions: TextFlowActions,
            textFlowStore: TextFlowStore
        },

        $domAttributes: ["contenteditable", "autocorrect", "autocomplete", "spellcheck", "autocapitalize"],

        _handleSizeChange: function (e) {
            // do nothing
        },

        _commitTextFlow: function () {
            this._clearSelection();
        },

        _renderMaxWidth: function () {
            // IMPORTANT: DON'T REMOVE THIS METHOD
            // do nothing
        },

        focus: function () {
            this.callBase();

            var self = this;
            this.$absoluteEnd = null;
            this.$absoluteOffset = null;
            //setTimeout(function () {
            if (self.$.textFlow.$.selection) {
                self.setCursor(self.$.textFlow.$.selection.$.anchorIndex, self.$.textFlow.$.selection.$.activeIndex);
            }
            //}, 1)
        },

        _onpointerMove: function (e) {
            e.stopPropagation();
        },

        _onSelectionChange: function () {
            if (this.$.textFlow) {
                var self = this;
                this.$selectTimeout && clearTimeout(this.$selectTimeout);
                this.$selectTimeout = setTimeout(function () {
                    var selection = self.getAbsoluteSelection();
                    self.$.textActions.selectText({
                        textFlow: self.$.textFlow,
                        anchorOffset: selection.anchorOffset,
                        focusOffset: selection.focusOffset
                    });
                    //console.log("set new selection", selection.anchorOffset, selection.focusOffset);
                }, 20);
            }
        },

        _bindDomEvents: function () {
            this.callBase();
            var self = this;
            this.dom(this.$stage.$document).bindDomEvent("selectionchange", function (e) {
                setTimeout(function () {
                    self._saveSelection();
                }, 10);
            });
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
            this.bind('textFlowStore', 'on:changeTextFlow', function (e) {
                if (e.$.textFlow === self.$.textFlow) {
                    self.setCursor(e.$.anchorOffset);
                }
            }, this);

            //this.bind('textFlowHandler', 'on:selectionChanged', function (e) {
            //    if (e.$.textFlow === self.$.textFlow) {
            //        self.setCursor(e.$.anchorIndex, e.$.focusOffset);
            //    }
            //}, this);
        },

        getAbsoluteSelection: function () {
            var selection = window.getSelection(),
                textContainer = this.$.$textContainer.$el;

            function getAbsoluteOffset(node, offset) {
                if (!node) {
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

            var absoluteOffset = getAbsoluteOffset(selection.anchorNode, selection.anchorOffset),
                absoluteEnd = getAbsoluteOffset(selection.focusNode, selection.focusOffset);

            return {
                anchorOffset: absoluteOffset,
                focusOffset: absoluteEnd
            };

        },

        setCursor: function (absoluteOffset, absoluteEnd) {
            if (!this.$addedToDom || !this.$.visible) {
                return;
            }
            if (this.$absoluteOffset == absoluteOffset && this.$absoluteEnd == absoluteEnd) {
                return;
            }
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
                this.$absoluteOffset = absoluteOffset;
                this.$absoluteEnd = absoluteEnd;
            }
        },

        _onkeyDown: function (e) {
            var domEvent = e.domEvent;
            if ([8, 46, 13].indexOf(domEvent.which) > -1) {
                var sel = this.getAbsoluteSelection();
                e.preventDefault();
                e.stopPropagation();
                var textActions = this.$.textActions;
                if (domEvent.which == 46) {
                    if (sel.anchorOffset == sel.focusOffset) {
                        sel.focusOffset = Math.max(0, sel.focusOffset + 1);
                    }
                    textActions.deleteText({
                        textFlow: this.$.textFlow,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    });

                } else if (domEvent.which == 8) {
                    if (sel.anchorOffset == sel.focusOffset) {
                        sel.anchorOffset = Math.max(0, sel.focusOffset - 1);
                    }

                    textActions.deleteText({
                        textFlow: this.$.textFlow,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    });

                } else if (domEvent.which == 13) {

                    textActions.insertLine({
                        textFlow: this.$.textFlow,
                        anchorOffset: sel.anchorOffset,
                        focusOffset: sel.focusOffset
                    });
                }
                this._clearSelection();
            } else {
                this._saveSelection();
                //console.log(String.fromCharCode(domEvent.which));
                //e.preventDefault();
                //this.$selectionBefore = this.getAbsoluteSelection();
            }
        },

        _saveSelection: function () {
            var selection = window.getSelection();
            if (selection && selection.focusNode) {
                this.$selectionBefore = this.getAbsoluteSelection();
                this.$focusNodeBefore = selection.focusNode;
                this.$focusText = selection.focusNode.textContent;
            } else {
                this._clearSelection();
            }
        },

        _clearSelection: function () {
            this.$selectionBefore = null;
            this.$focusNodeBefore = null;
            this.$focusText = null;
        },

        _ontextInput: function (e) {

            if (this.$selectionBefore) {
                var text = e.domEvent.data;
                var startIndex = this.$selectionBefore.anchorOffset;
                var endIndex = this.$selectionBefore.focusOffset;


                //console.log("insert", text, startIndex, endIndex);
                e.stopPropagation();

                this.$.textActions.insertText({
                    textFlow: this.$.textFlow,
                    text: text,
                    anchorOffset: startIndex,
                    focusOffset: endIndex
                });

                this._clearSelection();
            }
        },

        _oninput: function (e) {
            if (this.$selectionBefore) {
                var selection = window.getSelection();
                var startIndex = this.$selectionBefore.anchorOffset;
                var endIndex = this.$selectionBefore.focusOffset;
                if (startIndex === endIndex) {
                    startIndex--;
                }

                this.$.textActions.deleteText({
                    textFlow: this.$.textFlow,
                    anchorOffset: startIndex,
                    focusOffset: endIndex
                });
            } else if (!this.$selectionBefore && this.$stage.$browser.isIOS) {
                // prevents that text from the autocompletion is used
                this.$.$textContainer._renderMeasureResult(this.$.$textContainer.$.measureResult);
            }
            this._clearSelection();
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
                e.stopPropagation();
                var sel = this.getAbsoluteSelection();
                this._clearSelection();

                this.$.textActions.insertText({
                    textFlow: this.$.textFlow,
                    text: String.fromCharCode(e.domEvent.charCode),
                    anchorOffset: sel.anchorOffset,
                    focusOffset: sel.focusOffset
                });
            }

        },
        _handleTextFlowRendered: function () {
            console.log("textflow rendered");
        }
    })
});