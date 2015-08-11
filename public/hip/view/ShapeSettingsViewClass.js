define(["xaml!hip/view/SettingsView",
    "underscore",
    "hip/entity/ShapeConfiguration",
    "hip/command/ChangeShapeConfiguration",
    "js/type/Color"
], function (SettingsView, _, ShapeConfiguration, ChangeShapeConfiguration, Color) {


    return SettingsView.inherit({

        supportedConfiguration: ShapeConfiguration,

        defaults: {
            _attr: null,
            colorContent: null,
            strokeColor: "{hexToColor(configuration.stroke)}",
            fillColor: "{hexToColor(configuration.fill)}",
            componentClass: "settings-view rect-settings-view"
        },

        ctor: function () {
            this.callBase();
        },

        hexToColor: function (hex) {
            return hex ? Color.fromHexString(hex) : null;
        },

        _updateColor: function (e) {
            var color = e.$.color;
            if (color) {
                this._updateAttribute(this.$._attr, color);
            }
        },

        _updateAttribute: function (attribute, value) {
            var change = {};
            change[attribute] = value;
            this.$.executor.storeAndExecute(new ChangeShapeConfiguration({
                configuration: this.$.configuration,
                change: change
            }));
        },

        _selectColorContent: function (color) {
            this.set('_attr', color);
            this._selectSubContent(this.$.colorContent);
        },

        selectedColor: function (attr) {
            return this.get(attr + "Color")
        }.onChange("strokeColor", "fillColor"),


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