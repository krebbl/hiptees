define(["js/svg/Svg"], function (Svg) {

    var NUM_LINES = 12,
        ANIMATION = "1;.85;.7;.65;.55;.45;.35;.25;.15;.1;0;1".split(";");

    return Svg.inherit({
        defaults: {
            componentClass: "ios-loader",
            _lines: []
        },

        ctor: function () {
            this.callBase();


            var lines = [];
            for (var i = 0; i < NUM_LINES; i++) {
                lines.push("" + i);
            }
            this.set('lines', lines);

        },

        animationForIndex: function (i) {
            var ret = [];

            for (var j = 0; j < ANIMATION.length; j++) {
                ret.push(ANIMATION[(j + i) % ANIMATION.length]);
            }

            return ret.join(";");
        },

        rotateForIndex: function (i) {
            return (180 + i * (360 / NUM_LINES)) % 360;
        }
    })
});