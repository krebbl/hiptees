define(
    ["js/core/Application",
        "js/core/List",
        "js/core/Bindable",
        "hip/model/ImageConfiguration",
        "hip/model/TextConfiguration",
        "hip/command/ChangeTextColor",
        "hip/command/ChangeFontSize",
        "hip/command/ChangeFontFamily",
        "hip/command/ApplyFilter",
        "hip/entity/GrayFilter",
        "hip/entity/SaturationFilter",
        "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText"],
    function (Application, List, Bindable, ImageConfiguration, TextConfiguration, ChangeTextColor, ChangeFontSize, ChangeFontFamily, ApplyFilter, GrayFilter, SaturationFilter, DeleteText, InsertLine, InsertText) {

        var Product = Bindable.inherit({
            defaults: {
                productType: null,
                configurations: List
            }
        });

        var textObject = {
            textFlow: ["abc", "a"],
            fontFamily: "denseregular",
            lineHeight: 1.6,
            fontSize: 20,
            // svg unit
            maxWidth: 300

        };

        var ProductType = Bindable.inherit({
            defaults: {
//                image: "/image-server/v1/productTypes/812/views/1/appearances/1,width=1000,height=1000",

                image: "/example/shirt.png",
                size: {
                    width: 813.73,
                    height: 813.73,
                    unit: "mm"
                },
                printArea: {
                    offset: {
                        x: 241.213,
                        y: 151.121,
                        unit: "mm"
                    },
                    width: 308.0549199062,
                    height: 569.610983966,
                    unit: "mm"
                }
            }
        });

        var fonts = new List([
            {
                name: 'Arial',
                offset: 0.4
            },
            {
                name: 'Verdana',
                offset: 0
            },
            {
                name: 'bikoblack',
                offset: 0
            },
            {
                name: 'denseregular',
                offset: 0.9
            },
            {
                name: 'Times',
                offset: 0.35
            },
            {
                name: 'Amatic SC',
                offset: 0.5
            }
        ]);

        return Application.inherit({
            defaults: {
                textObject: textObject,
                anchor: 0,
                focus: 0,
                text: "",
                fonts: null,
                executor: null,
                selectionHandler: null,
                selectedConfiguration: "{productHandler.selectedConfiguration}",
                textColor: "{selectedConfiguration.color}",
                fontSize: "{selectedConfiguration.fontSize}",
                gray: "{selectedConfiguration.getFilter('saturation').saturation}"
            },
            /**
             *  initializes the application variables
             */
            initialize: function () {

                var imageConfiguration = new ImageConfiguration({
                    image: {
                        url: "./example/palmen-im-himmel.jpg"
                    },
                    anchor: {
                        x: 0.2,
                        y: 0
                    },
                    scale: 0.8,
                    filters: []
                });

                var textConfiguration = new TextConfiguration({
                    textFlow: ["Yeah"],
                    fontFamily: "denseregular",
                    color: '#00FF00',
                    fontSize: 20,
                    lineHeight: 1.2,
                    textAlign: "center",
                    size: {
                        width: 308,
                        height: 30
                    },
                    position: {
                        x: 10,
                        y: 0.2
                    }
                });

                var textConfiguration2 = new TextConfiguration({
//                    text: ["Èg","test", "line3", "line4", "line5", "line6", "line7", "line8", "line10", "line11", "line12", "line13", "line14"].join(""),
                    textFlow: ["abcde", "fghijklmnopq ","rsuvwxyz0123456789"],
                    fontFamily: "denseregular",
                    color: '#00FF00',
                    fontSize: 20,
                    lineHeight: 1.7,
                    textAlign: "left",
                    size: {
                        width: 308,
                        height: 30
                    },
                    position: {
                        x: 10,
                        y: 0.4
                    }
                });

                var productType = new ProductType();
                var product = new Product({
                    productType: productType
                });

//                product.$.configurations.add(imageConfiguration);
                product.$.configurations.add(textConfiguration);
                product.$.configurations.add(textConfiguration2);

                this.set('textConfiguration', textConfiguration);
                this.set('fonts', fonts);
                this.set('product', product);
            },

            _commitSelectedConfiguration: function (selected) {
                console.log(selected);
            },

            _selectFont: function (font) {

                var command = new ChangeFontFamily({
                    fontFamily: font,
                    configuration: this.$.selectedConfiguration
                });
                this.$.executor.storeAndExecute(command);
            },

            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start: function (parameter, callback) {
                // setup command handlers
                this.$.executor.addCommandHandler(this.$.textConfigurationHandler);
                this.$.executor.addCommandHandler(this.$.applyFilterHandler);
                this.$.executor.addCommandHandler(this.$.productHandler);
                this.$.executor.addCommandHandler(this.$.configurationHandler);
                this.$.executor.addCommandHandler(this.$.textFlowHandler);


                // false - disables autostart
                this.callBase(parameter, false);

                callback();
            },

            changeTextColor: function (e) {
                e.preventDefault();

                var command = new ChangeTextColor({
                    color: this.$.textColor,
                    configuration: this.$.selectedConfiguration
                });
                this.$.executor.storeAndExecute(command);
            },

            changeFontSize: function (e) {
                e.preventDefault();

                var command = new ChangeFontSize({
                    fontSize: this.$.fontSize,
                    configuration: this.$.selectedConfiguration
                });
                this.$.executor.storeAndExecute(command);
            },

            increaseFontSize: function () {
                var currentFontSize = this.get('selectedConfiguration.fontSize');
                if (currentFontSize) {
                    var command = new ChangeFontSize({
                        fontSize: Math.max(0.5, currentFontSize + 0.5),
                        configuration: this.$.selectedConfiguration
                    });
                    this.$.executor.storeAndExecute(command);
                }
            },

            decreaseFontSize: function () {
                var currentFontSize = this.get('selectedConfiguration.fontSize');
                if (currentFontSize) {
                    var command = new ChangeFontSize({
                        fontSize: Math.max(0.5, currentFontSize - 0.5),
                        configuration: this.$.selectedConfiguration
                    });
                    this.$.executor.storeAndExecute(command);
                }
            },

            _handleScaleChange: function (e) {
                var gray = parseFloat(e.target.$el.value) / 25;

                var command = new ApplyFilter({
                    filter: new SaturationFilter({saturation: gray}),
                    configuration: this.$.selectedConfiguration
                });
                this.$.executor.storeAndExecute(command);

            },

            changeGrayScale: function (e) {
                e.preventDefault();
                var gray = parseFloat(this.$.gray);

                var command = new ApplyFilter({
                    filter: new SaturationFilter({saturation: gray}),
                    configuration: this.$.selectedConfiguration
                });
                this.$.executor.storeAndExecute(command);
            },


            transformElement: function (element) {
                return element.toString();
            },
            applyStyle: function (e) {
                if (this.$.selectedParagraph) {
                    this.$.selectedParagraph.set('style', e.target.find("item"));
                }

            },

            activeControl: function () {
                var config = this.$.selectedConfiguration;
                if (!config) {
                    return "none";
                } else if (config instanceof TextConfiguration) {
                    return "text-selected";
                } else if (config instanceof ImageConfiguration) {
                    return "image-selected";
                }
            }.onChange('selectedConfiguration'),

            fontListWidth: function (fonts, width) {

                var f = fonts ? fonts.length : 0;

                return (f * width) + "px"

            },
            _handleClick: function () {

            },
            createImage: function () {
                var image = this.$.productViewer.createImage();
                document.body.appendChild(image);
            },
            _insertChar: function () {
                this.$.executor.storeAndExecute(new InsertText({
                    textObject: this.$.textObject,
                    anchorOffset: this.$.anchor,
                    focusOffset: this.$.focus,
                    text: this.$.text
                }));
            },
            _insertLine: function () {
                this.$.executor.storeAndExecute(new InsertLine({
                    textObject: this.$.textObject,
                    anchorOffset: this.$.anchor,
                    focusOffset: this.$.focus
                }));
            },
            _deleteSelection: function () {
                this.$.executor.storeAndExecute(new DeleteText({
                    textObject: this.$.textObject,
                    anchorOffset: this.$.anchor,
                    focusOffset: this.$.focus
                }));
            }
        });
    }
);