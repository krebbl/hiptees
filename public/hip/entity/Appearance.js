define(["js/data/Entity"], function (Entity) {
    return Entity.inherit('hip.entity.Appearance', {
        defaults: {
            name: null,
            color: null
        },

        schema: {
            name: Object,
            color: String,
            resources: Object
        }
    })
});