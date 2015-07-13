define(['js/svg/SvgElement', 'hip/handler/TextFlowHandler', 'xaml!hip/text/SvgMeasurer'], function (SvgElement, TextFlowHandler, SvgMeasurer) {

    var EMPTY_LINE_TEXT = "\n" + String.fromCharCode(173);

    return SvgElement.inherit({
        defaults: {
            tagName: 'g',
            textObject: null,
            measureResult: null,
            maxWidth: 308,
            textColor: "{textObject.color}"
        },

        $classAttributes: ['textObject', 'maxWidth', 'measureResult'],

        events: ["on:heightChanged"],

        inject: {
            textFlowHandler: TextFlowHandler,
            svgMeasurer: SvgMeasurer
        },

        ctor: function () {
            this.callBase();

            var self = this;
            this.bind('textFlowHandler', 'on:changeTextFlow', function (e) {
                if (e.$.textObject === self.$.textObject) {
                    self._renderTextObject(e.$.textObject);
                }
            });
        },


        _updateTextFlow: function () {

        },

        _renderMaxWidth: function (maxWidth, oldMaxWidth) {

            if (maxWidth && this.$.textObject && this.$.measureResult) {
                this._renderTextObject(this.$.textObject);

                var textAlign = this.$.textObject.$.textAlign;
                if (textAlign == "center" || textAlign == "right") {
                    var x,
                        transform;
                    for (var i = 0; i < this.$el.childNodes.length; i++) {
                        var child = this.$el.childNodes[i],
                            line = this.$.measureResult.lines[i];
                        transform = child.getAttribute("transform");
                        if (textAlign == "center") {
                            x = 0.5 * (maxWidth - line.width);
                        } else if (textAlign == "right") {
                            x = maxWidth - line.width;
                        }

                        child.setAttribute("transform", transform.replace(/translate\([^,]+,([^,]+)\)/, "translate(" + x + ",$1)"));
                    }
                }

            }

        },

        _renderTextColor: function (textColor) {
            if (textColor) {
                for (var i = 0; i < this.$el.childNodes.length; i++) {
                    var child = this.$el.childNodes[i];
                    child.setAttribubte("fill", textColor);
                }
            }
        },

        _updateLineHeight: function () {
            if (this.$.measureResult && this.$.textObject) {
                var child, line, transform, y;
                for (var i = 0; i < this.$el.childNodes.length; i++) {
                    child = this.$el.childNodes[i];
                    line = this.$.measureResult.lines[i];

                    transform = child.getAttribute("transform");
                    y = i * this.$.textObject.fontSize * this.$.textObject.lineHeight;

                    child.setAttribute("transform", transform.replace(/translate\(([^,]+),[^,]+\)/, "translate($1,"+ y+")"));
                }
            }
        },

        _renderTextObject: function (textObject) {

            if (textObject) {
//                var f = this.$rootScope.localToGlobalFactor().x;
//                console.log();
                this.set({
                    "font-family": textObject.$.fontFamily,
                    "font-size": textObject.$.fontSize
                });
                var measureResult = this.$.svgMeasurer.measureLines(textObject.$.textFlow, textObject.$.fontFamily, textObject.$.fontSize, this.$.maxWidth);
                // cache measure result for text object
                this.set('measureResult', measureResult);
            }
        },

        getOriginalLine: function (index) {

            if (this.$.measureResult && index > -1) {
                if (index < this.$.measureResult.lines.length) {
                    return this.$.measureResult.lines[index];
                }
            }
            return null;

        },

        _renderMeasureResult: function (measureResult) {

            if (measureResult) {
                var lines = measureResult.lines,
                    line,
                    text,
                    ascent = measureResult.fontMeasure.ascent;

                var group = this.$el;

                var textObject = this.$.textObject.$,
                    textAlign = textObject.textAlign,
                    lineText;

                if (lines.length == 0) {
                    // add empty line
                    lines.push({text: ""});
                }


                var x,
                    y,
                    transform;
                for (var i = 0; i < lines.length; i++) {
                    line = lines[i];
                    lineText = line.text;

                    if (i < group.childNodes.length) {
                        text = group.childNodes[i];
                    } else {
                        text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        text.setAttributeNS("http://www.w3.org/XML/1998/namespace", "space", "preserve");
                        text.setAttribute("fill", textObject.color);
                        text.setAttribute("y", ascent);
                        group.appendChild(text);
                    }

                    if (!lineText) {
                        lineText = EMPTY_LINE_TEXT;
                    }
                    text.textContent = lineText;

                    if (line.soft) {
                        text.setAttribute("data-soft-line", "1");
                    }
                    if (line.charBreak) {
                        text.setAttribute("data-char-break", "1");
                    }

                    y = i * textObject.fontSize * textObject.lineHeight;
                    x = 0;
                    if (textAlign == "center") {
                        x = 0.5 * (this.$.maxWidth - line.width);
                    } else if (textAlign == "right") {
                        x = this.$.maxWidth - line.width;
                    }

                    text.setAttribute("transform", "translate(" + x + "," + y + ")");
                }

                while (group.childNodes.length > lines.length) {
                    group.removeChild(group.childNodes[group.childNodes.length - 1]);
                }


                var height = lines.length * textObject.fontSize * textObject.lineHeight;
                this.trigger('on:heightChanged', {height: height}, this);
            }

        }
    });


});