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
            selectedPreset: null,
            presetsInView: true
        },

        supportedConfiguration: DesignConfiguration,

        _bindDomEvents: function () {
            this.callBase();

            var self = this;
            this.$.settingsContainer.bindDomEvent('scroll', function (e) {
                self._updateScrollTop(e.target.scrollTop);
            });
        },

        _updateScrollTop: function (top) {
            this.set('presetsInView', top < 100);
        },

        _selectSubContent: function () {

        },

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
        },

        _showInput: function (val) {
            console.log(val);
        },

        scrollTo: function (container) {
            var top = container.$el.offsetTop;

            this.$.settingsContainer.$el.scrollTop = top - 30;
        }

    })
});