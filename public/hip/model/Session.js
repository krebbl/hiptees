define(["js/data/Model"], function (Model) {
    return Model.inherit("hip.model.Session", {
        defaults: {
            auth: null
        },
        schema: {
            auth: Object
        }
    })
});