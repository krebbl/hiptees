define([
    "hip/handler/CommandHandler",
    "hip/command/ProductCommand",
    "hip/command/RemoveConfiguration",
    "hip/command/SaveProduct",
    "hip/command/LoadProduct",
    "hip/command/SelectConfiguration",
    "hip/command/CloneConfiguration",
    "hip/command/ChangeOrder",
    "hip/command/AddText",
    "hip/command/AddImageFile",
    "hip/command/AddShape",
    "hip/command/ChangeProductType",
    "hip/entity/TextConfiguration",
    "hip/entity/DesignConfiguration",
    "hip/entity/RectangleConfiguration",
    "hip/entity/CircleConfiguration",
    "hip/model/Design",
    "hip/model/Product",
    "hip/util/CloudinaryImageUploader",
    "xaml!hip/svg/TextMeasurer",
    "xaml!hip/data/HipDataSource",
    "js/data/Collection",
    "text/entity/TextRange",
    "text/operation/ApplyStyleToElementOperation",
    "text/entity/TextFlow",
    "flow",
    "underscore"
], function (Handler, ProductCommand, RemoveConfiguration, SaveProduct, LoadProduct, SelectConfiguration, CloneConfiguration, ChangeOrder, AddText, AddImageFile, AddShape, ChangeProductType, TextConfiguration, DesignConfiguration, RectangleConfiguration, CircleConfiguration, Design, Product, ImageUploader, TextMeasurer, HipDataSource, Collection, TextRange, ApplyStyleToElementOperation, TextFlow, flow, _) {
    return Handler.inherit({
        defaults: {
            api: null,
            product: null,
            selectedConfiguration: null,
            savingProduct: false
        },

        inject: {
            api: HipDataSource,
            imageUploader: ImageUploader,
            textMeasurer: TextMeasurer
        },

        isResponsibleForCommand: function (command) {
            return command instanceof ProductCommand;
        },
        handleCommand: function (command) {
            var configuration = command.$.configuration,
                offset,
                self = this;
            if (command instanceof RemoveConfiguration) {
                if (this.$.product && command.$.configuration) {
                    // only remove it if it was found
                    this.$.product.$.configurations.remove(command.$.configuration);
                    if (command.$.configuration == this.$.selectedConfiguration) {
                        this._selectConfiguration(null);
                    }

                    this.trigger('on:configurationRemoved', {configuration: command.$.configuration});
                }
            } else if (command instanceof SaveProduct) {
                this._saveProduct(this.$.product);
            } else if (command instanceof SelectConfiguration) {
                this._selectConfiguration(command.$.configuration);
            } else if (command instanceof CloneConfiguration) {
                if (configuration) {

                    var clone = configuration.clone();
                    clone.set({
                        id: this._generateConfigurationId(),
                        offset: {
                            x: configuration.get('offset.x') + 10,
                            y: configuration.get('offset.y') + 10
                        }
                    });

                    this.$.product.$.configurations.add(clone);

                    this.trigger('on:configurationCloned', {configuration: clone});
                    this.trigger('on:configurationAdded', {configuration: clone});
                    this._selectConfiguration(clone);
                }
            } else if (command instanceof ChangeOrder) {
                if (configuration) {
                    var index = this.$.product.getIndexOfConfiguration(configuration),
                        newIndex = command.$.index;

                    if (newIndex > index) {
                        newIndex--;
                    }

                    this.$.product.$.configurations.remove(configuration);
                    this.$.product.$.configurations.add(configuration, {index: newIndex});

                    this.trigger('on:configurationOrderChanged', {configuration: configuration, index: command.$.index});
                }
            } else if (command instanceof AddText) {
                var textFlow = TextFlow.initializeFromText(command.$.text || "TEXT");

                offset = this._convertOffset(command.$.offset);

                (new ApplyStyleToElementOperation(TextRange.createTextRange(0, textFlow.textLength() - 1), textFlow, command.$.leafStyle || {}, command.$.paragraphStyle || {
                    letterSpacing: 0,
                    fontSize: 30,
                    lineHeight: 1.3
                })).doOperation();


                configuration = new TextConfiguration({
                    id: this._generateConfigurationId(),
                    textFlow: textFlow,
                    offset: offset
                });

                this._loadConfiguration(configuration, false, function () {
                    self.$.product.$.configurations.add(configuration);

                    self.trigger('on:configurationAdded', {configuration: configuration});
                    self._selectConfiguration(configuration);
                });

            } else if (command instanceof AddImageFile) {
                var file = command.$.file;

                var reader = new FileReader();

                offset = this._convertOffset(command.$.offset);

                var image = new Image();

                image.onload = function (evt) {
                    var designs = self.$.api.createCollection(Collection.of(Design));

                    var design = designs.createItem();

                    design.set({
                        id: null,
                        file: file,
                        type: "image",
                        resources: {
                            original: image.src,
                            SCREEN: self._resizeImage(image, 800, 800),
                            SMALL: self._resizeImage(image, 100, 100)
                        },
                        size: {
                            width: image.width,
                            height: image.height
                        }
                    });

                    var printAreaWidth = self.get('product.productType.printArea.size.width');
                    var height = design.getAspectRatio() * self.get('product.productType.printArea.size.width');
                    configuration = new DesignConfiguration({
                        id: self._generateConfigurationId(),
                        offset: {
                            x: printAreaWidth * 0.5,
                            y: height * 0.5
                        },
                        size: {
                            width: printAreaWidth,
                            height: height
                        },
                        design: design
                    });

                    self.$.product.$.configurations.add(configuration);

                    self.trigger('on:configurationAdded', {configuration: configuration});

                    self._selectConfiguration(configuration);
                };


                reader.onload = function (evt) {
                    image.src = evt.target.result;
                };

                reader.readAsDataURL(file);
            } else if (command instanceof AddShape) {
                var printAreaWidth = self.get('product.productType.printArea.size.width'),
                    printAreaHeight = self.get('product.productType.printArea.size.height');

                var Factory = null;

                if (command.$.type == "circle") {
                    Factory = CircleConfiguration;
                } else if (command.$.type == "rectangle") {
                    Factory = RectangleConfiguration;
                }

                if (Factory) {
                    configuration = new Factory({
                        id: self._generateConfigurationId(),

                        offset: {
                            x: printAreaWidth * 0.5,
                            y: printAreaHeight * 0.2
                        },
                        size: {
                            width: printAreaWidth * 0.5,
                            height: printAreaWidth * 0.5
                        }
                    });

                    self.$.product.$.configurations.add(configuration);

                    self.trigger('on:configurationAdded', {configuration: configuration});

                    self._selectConfiguration(configuration);
                }

            } else if (command instanceof ChangeProductType) {

                var currentProductType = this.get('product.productType');
                if (currentProductType) {
                    // TODO: convert configurations to new productType

                }
                var defaultAppearance = command.$.productType.$.appearances.find(function (app) {
                    return app.$.id == command.$.productType.$.defaultAppearanceId
                });

                this.$.product.set({
                    'appearance': defaultAppearance,
                    'productType': command.$.productType
                });
                this.trigger('on:productTypeChanged', {productType: command.$.productType});
            } else if (command instanceof LoadProduct) {

                var products = this.$.api.createCollection(Collection.of(Product));
                var product = products.createItem(command.$.productId),
                    loadLazy = command.$.lazy,
                    callback = command.$.callback || function () {
                    };


                flow()
                    .seq("product", function (cb) {
                        product.fetch({}, cb);
                    })
                    .seq("productType", function (cb) {
                        this.vars.product.$.productType.fetch({}, cb);
                    })
                    .seq(function (cb) {
                        flow()
                            .parEach(this.vars.product.$.configurations, function (configuration, cb) {
                                self._loadConfiguration(configuration, loadLazy, cb);
                            })
                            .exec(cb);
                    })
                    .exec(function (err, results) {
                        if (!err) {
                            self.set('product', results.product);
                        }
                        callback && callback();
                    });

            }

        },

        _loadConfiguration: function (configuration, loadLazy, callback) {
            if (configuration instanceof DesignConfiguration) {
                flow()
                    .seq("design", function (cb) {
                        configuration.$.design.fetch(cb);
                    })
                    .seq(function (cb) {
                        if (!loadLazy) {
                            var image = new Image();

                            image.onload = function () {
                                cb();
                            };

                            image.src = this.vars.design.$.resources.SCREEN;
                        } else {
                            cb();
                        }
                    })
                    .exec(callback);
            } else if (configuration instanceof TextConfiguration) {
                if (!loadLazy) {
                    var textFlow = configuration.$.textFlow;
                    var style = TextRange.createTextRange(0, 1).getCommonParagraphStyle(textFlow);

                    this.$.textMeasurer.loadFont(style.$.fontFamily, function (err) {
                        callback && callback(err);
                    });
                } else {
                    callback();
                }

            } else {
                callback && callback();
            }
        },

        _generateConfigurationId: function () {
            return '_' + Math.random().toString(36).substr(2, 9)
        },

        _convertOffset: function (offset) {
            var ret = {x: 0, y: 0};

            if (offset) {
                if (offset.x <= 1) {
                    ret.x = this.get('product.productType.printArea.size.width') * offset.x;
                    ret.y = this.get('product.productType.printArea.size.height') * offset.y;
                } else {
                    ret.x = offset.x;
                    ret.y = offset.y;
                }
            }

            return ret;
        },

        _resizeImage: function (image, maxWidth, maxHeight) {
            var width = image.width;
            var height = image.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            if (!this.$canvas) {
                this.$canvas = this.$stage.$document.createElement("canvas");
                this.$stage.$document.body.appendChild(this.$canvas);
            }


            this.$canvas.width = width;
            this.$canvas.height = height;
            var ctx = this.$canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, width, height);


            return this.$canvas.toDataURL();
        },

        _selectConfiguration: function (configuration) {
            this.set('selectedConfiguration', configuration);
            this.trigger('on:configurationSelected', {configuration: configuration});
        },

        _saveProduct: function (product, cb) {
            var newDesigns = [];

            product.$.configurations.each(function (configuration) {
                if (configuration instanceof DesignConfiguration) {
                    if (configuration.$.design.isNew()) {
                        newDesigns.push(configuration.$.design);
                    }
                }
            });

            // filter out duplicate designs
            newDesigns = _.uniq(newDesigns, false, function (a, b) {
                return  a && b && a.$.file === b.$.file;
            });

            var self = this;

            flow()
                .seqEach(newDesigns, function (design, cb) {
                    flow()
                        .seq(function (cb) {
                            design.set('resourceProvider', self.$.imageUploader.$.name);
                            design.save({}, cb)
                        })
                        .seq(function (cb) {
                            var options = {};

                            self.$.imageUploader.uploadFile(design.$.id, design.$.file, options, cb);
                        })
                        .exec(cb);
                })
                .seq(function (cb) {
                    product.save(cb);
                })
                .exec(cb);

        }
    })
});