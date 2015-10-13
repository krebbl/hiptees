define(["js/ui/View", "hip/handler/BasketHandler"], function (View, BasketHandler) {
    return View.inherit({
        defaults: {
            tagName: "a",
            loading: true,
            componentClass: "mini-basket-btn {loadingClass()}",
            basket: "{basketHandler.basket}"
        },

        inject: {
            basketHandler: BasketHandler
        },

        _initializationComplete: function(){
            this.callBase();

            var self = this;
            this.set('loading', true);
            this.$.basketHandler.loadCombinedBasket(function(){
                self.set('loading', false);
            });
        },


        _onLoaded: function () {
            this.set('loading', false);
        },
        loadingClass: function () {
            return (this.$.loading) ? "loading" : ""
        }.onChange('loading', 'src')

    })
});