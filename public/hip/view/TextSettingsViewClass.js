define(["hip/view/SettingsViewClass",
    "hip/command/ChangeTextAlignment",
    "hip/command/ChangeFontFamily",
    "hip/command/ChangeLineHeight",
    "hip/command/ChangeFontSize"], function (SettingsViewClass, ChangeTextAlignment, ChangeFontFamily, ChangeLineHeight, ChangeFontSize) {


    return SettingsViewClass.inherit({
        defaults: {
            fonts: ["Arial", 'Verdana', 'bikoblack', 'denseregular', 'Times', 'Amatic SC'],
            alignments: ["left", "center", "right"]
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

        _decreaseFontSize: function (by) {
            this._increaseFontSize(-1 * by);
        }
    })
});