define(["hip/action/ActionDomain"], function (ActionDomain) {

    return ActionDomain.inherit({
        ns: "preset",
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