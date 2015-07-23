define(["js/data/Model"], function (Model) {
    return Model.inherit('hip.model.Design', {
        defaults: {
            name: '',
            type: 'image',
            id: '',
            resources: Object,
            size: Object
        },

        getAspectRatio: function () {
            return this.get('size.height') / this.get('size.width');
        }
    })
});