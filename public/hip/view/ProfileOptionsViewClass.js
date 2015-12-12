define(["hip/view/ViewBase", "hip/handler/LoginHandler", "xaml!hip/dialog/ConfirmDialog", "hip/command/LogoutCommand", "hip/command/FeedbackCommand", "hip/command/NavigateBack"], function (ViewBase, LoginHandler, ConfirmDialog, LogoutCommand, FeedbackCommand, NavigateBack) {

    return ViewBase.inherit({
        defaults: {
            componentClass: "profile-options",
            selected: false
        },

        inject: {
            confirmDialog: ConfirmDialog
        },

        _initializationComplete: function () {
            this.callBase();

            this.$.navigationHandler.bind('on:navigate', function (e) {
                var fragment = e.$.fragment || "";
                var match = fragment.match(/profileOptions/);
                this.set('selected', !!match);
            }, this);
        },

        confirmLogout: function (event) {
            event && event.stopPropagation();
            var self = this;
            this.$.confirmDialog.confirm(this.$.i18n.t('dialog.confirmLogout'), function (err, dialog, ret) {
                if (ret) {
                    self.set('selected', false);
                    self.logout();
                }
            });
        },

        logout: function () {
            this.$.executor.storeAndExecute(new LogoutCommand({}));
        },

        hide: function () {
            this.$.executor.storeAndExecute(new NavigateBack({}));
        },

        showFeedbackDialog: function (event) {
            event && event.stopPropagation();
            var self = this;
            if (navigator.notification) {
                navigator.notification.prompt(
                    this.$.i18n.t('dialog.feedbackPlaceholder'),  // message
                    function (results) {
                        if (results.buttonIndex == 2 && results.input1) {
                            self.$.executor.storeAndExecute(new FeedbackCommand({
                                text: results.input1
                            }));
                            self.hide();
                        }
                    },                  // callback to invoke
                    this.$.i18n.t('dialog.feedback'),            // title
                    [this.$.i18n.t('dialog.cancel'), this.$.i18n.t('dialog.send')],             // buttonLabels
                    ''                 // defaultText
                );
            } else {
                this.$.feedbackDialog.showModal(function (err, window, state) {
                    if (typeof(state) == "string" && state) {
                        self.$.executor.storeAndExecute(new FeedbackCommand({
                            text: state
                        }));
                        self.hide();
                    }
                });
            }
        }


    });

});