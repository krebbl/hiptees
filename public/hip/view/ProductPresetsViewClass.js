define(["hip/view/ViewBase", "hip/handler/LoginHandler", "xaml!hip/dialog/ConfirmDialog", "hip/command/LogoutCommand", "hip/command/FeedbackCommand", "hip/command/NavigateBack"], function (ViewBase, LoginHandler, ConfirmDialog, LogoutCommand, FeedbackCommand, NavigateBack) {

    return ViewBase.inherit({
        defaults: {
            presets: null,
            componentClass: "product-presets",
            selected: false,
            departments: [
                {
                    name: "Men",
                    id: "1"
                },
                {
                    name: "Women",
                    id: "2"
                }
            ],
            appearances: [
                {
                    name: "white",
                    color: "#ffffff"
                },
                {
                    name: "black",
                    color: "#000000"
                },
                {
                    name: "red",
                    color: "#ff0000"
                }
            ]
        },

        inject: {
            confirmDialog: ConfirmDialog
        },

        hide: function () {
            this.$.navActions.navigateBack();
        }

    });

});