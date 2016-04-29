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
            toggleEditConfiguration: {
                edit: false
            },
            editTextConfiguration: {
                configuration: null
            },
            editConfiguration: {
                configuration: null
            },
            toggleTextEditing: {
                edit: false
            },
            zoomConfiguration: {
                configuration: null
            },
            changeShapeConfiguration: {
                configuration: null
            },
            applyFilter: {},
            changeOrder: {
                configuration: null,
                move: 0
            },
            undo: {},
            redo: {},
            addText: {
                text: "Text",
                paragraphStyle: null,
                leafStyle: null,
                offset: {
                    x: 0.5,
                    y: 0.2
                },
                size: null
            },
            setText: {
                text: "",
                configuration: null
            },
            addImageFile: {},

            saveProduct: {},
            createSprdProduct: {},
            replaceImageFile: {},
            addShape: {},
            changeProductType: {},
            loadProduct: {},
            selectPreset: {},
            changeProductState: {},
            selectSize: {
                size: null
            }

        }
    })

});