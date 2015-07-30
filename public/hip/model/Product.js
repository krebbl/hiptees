define(["js/data/Model", "js/core/List"], function (Model, List) {
    return Model.inherit('hip.model.Product', {
        defaults: {
            name: '',
            configurations: List
        },
        getIndexOfConfiguration: function (configuration) {
            if (this.$.configurations) {
                return this.$.configurations.indexOf(configuration);
            }
            return -1;
        },
        numConfigurations: function () {
            return this.$.configurations.$.size();
        }
    })
});