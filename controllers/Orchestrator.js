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
                sync: function(atPrivateSeconds, ready) {
                    my.syncAtPrivateSeconds(atPrivateSeconds, ready, view, view.model);
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

        /**
         * Delegates a sync() call to all managed views, translating the given global seconds to the private seconds
         * understood by each specific view.  This is done using its associated Track object.
         *
         * All views should leave themselves into a pause()d state after a sync().  Once all views have reported back as
         * being done with synchronization, the ready() callback is invoked.
         *
         * @param globalSeconds     Global second count to sync to
         * @param ready             Callback to invoke when ready
         * @param ignoreView        (optional) View that should NOT be called with a sync() command
         */
        my.syncAtGlobalSeconds = function(globalSeconds, ready, ignoreView) { // TODO: These could actually be hidden from the public interface of the Orchestrator

            log('syncAtGlobalSeconds(', globalSeconds, ')');

            var notifiedViewCount = ignoreView ? views.length - 1 : views.length;
            var everyoneReady = _.after(notifiedViewCount, function() {
                log('syncAtGlobalSeconds(', globalSeconds, ') -> everyone ready');
                ready();
            });

            _.chain(views).without(ignoreView).each(function(view) {
                var povTrack = view.model;
                var privateSeconds = timeline.globalToPrivate(globalSeconds, povTrack);
                view.sync(privateSeconds, everyoneReady);
            });

        };

        /**
         * Delegates a sync() call to all managed views, translating the given private seconds (relative to the given
         * point-of-view Track's timeline) to the private seconds of each specific view.
         *
         * @see syncAtGlobalSeconds()
         *
         * @param privateSeconds    Private second count relative to the povTrack to sync to
         * @param ready             Callback to invoke when ready
         * @param ignoreView        (optional) View that should NOT be called with a sync() command
         * @param povTrack          Track relative to which the second count is given
         */
        my.syncAtPrivateSeconds = function(privateSeconds, ready, ignoreView, povTrack) { // TODO: These could actually be hidden from the public interface of the Orchestrator

            log('syncAtPrivateSeconds(', privateSeconds, ',', povTrack, ')');

            var globalSeconds = timeline.privateToGlobal(privateSeconds, povTrack);

            my.syncAtGlobalSeconds(globalSeconds, ready, ignoreView);

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