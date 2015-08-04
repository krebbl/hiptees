define(["js/data/Entity", "js/core/List"], function (Entity, List) {
    return Entity.inherit('hip.entity.Configuration', {

        defaults: {
            offset: {
                x: 0,
                y: 0
            },
            size: null,
            movable: true,
            scalable: false
        },
        schema: {
            offset: Object,
            size: {
                type: Object,
                required: false
            },
            type: String
        },

        idField: "id"
    })
});