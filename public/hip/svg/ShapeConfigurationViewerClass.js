define(["xaml!hip/svg/ConfigurationViewer"], function (ConfigurationViewer) {
    return ConfigurationViewer.inherit({
        defaults: {

        },

        half: function(a){
            return a * 0.5;
        },
        inner: function (a, b, c) {
            return Math.max(0,a - b * c);
        }
    })
});