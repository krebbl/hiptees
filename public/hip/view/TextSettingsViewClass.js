define(["hip/view/SettingsViewClass",
    "hip/command/ChangeTextAlignment",
    "hip/command/ChangeFontFamily",
    "hip/command/ChangeLineHeight",
    "hip/command/ChangeFontSize"], function (SettingsViewClass, ChangeTextAlignment, ChangeFontFamily, ChangeLineHeight, ChangeFontSize) {


    return SettingsViewClass.inherit({
        defaults: {
            componentClass: "settings-view text-settings-view",
            fonts: ["Arial", 'Verdana', 'bikoblack', 'denseregular', 'Times', 'Amatic SC'],
            alignments: ["left", "center", "right"],
            selectedSubContent: ''
        },

        _selectFont: function (fontFamily) {
            this.$.executor.storeAndExecute(new ChangeFontFamily({
                configuration: this.$.configuration,
                fontFamily: fontFamily
            }));
        },

        _selectAlignment: function (alignment) {
            this.$.executor.storeAndExecute(new ChangeTextAlignment({
                configuration: this.$.configuration,
                alignment: alignment
            }));
        },
        _increaseLineHeight: function (by) {
            this.$.executor.storeAndExecute(new ChangeLineHeight({
                configuration: this.$.configuration,
                lineHeight: this.$.configuration.$.lineHeight + by
            }));

        },
        _decreaseLineHeight: function (by) {
            this._increaseLineHeight(-1 * by);
        },

        _increaseFontSize: function (by) {
            this.$.executor.storeAndExecute(new ChangeFontSize({
                configuration: this.$.configuration,
                fontSize: this.$.configuration.$.fontSize + by
            }));
        },

        _selectSubContent: function(subContent){
            this.set('selectedSubContent', subContent);
        },

        isSubContentSelected: function(subContent){
            return this.$.selectedSubContent == subContent;
        }.onChange('selectedSubContent'),

        _decreaseFontSize: function (by) {
            this._increaseFontSize(-1 * by);
        },
        format: function(n){
            if(n){
                var r = String(n);
                var s = r.split(".");
                if(s.length > 1){
                    s[1] = s[1].substr(0,1);
                }
                return s.join(".");
            }

            return "";

        }
    })
});