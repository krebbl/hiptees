define(["hip/handler/CommandHandler", "hip/command/ProductCommand", "hip/command/RemoveConfiguration", "hip/command/SaveProduct", "hip/command/SelectConfiguration"], function (Handler, ProductCommand, RemoveConfiguration, SaveProduct, SelectConfiguration) {
    return Handler.inherit({
        defaults: {
            product: null,
            selectedConfiguration: null,
            savingProduct: false
        },
        isResponsibleForCommand: function (command) {
            return command instanceof ProductCommand;
        },
        handleCommand: function (command) {
            if (command instanceof RemoveConfiguration) {
                if (this.$.product && command.$.configuration) {
                    // only remove it if it was found
                    this.$.product.$.configurations.remove(command.$.configuration);
                    if (command.$.configuration == this.$.selectedConfiguration) {
                        this.set('selectedConfiguration', null);
                        this.trigger('on:configurationSelected', {configuration: null});
                    }

                    this.trigger('on:configurationRemoved', {configuration: command.$.configuration});
                }
            } else if (command instanceof SaveProduct) {

                // TODO trigger on:configurationSaving


                // TODO trigger on:configurationSaved

//            } else if (command instanceof AddText) {

            } else if (command instanceof SelectConfiguration) {
                this.set('selectedConfiguration', command.$.configuration);
                this.trigger('on:configurationSelected', {configuration: command.$.configuration});
            }
        }
    })
});