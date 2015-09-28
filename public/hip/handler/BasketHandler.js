define(["hip/handler/CommandHandler", "hip/command/BasketCommand", "hip/command/AddToBasket", "hip/command/RemoveFromBasket", "hip/command/ChangeBasketItem"], function (Handler, BasketCommand, AddToBasket, RemoveFromBasket, ChangeBasketItem) {
    return Handler.inherit({
        defaults: {
            basket: null
        },
        isResponsibleForCommand: function (command) {
            return command instanceof BasketCommand;
        },
        handleCommand: function (command) {
            if (command instanceof AddToBasket) {
                // TODO: implement
                if (!command.$.size) {

                    this.trigger('on:addToBasketFailed', {reason: "Keine Größe ausgewählt"});
                    return;
                }



            }
        }
    })
});