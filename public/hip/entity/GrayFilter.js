define(["hip/entity/Filter"], function (Filter) {

    return Filter.inherit('hip.entity.GrayFilter', {
        // TODO: add validation
        defaults: {
            type: 'gray',
            gray: 0
        }
    })

});