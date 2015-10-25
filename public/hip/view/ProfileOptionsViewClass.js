define(["hip/view/ViewBase", "hip/handler/LoginHandler", "xaml!hip/dialog/ConfirmDialog", "hip/command/LogoutCommand", "hip/command/FeedbackCommand"], function (ViewBase, LoginHandler, ConfirmDialog, LogoutCommand, FeedbackCommand) {

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
                var fragment = e.$.fragment;
                var match = fragment.match(/profileOptions/);
                if (match) {
                    this.set('selected', true);
                }
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
            this.set('selected', false);
        },

        showFeedbackDialog: function (event) {
            event && event.stopPropagation();
            var self = this;
            this.$.feedbackDialog.showModal(function (err, window, state) {
                if (typeof(state) == "string" && state) {
                    self.$.executor.storeAndExecute(new FeedbackCommand({
                        text: state
                    }));
                    self.hide();
                }
            });
        }


    });

});