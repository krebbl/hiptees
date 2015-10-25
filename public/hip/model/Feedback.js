define(["js/data/Model"], function (Model) {
    return Model.inherit('hip.model.Feedback', {
        defaults: {
            text: ""
        },

        schema: {
            text: String
        }
    })
});