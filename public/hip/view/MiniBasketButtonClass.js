define(["js/ui/View", "hip/store/BasketStore"], function (View, BasketStore) {
    return View.inherit({
        defaults: {
            tagName: "a",
            loading: true,
            componentClass: "mini-basket-btn {loadingClass()}",
            basket: "{basketStore.basket}"
        },

        inject: {
            basketStore: BasketStore
        },

        _initializationComplete: function(){
            this.callBase();

            var self = this;
            this.set('loading', true);
            this.$.basketStore.loadCombinedBasket(function(){
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