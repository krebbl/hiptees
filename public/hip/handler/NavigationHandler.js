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
            if (command instanceof NavigateBack) {
                var fragment;
                this.$.fragmentStack.pop();
                if (this.$.fragmentStack.length > 0) {
                    fragment = this.$.fragmentStack[this.$.fragmentStack.length - 1];
                }
                this.trigger('on:navigate', {fragment: fragment});
            } else if (command.$.fragment) {
                this.$.fragmentStack.push(command.$.fragment);
                this.trigger('on:navigate', {fragment: command.$.fragment});
            }
        }
    })
});