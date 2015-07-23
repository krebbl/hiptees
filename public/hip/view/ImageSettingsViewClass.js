define(["hip/view/SettingsViewClass",
    "hip/command/ApplyFilter",
    "hip/entity/ImageConfiguration",
    'json!hip/asset/filters'], function (SettingsViewClass, ApplyFilter, ImageConfiguration, filters) {


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
                filterChange: preset
            }));
        }

    })
});