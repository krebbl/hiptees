define(["hip/action/ActionDomain"], function (ActionDomain) {

    return ActionDomain.inherit({
        ns: "textFlow",
        actions: {
            deleteText: {
                textFlow: null,
                anchorOffset: null,
                focusOffset: null
            },
            insertText: {
                textFlow: null,
                anchorOffset: null,
                focusOffset: null,
                text: ""
            },
            insertLine: {
                textFlow: null,
                anchorOffset: null,
                focusOffset: null
            },
            selectText: {
                textFlow: null,
                anchorOffset: null,
                focusOffset: null
            },
            changeStyle: {
                leafStyle: null,
                paragraphStyle: null,
                textFlow: null,
                anchorOffset: null,
                focusOffset: null
            }
        }

    });

});