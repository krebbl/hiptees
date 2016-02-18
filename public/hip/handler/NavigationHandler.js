define(["hip/handler/CommandHandler", "hip/command/Navigate", "hip/command/NavigateBack"], function (Handler, Navigate, NavigateBack) {
    return Handler.inherit({
        defaults: {
            router: null,
            fragmentStack: []
        },
        isResponsibleForCommand: function (command) {
            return command instanceof Navigate;
        },
        handleCommand: function (command) {
            var fragmentStack = this.$.fragmentStack;
            if (command instanceof NavigateBack) {
                var fragment;
                fragmentStack.pop();
                if (fragmentStack.length > 0) {
                    fragment = fragmentStack[fragmentStack.length - 1];
                }
                this.trigger('on:navigate', {fragment: fragment});
            } else if (command.$.fragment) {
                if(fragmentStack.length > 0 && fragmentStack[fragmentStack.length - 1] == command.$.fragment){
                    return;
                }
                fragmentStack.push(command.$.fragment);
                this.trigger('on:navigate', {fragment: command.$.fragment});
            }
        }
    })
});