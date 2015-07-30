define(["hip/view/SettingsViewClass",
    "json!font/index",
    "underscore",
    "hip/entity/TextConfiguration",
    "hip/command/text/ChangeStyle",
    "text/entity/TextRange",
    "hip/handler/TextFlowHandler",
    "js/type/Color"
], function (SettingsViewClass, fonts, _, TextConfiguration, ChangeStyle, TextRange, TextFlowHandler, Color) {


    return SettingsViewClass.inherit({

        supportedConfiguration: TextConfiguration,

        defaults: {
            leafColor: null,
            paragraphStyle: null,
            leafStyle: null,
            componentClass: "settings-view text-settings-view",
            fontFamilies: fonts.fontFamilies,
            alignments: ["left", "center", "right"],
            selectedSubContent: ''
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
                this.set('leafColor', Color.fromHexString(leafStyle.$.color || '#000000').toHSB());
            }
        },

        _getFontFamily: function (fontFamily) {
            return _.find(this.$.fontFamilies, function (ff) {
                return ff.regular == fontFamily || ff.bold == fontFamily || ff.italic == fontFamily || ff.boldItalic == fontFamily;
            });
        },

        _getFontImageSrc: function (fontFamily) {
            fontFamily = this._getFontFamily(fontFamily);
            return fontFamily ? fontFamily.image : "";
        },

        _selectFont: function (fontFamily) {
            this.$.executor.storeAndExecute(new ChangeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    'fontFamily': fontFamily.regular
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

        _selectSubContent: function (subContent) {
            this.set('selectedSubContent', subContent);
        },

        isSubContentSelected: function (subContent) {
            return this.$.selectedSubContent == subContent;
        }.onChange('selectedSubContent'),

        _decreaseFontSize: function (by) {
            this._increaseFontSize(-1 * by);
        },

        _updateTextSize: function (e) {
            this.$.executor.execute(new ChangeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    'fontSize': e.$.value
                }
            }));
        },

        _updateLineHeight: function (e) {
            this.$.executor.execute(new ChangeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    'lineHeight': e.$.value
                }
            }));
        },

        _updateLetterSpacing: function (e) {
            this.$.executor.execute(new ChangeStyle({
                textFlow: this.$.configuration.$.textFlow,
                paragraphStyle: {
                    'letterSpacing': e.$.value
                }
            }));
        },

        _updateColor: function (color) {
            if (color) {
                this.$.executor.execute(new ChangeStyle({
                    textFlow: this.$.configuration.$.textFlow,
                    leafStyle: {
                        'color': "#" + color.toHexString()
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