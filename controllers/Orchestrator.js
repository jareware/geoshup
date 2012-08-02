define([
    'lib/underscore',
    'utils/logger'
], function(_, logger) {

    "use strict";

    var log = logger.create('controllers/Orchestrator');

    function getViewLabel(view) {
        return view && view.label ? view.label : '';
    }

    return function(timeline) {

        var my = this;
        var views = [];

        /**
         * Starts managing the given view, meaning being able to delegate commands to it.  Ignores duplicate calls.
         *
         * Returns the updated number of managed views.
         *
         * @param view
         */
        my.addView = function(view) {

            if (_.indexOf(views, view) !== -1)
                return views.length;

            view.orchestrator = {
                sync: function(atPrivateSeconds) {
//                    my.syncAtPrivateSeconds(...) // TODO
                },
                play: function() {
                    my.play(view);
                },
                pause: function() {
                    my.pause(view);
                }
            };

            views.push(view);

            return views.length;

        };

        /**
         * Stops managing the given view.
         *
         * Returns the updated number of managed views.
         *
         * @param view
         */
        my.removeView = function(view) {

            if (_.indexOf(views, view) !== -1)
                view.orchestrator = undefined;

            views = _.reject(views, function(current) {
                return current === view;
            });

            return views.length;

        };

        my.syncAtGlobalSeconds = function(globalSeconds, ready) { // TODO: These could actually be hidden from the public interface of the Orchestrator

            log('syncAtGlobalSeconds(', globalSeconds, ')');

            var everyoneReady = _.after(views.length, function() {
                log('syncAtGlobalSeconds(', globalSeconds, ') -> everyone ready');
                ready();
            });

            _.each(views, function(view) {
                var privateSeconds = timeline.globalToPrivate(globalSeconds, view.model);
                view.sync(privateSeconds, everyoneReady);
            });

        };

        my.syncAtPrivateSeconds = function(privateSeconds, povTrack, ready) { // TODO: These could actually be hidden from the public interface of the Orchestrator

            log('syncAtPrivateSeconds(', privateSeconds, ',', povTrack, ')');

            var globalSeconds = timeline.privateToGlobal(privateSeconds, povTrack);

            my.syncAtGlobalSeconds(globalSeconds);

        };

        my.play = function(ignoreView) {

            log('play(', getViewLabel(ignoreView), ')');

            _.chain(views).without(ignoreView).each(function(view) {
                view.play();
            });

            log('play(', getViewLabel(ignoreView), ') -> delegated');

        };

        my.pause = function(ignoreView) {

            log('pause(', getViewLabel(ignoreView), ')');

            _.chain(views).without(ignoreView).each(function(view) {
                view.pause();
            });

            log('pause(', getViewLabel(ignoreView), ') -> delegated');

        };

    };

});