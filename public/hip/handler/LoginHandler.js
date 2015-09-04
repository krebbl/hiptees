define(["hip/handler/CommandHandler", "xaml!hip/data/HipDataSource", "hip/model/Session", "hip/command/LoginCommand", "hip/command/LogoutCommand", "flow"], function (CommandHandler, HipDataSource, Session, LoginCommand, LogoutCommand, flow) {
    return CommandHandler.inherit({
        defaults: {
            session: null
        },
        inject: {
            api: HipDataSource
        },

        isResponsibleForCommand: function (command) {
            return command instanceof LoginCommand || command instanceof LogoutCommand;
        },

        handleCommand: function (command) {
            var self = this;
            var api = this.$.api;

            if (command instanceof LoginCommand) {
                var session = api.createEntity(Session);

                if (command.$.type == "localStorage") {
                    var sessionToken = this._loadSessionToken();
                    if (sessionToken) {
                        session.set('id', sessionToken);

                        session.fetch(null, function (err, session) {
                            self._handleSessionResponse(err, session);
                        })
                    } else {
                        this.trigger('on:loginFailed', {}, this);
                    }
                } else if (command.$.type == "fb") {
                    var facebookConnectPlugin = cordova.require("com.phonegap.plugins.facebookconnect.FacebookConnectPlugin");
                    if (cordova.platformId == "browser") {
                        facebookConnectPlugin.browserInit(164321440569168, "v2.3");
                    }

                    if ("standalone" in navigator && navigator.standalone) {
                        var permissionUrl = "https://m.facebook.com/dialog/oauth?client_id=" + 164321440569168 + "&response_type=token&redirect_uri=" + window.location + "&scope=" + "email";
                        window.location = permissionUrl;
                    } else {
                        facebookConnectPlugin.login(["email"], function (response) {
                            if (!response.error && response.status == "connected") {
                                var auth = response.authResponse;

                                if (auth) {
                                    session.set('auth', {
                                        type: "fb",
                                        accessToken: auth.accessToken
                                    });
                                }

                                session.save(null, function (err, session) {
                                    self._handleSessionResponse(err, session);
                                })
                            }
                        }, function (err) {
                            alert("failed");
                        });
                    }

                } else if (command.$.type == "twitter") {
                    // TODO: implement
                } else if (command.$.type == "accessToken") {
                    session.set('auth', {
                        type: "fb",
                        accessToken: command.$.accessToken
                    });

                    session.save(null, function (err, session) {
                        self._handleSessionResponse(err, session);
                    })
                }

            } else if (command instanceof LogoutCommand) {

                var session = this.$.session;
                if (session) {


                    self.trigger('on:logout', {}, self);
                    flow()
                        .seq(function (cb) {
                            session.remove(null, cb);
                        })
                        .exec(function (err) {
                            if (!err) {
                                self.set('session', null);
                                self._clearSessionToken();
                            }
                            alert("https://www.facebook.com/logout.php?next=" + encodeURIComponent("http://local.hiptees.com") + "&access_token=" + session.$.auth.accessToken);
                            window.location = "https://www.facebook.com/logout.php?next=" + encodeURIComponent("http://local.hiptees.com") + "&access_token=" + session.$.auth.accessToken;

                            self.trigger('on:loggedOut', {}, self);
                        })

                }

            }
        },

        _handleSessionResponse: function (err, session) {
            if (!err) {
                this.set('session', session);
                this._saveSessionToken(session.$.id);
                this.$.api.set('sessionToken', session.$.id);
                this.trigger('on:userLoggedIn', {session: session}, this);
            } else {
                this._clearSessionToken();
                this.trigger('on:loginFailed', {}, this);
            }
        },

        _saveSessionToken: function (sessionToken) {
            try {
                window.localStorage.setItem("sessionToken", sessionToken);
            } catch (e) {
                // TODO: handle e
            }


        },
        _loadSessionToken: function () {
            try {
                return window.localStorage.getItem("sessionToken");
            } catch (e) {
                // TODO: handle e
            }

        },
        _clearSessionToken: function () {
            try {
                window.localStorage.removeItem("sessionToken");
            } catch (e) {
                // TODO: handle e
            }
        }
    })
});