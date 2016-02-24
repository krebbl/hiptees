define(["hip/view/ViewBase", "hip/handler/LoginHandler", "xaml!hip/dialog/ConfirmDialog", "hip/store/PresetStore", "hip/action/PresetActions"], function (ViewBase, LoginHandler, ConfirmDialog, PresetStore, PresetActions) {

    return ViewBase.inherit({
        defaults: {
            presets: null,
            componentClass: "presets-view",
            selected: false,
            closable: false
        },

        inject: {
            presetStore: PresetStore,
            presetActions: PresetActions,
            confirmDialog: ConfirmDialog
        },

        hide: function () {
            this.$.navActions.navigateBack();
        },

        _commitSelected: function(selected){
            if(selected) {
                var self = this;
                setTimeout(function(){
                    self.$.scrollContainer.$el.scrollTop = 1;
                },500);
            }
        },
        selectProductPreset: function (product) {
            this.$.navActions.navigate({
                fragment: "editor/preset/" + product.$.id
            });
        },
        selectDepartment: function (department) {
            this.$.presetActions.selectDepartment({
                department: department
            });
        },
        selectAppearance: function (appearance) {
            this.$.presetActions.selectAppearance({
                appearance: appearance
            });
        }

    });

});