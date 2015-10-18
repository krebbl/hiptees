define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/model/User", "hip/command/ChangeProductType", "hip/command/Navigate", "hip/handler/ProductHandler", "hip/command/LogoutCommand", "hip/handler/LoginHandler", "hip/command/RegisterCommand"], function (BaseModule, Collection, Product, User, ChangeProductType, Navigate, ProductHandler, LogoutCommand, LoginHandler, RegisterCommand) {


    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
            user: "{loginHandler.user}",
            username: ""
        },

        inject: {
            productHandler: ProductHandler,
            loginHandler: LoginHandler
        },

        ctor: function () {
            this.callBase();
        },

        prepare: function (fragment, callback) {
            var self = this;

            this.set('username', this.get('user.username'));

            callback && callback();
        },

        finishRegistration: function () {
            this.$.executor.storeAndExecute(new RegisterCommand({
                username: this.$.username
            }));
        }
    })
});