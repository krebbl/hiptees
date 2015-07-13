define(["js/data/Model", "js/core/List"], function (Model, List) {
    return Model.inherit('hip.model.Configuration', {

        defaults: {
            name: null,
            offset: {
                x: 0,
                y: 0
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