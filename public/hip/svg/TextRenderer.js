define(['js/svg/SvgElement', 'hip/handler/TextFlowHandler', 'xaml!hip/svg/TextMeasurer', 'js/svg/Svg'], function (SvgElement, TextFlowHandler, SvgMeasurer, Svg) {

    var EMPTY_LINE_TEXT = "\n" + String.fromCharCode(173);

    return SvgElement.inherit({
        defaults: {
            tagName: 'g',
            textObject: null,
            measureResult: null,
            maxWidth: 308,
            textColor: "{textObject.color}",
            componentClass: "text-renderer"
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

            this.bind('textObject', 'change:fontFamily', this._updateTextFlow, this);
            this.bind('textObject', 'change:fontSize', this._updateTextFlow, this);
            this.bind('textObject', 'change:lineHeight', this._updateLineHeight, this);
            this.bind('textObject', 'change:letterSpacing', this._updateTextFlow, this);
            this.bind('textObject', 'change:textAlign', this._updateAlignment, this);
        },


        _updateTextFlow: function () {
            this._renderTextObject(this.$.textObject);
        },

        _renderMaxWidth: function (maxWidth, oldMaxWidth) {

            if (maxWidth && this.$.textObject && this.$.measureResult) {
                this._renderTextObject(this.$.textObject);

                this._updateAlignment();
            }

        },

        _renderTextColor: function (textColor) {
            if (textColor) {
                for (var i = 0; i < this.$el.childNodes.length; i++) {
                    var child = this.$el.childNodes[i];
                    child.setAttribute("fill", textColor);
                }
            }
        },

        _updateLineHeight: function () {
            var textObject = this.$.textObject;
            if (this.$.measureResult && textObject) {
                var child, line, transform, y,
                    lines = this.$.measureResult.lines;
                for (var i = 0; i < this.$el.childNodes.length; i++) {
                    child = this.$el.childNodes[i];
                    line = lines[i];

                    transform = child.getAttribute("transform");
                    y = i * textObject.$.fontSize * textObject.$.lineHeight;

                    child.setAttribute("transform", transform.replace(/translate\(([^,]+),[^,]+\)/, "translate($1," + y + ")"));
                }
                var height = (this.$el.childNodes.length - 1) * textObject.$.fontSize * textObject.$.lineHeight + this.$.measureResult.fontMeasure.height;
                this.trigger('on:heightChanged', {height: height}, this);
            }

        },

        _updateAlignment: function () {
            var maxWidth = this.$.maxWidth;
            var textAlign = this.$.textObject.$.textAlign;
            var x,
                transform;
            for (var i = 0; i < this.$el.childNodes.length; i++) {
                var child = this.$el.childNodes[i],
                    line = this.$.measureResult.lines[i];
                transform = child.getAttribute("transform");
                x = 0;
                if (textAlign == "center") {
                    x = 0.5 * (maxWidth - line.width);
                } else if (textAlign == "right") {
                    x = maxWidth - line.width;
                }

                child.setAttribute("transform", transform.replace(/translate\([^,]+,([^,]+)\)/, "translate(" + x + ",$1)"));
            }
        },

        _renderTextObject: function (textObject) {

            if (textObject) {
                if (!this.$fontManager) {
                    var svg = this.getSvgRoot();
                    this.$fontManager = new Svg.FontManager(svg);
                }
                var self = this;

                this.$fontManager.loadExternalFont(textObject.$.fontFamily, "./font/" + textObject.$.fontFamily + ".woff", function () {
                    self.set({
                        "font-family": textObject.$.fontFamily,
                        "font-size": textObject.$.fontSize
                    });
                    var measureResult = self.$.svgMeasurer.measureLines(textObject.$.textFlow, textObject.$.fontFamily, textObject.$.fontSize, textObject.$.letterSpacing, self.$.maxWidth);
                    // cache measure result for text object
                    self.set('measureResult', measureResult);

                });

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
                        group.appendChild(text);
                    }
                    text.setAttribute("y", ascent);

                    if (!lineText) {
                        lineText = EMPTY_LINE_TEXT;
                    }
                    text.textContent = lineText;

                    if (line.soft) {
                        text.setAttribute("data-soft-line", "1");
                    } else {
                        text.removeAttribute("data-soft-line");
                    }
                    if (line.charBreak) {
                        text.setAttribute("data-char-break", "1");
                    } else {
                        text.removeAttribute("data-char-break");
                    }

                    y = i * textObject.fontSize * textObject.lineHeight;
                    x = 0;
                    if (textAlign == "center") {
                        x = 0.5 * (this.$.maxWidth - line.width);
                    } else if (textAlign == "right") {
                        x = this.$.maxWidth - line.width;
                    }
                    text.setAttribute("letter-spacing", textObject.letterSpacing || 0);
                    text.setAttribute("transform", "translate(" + x + "," + y + ")");
                }

                while (group.childNodes.length > lines.length) {
                    group.removeChild(group.childNodes[group.childNodes.length - 1]);
                }


                var height = (lines.length - 1) * textObject.fontSize * textObject.lineHeight + this.$.measureResult.fontMeasure.height;
                this.trigger('on:heightChanged', {height: height}, this);
            }

        }
    });


});