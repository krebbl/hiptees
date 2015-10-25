define(["js/data/Model", "hip/model/User"], function (Model, User) {
    return Model.inherit("hip.model.Session", {
        defaults: {
            auth: null
        },
        schema: {
            auth: Object,
            email: {
                type: String,
                required: false
            },
            user: {
                type: User,
                generated: true
            }
        }
    })
});