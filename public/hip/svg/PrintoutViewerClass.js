define(['js/svg/Svg', 'xaml!hip/svg/PrintAreaViewer', "hip/command/Executor", "hip/command/SelectConfiguration", "js/svg/SvgElement"], function (Svg, PrintAreaViewerSvg, Executor, SelectConfiguration, SvgElement) {

    return Svg.inherit('', {

        defaults: {
            width: 1000,
            height: 1000,
            product: null,
            productType: "{product.productType}",
            printArea: "{productType.printArea}"
        },

        inject: {
            executor: Executor
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
                self.$.executor.storeAndExecute(new SelectConfiguration());
            }, false);
        },

        _onDomAdded: function () {
            this.callBase();

            if (this.$.productType) {
                this.setViewBox(0, 0, this.get('printArea.size.width'), this.get('printArea.size.height'));
            }

        },

        _renderPrintArea: function (printArea) {

            if (printArea) {
                var width = printArea.get('size.width'),
                    height = printArea.get('size.height');

                this.setViewBox(0, 0, width, height);
            } else {
                // TODO: clear the stuff
            }

        }

    });


});