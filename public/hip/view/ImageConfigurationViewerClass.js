define(['xaml!hip/view/ConfigurationViewerSvg', 'xaml!hip/view/SvgTextEditor'], function (ConfigurationViewerSvg, SvgTextEditor) {
    return ConfigurationViewerSvg.inherit('sprd.view.ConfigurationViewerSvgClass', {

        defaults: {
            verticalStretchable: true,
            horizontalStretchable: true,
            keepAspectRatio: true
        },

        inject: {
        },

        _preventDefault: function (e) {
            e.preventDefault();

        }



    });


});