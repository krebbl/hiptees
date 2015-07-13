define(["js/core/Component", "js/core/List"], function (Component, List) {


    return Component.inherit({
        defaults: {
            events: List
        },
        trigger: function (eventType, attributes) {
            attributes = attributes || {};

            attributes._creationTime = new Date().getTime();

            this.$.events.push({
                type: eventType,
                attributes: attributes
            });

            this.callBase(eventType, attributes, this);
        }
    })
})
;