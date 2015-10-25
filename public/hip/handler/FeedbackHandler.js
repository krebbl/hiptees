define(["hip/handler/CommandHandler", "hip/command/FeedbackCommand", "hip/model/Feedback", "xaml!hip/data/HipDataSource"], function (Handler, FeedbackCommand, Feedback, HipDataSource) {
    return Handler.inherit({
        defaults: {},
        inject: {
            api: HipDataSource
        },
        isResponsibleForCommand: function (command) {
            return command instanceof FeedbackCommand;
        },
        handleCommand: function (command) {
            if (command.$.text) {
                var feedback = this.$.api.createEntity(Feedback);
                feedback.set('text', command.$.text);

                var self = this;
                feedback.save({}, function (err, feedback) {
                    self.trigger('on:feedbackSent', {feedback: feedback})
                });
            }
        }
    })
});