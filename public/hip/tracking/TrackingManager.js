define(["js/core/Component"], function (Component) {

    return Component.inherit({
        defaults: {
            trackingId: 'UA-24747471-32',
            debugMode: false
        },

        _initializationComplete: function () {
            this.callBase();

            if (typeof (ga) !== "undefined") {
                ga('create', this.$.trackingId, 'auto');
                ga('send', 'screenview', {appName: "hiptees"});

                if (this.$.debugMode) {
                    ga.debugMode();
                }
            }

        },

        trackView: function (view) {
            ga && ga('send', 'screenview', {screenName: view, appName: "hiptees"});
        },
        trackEvent: function (category, action, label, value) {
            ga && ga('send', 'event', category, action, label, value);
        },
        trackException: function (description, fatal) {
            ga && ga('send', 'exception', description, fatal);
        },
        trackTiming: function (category, ms, variable, label) {
            ga && ga('send', 'timing', category, ms, variable, label);
        }
        //addTransaction: function (id, affiliation, revenue, tax, shipping, currencyCode) {
        //    ga && ga.addTransaction(id, affiliation, revenue, tax, shipping, currencyCode)
        //},
        //setUserId: function (userId) {
        //    ga && ga.setUserId(userId);
        //}
    });

});