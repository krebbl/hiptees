define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/model/User", "hip/command/ChangeProductType", "hip/command/Navigate", "hip/handler/ProductHandler", "hip/command/LogoutCommand"], function (BaseModule, Collection, Product, User, ChangeProductType, Navigate, ProductHandler, LogoutCommand) {
    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
            productTypes: null,
            published: null,
            drafts: null,
            user: null,
            publishedSelected: false
        },

        inject: {
            productHandler: ProductHandler
        },

        ctor: function () {
            this.callBase();

            this.bind('productHandler', 'on:productSaved', function () {
                if (this.$.drafts) {
                    this.$.drafts.invalidatePageCache();
                    this.showDrafts();
                }

                if (this.$.published) {
                    this.$.published.invalidatePageCache();
                    this.showPublished();
                }


            }, this);
        },

        prepare: function (fragment, callback) {
            var api = this.$.api;

            var user = api.createCollection(Collection.of(User)).createItem("me");

            this.set('user', user);

            user.fetch(function (err) {
                callback && callback(err);
            });

            if (this.$.publishedSelected) {
                this.showPublished();
            } else {
                this.showDrafts();
            }

        },

        showPublished: function () {
            this.set('publishedSelected', true);
            var published = this.$.user.getCollection("published");

            var self = this;
            published.fetch(function (err) {
                if (!err) {
                    self.set('published', published);
                }
            });
        },

        showDrafts: function () {
            this.set('publishedSelected', false);
            var drafts = this.$.user.getCollection("drafts");
            var self = this;
            drafts.fetch(function (err, drafts) {
                if (!err) {
                    self.set('drafts', drafts);
                }
            });
        },

        selectDraft: function (product) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "editor/edit/" + product.$.id
            }));
        },

        goCreate: function () {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "productTypes"
            }));
        },

        logout: function () {
            this.$.executor.storeAndExecute(new LogoutCommand());
        },
        selectProductPreset: function (product) {

        }
    })
});