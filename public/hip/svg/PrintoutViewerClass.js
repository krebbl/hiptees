define(['js/svg/Svg', 'xaml!hip/svg/PrintAreaViewer', "hip/action/ProductActions", "js/svg/SvgElement"], function (Svg, PrintAreaViewerSvg, ProductActions, SvgElement) {

    return Svg.inherit('', {

        defaults: {
            addedToDom: false,
            width: 1000,
            height: 1000,
            product: "{productStore.product}",
            productType: "{productStore.product.productType}",
            printArea: "{productType.printArea}"
        },

        inject: {
            productActions: ProductActions
        },

        $classAttributes: ["product", "productType", "printArea"],


        ctor: function () {
            this.callBase();

            this.$printAreaViewer = null;
        },

        _bindDomEvents: function () {
            this.callBase();
            var self = this;

            this.bindDomEvent('click', function (e) {
                self.$.productActions.selectConfiguration({});
            }, false);
        },

        _onDomAdded: function () {
            this.callBase();

            var box = this.$el.getBoundingClientRect();
            this.set({
                'width': box.height,
                'height': box.height
            });

            this._renderPrintArea(this.$.printArea);
            this.set('addedToDom', true);
        },

        _renderPrintArea: function (printArea) {

            if (printArea && this.$addedToDom) {
                var width = printArea.get('size.width'),
                    height = printArea.get('size.height');

                this.setViewBox(0, 0, width, height);
            } else {
                // TODO: clear the stuff
            }

        }

    });


});