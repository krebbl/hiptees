define(["hip/view/ViewBase", "xaml!hip/dialog/ConfirmDialog", "hip/store/PresetStore", "hip/action/PresetActions", "hip/store/NavigationStore"], function (ViewBase, ConfirmDialog, PresetStore, PresetActions, NavigationStore) {

    return ViewBase.inherit({
        defaults: {
            presets: null,
            componentClass: "presets-view",
            selected: false,
            closable: false
        },
        events: [
            'on:closeClicked'
        ],

        inject: {
            navigationStore: NavigationStore,
            presetStore: PresetStore,
            presetActions: PresetActions,
            confirmDialog: ConfirmDialog
        },

        hide: function () {
            this.trigger('on:closeClicked');
        },

        removePreset: function (product) {
            this.$.presetActions.removePreset({preset: product});
        },

        _renderSelected: function (selected) {
            this.callBase();
            if (selected) {
                var self = this;
                setTimeout(function () {
                    self.$.scrollContainer.$el.scrollTop = self.$.scrollContainer.$el.scrollTop + 1;
                }, 500);
            }
        },
        selectProductPreset: function (product) {
            this.$.navActions.showMenu();
            this.$.productActions.selectPreset({productId: product.$.id});
        },
        selectDepartment: function (department) {
            this.$.presetActions.selectDepartment({
                department: department
            });
        }

    });

});