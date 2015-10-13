define(["js/html/HtmlElement", "js/core/List"], function (HtmlElement, List) {

    var renderedSelectElements = [],
        valueChecker = null,
        valueCheckInterval = 200;

    return HtmlElement.inherit({
        defaults: {
            emptyOption: false,
            emptyOptionText: "",
            tagName: "select",
            items: null,
            name: null,
            enableAutoFillCheck: true,
            selectedItem: null,
            valuePath: "value",
            textPath: "name",
            textFnc: null
        },

        $classAttributes: ["emptyOption", "emptyOptionText", "valuePath", "textPath", "enableAutoFillCheck"],

        ctor: function () {
            this.$optionMap = {};
            this.$itemMap = {};

            this.callBase();
        },

        render: function () {
            var ret = this.callBase();

            if (this.$.enableAutoFillCheck) {
                renderedSelectElements.push(this);
            }
            if (!valueChecker && renderedSelectElements.length > 0) {
                valueChecker = setInterval(function () {
                    for (var i = 0; i < renderedSelectElements.length; i++) {
                        var selectElement = renderedSelectElements[i];
                        if (selectElement.isRendered() && selectElement.$lastValue != selectElement.$el.value) {
                            selectElement._checkOptions();
                            selectElement.$lastValue = selectElement.$el.value;
                        }
                    }
                }, valueCheckInterval);
            }

            return ret;
        },


        _renderItems: function (items) {
            while (this.$el.childNodes.length) {
                this.$el.removeChild(this.$el.childNodes[0]);
            }

            if (items) {
                if (items instanceof List) {
                    items = items.$items;
                }
                if (this.$.emptyOption) {
                    var option = this.$stage.$document.createElement("option");
                    var text = this.$stage.$document.createTextNode(this.$.emptyOptionText);
                    option.appendChild(text);

                    this.$el.appendChild(option);
                }

                this.$optionMap = {};
                this.$itemMap = {};
                var item;
                for (var i = 0; i < items.length; i++) {
                    item = items[i];
                    this._innerRenderItem(item);
                }
                this._renderSelectedItem(this.$.selectedItem);
            } else {

            }
        },
        _innerRenderItem: function (item) {
            var option = this.$stage.$document.createElement("option");
            option.value = this.get(item, this.$.valuePath);
            var textContent = this.get(item, this.$.textPath);
            if (this.$.textFnc) {
                if (this.$rootScope[this.$.textFnc] instanceof Function) {
                    textContent = this.$rootScope[this.$.textFnc].call(this.$rootScope, textContent);
                }
            }
            var text = this.$stage.$document.createTextNode(textContent);
            option.appendChild(text);
            this.$el.appendChild(option);
            this.$optionMap[option.value] = option;
            this.$itemMap[option.value] = item;
        },

        _bindDomEvents: function () {
            var self = this;
            this.bindDomEvent('change', function (e) {
                self._checkOptions();
            });
            this.callBase();
        },

        _renderSelectedItem: function (selectedItem) {
            if (selectedItem) {
                var option = this.$optionMap[this.get(selectedItem, this.$.valuePath)];
                if (option) {
                    option.selected = true;
                }
            } else if (this.$.emptyOption && this.$el.childNodes.length) {
                this.$el.childNodes[0].selected = true;
            }
        },
        _checkOptions: function () {
            var value = this.$el.value;
            if (!value) {
                for (var i = 0; i < this.$el.childNodes.length; i++) {
                    var opt = this.$el.childNodes[i];
                    if (opt.selected) {
                        value = opt.value;
                        break;
                    }
                }
            }

            var item = value ? this.$itemMap[value] : null;
            if (this.$.selectedItem !== item) {
                this.set('selectedItem', item);
            }
        }

    });

});