define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/model/User", "hip/command/ChangeProductType", "hip/command/Navigate", "hip/handler/ProductHandler", "hip/command/LogoutCommand"], function (BaseModule, Collection, Product, User, ChangeProductType, Navigate, ProductHandler, LogoutCommand) {
    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
            productTypes: null,
            published: null,
            drafts: null,
            user: null,
            publishedSelected: false,
            list: null
        },

        inject: {
            productHandler: ProductHandler
        },

        ctor: function () {
            this.callBase();

            this.bind('productHandler', 'on:productSaved', function () {
                if (this.$.list) {
                    this.$.list.invalidatePageCache();
                    this.showList(this.$.activeList);
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

            this.showList("published");
        },

        showList: function (list) {
            var collection = this.$.user.getCollection(list);

            var self = this;
            collection.fetchPage(0, {noCache: true}, function (err) {
                if (!err) {
                    self.set({
                        activeList: list,
                        list: collection
                    });
                }
            });

        },

        listSelected: function (list) {
            return this.$.activeList == list;
        }.onChange('activeList'),

        selectDraft: function (product) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "editor/edit/" + product.$.id
            }));
        },

        selectProduct: function (product) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "product/" + product.$.id
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