define(["xaml!hip/view/SettingsView",
    "underscore",
    "hip/entity/ShapeConfiguration",
    "js/type/Color"
], function (SettingsView, _, ShapeConfiguration, Color) {


    return SettingsView.inherit({

        supportedConfiguration: ShapeConfiguration,

        defaults: {
            _attr: null,
            colorContent: null,
            strokeColor: "{configuration.stroke}",
            fillColor: "{configuration.fill}",
            componentClass: "settings-view rect-settings-view"
        },

        ctor: function () {
            this.callBase();
        },

        hexToColor: function (hex) {
            return hex ? Color.fromHexString(hex) : null;
        },

        _updateColor: function (e, attr) {
            var color = e.$.color;
            if (color) {
                this._updateAttribute(attr, color, false);
            }
        },

        _updateAttribute: function (attribute, value, preview) {
            var change = {};
            change[attribute] = value;
            this.$.productActions.changeShapeConfiguration({
                configuration: this.$.configuration,
                change: change,
                preview: preview
            });
        },

        _selectColorContent: function (color) {
            this.set('_attr', color);
            this._selectSubContent(this.$.colorContent);
        },

        selectedColor: function (attr) {
            return this.get(attr + "Color")
        }.onChange("strokeColor", "fillColor"),

        _toggleFill: function (opacity) {
            this._updateAttribute("fillOpacity", this.$.configuration.$.fillOpacity ? 0 : 1);
        },

        _toggleStroke: function () {
            this._updateAttribute("strokeWidth", this.$.configuration.$.strokeWidth > 0 ? 0 : 2);
        },

        gt: function (x, y) {
            return x > y;
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