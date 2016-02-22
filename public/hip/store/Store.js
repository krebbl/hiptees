define(["js/core/Component"], function (Component) {


    return Component.inherit({
        ns: "",
        handlesAction: function (ns, action) {
            return !!this.ns === ns && this[action] instanceof Function;
        },
        callAction: function (ns, action, payload) {
            if (this.beforeAll) {
                this.beforeAll.call(this, payload);
            }
            this[action].call(this, payload);
            if (this.afterAll) {
                this.afterAll.call(this, payload);
            }

        }
    });


});