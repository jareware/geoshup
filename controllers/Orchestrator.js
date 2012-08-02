define([
    'lib/underscore',
    'utils/logger'
], function(_, logger) {

    "use strict";

    var log = logger.create('controllers/Orchestrator');

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

        my.syncAtGlobalSeconds = function(globalSeconds, ready) {

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

        my.syncAtPrivateSeconds = function(privateSeconds, povTrack, ready) {

            log('syncAtPrivateSeconds(', privateSeconds, ',', povTrack, ')');

            var globalSeconds = timeline.privateToGlobal(privateSeconds, povTrack);

            my.syncAtGlobalSeconds(globalSeconds);

        };

        my.play = function(ignoreView) {

            log('play()');

            _.chain(views).without(ignoreView).each(function(view) {
                view.play();
            });

            log('play() -> delegated');

        };

        my.pause = function(ignoreView) {

            log('pause()');

            _.chain(views).without(ignoreView).each(function(view) {
                view.pause();
            });

            log('pause() -> delegated');

        };

    };

});