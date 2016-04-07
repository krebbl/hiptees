define(["hip/store/Store", "hip/entity/TextConfiguration",
    "hip/entity/DesignConfiguration",
    "hip/entity/RectangleConfiguration",
    "hip/entity/CircleConfiguration",
    "hip/entity/ShapeConfiguration",
    "hip/entity/PathConfiguration",
    "hip/entity/Filter",
    "hip/model/Design",
    "hip/model/Product",
    "hip/model/UpdateProductState",
    "hip/util/CloudinaryImageUploader",
    "hip/util/ImageFileReader",
    "xaml!hip/svg/TextMeasurer",
    "xaml!hip/data/HipDataSource",
    "js/data/Collection",
    "text/entity/TextRange",
    "text/operation/ApplyStyleToElementOperation",
    "text/entity/TextFlow",
    "flow",
    "underscore"], function (Store, TextConfiguration, DesignConfiguration, RectangleConfiguration, CircleConfiguration, ShapeConfiguration, PathConfiguration, Filter, Design, Product, UpdateProductState, ImageUploader, ImageFileReader, TextMeasurer, HipDataSource, Collection, TextRange, ApplyStyleToElementOperation, TextFlow, flow, _) {


    return Store.inherit({
        ns: "product",

        defaults: {
            product: null,
            selectedConfiguration: null,
            loadingProduct: false,
            activeTextConfiguration: null,
            selectedSize: null,
            loading: false,
            zoomedConfiguration: null,
            memento: null,
            usedColors: []
        },
        inject: {
            api: HipDataSource,
            imageUploader: ImageUploader,
            imageFileReader: ImageFileReader,
            textMeasurer: TextMeasurer
        },

        selectSize: function (payload) {
            this.set('selectedSize', payload.size);
        },

        removeConfiguration: function (payload) {
            if (this.$.product && payload.configuration) {
                // only remove it if it was found
                this.$.product.$.configurations.remove(payload.configuration);
                if (payload.configuration == this.$.selectedConfiguration) {
                    this._selectConfiguration(null);
                }
                this.trigger('on:configurationRemoved', {configuration: payload.configuration});
            }
        },

        zoomConfiguration: function (payload) {
            this.set('zoomedConfiguration', payload.configuration);
        },

        moveConfiguration: function (payload) {
            var configuration = payload.configuration;
            var change = {};

            if (payload.size) {
                change.size = payload.size;
            }
            if (payload.offset) {
                change.offset = payload.offset;
            }
            configuration.set(change);

            this.trigger('on:configurationMoved', {configuration: configuration});
        },

        cloneConfiguration: function (payload) {
            var configuration = payload.configuration;
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
        },

        applyFilter: function (payload) {
            var configuration = payload.configuration;
            if (configuration instanceof DesignConfiguration) {
                var filterChange = payload.filterChange;
                if (!configuration.$.filter) {
                    configuration.set('filter', new Filter(filterChange));
                } else {
                    configuration.$.filter.set(filterChange);
                }
                this.trigger('on:filterChanged', configuration);
            }
        },

        selectConfiguration: function (payload) {
            this._selectConfiguration(payload.configuration);
        },

        changeShapeConfiguration: function (payload) {
            var configuration = payload.configuration;
            if (configuration instanceof ShapeConfiguration) {
                configuration.set(payload.change || {});
                this.trigger('on:configurationChanged', {configuration: configuration, preview: payload.preview});
            }
        },

        editTextConfiguration: function (payload) {
            var configuration = payload.configuration;
            if (configuration) {
                var textFlow = configuration.$.textFlow;
                if (textFlow) {
                    var totalLength = textFlow.textLength() - 1;
                    if (!textFlow.$.selection) {
                        textFlow.set('selection', TextRange.createTextRange(totalLength, totalLength));
                    } else {
                        textFlow.$.selection.set({
                            anchorIndex: totalLength,
                            activeIndex: totalLength
                        })
                    }
                }
            }

            this.set('activeTextConfiguration', configuration);
        },

        changeOrder: function (payload) {
            var configuration = this.$.selectedConfiguration;
            if (configuration) {
                var index = this.$.product.getIndexOfConfiguration(configuration),
                    newIndex = payload.index;

                if (newIndex > index) {
                    newIndex--;
                }

                this.$.product.$.configurations.remove(configuration);
                this.$.product.$.configurations.add(configuration, {index: newIndex});

                this.trigger('on:configurationOrderChanged', {
                    configuration: configuration,
                    index: payload.index
                });
            }
        },

        undo: function () {
            var state = this.$.memento.getUndoState();
            //console.log(this.$.memento.$.states[0].configurations[2].textFlow.children[0].style);
            if (state) {
                state.sync();
                this._selectConfiguration(null);
                this.trigger('on:productRecovered', {product: this.$.product});
            }
        },

        redo: function () {
            var state = this.$.memento.getRedoState();
            //console.log(this.$.memento.$.states[0].configurations[2].textFlow.children[0].style);

            if (state) {
                state.sync();
                this._selectConfiguration(null);
                this.trigger('on:productRecovered', {product: this.$.product});
            }
        },

        addText: function (payload) {
            var textFlow = TextFlow.initializeFromText(payload.text || "TEXT");
            var self = this;
            var offset = this._convertOffset(payload.offset);

            var leafStyle = payload.leafStyle || {};
            leafStyle.color = this.get('product.appearance.name') == "black" ? "#ffffff" : "#000000";

            (new ApplyStyleToElementOperation(TextRange.createTextRange(0, textFlow.textLength() - 1), textFlow, leafStyle, payload.paragraphStyle || {
                    letterSpacing: 0,
                    fontSize: 30,
                    lineHeight: 1.3
                })).doOperation();


            var configuration = this.$.product.createEntity(TextConfiguration, this._generateConfigurationId());

            configuration.set({
                textFlow: textFlow,
                offset: offset
            });
//
            if (!textFlow.$.selection) {
                textFlow.set('selection', TextRange.createTextRange(0, textFlow.textLength() - 1));
            }
            this.set('loading', true);
            this._loadConfiguration(configuration, false, false, function () {
                self.$.product.$.configurations.add(configuration);

                self.set('loading', false);
                self.trigger('on:configurationAdded', {configuration: configuration, cloned: false});
                self._selectConfiguration(configuration);
                self.editTextConfiguration(configuration);

                self._calculateUsedColors();
            });
        },

        addImageFile: function (payload) {

            this.set('loading', true);
            var file = payload.file;

            if (!file) {
                return;
            }

            var offset = this._convertOffset(payload.offset);
            var configuration;
            var self = this;

            this._imageFileToDesign(file, function (err, design) {
                if (!err) {
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
                    self.set('loading', false);
                }
            });
        },
        addShape: function (payload) {
            var printAreaWidth = this.get('product.productType.printArea.size.width'),
                printAreaHeight = this.get('product.productType.printArea.size.height');

            var Factory = null,
                configuration,
                configurationSettings = {};

            if (payload.type == "circle") {
                Factory = CircleConfiguration;
            } else if (payload.type == "rectangle") {
                Factory = RectangleConfiguration;
            } else if (payload.type == "heart") {
                Factory = PathConfiguration;
                configurationSettings.path = "M 297.29747,550.86823 C 283.52243,535.43191 249.1268,505.33855 220.86277,483.99412 C 137.11867,420.75228 125.72108,411.5999 91.719238,380.29088 C 29.03471,322.57071 2.413622,264.58086 2.5048478,185.95124 C 2.5493594,147.56739 5.1656152,132.77929 15.914734,110.15398 C 34.151433,71.768267 61.014996,43.244667 95.360052,25.799457 C 119.68545,13.443675 131.6827,7.9542046 172.30448,7.7296236 C 214.79777,7.4947896 223.74311,12.449347 248.73919,26.181459 C 279.1637,42.895777 310.47909,78.617167 316.95242,103.99205 L 320.95052,119.66445 L 330.81015,98.079942 C 386.52632,-23.892986 564.40851,-22.06811 626.31244,101.11153 C 645.95011,140.18758 648.10608,223.6247 630.69256,270.6244 C 607.97729,331.93377 565.31255,378.67493 466.68622,450.30098 C 402.0054,497.27462 328.80148,568.34684 323.70555,578.32901 C 317.79007,589.91654 323.42339,580.14491 297.29747,550.86823 z";
                configurationSettings.pathDimensions = {
                    width: 646,
                    height: 610
                };
            } else if (payload.type == "star") {
                Factory = PathConfiguration;
                configurationSettings.path = "m25,1 6,17h18l-14,11 5,17-15-10-15,10 5-17-14-11h18z";
                configurationSettings.pathDimensions = {
                    width: 50,
                    height: 47
                };
            }

            if (Factory) {
                configuration = this.$.product.createEntity(Factory, this._generateConfigurationId());

                configurationSettings.offset = {
                    x: printAreaWidth * 0.5,
                    y: printAreaHeight * 0.2
                };

                configurationSettings.size = {
                    width: printAreaWidth * 0.5,
                    height: printAreaWidth * 0.5
                };

                configuration.set(configurationSettings);

                this.$.product.$.configurations.add(configuration);

                this.trigger('on:configurationAdded', {configuration: configuration});

                this._selectConfiguration(configuration);

                this._calculateUsedColors();
            }
        },

        pointDownConfiguration: function (payload) {
            this.trigger('on:configurationPointDown', {configuration: payload.configuration}, this);
        },

        saveProduct: function (payload) {
            this._saveProduct(this.$.product, payload.state, payload.callback);
        },
        replaceImageFile: function (payload) {
            var configuration = payload.configuration;
            if (configuration instanceof DesignConfiguration) {
                if (!payload.file) {
                    return;
                }

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

                var self = this;
                this.set('loading', true);

                this._imageFileToDesign(payload.file, function (err, design) {
                    if (!err) {
                        newConfig.set('design', design);
                        self.$.product.$.configurations.remove(configuration);
                        self.trigger('on:configurationRemoved', {configuration: configuration});

                        self.$.product.$.configurations.add(newConfig);
                        self.trigger('on:configurationAdded', {configuration: newConfig});

                        self.trigger('on:imageReplaced', {configuration: newConfig});
                        self._selectConfiguration(newConfig);
                    }
                    self.set('loading', false);
                });
            }
        },
        changeProductType: function () {
            // TODO: copy
        },

        loadProduct: function (payload) {
            this.set('loadingProduct', true);
            var products = this.$.api.createCollection(Collection.of(Product));
            var product = products.createItem(payload.productId),
                loadLazy = payload.lazy,
                callback = payload.callback || function () {
                    },
                self = this;

            self._selectConfiguration(null);
            this.set('selectedSize', null);
            flow()
                .seq("product", function (cb) {
                    product.fetch({
                        noCache: payload.noCache || false
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
                            self._loadConfiguration(configuration, payload.lazyLoadConfigurations, payload.originalImages, cb);
                        })
                        .exec(cb);
                })
                .exec(function (err, results) {
                    var p = results.product;
                    if (!err) {
                        if (payload.asPreset) {
                            p = p.clone();
                            p.set('id', undefined);
                            p.set('state', null);
                        }
                        self.set('product', p, {force: true});
                        self.trigger('on:productLoaded', {product: p});
                        var size = p.$.configurations.size();
                        if (size) {
                            self._selectConfiguration(p.$.configurations.at(size - 1));
                        }
                        self._calculateUsedColors();
                    } else {
                        console.warn(err);
                    }

                    callback && callback(err, p);
                    self.set('loadingProduct', false);
                });
        },
        changeProductState: function () {
            // TODO: implement
        },

        _selectConfiguration: function (configuration) {
            if (this.$.selectedConfiguration instanceof TextConfiguration) {
                if (this.$.selectedConfiguration.$.textFlow.textLength() <= 1) {
                    this.$.product.$.configurations.remove(this.$.selectedConfiguration);
                    this.trigger('on:configurationRemoved', {configuration: this.$.selectedConfiguration});
                }
            }
            this._calculateUsedColors();
            if (!(configuration instanceof TextConfiguration)) {
                this.set('activeTextConfiguration', null);
            }
            this.set('selectedConfiguration', configuration);
            this.trigger('on:configurationSelected', {configuration: configuration});
        },

        _saveProduct: function (product, state, cb) {
            this.trigger('on:productSave', {product: product});
            this.set('savingProduct', true);
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
            if (newDesigns.length > 0) {
                self.trigger('on:uploadingDesigns', {designs: newDesigns}, self);
            }

            flow()
                .seqEach(newDesigns, function (design, cb) {
                    flow()
                        .seq(function (cb) {
                            design.set('resourceProvider', self.$.imageUploader.$.name);
                            design.save({}, cb)
                        })
                        .seq(function (cb) {
                            var options = {};
                            self.$.imageUploader.uploadFile(design.$.id, design.$.file, options, function (err) {
                                if (!err) {
                                    self.trigger('on:designImageUploaded', {design: design}, self);
                                } else {
                                    self.trigger('on:designImageUploadFailed', {design: design}, self);
                                }
                                cb(err);
                            });
                        })
                        .exec(cb);
                })
                .seq("savedProduct", function (cb) {
                    if (state) {
                        product.set('state', state);
                    }
                    var clonedProduct = product.clone();

                    clonedProduct.save(null, cb);
                })
                .exec(function (err, results) {
                    if (!err) {
                        self.trigger('on:productSaved', {product: product, stateBefore: stateBefore}, self);
                    } else {
                        self.trigger('on:productSaveFailed', {err: err});
                        product.set('state', stateBefore);
                    }
                    self.set('savingProduct', false);
                    cb && cb(err, results.savedProduct);
                });

        },
        _generateConfigurationId: function () {
            return '_' + Math.random().toString(36).substr(2, 9)
        },
        _imageFileToDesign: function (file, callback) {
            var imageFileReader = this.$.imageFileReader,
                self = this;

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


                }
                callback && callback(err, design);
            });
        },
        _loadConfiguration: function (configuration, loadLazy, loadOriginalImage, callback) {
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

                            image.onerror = function () {
                                console.log("error while loading image");
                            };

                            var src = this.vars.design.$.resources.SCREEN;
                            if (loadOriginalImage) {
                                src = this.vars.design.$.resources.ORIGINAL || src;
                            }
                            image.src = src;
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

        _calculateUsedColors: function () {
            var usedColors = [];

            function addColor(color) {
                if (usedColors.indexOf(color) === -1) {
                    usedColors.push(color);
                }
            }

            if (this.$.product) {
                this.$.product.$.configurations.each(function (config) {
                    if (config instanceof ShapeConfiguration) {
                        if (config.$.fillOpacity > 0) {
                            addColor(config.$.fill);
                        }
                        if (config.$.strokeWidth > 0) {
                            addColor(config.$.stroke);
                        }
                    } else if (config instanceof TextConfiguration) {
                        var leaf = config.$.textFlow.getFirstLeaf();
                        if (leaf) {
                            addColor(leaf.$.style.$.color);
                        }
                    }
                });

                this.set('usedColors', usedColors);

            }
        },

        getMementoState: function () {
            return this.$.product.clone();
        },
        setMementoState: function (state) {
            // TODO: implement
        }
    });

});