define(["js/ui/View", "hip/util/LetterSpacing"], function (View, LetterSpacing) {

    var fontMeasureCache = {};
    var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    return View.inherit({
        defaults: {
            width: "100px",
            height: "100px",
            overflow: "hidden",
            position: "absolute",
            top: "-50px",
            zIndex: "0"
        },

        measureParagraph: function (paragraph) {
            var pStyle = paragraph.$.style,
                fontSize = pStyle.get("fontSize");

            var measurer = this.$._textContainer.$el;
            this.applyStyle({
                "font-size": fontSize,
                "font-family": pStyle.get('fontFamily')
            }, measurer);

            this.$._tspan.$el.textContent = "";

            this.$.svg.$el.removeChild(measurer);
            this.$.svg.$el.appendChild(measurer);

            var normalTop = measurer.getBoundingClientRect().top;
            measurer.getBBox();


            this.$._tspan.$el.textContent = "ÈÄgqÜ";

            var rect = measurer.getBoundingClientRect();

            var topDiff = normalTop - rect.top;

            var rectHeight = measurer.getBoundingClientRect().height;
            var height = measurer.getBBox().height;

            var ascent = Math.round(height / rectHeight * topDiff);


            return {
                ascent: ascent,
                height: height
            };
        },

        applyStyle: function (style, element) {
            if (style) {
                for (var key in style) {
                    if (style.hasOwnProperty(key)) {
                        element.setAttribute(key, style[key]);
                    }
                }
            }
        },
        /**
         * Composes a text element
         * @param paragraph
         * @param fontMeasure
         * @returns Number
         */
        getWidthForParagraph: function (paragraph, fontMeasure) {
            var text = this.$._textContainer.$el,
                spacing = Math.ceil(paragraph.get('style.letterSpacing')) || 0;

            this.$._tspan.$el.textContent = "";
            text.getBBox();

            this.$.svg.$el.removeChild(text);

            this.$._tspan.$el.textContent = paragraph.text();

            this.applyStyle({
                "font-family": paragraph.get('style.fontFamily'),
                "font-size": paragraph.get('style.fontSize'),
                "letter-spacing": LetterSpacing(spacing)
            }, text);

            this.$._tspan.$el.textContent = paragraph.text();

            this.$.svg.$el.appendChild(text);

            var w = text.getBBox().width;

            if (/Chrome/.test(window.navigator.userAgent)) {
                w -= spacing;
            }

            return w;
        },

        breakParagraph: function (paragraph, width, fontMeasure) {
            var lines = [],
                paragraphLength = paragraph.textLength() - 1;

            if (paragraphLength > 0) {
                var newParagraph;
                var measureWidth = this.getWidthForParagraph(paragraph, fontMeasure),
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
                        if (this.getWidthForParagraph(paragraphSlice, fontMeasure) > width) {
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
                            if (this.getWidthForParagraph(paragraph.shallowCopy(0, i), fontMeasure) < width) {
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
                        width: this.getWidthForParagraph(newParagraph, fontMeasure)
                    });

                    paragraph = paragraph.shallowCopy(splitAt2, paragraph.textLength() - 1);
                    soft = true;

                    measureWidth = this.getWidthForParagraph(paragraph, fontMeasure);
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

        breakTextFlow: function (textFlow, pixelWidth, fontMeasure) {
            var lines = [],
                self = this;
            textFlow.$.children.each(function (child) {
                lines = lines.concat(self.breakParagraph(child, pixelWidth, fontMeasure));
            });

            return lines;
        },


        measureTextFlow: function (textFlow, layout, callback) {

            var firstParagraph = textFlow.getChildAt(0);
            if (firstParagraph) {
                // load font
                var font = firstParagraph.get('style.fontFamily');

                var self = this;
                var maxWidth = layout.maxWidth;

                self.$.svg.set({
                    width: layout.width,
                    height: layout.height,
                    viewBox: layout.viewBox
                });
                this.loadFont(font, function (err) {
                    if (!err) {

                        var fontMeasure = self.measureParagraph(firstParagraph);
                        var lines = self.breakTextFlow(textFlow, maxWidth, fontMeasure);
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

            this.$.svg.fontManager.loadExternalFont(font, "./font/" + font + "." + extension, callback);
        }

    })
})
;