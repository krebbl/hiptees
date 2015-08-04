define(["hip/entity/Configuration", "js/core/List", "text/entity/TextFlow"], function (Configuration, List, TextFlow) {
    return Configuration.inherit('hip.entity.TextConfiguration', {
        defaults: {
            textFlow: null
        },

        schema: {
            textFlow: TextFlow
        }
    })
});