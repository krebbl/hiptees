define([
    "hip/handler/CommandHandler",
    "hip/command/ProductCommand",
    "hip/command/RemoveConfiguration",
    "hip/command/SaveProduct",
    "hip/command/SelectConfiguration",
    "hip/command/CloneConfiguration",
    "hip/command/ChangeOrder"], function (Handler, ProductCommand, RemoveConfiguration, SaveProduct, SelectConfiguration, CloneConfiguration, ChangeOrder) {
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
            var configuration = command.$.configuration;
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
            } else if (command instanceof CloneConfiguration) {
                if (configuration) {

                    var clone = configuration.clone();
                    clone.set({
                        offset: {
                            x: configuration.get('offset.x') + 10,
                            y: configuration.get('offset.y') + 10
                        }
                    });

                    this.$.product.$.configurations.add(clone);

                    this.trigger('on:configurationCloned', {configuration: clone});
                    this.trigger('on:configurationAdded', {configuration: clone});
                    this.set('selectedConfiguration', clone);
                    this.trigger('on:configurationSelected', {configuration: clone});
                }

            } else if (command instanceof ChangeOrder) {
                if (configuration) {
                    var index = this.$.product.getIndexOfConfiguration(configuration),
                        newIndex = command.$.index;

                    if (newIndex > index) {
                        newIndex--;
                    }

                    this.$.product.$.configurations.remove(configuration);
                    this.$.product.$.configurations.add(configuration, {index: newIndex});

                    this.trigger('on:configurationOrderChanged', {configuration: configuration, index: command.$.index});
                }
            }
        }
    })
});