define(["js/data/Entity"], function (Entity) {
    return Entity.inherit('hip.entity.PrintArea',{
        defaults: {
            offset: null,
            size: null,
            resources: null
        },

        schema: {
            size: Object,
            offset: Object
        }
    })
});