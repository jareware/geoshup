define([
    'lib/underscore'
], function(_) {

    "use strict";

    return function(timeline) {

        var my = this;
        var views = [];

        my.addView = function(view) {

            if (_.indexOf(views, view) === -1)
                views.push(view);

            return views.length;

        };

        my.removeView = function(view) {

            views = _.reject(views, function(current) {
                return current === view;
            });

            return views.length;

        };

        my.syncAtGlobalSeconds = function(globalSeconds) {

            _.each(views, function(view) {

                var privateSeconds = timeline.globalToPrivate(globalSeconds, view.model);

                view.sync(privateSeconds, function() {});

            });

        };

        my.syncAtPrivateSeconds = function(privateSeconds, povTrack) {

            var globalSeconds = timeline.privateToGlobal(privateSeconds, povTrack);

            my.syncAtGlobalSeconds(globalSeconds);

        };

        my.PLAY = function() { // TODO: TEMP
            _.each(views, function(view) {
                view.play();
            });
        };

        my.PAUSE = function() { // TODO: TEMP
            _.each(views, function(view) {
                view.pause();
            });
        };

    };

});