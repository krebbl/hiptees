define(["xaml!hip/svg/ConfigurationViewer"], function (ConfigurationViewer) {
    return ConfigurationViewer.inherit({
        defaults: {
            _minHeight: 3,
            _minWidth: 3
        },

        half: function(a){
            return a * 0.5;
        },
        inner: function (a, b, c) {
            return Math.max(0,a - b * c);
        }
    })
});