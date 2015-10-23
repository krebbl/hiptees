define(["xaml!js/ui/Dialog", "js/core/I18n"], function (Dialog, I18n) {

    return Dialog.inherit({
        defaults: {
            _confirmMessage: "Hello",
            closable: false
        },
        inject: {
            i18n: I18n
        },
        confirm: function(message, callback){
            this.set('_confirmMessage', message);
            this.showModal(callback);
        }
    });

});