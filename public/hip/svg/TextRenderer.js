define(['js/svg/SvgElement', 'hip/handler/TextFlowHandler', 'xaml!hip/svg/TextMeasurer', 'js/svg/Svg', "hip/handler/TextConfigurationHandler"], function (SvgElement, TextFlowHandler, SvgMeasurer, Svg, TextConfigurationHandler) {

    var EMPTY_LINE_TEXT = "\n" + String.fromCharCode(173);
    var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";

    return SvgElement.inherit({
        defaults: {
            tagName: 'g',
            textFlow: null,
            measureResult: null,
            maxWidth: null,
            componentClass: "text-renderer"
        },

        $classAttributes: ['textFlow', 'maxWidth', 'measureResult'],

        events: ["on:sizeChanged", "on:textflowRendered"],

        inject: {
            textFlowHandler: TextFlowHandler,
            svgMeasurer: SvgMeasurer
        },

        ctor: function () {
            this.callBase();

            var self = this;
            this.bind('textFlowHandler', 'on:changeTextFlow', function (e) {
                if (e.$.textFlow === this.$.textFlow) {
                    this._renderTextFlow(e.$.textFlow);
                }
            }, this);

            this.bind('textFlowHandler', 'on:paragraphStyleChanged', function (e) {
                if (e.$.textFlow === this.$.textFlow) {
                    if (this._hasSome(e.$.paragraphStyle, ["fontFamily", "fontSize", "letterSpacing"])) {
                        this._updateTextFlow();
                    }
                    if (e.$.paragraphStyle.lineHeight != null) {
                        this._updateLineHeight();
                    }
                    if (e.$.paragraphStyle.textAlign != null) {
                        this._updateAlignment();
                    }
                }
            }, this);

            this.bind('textFlowHandler', 'on:leafStyleChanged', function (e) {
                if (e.$.textFlow === this.$.textFlow) {
                    this._updateTextFlow();
                }

            }, this);
        },


        _updateTextFlow: function () {
            this._renderTextFlow(this.$.textFlow);
        },

        _renderMaxWidth: function (maxWidth, oldMaxWidth) {

            if (maxWidth && this.$.textFlow && this.$.measureResult) {
                this._renderTextFlow(this.$.textFlow);

                this._updateAlignment();
            }

        },

        _updateLineHeight: function () {
            var textFlow = this.$.textFlow;
            if (this.$.measureResult && textFlow) {
                var child, line, transform, y,
                    firstParagraph = textFlow.getChildAt(0),
                    style = firstParagraph.$.style,
                    lines = this.$.measureResult.lines,
                    fontSize = style.$.fontSize,
                    lineHeight = style.$.lineHeight;
                var measureHeight = this.$.measureResult.fontMeasure.height;
                for (var i = 0; i < this.$el.childNodes.length; i++) {
                    child = this.$el.childNodes[i];
                    line = lines[i];

                    transform = child.getAttribute("transform");
                    y = i * measureHeight * lineHeight;

                    child.setAttribute("transform", transform.replace(/translate\(([^,]+),[^,]+\)/, "translate($1," + y + ")"));
                }
                var height = (this.$el.childNodes.length - 1) * measureHeight * lineHeight + measureHeight;
                this.trigger('on:sizeChanged', {height: height, width: this.$.maxWidth || this.$.measureResult.maxWidth}, this);
            }

        },

        _updateAlignment: function () {
            var textAlign = this.$.textFlow.getChildAt(0).get('style.textAlign'),
                measureResult = this.$.measureResult,
                maxWidth = this.$.maxWidth || measureResult.maxWidth,
                child,
                line,
                x,
                transform;
            for (var i = 0; i < this.$el.childNodes.length; i++) {
                child = this.$el.childNodes[i];
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

        _renderTextFlow: function (textFlow) {

            if (textFlow) {
                var self = this;
                var root = this.getSvgRoot();
                this.$.svgMeasurer.measureTextFlow(textFlow, {maxWidth: this.$.maxWidth, viewBox: root.$.viewBox, width: root.$.width, height: root.$.height}, function (err, result) {
                    if (!err) {


                        self.set('measureResult', result, {force: true});
                    }
                });
            }
        },

        _measureTextFlow: function (textFlow, maxWidth) {

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
                    ascent = measureResult.fontMeasure.ascent,
                    maxWidth = this.$.maxWidth || measureResult.maxWidth,
                    group = this.$el,
                    lineText,
                    x,
                    y,
                    transform,
                    leaf, tspan,
                    textAnchor,
                    style;


                for (var i = 0; i < lines.length; i++) {
                    line = lines[i];
                    if (i < group.childNodes.length) {
                        text = group.childNodes[i];
                    } else {
                        text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        text.setAttributeNS(XML_NAMESPACE, "space", "preserve");
                        text.setAttribute("text-rendering", "optimizeSpeed");
//                        text.style.textRendering = "geometricPrecision";
//                        text.setAttribute("text-rendering", );
//                        text.setAttributeNodeNS(s) = "needsclick";

                        group.appendChild(text);
                    }
                    text.setAttribute("y", ascent);
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

                    for (var j = 0; j < line.paragraph.$.children.length; j++) {
                        leaf = line.paragraph.$.children.at(j);
                        if (j < text.childNodes.length) {
                            tspan = text.childNodes[j];
                        } else {
                            tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                            tspan.setAttributeNS(XML_NAMESPACE, "space", "preserve");


                            text.appendChild(tspan);
                        }
                        lineText = leaf.text();

                        var color = leaf.get('style.color');
                        if (color) {
                            tspan.setAttribute("fill", color);
                        } else {
                            tspan.removeAttribute("fill");
                        }
                        if (!lineText && line.paragraph.$.children.length == 1) {
                            lineText = EMPTY_LINE_TEXT;
                        }
                        tspan.textContent = lineText;
                    }


                    while (text.childNodes.length > line.paragraph.$.children.length) {
                        text.removeChild(text.childNodes[text.childNodes.length - 1]);
                    }

                    style = line.paragraph.$.style;
                    y = i * measureResult.fontMeasure.height * style.$.lineHeight;
                    x = 0;
                    textAnchor = style.$.textAlign;


                    text.setAttribute("font-size", style.$.fontSize);
                    text.setAttribute("font-family", style.$.fontFamily);
                    text.setAttribute("letter-spacing", Math.ceil(style.$.letterSpacing) + "");

                    if (textAnchor == "center") {
                        x = 0.5 * (maxWidth - line.width);
                    } else if (textAnchor == "right") {
                        x = maxWidth - line.width;
                    }
                    text.setAttribute("transform", "translate(" + x + "," + y + ")");
                }

                while (group.childNodes.length > lines.length) {
                    group.removeChild(group.childNodes[group.childNodes.length - 1]);
                }

//                text = document.createElementNS("http://www.w3.org/2000/svg", "text");
//                text.textContent = maxWidth;
//                group.appendChild(text);

                var height = (lines.length - 1) * measureResult.fontMeasure.height * style.$.lineHeight + this.$.measureResult.fontMeasure.height;
                this.trigger('on:sizeChanged', {height: height, width: maxWidth, textAlign: textAnchor}, this);
            }

        }
    });


});