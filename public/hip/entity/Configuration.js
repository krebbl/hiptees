define(["js/data/Entity", "js/core/List"], function (Entity, List) {
    return Entity.inherit('hip.entity.Configuration', {

        defaults: {
            name: null,
            offset: {
                x: 0,
                y: 0
            },
            size: null,
            options: {},
            scale: {
                x: 1.0,
                y: 1.0
            },
            isMask: false,
            movable: true,
            scalable: false
        }
    })
});