define(["xaml!hip/view/SettingsView",
    "underscore",
    "hip/command/ApplyFilter",
    "hip/entity/DesignConfiguration",
    "hip/entity/Filter",
    'json!hip/asset/filters'], function (SettingsView, _, ApplyFilter, DesignConfiguration, Filter, filters) {


    return SettingsView.inherit({
        defaults: {
            componentClass: "settings-view image-settings-view",
            presets: filters.filters,
            selectedPreset: null
        },

        supportedConfiguration: DesignConfiguration,

        _selectPreset: function (preset) {
            this.$.executor.storeAndExecute(new ApplyFilter({
                configuration: this.$.configuration,
                filterChange: _.clone(preset)
            }));
        },

        createFilter: function (preset) {
            return new Filter(preset);
        },

        _updateFilter: function (filter, value) {
            var change = {};
            change[filter] = value;
            this.$.executor.storeAndExecute(new ApplyFilter({
                configuration: this.$.configuration,
                filterChange: change
            }));
        }

    })
});