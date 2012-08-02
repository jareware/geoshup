define([
    'lib/underscore',
    'lib/backbone',
    'lib/swfobject',
    'utils/logger'
], function(_, Backbone, swfobject, logger) {

    "use strict";

    // @see https://developers.google.com/youtube/js_api_reference

    var VERBOSE = false;
    var YTP_PARAMS = {
        enablejsapi: 1,
        playerapiid: 'ytplayer',
        version: 3,
        autoplay: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        theme: 'light',
        controls: 0
    };

    var log = logger.create('views/YouTube');

    function getEmbedURL(videoID) {

        function toKeyValPairs(key) {
            return key + '=' + YTP_PARAMS[key];
        }

        function toQueryString(memo, i) {
            return memo + i + '&';
        }

        var queryString = _.chain(YTP_PARAMS).keys().map(toKeyValPairs).reduce(toQueryString, '').value();

        return 'http://www.youtube.com/v/' + videoID + '?' + queryString;

    }

    return Backbone.View.extend({

        STATE: {
            UNSTARTED: -1, // When the SWF is first loaded it will broadcast an unstarted (-1) event
            ENDED:      0,
            PLAYING:    1,
            PAUSED:     2,
            BUFFERING:  3,
            CUED:       5 // When the video is cued and ready to play it will broadcast a video cued event (5)
        },

        stateChangeListeners: [],

        width: 425,

        height: 356,

        initialize: function(options) {

            if (options.width)
                this.width = options.width;

            if (options.height)
                this.height = options.height;

        },

        getReadableState: function(stateCode) {

            var stateKey;

            _.each(this.STATE, function(value, key) {
                if (value === stateCode)
                    stateKey = key;
            });

            return stateKey;

        },

        sync: function(atPrivateSeconds, ready) {

            var that = this;

            if (this.playerStarted) {

                log('sync(', atPrivateSeconds, ')' + (VERBOSE ? ' -> exec' : ''));

                this.ytp.playVideo(); // TODO: We should in fact use that.onNextStateChange(that.STATE.CUED) but the CUED event is not firing for some reason, so we first tell to seek and then wait for the PLAYING state
                this.ytp.seekTo(atPrivateSeconds, true);

                if (VERBOSE) log('Playing and seeking YTP, waiting for next PLAY state...');

                this.onNextStateChange(this.STATE.PLAYING, function() {

                    if (VERBOSE) log('YTP in PLAY state -> pause until told to play() again');

                    that.ytp.pauseVideo();

                    _.defer(ready);

                });

            } else {

                if (VERBOSE) log('sync(', atPrivateSeconds, ') -> defer because YTP not ready');

                that.onNextStateChange(that.STATE.PLAYING, function() {
                    _.defer(function() { // note: the _.defer() is essential so that.playerStarted = true
                        that.sync(atPrivateSeconds, ready);
                    });
                });

            }

            return this;

        },

        render: function() {

            var that = this;

            this.playerStarted = false;

            window.onYouTubePlayerReady = function(playerID) { // TODO: Use playerID to allow many instances to coexist

                if (VERBOSE) log('onYouTubePlayerReady()');

                that.ytp = that.$('#myytplayer')[0];
                that.ytp.addEventListener('onStateChange', 'onYTPStateChange');
                that.ytp.addEventListener('onError', 'onYTPError');

                that.ytp.mute();

                that.onNextStateChange(that.STATE.PLAYING, function() {

                    that.playerStarted = true; // after autostart has actually started playing the video...
                    that.ytp.pauseVideo(); // ...pause it, and wait for further commands

                    if (VERBOSE) log('YTP is now ready and paused');

                });

            };

            window.onYTPStateChange = function(newState) {

                if (VERBOSE) log('onYTPStateChange(', newState, '==', that.getReadableState(newState), ')');

                function byMatchingListeners(listener) {
                    return listener[0] === newState;
                }

                function triggerListener(listener) {
                    listener[1]();
                }

                var matching  = _.filter(that.stateChangeListeners, byMatchingListeners);
                var remaining = _.reject(that.stateChangeListeners, byMatchingListeners);

                that.stateChangeListeners = remaining;

                _.each(matching, triggerListener);

            };

            window.onYTPError = function(newState) {

                log('onYTPError(', newState, ')');

            };

            var params = { allowScriptAccess: 'always' };
            var atts = { id: 'myytplayer' };
            var embedURL = getEmbedURL(this.model.get('videoID'));
            var width = this.width + '';
            var height = this.height + '';
            var version = '8';

            this.$el.html('<div id="foobarID" />');

            swfobject.embedSWF(embedURL, 'foobarID', width, height, version, null, null, params, atts);

            return this;

        },

        onNextStateChange: function(matchState, callback) {

            this.stateChangeListeners.push([ matchState, callback ]);

        },

        play: function() {

            log('play()');

            this.ytp.playVideo();

        },

        pause: function() {

            log('pause()');

            this.ytp.pauseVideo();

        }

    });

});