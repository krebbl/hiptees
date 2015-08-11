define(["xaml!hip/view/SettingsView",
    "json!font/index",
    "underscore",
    "hip/entity/TextConfiguration",
    "hip/command/text/ChangeStyle",
    "text/entity/TextRange",
    "hip/handler/TextFlowHandler",
    "js/type/Color"
], function (SettingsView, fonts, _, TextConfiguration, ChangeStyle, TextRange, TextFlowHandler, Color) {


    return SettingsView.inherit({

        supportedConfiguration: TextConfiguration,

        defaults: {
            leafColor: null,
            paragraphStyle: null,
            selectedFontFamily: "{_getFontFamily(paragraphStyle.fontFamily)}",
            leafStyle: null,
            componentClass: "settings-view text-settings-view",
            fontFamilies: fonts.fontFamilies,
            alignments: ["left", "center", "right"]
        },

        inject: {
            textFlowHandler: TextFlowHandler
        },

        ctor: function () {
            this.callBase();

            this.bind('textFlowHandler', 'on:selectionChanged', this._updateLeafStyle, this);
            this.bind('textFlowHandler', 'on:paragraphStyleChanged', this._updateParagraphStyle, this);
            this.bind('textFlowHandler', 'on:leafStyleChanged', this._updateLeafStyle, this);

        },

        _commitConfiguration: function (configuration) {
            this._updateParagraphStyle();
            this._updateLeafStyle();
        },

        _updateParagraphStyle: function () {
            var configuration = this.$.configuration;
            if (configuration) {
                var range = new TextRange({anchorIndex: 0, activeIndex: configuration.$.textFlow.textLength()});
                var paragraphStyle = range.getCommonParagraphStyle(configuration.$.textFlow);
                this.set('paragraphStyle', paragraphStyle);
            }
        },

        _updateLeafStyle: function () {
            var configuration = this.$.configuration;
            if (configuration) {
                var range = configuration.$.textFlow.$.selection || new TextRange({anchorIndex: 0, activeIndex: configuration.$.textFlow.textLength()});
                var leafStyle = range.getCommonLeafStyle(configuration.$.textFlow);
                if (!leafStyle.$.color) {
                    var l = configuration.$.textFlow.getFirstLeaf();
                    leafStyle = l.$.style;
                }
                this.set('leafColor', Color.fromHexString(leafStyle.$.color || '#000000'));
            }
        },

        _getFontFamily: function (fontFamily) {
            return _.find(this.$.fontFamilies, function (ff) {
                return ff.regular == fontFamily || ff.bold == fontFamily || ff.italic == fontFamily || ff.boldItalic == fontFamily;
            });
        },

        _fontFamilySupportsStyle: function (fontFamily, style) {
            return _.find(this.$.fontFamilies, function (ff) {
                return ff.regular == fontFamily || ff.bold == fontFamily || ff.italic == fontFamily || ff.boldItalic == fontFamily;
            });
        },

        _getFontImageSrc: function (fontFamily) {
            fontFamily = this._getFontFamily(fontFamily);
            return fontFamily ? fontFamily.image : "";
        },

        _selectFont: function (fontFamily, style, selected) {
            var currentFont = this.$.paragraphStyle.$.fontFamily,
                newFont;

            if (!selected) {
                if ((this.isBold(currentFont) && style == "italic" || this.isItalic(currentFont) && style == "bold")) {
                    newFont = fontFamily.boldItalic || fontFamily[style];
                } else {
                    newFont = fontFamily[style] || fontFamily.regular;
                }
            } else {
                var isBold = this.isBold(currentFont),
                    isItalic = this.isItalic(currentFont);

                if (isBold && isItalic) {
                    style = style == "bold" ? "italic" : "bold";
                } else {
                    style = "regular"
                }

                newFont = fontFamily[style] || fontFamily.regular;
            }

            this.$.executor.storeAndExecute(new ChangeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    'fontFamily': newFont
                }
            }));
        },

        _selectAlignment: function (alignment) {
            this.$.executor.storeAndExecute(new ChangeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    "textAlign": alignment
                }
            }));
        },

        isBold: function (fontFamilyName) {
            return fontFamilyName ? /bold/ig.test(fontFamilyName) : false;
        },

        isItalic: function (fontFamilyName) {
            return fontFamilyName ? /italic/ig.test(fontFamilyName) : false;
        },

        _decreaseFontSize: function (by) {
            this._increaseFontSize(-1 * by);
        },

        _previewStyle: function (key, value) {
            this.$previewCommand = this.$previewCommand || new ChangeStyle();
            var paragraphStyle = {};
            paragraphStyle[key] = value;
            this.$previewCommand.set({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: paragraphStyle
            });
            this.$.executor.execute(this.$previewCommand);
        },

        _updateColor: function (e) {
            var color = e.$.color;
            if (color) {
                this.$.executor.execute(new ChangeStyle({
                    textFlow: this.$.configuration.$.textFlow,
                    leafStyle: {
                        'color': color
                    }
                }));
            }
        },


        format: function (n) {
            if (n != null) {
                var r = String(n);
                var s = r.split(".");
                if (s.length > 1) {
                    s[1] = s[1].substr(0, 1);
                }
                return s.join(".");
            }

            return "";

        },

        _updateHue: function (value) {
            this.$.leafColor.h = value;

            this._updateColor(this.$.leafColor);
        },

        _updateSaturation: function (value) {
            this.$.leafColor.s = value;

            this._updateColor(this.$.leafColor);
        },

        _updateBrightness: function (value) {
            this.$.leafColor.b = value;
            this._updateColor(this.$.leafColor);
        },


        hues: function () {
            var hues = [];
            for (var i = 0; i <= 360; i += 360 / 30) {
                hues.push(i);
            }

            return hues;
        },

        saturations: function () {
            var saturations = [];
            for (var i = 10; i <= 100; i += 100 / 20) {
                saturations.push(i);
            }

            return saturations;
        },

        divide: function (a, b) {
            return a / b;
        },

        color: function (hue, saturation) {
            var c = new Color.HSB(hue, saturation, 100);

            return c.toHexString();
        },

        stopPropagation: function (e) {
            e.stopPropagation();
        }
    })
});