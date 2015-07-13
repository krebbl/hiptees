define(["hip/model/Configuration", "js/core/List", "hip/view/TextConfigurationRenderer"], function (Configuration, List, TextConfigurationRenderer) {
    return Configuration.inherit('hip.model.TextConfiguration', {
        defaults: {
            singleLine: false,
            background: null
        },
        renderFactory: TextConfigurationRenderer
    })
});