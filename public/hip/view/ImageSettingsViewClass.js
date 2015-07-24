define(["hip/view/SettingsViewClass",
    "underscore",
    "hip/command/ApplyFilter",
    "hip/entity/ImageConfiguration",
    "hip/entity/Filter",
    'json!hip/asset/filters'], function (SettingsViewClass, _, ApplyFilter, ImageConfiguration, Filter, filters) {


    return SettingsViewClass.inherit({
        defaults: {
            componentClass: "settings-view image-settings-view",
            presets: filters.filters,
            selectedPreset: null
        },

        supportedConfiguration: ImageConfiguration,

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