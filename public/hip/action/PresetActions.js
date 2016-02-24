define(["hip/action/ActionDomain"], function (ActionDomain) {

    return ActionDomain.inherit({
        ns: "presets",
        actions: {
            selectDepartment: {
                department: null
            },
            selectAppearance: {
                appearance: null
            }
        }
    })

});