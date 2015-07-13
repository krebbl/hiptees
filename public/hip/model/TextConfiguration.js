define(["hip/model/Configuration", "js/core/List"], function (Configuration, List) {
    return Configuration.inherit('hip.model.TextConfiguration', {
        defaults: {
            singleLine: false,
            background: null
        }
    })
});