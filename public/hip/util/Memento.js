define(["js/core/Component"], function (Component) {


    return Component.inherit({
        defaults: {
            states: [],
            maxSize: 10,
            needle: -1
        },

        replaceState: function (state, index) {
            this.$.states.splice(index, 1, state);
        },

        getUndoState: function () {
            if (this.$.needle > 0) {
                this.set('needle', this.$.needle - 1);
                return this.$.states[this.$.needle];
            }
        },

        getRedoState: function () {
            if (this.$.needle < this.$.states.length - 1) {
                this.set('needle', this.$.needle + 1);

                return this.$.states[this.$.needle];
            }
        },

        hasRedoState: function () {
            return this.$.needle < this.$.states.length - 1;
        }.onChange("needle"),

        hasUndoState: function () {
            return this.$.needle > 0;
        }.onChange("needle"),

        replaceLastState: function (state) {
            this.$.states.pop();
            this.$.states.push(state)
        },

        saveState: function (state) {
            this.$.states.splice(this.$.needle + 1);
            this.$.states.push(state);
            if (this.$.states.length > this.$.maxSize) {
                this.$.states.shift();
            }
            this.set('needle', this.$.states.length - 1);
        },

        clear: function () {
            this.set({
                'needle': -1,
                'states': []
            });
        }

    });
});