define(["js/ui/View"], function (View) {
    return View.inherit({
        defaults: {
            handles: null,
            name: null,
            container: null,
            loading: true,
            status: "next",
            moduleClass: "",
            componentClass: "swipe-view swipe-view-{name} {statusClass()} {loadingClass()}"
        },
        $classAttributes: ["name", "container", "status"],

        statusClass: function () {
            var status = this.$.status;
            if (status == "current") {
                return "";
            } else if (status == "next") {
                return "next-module";
            } else if (status == "prev") {
                return "previous-module";
            }
        }.onChange("status"),

        loadingClass: function () {
            return this.$.loading ? "loading" : "";
        }.onChange("loading"),

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