define(["hip/entity/Configuration", "js/core/List"], function (Configuration, List) {
    return Configuration.inherit('hip.entity.TextConfiguration', {
        defaults: {
            singleLine: false
        }
    })
});