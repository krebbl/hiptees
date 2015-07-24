define(["hip/handler/CommandHandler", "hip/command/ApplyFilter", "hip/entity/ImageConfiguration", "hip/entity/Filter"], function (Handler, ApplyFilter, ImageConfiguration, Filter) {
    return Handler.inherit({
        defaults: {

        },
        isResponsibleForCommand: function (command) {
            return command instanceof ApplyFilter;
        },
        handleCommand: function (command) {
            if (command.$.configuration instanceof ImageConfiguration) {
                if (command instanceof ApplyFilter) {
                    var filterChange = command.$.filterChange;
                    if (!command.$.configuration.$.filter) {
                        command.$.configuration.set('filter', new Filter(filterChange));
                    } else {
                        command.$.configuration.$.filter.set(filterChange);
                    }
                    this.trigger('on:filterChanged', command.$.configuration);

                }
            }
        }
    })
});