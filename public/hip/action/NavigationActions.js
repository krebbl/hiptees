define(["hip/action/ActionDomain"], function (ActionDomain) {

    return ActionDomain.inherit({
        ns: "navigation",
        actions: {
            showMenu: {
                menu: ""
            }
        }

    });

});