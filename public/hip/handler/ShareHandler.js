define(["hip/handler/CommandHandler", "hip/command/ShareCommand"], function (CommandHandler, ShareCommand) {

    return CommandHandler.inherit({
        defaults: {
            session: null,
            user: "{session.user}"
        },
        isResponsibleForCommand: function (command) {
            return command instanceof ShareCommand;
        },

        handleCommand: function (command) {
            var type = command.$.type;
            var product = command.$.product;

            product.fetch(function (err, product) {
                //var socialSharing = cordova.require("socialsharing");
                //console.log(socialSharing);

                var socialsharing = window.plugins.socialsharing,
                    link = product.$.shareLink,
                    image = product.$.resources.MEDIUM;

                if (type == "link") {
                    socialsharing.share(null, null, null, link);
                } else if(type == "fb"){
                    socialsharing.shareViaFacebook(null, image, link);
                } else if(type == "twitter"){
                    socialsharing.shareViaTwitter(null, image, link);
                } else if(type == "instagram"){
                    socialsharing.shareViaInstagram(null, image, link);
                }
            });

        }
    });

});