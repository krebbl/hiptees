define(["hip/handler/CommandHandler", "xaml!hip/data/HipDataSource", "hip/model/Session", "hip/command/LoginCommand", "hip/command/LogoutCommand", "flow", "js/data/Collection", "hip/model/User", "hip/command/RegisterCommand", "hip/model/RegisterUser", "hip/model/CheckUsername"], function (CommandHandler, HipDataSource, Session, LoginCommand, LogoutCommand, flow, Collection, User, RegisterCommand, RegisterUser, CheckUsername) {
    return CommandHandler.inherit({
        defaults: {
            session: null,
            user: "{session.user}"
        },
        inject: {
            api: HipDataSource
        },

        isResponsibleForCommand: function (command) {
            return command instanceof LoginCommand || command instanceof LogoutCommand || command instanceof RegisterCommand;
        },

        handleCommand: function (command) {
            var self = this;
            var api = this.$.api,
                session;

            if (command instanceof LoginCommand) {
                session = api.createEntity(Session);

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
                        window.location = "https://m.facebook.com/dialog/oauth?client_id=" + 164321440569168 + "&response_type=token&redirect_uri=" + window.location + "&scope=" + "email";
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
                } else if (command.$.type == "test") {
                    session.set({
                        'auth': {
                            "type": "test"
                        },
                        'email': command.$.email
                    });

                    session.save(null, function (err, session) {
                        self._handleSessionResponse(err, session);
                    });

                } else if (command.$.type == "twitter") {

                    if (TwitterConnect) {
                        TwitterConnect.login(function (result) {
                            session.set('auth', {
                                type: "twitter",
                                tokenKey: result.token,
                                tokenSecret: result.secret
                            });

                            session.save(null, function (err, session) {
                                self._handleSessionResponse(err, session);
                            });
                        }, function (err) {
                            console.log(err);
                        });
                    }
                } else if (command.$.type == "accessToken") {
                    session.set('auth', {
                        type: "fb",
                        accessToken: command.$.accessToken
                    });

                    session.save(null, function (err, session) {
                        self._handleSessionResponse(err, session);
                    })
                }
            } else if (command instanceof RegisterCommand) {

                session = this.$.session;
                if (session) {
                    var registerUser = this.$.api.createEntity(RegisterUser);

                    registerUser.set('username', command.$.username);
                    registerUser.save({}, function (err, user) {
                        if (!err) {
                            session.set('user', user);
                            self.trigger('on:registrationCompleted');
                        } else {
                            self.trigger('on:registrationFailed', err);
                        }
                    });

                }

            } else if (command instanceof LogoutCommand) {

                session = this.$.session;
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
                            if ("standalone" in navigator && navigator.standalone) {
                                window.location = "https://www.facebook.com/logout.php?next=" + encodeURIComponent("http://local.hiptees.com") + "&access_token=" + session.$.auth.accessToken;
                            }

                            self.trigger('on:loggedOut', {}, self);
                        })

                }

            }
        },

        loadCurrentUser: function (callback) {
            var user = this.$.api.createCollection(Collection.of(User)).createItem("me");

            this.set('user', user);

            user.fetch(function (err) {
                callback && callback(err, user);
            });

            return user;
        },

        checkUsername: function (username, callback) {

            var checkUsername = this.$.api.createEntity(CheckUsername);

            checkUsername.set('username', username);

            checkUsername.save({}, function (err, checkUsername) {
                callback(err, checkUsername.$.available);
            });
        },

        _handleSessionResponse: function (err, session) {
            if (!err) {
                this.set('session', session);
                this._saveSessionToken(session.$.id);
                this.$.api.set('sessionToken', session.$.id);
                this.trigger('on:userLoggedIn', {session: session, user: session.$.user}, this);
            } else {
                this.unset('session');
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