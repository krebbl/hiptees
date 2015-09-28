define([
    "hip/handler/CommandHandler",
    "hip/command/ProductCommand",
    "hip/command/RemoveConfiguration",
    "hip/command/SaveProduct",
    "hip/command/LoadProduct",
    "hip/command/SelectConfiguration",
    "hip/command/PointDownConfiguration",
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
    "hip/util/ImageFileReader",
    "xaml!hip/svg/TextMeasurer",
    "xaml!hip/data/HipDataSource",
    "js/data/Collection",
    "text/entity/TextRange",
    "text/operation/ApplyStyleToElementOperation",
    "text/entity/TextFlow",
    "flow",
    "underscore"
], function (Handler, ProductCommand, RemoveConfiguration, SaveProduct, LoadProduct, SelectConfiguration, PointDownConfiguration, CloneConfiguration, ChangeOrder, AddText, AddImageFile, AddShape, ChangeProductType, TextConfiguration, DesignConfiguration, RectangleConfiguration, CircleConfiguration, Design, Product, ImageUploader, ImageFileReader, TextMeasurer, HipDataSource, Collection, TextRange, ApplyStyleToElementOperation, TextFlow, flow, _) {
    var undefined;

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
            imageFileReader: ImageFileReader,
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
                this._saveProduct(this.$.product, command.$.state);
            } else if (command instanceof SelectConfiguration) {
                this._selectConfiguration(command.$.configuration);
            } else if (command instanceof PointDownConfiguration) {
                this.trigger('on:configurationPointDown', {configuration: command.$.configuration}, this);
            } else if (command instanceof CloneConfiguration) {
                if (configuration) {

                    var newConfig = this.$.product.createEntity(configuration.factory, this._generateConfigurationId());
                    var clone = configuration.clone();
                    clone.unset('id');
                    clone.set({
                        offset: {
                            x: configuration.get('offset.x') + 10,
                            y: configuration.get('offset.y') + 10
                        }
                    });

                    newConfig.set(clone.$);

                    this.$.product.$.configurations.add(newConfig);

                    this.trigger('on:configurationCloned', {configuration: newConfig});
                    this.trigger('on:configurationAdded', {configuration: newConfig, cloned: true});
                    this._selectConfiguration(newConfig);
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

                    this.trigger('on:configurationOrderChanged', {
                        configuration: configuration,
                        index: command.$.index
                    });
                }
            } else if (command instanceof AddText) {
                var textFlow = TextFlow.initializeFromText(command.$.text || "TEXT");

                offset = this._convertOffset(command.$.offset);

                var leafStyle = command.$.leafStyle || {};
                leafStyle.color = this.get('product.appearance.name') == "black" ? "#ffffff" : "#000000";

                (new ApplyStyleToElementOperation(TextRange.createTextRange(0, textFlow.textLength() - 1), textFlow, leafStyle, command.$.paragraphStyle || {
                    letterSpacing: 0,
                    fontSize: 30,
                    lineHeight: 1.3
                })).doOperation();


                configuration = this.$.product.createEntity(TextConfiguration, this._generateConfigurationId());

                configuration.set({
                    textFlow: textFlow,
                    offset: offset
                });
//
                if (!textFlow.$.selection) {
                    textFlow.set('selection', TextRange.createTextRange(0, textFlow.textLength() - 1));
                }

                this._loadConfiguration(configuration, false, function () {
                    self.$.product.$.configurations.add(configuration);

                    self.trigger('on:configurationAdded', {configuration: configuration, cloned: false});
                    self._selectConfiguration(configuration);
                });

            } else if (command instanceof AddImageFile) {
                var file = command.$.file;

                if (!file) {
                    return;
                }

                offset = this._convertOffset(command.$.offset);

                var imageFileReader = this.$.imageFileReader;

                imageFileReader.readFile(file, function (err, image) {
                    if (!err) {
                        var designs = self.$.api.createCollection(Collection.of(Design));

                        var design = designs.createItem();

                        design.set({
                            id: null,
                            file: file,
                            type: "image",
                            resources: {
                                SCREEN: imageFileReader.resizeImage(image, 800, 800),
                                SMALL: imageFileReader.resizeImage(image, 100, 100)
                            },
                            size: {
                                width: image.width,
                                height: image.height
                            }
                        });

                        var printAreaWidth = self.get('product.productType.printArea.size.width');
                        var height = design.getAspectRatio() * self.get('product.productType.printArea.size.width');
                        configuration = self.$.product.createEntity(DesignConfiguration, self._generateConfigurationId());
                        configuration.set({
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

                    }
                    self.trigger('on:imageAdded', {});
                });


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
                    configuration = this.$.product.createEntity(Factory, self._generateConfigurationId());
                    configuration.set({
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

                if (!defaultAppearance) {
                    defaultAppearance = command.$.productType.$.appearances.at(0);
                }

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

                self._selectConfiguration(null);

                flow()
                    .seq("product", function (cb) {
                        product.fetch({
                            noCache: command.$.noCache || false
                        }, cb);
                    })
                    .seq("productType", function (cb) {
                        this.vars.product.$.productType.fetch({}, cb);
                    })
                    .par(function (cb) {
                        var appearanceId = this.vars.product.get('appearance.id');
                        var appearance = this.vars.productType.$.appearances.find(function (a) {
                            return a.$.id == appearanceId;
                        });
                        product.set('appearance', appearance);
                        if (!loadLazy) {
                            var img = new Image();

                            img.onload = function () {
                                cb();
                            };

                            img.src = appearance.$.resources.MEDIUM;
                        } else {
                            cb();
                        }
                    }, function (cb) {
                        flow()
                            .parEach(this.vars.product.$.configurations.toArray(), function (configuration, cb) {
                                self._loadConfiguration(configuration, command.$.lazyLoadConfigurations, cb);
                            })
                            .exec(cb);
                    })
                    .exec(function (err, results) {
                        var p = results.product;
                        if (!err) {
                            if (command.$.asPreset) {
                                p = p.clone();
                                p.set('id', undefined);
                                p.set('state', null);
                            }
                            self.set('product', p, {force: true});
                            self.trigger('on:productLoaded', {product: p});
                        }
                        callback && callback(err, p);
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

        _selectConfiguration: function (configuration) {
            if (this.$.selectedConfiguration instanceof TextConfiguration) {
                if (this.$.selectedConfiguration.$.textFlow.textLength() <= 1) {
                    this.$.product.$.configurations.remove(this.$.selectedConfiguration);
                    this.trigger('on:configurationRemoved', {configuration: this.$.selectedConfiguration});
                }
            }
            this.set('selectedConfiguration', configuration);
            this.trigger('on:configurationSelected', {configuration: configuration});
        },

        _saveProduct: function (product, state, cb) {
            this.trigger('on:productSave', {product: product});
            var newDesigns = [];
            var stateBefore = product.get('state');

            product.$.configurations.each(function (configuration) {
                if (configuration instanceof DesignConfiguration) {
                    if (configuration.$.design.isNew()) {
                        newDesigns.push(configuration.$.design);
                    }
                }
            });

            // filter out duplicate designs
            newDesigns = _.uniq(newDesigns, false, function (a, b) {
                return a && b && a.$.file === b.$.file;
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
                    if (state) {
                        product.set('state', state);
                    }
                    product.save(null, cb);
                })
                .exec(function (err, results) {
                    if (!err) {
                        self.trigger('on:productSaved', {product: product, stateBefore: stateBefore}, self);
                    } else {
                        self.trigger('on:productSavedFailed', {err: err});
                        product.set('state', stateBefore);
                    }

                    cb && cb(err, product);
                });

        }
    })
});