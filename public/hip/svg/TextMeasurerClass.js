define(["js/svg/Svg"], function (Svg) {

    var fontMeasureCache = {};
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";


    function applyStyleToElement(style, element) {
        if (style) {
            element.setAttribute("font-family", style.get("fontFamily"));
            element.setAttribute("font-size", style.get("fontSize"));
            element.setAttribute("letter-spacing", style.get("letterSpacing"));
        }
    }

    return Svg.inherit({
        defaults: {
            width: 100,
            height: 100,
            position: "absolute",
            top: 0
        },


        measureFont: function (fontFamily, fontSize, letterSpacing) {
            var cacheKey = (fontFamily + "_" + fontSize);
            if (fontMeasureCache[cacheKey]) {
                return fontMeasureCache[cacheKey];
            }

            this.$._textContainer.$el.setAttribute("font-family", fontFamily);
            this.$._textContainer.$el.setAttribute("font-size", fontSize);
            this.$._textContainer.$el.setAttribute("letter-spacing", letterSpacing || 0);


            var measurer = this.$._textContainer.$el;

            measurer.textContent = "";

            var normalTop = this.$el.getBoundingClientRect().top;

            measurer.textContent = "ÈÄgq";

            var rect = measurer.getBoundingClientRect();

            var ascent = normalTop - rect.top;

            var ret = {
                ascent: ascent,
                descent: rect.height - ascent,
                height: rect.height
            };

            fontMeasureCache[cacheKey] = ret;

            return ret;
        },

        measureParagraph: function (paragraph) {
//            var cacheKey = (fontFamily + "_" + fontSize);
//            if (fontMeasureCache[cacheKey]) {
//                return fontMeasureCache[cacheKey];
//            }

            applyStyleToElement(paragraph.$.style, this.$._textContainer.$el);

            var measurer = this.$._textContainer.$el;

            measurer.textContent = "";

            var normalTop = this.$el.getBoundingClientRect().top;

            measurer.textContent = "ÈÄgq";

            var rect = measurer.getBoundingClientRect();

            var ascent = normalTop - rect.top;

            var ret = {
                ascent: ascent,
                descent: rect.height - ascent,
                height: rect.height
            };

//            fontMeasureCache[cacheKey] = ret;

            return ret;


        },

        setUpMeasurer: function (fontFamily, fontSize, letterSpacing) {
            if (!this.isRendered()) {
                this.$stage.$document.body.appendChild(this.render());
            }

            this.$._textContainer.$el.setAttribute("font-family", fontFamily);
            this.$._textContainer.$el.setAttribute("font-size", fontSize);
            this.$._textContainer.$el.setAttribute("letter-spacing", letterSpacing || 0);
        },

        breakLines: function (lines, width) {
            var brokenLines = [],
                line;

            for (var i = 0; i < lines.length; i++) {
                line = lines[i];
                brokenLines = brokenLines.concat(this.breakLine(line, width));
            }

            return brokenLines;
        },

        breakLine: function (line, width) {
            console.log(width);

            var lines = [];

            if (line.length > 0) {
                var text;
                var measureWidth = this.getWidthForText(line),
                    soft = false;

                while (line.length > 1 && measureWidth > width) {
                    var splitAt = line.length - 1,
                        splitAt2,
                        charBreak;

                    var words = line.split(" "),
                        i = 0,
                        sentence = "",
                        wordCursor = 0,
                        fittingCursor = 0;

                    for (i = 0; i < words.length; i++) {
                        sentence += words[i] + " ";
                        fittingCursor = wordCursor;
                        wordCursor += words[i].length + 1;
                        if (this.getWidthForText(sentence) > width) {
                            break;
                        }

                    }

                    if (fittingCursor > 0) {
                        splitAt = fittingCursor - 1;
                        splitAt2 = splitAt + 1;
                        charBreak = false;
                    } else {
                        for (i = 0; i < splitAt - 1; i++) {
                            if (this.getWidthForText(line.substr(0, splitAt - i)) < width) {
                                break;
                            }
                        }
                        splitAt -= i;
                        splitAt2 = splitAt;
                        charBreak = true
                    }

                    text = line.substr(0, splitAt);

                    console.log(text, this.getWidthForText(text));

                    lines.push({
                        charBreak: charBreak,
                        soft: true,
                        text: text,
                        width: this.getWidthForText(text)
                    });

                    line = line.substr(splitAt2);
                    soft = true;

                    measureWidth = this.getWidthForText(line);
                }

                if (line.length > 0) {
                    lines.push({
                        charBreak: false,
                        soft: soft,
                        text: line,
                        width: measureWidth
                    });
                }
            } else {
                lines.push({
                    charBreak: false,
                    soft: false,
                    text: line,
                    width: 0
                })
            }

            return lines;

        },

        getWidthForText: function (text) {
            this.$._textContainer.$el.textContent = text;
            return this.$._textContainer.$el.getBoundingClientRect().width;
        },
        /**
         * Composes a text element
         * @param paragraph
         * @returns Number
         */
        getWidthForParagraph: function (paragraph) {
            var children = paragraph.$.children,
                child,
                childStyle,
                tspan,
                text;

            while (this.$._textContainer.$el.childNodes.length) {
                this.$._textContainer.$el.removeChild(this.$._textContainer.$el.childNodes[0]);
            }

            text = this.$._textContainer.$el;

            applyStyleToElement(paragraph.$.style, text);

            text.textContent = paragraph.text();


            // TODO: if its necessary to have layout options on tspans
//            for (var i = 0; i < children.length; i++) {
//                child = children.at(i);
//                childStyle = child.$.style;
//
//                tspan = document.createElementNS(SVG_NAMESPACE, "tspan");
//                tspan.textContent = child.getText();
//
////                applyStyleToElement(childStyle, tspan);
//
//                text.appendChild(tspan);
//            }

            return text.getBoundingClientRect().width;
        },

        breakParagraph: function (paragraph, width) {
            var lines = [],
                paragraphLength = paragraph.textLength() - 1;

            if (paragraphLength > 0) {
                var newParagraph;
                var measureWidth = this.getWidthForParagraph(paragraph),
                    soft = false;

                while (width != null && paragraphLength > 1 && measureWidth > width) {
                    var splitAt = paragraphLength,
                        splitAt2,
                        charBreak;

                    var words = paragraph.text().split(" "),
                        i = 0,
                        paragraphSlice = null,
                        wordCursor = 0,
                        fittingCursor = 0;

                    for (i = 0; i < words.length; i++) {
                        fittingCursor = wordCursor;
                        wordCursor += words[i].length + 1;
                        paragraphSlice = paragraph.shallowCopy(0, wordCursor);
                        if (this.getWidthForParagraph(paragraphSlice) > width) {
                            break;
                        }
                    }

                    if (fittingCursor > 0) {
                        splitAt = fittingCursor - 1;
                        splitAt2 = splitAt + 1;
                        charBreak = false;
                    } else {
                        var start = 0,
                            stop = splitAt,
                            tries = 0;
                        while (stop - 1 > start) {
                            tries++;
                            i = start + Math.round((stop - start) / 2);
                            if (this.getWidthForParagraph(paragraph.shallowCopy(0, i)) < width) {
                                start = i;
                            } else {
                                stop = i;
                            }
                        }

                        splitAt = Math.max(1, start);
                        splitAt2 = splitAt;
                        charBreak = true
                    }

                    newParagraph = paragraph.shallowCopy(0, splitAt);

                    lines.push({
                        charBreak: charBreak,
                        soft: true,
                        paragraph: newParagraph,
                        width: this.getWidthForParagraph(newParagraph)
                    });

                    paragraph = paragraph.shallowCopy(splitAt2, paragraph.textLength() - 1);
                    soft = true;

                    measureWidth = this.getWidthForParagraph(paragraph);
                    paragraphLength = paragraph.textLength() - 1;
                }

                if (paragraphLength > 0) {
                    lines.push({
                        charBreak: false,
                        soft: soft,
                        paragraph: paragraph,
                        width: measureWidth
                    });
                }
            } else {
                lines.push({
                    charBreak: false,
                    soft: false,
                    paragraph: paragraph,
                    width: 0
                })
            }

            return lines;


        },

        breakTextFlow: function (textFlow, pixelWidth) {
            var lines = [],
                self = this;
            textFlow.$.children.each(function (child) {
                lines = lines.concat(self.breakParagraph(child, pixelWidth));
            });

            return lines;
        },


        measureTextFlow: function (textFlow, maxWidth, callback) {

            var firstParagraph = textFlow.getChildAt(0);
            if (firstParagraph) {
                // load font
                var font = firstParagraph.get('style.fontFamily');

                var self = this;


                this.loadFont(font, function (err) {
                    if (!err) {
                        var fontMeasure = self.measureParagraph(firstParagraph);
                        var lines = self.breakTextFlow(textFlow, maxWidth);
                        if (maxWidth == null) {
                            for (var i = 0; i < lines.length; i++) {
                                var line = lines[i];
                                maxWidth = Math.max(maxWidth || 0, line.width);
                            }
                        }
                    }


                    callback && callback(err, {
                        fontMeasure: fontMeasure,
                        lines: lines,
                        maxWidth: maxWidth
                    })
                });
            } else {
                callback && callback(null, {
                    fontMeasure: null,
                    lines: []
                })
            }

        },

        loadFont: function (font, callback) {
            if (!this.isRendered()) {
                this.$stage.$document.body.appendChild(this.render());
            }

            var extension = "ttf";
            if (this.$stage.$browser.isIOS) {
                extension = "woff";
            }

            this.fontManager.loadExternalFont(font, "./font/" + font + "." + extension, callback)
        }

    })
});