define(["hip/store/Store", "xaml!hip/data/HipDataSource", "js/data/Query", "js/data/Collection", "hip/model/Product"], function (Store, HipDataSource, Query, Collection, Product) {


    return Store.inherit({
        ns: "presets",
        defaults: {
            selectedDepartment: null,
            selectedAppearance: null,
            departments: [
                {
                    name: "Men",
                    id: "1"
                },
                {
                    name: "Women",
                    id: "2"
                }
            ],
            appearances: [
                {
                    id: "1",
                    name: "white",
                    color: "#ffffff"
                },
                {
                    id: "2",
                    name: "black",
                    color: "#000000"
                },
                {
                    id: "3",
                    name: "red",
                    color: "#ff0000"
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

            var appearances = this.$.appearances;

            this.set({
                selectedDepartment: department,
                selectedAppearance: appearances[0],
                presets: null
            }, {force: true});

            this._loadPresets();

        },

        _loadPresets: function () {
            this.set('presets', null);

            this.set('loading', true);

            var api = this.$.api;

            var products = api.createCollection(Collection.of(Product));

            var query = new Query().eql("tags", "preset").eql('appearance', this.$.selectedAppearance.id);

            var queryCollection = products.query(query),
                self = this;

            queryCollection.fetch({
                limit: 10
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
                selectedDepartment: this.$.departments[0],
                selectedAppearance: this.$.appearances[0]
            });

            this._loadPresets();
        },

        selectAppearance: function (payload) {
            if (this.$.selectedAppearance === payload.appearance) {
                return;
            }

            this.set('selectedAppearance', payload.appearance);

            this._loadPresets();
        }

    });

});