define(["hip/store/Store"], function (Store) {


    return Store.inherit({
        defaults: {
            activeMenu: ""
        },
        ns: "navigation",

        showMenu: function (payload) {
            var oldMenu = this.$.activeMenu;
            var newMenu = payload.menu || "";
            if (oldMenu !== newMenu) {
                this.set('activeMenu', payload.menu);
                this.trigger('on:menuChanged', {old: oldMenu, menu: newMenu});
            }
        },

        isMenuActive: function (menu) {
            return this.$.activeMenu === menu;
        }.onChange("activeMenu")

    });

});