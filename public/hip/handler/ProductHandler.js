define([
    "hip/handler/CommandHandler",
    "hip/command/ProductCommand",
    "hip/command/RemoveConfiguration",
    "hip/command/SaveProduct",
    "hip/command/SelectConfiguration",
    "hip/command/CloneConfiguration",
    "hip/command/ChangeOrder",
    "hip/command/AddText",
    "hip/entity/TextConfiguration",
    "text/entity/TextRange",
    "text/operation/ApplyStyleToElementOperation",
    "text/entity/TextFlow"
], function (Handler, ProductCommand, RemoveConfiguration, SaveProduct, SelectConfiguration, CloneConfiguration, ChangeOrder, AddText, TextConfiguration, TextRange, ApplyStyleToElementOperation, TextFlow) {
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
                        this._selectConfiguration(null);
                    }

                    this.trigger('on:configurationRemoved', {configuration: command.$.configuration});
                }
            } else if (command instanceof SaveProduct) {

                // TODO trigger on:configurationSaving


                // TODO trigger on:configurationSaved

//            } else if (command instanceof AddText) {

            } else if (command instanceof SelectConfiguration) {
                this._selectConfiguration(command.$.configuration);
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
                    this._selectConfiguration(clone);
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
            } else if (command instanceof AddText) {

                var textFlow = TextFlow.initializeFromText(command.$.text || "TEXT"),
                    offset = {x: 0, y: 0};

                (new ApplyStyleToElementOperation(TextRange.createTextRange(0, 2), textFlow, command.$.leafStyle || {}, command.$.paragraphStyle || {})).doOperation();

                if (command.$.offset) {
                    if (command.$.offset.x <= 1) {
                        offset.x = this.get('product.productType.printArea.width') * command.$.offset.x;
                        offset.y = this.get('product.productType.printArea.height') * command.$.offset.y;
                    } else {
                        offset.x = command.$.offset.x;
                        offset.y = command.$.offset.y;
                    }
                }

                configuration = new TextConfiguration({
                    textFlow: textFlow,
                    offset: offset
                });

                this.$.product.$.configurations.add(configuration);

                this.trigger('on:configurationAdded', {configuration: configuration});
                this._selectConfiguration(configuration);
            }

        },
        _selectConfiguration: function (configuration) {
            this.set('selectedConfiguration', configuration);
            this.trigger('on:configurationSelected', {configuration: configuration});
        }
    })
});