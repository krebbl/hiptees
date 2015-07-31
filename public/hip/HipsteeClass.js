define(
    ["js/core/Application",
        "js/core/List",
        "js/core/Bindable",
        "hip/model/Design",
        "hip/model/Product",
        "hip/entity/ImageConfiguration",
        "hip/entity/TextConfiguration",
        'hip/entity/RectangleConfiguration',
        "hip/entity/Filter",
        "hip/command/ApplyFilter",
        "hip/command/text/DeleteText", "hip/command/text/InsertLine", "hip/command/text/InsertText",
        "text/entity/TextFlow",
        "text/entity/TextRange",
        "text/operation/ApplyStyleToElementOperation",
        "text/type/Style"
    ],
    function (Application, List, Bindable, Design, Product, ImageConfiguration, TextConfiguration, RectangleConfiguration, Filter, ApplyFilter, DeleteText, InsertLine, InsertText, TextFlow, TextRange, ApplyStyleToElementOperation, Style) {

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

                image: "./img/productType/tshirt.png",
                size: {
                    width: 813.73,
                    height: 813.73,
                    unit: "mm"
                },
                printArea: {
                    offset: {
                        x: 252.213,
                        y: 151.121,
                        unit: "mm"
                    },
                    width: 308.0549199062,
                    height: 569.610983966,
                    unit: "mm"
                }
            }
        });

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
                fontSize: "{selectedConfiguration.fontSize}"
            },
            /**
             *  initializes the application variables
             */
            initialize: function () {
                var design = new Design({
                    id: "palmen-im-himmel",
                    image: {
                        url: "./example/palmen-im-himmel.jpg",
                        small: "./example/palmen-im-himmel_small.jpg"
                    },
                    size: {
                        width: 547,
                        height: 411
                    }
                });

                var design2 = new Design({
                    id: "download",
                    image: {
                        url: "./example/Download.png",
                        small: "./example/Download_small.png"
                    },
                    size: {
                        width: 800,
                        height: 532
                    }
                });

                var imageConfiguration = new ImageConfiguration({
                    design: design,
                    filter: new Filter({
                        "brightness": 0,
                        "contrast": -60,
                        "tint": 0,
                        "saturation": 0
                    }),
                    size: {
                        width: 308,
                        height: 205
                    },
                    filters: []
                });

                var imageConfiguration2 = new ImageConfiguration({
                    design: design2,
                    size: {
                        width: 200,
                        height: 205
                    },
                    filters: []
                });

                var textFlow = TextFlow.initializeFromText("Dude\n\nDude");
                (new ApplyStyleToElementOperation(TextRange.createTextRange(0, textFlow.textLength()), textFlow, new Style({
                    color: '#00FF00'
                }), new
                    Style({
                    fontFamily: 'Graduate-Regular',
                    fontSize: 20,
                    lineHeight: 2,
                    letterSpacing: 0,
                    textAlign: "center"
                }))).doOperation();

                (new ApplyStyleToElementOperation(TextRange.createTextRange(0, 2), textFlow, new Style({
                    color: '#FFFF00'
                }))).doOperation();

                (new ApplyStyleToElementOperation(TextRange.createTextRange(2, 4), textFlow, new Style({
                    color: '#FF0000'
                }))).doOperation();

                var textConfiguration = new TextConfiguration({
                    textFlow: textFlow,
                    size: {
                        width: 100,
                        height: 30
                    },
                    position: {
                        x: 10,
                        y: 0.2
                    }
                });

//                var text = new Text({
//                        fontFamily: '',
//                        letterSpacing: 0
//                    }),
//                    paragraph = new Paragraph(),
//                    span = new Span({
//                        fill: "blue"
//                    }, "text");


                var textConfiguration2 = new TextConfiguration({
//                    text: ["Èg","test", "line3", "line4", "line5", "line6", "line7", "line8", "line10", "line11", "line12", "line13", "line14"].join(""),
                    textFlow: ["abcde" + "fghijklmnopq" + "rsuvwxyz0123456789"],
                    fontFamily: "HammersmithOne",
                    letterSpacing: 0,
                    color: '#00FF00',
                    fontSize: 20,
                    lineHeight: 1.7,
                    textAlign: "left",
                    size: {
                        width: 100,
                        height: 30
                    },
                    position: {
                        x: 10,
                        y: 0.4
                    }
                });

                var rectangleConfig = new RectangleConfiguration({
                    fill: "black"
                });

                var productType = new ProductType();
                var product = new Product({
                    productType: productType
                });

                product.$.configurations.add(imageConfiguration);
                product.$.configurations.add(imageConfiguration2);
//                product.$.configurations.add(rectangleConfig);
                product.$.configurations.add(textConfiguration);
//                product.$.configurations.add(textConfiguration2);

                this.set('textConfiguration', textConfiguration);
                this.set('product', product);
            },

            _commitSelectedConfiguration: function (selected) {
//                console.log(selected);
            },

            _selectFont: function (font) {

                var command = new ChangeFontFamily({
                    fontFamily: font.name,
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
                this.$.executor.addCommandHandler(this.$.imageConfigurationHandler);
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

            _handleSaturationChange: function (e) {
//                e.preventDefault();

                var gray = parseFloat(this.$.gray);

                var filter = this.get('selectedConfiguration.filter');
                if (filter) {
                    filter.set('saturation', gray);
                }
//                var command = new ApplyFilter({
//                    filter: new SaturationFilter({saturation: gray}),
//                    configuration: this.$.selectedConfiguration
//                });
//                this.$.executor.storeAndExecute(command);
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
            },
            minusHalf: function (n) {
                return -0.5 * n;
            }
        });
    }
);