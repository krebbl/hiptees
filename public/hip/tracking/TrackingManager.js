define(["js/core/Component", "hip/tracking/Omniture", "hip/tracking/Google"], function (Component, Omniture, Google) {


    var ViewMapping = {
        options: "Hiptees - Menu",
        presets: "Hiptees - Presets",
        editor: "Hiptees - Editor",
        basket: "Hiptees  - Basket",
        add: "Hiptees - Add View",
        buy: "Hiptees - Size Selection"
    };

    return Component.inherit({
        defaults: {
            debugMode: false
        },

        inject: {
            g: Google,
            omniture: Omniture
        },

        trackBuyClicked: function () {
            var value = "Hiptees - choose size";
            this.$.omniture.track(null, {
                prop30: value,
                eVar34: value
            }, ["event220"]);

            this.$.g.trackEvent("PRODUCT", "buyClicked");
        },

        trackAddToBasketSize: function () {
            this.$.omniture.track(null, null, ["scAdd", "event79"]);
            this.$.g.trackEvent("BASKET", "addToBasket");
        },

        trackAddToBasket: function () {
            this.$.omniture.track(null, null, ["event24"]);
            this.$.g.trackEvent("BASKET", "addToBasketSuccess");
        },

        trackAddToBasketFailed: function (productId) {
            this.$.g.trackException("Couldn't add to product " + productId);
        },

        trackBasketItemCloned: function () {
            this.$.g.trackEvent("BASKET", "basketItemCloned");
        },

        trackBasketItemChanged: function () {
            this.$.g.trackEvent("BASKET", "basketItemChanged");
        },

        trackBasketItemRemoved: function () {
            this.$.g.trackEvent("BASKET", "basketItemRemoved");
        },


        trackGotoCheckout: function () {
            this.$.omniture.track(null, {eVar33: "Designer - Checkout Button"});

            this.$.g.trackEvent("BASKET", "checkout");
        },

        trackBasketCreated: function (id) {
            this.$.omniture.track("scOpen", null, ["scOpen"]);

            this.$.g.trackEvent("BASKET", "basketCreated", id);
        },

        trackNavigation: function (view) {
            var screeName = ViewMapping[view];

            this.$.omniture.track("Navigation-" + screeName, {
                eVar33: screeName
            });

            this.$.g.trackView(screeName);
        },

        trackSelectDepartment: function (department) {
            this.trackFeature("select department " + department);
        },

        trackSelectPreset: function (productId) {
            this.trackFeature("select preset " + productId);

            this.$.g.trackEvent('PRODUCT', 'selectedPreset', productId);
        },

        trackSizeSelected: function (size) {
            this.$.g.trackEvent("PRODUCT", 'sizeSelected', size.$.name);
        },

        trackConfigurationAdded: function (config) {
            this.trackFeature("add " + config.$.type);
            this.$.g.trackEvent("PRODUCT", "configurationAdded", config.$.type);
        },

        trackConfigurationCloned: function (config) {
            this.trackFeature("clone " + config.$.type);

            this.$.g.trackEvent("PRODUCT", "configurationCloned", config.$.type);
        },

        trackFeature: function (feature) {
            this.$.omniture.track(null, {
                prop30: feature,
                eVar34: feature
            });
        },

        trackConfigurationRemoved: function (config) {
            this.$.g.trackEvent("PRODUCT", "configurationRemoved", config.$.type);
        },

        trackProductSaved: function () {
            this.$.g.trackEvent("PRODUCT", "productSaved");
        },

        trackProductSaveFailed: function () {
            this.$.g.trackException("Couldn't save product")
        },

        trackProductSaveTiming: function (time) {
            this.$.g.trackTiming("PRODUCT", time, "productSave");
        },

        trackAddToBasketTiming: function (time) {
            this.$.g.trackTiming("BASKET", time, "addedToBasket");
        }
    });

});