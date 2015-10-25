define(["xaml!js/ui/Dialog", "js/core/I18n"], function (Dialog, I18n) {

    return Dialog.inherit({
        defaults: {
            _feedbackText: "",
            closable: false,
            closeOnBackdrop: true
        },
        inject: {
            i18n: I18n
        },
        close: function(){
            this.callBase();
            this.set('_feedbackText', "");
        }
    });

});