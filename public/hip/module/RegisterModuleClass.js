define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/model/User", "hip/command/ChangeProductType", "hip/command/Navigate", "hip/handler/ProductHandler", "hip/command/LogoutCommand", "hip/handler/LoginHandler", "hip/command/RegisterCommand"], function (BaseModule, Collection, Product, User, ChangeProductType, Navigate, ProductHandler, LogoutCommand, LoginHandler, RegisterCommand) {


    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
            user: "{loginHandler.user}",
            username: "",
            _showSuggestion: true,
            _usernameAvailable: true,
            _checkingUsername: false
        },

        inject: {
            productHandler: ProductHandler,
            loginHandler: LoginHandler
        },

        ctor: function () {
            this.callBase();
        },

        prepare: function (fragment, callback) {

            this.set('username', this.get('user.username'));

            callback && callback();
        },

        handleDelete: function (e) {

        },

        checkUsername: function (e) {
            this.set({
                _showSuggestion: false,
                _usernameAvailable: false,
                _checkingUsername: true
            });
            var self = this;
            this._debounceFunctionCall(function (username) {
                this.$.loginHandler.checkUsername(username, function (err, available) {
                    self.set('_checkingUsername', false);
                    self.set('_usernameAvailable', !err && available);

                });
            }, "checkUsername", 300, this, [this.$.username], "WAIT");
        },

        finishRegistration: function () {
            if (this.$._usernameAvailable) {
                this.$.executor.storeAndExecute(new RegisterCommand({
                    username: this.$.username
                }));
            }
        }
    })
});