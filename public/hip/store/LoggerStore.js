define(["hip/store/Store", "js/data/Entity", "underscore"], function (Store, Entity, _) {

    return Store.inherit({
        defaults: {
            actionsDone: []
        },
        handlesAction: function (ns, action) {
            return true;
        },
        beforeAll: function (payload, action, ns) {

            var self = this;
            if (!payload.preview) {
                setTimeout(function () {
                    var serializedPayload = {};
                    var value;
                    for (var key in payload) {
                        if (payload.hasOwnProperty(key)) {
                            value = payload[key];
                            if (value instanceof Entity) {
                                if (value.$context) {
                                    value = value.$context.$dataSource.composeModel(value);
                                } else {
                                    value = {};
                                }
                            } else {
                                value = _.clone(value);
                            }

                            serializedPayload[key] = value;
                        }
                    }
                    self.$.actionsDone.push({ns: ns, action: action, payload: serializedPayload});
                }, 1);
            }

        }
    })

});