define(["js/data/Entity"], function (Entity) {
    return Entity.inherit("hip.entity.Filter", {
        defaults: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            tint: 0,
            blur: 0,
            vignette: 0,
            hue: 0
        },

        schema: {
            hash: {
                type: String,
                generated: true
            }
        },

        idField: false,

        getTintRGB: function () {
            var a = this.$.tint;
            if (a == 0) {
                return null;
            }
            a += 100 || 0;
            a -= 200 / 7;
            0 > a && (a = 200 + a);
            a = this.hueToRGB(360 * a / 200, 100, 50);
            return {color: {r: a[0], g: a[1], b: a[2]}, $l: 7}

        }.onChange('tint'),

        hueToRGB: function (a, b, c) {
            a /= 360;
            b /= 100;
            c /= 100;
            if (0 == b)
                c = b = a = c;
            else {
                var d = .5 > c ? c * (1 + b) : c + b - c * b, e = 2 * c - d;
                c = this.someFunction(e, d, a + 1 / 3);
                b = this.someFunction(e, d, a);
                a = this.someFunction(e, d, a - 1 / 3)
            }
            return [Math.round(255 * c), Math.round(255 * b), Math.round(255 * a)]
        },

        someFunction: function (a, b, c) {
            0 > c && (c += 1);
            1 < c && --c;
            return c < 1 / 6 ? a + 6 * (b - a) * c : .5 > c ? b : c < 2 / 3 ? a + (b - a) * (2 / 3 - c) * 6 : a
        },
        vignetteOpacity: function () {
            return this.$.vignette * 0.25 / 100 || 0;
        }.onChange('vignette'),

        serialize: function () {
            var attrs = ["brightness", "contrast", "saturation", "tint", "blur", "vignette"],
                str = "";
            for (var i = 0; i < attrs.length; i++) {
                var attr = attrs[i];
                var h = (this.get(attr) + 100).toString(16);
                if (h.length < 2) {
                    h = "0" + h;
                }
                str += h;
            }
            return str;
        },

        deserialize: function (str) {
            var attrs = ["brightness", "contrast", "saturation", "tint", "blur", "vignette"],
                arr = str.match(/.{1,2}/g),
                key,
                val,
                ret = {};

            for (var i = 0; i < attrs.length; i++) {
                key = attrs[i];
                val = parseInt(arr[i], 16) - 100;

                ret[key] = val;
            }
            return ret;

        },

        compose: function () {
            var ret = this.callBase();
            ret.hash = this.serialize();

            return ret;
        },

        parse: function (data) {
            var ret = this.callBase();

            if (ret.hash) {
                ret = this.deserialize(ret.hash);
            }

            return ret;
        }
    })
});