define(["js/data/Model", "hip/model/User"], function (Model, User) {
    return Model.inherit("hip.model.RegisterUser", {
        defaults: {

        },
        schema: {
            username: String
        },
        resultType: User
    })
});