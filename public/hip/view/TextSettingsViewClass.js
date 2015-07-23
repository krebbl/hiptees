define(["hip/view/SettingsViewClass",
    "json!font/index",
    "underscore",
    "hip/entity/TextConfiguration",
    "hip/command/ChangeTextConfiguration",
    "js/type/Color"
], function (SettingsViewClass, fonts, _, TextConfiguration, ChangeTextConfiguration, Color) {


    return SettingsViewClass.inherit({

        supportedConfiguration: TextConfiguration,

        defaults: {
            color: null,
            componentClass: "settings-view text-settings-view",
            fontFamilies: fonts.fontFamilies,
            alignments: ["left", "center", "right"],
            selectedSubContent: ''
        },

        _commitConfiguration: function (configuration) {

            if (configuration) {
                var c = Color.fromHexString(configuration.$.color);
                this.set('color', c.toHSB());
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
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key: 'fontFamily',
                value: fontFamily.regular
            }));
        },

        _selectAlignment: function (alignment) {
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key: "textAlign",
                value: alignment
            }));
        },
        _increaseLineHeight: function (by) {
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key: "lineHeight",
                value: this.$.configuration.$.lineHeight + by
            }));

        },
        _decreaseLineHeight: function (by) {
            this._increaseLineHeight(-1 * by);
        },

        _increaseFontSize: function (by) {
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key: 'fontSize',
                value: this.$.configuration.$.fontSize + by
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
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key: 'fontSize',
                value: e.$.value
            }));
        },

        _updateLineHeight: function (e) {
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key: "lineHeight",
                value: e.$.value
            }));
        },

        _updateLetterSpacing: function (e) {
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key: "letterSpacing",
                value: e.$.value
            }));
        },

        _updateColor: function (color) {
            if(color){
                this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                    configuration: this.$.configuration,
                    key: "color",
                    value: "#" + color.toHexString()
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
            this.$.color.h = value;

            this._updateColor(this.$.color);
        },

        _updateSaturation: function (value) {
            this.$.color.s = value;
            console.log(value);

            this._updateColor(this.$.color);
        },

        _updateBrightness: function (value) {
            this.$.color.b = value;
            console.log(value);
            this._updateColor(this.$.color);
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