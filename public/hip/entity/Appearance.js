define(["js/data/Entity"], function (Entity) {
    return Entity.inherit('hip.entity.Appearance',{
        defaults: {
            name: null,
            color: null,
            resources: null
        },

        schema: {
            name: Object,
            color: String
        }
    })
});