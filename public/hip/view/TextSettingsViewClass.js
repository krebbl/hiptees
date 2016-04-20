define(["xaml!hip/view/SettingsView",
    "json!font/index",
    "underscore",
    "hip/entity/TextConfiguration",
    "hip/action/TextFlowActions",
    "text/entity/TextRange",
    "hip/store/TextFlowStore",
    "js/type/Color"
], function (SettingsView, fonts, _, TextConfiguration, TextFlowActions, TextRange, TextFlowStore, Color) {


    return SettingsView.inherit({

        supportedConfiguration: TextConfiguration,

        defaults: {
            color: null,
            strokeColor: null,
            paragraphStyle: null,
            selectedFontFamily: "{_getFontFamily(paragraphStyle.fontFamily)}",
            leafStyle: null,
            componentClass: "settings-view text-settings-view",
            fontFamilies: fonts.fontFamilies,
            alignments: ["left", "center", "right"]
        },

        inject: {
            textFlowStore: TextFlowStore,
            textFlowActions: TextFlowActions
        },

        $classAttributes: ["color", "strokeColor", "strokeWidth"],

        ctor: function () {
            this.callBase();

            this.bind('textFlowStore', 'on:selectionChanged', this._updateLeafStyle, this);
            this.bind('textFlowStore', 'on:paragraphStyleChanged', this._updateParagraphStyle, this);
            this.bind('textFlowStore', 'on:leafStyleChanged', this._updateLeafStyle, this);

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
                var range = configuration.$.textFlow.$.selection || new TextRange({
                        anchorIndex: 0,
                        activeIndex: configuration.$.textFlow.textLength()
                    });
                var leafStyle = range.getCommonLeafStyle(configuration.$.textFlow);
                if (!leafStyle.$.color) {
                    var l = configuration.$.textFlow.getFirstLeaf();
                    leafStyle = l.$.style;
                }
                this.set('color', leafStyle.$.color);
                this.set('strokeColor', leafStyle.$.strokeColor || "#000000");
                this.set('strokeWidth', leafStyle.$.strokeWidth || 0);
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
                    newFont = fontFamily[style] || fontFamily.regular || fontFamily.bold || fontFamily.italic;
                }
            } else {
                var isBold = this.isBold(currentFont),
                    isItalic = this.isItalic(currentFont);

                if (isBold && isItalic) {
                    style = style == "bold" ? "italic" : "bold";
                } else {
                    style = "regular"
                }

                newFont = fontFamily[style] || fontFamily.regular || fontFamily.bold || fontFamily.italic;
            }

            this.$.textFlowActions.changeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    'fontFamily': newFont
                }
            });
        },

        _supportsStyle: function (fontFamily, style) {
            for (var key in fontFamily) {
                if (fontFamily.hasOwnProperty(key)) {
                    if (key.toLowerCase().indexOf(style) > -1) {
                        return true;
                    }
                }
            }
            return false;
        },

        _selectAlignment: function (alignment) {
            this.$.textFlowActions.changeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    "textAlign": alignment
                }
            });
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

        _toggleStroke: function () {
            this._changeLeafStyle("strokeWidth", this.$.strokeWidth === 0 ? 1 : 0);
        },

        _toggleFill: function () {
            this._changeLeafStyle("color", this.$.color === "none" ? "#000000" : "none");
        },

        _changeLeafStyle: function (type, value, preview) {
            var leafStyle = {};
            leafStyle[type] = value;
            this.$.textFlowActions.changeStyle({
                preview: preview,
                textFlow: this.$.configuration.$.textFlow,
                leafStyle
            });
        },

        _updateColor: function (type, e) {
            var color = e.$.color;
            if (color) {
                this._changeLeafStyle(type, color);
            }
        },

        _changeStyle: function (key, value, preview) {
            this.$previewCommand = this.$previewCommand || {};
            var paragraphStyle = {};
            paragraphStyle[key] = value;
            this.$previewCommand = {
                preview: preview,
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: paragraphStyle
            };
            this.$.textFlowActions.changeStyle(this.$previewCommand);
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