define(["hip/handler/CommandHandler", "hip/command/ApplyFilter", "hip/entity/DesignConfiguration"], function (Handler, ApplyFilter, DesignConfiguration) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof ApplyFilter;
        },
        handleCommand: function (command) {
            var filter = command.$.filter;
            // todo check if its a valid filter
            if (filter && command.$.configuration && command.$.configuration instanceof DesignConfiguration) {
                var filters = command.$.configuration.$.filters;
                var newFilters = [];
                for (var i = 0; i < filters.length; i++) {
                    var currentFilter = filters[i];
                    if (!(currentFilter instanceof filter.factory)) {
                        newFilters.push(currentFilter);
                    }
                }
                newFilters.push(filter);
                command.$.configuration.set('filters', newFilters);
                this.trigger('filtersChanged', command.$.configuration);
            }
        }
    })
});