define(["js/data/Model", "hip/util/DataUriToBlob"], function (Model, DataUriToBlob) {

    return Model.inherit('hip.model.Design', {
        defaults: {
            /**
             * A name
             */
            name: '',
            /**
             * If its an image or a an svg
             * @type string
             */
            type: 'image',   // image and svg
            /**
             * size object with width and height
             * @type  Object
             */
            size: Object,

            /**
             * File which will be uploaded
             * @type File
             */
            file: null,
            /**
             * The resource provider for the resource
             * Needed for the resources
             *
             * @type String
             */
            resourceProvider: null,
            resources: {
                PRINT: "",
                SCREEN: "",
                SMALL: ""
            }
        },

        schema: {
            name: {
                type: String,
                required: false
            },
            type: {
                type: String
            },
            size: Object,
            resourceProvider: String,
            resources: {
                type: Object,
                required: false
            }
        },

        getAspectRatio: function () {
            return this.get('size.height') / this.get('size.width');
        },
        compose: function () {
            var ret = this.callBase();

            if (this.$.resourceProvider) {
                delete ret.resources;
            }

            return ret;
        },

        parse: function(data){
            var ret = this.callBase(data);

            if(data.resources && data.resources.SCREEN) {
                ret.file = DataUriToBlob(data.resources.SCREEN);
            }

            return ret;
        }

    })
});