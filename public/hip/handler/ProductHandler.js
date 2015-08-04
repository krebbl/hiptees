define([
    "hip/handler/CommandHandler",
    "hip/command/ProductCommand",
    "hip/command/RemoveConfiguration",
    "hip/command/SaveProduct",
    "hip/command/SelectConfiguration",
    "hip/command/CloneConfiguration",
    "hip/command/ChangeOrder",
    "hip/command/AddText",
    "hip/command/AddImageFile",
    "hip/command/ChangeProductType",
    "hip/entity/TextConfiguration",
    "hip/entity/DesignConfiguration",
    "hip/model/Design",
    "hip/util/CloudinaryImageUploader",
    "text/entity/TextRange",
    "text/operation/ApplyStyleToElementOperation",
    "text/entity/TextFlow",
    "flow",
    "underscore"
], function (Handler, ProductCommand, RemoveConfiguration, SaveProduct, SelectConfiguration, CloneConfiguration, ChangeOrder, AddText, AddImageFile, ChangeProductType, TextConfiguration, DesignConfiguration, Design, ImageUploader, TextRange, ApplyStyleToElementOperation, TextFlow, flow, _) {
    return Handler.inherit({
        defaults: {
            product: null,
            selectedConfiguration: null,
            savingProduct: false
        },

        inject: {
            imageUploader: ImageUploader
        },

        isResponsibleForCommand: function (command) {
            return command instanceof ProductCommand;
        },
        handleCommand: function (command) {
            var configuration = command.$.configuration,
                offset;
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
                // TODO trigger on:configurationSaving


                // TODO trigger on:configurationSaved

//            } else if (command instanceof AddText) {

            } else if (command instanceof SelectConfiguration) {
                this._selectConfiguration(command.$.configuration);
            } else if (command instanceof CloneConfiguration) {
                if (configuration) {

                    var clone = configuration.clone();
                    clone.set({
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

                (new ApplyStyleToElementOperation(TextRange.createTextRange(0, textFlow.textLength() - 1), textFlow, command.$.leafStyle || {}, command.$.paragraphStyle || {})).doOperation();


                configuration = new TextConfiguration({
                    textFlow: textFlow,
                    offset: offset
                });

                this.$.product.$.configurations.add(configuration);

                this.trigger('on:configurationAdded', {configuration: configuration});
                this._selectConfiguration(configuration);
            } else if (command instanceof AddImageFile) {
                var file = command.$.file;

                var self = this,
                    reader = new FileReader();

                offset = this._convertOffset(command.$.offset);

                var image = new Image();

                image.onload = function (evt) {
                    var design = new Design({
                        id: null,
                        file: file,
                        type: "image",
                        image: {
                            original: image.src,
                            url: self._resizeImage(image, 800, 800),
                            small: self._resizeImage(image, 100, 100)
                        },
                        size: {
                            width: image.width,
                            height: image.height
                        }
                    });

                    configuration = new DesignConfiguration({
                        size: {
                            width: self.get('product.productType.printArea.size.width'),
                            height: design.getAspectRatio() * self.get('product.productType.printArea.size.width')
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

            } else if (command instanceof ChangeProductType) {

                var currentProductType = this.get('product.productType');
                if (currentProductType) {
                    // TODO: convert configurations to new productType

                }
                this.$.product.set('productType', command.$.productType);
                this.trigger('on:productTypeChanged', {productType: command.$.productType});
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
                        newDesigns.push(newDesigns);
                    }
                }
            });

            // filter out duplicate designs
            newDesigns = _.uniq(newDesigns, false, function (a, b) {
                return a.$.file === b.$.file;
            });

            var self = this;

            flow()
                .seq(newDesigns, function (design, cb) {
                    flow()
                        .seq(function (cb) {
                            design.set('resourceProvider', self.$.imageUploader.$.name);
                            design.save({}, cb)
                        })
                        .seq(function (cb) {
                            var options = {
                                type: "image"
                            };

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