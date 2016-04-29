define(["js/ui/View", 'text/entity/TextRange', "js/type/Color", "js/core/I18n", "hip/action/TextFlowActions"], function (View, TextRange, Color, I18n, TextFlowActions) {
    return View.inherit({
        defaults: {
            textFlow: null,
            _brightnessClass: "dark",
            _leafStyle: null,
            _paragraphStyle: null,
            _text: null
        },

        inject: {
            i18n: I18n,
            textActions: TextFlowActions
        },

        events: [
            'on:cancel',
            'on:save'
        ],

        _commitTextFlow: function (textFlow) {
            var t = '',
                paragraphStyle = null,
                leafStyle = null,
                bClass = "dark";
            if (textFlow) {
                t = textFlow.text(0, textFlow.textLength(), "\n").replace(/\n$/, "");
                var range = new TextRange({anchorIndex: 0, activeIndex: textFlow.textLength()});
                leafStyle = range.getCommonLeafStyle(textFlow);
                paragraphStyle = range.getCommonParagraphStyle(textFlow);

                var color = Color.fromHexString(leafStyle.$.color);

                var hsl = color.toHSB();
                if (hsl.b < 70) {
                    bClass = 'bright';
                }

            }
            this.set({
                _brightnessClass: bClass,
                _text: t,
                _leafStyle: leafStyle,
                _paragraphStyle: paragraphStyle
            })
        },

        focus: function () {

            var evt = document.createEvent('Event');
            evt.initEvent('click', true, true);
            this.$el.dispatchEvent(evt);

            this.$.textArea && this.$.textArea.focus();
        },

        cancel: function () {
            this.trigger('on:cancel');
        },

        saveText: function (e) {
            e && e.preventDefault();

            this.trigger('on:save', {text: this.$.textArea.$el.value});
        }


    })
});