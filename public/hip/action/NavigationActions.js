define(["hip/action/ActionDomain"], function (ActionDomain) {

    return ActionDomain.inherit({
        ns: "navigation",
        actions: {
            navigate: {
                fragment: ""
            },
            navigateBack: {}
        }

    });

});