define(["hip/view/SettingsViewClass",
    "json!font/index",
    "underscore",
    "hip/entity/TextConfiguration",
    "hip/command/ChangeTextConfiguration"], function (SettingsViewClass, fonts, _, TextConfiguration, ChangeTextConfiguration) {


    return SettingsViewClass.inherit({

        supportedConfiguration: TextConfiguration,

        defaults: {
            componentClass: "settings-view text-settings-view",
            fontFamilies: fonts.fontFamilies,
            alignments: ["left", "center", "right"],
            selectedSubContent: ''
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

        _updateLetterSpacing: function(e){
            this.$.executor.storeAndExecute(new ChangeTextConfiguration({
                configuration: this.$.configuration,
                key : "letterSpacing",
                value: e.$.value
            }));
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
        stopPropagation: function (e) {
            e.stopPropagation();
        }
    })
});