define(["xaml!js/ui/Dialog", "js/core/I18n"], function (Dialog, I18n) {

    return Dialog.inherit({
        defaults: {
            _confirmMessage: "Hello",
            closable: false
        },
        inject: {
            i18n: I18n
        },
        confirm: function (message, callback) {
            if (navigator.notification) {
                var self = this;
                navigator.notification.confirm(message, function (res) {
                    callback(null, self, res == 2);
                }, this.$.i18n.t('dialog.confirm'), [this.$.i18n.t('dialog.no'), this.$.i18n.t('dialog.yes')])
            } else {
                this.set('_confirmMessage', message);
                this.showModal(callback);
            }
        }
    });

});