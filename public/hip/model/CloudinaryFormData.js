define(["js/data/Model"], function (Model) {

    var Result = Model.inherit('hip.model.CloudinaryResult', {
        idField: "signature"
    });

    return Model.inherit("hip.model.CloudinaryFormData", {
        defaults: {
            upload_preset: null,
            public_id: null,
            folder: "images"
        },
        schema: {
            upload_preset: String,
            public_id: String,
            folder: String
        },
        idField: false,
        resultType: Result
    })
});