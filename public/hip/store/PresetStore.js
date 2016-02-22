define(["hip/store/Store", "xaml!hip/data/HipDataSource"], function (Store, HipDataSource) {


    return Store.inherit({
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
            colors: null,
            loadingPresets: false
        },

        inject: {
            api: HipDataSource
        },

        selectDepartment: function (payload) {

        },

        selectAppearance: function (payload) {

        },

        selectPreset: function (payload) {

        }

    });

});