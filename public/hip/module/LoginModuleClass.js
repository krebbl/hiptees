define(["hip/module/BaseModule", "hip/command/LoginCommand"], function (BaseModule, LoginCommand) {
    return BaseModule.inherit({
        defaults: {
            loading: true
        },

        loginWithFB: function () {
            this.$.executor.storeAndExecute(new LoginCommand({
                type: "fb"
            }))
        },
        loginWithTwitter: function(){
            this.$.executor.storeAndExecute(new LoginCommand({
                type: "twitter"
            }))
        },
        loginAsTest: function(){
            this.$.executor.storeAndExecute(new LoginCommand({
                type: "test",
                email: "krebbl@gmail.com"
            }))
        }
    })
});