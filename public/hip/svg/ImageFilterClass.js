define(["js/svg/SvgElement"], function (SvgElement) {
    return SvgElement.inherit({
        defaults: {
            tagName: "filter",
            filter: null,
            _contrastSlop: "{convertContrast(filter.contrast)}",
            _brightnessIntercept: "{convertBrightness(filter.brightness)}",
            _blurDeviation: "{convertBlur(filter.blur)}",
            _tintColor: "{filter.getTintRGB()}",
            _tintSlope: 0,
            _tintIntercept: null,
            _hueValue: "{convertHueValue(filter.hue)}"
        },

        $classAttributes: ['filter'],

        saturationMatrix: function (a) {
            a *= a > 0 ? 0.8 : 1;
            if (a) {
                var luR = 0.3086,
                    luG = 0.6094,
                    luB = 0.082,
                    sv = a / 100 + 1,
                    nsv = 1 - sv;

                a = [
                        nsv * luR + sv, nsv * luG, nsv * luB, 0, 0,
                        nsv * luR, nsv * luG + sv, nsv * luB, 0, 0,
                        nsv * luR, nsv * luG, nsv * luB + sv, 0, 0,
                    0, 0, 0, 1, 0
                ];

                return a.join(" ");
            } else {
                return [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0].join(" ");
            }
        },

        _commit_tintColor: function (color) {
            if (color) {

                console.log(color);
//                console.log('%c Color ', 'background: rgb(' + [color.color.r, color.color.g, color.color.b].join(",") + ');');

                var c = (color.$l / 100) / 100;
                var tintSlope = 1 - c;
                var tintIntercepts = {
                    r: color.color.r * c,
                    g: color.color.g * c,
                    b: color.color.b * c
                };

                this.set({
                    _tintSlope: tintSlope,
                    _tintIntercept: tintIntercepts
                });
            }
        },

        convertHueValue: function (hue) {
            return hue * 1.8;
        },

        convertContrast: function (contrast) {
            contrast *= contrast > 0 ? 1.2 : 0.6;
            return contrast == 0 ? 1 : (contrast + 100) / 100;
        },
        convertBrightness: function (brightness) {
            return brightness / 100 * 0.5;
        },

        convertBlur: function (blur) {
            return   0.05 * blur;
        },

        contrastIntercept: function (a) {
            return -(0.5 * a) + 0.5;
        },

        sharpKernelMatrix: function (blur) {
            blur *= -1;
            if (blur == 0) {
                return "";
            } else {
                blur = blur / 100 * 4;
                blur = [0, -blur, 0, -blur, 4 * blur + 1, -blur, 0, -blur, 0];

                return blur.join(" ");
            }
        },

        someFunction: function (a, b, c) {
            0 > c && (c += 1);
            1 < c && --c;
            return c < 1 / 6 ? a + 6 * (b - a) * c : .5 > c ? b : c < 2 / 3 ? a + (b - a) * (2 / 3 - c) * 6 : a
        },

        rSlope: function () {
            return (208 / 255);
        },
        gSlope: function () {
            return (23 / 255);
        },
        bSlope: function () {
            return (135 / 255);
        },

        lt: function (a, b) {
            return a < b;
        },
        gt: function (a, b) {
            return a > b;
        }


    })
});