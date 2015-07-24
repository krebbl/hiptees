define(["js/svg/Svg"], function (Svg) {

    var fontMeasureCache = {};

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


        measureLines: function (lines, fontFamily, fontSize, letterSpacing, pixelWidth) {
            this.setUpMeasurer(fontFamily, fontSize, letterSpacing);

            var fontMeasure = this.measureFont(fontFamily, fontSize, letterSpacing);

            if (!(lines instanceof Array)) {
                lines = [lines];
            }

            var brokenLines = this.breakLines(lines, pixelWidth);


            return {
                fontMeasure: fontMeasure,
                lines: brokenLines
            }

        }

    })
});