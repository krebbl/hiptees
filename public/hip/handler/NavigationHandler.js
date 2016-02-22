define(["hip/handler/CommandHandler", "hip/command/Navigate", "hip/command/NavigateBack"], function (Handler, Navigate, NavigateBack) {
    return Handler.inherit({
        defaults: {
            currentView: null,
            router: null,
            fragmentStack: []
        },
        isResponsibleForCommand: function (command) {
            return command instanceof Navigate;
        },
        handleCommand: function (command) {
            var fragmentStack = this.$.fragmentStack;
            var fragment = command.$.fragment;
            if (command instanceof NavigateBack) {
                fragmentStack.pop();
                if (fragmentStack.length > 0) {
                    fragment = fragmentStack[fragmentStack.length - 1];
                }
                this.set('currentFragment', fragment);
                this.trigger('on:navigate', {fragment: fragment});
            } else if (fragment) {
                if(fragmentStack.length > 0 && fragmentStack[fragmentStack.length - 1] == fragment){
                    return;
                }
                fragmentStack.push(fragment);
                this.set('currentFragment', fragment);
                this.trigger('on:navigate', {fragment: fragment});
            }
        }
    })
});