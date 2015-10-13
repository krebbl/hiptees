define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/model/User", "hip/command/ChangeProductType", "hip/command/Navigate", "hip/handler/ProductHandler", "hip/command/LogoutCommand", "hip/handler/LoginHandler"], function (BaseModule, Collection, Product, User, ChangeProductType, Navigate, ProductHandler, LogoutCommand, LoginHandler) {


    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
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
            callback && callback();
        },

        finishRegistration: function () {

        }
    })
});