define(["js/svg/SvgElement"], function (SvgElement) {
    return SvgElement.inherit({

        defaults: {
            tagName: 'g',
            /***
             * the unique name to identify the ContentPlaceHolder
             *
             * @type String
             * @required
             */
            name: null,
            /**
             * the content element to fill the placeHolder
             *
             * @type js.core.Component.Content
             */
            content: null
        },

        _renderContent: function (content) {
            this._clearRenderedChildren();
            this.$children = [];

            if (content) {
                this.$children = content.getChildren();
                this._renderChildren(this.$children);
            }
        }
    });
});