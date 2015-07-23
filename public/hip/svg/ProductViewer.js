define(['js/svg/Svg', 'hip/svg/PrintAreaViewer', "hip/command/Executor", "hip/command/SelectConfiguration", "js/svg/SvgElement"], function (Svg, PrintAreaViewerSvg, Executor, SelectConfiguration, SvgElement) {

    return Svg.inherit('', {

        defaults: {
            width: 1000,
            height: 1000,
            product: null,
            productType: "{product.productType}"
        },

        inject: {
            executor: Executor
        },

        $classAttributes: ["product", "productType"],


        ctor: function () {
            this.callBase();

            this.$printAreaViewer = null;

        },

        _bindDomEvents: function () {
            this.callBase();
            var self = this;

            this.bindDomEvent('click', function (e) {
                console.log(e);
                self.$.executor.storeAndExecute(new SelectConfiguration());
            }, false);
        },

        _onDomAdded: function () {
            this.callBase();

            this.setViewBox(0, 0, this.get('productType.size.width'), this.get('productType.size.height'));
        },

        _renderProductType: function (productType) {

            if (productType) {
                var width = productType.get('size.width'),
                    height = productType.get('size.height');

                this.setViewBox(0, 0, width, height);

                if (this.$printAreaViewer) {
                    // TODO: destroy and create a new one
                }

                if (!this.$printAreaViewer) {


                    var printAreaViewer = this.createComponent(PrintAreaViewerSvg, {
                        printArea: productType.get('printArea'),
                        product: this.$.product
                    });

                    var group = this.createComponent(SvgElement, {
                        tagName: 'g'
                    });

                    this.addChild(group);

                    group.addChild(printAreaViewer);

                    this.$printAreaViewer = group;
                } else {
                    // // TODO: set printArea
                }
            } else {
                // TODO: clear the stuff
            }

        }

    });


});