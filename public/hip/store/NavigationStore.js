define(["hip/store/Store"], function (Store) {


    return Store.inherit({
        defaults: {
            currentFragment: "presetsView",
            fragmentStack: ["presetsView"]
        },
        ns: "navigation",

        navigate: function (payload) {
            var fragmentStack = this.$.fragmentStack;
            var fragment = payload.fragment;

            if (fragmentStack.length > 0 && fragmentStack[fragmentStack.length - 1] == fragment) {
                return;
            }

            fragmentStack.push(fragment);
            this.set('currentFragment', fragment);
            this.trigger('on:navigate', {fragment: fragment});
        },

        navigateBack: function (payload) {
            var fragmentStack = this.$.fragmentStack;
            var fragment = payload.fragment;

            if (fragmentStack.length > 0) {
                fragmentStack.pop();
                if (fragmentStack.length > 0) {
                    fragment = fragmentStack[fragmentStack.length - 1];
                }
                this.set('currentFragment', fragment);
                this.trigger('on:navigate', {fragment: fragment});
            }
        },

        fragmentIsActive: function (fragment) {
            return fragment === this.$.currentFragment;
        }.onChange('currentFragment')

    });

});