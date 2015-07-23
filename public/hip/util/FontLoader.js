define(["js/core/Component"], function (Component) {
    var GlobalFontCache = {};

    return Component.inherit({
        defaults: {

        },


        loadFont: function (fontName, src, callback) {
            if (!this.$measurer) {
                this.$measurer = this.$stage.$document.createElement("div");
                this.$measurer.style.visibility = "hidden";
                this.$stage.$el.appendChild(this.$measurer);

            }

            var font = GlobalFontCache[fontName];

            if(!font){
                var text = this.$stage.$document.createelement("div");
                text.textContent = "FontMeasurer";


            }


        }

    })
});