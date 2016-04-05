define(["hip/store/Store", "xaml!hip/data/HipDataSource", "js/data/Query", "js/data/Collection", "hip/model/Product"], function (Store, HipDataSource, Query, Collection, Product) {


    return Store.inherit({
        ns: "presets",
        defaults: {
            selectedDepartment: null,
            selectedAppearance: null,
            departments: [
                {
                    name: "men",
                    id: "1"
                },
                {
                    name: "women",
                    id: "2"
                }
            ],
            loading: false
        },

        inject: {
            api: HipDataSource
        },

        selectDepartment: function (payload) {
            var department = payload.department;

            if (department === this.$.selectedDepartment) {
                return;
            }

            this.set({
                selectedDepartment: department,
                presets: null
            }, {force: true});

            this._loadPresets();

        },

        _loadPresets: function () {
            this.set('presets', null);

            this.set('loading', true);

            var api = this.$.api;

            var products = api.createCollection(Collection.of(Product));

            var query = new Query().eql("tags", "preset");

            var queryCollection = products.query(query),
                self = this;

            queryCollection.fetch({
                limit: 20
            }, function (err, productPresets) {
                self.set('loading', false);
                if (!err) {
                    self.set('presets', productPresets);
                }
            });

        },

        _initializationComplete: function () {
            this.callBase();

            this.set({
                selectedDepartment: this.$.departments[0]
            });

            this._loadPresets();
        }

    });

});