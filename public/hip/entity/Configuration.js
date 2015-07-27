define(["js/data/Entity", "js/core/List"], function (Entity, List) {
    return Entity.inherit('hip.entity.Configuration', {

        defaults: {
            name: null,
            offset: {
                x: 0,
                y: 0
            },
            size: {
                width: 100,
                height: 100
            },
            options: {},
            scale: {
                x: 1.0,
                y: 1.0
            },
            effects: List,
            isMask: false,
            movable: true,
            scalable: false
        },

        draw: function (context, canvas) {


        },
        getFilter: function(){
            return null;
        }
    })
});