define(["hip/action/ActionDomain"], function (ActionDomain) {

    var undefined;

    return ActionDomain.inherit({
        ns: "product",

        actions: {
            removeConfiguration: {
                configuration: null
            },
            moveConfiguration: {},
            cloneConfiguration: {},
            selectConfiguration: {
                configuration: null
            },
            editTextConfiguration: {},
            applyFilter: {},
            pointDownConfiguration: {},
            changeOrder: {},

            addText: {},
            addImageFile: {},

            saveProduct: {},
            replaceImageFile: {},
            addShape: {},
            changeProductType: {},
            loadProduct: {},
            changeProductState: {}

        }
    })

});