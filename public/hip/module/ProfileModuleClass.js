define(["hip/module/BaseModule", "js/data/Collection", "hip/model/Product", "hip/model/User", "hip/command/ChangeProductType", "hip/command/Navigate", "hip/handler/ProductHandler", "hip/command/LogoutCommand", "hip/handler/LoginHandler"], function (BaseModule, Collection, Product, User, ChangeProductType, Navigate, ProductHandler, LogoutCommand, LoginHandler) {


    var stateCountMap = {
        "draft": "countDrafts",
        "private": "countPrivates",
        "public": "countPublished"
    };

    var stateListMap = {
        "draft": "drafts",
        "private": "private",
        "public": "published"
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
            productHandler: ProductHandler,
            loginHandler: LoginHandler
        },

        ctor: function () {
            this.callBase();

            var productChangeHandler = function (e) {
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
                    this.showList(stateListMap[product.$.state] || stateListMap[stateBefore]);
                }
            };

            this.bind('productHandler', 'on:productSaved', productChangeHandler, this);
            this.bind('productHandler', 'on:productStateChanged', productChangeHandler, this);
        },

        prepare: function (fragment, callback) {
            var self = this;
            var user = this.$.loginHandler.loadCurrentUser(function (err, user) {
                callback && callback(err);
            });

            this.set('user', user);

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
                    // TODO: implement scroll paging
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

        showOptions: function (product) {
            this.$.executor.storeAndExecute(new Navigate({
                fragment: "productOptions/" + product.$.id
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