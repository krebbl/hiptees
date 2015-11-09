define(["js/core/Component"], function (Component) {

    return Component.inherit({
        defaults: {
            trackingId: 'UA-XXXX-YY',
            debugMode: false
        },

        initializationComplete: function () {
            this.callBase();


            if (window.analytics) {
                window.analytics.startTrackerWithId(this.$.trackingId);
                if (this.$.debugMode) {
                    window.analytics.debugMode();
                }
            }

        },

        trackView: function (view) {
            window.analytics && window.analytics.trackView(view);
        },
        trackEvent: function (category, action, label, value) {
            window.analytics && window.analytics.trackEvent(category, action, label, value);
        },
        trackException: function (description, fatal) {
            window.analytics && window.analytics.trackException(description, fatal);
        },
        trackTiming: function (category, ms, variable, label) {
            window.analytics && window.analytics.trackTiming(category, ms, variable, label);
        },
        addTransaction: function (id, affiliation, revenue, tax, shipping, currencyCode) {
            window.analytics && window.analytics.addTransaction(id, affiliation, revenue, tax, shipping, currencyCode)
        },
        setUserId: function (userId) {
            window.analytics && window.analytics.setUserId(userId);
        }
    });

});