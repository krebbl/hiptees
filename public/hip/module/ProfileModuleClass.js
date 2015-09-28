define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/model/User", "hip/command/ChangeProductType", "hip/command/Navigate", "hip/handler/ProductHandler", "hip/command/LogoutCommand"], function (BaseModule, Collection, Product, User, ChangeProductType, Navigate, ProductHandler, LogoutCommand) {


    var stateCountMap = {
        "draft": "countDrafts",
        "private": "countPrivates",
        "public": "countPublished"
    };

    return BaseModule.inherit({
        defaults: {
            handles: "",
            loading: true,
            productTypes: null,
            published: null,
            drafts: null,
            user: null,
            publishedSelected: false,
            list: null,
            backToTop: false,
            listLoading: false
        },

        inject: {
            productHandler: ProductHandler
        },

        ctor: function () {
            this.callBase();

            this.bind('productHandler', 'on:productSaved', function (e) {
                var product = e.$.product,
                    stateBefore = e.$.stateBefore;

                if (stateBefore && stateBefore !== product.$.state) {
                    var decreaseProperty = stateCountMap[stateBefore];
                    this.$.user.set(decreaseProperty, Math.max(0, this.$.user.get(decreaseProperty) - 1));
                }

                var increaseProperty = stateCountMap[product.$.state];
                this.$.user.set(increaseProperty, this.$.user.get(increaseProperty) + 1);

                if (this.$.list) {
                    var lists = ["drafts", "published", "private"];
                    for (var i = 0; i < lists.length; i++) {
                        var list = lists[i];
                        var collection = this.$.user.getCollection(list);
                        collection.invalidatePageCache();
                    }
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

            if (!this.$.activeList) {
                this.showList("published");
            }
        },

        showList: function (list) {
            var collection = this.$.user.getCollection(list);

            var self = this;
            this.set({
                'activeList': list,
                listLoading: true
            });
            collection.fetchPage(0, {noCache: true}, function (err) {
                if (!err) {
                    self.set({
                        listLoading: false,
                        list: collection
                    });
                }
            });

        },

        listLoadingClass: function () {
            return this.$.listLoading ? "loading" : ""
        }.onChange('listLoading'),

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