define(["hip/store/Store", "hip/entity/TextConfiguration",
    "hip/entity/DesignConfiguration",
    "hip/entity/RectangleConfiguration",
    "hip/entity/CircleConfiguration",
    "hip/entity/ShapeConfiguration",
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
    "underscore"], function (Store, TextConfiguration, DesignConfiguration, RectangleConfiguration, CircleConfiguration, ShapeConfiguration, Filter, Design, Product, UpdateProductState, ImageUploader, ImageFileReader, TextMeasurer, HipDataSource, Collection, TextRange, ApplyStyleToElementOperation, TextFlow, flow, _) {


    return Store.inherit({
        ns: "product",

        defaults: {
            product: null,
            selectedConfiguration: null,
            loadingProduct: false,
            editing: false,
            activeTextConfiguration: null
        },
        inject: {
            api: HipDataSource,
            imageUploader: ImageUploader,
            imageFileReader: ImageFileReader,
            textMeasurer: TextMeasurer
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

        toggleEditConfiguration: function (payload) {
            this.set('editing', payload.edit);
        },

        changeShapeConfiguration: function (payload) {
            var configuration = payload.configuration;
            if (configuration instanceof ShapeConfiguration) {
                configuration.set(payload.change || {});
            }
        },

        editTextConfiguration: function (payload) {
            this.set('activeTextConfiguration', payload.configuration);
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

            this._loadConfiguration(configuration, false, false, function () {
                self.$.product.$.configurations.add(configuration);

                self.trigger('on:configurationAdded', {configuration: configuration, cloned: false});
                self._selectConfiguration(configuration);
                self.editTextConfiguration(configuration);
            });
        },

        addImageFile: function (payload) {
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
                }
            });
        },
        addShape: function (payload) {
            var printAreaWidth = this.get('product.productType.printArea.size.width'),
                printAreaHeight = this.get('product.productType.printArea.size.height');

            var Factory = null,
                configuration;

            if (payload.type == "circle") {
                Factory = CircleConfiguration;
            } else if (payload.type == "rectangle") {
                Factory = RectangleConfiguration;
            }

            if (Factory) {
                configuration = this.$.product.createEntity(Factory, this._generateConfigurationId());
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

                this.$.product.$.configurations.add(configuration);

                this.trigger('on:configurationAdded', {configuration: configuration});

                this._selectConfiguration(configuration);
            }
        },

        pointDownConfiguration: function (payload) {
            this.trigger('on:configurationPointDown', {configuration: payload.configuration}, this);
        },

        saveProduct: function (payload) {
            this._saveProduct(this.$.product, payload.state);
        },
        replaceImageFile: function (payload) {
            var configuration = paylod.configuration;
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
            if (!configuration) {
                this.set('editing', false);
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
                        self.trigger('on:productSaveFailed', {err: err});
                        product.set('state', stateBefore);
                    }

                    cb && cb(err, product);
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
        }
    });

});