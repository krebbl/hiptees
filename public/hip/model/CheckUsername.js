define(["js/data/Model"], function (Model) {

    var Result = Model.inherit('hip.model.CheckUsernameResult', {
        schema: {

        },
        idField: "username"
    });

    return Model.inherit("hip.model.CheckUsername", {
        defaults: {},
        schema: {
            username: String
        },
        resultType: Result
    })
});