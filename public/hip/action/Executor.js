define(["js/core/Component", "js/core/List"], function (Component, List) {


    return Component.inherit({
        defaults: {
            stores: List
        },

        addStore: function (store) {
            this.$.stores.add(store);
        },
        removeStore: function (store) {
            this.$.stores.remove(store);
        },
        execute: function (ns, action, payload) {
            var stores = this.$.stores;
            stores.each(function (store) {
                if (store.handlesAction(ns, action)) {
                    store.callAction(ns, action, payload);
                }
            });
        }
    });

});