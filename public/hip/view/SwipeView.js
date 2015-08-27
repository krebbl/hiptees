define(["js/ui/View"], function (View) {
    return View.inherit({
        defaults: {
            handles: null,
            name: null,
            container: null,
            status: "next",
            moduleClass: "",
            componentClass: "swipe-view swipe-view-{name} {statusClass(status)}"
        },
        $classAttributes: ["name", "container", "status"],

        statusClass: function (status) {
            if (status == "current") {
                return "";
            } else if (status == "next") {
                return "next-module";
            } else if (status == "prev") {
                return "previous-module";
            }
        },

        handlesFragment: function (fragment) {
            if (this.$.handles) {
                var reg = new RegExp(this.$.handles);
                return reg.test(fragment);
            }
            return false;
        },

        prepare: function (fragment, callback) {
            callback && callback();
        },

        navigate: function (fragment) {
            this.$.container.goTo(fragment);
        },

        goBack: function () {
            this.$.container.goBack();
        }
    })
});